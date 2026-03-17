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
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL is not configured");

  const endpoint = url.startsWith("http") ? url : `${API_BASE}${url}`;

  const res = await fetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(10000), // 10s timeout
  });

  if (res.status === 401) {
    // Auto refresh on 401
    await useAuthStore.getState().refreshToken();
    // Retry once
    return request(url, options);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || res.statusText);
  }

  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : (res.text() as unknown as T);
}

/* -------------------- State -------------------- */
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  tempGuestEmail: string | null; // for seamless checkout → success flow
}

interface AuthActions {
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<User>; // ← GUEST FLOW
  signInWithGoogle: () => void; // ← Social
  logout: () => Promise<void>;
  checkAuth: () => Promise<any>;
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

        reset: () => set({ ...initial }),

        /* ---------- LOGIN ---------- */
        login: async (email, password) => {
          set({ isLoading: true, error: null });
          try {
            const res = await request("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email, password }),
            });
            const { user, token } = normalizeLoginResponse(res);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return user;
          } catch (e) {
            set({ error: parseError(e), isLoading: false });
            throw e;
          }
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
          window.location.href = `${API_BASE}/auth/google`; // your backend OAuth route
        },

        /* ---------- REFRESH TOKEN (durability) ---------- */
        refreshToken: async () => {
          const token = get().token;
          if (!token) return;
          try {
            const res = await request("/auth/refresh", { method: "POST" });
            const { token: newToken } = normalizeLoginResponse(res);
            set({ token: newToken });
          } catch {
            get().reset(); // logout on refresh fail
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

        logout: async () => {
          const token = get().token;
          try {
            if (token)
              await request("/auth/logout", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
              });
          } finally {
            set({ ...initial });
          }
        },

        checkAuth: async () => {
          const token = get().token;
          if (!token) return set({ ...initial });

          set({ isLoading: true });
          try {
            const user = await request<User>("/auth/me", {
              headers: { Authorization: `Bearer ${token}` },
            });
            set({ user, isAuthenticated: true, isLoading: false });
          } catch {
            set({ ...initial });
          }
        },
      }),

      {
        name: "auth-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          token: state.token,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          tempGuestEmail: state.tempGuestEmail,
        }),
        onRehydrateStorage: () => (state) => {
          // Next.js hydration safety
          if (state) state.checkAuth();
        },
      }
    )
  )
);
