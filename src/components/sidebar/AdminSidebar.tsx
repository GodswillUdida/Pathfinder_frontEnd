"use client";

import { useState, useEffect, useCallback } from "react";
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
  FileArchive,
  Bell,
  HelpCircle,
  User,
  BookOpen,
  ChartBar,
  Shield,
  Search,
  Home,
  Database,
  Mail,
  Calendar,
  DollarSign,
  BarChart3,
  Package,
  FolderTree,
  MessageSquare,
  Award,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

// Icon mapping for nav items
const iconMap: Record<string, any> = {
  dashboard: LayoutDashboard,
  overview: ChartBar,
  users: Users,
  enrollments: FileArchive,
  courses: BookOpen,
  programs: Database,
  settings: Settings,
  analytics: BarChart3,
  messages: Mail,
  notifications: Bell,
  help: HelpCircle,
  home: Home,
  admin: Shield,
  finance: DollarSign,
  calendar: Calendar,
  products: Package,
  categories: FolderTree,
  reviews: MessageSquare,
  achievements: Award,
  activities: Zap,
  default: FileText,
};

// Notification badge counts for each section
const notificationCounts = {
  enrollments: 3,
  messages: 5,
  reviews: 2,
  activities: 7,
};

interface AdminSidebarProps {
  className?: string;
}

export default function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const { logout, isLoading } = useAuthStore();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Auto-collapse on mobile when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Handle escape key for mobile
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMobileOpen]);

  // Update active section based on pathname
  useEffect(() => {
    const activeItem = ADMIN_NAV.find(item => 
      pathname === item.path || pathname.startsWith(`${item.path}/`)
    );
    setActiveSection(activeItem?.name || "");
  }, [pathname]);

  if (!user || user.role !== "admin") return null;

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

  const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);
  const toggleMobile = useCallback(() => setIsMobileOpen(prev => !prev), []);

  const getIcon = (itemName: string) => {
    const key = itemName.toLowerCase().split(" ")[0];
    const Icon = iconMap[key] || iconMap.default;
    return <Icon className="w-4 h-4" />;
  };

  const getNotificationCount = (itemName: string) => {
    const key = itemName.toLowerCase().split(" ")[0];
    return notificationCounts[key as keyof typeof notificationCounts] || 0;
  };

  const filteredNav = ADMIN_NAV.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group navigation items (example grouping - adjust based on your actual ADMIN_NAV)
  const groupedNav = {
    Main: filteredNav.slice(0, 4),
    Content: filteredNav.slice(4, 8),
    Settings: filteredNav.slice(8),
  };

  return (
    <TooltipProvider delayDuration={100}>
      {/* Mobile Menu Button */}
      <Button
        onClick={toggleMobile}
        size="icon"
        variant="secondary"
        className="lg:hidden fixed top-4 left-4 z-50 h-10 w-10 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transition-all"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X className="w-4 h-4" />
        ) : (
          <Menu className="w-4 h-4" />
        )}
      </Button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in-0"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-800 dark:from-blue-950 dark:via-blue-900 dark:to-gray-950 border-r border-blue-500/20 dark:border-blue-900/30 shadow-2xl z-50 transition-all duration-300 ease-in-out flex flex-col",
          // Desktop behavior - fixed overlay
          "lg:fixed lg:top-0 lg:left-0 lg:z-40",
          isCollapsed ? "lg:w-16" : "lg:w-64",
          // Mobile behavior
          isMobileOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between p-4 border-b border-blue-500/20 dark:border-blue-800/30",
          isCollapsed && "flex-col gap-4 py-6"
        )}>
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-white">Admin</h2>
                <p className="text-xs text-blue-200">Management Panel</p>
              </div>
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Desktop Collapse Button */}
          <Button
            onClick={toggleCollapse}
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg transition-all text-white hover:bg-white/10",
              isCollapsed && "rotate-180"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* User Info (only when expanded) */}
        {!isCollapsed && user && (
          <div className="px-4 py-4 border-b border-blue-500/20 dark:border-blue-800/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-white/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-white/20 text-white backdrop-blur-sm">
                  {user.name?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name || "Administrator"}
                </p>
                <p className="text-xs text-blue-200 truncate">
                  {user.role === "admin" ? "Admin" : "User"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-4">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-9 rounded-lg bg-white/10" />
                ))}
              </div>
            ) : filteredNav.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedNav).map(([group, items]) => (
                  items.length > 0 && (
                    <div key={group} className="mb-4">
                      {!isCollapsed && (
                        <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider px-2 mb-2">
                          {group}
                        </h3>
                      )}
                      <div className="space-y-5">
                        {items.map((item) => {
                          const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                          const notificationCount = getNotificationCount(item.name);

                          return (
                            <Tooltip key={item.path} delayDuration={100}>
                              <TooltipTrigger asChild>
                                <Link
                                  href={item.path}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                      ? "bg-white text-blue-700 shadow-md"
                                      : "hover:bg-white/10 text-blue-100 hover:text-white",
                                    isCollapsed && "justify-center"
                                  )}
                                  title={isCollapsed ? item.name : undefined}
                                >
                                  <span
                                    className={cn(
                                      "relative",
                                      isActive
                                        ? "text-blue-700"
                                        : "text-blue-200 group-hover:text-white"
                                    )}
                                  >
                                    {getIcon(item.name)}
  
                                  </span>

                                  {!isCollapsed && (
                                    <>
                                      <span className="text-sm font-medium flex-1">{item.name}</span>
                                      {isActive && (
                                        <div className="w-1 h-4 rounded-full bg-blue-700" />
                                      )}
                                    </>
                                  )}
                                </Link>
                              </TooltipTrigger>
                              {isCollapsed && (
                                <TooltipContent side="right" className="bg-blue-950 text-white border-blue-800">
                                  <p className="text-sm">{item.name}</p>
                                  {notificationCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] flex items-center justify-center">
                                      {notificationCount}
                                    </span>
                                  )}
                                </TooltipContent>
                              )}
                            </Tooltip>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Search className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <p className="text-sm text-blue-200">No matches found</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs text-blue-200 hover:text-white hover:bg-white/10"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              </div>
            )}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-blue-500/20 dark:border-blue-800/30 p-4">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="text-xs text-blue-200">
                <p className="font-medium text-white">System Status</p>
                <p className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  All systems operational
                </p>
              </div>
            )}
            
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg transition-all text-blue-100 hover:text-white hover:bg-white/10",
                    isCollapsed ? "mx-auto" : ""
                  )}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-blue-950 text-white border-blue-800">
                Logout
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Collapse handle */}
        <div className="absolute -right-3 top-24 hidden lg:block">
          <Button
            onClick={toggleCollapse}
            size="icon"
            className="h-6 w-6 rounded-full shadow-lg border border-blue-400 bg-white hover:bg-blue-50 text-blue-700"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronLeft className="w-3 h-3" />
            )}
          </Button>
        </div>
      </aside>

      {/* Main content spacer - only when sidebar is collapsed */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      />
    </TooltipProvider>
  );
}