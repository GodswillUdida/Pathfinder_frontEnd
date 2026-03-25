// components/layout/Header.tsx
"use client";

import {
  useState,
  useEffect,
  useRef,
  memo,
  useCallback,
  type MouseEvent,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShoppingCart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";
import { useAuthStore } from "@/store/authStore";
import { useCart } from "@/store/cart.store";
import { MobileNav } from "./MobileNav";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface DropdownItem {
  href: string;
  title: string;
  description?: string;
}

export interface NavItem {
  name: string;
  href?: string;
  dropdown?: DropdownItem[];
}

// ─── Gradient button ────────────────────────────────────────────────────────
// Cursor-tracking radial gradient. The hot-spot follows the mouse within the
// button boundary — same technique used on Stripe and Resend CTAs.

interface GradientButtonProps {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant: "primary" | "outline";
  className?: string;
}

const GradientButton = memo(function GradientButton({
  href,
  onClick,
  children,
  variant,
  className,
}: GradientButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const handleMove = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } =
      ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - left) / width) * 100,
      y: ((e.clientY - top) / height) * 100,
    });
  }, []);

  const baseClass = cn(
    "relative inline-flex items-center justify-center gap-1.5 h-9 px-5 rounded-lg",
    "text-[13.5px] font-semibold tracking-[-0.01em] whitespace-nowrap",
    "select-none cursor-pointer transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
    className,
  );

  const primaryClass = cn(
    baseClass,
    "text-white border-0",
    hovered ? "shadow-[0_6px_24px_rgba(79,70,229,0.45)]" : "shadow-[0_2px_8px_rgba(79,70,229,0.25)]",
  );

  const outlineClass = cn(
    baseClass,
    "border border-slate-200 text-slate-700",
    hovered ? "bg-slate-50 border-slate-300" : "bg-white",
  );

  const gradientStyle =
    variant === "primary"
      ? {
          background: hovered
            ? `radial-gradient(ellipse at ${pos.x}% ${pos.y}%, #818cf8 0%, #6366f1 35%, #4f46e5 100%)`
            : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          transform: hovered ? "translateY(-1px)" : "none",
        }
      : { transform: hovered ? "translateY(-1px)" : "none" };

  const props = {
    ref: ref as React.Ref<HTMLAnchorElement & HTMLButtonElement>,
    className: variant === "primary" ? primaryClass : outlineClass,
    style: gradientStyle,
    onMouseMove: handleMove,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onClick,
  };

  if (href) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return <button type="button" {...props}>{children}</button>;
});

// ─── Cart badge ─────────────────────────────────────────────────────────────

const CartButton = memo(function CartButton() {
  const items = useCart((s) => s.items);
  const count = items.reduce((sum, i) => sum + (i.quantity ?? 1), 0);

  return (
    <Link
      href="/cart"
      aria-label={`Cart — ${count} item${count !== 1 ? "s" : ""}`}
      className="relative flex items-center justify-center w-9 h-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <ShoppingCart className="w-[18px] h-[18px]" />
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold px-[3px] leading-none"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      )}
    </Link>
  );
});

// ─── User avatar button ──────────────────────────────────────────────────────

const UserButton = memo(function UserButton() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: globalThis.MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const dashHref = ["admin", "superadmin"].includes(user.role)
    ? "/admin/programs"
    : "/dashboard";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-2 h-9 pl-1 pr-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
          {initials}
        </span>
        <span className="hidden sm:block max-w-[96px] truncate">
          {user.name.split(" ")[0]}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 py-1 z-50"
          >
            <div className="px-3.5 py-2.5 border-b border-slate-100">
              <p className="text-[13px] font-semibold text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>
            <Link
              role="menuitem"
              href={dashHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2 text-[13px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Dashboard
            </Link>
            <div className="border-t border-slate-100 mt-1" />
            <button
              role="menuitem"
              type="button"
              onClick={() => { setOpen(false); logout(); }}
              className="flex items-center gap-2 w-full px-3.5 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// ─── Dropdown panel ─────────────────────────────────────────────────────────

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
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-0 top-full mt-2.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/60 p-1.5 z-50"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "block px-3.5 py-2.5 rounded-lg transition-colors group",
              active
                ? "bg-indigo-50 border-l-2 border-indigo-500"
                : "hover:bg-slate-50 border-l-2 border-transparent",
            )}
          >
            <p
              className={cn(
                "text-[13px] font-semibold leading-none",
                active
                  ? "text-indigo-700"
                  : "text-slate-800 group-hover:text-indigo-600",
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

// ─── Main Header ─────────────────────────────────────────────────────────────

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname]);

  const isLinkActive = useCallback(
    (href: string) => (href === "/" ? pathname === href : pathname.startsWith(href)),
    [pathname],
  );

  const isDropdownActive = useCallback(
    (dd?: DropdownItem[]) => dd?.some((d) => isLinkActive(d.href)) ?? false,
    [isLinkActive],
  );

  const mainLinks = navLinks.filter((l: NavItem) => !l.dropdown);
  const dropdownLinks = navLinks.filter((l: NavItem) => !!l.dropdown);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md transition-all duration-300",
          scrolled
            ? "border-b border-slate-200/80 shadow-sm shadow-slate-100"
            : "border-b border-slate-100",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
          <div className="flex items-center h-[60px] gap-0">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 mr-8" aria-label="Home">
              <Image
                src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                alt="Accountant Pathfinder"
                width={148}
                height={34}
                className="h-8 w-auto"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav
              aria-label="Main navigation"
              className="hidden lg:flex items-center gap-0.5 flex-1"
            >
              {mainLinks.map((link: NavItem) => {
                const active = link.href ? isLinkActive(link.href) : false;
                return (
                  <Link
                    key={link.name}
                    href={link.href!}
                    className={cn(
                      "relative px-3.5 py-2 rounded-lg text-[13.5px] font-medium tracking-[-0.01em] transition-colors",
                      active
                        ? "text-slate-900 bg-slate-100"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-indigo-500" />
                    )}
                  </Link>
                );
              })}

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
                        "flex items-center gap-1 px-3.5 py-2 rounded-lg text-[13.5px] font-medium tracking-[-0.01em] transition-colors",
                        dropActive || isOpen
                          ? "text-slate-900 bg-slate-100"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                      )}
                    >
                      {link.name}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 opacity-50 transition-transform duration-200",
                          isOpen && "rotate-180",
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

            {/* Right side actions */}
            <div className="hidden lg:flex items-center gap-2 ml-auto">
              <CartButton />

              {user ? (
                <UserButton />
              ) : (
                <>
                  <GradientButton href="/auth/login" variant="outline">
                    Sign in
                  </GradientButton>
                  <GradientButton href="/auth/register" variant="primary">
                    Get started
                  </GradientButton>
                </>
              )}
            </div>

            {/* Mobile: cart + hamburger */}
            <div className="flex lg:hidden items-center gap-2 ml-auto">
              <CartButton />
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={mobileOpen}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Menu className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isLinkActive={isLinkActive}
      />
    </>
  );
}