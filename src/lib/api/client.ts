// lib/api/client.ts
//
// Merges the best of both versions:
//   ✅  Commented version: request timeout, NO_REFRESH skip list, SSR guard,
//                          text-body fallback on error parse, isAuthError flag
//   ✅  Active version:    FormData/JSON auto-detection, XHR upload progress,
//                          refresh-queue (race-condition safe), typed ApiResponse
//
// 2026 standard: strict TypeScript, no `any`, all edge cases covered.

import { ApiError } from "./errors";
import type { ApiResponse } from "@/types";

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL         = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
const REFRESH_URL      = `${BASE_URL}/auth/refresh`;
const REQUEST_TIMEOUT  = 20_000; // ms

/**
 * Paths where a 401 should NOT trigger a token refresh.
 * Prevents infinite loops on auth endpoints.
 */
const NO_REFRESH_PATHS = [
  "/auth/login",
  "/auth/refresh",
  "/auth/logout",
  "/auth/me",
] as const;

const isServer = typeof window === "undefined";

// ─── Types ────────────────────────────────────────────────────────────────────

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface RequestConfig extends Omit<RequestInit, "body"> {
  /**
   * Request body.
   * - Plain objects → serialised as JSON (Content-Type set automatically)
   * - FormData      → sent as multipart (Content-Type NOT set — browser adds boundary)
   * - null          → no body
   */
  body?:             Record<string, unknown> | FormData | null;
  /** Per-request base URL override (e.g. for external APIs) */
  baseUrl?:          string;
  /** Upload progress callback 0–100. Only fires for FormData uploads. */
  onUploadProgress?: (pct: number) => void;
  /** AbortSignal override (default: 15 s timeout) */
  signal?:           AbortSignal;
}

// ─── Refresh queue (race-condition safe) ──────────────────────────────────────
//
// If multiple requests hit 401 simultaneously only ONE refresh call is made.
// All others queue up and resolve/reject together once the refresh settles.

let isRefreshing  = false;
let refreshQueue: Array<(ok: boolean) => void> = [];

function flushQueue(ok: boolean): void {
  for (const resolve of refreshQueue) resolve(ok);
  refreshQueue = [];
}

