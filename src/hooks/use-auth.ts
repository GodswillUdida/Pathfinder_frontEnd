// src/hooks/use-auth.ts
"use client";

import { useAuthStore } from "@/store/authStore";

export const useAuth = () => {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const tempGuestEmail = useAuthStore((s) => s.tempGuestEmail);
  const error = useAuthStore((s) => s.error);

  const login = useAuthStore((s) => s.login);
  const loginWithEmail = useAuthStore((s) => s.loginWithEmail);
  const loginWithTokens = useAuthStore((s) => s.loginWithTokens);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTempGuestEmail = useAuthStore((s) => s.setTempGuestEmail);

  // Stable getter — reads directly from store state, never causes re-renders
  const getToken = () => useAuthStore.getState().token;

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    hydrated,
    tempGuestEmail,
    error,
    login,
    loginWithEmail,
    loginWithTokens,
    signInWithGoogle,
    logout,
    checkAuth,
    refreshToken,
    setTempGuestEmail,
    getToken,
  };
};