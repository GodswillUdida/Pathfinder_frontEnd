// components/layout/Navbar.tsx
"use client";

import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks } from "@/data/navData";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/store/cart.store";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const LOGO_SRC =
  "https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg";

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;
const PANEL_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

const isAdminRole = (role?: string) => role === "admin" || role === "superadmin";
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
const initialsOf = (name?: string) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

/* -------------------------------------------------------------------------- */
/*  Small building blocks                                                     */
/* -------------------------------------------------------------------------- */

function Logo({
  className,
  priority,
  onClick,
}: {
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href="/" onClick={onClick} className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
      <Image
        src={LOGO_SRC}
        alt="Accountant Pathfinder"
        width={140}
        height={32}
        priority={priority}
        className={cn("h-9 w-auto dark:brightness-0 dark:invert", className)}
      />
    </Link>
  );
}

function Avatar({ name, size = "sm" }: { name?: string; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-white",
        size === "sm" ? "h-7 w-7 rounded-lg text-[10px]" : "h-10 w-10 rounded-xl text-xs",
      )}
    >
      {initialsOf(name)}
      <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  NavButton: cursor-lit pill, springy press                                 */
/* -------------------------------------------------------------------------- */

interface NavButtonProps {
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  fullWidth?: boolean;
  className?: string;
}

const NavButton = memo(function NavButton({
  href,
  onClick,
  children,
  variant = "primary",
  size = "sm",
  fullWidth,
  className,
}: NavButtonProps) {
  const spot = (e: ReactPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const cls = cn(
    "relative isolate inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-xl",
    "font-semibold tracking-tight whitespace-nowrap select-none",
    "transition-[transform,box-shadow,background-color,border-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
    "hover:-translate-y-px active:translate-y-0 active:scale-[0.97]",
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:opacity-0",
    "before:transition-opacity before:duration-300 hover:before:opacity-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    size === "sm" ? "h-9 px-4 text-[13px]" : "h-11 px-5 text-sm",
    variant === "primary" &&
      cn(
        "bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 brand-glow-blue",
        "before:bg-[radial-gradient(110px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklch,white_38%,transparent),transparent_70%)]",
      ),
    variant === "outline" &&
      cn(
        "border border-border bg-card text-foreground hover:border-brand-300 hover:text-accent-foreground",
        "before:bg-[radial-gradient(110px_circle_at_var(--mx,50%)_var(--my,50%),color-mix(in_oklch,var(--brand-500)_14%,transparent),transparent_70%)]",
      ),
    fullWidth && "w-full",
    className,
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} onPointerMove={spot} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} onPointerMove={spot} className={cls}>
      {children}
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

const AuthButtons = memo(function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <NavButton href="/auth/login" variant="outline">
        Sign in
      </NavButton>
      <NavButton href="/auth/register">
        Get started
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </NavButton>
    </div>
  );
});

