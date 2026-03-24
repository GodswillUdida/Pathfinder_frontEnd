"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

import StudentSidebar from "../sidebar/UserSidebar";
import AdminSidebar from "../sidebar/AdminSidebar";
import Topbar from "./Topbar";

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles: string[];
}

export const DashboardLayout = ({
  children,
  allowedRoles,
}: DashboardLayoutProps) => {
  const { user, isAuthenticated, hydrated } = useAuthStore();
  const router = useRouter();

  // ── Redirect if session validation failed after hydration ──
  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user)) {
      router.push("/auth/login");
    }
  }, [hydrated, isAuthenticated, user, router]);

  // ── Role guard (runs only after validation is complete) ──
  useEffect(() => {
    if (!hydrated || !user) return; // still loading or invalid
    if (!allowedRoles.includes(user.role)) {
      router.push("/auth/login");
    }
  }, [hydrated, user, allowedRoles, router]);

  // ── Loading state: NEVER show dashboard until /auth/me finishes ──
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-gray-500">
            Restoring your session...
          </p>
        </div>
      </div>
    );
  }

  // At this point we KNOW hydrated === true AND isAuthenticated === true
  const isAdmin = user?.role === "superadmin";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {isAdmin ? <AdminSidebar /> : <StudentSidebar />}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
