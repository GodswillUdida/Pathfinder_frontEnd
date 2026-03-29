// components/sidebar/UserSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Trophy,
  User,
  LogOut,
  GraduationCap,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "My Courses",
    path: "/dashboard/courses",
    icon: BookOpen,
  },
  {
    label: "Certificates",
    path: "/dashboard/certificates",
    icon: Trophy,
  },
  {
    label: "Profile",
    path: "/dashboard/profile",
    icon: User,
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const isActive = (item: (typeof NAV_ITEMS)[0]) => {
    if (item.exact) return pathname === item.path;
    return pathname.startsWith(item.path);
  };

  const initials = user.name;
  // .split(" ")
  // .map((n: string) => n[0])
  // .join("")
  // .toUpperCase()
  // .slice(0, 2);

  return (
    <aside className="hidden lg:flex w-64 min-h-screen flex-col bg-[#0f1117] border-r border-white/[0.06]">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-white tracking-tight">
          Pathfinder
        </span>
      </div>

      {/* User card */}
      <div className="mx-4 mt-5 mb-2 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-white/40 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active
                    ? "text-blue-400"
                    : "text-white/40 group-hover:text-white/70"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3 h-3 text-blue-400/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <div className="border-t border-white/[0.06] pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
