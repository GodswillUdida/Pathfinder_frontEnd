"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/store/userStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  // Role guard
  useEffect(() => {
    if (!user) return; // store hydrating
    if (!allowedRoles.includes(user.role)) router.push("/auth/login");
  }, [user, allowedRoles, router]);

  // Loading state while store hydrates
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user.role === "admin";

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
