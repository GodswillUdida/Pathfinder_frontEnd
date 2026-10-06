"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  BarChart2,
  Trophy,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Search,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: number;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Learn",
    items: [
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
        label: "Browse Courses",
        path: "/courses",
        icon: Search,
      },
    ],
  },
  {
    heading: "Progress",
    items: [
      {
        label: "My Progress",
        path: "/dashboard/progress",
        icon: BarChart2,
      },
      {
        label: "Certificates",
        path: "/dashboard/certificates",
        icon: Trophy,
      },
    ],
  },
  {
    heading: "Account",
    items: [
      {
        label: "Profile",
        path: "/dashboard/profile",
        icon: User,
      },
      {
        label: "Settings",
        path: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function StudentSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const isActive = (item: NavItem): boolean =>
    item.exact ? pathname === item.path : pathname.startsWith(item.path);

  const userInitials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <aside className="hidden lg:flex w-[260px] min-h-screen flex-col bg-white border-r border-slate-200/80">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-slate-200/80 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-sm shadow-indigo-600/20">
          <GraduationCap className="h-4.5 w-4.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-slate-900 tracking-tight leading-none">
            Pathfinder
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Student Portal</p>
        </div>
      </div>

      {/* User */}
      <div className="mx-3 mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-[13px] font-semibold text-indigo-700">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-slate-900 leading-tight">
              {user.name}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-5 space-y-6 scrollbar-none"
        aria-label="Student navigation"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {group.heading}
            </p>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-all duration-200",
                      active
                        ? "bg-indigo-50 text-indigo-700 shadow-sm"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        active
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-transparent text-slate-400 group-hover:text-slate-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <span
                      className={cn(
                        "flex-1 text-[13px] transition-colors",
                        active ? "font-semibold" : "font-medium"
                      )}
                    >
                      {item.label}
                    </span>

                    {typeof item.badge === "number" && item.badge > 0 ? (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                          active
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-500"
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={cn(
                          "h-3.5 w-3.5 transition-all",
                          active
                            ? "text-indigo-400 opacity-100"
                            : "text-slate-300 opacity-0 group-hover:opacity-100"
                        )}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-200/80 px-3 py-3">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-[13px] font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}