const AuthSkeleton = memo(function AuthSkeleton() {
  return (
    <div className="flex items-center gap-2" aria-hidden="true">
      <div className="h-9 w-[78px] animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-9 w-[112px] animate-pulse rounded-xl bg-brand-100 dark:bg-secondary" />
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  Cart                                                                      */
/* -------------------------------------------------------------------------- */

const CartBtn = memo(function CartBtn() {
  const storeCount = useCart((s) =>
    s.items.reduce((n, i) => n + (i.quantity ?? 1), 0),
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const count = mounted ? storeCount : 0;

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count !== 1 ? "s" : ""}`}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-xl text-muted-foreground",
        "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
        "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 22 }}
            className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full border-2 border-background bg-primary px-[3px] text-[9px] leading-none font-bold text-primary-foreground"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
});

/* -------------------------------------------------------------------------- */
/*  Desktop dropdown panel                                                    */
/* -------------------------------------------------------------------------- */

const DropdownPanel = memo(function DropdownPanel({
  id,
  label,
  items,
  onClose,
}: {
  id: string;
  label: string;
  items: DropdownItem[];
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={PANEL_SPRING}
      style={{ transformOrigin: "top left" }}
      className="absolute top-full left-0 z-50 pt-3"
    >
      <div className="w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-popover/95 p-2 text-popover-foreground shadow-2xl shadow-brand-navy/20 backdrop-blur-xl">
        <p className="font-display px-3 pt-2 pb-1.5 text-[10.5px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
          {label}
        </p>
        <ul>
          {items.map((item, i) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group/item relative flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all duration-300",
                    active ? "bg-accent" : "hover:bg-secondary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  )}
                >
                  {active && (
                    <span className="absolute inset-y-2.5 left-0 w-0.5 rounded-full bg-primary" />
                  )}
                  <span className="mt-0.5 font-mono text-[11px] text-brand-indigo tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[13.5px] font-semibold tracking-tight",
                        active ? "text-accent-foreground" : "text-foreground",
                      )}
                    >
                      {item.title}
                    </span>
                    {item.description && (
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                        {item.description}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 -translate-x-1 text-brand-amber opacity-0 transition-all duration-300 group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
});

/* -------------------------------------------------------------------------- */
/*  User menu                                                                 */
/* -------------------------------------------------------------------------- */

const UserMenu = memo(function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!user) return null;

  const admin = isAdminRole(user.role);
  const menuItems = [
    { href: admin ? "/admin/programs" : "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "My courses", Icon: BookOpen },
    { href: "/dashboard/profile", label: "Profile", Icon: User },
    ...(admin
      ? [{ href: "/admin/dashboard", label: "Admin panel", Icon: ShieldCheck }]
      : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex h-9 items-center gap-2 rounded-xl border border-border bg-card pr-2.5 pl-1",
          "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "hover:border-brand-300 hover:bg-accent hover:scale-[1.02] active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <Avatar name={user.name} />
        <span className="hidden max-w-[80px] truncate text-[13px] font-medium tracking-tight text-foreground xl:block">
          {user.name?.split(" ")[0]}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-300",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={PANEL_SPRING}
            style={{ transformOrigin: "top right" }}
            className="absolute top-full right-0 z-50 mt-3 w-60 rounded-2xl border border-border bg-popover/95 p-1.5 text-popover-foreground shadow-2xl shadow-brand-navy/20 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2.5">
              <Avatar name={user.name} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
                    {user.name}
                  </p>
                  {admin && (
                    <span className="rounded-md bg-brand-indigo/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-brand-indigo uppercase">
                      {user.role}
                    </span>
                  )}
                </div>
                <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <div className="py-1.5">
              {menuItems.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="group/mi flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] tracking-tight text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <Icon
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/mi:scale-110"
                  />
                  {label}
                </Link>
              ))}
            </div>

            <div className="border-t border-border pt-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={async () => {
                  setOpen(false);
                  await logout();
                  router.push("/auth/login");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] tracking-tight text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-inset"
              >
                <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  Mobile drawer                                                             */
/* -------------------------------------------------------------------------- */

const DrawerAuthFooter = memo(function DrawerAuthFooter({
  onClose,
}: {
  onClose: () => void;
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  if (isAuthenticated && user) {
    return (
      <>
        <div className="flex items-center gap-3 rounded-2xl bg-secondary px-3 py-2.5">
          <Avatar name={user.name} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
              {user.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <NavButton
          href={isAdminRole(user.role) ? "/admin/programs" : "/dashboard"}
          onClick={onClose}
          fullWidth
          size="md"
        >
          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </NavButton>

        <button
          type="button"
          onClick={async () => {
            onClose();
            await logout();
            router.push("/auth/login");
          }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-destructive/30 text-sm font-semibold tracking-tight text-destructive transition-all duration-300 hover:bg-destructive/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <NavButton href="/auth/register" onClick={onClose} fullWidth size="md">
        Get started free
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </NavButton>
      <NavButton href="/auth/login" onClick={onClose} variant="outline" fullWidth size="md">
        Sign in
      </NavButton>
    </>
  );
});

const MobileDrawer = memo(function MobileDrawer({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();
  const cartCount = useCart((s) =>
    s.items.reduce((n, i) => n + (i.quantity ?? 1), 0),
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === href : pathname.startsWith(href)),
    [pathname],
  );

  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      returnTo?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-brand-navy/55 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[min(88vw,380px)] flex-col border-l border-border bg-background shadow-2xl"
            style={{ contain: "layout size" }}
          >
            <div className="flex h-(--nav-h,3.5rem) shrink-0 items-center justify-between border-b border-border px-5">
              <Logo onClick={onClose} />
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-xl text-muted-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-[18px] w-[18px]" aria-hidden="true" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-2" aria-label="Mobile navigation">
              {navLinks.map((link: NavItem, idx: number) => {
                const num = String(idx + 1).padStart(2, "0");
                const rowCls =
                  "flex w-full items-center gap-4 px-5 py-3.5 text-left font-display text-[1.3rem] font-bold tracking-tight transition-colors duration-300";

                if (link.dropdown) {
                  const isExp = expanded === link.name;
                  const dropActive = link.dropdown.some((d) => isActive(d.href));
                  return (
                    <div key={link.name}>
                      <button
                        type="button"
                        aria-expanded={isExp}
                        onClick={() => setExpanded((v) => (v === link.name ? null : link.name))}
                        className={cn(
                          rowCls,
                          dropActive ? "text-primary" : "text-foreground hover:text-primary",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                        )}
                      >
                        <span className="font-mono text-[11px] font-medium text-brand-indigo tabular-nums">
                          {num}
                        </span>
                        <span className="flex-1">{link.name}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform duration-300",
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
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mx-5 mb-2 border-l border-border pl-4">
                              {link.dropdown.map((item: DropdownItem) => {
                                const ia = isActive(item.href);
                                return (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    aria-current={ia ? "page" : undefined}
                                    className={cn(
                                      "block rounded-lg px-3 py-2.5 transition-colors duration-300",
                                      ia
                                        ? "bg-accent text-accent-foreground"
                                        : "text-foreground hover:bg-secondary",
                                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                                    )}
                                  >
                                    <span className="block text-sm font-semibold tracking-tight">
                                      {item.title}
                                    </span>
                                    {item.description && (
                                      <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {item.description}
                                      </span>
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const active = link.href ? isActive(link.href) : false;
                return (
                  <Link
                    key={link.name}
                    href={link.href!}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      rowCls,
                      active ? "text-primary" : "text-foreground hover:text-primary",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    )}
                  >
                    <span className="font-mono text-[11px] font-medium text-brand-indigo tabular-nums">
                      {num}
                    </span>
                    <span className="flex-1">{link.name}</span>
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </Link>
                );
              })}

              <div className="mx-5 my-2 h-px bg-border" />

              <Link
                href="/cart"
                onClick={onClose}
                className="flex items-center gap-4 px-5 py-3 text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
                <span className="flex-1 text-sm font-semibold tracking-tight">Cart</span>
                {cartCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </Link>
            </nav>

            <div className="flex shrink-0 flex-col gap-2 border-t border-border p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <DrawerAuthFooter onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
});

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                    */
/* -------------------------------------------------------------------------- */

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, hydrated } = useAuth();
  const reduce = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });
  const progress = reduce ? scrollYProgress : smooth;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setHoverKey(null);
  }, [pathname]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const cancelClose = useCallback(() => clearTimeout(closeTimer.current), []);
  const scheduleClose = useCallback(() => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  }, []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === href : pathname.startsWith(href)),
    [pathname],
  );

  const activeKey =
    navLinks.find((l: NavItem) =>
      l.href ? isActive(l.href) : (l.dropdown?.some((d) => isActive(d.href)) ?? false),
    )?.name ?? null;

  const pillOn = (key: string) =>
    hoverKey === key || (hoverKey === null && activeKey === key);
  const pillSpring = reduce ? { duration: 0 } : SPRING;

  const itemCls = (key: string) =>
    cn(
      "relative flex items-center gap-1 rounded-xl px-3.5 py-2 text-[13.5px] font-bold tracking-tight transition-colors duration-200",
      pillOn(key) || activeKey === key ? "text-foreground" : "text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    );

  const renderPill = (k: string) => (
    <>
      {pillOn(k) && (
        <motion.span
          layoutId="nav-pill"
          transition={pillSpring}
          className="absolute inset-0 rounded-xl bg-accent"
        />
      )}
      {activeKey === k && (
        <span className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center">
          <motion.span
            layoutId="nav-dot"
            transition={pillSpring}
            className="h-1 w-1 rounded-full bg-primary"
          />
        </span>
      )}
    </>
  );

  return (
    <>
      <header
        style={{ "--nav-h": "clamp(3.5rem, 3.1rem + 0.8vw, 4rem)" } as CSSProperties}
        className={cn(
          "sticky top-0 z-40 h-(--nav-h) w-full border-b transition-[background-color,border-color] duration-500",
          scrolled
            ? "border-transparent bg-transparent"
            : "border-border bg-background/90 backdrop-blur-md",
        )}
      >
        {/* Floating island */}
        <div
          className={cn(
            "relative isolate mx-auto flex h-(--nav-h) items-center border",
            "transition-[max-width,padding,border-radius,background-color,border-color,box-shadow,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            scrolled
              ? "max-w-[min(72rem,calc(100%_-_1rem))] translate-y-2 rounded-2xl border-border bg-background/75 px-4 shadow-lg shadow-brand-navy/10 backdrop-blur-xl"
              : "max-w-[88rem] border-transparent px-[clamp(1rem,4vw,3rem)]",
          )}
          style={{ contain: "layout" }}
        >
          <Logo priority className="mr-2 lg:mr-0" />

          {/* Desktop nav */}
          <LayoutGroup id="nav-desktop">
            <nav
              aria-label="Main navigation"
              onMouseLeave={() => setHoverKey(null)}
              className="ml-6 hidden flex-1 items-center gap-0.5 lg:flex xl:ml-10"
            >
              {navLinks.map((link: NavItem) => {
                if (!link.dropdown) {
                  const active = link.href ? isActive(link.href) : false;
                  return (
                    <Link
                      key={link.name}
                      href={link.href!}
                      aria-current={active ? "page" : undefined}
                      onMouseEnter={() => setHoverKey(link.name)}
                      className={itemCls(link.name)}
                    >
                      {renderPill(link.name)}
                      <span className="relative z-10">{link.name}</span>
                    </Link>
                  );
                }

                const id = `nav-menu-${slug(link.name)}`;
                const isOpen = openMenu === link.name;
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => {
                      cancelClose();
                      setOpenMenu(link.name);
                      setHoverKey(link.name);
                    }}
                    onMouseLeave={scheduleClose}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                        setOpenMenu(null);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setOpenMenu(null);
                        e.currentTarget.querySelector("button")?.focus();
                      }
                    }}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={isOpen ? id : undefined}
                      onClick={() => setOpenMenu(link.name)}
                      className={itemCls(link.name)}
                    >
                      {renderPill(link.name)}
                      <span className="relative z-10">{link.name}</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "relative z-10 h-3.5 w-3.5 opacity-50 transition-transform duration-300",
                          isOpen && "rotate-180",
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <DropdownPanel
                          id={id}
                          label={link.name}
                          items={link.dropdown}
                          onClose={() => setOpenMenu(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </LayoutGroup>

          {/* Desktop right */}
          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <CartBtn />
            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
            {hydrated ? isAuthenticated ? <UserMenu /> : <AuthButtons /> : <AuthSkeleton />}
          </div>

          {/* Mobile right */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            <CartBtn />
            <button
              ref={menuBtnRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="grid h-9 w-9 place-items-center rounded-xl text-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Scroll-progress hairline — amber → blue → indigo */}
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progress, transformOrigin: "0% 50%" }}
            className="pointer-events-none absolute inset-x-4 -bottom-px h-[2px] rounded-full bg-gradient-to-r from-brand-amber via-primary to-brand-indigo"
          />
        </div>
      </header>

      <MobileDrawer open={mobileOpen} onClose={closeMobile} returnFocusRef={menuBtnRef} />
    </>
  );
}