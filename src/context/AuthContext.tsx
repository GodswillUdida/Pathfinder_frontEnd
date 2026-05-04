// src/context/AuthContext.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import {
  apiFetch,
  getCurrentUser,
  // setAccessToken,
  SESSION_EXPIRED_EVENT,
} from "@/lib/apiFetch";
import type { LoginResponse, User } from "@/types/index";

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
  signInWithGoogle: () => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  /** Call this after OAuth callback or any time you need to refresh session */
  loadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const hydrationAttempted = useRef(false);

  const loadProfileInternal = useCallback(async () => {
    dispatch({ type: "HYDRATE_START" });

    try {
      // const response = await apiFetch<LoginResponse & { user: User }>(
      //   "/auth/me"
      // );
      // dispatch({ type: "HYDRATE_SUCCESS", user: response.user });

      const user = await getCurrentUser<{ user: User }>();

      if (user?.user) {
        dispatch({ type: "HYDRATE_SUCCESS", user: user.user });
      } else {
        dispatch({ type: "HYDRATE_FAILURE" });
      }
    } catch (err: any) {
      if (err.status === 401 || err.message?.includes("Unauthorized")) {
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

  // Initial hydration (runs once)
  useEffect(() => {
    if (hydrationAttempted.current) return;
    hydrationAttempted.current = true;
    void loadProfileInternal();
  }, [loadProfileInternal]);

  // Listen for session expiry
  useEffect(() => {
    const handleExpired = () => dispatch({ type: "LOGOUT" });
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      dispatch({ type: "ACTION_START" });
      try {
        const { user, accessToken } = await apiFetch<LoginResponse>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          }
        );
        // setAccessToken(accessToken);
        dispatch({ type: "ACTION_SUCCESS", user });
        return user;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        dispatch({ type: "ACTION_FAILURE", error: message });
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        // Registration does not log the user in — email verification required.
        dispatch({ type: "ACTION_FAILURE", error: "" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Registration failed";
        dispatch({ type: "ACTION_FAILURE", error: message });
        throw err;
      }
    },
    []
  );

  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        const { user } = await apiFetch<LoginResponse>(
          "/auth/verify-email",
          {
            method: "POST",
            body: JSON.stringify({ email, code }),
          }
        );
        dispatch({ type: "ACTION_SUCCESS", user });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Verification failed";
        dispatch({ type: "ACTION_FAILURE", error: message });
        throw err;
      }
    },
    []
  );

  const resendVerificationEmail = useCallback(
    async (email: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiFetch("/auth/resend-verification-email", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        dispatch({ type: "ACTION_FAILURE", error: "" }); // clear loading
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to resend code";
        dispatch({ type: "ACTION_FAILURE", error: message });
        throw err;
      }
    },
    []
  );

  const sendPasswordResetEmail = useCallback(
    async (email: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiFetch("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
        dispatch({ type: "ACTION_FAILURE", error: "" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to send reset email";
        dispatch({ type: "ACTION_FAILURE", error: message });
        throw err;
      }
    },
    []
  );

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      dispatch({ type: "ACTION_START" });
      try {
        await apiFetch("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify({ token, password: newPassword }),
        });
        dispatch({ type: "ACTION_FAILURE", error: "" });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Password reset failed";
        dispatch({ type: "ACTION_FAILURE", error: message });
        throw err;
      }
    },
    []
  );

  const signInWithGoogle = useCallback((): void => {
    const API_BASE =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://path-be-real.onrender.com/api/v1";
    window.location.href = `${API_BASE}/auth/google`;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      // setAccessToken(null);
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const setUser = useCallback((user: User | null): void => {
    dispatch({ type: "SET_USER", user });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
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
      }}
    >
      {children}
    </AuthContext.Provider>
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
