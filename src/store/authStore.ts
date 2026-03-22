// src/store/authStore.ts
"use client";

import { create } from "zustand";
import { persist, createJSONStorage, devtools } from "zustand/middleware";
import type { User } from "@/types";
import { normalizeLoginResponse } from "@/lib/normalizeUser";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://path-be-real.onrender.com/api/v1";

const parseError = (e: unknown): string =>
  e instanceof Error
    ? e.message
    : typeof e === "string"
    ? e
    : "Something went wrong";

/* -------------------- Enhanced Request (auto-refresh + timeout) -------------------- */
async function request<T = unknown>(
  url: string,
  options: RequestInit = {},
  _isRetry = false
): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");

  const endpoint = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const token = useAuthStore.getState().token;

  const res = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    signal: options.signal ?? AbortSignal.timeout(12_000),
  });

  if (res.status === 401 && !_isRetry) {
    try {
      await useAuthStore.getState().refreshToken();
      return request<T>(url, options, true);
    } catch {
      useAuthStore.getState().reset();
      throw new Error("Session expired. Please log in again.");
    }
  }

  // if (!res.ok) {
  //   const body = await res.json().catch(() => ({}));
  //   throw new Error(body.message || res.statusText);
  // }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }

  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : (res.text() as unknown as T);
}

/* -------------------- State -------------------- */
interface AuthState {
  user: User | null;
  token: string | null;
  accessToken?: string | null;
  isLoading: boolean;
  // emailVerified: boolean;
  isAuthenticated: boolean;
  hydrated: boolean; // true once Zustand persist has rehydrated from localStorage
  error: string | null;
  tempGuestEmail: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<User>;
  loginWithTokens: (accessToken: string, refreshToken: string) => void;
  signInWithGoogle: () => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTempGuestEmail: (email: string | null) => void;
  reset: () => void;
}

type Store = AuthState & AuthActions;

const initial: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  // emailVerified: false,
  hydrated: false,
  error: null,
  tempGuestEmail: null,
};

