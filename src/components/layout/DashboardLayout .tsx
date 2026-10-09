"use client";

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import StudentSidebar from "../sidebar/UserSidebar";
import AdminSidebar from "../sidebar/AdminSidebar";
import { toast } from "sonner";
// import AdminTopBar from "../TopBar/AdminTopBar";
import StudentTopBar from "../TopBar/StudentTopBar";

// 2026 Core Brand Palette (Perceptually Even OKLCH Model)
// const BRAND_TOKENS = {
//   // Base structural spaces
//   bg: "bg-[oklch(13%_0.03_254)]", // Electric Obsidian (Deepest Slate Blue)
//   surface: "bg-[oklch(16%_0.04_254)]", // Dark Indigo Card Base
//   border: "border-[oklch(22%_0.05_254)]", // Clean Blue-Slate Border Matrix

//   // High fidelity content accents
//   brandPrimary: "text-[oklch(56%_0.23_254)]", // Vibrant Core Digital Blue
//   brandWhite: "text-[oklch(98%_0.01_254)]", // Premium Soft Stark White
//   accentCyan: "text-[oklch(78%_0.16_205)]", // Laser Cyan Spark (Complementary Highlight)
//   accentGold: "text-[oklch(82%_0.14_85)]", // Calcite Gold (Premium / Warning Tiers)

//   textMuted: "text-[oklch(72%_0.03_254)]", // Readable Low-Priority Blue-Gray
// };

interface DashboardLayoutProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const DashboardLayout = ({
  children,
  allowedRoles = ["student", "admin", "superadmin", "instructor"],
}: DashboardLayoutProps) => {
  const { user, isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // const hasAccess = useMemo(() => {
  //   if (!user?.role) return false;
  //   return allowedRoles.includes(user.role);
  // }, [user?.role, allowedRoles]);

  // const isAdmin = useMemo(() => {
  //   if (!user?.role) return false;
  //   return ["admin", "superadmin", "instructor"].includes(user.role);
  // }, [user?.role]);

  const role = user?.role;
  const hasAccess = !!role && allowedRoles.includes(role);
  const isAdmin =
    !!role && ["admin", "superadmin", "instructor"].includes(role);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated || !user) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!hasAccess) {
      toast.error("Access Denied", {
        description:
          "Your account does not have authorization flags for this terminal context.",
        duration: 4000,
      });

      if (["admin", "superadmin", "instructor"].includes(user.role)) {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/dashboard");
      }
    }
  }, [hydrated, isAuthenticated, user, hasAccess, pathname, router]);

  // 1. Session Hydration Matrix Layer (Stark White & Deep Blue Accents)
  if (!hydrated) {
    return (
      <div
        className={`flex h-screen flex-col items-center justify-center`}
        role="status"
        aria-live="polite"
      >
        {/* Dynamic Holographic Backdrop Mesh */}
        <div className="absolute inset-0 pointer-events-none" />

        <div className="relative flex flex-col items-center gap-4 p-8 rounded-2xl border bg-black/30 border-white/5 backdrop-blur-xl">
          <Loader2
            className={`h-6 w-6 animate-spin text-[oklch(56%_0.23_254)]`}
          />
          <div className="text-center">
            <p className="text-sm font-semibold tracking-tight text-white">
              Configuring Secure Identity
            </p>
            <p className="text-[10px] text-blue-500 font-mono mt-1 tracking-widest uppercase">
              PathAdmin Identity Shield
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !hasAccess) return null;

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden antialiased text-[oklch(98%_0.01_254)]`}
      // style={{ contain: "layout size" }}
    >
      {/* ── Structural Layout Navigation Sidebar Column ──────────────── */}
      <div className="shrink-0 z-30 transition-transform duration-300">
        {isAdmin ? <AdminSidebar /> : <StudentSidebar />}
      </div>

      {/* ── Core Fluid Workspace Frame ───────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Dynamic Navigation Topbar Bar Anchor */}
        <header
          className={`shrink-0 z-20 border-b`}
        >
          {!isAdmin && <StudentTopBar />}
        </header>

        {/* Primary Scroll Canvas */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden p-[clamp(1.25rem,4vw,2.25rem)] focus:outline-none"
          tabIndex={-1}
          aria-label={`${isAdmin ? "Administrative Management" : "Student Core Dashboard"} View Space`}
        >
          {/* Content Entry Animation Pipeline */}
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 cubic-bezier(0.16, 1, 0.3, 1) fill-mode-both">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
