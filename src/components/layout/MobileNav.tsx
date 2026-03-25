// components/layout/MobileNav.tsx
"use client";

import { useState, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";
import { useAuthStore } from "@/store/authStore";
import type { NavItem, DropdownItem } from "./Header";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  isLinkActive: (href: string) => boolean;
}

export const MobileNav = memo(function MobileNav({
  open,
  onClose,
  isLinkActive,
}: MobileNavProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push("/auth/login");
  };

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const dashHref = user && ["admin", "superadmin"].includes(user.role)
    ? "/admin/programs"
    : "/dashboard";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 w-[min(82vw,320px)] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-[60px] border-b border-slate-100">
              <Link href="/" onClick={onClose} aria-label="Home">
                <Image
                  src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                  alt="Accountant Pathfinder"
                  width={120}
                  height={30}
                  className="h-7 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav
              aria-label="Mobile navigation"
              className="flex-1 overflow-y-auto py-2"
            >
              {navLinks.map((link: NavItem) => {
                const active = link.href ? isLinkActive(link.href) : false;
                const isExp = expanded === link.name;

                if (link.dropdown) {
                  return (
                    <div key={link.name}>
                      <button
                        type="button"
                        aria-expanded={isExp}
                        onClick={() =>
                          setExpanded(isExp ? null : link.name)
                        }
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-3 text-[14px] font-semibold transition-colors",
                          link.dropdown.some((d) => isLinkActive(d.href))
                            ? "text-indigo-600"
                            : "text-slate-700 hover:text-slate-900",
                        )}
                      >
                        {link.name}
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            isExp && "rotate-180",
                          )}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            className="overflow-hidden bg-slate-50"
                          >
                            {link.dropdown!.map((item: DropdownItem) => {
                              const itemActive = isLinkActive(item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={onClose}
                                  className={cn(
                                    "block px-6 py-3 border-l-2 transition-colors",
                                    itemActive
                                      ? "border-indigo-500 bg-indigo-50/60 text-indigo-700"
                                      : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-white",
                                  )}
                                >
                                  <p className="text-[13px] font-semibold">
                                    {item.title}
                                  </p>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    href={link.href!}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 text-[14px] font-semibold border-l-2 transition-colors",
                      active
                        ? "border-indigo-500 text-indigo-600 bg-indigo-50/40"
                        : "border-transparent text-slate-700 hover:text-slate-900 hover:bg-slate-50",
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Bottom auth section */}
            <div className="p-4 border-t border-slate-100 space-y-2.5">
              {user ? (
                <>
                  {/* User info card */}
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
                    <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                      {initials}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-slate-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={dashHref}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13.5px] font-semibold transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-red-200 text-red-500 text-[13.5px] font-semibold hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    onClick={onClose}
                    className="flex items-center justify-center w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[13.5px] font-semibold transition-colors shadow-sm"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className="flex items-center justify-center w-full h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13.5px] font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});