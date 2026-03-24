/**
 * @file authStore.ts
 *
 * Single source of truth for authentication state.
 *
 * Token architecture:
 *   accessToken  → Zustand memory only. Never persisted to localStorage or
 *                  any cookie the client can write. Gone on hard refresh —
 *                  restored transparently via loadProfile() on mount.
 *   refreshToken → httpOnly cookie, written and rotated exclusively by the
 *                  server. The client never reads or stores it. This is the
 *                  only safe storage for long-lived credentials.
 *
 * Why NOT localStorage for tokens?
 *   Any third-party script (analytics, ads, npm package) running on the same
 *   origin can read localStorage. httpOnly cookies are invisible to JS entirely.
 *
 * Flow on hard refresh / new tab:
 *   1. Zustand persist rehydrates user + isAuthenticated from localStorage
 *      (non-sensitive display data only — no tokens)
 *   2. AuthHydration component calls loadProfile()
 *   3. loadProfile() → GET /auth/me (browser sends httpOnly cookie automatically)
 *   4. Server validates cookie, returns user → store is live
 *   5. If cookie is missing/expired → store is cleared, user goes to /login
 *
 * Flow on 401 (access token expired mid-session):
 *   apiFetch calls refreshToken() → POST /auth/refresh (sends httpOnly cookie).
 *   Server rotates cookie + returns new accessToken in body.
 *   apiFetch retries the original request once with the new token.
 */

import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import type { User } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://path-be-real.onrender.com/api/v1";

const REQUEST_TIMEOUT_MS = 12_000;
const REFRESH_TIMEOUT_MS = 10_000;

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  error: string | null;
  tempGuestEmail: string | null;
}

interface AuthActions {
  // Session
  loadProfile: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;

  // Auth flows
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<User>;
  sendPasswordResetEmail: (email: string) => void;
  signInWithGoogle: () => void;
  logout: () => Promise<void>;

