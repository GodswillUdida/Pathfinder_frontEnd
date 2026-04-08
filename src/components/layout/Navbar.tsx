// components/layout/Navbar.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  User,
  BookOpen,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/store/cart.store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DropdownItem {
  href: string;
  title: string;
  description?: string;
}
interface NavItem {
  name: string;
  href?: string;
  dropdown?: DropdownItem[];
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

/** Single source of truth for nav height — used in header + drawer */
const NAV_HEIGHT = "h-14"; // 56px — tighter, modern
const CONTAINER = "max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8";
const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-1";

// Shared Framer motion config — keeps all menus/dropdowns consistent
const MENU_MOTION = {
  initial: { opacity: 0, y: 5, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 4, scale: 0.98 },
  transition: { duration: 0.14, ease: [0.22, 1, 0.36, 1] },
};

// ---------------------------------------------------------------------------
// GradientBtn — interactive primary / outline button
// ---------------------------------------------------------------------------

interface GradientBtnProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const GradientBtn = memo(function GradientBtn({
  href,
  onClick,
  children,
  variant = "primary",
  size = "sm",
  fullWidth,
  disabled,
  className,
}: GradientBtnProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const track = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  }, []);

  const h = size === "sm" ? "h-8" : "h-10";
  const px = size === "sm" ? "px-[14px]" : "px-5";
  const fs = "text-[13px]";

  const base = cn(
    "relative inline-flex items-center justify-center gap-1.5 rounded-lg",
    "font-semibold tracking-[-0.015em] whitespace-nowrap select-none cursor-pointer",
    "transition-all duration-150",
    h,
    px,
    fs,
    FOCUS,
    fullWidth && "w-full",
    disabled && "opacity-40 cursor-not-allowed pointer-events-none",
    className
  );

  const primaryCls = cn(base, "text-white border-0");
  const outlineCls = cn(
    base,
    "border border-slate-200 text-slate-600",
    hovered ? "bg-slate-50 border-slate-300 text-slate-800" : "bg-white"
  );

  const style =
    variant === "primary"
      ? {
          background: hovered
            ? `radial-gradient(ellipse at ${pos.x}% ${pos.y}%, #818cf8 0%, #6366f1 45%, #4f46e5 100%)`
            : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          boxShadow: hovered
            ? "0 4px 16px rgba(99,102,241,.35)"
            : "0 1px 4px rgba(99,102,241,.2)",
          transform: hovered ? "translateY(-1px)" : "none",
        }
      : {
          transform: hovered ? "translateY(-1px)" : "none",
        };

  const shared = {
    ref: ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>,
    className: variant === "primary" ? primaryCls : outlineCls,
    style,
    onMouseMove: track,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick,
  };

  if (href)
    return (
      <Link href={href} {...shared}>
        {children}
      </Link>
    );
  return (
    <button type="button" {...shared}>
      {children}
    </button>
  );
});

// ---------------------------------------------------------------------------
// AuthButtons / AuthSkeleton — hydration-safe pair
// ---------------------------------------------------------------------------

const AuthButtons = memo(function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <GradientBtn href="/auth/login" variant="outline" size="sm">
        Sign in
      </GradientBtn>
      <GradientBtn href="/auth/register" variant="primary" size="sm">
        Get started
      </GradientBtn>
    </div>
  );
});

const AuthSkeleton = memo(function AuthSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="h-8 w-[76px] rounded-lg border border-slate-200 bg-white animate-pulse" />
      <div className="h-8 w-[100px] rounded-lg bg-indigo-100 animate-pulse" />
    </div>
  );
});

// ---------------------------------------------------------------------------
// CartBtn
// ---------------------------------------------------------------------------

