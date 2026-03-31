// src/lib/apiFetch.ts   (or wherever this lives)

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://path-be-real.onrender.com/api/v1";

const REQUEST_TIMEOUT_MS = 10_000;

export const SESSION_EXPIRED_EVENT = "auth:session-expired" as const;

function broadcastSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

// Endpoints that should NEVER trigger a token refresh (they are auth checks)
const NO_REFRESH_ENDPOINTS = ["/auth/me", "/auth/login", "/auth/refresh"];

function shouldSkipRefresh(path: string) {
  return NO_REFRESH_ENDPOINTS.some((p) => path.includes(p));
}

async function apiFetchInner<T>(
  path: string,
  options: RequestInit,
  isRetry = false
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    credentials: "include", // ← critical for your HttpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // ── 401 Refresh Logic (only for protected routes) ─────────────────────
  if (res.status === 401 && !isRetry && !shouldSkipRefresh(path)) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!refreshRes.ok) throw new Error("Refresh failed");

      // Retry original request with fresh session
      return apiFetchInner<T>(path, options, true);
    } catch {
      broadcastSessionExpired();
      throw Object.assign(new Error("Session expired"), { status: 401 });
    }
  }

  // ── Error handling (clean & consistent) ───────────────────────────────
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    let errorData: any = {};

    try {
      const body = await res.json();
      message = body?.message ?? message;
      errorData = body;
    } catch {}

    const error = new Error(message);
    (error as any).status = res.status;
    (error as any).data = errorData;

    // Special case: /auth/me 401 is expected → do NOT treat as crash
    if (res.status === 401 && shouldSkipRefresh(path)) {
      throw Object.assign(error, { isAuthError: true });
    }

    throw error;
  }

  // ── Success handling ─────────────────────────────────────────────────
  if (res.status === 204) {
    return undefined as T;
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return res.json();
}

/**
 * Main API fetcher – throws on any error (including 401)
 * Use this everywhere except for the initial auth check.
 */
export function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  return apiFetchInner<T>(path, options, false);
}

/**
 * 🔥 NEW HELPER: Safe way to check current user (recommended)
 * Returns user data or null on 401 → no page crash ever
 */
export async function getCurrentUser<T = any>(): Promise<T | null> {
  try {
    return await apiFetch<T>("/auth/me");
  } catch (err: any) {
    if (err?.status === 401 || err?.isAuthError) {
      return null; // ← this is the expected "not logged in" case
    }
    throw err; // re-throw real errors (network, 500, etc.)
  }
}
