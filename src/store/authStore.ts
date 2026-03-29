// store/authStore.ts
"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { User } from "@/types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://path-be-real.onrender.com/api/v1";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  error: string | null;
}

interface AuthActions {
  initAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  signInWithGoogle: () => void;
  loginWithEmail: (email: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// ─────────────────────────────────────────────────────────────────────────────
// Simple cookie-based apiFetch (no Authorization header needed)
// ─────────────────────────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    signal: options.signal,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// export async function apiFetch<T>(
//   path: string,
//   options: RequestInit = {},
//   isRetry = false
// ): Promise<T> {
//   const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
//   const { accessToken, reset } = useAuthStore.getState();

//   const res = await fetch(url, {
//     ...options,
//     credentials: "include", // ✅ always send httpOnly cookie
//     headers: {
//       "Content-Type": "application/json",
//       ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
//       ...options.headers,
//     },
//     signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
//   });

//   // Retry on 401 using refreshToken
//   if (res.status === 401 && !isRetry) {
//     try {
//       await useAuthStore.getState().refreshToken();
//       return apiFetch<T>(path, options, true);
//     } catch {
//       reset(); // clear frontend state
//       throw new Error("Session expired. Please log in again.");
//     }
//   }

//   // Non-2xx errors
//   if (!res.ok) {
//     const contentType = res.headers.get("content-type") ?? "";
//     let message = res.statusText;

//     if (contentType.includes("application/json")) {
//       const body = await res.json().catch(() => ({}));
//       message = (body as { message?: string }).message ?? message;
//     } else {
//       const body = await res.text().catch(() => "");
//       message = body.slice(0, 200) || message;
//     }

//     throw new Error(message);
//   }

//   // Parse JSON response
//   const contentType = res.headers.get("content-type") ?? "";
//   if (!contentType.includes("application/json")) {
//     const body = await res.text();
//     throw new Error(`Expected JSON but received: ${body.slice(0, 200)}`);
//   }

//   return res.json() as Promise<T>;
// }

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────
export const useAuthStore = create<AuthStore>()(
  devtools((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    hydrated: false,
    error: null,

    // ── Boot-time session validation (called by AuthInitializer)
    initAuth: async () => {
      if (get().hydrated) return; // prevent duplicate calls

      set({ isLoading: true, error: null });

      try {
        const { user } = await apiFetch<{ user: User }>("/auth/me");

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          hydrated: true,
        });
      } catch {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hydrated: true,
        });
      }
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      try {
        const { user } = await apiFetch<{ success: boolean; user: User }>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    register: async (name, email, password) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        set({ isLoading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    verifyEmail: async (email, code) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetch("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ email, code }),
        });
        set({ isLoading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Verification failed";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    resendVerificationEmail: async (email) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetch("/auth/resend-verification-email", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        set({ isLoading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to resend code";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    sendPasswordResetEmail: async (email) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetch("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        set({ isLoading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send reset email";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    resetPassword: async (token, newPassword) => {
      set({ isLoading: true, error: null });
      try {
        await apiFetch("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token, password: newPassword }),
        });
        set({ isLoading: false, error: null });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Password reset failed";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    signInWithGoogle: () => {
      window.location.href = `${API_BASE}/auth/google`;
    },

    loginWithEmail: async (email) => {
      set({ isLoading: true, error: null });
      try {
        const { user } = await apiFetch<{ success: boolean; user: User }>(
          "/auth/guest-login",
          { method: "POST", body: JSON.stringify({ email }) }
        );
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Guest login failed";
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    logout: async () => {
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } finally {
        set({
          user: null,
          isAuthenticated: false,
          hydrated: true,
          error: null,
        });
      }
    },

    setUser: (user) => set({ user, isAuthenticated: !!user }),

    reset: () =>
      set({
        user: null,
        isAuthenticated: false,
        hydrated: true,
        error: null,
      }),
  }))
);
