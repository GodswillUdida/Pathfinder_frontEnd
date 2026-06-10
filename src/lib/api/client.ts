import { ApiError } from "./errors";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const REQUEST_TIMEOUT = 15000;

// 🔥 IMPORTANT: module-scoped shared promise (prevents race conditions)
let refreshPromise: Promise<void> | null = null;

// Endpoints that should NOT trigger refresh
const NO_REFRESH = ["/auth/login", "/auth/refresh", "/auth/me"];

const isServer = typeof window === "undefined";

function shouldSkipRefresh(path: string) {
  return NO_REFRESH.some((p) => path.includes(p));
}

function getUrl(path: string) {
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

function withTimeout(signal?: AbortSignal) {
  return signal ?? AbortSignal.timeout(REQUEST_TIMEOUT);
}

// 🔥 Central refresh logic (race-condition safe)
async function refreshToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const res = await fetch(getUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });

      if (!res.ok) {
        throw new ApiError("Session expired", 401);
      }
    })()
      .catch((err) => {
        // 🔥 Broadcast only on client
        if (!isServer) {
          window.dispatchEvent(new Event("auth:session-expired"));
        }
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// 🔥 Core request function
async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = false
): Promise<T> {
  const url = getUrl(path);

  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: withTimeout(options.signal!),
  });

  // ─── 401 HANDLING ───────────────────────────────────────────────
  if (
    res.status === 401 &&
    !retry &&
    !shouldSkipRefresh(path)
  ) {
    try {
      await refreshToken();
      return request<T>(path, options, true); // retry once
    } catch {
      throw new ApiError("Session expired", 401);
    }
  }

  // ─── ERROR HANDLING ─────────────────────────────────────────────
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`;
    let data: unknown;

    try {
      const json = await res.json();
      message = (json as any)?.message ?? message;
      data = json;
    } catch {
      try {
        const text = await res.text();
        data = text;
      } catch {}
    }

    const error = new ApiError(message, res.status, data);

    // Special handling for auth check
    if (res.status === 401 && shouldSkipRefresh(path)) {
      error.isAuthError = true;
    }

    throw error;
  }

  // ─── SUCCESS HANDLING ───────────────────────────────────────────
  if (res.status === 204) return undefined as T;

  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// 🔥 Public API (clean interface)
export const apiClient = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T, B = unknown>(path: string, body?: B, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T, B = unknown>(path: string, body?: B, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T, B = unknown>(path: string, body?: B, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: "DELETE" }),
};