"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  LogOut,
  ChevronDown,
  Bell,
  GraduationCap,
  Zap,
  Flame,
  Trophy,
  User,
  Settings,
  BookOpen,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentTopbarProps {
  /** Current XP. Pass from user profile / progress store. */
  xp?:         number;
  /** XP needed for next level. */
  xpTarget?:   number;
  /** Current streak in days. */
  streak?:     number;
  /** Unread notification count. */
  notificationCount?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

function StudentTopbar({
  xp               = 0,
  xpTarget         = 2000,
  streak           = 0,
  notificationCount = 0,
}: StudentTopbarProps) {
  const { user, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();

  const [isProfileOpen,   setIsProfileOpen]   = useState(false);
  const [searchQuery,     setSearchQuery]      = useState("");
  const [isSearchFocused, setIsSearchFocused]  = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [isProfileOpen]);

  // Close dropdown on navigation
  useEffect(() => { setIsProfileOpen(false); }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, router]);

  const getInitials = (name: string): string =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  if (!user) {
    return (
      <header className="sticky top-0 z-50 w-full h-14 flex items-center justify-end px-6 bg-white border-b border-black/[0.06]">
        <Link
          href="/auth/login"
          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Sign in
        </Link>
      </header>
    );
  }

  const initials = getInitials(user.name ?? "");
  const xpPct    = Math.round(Math.min((xp / xpTarget) * 100, 100));

  return (
    <header
      className="sticky top-0 z-50 w-full h-14 flex items-center
                 bg-white dark:bg-[#0d1117] border-b border-black/[0.06] dark:border-white/[0.07]
                 supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-[#0d1117]/95
                 backdrop-blur-md"
    >
      {/* ── Logo ────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 h-full border-r border-black/[0.06] dark:border-white/[0.07] shrink-0">
        <div className="w-[30px] h-[30px] rounded-[8px] bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <GraduationCap className="w-[15px] h-[15px] text-white" />
        </div>
        <div>
          <p
            className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Pathfinder
          </p>
          <p className="text-[9px] text-gray-400 dark:text-white/30 tracking-widest">Learning</p>
        </div>
      </div>

      {/* ── Search ──────────────────────────────────── */}
      <div className="flex-1 max-w-lg px-4 hidden md:block">
        <div
          className={cn(
            "flex items-center gap-2 h-[34px] px-3 rounded-[9px] transition-all duration-200",
            "bg-gray-100 dark:bg-white/[0.05] border border-transparent",
            isSearchFocused &&
              "bg-white dark:bg-white/[0.08] border-indigo-400 dark:border-indigo-500/40 ring-2 ring-indigo-500/10"
          )}
        >
          <Search className="w-3.5 h-3.5 text-gray-400 dark:text-white/30 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search courses, lessons, instructors…"
            className="flex-1 bg-transparent outline-none text-[12px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25"
            aria-label="Search courses"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition-colors text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Right ───────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 ml-auto h-full border-l border-black/[0.06] dark:border-white/[0.07]">

        {/* XP pill */}
        {/* <div
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     bg-indigo-50 dark:bg-indigo-500/[0.12] border border-indigo-200 dark:border-indigo-500/20
                     cursor-default"
          title={`${xp.toLocaleString()} / ${xpTarget.toLocaleString()} XP`}
          aria-label={`${xp} XP`}
        >
          <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
            {xp.toLocaleString()} XP
          </span>
          <div className="w-10 h-[3px] bg-indigo-200 dark:bg-indigo-500/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
              style={{ width: `${xpPct}%` }}
              role="progressbar"
              aria-valuenow={xpPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div> */}

        {/* Streak pill */}
        {/* {streak > 0 && (
          <div
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full
                       bg-orange-50 dark:bg-orange-500/[0.1] border border-orange-200 dark:border-orange-500/20"
            title={`${streak}-day streak`}
            aria-label={`${streak} day streak`}
          >
            <Flame className="w-3 h-3 text-orange-500" />
            <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">
              {streak}
            </span>
          </div>
        )} */}

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-[8px] flex items-center justify-center
                     text-gray-500 dark:text-white/40
                     hover:text-gray-900 dark:hover:text-white/80
                     hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full bg-red-500 ring-[1.5px] ring-white dark:ring-[#0d1117]" />
          )}
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen((p) => !p)}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-[9px]
                       hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all"
          >
            {/* Avatar with online dot */}
            <div className="relative">
              <div className="w-7 h-7 rounded-[7px] bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-semibold">
                {initials}
              </div>
              <span className="absolute -bottom-px -right-px w-2 h-2 rounded-full bg-green-500 ring-[1.5px] ring-white dark:ring-[#0d1117]" />
            </div>

            <span className="hidden sm:block text-[11.5px] font-medium text-gray-900 dark:text-white">
              {user.name?.split(" ")[0] ?? "Student"}
            </span>

            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-gray-400 dark:text-white/30 transition-transform duration-200",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-[240px] rounded-xl overflow-hidden z-50
                         bg-white dark:bg-[#141923]
                         border border-black/[0.07] dark:border-white/[0.1]
                         shadow-[0_8px_24px_rgba(0,0,0,.12)] dark:shadow-[0_8px_32px_rgba(0,0,0,.5)]
                         animate-in fade-in slide-in-from-top-1 duration-150"
              role="menu"
              aria-label="Profile menu"
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                <div className="w-9 h-9 rounded-[10px] bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[13px] font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10.5px] text-gray-400 dark:text-white/35 truncate">{user.email}</p>
                </div>
              </div>

              {/* XP progress inside dropdown */}
              {/* <div className="px-3.5 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03]">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-white/35 uppercase tracking-widest flex items-center gap-1 mb-1.5">
                  <Flame className="w-2.5 h-2.5 text-orange-500" />
                  This week
                </p>
                <div className="h-1 bg-gray-200 dark:bg-white/[0.08] rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                    style={{ width: `${xpPct}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400 dark:text-white/35">{xp.toLocaleString()} / {xpTarget.toLocaleString()} XP</span>
                  <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Level 8 → 9</span>
                </div>
              </div> */}

              {/* Nav items */}
              <div className="py-1">
                {[
                  { icon: User,     label: "My profile",   href: "/dashboard/profile" },
                  { icon: BookOpen, label: "My courses",   href: "/dashboard/courses" },
                  { icon: BarChart2,label: "Progress",     href: "/dashboard/progress" },
                  { icon: Trophy,   label: "Certificates", href: "/dashboard/certificates" },
                  { icon: Settings, label: "Settings",     href: "/dashboard/settings" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors group"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-white/35 group-hover:text-gray-600 dark:group-hover:text-white/60 transition-colors" />
                    <span className="text-[12px] text-gray-600 dark:text-white/60">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-black/[0.05] dark:bg-white/[0.06]" />

              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[12px]">Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default memo(StudentTopbar);