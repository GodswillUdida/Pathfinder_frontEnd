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
  Shield,
  HelpCircle,
  Settings,
  User,
  Palette,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminTopbarProps {
  breadcrumbs?: BreadcrumbItem[];
  notificationCount?: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

function AdminTopbar({
  breadcrumbs = [],
  notificationCount = 0,
}: AdminTopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery]     = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

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
      .slice(0, 2) || "A";

  if (!user || !["admin", "superadmin"].includes(user.role)) return null;

  const initials = getInitials(user.name ?? "");

  return (
    <header
      className="sticky top-0 z-50 w-full h-14 flex items-center
                 bg-[#0d1117] border-b border-white/[0.07]
                 supports-[backdrop-filter]:bg-[#0d1117]/95 backdrop-blur-md"
    >
      {/* ── Logo + Breadcrumb ───────────────────────── */}
      <div className="flex items-center h-full border-r border-white/[0.07] shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-full">
          <div className="w-[30px] h-[30px] rounded-[8px] bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/20">
            <Shield className="w-[15px] h-[15px] text-white" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white leading-tight tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              PathAdmin
            </p>
            <p className="text-[9px] text-white/30 tracking-widest">Console</p>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 px-4 border-r border-white/[0.07] h-full shrink-0"
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3 h-3 text-white/20" />}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="text-[12px] text-white/35 hover:text-white/70 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-[12px]",
                      isLast ? "text-white font-medium" : "text-white/35"
                    )}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      )}

      {/* ── Search ─────────────────────────────────── */}
      <div className="flex-1 max-w-lg px-4 hidden md:block">
        <div
          className={cn(
            "flex items-center gap-2 h-[34px] px-3 rounded-[9px]",
            "bg-white/[0.05] border border-white/[0.08] transition-all duration-200",
            isSearchFocused &&
              "bg-white/[0.08] border-amber-500/30 ring-2 ring-amber-500/10"
          )}
        >
          <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search students, courses, enrollments…"
            className="flex-1 bg-transparent outline-none text-[12px] text-white placeholder:text-white/25"
            aria-label="Search admin panel"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-white/30 hover:text-white/60 transition-colors text-xs"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Right actions ──────────────────────────── */}
      <div className="flex items-center gap-1 px-3 ml-auto h-full border-l border-white/[0.07]">
        {/* Help */}
        <button
          className="w-8 h-8 rounded-[8px] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-all"
          aria-label="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 rounded-[8px] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-all"
          aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute top-[5px] right-[5px] w-[7px] h-[7px] rounded-full bg-red-500 ring-[1.5px] ring-[#0d1117]" />
          )}
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative ml-1">
          <button
            onClick={() => setIsProfileOpen((p) => !p)}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 px-2 py-1 rounded-[9px] hover:bg-white/[0.07] transition-all"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-[7px] bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-[10px] font-semibold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[11.5px] font-medium text-white leading-tight">
                {user.name?.split(" ")[0] ?? "Admin"}
              </p>
              <span className="text-[9px] font-semibold text-amber-400 bg-amber-500/12 border border-amber-500/20 px-1.5 py-px rounded-full">
                {user.role === "superadmin" ? "Super Admin" : "Admin"}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 text-white/30 transition-transform duration-200",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-[220px] rounded-xl overflow-hidden z-50
                         bg-[#141923] border border-white/[0.1]
                         shadow-[0_8px_32px_rgba(0,0,0,0.5)]
                         animate-in fade-in slide-in-from-top-1 duration-150"
              role="menu"
              aria-label="Profile menu"
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-white/[0.06]">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-[13px] font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-medium text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-white/35 truncate">{user.email}</p>
                </div>
              </div>

              {/* Items */}
              <div className="py-1">
                {[
                  { icon: User,     label: "Account settings",         href: "/admin/settings" },
                  { icon: Bell,     label: "Notification preferences",  href: "/admin/notifications" },
                  { icon: Palette,  label: "Appearance",                href: "/admin/appearance" },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-white/[0.05] transition-colors group"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Icon className="w-3.5 h-3.5 text-white/35 group-hover:text-white/60 transition-colors" />
                    <span className="text-[12px] text-white/60">{label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-white/[0.06] mx-0" />

              <button
                onClick={handleLogout}
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-red-400 hover:bg-red-500/[0.08] transition-colors"
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

export default memo(AdminTopbar);