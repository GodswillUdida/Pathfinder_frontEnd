// utils/routeGuard.ts
"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRoleGuard = (allowedRoles: string[]) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) return; // store might still be hydrating
    if (!allowedRoles.includes(user.role)) router.push("/auth/login");
  }, [user, allowedRoles, router]);
};
