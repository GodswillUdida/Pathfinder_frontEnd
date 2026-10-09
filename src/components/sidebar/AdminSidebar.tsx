"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  FolderOpen,
  GraduationCap,
  ShoppingCart,
  Shield,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  path: string;
  badge?: number;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Navigation ───────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        name: "Programs",
        path: "/admin/programs",
        icon: FolderOpen,
      },
      {
        name: "Courses",
        path: "/admin/courses",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "People",
    items: [
      {
        name: "Students",
        path: "/admin/students",
        icon: Users,
      },
      {
        name: "Enrollments",
        path: "/admin/enrollments",
        icon: GraduationCap,
      },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const stored = localStorage.getItem("admin-sidebar-collapsed");
    if (stored === "true") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  // Close mobile on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Escape closes mobile
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when mobile open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleCollapse = useCallback(() => setIsCollapsed((p) => !p), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((p) => !p), []);

  if (!user || !["admin", "superadmin"].includes(user.role)) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const userInitials =
    user.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "A";

  const roleLabel =
    user.role === "superadmin"
      ? "Super Admin"
      : user.role === "admin"
        ? "Admin"
        : "Instructor";

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  return (
    <TooltipProvider delayDuration={150}>
      {/* ── Mobile top bar ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center gap-3 border-b border-white/6 bg-[#0b1e3a] px-4 lg:hidden">
        <button
          type="button"
          onClick={toggleMobile}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/8 text-white transition-colors hover:bg-white/12 active:bg-white/16"
        >
          {isMobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-amber-600">
            <Shield className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white leading-none">
              PathAdmin
            </p>
            <p className="mt-0.5 text-[10px] text-white/40">Management</p>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen flex-col",
          "bg-[#0b1e3a] border-r border-white/6",
          "transition-all duration-300 ease-in-out",
          sidebarWidth,
          // On mobile: sit below the top bar when open, full height when closed off-screen
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Brand – hidden on mobile (top bar already shows it) */}
        <div
          className={cn(
            "hidden h-16 shrink-0 items-center border-b border-white/6 lg:flex",
            isCollapsed ? "justify-center px-2" : "gap-3 px-4"
          )}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-400 to-amber-600 shadow-md shadow-amber-500/20">
            <Shield className="h-4 w-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-[14px] font-semibold tracking-tight text-white leading-none">
                PathAdmin
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                Management Console
              </p>
            </div>
          )}
        </div>

        {/* Spacer for mobile top bar */}
        <div className="h-14 shrink-0 lg:hidden" />

        {/* User */}
        <div
          className={cn(
            "mx-3 mt-3 flex shrink-0 items-center rounded-xl border border-white/6 bg-white/4",
            isCollapsed ? "justify-center p-2" : "gap-2.5 p-2.5"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/25 bg-amber-500/15 text-[11px] font-semibold text-amber-400">
            {userInitials}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-medium text-white leading-tight">
                {user.name ?? "Administrator"}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10px] text-amber-400/90">
                <Shield className="h-2.5 w-2.5" />
                {roleLabel}
              </p>
            </div>
          )}
        </div>

        {/* Scrollable nav */}
        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollArea className="h-full px-2.5 py-4">
            <nav aria-label="Admin navigation">
              {isLoading ? (
                <div className="space-y-2 px-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-9 rounded-lg bg-white/6" />
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  {NAV_GROUPS.map((group) => (
                    <div key={group.label}>
                      {!isCollapsed && (
                        <p className="mb-1.5 px-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/25">
                          {group.label}
                        </p>
                      )}

                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const active = isActive(item.path);
                          const Icon = item.icon;

                          const link = (
                            <Link
                              href={item.path}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "group flex items-center gap-2.5 rounded-xl px-2 py-2 transition-all duration-200",
                                active
                                  ? "bg-amber-500/12 text-white"
                                  : "text-white/45 hover:bg-white/5 hover:text-white/85",
                                isCollapsed && "justify-center px-0"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                                  active
                                    ? "bg-amber-500/15 text-amber-400"
                                    : "text-white/35 group-hover:text-white/60"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>

                              {!isCollapsed && (
                                <>
                                  <span
                                    className={cn(
                                      "flex-1 text-[13px]",
                                      active ? "font-semibold" : "font-medium"
                                    )}
                                  >
                                    {item.name}
                                  </span>

                                  {typeof item.badge === "number" &&
                                  item.badge > 0 ? (
                                    <span className="rounded-full border border-amber-500/20 bg-amber-500/12 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                                      {item.badge}
                                    </span>
                                  ) : active ? (
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
                                  ) : null}
                                </>
                              )}
                            </Link>
                          );

                          if (!isCollapsed) {
                            return <div key={item.path}>{link}</div>;
                          }

                          return (
                            <Tooltip key={item.path}>
                              <TooltipTrigger asChild>{link}</TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className="border-white/10 bg-[#1a2030] text-xs text-white"
                              >
                                {item.name}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </nav>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-white/6 p-2.5">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-2 py-1.5",
              isCollapsed && "justify-center"
            )}
          >
            {!isCollapsed && (
              <div className="flex flex-1 items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11px] text-white/30">
                  Systems normal
                </span>
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Sign out"
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    "text-white/30 transition-all duration-200",
                    "hover:bg-red-500/10 hover:text-red-400",
                    "disabled:opacity-50"
                  )}
                >
                  {isLoggingOut ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-transparent" />
                  ) : (
                    <LogOut className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="border-white/10 bg-[#1a2030] text-xs text-white"
              >
                Sign out
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Collapse handle – desktop only */}
        <button
          type="button"
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "absolute top-5 -right-1 mr-1.5 hidden h-6 w-6 items-center justify-center",
            "rounded-full border border-white/10 bg-[#152238] text-white/50 shadow-md",
            "transition-colors hover:bg-[#1c2d48] hover:text-white/80 lg:flex cursor-pointer"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>

      {/* Desktop spacer */}
      <div
        className={cn(
          "hidden shrink-0 transition-all duration-300 lg:block",
          sidebarWidth
        )}
        aria-hidden="true"
      />

      {/* Mobile content spacer so page content isn't hidden under the top bar */}
      <div className="h-14 shrink-0 lg:hidden" aria-hidden="true" />
    </TooltipProvider>
  );
}