export const useAuthStore = create<Store>()(
  devtools(
    persist(
      (set, get) => ({
        ...initial,

        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setToken: (token) => set({ token }),
        setTempGuestEmail: (email) => set({ tempGuestEmail: email }),

        reset: () => set({ ...initial, hydrated: true }),

        /* ---------- LOGIN ---------- */
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const res = await request("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email, password }),
            });
            const { user, token } = normalizeLoginResponse(res);
            // Also persist refresh token from the response
            const refreshToken = (res as any)?.tokens?.refreshToken ?? null;
            if (refreshToken) {
              localStorage.setItem("refresh_token", refreshToken);
            }
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return user;
          } catch (e) {
            set({ error: parseError(e), isLoading: false });
            throw e;
          }
        },

        // ── loginWithTokens (guest auto-login from success page) ──────────────
        // Called by the success page after exchanging the magic token for a
        // full session. Stores both tokens and then fetches the user profile.
        loginWithTokens: (accessToken: string, refreshToken: string) => {
          try {
            localStorage.setItem("refresh_token", refreshToken);
          } catch {
            // Private browsing — not fatal
          }
          set({ token: accessToken, isAuthenticated: true });
          // Fetch user profile so the dashboard renders with the correct name/role
          get().checkAuth();
        },

        /* ---------- GUEST LOGIN (after payment) ---------- */
        loginWithEmail: async (email: string) => {
          set({ isLoading: true, error: null });
          try {
            const res = await request("/auth/guest-login", {
              method: "POST",
              body: JSON.stringify({ email }),
            });
            const { user, token } = normalizeLoginResponse(res);
            const refreshToken = (res as any)?.tokens?.refreshToken ?? null;
            if (refreshToken) {
              localStorage.setItem("refresh_token", refreshToken);
            }
            set({
              user,
              token,
              isAuthenticated: true,
              tempGuestEmail: null,
              isLoading: false,
            });
            return user;
          } catch (e) {
            set({ error: parseError(e), isLoading: false });
            throw e;
          }
        },

        /* ---------- GOOGLE SOCIAL ---------- */
        signInWithGoogle: () => {
          window.location.href = `${API_BASE}/auth/google`;
        },

        /* ---------- REFRESH TOKEN (durability) ---------- */
        // refreshToken: async () => {
        //   const storedRefresh =
        //     typeof window !== "undefined"
        //       ? localStorage.getItem("refresh_token")
        //       : null;

        //   if (!storedRefresh) {
        //     get().reset();
        //     return;
        //   }

        //   try {
        //     const res = await fetch(`${API_BASE}/auth/refresh`, {
        //       method: "POST",
        //       headers: { "Content-Type": "application/json" },
        //       body: JSON.stringify({ refreshToken: storedRefresh }),
        //       signal: AbortSignal.timeout(10_000),
        //     });

        //     if (!res.ok) throw new Error("Refresh failed");

        //     const data = await res.json();
        //     const { token: newAccessToken } = normalizeLoginResponse(data);

        //     // Rotate the refresh token if the server issued a new one
        //     const newRefresh =
        //       data?.tokens?.refreshToken ?? data?.refreshToken ?? null;
        //     if (newRefresh) {
        //       localStorage.setItem("refresh_token", newRefresh);
        //     }

        //     set({ token: newAccessToken });
        //   } catch {
        //     localStorage.removeItem("refresh_token");
        //     get().reset();
        //   }
        // },

        refreshToken: async () => {
          const storedRefresh =
            typeof window !== "undefined"
              ? localStorage.getItem("refresh_token")
              : null;

          if (!storedRefresh) {
            get().reset();
            return;
          }

          try {
            // Use raw fetch — not request() — to avoid triggering another 401 retry loop
            const res = await fetch(`${API_BASE}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refreshToken: storedRefresh }),
              signal: AbortSignal.timeout(10_000),
              credentials: "include", // also send the cookie in case backend checks it
            });

            if (!res.ok) {
              localStorage.removeItem("refresh_token");
              get().reset();
              return;
            }

            const data = await res.json();

            // Controller now returns { success, tokens: { accessToken, refreshToken } }
            const newAccessToken = data?.tokens?.accessToken ?? null;
            const newRefreshToken = data?.tokens?.refreshToken ?? null;

            if (!newAccessToken) {
              localStorage.removeItem("refresh_token");
              get().reset();
              return;
            }

            if (newRefreshToken) {
              localStorage.setItem("refresh_token", newRefreshToken);
            }

            set({ token: newAccessToken });
          } catch {
            localStorage.removeItem("refresh_token");
            get().reset();
          }
        },

        /* ---------- REGISTER, LOGOUT, CHECK AUTH (unchanged but cleaner) ---------- */
        register: async (name, email, password) => {
          set({ isLoading: true, error: null });
          try {
            await request("/auth/register", {
              method: "POST",
              body: JSON.stringify({ name, email, password }),
            });
            set({ isLoading: false });
          } catch (e) {
            set({ error: parseError(e), isLoading: false });
            throw e;
          }
        },

        // logout: async () => {
        //   const token = get().token;
        //   try {
        //     if (token)
        //       await request("/auth/logout", {
        //         method: "POST",
        //         headers: { Authorization: `Bearer ${token}` },
        //       });
        //   } finally {
        //     set({ ...initial });
        //   }
        // },

        logout: async () => {
          try {
            await request("/auth/logout", { method: "POST" });
          } catch {
            // Proceed regardless — local state must always be cleared
          } finally {
            localStorage.removeItem("refresh_token");
            set({ ...initial, hydrated: true });
          }
        },

        checkAuth: async () => {
          const token = get().token;
          if (!token) {
            set({ ...initial, hydrated: true });
            return;
          }

          set({ isLoading: true });
          try {
            const res = await request<{
              success: boolean;
              user: {
                id: string;
                name: string;
                email: string;
                role: string;
                emailVerified: boolean;
              };
            }>("/auth/me");

            // /auth/me returns { success, user } — extract user directly
            const raw = res.user;

            if (!raw?.id) throw new Error("Invalid user response");

            const user: User = {
              id: raw.id,
              name: raw.name,
              email: raw.email,
              role: raw.role,
              emailVerified: Boolean(raw.emailVerified),
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              hydrated: true,
              error: null,
            });
          } catch {
            localStorage.removeItem("refresh_token");
            set({ ...initial, hydrated: true });
          }
        },

        // checkAuth: async () => {
        //   const token = get().token;
        //   if (!token) {
        //     set({ ...initial, hydrated: true });
        //     return;
        //   }

        //   set({ isLoading: true });
        //   try {
        //     const res = await request<unknown>("/auth/me");
        //     // Handle both { data: user } and flat user response shapes
        //     const raw = (res as any)?.data ?? res;
        //     const user: User = {
        //       id: raw.id,
        //       name: raw.name,
        //       email: raw.email,
        //       role: raw.role,
        //       emailVerified: Boolean(raw.emailVerified),
        //     };
        //     set({
        //       user,
        //       isAuthenticated: true,
        //       // emailVerified: true,
        //       isLoading: false,
        //       hydrated: true,
        //       error: null,
        //     });
        //   } catch {
        //     // Token invalid or expired and refresh failed
        //     localStorage.removeItem("refresh_token");
        //     set({ ...initial, hydrated: true });
        //   }
        // },
      }),

      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        // FIX: do NOT persist hydrated — it must always start as false on a
        // fresh page load so the layout knows rehydration hasn't happened yet.
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          tempGuestEmail: state.tempGuestEmail,
        }),
        onRehydrateStorage: () => (state) => {
          if (!state) return;
          // Mark hydrated immediately so the layout can render without a spinner.
          // Then silently validate the stored token in the background.
          state.hydrated = true;
          if (state.token) {
            state.checkAuth();
          }
        },
      }
    )
  )
);
