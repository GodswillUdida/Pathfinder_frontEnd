// src/hooks/use-auth.ts
"use client";

import { useAuthStore } from "@/store/authStore"; // ← fixed path

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const tempGuestEmail = useAuthStore((state) => state.tempGuestEmail);

  const loginWithEmail = useAuthStore((state) => state.loginWithEmail);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const logout = useAuthStore((state) => state.logout);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setTempGuestEmail = useAuthStore((state) => state.setTempGuestEmail);
  const getToken = () => token;

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    tempGuestEmail,
    loginWithEmail,
    signInWithGoogle,
    logout,
    checkAuth,
    refreshToken,
    setTempGuestEmail,
    getToken,
  };
};
