"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/types";
import { normalizeLoginResponse } from "@/lib/normalizeUser";

const API_BASE = "https://path-be-real.onrender.com/api/v1";
// process.env.NEXT_PUBLIC_API_URL ??

/* -------------------- helpers -------------------- */

const parseError = (e: unknown): string =>
  e instanceof Error
    ? e.message
    : typeof e === "string"
    ? e
    : "Something went wrong";

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
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : null;

    const message =
      body?.message ||
      (await res.text().catch(() => null)) ||
      res.statusText ||
      "Request failed";

    throw new Error(message);
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType) return null as unknown as T;

  if (contentType.includes("application/json")) return (await res.json()) as T;

  return (await res.text()) as unknown as T;
}

/* -------------------- state types -------------------- */

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  reset: () => void;
}

type Store = AuthState & AuthActions;

/* -------------------- initial state -------------------- */

const initial: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

/* -------------------- store -------------------- */

export const useAuthStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      /* ---------- setters ---------- */
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setToken: (token) => set({ token }),

      reset: () => set({ ...initial }),

      /* ---------- LOGIN ---------- */
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const res = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });

          const { user, token } = normalizeLoginResponse(res);

          if (!user || !user.id) {
            throw new Error("Invalid Login Rsponse");
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
          set({
            error: parseError(e),
            isLoading: false,
            isAuthenticated: false,
          });
          throw e;
        }
      },

      /* ---------- REGISTER ---------- */
      register: async (name, email, password) => {
        set({ isLoading: true, error: null });

        try {
          await request("/auth/register", {
            method: "POST",
            body: JSON.stringify({ name, email, password }),
          });

          set({ isLoading: false, error: null });
        } catch (e) {
          set({
            isLoading: false,
            error: parseError(e),
          });
          throw e;
        }
      },

      /* ---------- LOGOUT ---------- */
      logout: async () => {
        const token = get().token;

        try {
          if (token) {
            await request("/auth/logout", {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        } catch {
          // ignore backend logout errors
        } finally {
          set({ ...initial });
        }
      },

      /* ---------- CHECK AUTH ---------- */
      checkAuth: async () => {
        const token = get().token;

        if (!token) {
          set({ ...initial });
          return;
        }

        set({ isLoading: true });

        try {
          const user = await request<User>("/auth/me", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
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
      }),
    }
  )
);
