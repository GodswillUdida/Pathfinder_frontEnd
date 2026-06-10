"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Play,
  BarChart2,
  Trophy,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Zap,
  ChevronRight,
  Flame,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavItem {
  label:    string;
  path:     string;
  icon:     React.ElementType;
  exact?:   boolean;
  badge?:   number;
}

interface NavGroup {
  heading: string;
  items:   NavItem[];
}

// ─── Static course data (replace with real hook / API) ───────────────────────

const LAST_COURSE = {
  title:    "React Hooks Deep Dive",
  lesson:   "Lesson 6 — useCallback & useMemo",
  progress: 42,
};

// ─── Navigation ──────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    heading: "Menu",
    items: [
      { label: "Overview",         path: "/dashboard",              icon: LayoutDashboard, exact: true },
      { label: "My Courses",       path: "/dashboard/courses",      icon: BookOpen,        badge: 0 },
      // { label: "Continue Learning",path: "/dashboard/learn",        icon: Play },
    ],
  },
  {
    heading: "Progress",
    items: [
      { label: "My Progress",   path: "/dashboard/progress",     icon: BarChart2 },
      { label: "Certificates",  path: "/dashboard/certificates", icon: Trophy,     badge: 0 },
    ],
  },
  {
    heading: "Account",
    items: [
      { label: "Profile",  path: "/dashboard/profile",  icon: User },
      { label: "Settings", path: "/dashboard/settings", icon: Settings },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

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

  const userInitials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  // Mock XP / streak — replace with real data from user profile
  const xpCurrent  = 0;
  const xpTarget   = 2000;
  const xpPct      = Math.round((xpCurrent / xpTarget) * 100);
  const streak      = 0;
  const totalCourses = 0;
  const totalLessons = 0;

  return (
    <aside className="hidden lg:flex w-64 min-h-screen flex-col bg-white dark:bg-[#0d1117] border-r border-black/[0.06] dark:border-white/[0.06]">

      {/* ── Brand ─────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
        <div className="w-[34px] h-[34px] rounded-[9px] bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
            Pathfinder
          </p>
          <p className="text-[10px] text-gray-400 dark:text-white/35 mt-0.5">Learning Platform</p>
        </div>
      </div>

      {/* ── User card ─────────────────────────────── */}
      <div className="mx-3 mt-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-[10px] bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[13px] font-semibold shrink-0">
            {userInitials}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-gray-900 dark:text-white truncate leading-tight">
              {user.name}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-white/40 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        {/* XP Bar */}
        {/* <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-medium text-gray-500 dark:text-white/40 flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-500" />
              XP Progress
            </span>
            <span className="text-[10px] font-semibold text-gray-600 dark:text-white/50">
              {xpCurrent.toLocaleString()} / {xpTarget.toLocaleString()}
            </span>
          </div>
          <div className="h-1 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div> */}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
          {[
            { label: "Courses", value: totalCourses },
            { label: "Lessons", value: totalLessons },
            { label: "Streak",  value: streak, icon: <Flame className="w-2.5 h-2.5 text-orange-500 inline mr-0.5" /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-white/[0.04] rounded-lg py-1.5 text-center border border-black/[0.05] dark:border-white/[0.05]"
            >
              <span className="block text-sm font-600 text-gray-900 dark:text-white leading-none">
                {stat.icon}{stat.value}
              </span>
              <span className="block text-[9px] text-gray-400 dark:text-white/35 mt-0.5">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <nav
        className="flex-1 px-2.5 py-3 overflow-y-auto scrollbar-none space-y-4"
        aria-label="Student navigation"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-gray-400 dark:text-white/25 px-2.5 mb-1">
              {group.heading}
            </p>

            <div className="space-y-px">
              {group.items.map((item) => {
                const active = isActive(item);
                const Icon   = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-[9px] transition-all duration-150",
                      "border group",
                      active
                        ? "bg-indigo-50 dark:bg-indigo-500/[0.12] border-indigo-200 dark:border-indigo-500/20"
                        : "border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:border-black/[0.05] dark:hover:border-white/[0.05]"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 transition-colors",
                        active
                          ? "bg-indigo-100 dark:bg-indigo-500/20"
                          : "group-hover:bg-gray-100 dark:group-hover:bg-white/[0.05]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-[15px] h-[15px] transition-colors",
                          active
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-gray-400 dark:text-white/35 group-hover:text-gray-600 dark:group-hover:text-white/60"
                        )}
                      />
                    </div>

                    {/* Label */}
                    <span
                      className={cn(
                        "flex-1 text-[12.5px] transition-colors",
                        active
                          ? "text-indigo-700 dark:text-indigo-300 font-medium"
                          : "text-gray-500 dark:text-white/50 group-hover:text-gray-700 dark:group-hover:text-white/80"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Badge or chevron */}
                    {item.badge ? (
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-px rounded-full border",
                          active
                            ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/20 border-indigo-200 dark:border-indigo-500/20"
                            : "text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/[0.06] border-black/[0.06] dark:border-white/[0.08]"
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight
                        className={cn(
                          "w-3 h-3 transition-all",
                          active
                            ? "text-indigo-400 dark:text-indigo-500 opacity-100"
                            : "text-gray-300 dark:text-white/20 opacity-0 group-hover:opacity-100"
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

      {/* ── Continue Learning Card ─────────────────── */}
      {/* <div className="mx-2.5 mb-2.5 p-3 rounded-xl bg-indigo-600 dark:bg-indigo-600">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-indigo-200 flex items-center gap-1 mb-1.5">
          <Play className="w-2.5 h-2.5" aria-hidden="true" />
          Continue where you left off
        </p>
        <p className="text-[12px] font-medium text-white leading-snug mb-2">
          {LAST_COURSE.title}
          <span className="block text-[10px] text-indigo-200 font-normal mt-0.5">
            {LAST_COURSE.lesson}
          </span>
        </p>
        <div className="h-[3px] bg-white/15 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-white/80 rounded-full"
            style={{ width: `${LAST_COURSE.progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-indigo-200">{LAST_COURSE.progress}% complete</span>
          <button className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-white px-2.5 py-1 rounded-full hover:bg-indigo-50 transition-colors cursor-pointer">
            <Play className="w-2.5 h-2.5" aria-hidden="true" />
            Resume
          </button>
        </div>
      </div> */}

      {/* ── Footer / Logout ───────────────────────── */}
      <div className="px-2.5 pb-4 border-t border-black/[0.06] dark:border-white/[0.06] pt-2.5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-[9px] transition-all duration-150 text-gray-400 dark:text-white/35 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.08] hover:border-red-200 dark:hover:border-red-500/20 border border-transparent group cursor-pointer"
        >
          <div className="w-7 h-7 flex items-center justify-center ">
            <LogOut className="w-[14px] h-[14px] transition-colors" />
          </div>
          <span className="text-[12.5px] font-medium transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  );
}