async function attemptTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    // Park this caller until the in-flight refresh settles
    return new Promise<boolean>((resolve) => refreshQueue.push(resolve));
  }

  isRefreshing = true;
  try {
    const res = await fetch(REFRESH_URL, {
      method:      "POST",
      credentials: "include",
      signal:      AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    const ok = res.ok;
    flushQueue(ok);
    return ok;
  } catch {
    flushQueue(false);
    return false;
  } finally {
    isRefreshing = false;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildUrl(path: string, baseUrl?: string): string {
  const base = (baseUrl ?? BASE_URL).replace(/\/$/, "");
  return path.startsWith("http") ? path : `${base}${path}`;
}

function shouldSkipRefresh(path: string): boolean {
  return NO_REFRESH_PATHS.some((p) => path.includes(p));
}

function getTimeoutSignal(override?: AbortSignal): AbortSignal {
  if (override) return override;
  return AbortSignal.timeout(REQUEST_TIMEOUT);
}

// ─── Response parser ──────────────────────────────────────────────────────────

async function parseResponse<T>(response: Response, path: string): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson      = contentType.includes("application/json");

  // 204 No Content
  if (response.status === 204) {
    return { success: true, data: undefined as T, message: "" };
  }

  if (!isJson) {
    // Non-JSON error (e.g. nginx 502 HTML page)
    if (!response.ok) {
      const text = await response.text().catch(() => `HTTP ${response.status}`);
      throw new ApiError(text || `HTTP ${response.status}`, response.status);
    }
    return { success: true, data: undefined as T, message: "" };
  }

  // Parse JSON — guard against malformed body
  let json: ApiResponse<T>;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError("Failed to parse server response", response.status);
  }

  if (!response.ok) {
    const err = new ApiError(
      json.message ?? `HTTP ${response.status}`,
      response.status,
      json,
    );
    if (response.status === 401 && shouldSkipRefresh(path)) {
      err.isAuthError = true;
    }
    throw err;
  }

  return json;
}

// ─── XHR path — used for FormData with upload progress ───────────────────────

function xhrRequest<T>(
  method:     string,
  url:        string,
  body:       FormData,
  onProgress: (pct: number) => void,
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open(method, url);
    // Do NOT set Content-Type — browser adds multipart boundary automatically

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      let parsed: ApiResponse<T>;
      try {
        parsed = JSON.parse(xhr.responseText) as ApiResponse<T>;
      } catch {
        reject(new ApiError("Failed to parse server response", xhr.status));
        return;
      }
      if (xhr.status >= 400) {
        reject(new ApiError(parsed.message ?? "Request failed", xhr.status, parsed));
      } else {
        resolve(parsed);
      }
    });

    xhr.addEventListener("error",   () => reject(new ApiError("Network error",    0)));
    xhr.addEventListener("abort",   () => reject(new ApiError("Upload aborted",   0)));
    xhr.addEventListener("timeout", () => reject(new ApiError("Upload timed out", 0)));

    xhr.timeout = REQUEST_TIMEOUT;
    xhr.send(body);
  });
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: HttpMethod,
  path:   string,
  config: RequestConfig = {},
): Promise<ApiResponse<T>> {
  const {
    body,
    baseUrl,
    onUploadProgress,
    signal: signalOverride,
    headers: extraHeaders,
    ...restInit
  } = config;

  const url        = buildUrl(path, baseUrl);
  const isFormData = body instanceof FormData;

  // ── XHR branch: FormData + upload progress ──────────────────────────────────
  // XHR doesn't automatically inherit cookies the same way fetch does on some
  // browsers, but `withCredentials = true` covers it. We skip the 401-refresh
  // loop for XHR because re-sending a partially-uploaded stream is not safe.
  if (isFormData && onUploadProgress) {
    return xhrRequest<T>(method, url, body, onUploadProgress);
  }

  // ── Fetch branch ────────────────────────────────────────────────────────────

  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(extraHeaders ?? {}),
  };

  const init: RequestInit = {
    ...restInit,
    method,
    credentials: "include",
    headers,
    signal: getTimeoutSignal(signalOverride),
    body:
      body == null
        ? undefined
        : isFormData
          ? body
          : JSON.stringify(body),
  };

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err: unknown) {
    // Network failure / timeout / CORS
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("Request timed out", 0);
    }
    throw new ApiError(
      err instanceof Error ? err.message : "Network error",
      0,
    );
  }

  // ── 401 → attempt refresh (once, not on auth endpoints) ─────────────────────
  if (response.status === 401 && !shouldSkipRefresh(path)) {
    const refreshed = await attemptTokenRefresh();

    if (refreshed) {
      // Retry the original request with a fresh signal
      let retried: Response;
      try {
        retried = await fetch(url, {
          ...init,
          signal: getTimeoutSignal(), // fresh timeout for the retry
        });
      } catch (err: unknown) {
        throw new ApiError(
          err instanceof Error ? err.message : "Retry failed",
          0,
        );
      }
      return parseResponse<T>(retried, path);
    }

    // Refresh failed — session is gone
    if (!isServer) {
      window.dispatchEvent(new CustomEvent("auth:session-expired"));
    }
    const err = new ApiError("Session expired. Please sign in again.", 401);
    err.isAuthError = true;
    throw err;
  }

  return parseResponse<T>(response, path);
}

// ─── Public client ────────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> =>
    request<T>("GET", path, config),

  post: <T>(
    path:   string,
    body?:  RequestConfig["body"],
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> =>
    request<T>("POST", path, { ...config, body }),

  patch: <T>(
    path:   string,
    body?:  RequestConfig["body"],
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> =>
    request<T>("PATCH", path, { ...config, body }),

  put: <T>(
    path:   string,
    body?:  RequestConfig["body"],
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> =>
    request<T>("PUT", path, { ...config, body }),

  delete: <T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> =>
    request<T>("DELETE", path, config),
};