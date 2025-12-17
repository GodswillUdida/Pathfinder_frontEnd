"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/types/admin";
import { useAuthStore } from "@/store/userStore";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Settings,
  Users,
  FileText,
  FileArchive
} from "lucide-react";

// Icon mapping for nav items
const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  users: Users,
  enrollments: FileArchive,
  settings: Settings,
  default: FileText,
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { logout } = useAuthStore();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user || user.role !== "admin") return null;

  const handleLogout = async () => {
    try {
      logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const getIcon = (itemName: string) => {
    const key = itemName.toLowerCase().split(" ")[0];
    const Icon = iconMap[key] || iconMap.default;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-linear-to-b from-gray-900 to-gray-950 text-gray-100 shadow-2xl z-40 transition-all duration-300 ease-in-out overflow-y-auto",
          // Desktop behavior
          "lg:sticky",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile behavior
          isMobileOpen
            ? "translate-x-0 w-64"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            {!isCollapsed && (
              <h2 className="text-xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h2>
            )}

            {/* Desktop Collapse Button */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                      : "hover:bg-gray-800 hover:translate-x-1",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span
                    className={cn(
                      "transition-colors",
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    )}
                  >
                    {getIcon(item.name)}
                  </span>

                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}

                  {isActive && !isCollapsed && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-200 hover:shadow-lg hover:shadow-red-600/50",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
