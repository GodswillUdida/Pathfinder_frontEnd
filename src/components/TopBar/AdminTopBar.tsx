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
  User,
  Palette,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminTopbarProps {
  breadcrumbs?: BreadcrumbItem[];
  notificationCount?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

function AdminTopbar({
  breadcrumbs = [],
  notificationCount = 0,
}: AdminTopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Outside click
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [isProfileOpen]);

  // Close on route change
  useEffect(() => {
    setIsProfileOpen(false);
  }, [pathname]);

  // Escape closes profile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, router]);

  if (!user || !["admin", "superadmin"].includes(user.role)) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "A";

  const roleLabel =
    user.role === "superadmin" ? "Super Admin" : "Admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-14 w-full items-center",
        "border-b border-white/7 bg-[#0b1e3a]/95 backdrop-blur-md"
      )}
    >
      {/* Brand (mobile / compact) — optional if sidebar already shows brand */}
      <div className="flex h-full shrink-0 items-center border-r border-white/7 px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/20">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight text-white leading-none">
              PathAdmin
            </p>
            <p className="mt-0.5 text-[9px] tracking-wider text-white/30">
              Console
            </p>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="hidden h-full shrink-0 items-center gap-1.5 border-r border-white/7 px-4 sm:flex"
        >
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-white/20" />
                )}
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="text-[12px] text-white/40 transition-colors hover:text-white/70"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-[12px]",
                      isLast
                        ? "font-medium text-white"
                        : "text-white/40"
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

      {/* Search */}
      <div className="hidden flex-1 px-4 md:block md:max-w-md lg:max-w-lg">
        <div
          className={cn(
            "flex h-9 items-center gap-2 rounded-xl border px-3 transition-all duration-200",
            isSearchFocused
              ? "border-amber-500/30 bg-white/8 ring-2 ring-amber-500/10"
              : "border-white/8 bg-white/5"
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0 text-white/30" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search students, courses, enrollments…"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-white outline-none placeholder:text-white/25"
            aria-label="Search admin panel"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="flex h-5 w-5 items-center justify-center rounded text-white/30 transition-colors hover:text-white/60"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex h-full items-center gap-0.5 border-l border-white/7 px-3">
        {/* Help */}
        <button
          type="button"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            "text-white/40 transition-all hover:bg-white/7 hover:text-white/80"
          )}
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className={cn(
            "relative flex h-8 w-8 items-center justify-center rounded-lg",
            "text-white/40 transition-all hover:bg-white/7 hover:text-white/80"
          )}
          aria-label={
            notificationCount > 0
              ? `Notifications (${notificationCount} unread)`
              : "Notifications"
          }
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-[#0b1e3a]" />
          )}
        </button>

        {/* Profile */}
        <div ref={profileRef} className="relative ml-1">
          <button
            type="button"
            onClick={() => setIsProfileOpen((p) => !p)}
            aria-label="Open profile menu"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
            className={cn(
              "flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all",
              "hover:bg-white/7",
              isProfileOpen && "bg-white/7"
            )}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/20 text-[10px] font-semibold text-amber-400">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-[12px] font-medium leading-tight text-white">
                {user.name?.split(" ")[0] ?? "Admin"}
              </p>
              <span className="mt-0.5 inline-block rounded-full border border-amber-500/20 bg-amber-500/12 px-1.5 py-px text-[9px] font-semibold text-amber-400">
                {roleLabel}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-white/30 transition-transform duration-200",
                isProfileOpen && "rotate-180"
              )}
            />
          </button>

          {isProfileOpen && (
            <div
              role="menu"
              aria-label="Profile menu"
              className={cn(
                "absolute right-0 z-50 mt-2 w-[220px] overflow-hidden rounded-xl",
                "border border-white/10 bg-[#0b1e3a]",
                "shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
                "animate-in fade-in slide-in-from-top-1 duration-150"
              )}
            >
              {/* Header */}
              <div className="flex items-center gap-2.5 border-b border-white/6 px-3.5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/20 text-[13px] font-semibold text-amber-400">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12.5px] font-medium text-white">
                    {user.name}
                  </p>
                  <p className="truncate text-[10px] text-white/35">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Links */}
              <div className="py-1">
                {[
                  {
                    icon: User,
                    label: "Account settings",
                    href: "/admin/settings",
                  },
                  {
                    icon: Bell,
                    label: "Notifications",
                    href: "/admin/notifications",
                  },
                  {
                    icon: Palette,
                    label: "Appearance",
                    href: "/admin/appearance",
                  },
                ].map(({ icon: Icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setIsProfileOpen(false)}
                    className="group flex items-center gap-2.5 px-3.5 py-2 transition-colors hover:bg-white/5"
                  >
                    <Icon className="h-3.5 w-3.5 text-white/35 transition-colors group-hover:text-white/60" />
                    <span className="text-[12px] text-white/60 group-hover:text-white/80">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-white/6" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-red-400 transition-colors hover:bg-red-500/8"
              >
                <LogOut className="h-3.5 w-3.5" />
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