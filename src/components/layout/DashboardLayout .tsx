"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";   // or your existing loader

import StudentSidebar from "../sidebar/UserSidebar";
import AdminSidebar from "../sidebar/AdminSidebar";
import Topbar from "./Topbar";
import { toast } from "sonner";
// import { AdminSidebar } from "../sidebar/AdminSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: string[]; 
}

export const DashboardLayout = ({
  children,
  allowedRoles = ["student", "admin", "superadmin"],
}: DashboardLayoutProps) => {
  const { user, isAuthenticated, hydrated, isLoading } = useAuth();
  const router = useRouter();

  // Single source of truth for redirect logic
  useEffect(() => {
    if (!hydrated) return; // Wait for initial auth check

    if (!isAuthenticated || !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Role guard
    const hasAccess = allowedRoles.includes(user.role);
    if (!hasAccess) {
      toast.error("You don't have permission to access this page.");
      router.replace("/dashboard");
    }
  }, [hydrated, isAuthenticated, user, allowedRoles, router]);

  // Show loading spinner while we don't know the auth state yet
  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Verifying your session...</p>
        </div>
      </div>
    );
  }

  // Safety: if still not authenticated after hydration, show nothing (redirect is already in flight)
  if (!isAuthenticated || !user) {
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