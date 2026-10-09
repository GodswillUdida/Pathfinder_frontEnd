// src/context/AuthContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import type { LoginResponse, User } from "@/types/index";
import { getCurrentUser } from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";

export const SESSION_EXPIRED_EVENT = "auth:session-expired" as const;

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  /** True only until the first /auth/me check resolves (prevents flash). */
  isLoading: boolean;
  /** False until the first session validation attempt completes. */
  hydrated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hydrated: false,
  error: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
//
// A reducer keeps every state transition explicit and testable. Scattered
// `set({ ... })` calls in a Zustand store make it easy to leave fields stale.

type AuthAction =
  | { type: "HYDRATE_START" }
  | { type: "HYDRATE_SUCCESS"; user: User }
  | { type: "HYDRATE_FAILURE" }
  | { type: "ACTION_START" }
  | { type: "ACTION_SUCCESS"; user: User }
  | { type: "ACTION_FAILURE"; error: string }
  | { type: "ACTION_SUCCESS_VOID" }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; user: User | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "HYDRATE_START":
      return { ...state, isLoading: true, error: null };
    case "HYDRATE_SUCCESS":
      return {
        ...state,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
        hydrated: true,
        error: null,
      };
    case "HYDRATE_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hydrated: true,
        error: null, // Not an error — just no active session.
      };
    case "ACTION_START":
      return { ...state, isLoading: true, error: null };
    case "ACTION_SUCCESS":
      return {
        ...state,
        user: action.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "ACTION_FAILURE":
      return { ...state, isLoading: false, error: action.error };
    case "ACTION_SUCCESS_VOID":
      return {
        ...state,
        isLoading: false,
        error: null, // Explicitly wipe stale errors out of global state
      };
    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
        hydrated: true,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.user,
        isAuthenticated: !!action.user,
      };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  /** Call this after OAuth callback or any time you need to refresh session */
  loadProfile: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hydrationAttempted = useRef(false);

  const loadProfileInternal = useCallback(async () => {
    dispatch({ type: "HYDRATE_START" });

    try {
      const response = await getCurrentUser();

      if (response?.success && response.user) {
        dispatch({ type: "HYDRATE_SUCCESS", user: response.user });
      } else {
        dispatch({ type: "HYDRATE_FAILURE" });
      }
    } catch (err: unknown) {
      const error =
        typeof err === "object" && err !== null
          ? (err as { status?: unknown; message?: unknown })
          : null;
      if (
        error?.status === 401 ||
        (typeof error?.message === "string" &&
          error.message.includes("Unauthorized"))
      ) {
        dispatch({ type: "HYDRATE_FAILURE" });
        return;
      }
      console.error("Auth hydration error:", err);
      dispatch({ type: "HYDRATE_FAILURE" });
    }
  }, []);

  const loadProfile = useCallback(async () => {
    await loadProfileInternal();
  }, [loadProfileInternal]);

  // Run hydration only once safely on mount
  useEffect(() => {
    if (hydrationAttempted.current) return;
    hydrationAttempted.current = true;
    void loadProfileInternal();
  }, [loadProfileInternal]);

  // Global event interceptor for cross-module session expiry
  useEffect(() => {
    const handleExpired = () => dispatch({ type: "LOGOUT" });
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  // Helper type guard to safely extract custom API fetch client errors
  const getErrorMessage = (err: unknown, fallback: string): string => {
    if (typeof err === "object" && err !== null) {
      const errorObj = err as {
        data?: { message?: unknown };
        message?: unknown;
      };
      if (typeof errorObj.data?.message === "string")
        return errorObj.data.message;
      if (typeof errorObj.message === "string") return errorObj.message;
    }
    return fallback;
  };

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      dispatch({ type: "ACTION_START" });
      try {
        const response = await apiClient.post<LoginResponse>("/auth/login", {
          email,
          password,
        });

        const responseData = response as LoginResponse;

        const payload = responseData;
        if (!payload?.user) {
          throw new Error("Login succeeded but no user returned");
        }

        dispatch({ type: "ACTION_SUCCESS", user: payload.user });
        return payload.user;
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Login failed");
        dispatch({ type: "ACTION_FAILURE", error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiClient.post("/auth/register", {
          name,
          email,
          password,
        });
        dispatch({ type: "ACTION_SUCCESS_VOID" });
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Registration failed");
        dispatch({ type: "ACTION_FAILURE", error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        const response = await apiClient.post<LoginResponse>(
          "/auth/verify-email",
          { email, code },
        );

        const payload = response as LoginResponse;
        if (!payload?.user) {
          throw new Error("Verification succeeded but no user returned");
        }
        dispatch({ type: "ACTION_SUCCESS", user: payload.user });
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Email verification failed");
        dispatch({ type: "ACTION_FAILURE", error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const resendVerificationEmail = useCallback(
    async (email: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiClient.post("/auth/resend-verification-email", {
          email,
        });
        dispatch({ type: "ACTION_SUCCESS_VOID" });
        // dispatch({ type: "ACTION_FAILURE", error: "" }); // clear loading
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Resend verification email failed",
        );
        dispatch({ type: "ACTION_FAILURE", error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const sendPasswordResetEmail = useCallback(
    async (email: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiClient.post("/auth/forgot-password", {
          email,
        });
        dispatch({ type: "ACTION_FAILURE", error: "" });
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(
          err,
          "Send password reset email failed",
        );
        dispatch({ type: "ACTION_FAILURE", error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiClient.post("/auth/reset-password", {
          token,
          password: newPassword,
        });
        dispatch({ type: "ACTION_FAILURE", error: "" });
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, "Reset password failed");
        dispatch({ type: "ACTION_FAILURE", error: errorMessage });
        throw new Error(errorMessage);
      }
    },
    [],
  );

  const signInWithGoogle = useCallback(async () => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://path-be-real.onrender.com/api/v1";
    window.location.href = `${API_BASE}/auth/google`;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post("/auth/logout");
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      await apiClient.post("/auth/refresh");
      await loadProfile(); // Reload user after refresh
    } catch {
      console.warn("Session refresh failed, logging out");
      // refresh failed → session expired already broadcasted
    }
  }, [loadProfile]);

  const setUser = useCallback((user: User | null): void => {
    dispatch({ type: "SET_USER", user });
  }, []);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      hydrated: state.hydrated,
      error: state.error,
      login,
      register,
      verifyEmail,
      resendVerificationEmail,
      sendPasswordResetEmail,
      resetPassword,
      signInWithGoogle,
      logout,
      setUser,
      loadProfile,
      refreshSession,
    }),
    [
      state.user,
      state.isAuthenticated,
      state.isLoading,
      state.hydrated,
      state.error,
      login,
      register,
      verifyEmail,
      resendVerificationEmail,
      sendPasswordResetEmail,
      resetPassword,
      signInWithGoogle,
      logout,
      setUser,
      loadProfile,
      refreshSession,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
