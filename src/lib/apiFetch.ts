// src/lib/apiFetch.ts
//
// A single, canonical fetch wrapper for all API calls.
//
// Design decisions:
//   - accessToken is kept in module-level memory (NOT in Zustand, NOT in
//     localStorage) so it survives re-renders without triggering them.
//   - The httpOnly refresh cookie is sent automatically via `credentials:
//     "include"` — the client never reads or stores it.
//   - On a 401 the wrapper calls /auth/refresh once, updates the in-memory
//     token, and retries the original request transparently.
//   - On a second 401 (refresh itself expired or revoked) it clears the
//     token and dispatches a custom event so the auth context can react.

import type { LoginResponse } from "@/types/index";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://path-be-real.onrender.com/api/v1";

const REQUEST_TIMEOUT_MS = 10_000;

// ─── In-memory token store ────────────────────────────────────────────────────
//
// Deliberately NOT exported — all reads go through getAccessToken() so we have
// one place to add logic (e.g. proactive refresh before expiry) in future.

let _accessToken: string | null = null;

export const getAccessToken = (): string | null => _accessToken;
export const setAccessToken = (token: string | null): void => {
  _accessToken = token;
};

// ─── Session-expired broadcast ────────────────────────────────────────────────

export const SESSION_EXPIRED_EVENT = "auth:session-expired" as const;

function broadcastSessionExpired(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function apiFetchInner<T>(
  path: string,
  options: RequestInit,
  isRetry: boolean
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = getAccessToken();

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // ── Token refresh flow ────────────────────────────────────────────────────
  if (res.status === 401 && !isRetry) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const { accessToken } = (await refreshRes.json()) as LoginResponse;
      setAccessToken(accessToken);

      // Retry original request once with the new token.
      return apiFetchInner<T>(path, options, true);
    } catch {
      setAccessToken(null);
      broadcastSessionExpired();
      throw new Error("Session expired. Please log in again.");
    }
  }

  // ── Error handling ────────────────────────────────────────────────────────
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = `${res.status} ${res.statusText}`;

    if (contentType.includes("application/json")) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      message = body.message ?? message;
    } else {
      const text = await res.text().catch(() => "");
      message = text.slice(0, 200) || message;
    }

    throw new Error(message);
  }

  // ── Response parsing ──────────────────────────────────────────────────────
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    // Some endpoints (logout, resend) return 204 or plain text — treat as void.
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return apiFetchInner<T>(path, options, false);
}
