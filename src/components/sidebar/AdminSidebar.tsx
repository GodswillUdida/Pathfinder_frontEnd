"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/types/admin";
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
  BarChart3,
  Settings,
  FileArchive,
  Database,
  FileText,
  Shield,
  Award,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks/useCourses";

// ─── Types ──────────────────────────────────────────────────────────────────

interface NavItem {
  name: string;
  path: string;
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Icon Map ────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  overview: BarChart3,
  analytics: BarChart3,
  users: Users,
  students: Users,
  enrollments: FileArchive,
  courses: BookOpen,
  programs: Database,
  certificates: Award,
  settings: Settings,
  admin: Shield,
  default: FileText,
};

// ─── Nav Groups ──────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", path: "/admin/dashboard" },
      { name: "Analytics", path: "/admin/analytics" },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Courses", path: "/admin/courses", badge: 0 },
      { name: "Programs", path: "/admin/programs" },
      { name: "Certificates", path: "/admin/certificates" },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Students", path: "/admin/students", badge: 0 },
      { name: "Enrollments", path: "/admin/enrollments", badge: 0 },
    ],
  },
  // {
  //   label: "System",
  //   items: [
  //     { name: "Settings", path: "/admin/settings" },
  //   ],
  // },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const { data } = useCourses();

  const courseLength = data?.length


  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile nav on route change
  useEffect(() => { setIsMobileOpen(false); }, [pathname]);

  // Escape key closes mobile nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!user || !["admin", "superadmin"].includes(user.role)) return null;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/auth/login");
    } catch (err: unknown) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleCollapse = useCallback(() => setIsCollapsed((p) => !p), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((p) => !p), []);

  const getIcon = (name: string): React.ElementType => {
    const key = name.toLowerCase().split(" ")[0];
    return iconMap[key] ?? iconMap.default;
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const userInitials = user.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "A";

  const sidebarContent = (
    <aside
      className={cn(
        // Base
        "flex flex-col h-screen bg-[#0d1117] border-r border-white/[0.06]",
        "transition-all duration-300 ease-in-out",
        // Desktop sizing
        "fixed top-0 left-0 z-40",
        isCollapsed ? "w-[64px]" : "w-64",
        // Mobile
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      {/* ── Header ────────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-white/[0.06]",
          isCollapsed ? "p-[15px] justify-center" : "px-4 py-[18px]"
        )}
      >
        <div className="w-[34px] h-[34px] rounded-[9px] bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
          <Shield className="w-4 h-4 text-white" />
        </div>

        {!isCollapsed && (
          <div>
            <p className="text-sm font-bold text-white tracking-tight leading-tight">
              PathAdmin
            </p>
            <p className="text-[10px] text-white/35 mt-0.5">Management Console</p>
          </div>
        )}
      </div>

      {/* ── User Card ─────────────────────────────── */}
      <div
        className={cn(
          "flex items-center gap-2.5 m-3 rounded-[10px] border border-white/[0.06]",
          "bg-white/[0.04] transition-all duration-300",
          isCollapsed ? "p-[7px] justify-center" : "p-2.5"
        )}
      >
        <div className="w-[30px] h-[30px] rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-[11px] font-semibold shrink-0">
          {userInitials}
        </div>

        {!isCollapsed && (
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-white truncate leading-tight">
              {user.name ?? "Administrator"}
            </p>
            <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
              <Shield className="w-2.5 h-2.5" />
              {user?.role === "superadmin"
                ? "Super Admin"
                : user?.role === "admin"
                  ? "Admin"
                  : "Instructor"}
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────── */}
      <ScrollArea className="flex-1">
        <nav className="px-2.5 py-2" aria-label="Admin navigation">
          {isLoading ? (
            <div className="space-y-2 px-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-9 rounded-lg bg-white/[0.06]" />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  {/* Group label */}
                  {!isCollapsed && (
                    <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-white/20 px-2 mb-1">
                      {group.label}
                    </p>
                  )}

                  <div className="space-y-px">
                    {group.items.map((item) => {
                      const active = isActive(item.path);
                      const Icon = getIcon(item.name);

                      return (
                        <TooltipProvider key={item.path} delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link
                                href={item.path}
                                className={cn(
                                  "flex items-center gap-2.5 px-2 py-2 rounded-lg transition-all duration-150",
                                  "border text-sm",
                                  active
                                    ? "bg-amber-500/10 border-amber-500/20 text-white"
                                    : "border-transparent text-white/45 hover:bg-white/[0.05] hover:border-white/[0.06] hover:text-white/80",
                                  isCollapsed && "justify-center"
                                )}
                              >
                                {/* Icon */}
                                <div
                                  className={cn(
                                    "w-[30px] h-[30px] rounded-[7px] flex items-center justify-center shrink-0 transition-colors",
                                    active && "bg-amber-500/12"
                                  )}
                                >
                                  <Icon
                                    className={cn(
                                      "w-[15px] h-[15px] transition-colors",
                                      active ? "text-amber-400" : "text-white/35"
                                    )}
                                  />
                                </div>

                                {/* Text + badge */}
                                {!isCollapsed && (
                                  <>
                                    <span className={cn("flex-1 text-[12.5px]", active && "font-medium")}>
                                      {item.name}
                                    </span>
                                    {item.badge && (
                                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-500/12 border border-amber-500/20 px-1.5 py-px rounded-full">
                                        {item.badge}
                                      </span>
                                    )}
                                    {active && !item.badge && (
                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60 shrink-0" />
                                    )}
                                  </>
                                )}
                              </Link>
                            </TooltipTrigger>

                            {isCollapsed && (
                              <TooltipContent side="right" className="bg-[#1a2030] text-white border-white/10 text-xs">
                                {item.name}
                                {item.badge ? ` (${item.badge})` : ""}
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* ── Footer ────────────────────────────────── */}
      <div className="border-t border-white/[0.06] p-2.5">
        <div className={cn("flex items-center gap-2 px-2 py-2 rounded-lg", isCollapsed && "justify-center")}>
          {/* Status indicator */}
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 flex-1">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-[11px] text-white/30">All systems normal</span>
            </div>
          )}

          {/* Logout */}
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Sign out"
                  className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 shrink-0"
                >
                  {isLoggingOut ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-3.5 h-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1a2030] text-white border-white/10 text-xs">
                Sign out
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* ── Collapse handle ───────────────────────── */}
      <button
        onClick={toggleCollapse}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-1 mr-2 top-[22px] w-5 h-5 rounded-full bg-[#1a2030] border border-white/10 flex items-center justify-center shadow-md hover:bg-[#232d40] transition-colors hidden lg:flex"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3 text-white/60" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-white/60" />
        )}
      </button>
    </aside>
  );

  return (
    <>
      {/* Mobile trigger */}
      <Button
        onClick={toggleMobile}
        size="icon"
        variant="secondary"
        className="lg:hidden fixed top-4 left-4 z-50 h-9 w-9 rounded-full shadow-lg bg-amber-500 hover:bg-amber-600 text-white border-0"
        aria-label="Toggle navigation"
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={toggleMobile}
          aria-hidden="true"
        />
      )}

      {sidebarContent}

      {/* Desktop spacer */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300",
          isCollapsed ? "w-[64px]" : "w-64"
        )}
        aria-hidden="true"
      />
    </>
  );
}