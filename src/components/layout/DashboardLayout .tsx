"use client";

import { ReactNode, useEffect } from "react";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import StudentSidebar from "../sidebar/UserSidebar";
import AdminSidebar from "../sidebar/AdminSidebar";
import Topbar from "./Topbar";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: string[]; // Optional – defaults to all logged-in users
}

export const DashboardLayout = ({
  children,
  allowedRoles = ["student", "admin", "superadmin"], // Default: allow all authenticated users
}: DashboardLayoutProps) => {
  const { user, isAuthenticated, hydrated, isLoading } = useAuth();
  const router = useRouter();

  // console.log("User: ", user);
  // console.log("isAuthenticated: ", isAuthenticated);
  // console.log("hydrated: ", hydrated);
  // console.log("isLoading: ", isLoading);

  // 1. Redirect if not authenticated after hydration
  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user)) {
      router.replace("/auth/login");
    }
  }, [hydrated, isAuthenticated, user, router]);

  // 2. Role-based guard (only runs after hydration)
  useEffect(() => {
    if (!hydrated || !user) return;

    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
      toast.error("You don't have permission to access this page.");
      router.replace("/dashboard"); // or "/auth/login"
    }
  }, [hydrated, user, allowedRoles, router]);

  // 3. Loading state – wait for real session validation
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Safety check – should never reach here if not authenticated
  if (!user || !isAuthenticated) {
    return null;
  }

  const isAdmin = user.role === "superadmin" || user.role === "admin";

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      {isAdmin ? <AdminSidebar /> : <StudentSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
