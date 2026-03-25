// app/providers/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setAuth = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch("/api/v1/auth/me", {
          credentials: "include", // 🔥 required for cookies
        });

        if (!res.ok) return;

        const data = await res.json();

        setAuth({
          email: data.data.email,
          id: data.data.id,
          name: data.data.name,
          role: data.data.role,
          // avatar,
          emailVerified: data.data.emailVerified,
        });
      } catch {}
    };

    initAuth();
  }, []);

  return <>{children}</>;
}