const CartBtn = memo(function CartBtn() {
  const count = useCart((s) =>
    s.items.reduce((n, i) => n + (i.quantity ?? 1), 0)
  );
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count !== 1 ? "s" : ""}`}
      className={cn(
        "relative flex items-center justify-center w-8 h-8 rounded-lg",
        "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
        "transition-colors duration-150",
        FOCUS
      )}
    >
      <ShoppingCart className="w-4 h-4" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute -top-1 -right-1",
              "min-w-[15px] h-[15px] px-[3px]",
              "flex items-center justify-center",
              "rounded-full bg-indigo-600 text-white",
              "text-[9px] font-bold leading-none",
              "border border-white"
            )}
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
});

// ---------------------------------------------------------------------------
// DropdownPanel
// ---------------------------------------------------------------------------

const DropdownPanel = memo(function DropdownPanel({
  items,
  onClose,
}: {
  items: DropdownItem[];
  onClose: () => void;
}) {
  const pathname = usePathname();
  return (
    <motion.div
      // {...MENU_MOTION}
      className={cn(
        "absolute left-0 top-full mt-2 w-60",
        "bg-white rounded-xl border border-slate-200/80",
        "shadow-xl shadow-slate-200/40 p-1.5 z-50"
      )}
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "block px-3 py-2.5 rounded-lg border-l-2 transition-colors group",
              active
                ? "bg-indigo-50/50 border-indigo-500"
                : "border-transparent hover:bg-slate-50 hover:border-slate-200"
            )}
          >
            <p
              className={cn(
                "text-[13px] font-semibold leading-none tracking-[-0.01em]",
                active
                  ? "text-indigo-700"
                  : "text-slate-800 group-hover:text-indigo-600"
              )}
            >
              {item.title}
            </p>
            {item.description && (
              <p className="text-[11.5px] text-slate-400 mt-1 leading-snug">
                {item.description}
              </p>
            )}
          </Link>
        );
      })}
    </motion.div>
  );
});

// ---------------------------------------------------------------------------
// UserMenu
// ---------------------------------------------------------------------------

const UserMenu = memo(function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const dashHref = ["admin", "superadmin"].includes(user.role)
    ? "/admin/programs"
    : "/dashboard";

  const menuItems = [
    { href: dashHref, label: "Dashboard", Icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "My courses", Icon: BookOpen },
    { href: "/dashboard/profile", label: "Profile", Icon: User },
    ...(["admin", "superadmin"].includes(user.role)
      ? [{ href: "/admin/dashboard", label: "Admin panel", Icon: ShieldCheck }]
      : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg",
          "border border-slate-200 hover:border-slate-300 hover:bg-slate-50",
          "transition-all duration-150",
          FOCUS
        )}
      >
        {/* Avatar */}
        <span className="relative w-6 h-6 rounded-md bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
          {initials}
          <span className="absolute -bottom-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-emerald-500 border border-white" />
        </span>
        <span className="hidden sm:block max-w-[72px] truncate text-[13px] font-medium text-slate-700 tracking-[-0.01em]">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            // {...MENU_MOTION}
            role="menu"
            className={cn(
              "absolute right-0 top-full mt-2 w-52",
              "bg-white rounded-xl border border-slate-200",
              "shadow-xl shadow-slate-200/50 py-1 z-50"
            )}
          >
            {/* User info header */}
            <div className="px-3.5 py-2.5 border-b border-slate-100">
              <p className="text-[13px] font-semibold text-slate-900 tracking-[-0.01em] truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>

            {/* Nav items */}
            <div className="py-1">
              {menuItems.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors tracking-[-0.01em]"
                >
                  <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  {label}
                </Link>
              ))}
            </div>

            {/* Sign out */}
            <div className="border-t border-slate-100 py-1">
              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  router.push("/auth/login");
                }}
                className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left tracking-[-0.01em]"
              >
                <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ---------------------------------------------------------------------------
// DrawerAuthFooter — extracted to avoid duplicating auth logic in MobileDrawer
// ---------------------------------------------------------------------------

const DrawerAuthFooter = memo(function DrawerAuthFooter({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const dashHref =
    user && ["admin", "superadmin"].includes(user.role)
      ? "/admin/programs"
      : "/dashboard";

  if (isAuthenticated && user) {
    return (
      <>
        {/* User info card */}
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
          <span className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
            {initials}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900 truncate tracking-[-0.01em]">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {user.email}
            </p>
          </div>
        </div>

        <Link
          href={dashHref}
          onClick={onClose}
          className="flex items-center justify-center gap-2 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[13.5px] font-semibold tracking-[-0.015em] transition-colors"
        >
          <LayoutDashboard className="w-4 h-4 opacity-70" />
          Dashboard
        </Link>

        <button
          type="button"
          onClick={async () => {
            onClose();
            await logout();
            router.push("/auth/login");
          }}
          className="flex items-center justify-center gap-2 h-10 rounded-xl border border-red-200 text-red-500 text-[13.5px] font-semibold hover:bg-red-50 transition-colors tracking-[-0.015em]"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <GradientBtn href="/auth/register" variant="primary" fullWidth size="md">
        Get started free <ArrowRight className="w-4 h-4 opacity-80" />
      </GradientBtn>
      <GradientBtn href="/auth/login" variant="outline" fullWidth size="md">
        Sign in
      </GradientBtn>
    </>
  );
});

// ---------------------------------------------------------------------------
// MobileDrawer
// ---------------------------------------------------------------------------

const MobileDrawer = memo(function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const cartCount = useCart((s) =>
    s.items.reduce((n, i) => n + (i.quantity ?? 1), 0)
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const isActive = useCallback(
    (href: string) =>
      href === "/" ? pathname === href : pathname.startsWith(href),
    [pathname]
  );

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
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-0 right-0 bottom-0 w-[min(80vw,320px)] bg-white border-l border-slate-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between px-4 border-b border-slate-100",
                NAV_HEIGHT
              )}
            >
              <Link href="/" onClick={onClose} aria-label="Home">
                <Image
                  src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                  alt="Accountant Pathfinder"
                  width={110}
                  height={28}
                  className="h-6 w-auto"
                />
              </Link>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg",
                  "text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors",
                  FOCUS
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav
              className="flex-1 overflow-y-auto py-1.5"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link: NavItem) => {
                const active = link.href ? isActive(link.href) : false;
                const isExp = expanded === link.name;

                if (link.dropdown) {
                  const dropActive = link.dropdown.some((d) =>
                    isActive(d.href)
                  );
                  return (
                    <div key={link.name}>
                      <button
                        type="button"
                        aria-expanded={isExp}
                        onClick={() =>
                          setExpanded((v) =>
                            v === link.name ? null : link.name
                          )
                        }
                        className={cn(
                          "flex items-center justify-between w-full px-4 py-3",
                          "text-[14px] font-medium tracking-[-0.01em] transition-colors",
                          dropActive
                            ? "text-indigo-600"
                            : "text-slate-600 hover:text-slate-900"
                        )}
                      >
                        {link.name}
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-400 transition-transform duration-200",
                            isExp && "rotate-180"
                          )}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExp && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden bg-slate-50/60"
                          >
                            {link.dropdown!.map((item: DropdownItem) => {
                              const ia = isActive(item.href);
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={onClose}
                                  className={cn(
                                    "block px-6 py-3 border-l-2 transition-colors",
                                    ia
                                      ? "border-indigo-500 bg-indigo-50/50 text-indigo-700"
                                      : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-white"
                                  )}
                                >
                                  <p className="text-[13px] font-semibold tracking-[-0.01em]">
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
                      "flex items-center justify-between px-4 py-3",
                      "text-[14px] font-medium tracking-[-0.01em] border-l-2 transition-colors",
                      active
                        ? "border-indigo-500 text-indigo-600 bg-indigo-50/40"
                        : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}

              {/* Cart row */}
              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center justify-between px-4 py-3 border-l-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2.5 text-[14px] font-medium tracking-[-0.01em]">
                  <ShoppingCart className="w-4 h-4 text-slate-400" />
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-indigo-600 text-white text-[9px] font-bold px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Auth footer — extracted as separate component */}
            <div className="p-4 border-t border-slate-100 flex flex-col gap-2">
              <DrawerAuthFooter onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

// ---------------------------------------------------------------------------
// Navbar — main export
// ---------------------------------------------------------------------------

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, hydrated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = useCallback(
    (href: string) =>
      href === "/" ? pathname === href : pathname.startsWith(href),
    [pathname]
  );

  const isDropdownActive = useCallback(
    (dd?: DropdownItem[]) => dd?.some((d) => isActive(d.href)) ?? false,
    [isActive]
  );

  const mainLinks = navLinks.filter((l: NavItem) => !l.dropdown);
  const dropdownLinks = navLinks.filter((l: NavItem) => !!l.dropdown);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 w-full bg-white/95 transition-all duration-300",
          scrolled
            ? "border-b border-slate-200/60 shadow-[0_1px_8px_rgba(15,23,42,.06)] backdrop-blur-md"
            : "border-b border-slate-100"
        )}
      >
        <div className={CONTAINER}>
          <div className={cn("flex items-center", NAV_HEIGHT)}>
            {/* ── Logo ─────────────────────────────────────────────────── */}
            <Link
              href="/"
              className="flex-shrink-0 mr-6 lg:mr-8"
              aria-label="Home"
            >
              <Image
                src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                alt="Accountant Pathfinder"
                width={140}
                height={32}
                className="h-7 w-auto"
                priority
              />
            </Link>

            {/* ── Desktop Nav ───────────────────────────────────────────── */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-0.5 flex-1"
            >
              {/* Simple links */}
              {mainLinks.map((link: NavItem) => {
                const active = link.href ? isActive(link.href) : false;
                return (
                  <Link
                    key={link.name}
                    href={link.href!}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative px-3 py-2 rounded-lg",
                      "text-[13.5px] font-medium tracking-[-0.01em]",
                      "transition-colors duration-150",
                      active
                        ? "text-slate-900 bg-slate-100"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-indigo-500" />
                    )}
                  </Link>
                );
              })}

              {/* Dropdown links */}
              {dropdownLinks.map((link: NavItem) => {
                const isOpen = activeDropdown === link.name;
                const dropActive = isDropdownActive(link.dropdown);
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setActiveDropdown(link.name)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      className={cn(
                        "flex items-center gap-1 px-3 py-2 rounded-lg",
                        "text-[13.5px] font-medium tracking-[-0.01em]",
                        "transition-colors duration-150",
                        dropActive || isOpen
                          ? "text-slate-900 bg-slate-100"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-50",
                        FOCUS
                      )}
                    >
                      {link.name}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 opacity-50 transition-transform duration-200",
                          isOpen && "rotate-180"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && link.dropdown && (
                        <DropdownPanel
                          items={link.dropdown}
                          onClose={() => setActiveDropdown(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* ── Desktop Right ─────────────────────────────────────────── */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              <CartBtn />

              {/* Hydration-safe auth area */}
              {hydrated ? (
                isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <AuthButtons />
                )
              ) : (
                <AuthSkeleton />
              )}
            </div>

            {/* ── Mobile: Cart + Hamburger ──────────────────────────────── */}
            <div className="flex lg:hidden items-center gap-1.5 ml-auto">
              <CartBtn />
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className={cn(
                  "w-8 h-8 flex items-center justify-center rounded-lg",
                  "text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors",
                  FOCUS
                )}
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