  // Setters
  setAuth: (data: { user: User; accessToken: string }) => void;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setTempGuestEmail: (email: string | null) => void;
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

// ─── API response shapes ──────────────────────────────────────────────────────

interface LoginResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

interface MeResponse {
  success: boolean;
  user: User;
}

interface RefreshResponse {
  success: boolean;
  accessToken: string;
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,
  error: null,
  tempGuestEmail: null,
};

// ─── Fetch wrapper ────────────────────────────────────────────────────────────

/**
 * Thin wrapper around fetch that:
 *  - Attaches the in-memory accessToken as Bearer
 *  - Sends cookies (credentials: "include") for the httpOnly refresh token
 *  - Enforces a request timeout
 *  - Retries ONCE after transparent token refresh on 401
 *  - Throws a typed Error with the server's message on non-2xx
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const { accessToken, reset } = useAuthStore.getState();

  const res = await fetch(url, {
    ...options,
    credentials: "include", // ✅ always send httpOnly cookie
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  // Retry on 401 using refreshToken
  if (res.status === 401 && !isRetry) {
    try {
      await useAuthStore.getState().refreshToken();
      return apiFetch<T>(path, options, true);
    } catch {
      reset(); // clear frontend state
      throw new Error("Session expired. Please log in again.");
    }
  }

  // Non-2xx errors
  if (!res.ok) {
    const contentType = res.headers.get("content-type") ?? "";
    let message = res.statusText;

    if (contentType.includes("application/json")) {
      const body = await res.json().catch(() => ({}));
      message = (body as { message?: string }).message ?? message;
    } else {
      const body = await res.text().catch(() => "");
      message = body.slice(0, 200) || message;
    }

    throw new Error(message);
  }

  // Parse JSON response
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const body = await res.text();
    throw new Error(`Expected JSON but received: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        // ── Setters ───────────────────────────────────────────────────────────

        setAuth: ({ user, accessToken }) =>
          set({
            user,
            accessToken,
            isAuthenticated: true,
          }),

        setUser: (user) =>
          set({ user, isAuthenticated: !!user }, false, "setUser"),

        setAccessToken: (accessToken) =>
          set({ accessToken }, false, "setAccessToken"),

        setTempGuestEmail: (tempGuestEmail) =>
          set({ tempGuestEmail }, false, "setTempGuestEmail"),

        reset: () => set({ ...INITIAL_STATE, hydrated: true }, false, "reset"),

        // ── loadProfile ───────────────────────────────────────────────────────
        //
        // Primary session-restoration method. Called on every app mount and
        // after Google OAuth / magic-link redirects.
        //
        // Does NOT require an accessToken in memory — works from the httpOnly
        // cookie alone. This is what makes the Google OAuth callback work:
        // the server sets the cookie on redirect, then this call hydrates
        // the store from a clean slate.

        loadProfile: async () => {
          set({ isLoading: true, error: null }, false, "loadProfile/start");
          try {
            const { user } = await apiFetch<MeResponse>("/auth/me");
            set(
              {
                user,
                isAuthenticated: true,
                isLoading: false,
                hydrated: true,
                error: null,
              },
              false,
              "loadProfile/success"
            );
          } catch (err) {
            // Clear everything — cookie is missing or rejected
            set(
              { ...INITIAL_STATE, hydrated: true },
              false,
              "loadProfile/failure"
            );
            // Re-throw so callers like /auth/callback can redirect to /login
            throw err;
          }
        },

        // ── checkAuth ─────────────────────────────────────────────────────────
        //
        // Silent background validation of a persisted session.
        // Called by onRehydrateStorage when we find a user in localStorage.
        // Unlike loadProfile it does not set isLoading — no UI flash.

        checkAuth: async () => {
          if (!get().isAuthenticated) {
            set(
              { ...INITIAL_STATE, hydrated: true },
              false,
              "checkAuth/noSession"
            );
            return;
          }

          try {
            const { user } = await apiFetch<MeResponse>("/auth/me");
            set(
              { user, isAuthenticated: true, hydrated: true },
              false,
              "checkAuth/success"
            );
          } catch {
            set(
              { ...INITIAL_STATE, hydrated: true },
              false,
              "checkAuth/failure"
            );
          }
        },

        // ── refreshToken ──────────────────────────────────────────────────────
        //
        // POST /auth/refresh — server reads the httpOnly cookie, rotates it,
        // and returns a new accessToken in the body.
        //
        // Uses raw fetch (not apiFetch) to avoid triggering another 401 retry.

        refreshToken: async () => {
          try {
            const res = await fetch(`${API_BASE}/auth/refresh`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
            });

            if (!res.ok) throw new Error("Refresh failed");

            const { accessToken } = (await res.json()) as RefreshResponse;
            set({ accessToken }, false, "refreshToken/success");
          } catch {
            set(
              { ...INITIAL_STATE, hydrated: true },
              false,
              "refreshToken/failure"
            );
            throw new Error("Could not refresh session");
          }
        },

        // ── login ─────────────────────────────────────────────────────────────

        login: async (email, password) => {
          set({ isLoading: true, error: null }, false, "login/start");
          try {
            const { accessToken, user } = await apiFetch<LoginResponse>(
              "/auth/login",
              { method: "POST", body: JSON.stringify({ email, password }) }
            );
            set(
              {
                user,
                accessToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              },
              false,
              "login/success"
            );
            return user;
          } catch (err) {
            const error = err instanceof Error ? err.message : "Login failed";
            set({ error, isLoading: false }, false, "login/failure");
            throw err;
          }
        },

        // ── register ──────────────────────────────────────────────────────────

        register: async (name, email, password) => {
          set({ isLoading: true, error: null }, false, "register/start");
          try {
            await apiFetch("/auth/register", {
              method: "POST",
              body: JSON.stringify({ name, email, password }),
            });
            set({ isLoading: false }, false, "register/success");
          } catch (err) {
            const error =
              err instanceof Error ? err.message : "Registration failed";
            set({ error, isLoading: false }, false, "register/failure");
            throw err;
          }
        },

        // ── loginWithEmail (guest post-checkout) ──────────────────────────────

        loginWithEmail: async (email) => {
          set({ isLoading: true, error: null }, false, "loginWithEmail/start");
          try {
            const { accessToken, user } = await apiFetch<LoginResponse>(
              "/auth/guest-login",
              { method: "POST", body: JSON.stringify({ email }) }
            );
            set(
              {
                user,
                accessToken,
                isAuthenticated: true,
                tempGuestEmail: null,
                isLoading: false,
                error: null,
              },
              false,
              "loginWithEmail/success"
            );
            return user;
          } catch (err) {
            const error =
              err instanceof Error ? err.message : "Guest login failed";
            set({ error, isLoading: false }, false, "loginWithEmail/failure");
            throw err;
          }
        },

        sendPasswordResetEmail: async (email) => {
          set({ isLoading: true, error: null }, false, "loginWithEmail/start");
          try {
            const { accessToken, user } = await apiFetch<LoginResponse>(
              "/auth/forgot-password",
              { method: "POST", body: JSON.stringify({ email }) }
            );
            set(
              {
                user,
                accessToken,
                isAuthenticated: false,
                tempGuestEmail: null,
                isLoading: false,
                error: null,
              },
              false,
              "sendPasswordResetEmail/success"
            );
            return user;
          } catch (err) {
            const error =
              err instanceof Error ? err.message : "Password reset failed";
            set(
              { error, isLoading: false },
              false,
              "sendPasswordResetEmail/failure"
            );
            throw err;
          }
        },

        // ── signInWithGoogle ──────────────────────────────────────────────────
        //
        // Kicks off the server-side redirect flow.
        // Browser lands on /auth/callback after Google redirects back.
        // The callback page calls loadProfile() to hydrate the store.

        signInWithGoogle: () => {
          window.location.href = `${API_BASE}/auth/google`;
        },

        // ── logout ────────────────────────────────────────────────────────────

        logout: async () => {
          try {
            await apiFetch("/auth/logout", { method: "POST" });
          } catch {
            // Server-side revocation failure is non-fatal.
            // Always clear local state.
          } finally {
            set({ ...INITIAL_STATE, hydrated: true }, false, "logout");
          }
        },
      }),

      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        skipHydration: true,

        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          tempGuestEmail: state.tempGuestEmail,
        }),

        onRehydrateStorage: () => (state) => {
          if (!state) return;

          // IMPORTANT: Do NOT set hydrated=true here anymore
          if (state.isAuthenticated) {
            // Validation runs first — hydrated stays false until /auth/me + refresh finishes
            state.loadProfile().catch(() => {});
          } else {
            // First-time visitors or logged-out → no validation needed
            state.hydrated = true;
          }
        },
      }
    ),
    { name: "AuthStore" }
  )
);
