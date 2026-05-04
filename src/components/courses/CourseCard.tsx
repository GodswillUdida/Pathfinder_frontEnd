"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Clock,
  Layers,
  Signal,
  ShoppingCart,
  ArrowUpRight,
  Check,
  Loader2
} from "lucide-react";
import type { Course, CoursePricing } from "@/types/course";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart.store";

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_IMAGE = "/images/course-placeholder.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPrice = (price: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

function getActivePricings(course: Course): CoursePricing[] {
  if (!course.pricings?.length) return [];
  const active = course.pricings.filter((p) => p.isActive);
  return active.length > 0 ? active : course.pricings;
}

function getLowestPricing(pricings: CoursePricing[]): CoursePricing | null {
  if (!pricings.length) return null;
  return pricings.reduce(
    (min, p) => (p.price < min.price ? p : min),
    pricings[0]
  );
}

function buildCourseHref(course: Course): string {
  return course.program?.slug
    ? `/programs/${course.program.slug}/${course.slug}`
    : `/courses/${course.slug}`;
}

function getDurationLabel(duration: number | null): string {
  if (!duration) return "Self-paced";
  const h = Math.floor(duration / 60);
  const m = duration % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

function getLevelColor(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("begin") || l.includes("intro"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (l.includes("inter") || l.includes("mid"))
    return "bg-blue-50 text-blue-700 border-blue-200";
  if (l.includes("advanc") || l.includes("expert"))
    return "bg-violet-50 text-violet-700 border-violet-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
}

// ─── Cart state ───────────────────────────────────────────────────────────────

type CartState = "idle" | "loading" | "added";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CourseCardProps {
  course: Course;
  priority?: boolean;
  index?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CourseCard({
  course,
  priority = false,
  index = 0,
}: CourseCardProps) {
  const { addItem, isInCart } = useCart();

  const pricings = getActivePricings(course);
  const lowestPricing = getLowestPricing(pricings);
  const hasMultiple = pricings.length > 1;

  const href = buildCourseHref(course);
  const duration = getDurationLabel(course.duration ?? null);
  const shouldPrio = priority || index < 4;

  // Local cart animation state
  const [cartState, setCartState] = useState<CartState>("idle");
  // Pricing sheet visibility
  const [sheetOpen, setSheetOpen] = useState(false);
  // Which pricing is highlighted in the sheet
  const [selectedId, setSelectedId] = useState<string>(lowestPricing?.id ?? "");

  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Derived: is the currently-selected pricing already in cart?
  const selectedPricing =
    pricings.find((p) => p.id === selectedId) ?? lowestPricing;
  const alreadyInCart = selectedPricing ? isInCart(selectedPricing.id) : false;

  const effectiveState: CartState = alreadyInCart ? "added" : cartState;

  // Clean up timer on unmount
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    []
  );

  // ── Core add action (called after pricing is decided) ──────────────────────
  const doAddToCart = useCallback(
    (pricing: CoursePricing) => {
      if (isInCart(pricing.id)) {
        setCartState("added");
        return;
      }

      setCartState("loading");
      // Sync add — if your store is async, await here
      addItem({
        courseId: course.id,
        pricingId: pricing.id,
        title: course.title,
        thumbnail: course.thumbnail ?? null,
        price: pricing.price,
        currency: pricing.currency,
        quantity: 1,
        // duration: course.duration ?? null,
      });

      setTimeout(() => {
        setCartState("added");
        resetTimer.current = setTimeout(() => setCartState("idle"), 2500);
      }, 400);
    },
    [addItem, course, isInCart]
  );

  // ── Button click handler ───────────────────────────────────────────────────
  const handleCartClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!pricings.length || effectiveState !== "idle") return;

      if (hasMultiple) {
        // Open pricing selector — user must choose
        setSheetOpen(true);
      } else if (lowestPricing) {
        // Single pricing — add immediately
        doAddToCart(lowestPricing);
      }
    },
    [pricings.length, effectiveState, hasMultiple, lowestPricing, doAddToCart]
  );

  // ── Sheet confirm ──────────────────────────────────────────────────────────
  const handleSheetConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedPricing) return;
      doAddToCart(selectedPricing);
      setSheetOpen(false);
    },
    [selectedPricing, doAddToCart]
  );

  const handleSheetClose = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSheetOpen(false);
  }, []);

  return (
    <>
      <Link
        href={`/courses/${course.program?.slug}/${course.slug}`}
        aria-label={`View course: ${course.title}`}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl bg-white",
          "border border-slate-200/80",
          "shadow-[0_1px_4px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.04)]",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1.5",
          "hover:border-blue-200",
          "hover:shadow-[0_12px_36px_rgba(37,99,235,0.12),0_3px_10px_rgba(0,0,0,0.07)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        )}
      >
        {/* ── Thumbnail ─────────────────────────────────────────────────── */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={course.thumbnail ?? FALLBACK_IMAGE}
            alt={`${course.title} thumbnail`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            priority={shouldPrio}
            quality={80}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

          {/* Level pill */}
          {course.level && (
            <div className="absolute right-3 top-3 z-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
                  "font-mono text-[10px] uppercase tracking-wide backdrop-blur-sm",
                  getLevelColor(course.level)
                )}
              >
                <Signal className="h-2.5 w-2.5" />
                {course.level}
              </span>
            </div>
          )}

          {/* Arrow chip */}
          <div
            className={cn(
              "absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full",
              "bg-blue-600 shadow-lg shadow-blue-500/40",
              "-translate-x-1 opacity-0 transition-all duration-200",
              "group-hover:translate-x-0 group-hover:opacity-100"
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-white" />
          </div>

          {/* New badge */}
          {isNew(course.createdAt) && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white shadow-sm">
                New
              </span>
            </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-3 p-4 pb-5">
          {course.program?.title && (
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-blue-500">
              {course.program.title}
            </p>
          )}

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-800 transition-colors duration-150 group-hover:text-blue-700">
            {course.title}
          </h3>

          {course.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
              {course.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-300" />
              {duration}
            </span>
            {(course.modules?.length ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-300" />
                {course.modules!.length} modules
              </span>
            )}
          </div>

          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-2 border-slate-100 bg-slate-50 px-2.5 py-0.5 font-mono text-[10px] text-slate-400 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Footer ── */}
          <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
            {/* Price display */}
            {lowestPricing ? (
              <div className="flex flex-col leading-none">
                {hasMultiple && (
                  <span className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                    from
                  </span>
                )}
                <span className="text-lg font-bold text-blue-600">
                  {formatPrice(lowestPricing.price, lowestPricing.currency)}
                </span>
                {!hasMultiple && lowestPricing.durationDays > 0 && (
                  <span className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {lowestPricing.durationDays}-day access
                  </span>
                )}
                {hasMultiple && (
                  <span className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {pricings.length} plans available
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-400">Free</span>
            )}

            {/* Cart button — counters card lift with group-hover:translate-y-1.5 */}
            <button
              type="button"
              onClick={handleCartClick}
              disabled={effectiveState !== "idle" || !pricings.length}
              aria-label={
                effectiveState === "added"
                  ? "Added to cart"
                  : effectiveState === "loading"
                  ? "Adding to cart"
                  : hasMultiple
                  ? "Choose a plan"
                  : "Add to cart"
              }
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5",
                "font-mono text-[11px] font-semibold select-none",
                // Counter-translate: button stays still while card lifts
                "transition-all duration-300 group-hover:translate-y-1.5",
                effectiveState === "idle" && [
                  "border border-slate-200 bg-slate-50 text-slate-500",
                  "hover:border-blue-500 hover:bg-blue-600 hover:text-white hover:shadow-md hover:shadow-blue-500/25",
                  "active:scale-95",
                ],
                effectiveState === "loading" &&
                  "border border-blue-200 bg-blue-50 text-blue-400 cursor-wait",
                effectiveState === "added" &&
                  "border border-emerald-200 bg-emerald-50 text-emerald-600 cursor-default",
                !pricings.length && "pointer-events-none opacity-40"
              )}
            >
              {effectiveState === "idle" && (
                <>
                  <ShoppingCart className="h-3 w-3" />
                  {hasMultiple ? "Choose plan" : "Add to cart"}
                </>
              )}
              {effectiveState === "loading" && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Adding…
                </>
              )}
              {effectiveState === "added" && (
                <>
                  <Check className="h-3 w-3" strokeWidth={3} />
                  In cart
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom-rule on hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500/0 transition-transform duration-300 group-hover:scale-x-100" />
      </Link>

      {/* ── Pricing Sheet (rendered outside Link to avoid nesting issues) ── */}
      {/* {hasMultiple && (
        <PricingSheet
          open={sheetOpen}
          course={course}
          pricings={pricings}
          selectedId={selectedId}
          lowestId={lowestPricing?.id ?? ""}
          onSelect={setSelectedId}
          onConfirm={handleSheetConfirm}
          onClose={handleSheetClose}
          cartState={effectiveState}
        />
      )} */}
    </>
  );
}

// ─── PricingSheet ──────────────────────────────────────────────────────────────
// Slides up from the bottom — works on both mobile and desktop.
// Rendered in a portal-like pattern (sibling to Link, not inside it).

// interface PricingSheetProps {
//   open: boolean;
//   course: Course;
//   pricings: CoursePricing[];
//   selectedId: string;
//   lowestId: string;
//   onSelect: (id: string) => void;
//   onConfirm: (e: React.MouseEvent) => void;
//   onClose: (e: React.MouseEvent) => void;
//   cartState: CartState;
// }

// function PricingSheet({
//   open,
//   course,
//   pricings,
//   selectedId,
//   lowestId,
//   onSelect,
//   onConfirm,
//   onClose,
//   cartState,
// }: PricingSheetProps) {
//   const selected = pricings.find((p) => p.id === selectedId);

//   // Close on Escape
//   useEffect(() => {
//     if (!open) return;
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onClose(e as any);
//     };
//     window.addEventListener("keydown", handler);
//     return () => window.removeEventListener("keydown", handler);
//   }, [open, onClose]);

//   if (!open) return null;

//   return (
//     // Full-screen overlay
//     <div
//       className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
//       role="dialog"
//       aria-modal="true"
//       aria-label={`Choose a plan for ${course.title}`}
//     >
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
//         onClick={onClose}
//       />

//       {/* Sheet */}
//       <div
//         className={cn(
//           "relative z-10 w-full max-w-sm overflow-hidden",
//           "rounded-t-3xl sm:rounded-2xl",
//           "border border-slate-200 bg-white shadow-2xl",
//           // Slide-up animation
//           "animate-in slide-in-from-bottom-4 duration-300 ease-out"
//         )}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Handle (mobile) */}
//         <div className="flex justify-center pt-3 sm:hidden">
//           <div className="h-1 w-10 rounded-full bg-slate-200" />
//         </div>

//         {/* Header */}
//         <div className="flex items-start justify-between px-5 pb-3 pt-4">
//           <div className="min-w-0 flex-1">
//             <p className="font-mono text-[10px] uppercase tracking-widest text-blue-500">
//               {course.program?.title ?? "Course"}
//             </p>
//             <h3 className="mt-0.5 line-clamp-2 text-base font-bold text-slate-900">
//               {course.title}
//             </h3>
//           </div>
//           <button
//             type="button"
//             onClick={onClose}
//             aria-label="Close"
//             className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
//           >
//             <X className="h-4 w-4" />
//           </button>
//         </div>

//         {/* Divider */}
//         <div className="mx-5 border-t border-slate-100" />

//         {/* Plan list */}
//         <div className="space-y-2 px-5 py-4">
//           <p className="mb-3 text-xs font-semibold text-slate-500">
//             Select a plan to continue
//           </p>

//           {pricings.map((p) => {
//             const isSelected = p.id === selectedId;
//             const isBest = p.id === lowestId;

//             return (
//               <button
//                 key={p.id}
//                 type="button"
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onSelect(p.id);
//                 }}
//                 className={cn(
//                   "group relative flex w-full items-center rounded-xl border-2 px-4 py-3 text-left transition-all duration-150",
//                   isSelected
//                     ? "border-blue-600 bg-blue-50 shadow-sm"
//                     : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
//                 )}
//               >
//                 {/* Radio */}
//                 <span
//                   className={cn(
//                     "mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
//                     isSelected
//                       ? "border-blue-600 bg-blue-600"
//                       : "border-slate-300 group-hover:border-blue-400"
//                   )}
//                 >
//                   {isSelected && (
//                     <Check className="h-3 w-3 text-white" strokeWidth={3} />
//                   )}
//                 </span>

//                 {/* Info */}
//                 <div className="min-w-0 flex-1">
//                   <p
//                     className={cn(
//                       "truncate text-sm font-semibold",
//                       isSelected ? "text-blue-700" : "text-slate-800"
//                     )}
//                   >
//                     {p.name ?? `Plan ${pricings.indexOf(p) + 1}`}
//                   </p>
//                   {p.durationDays > 0 && (
//                     <p className="mt-0.5 text-xs text-slate-400">
//                       {p.durationDays}-day access
//                     </p>
//                   )}
//                 </div>

//                 {/* Price */}
//                 <p
//                   className={cn(
//                     "ml-3 shrink-0 text-base font-bold",
//                     isSelected ? "text-blue-600" : "text-slate-700"
//                   )}
//                 >
//                   {formatPrice(p.price, p.currency)}
//                 </p>

//                 {/* Best value badge */}
//                 {isBest && pricings.length > 1 && (
//                   <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-900 shadow-sm">
//                     <Zap className="h-2.5 w-2.5" />
//                     Best value
//                   </span>
//                 )}
//               </button>
//             );
//           })}
//         </div>

//         {/* CTA */}
//         <div className="border-t border-slate-100 px-5 pb-6 pt-4">
//           <button
//             type="button"
//             onClick={onConfirm}
//             disabled={!selected || cartState === "loading"}
//             className={cn(
//               "flex h-12 w-full items-center justify-center gap-2 rounded-xl",
//               "bg-blue-600 font-semibold text-white",
//               "shadow-md shadow-blue-500/20 transition-all",
//               "hover:bg-blue-700 active:scale-[0.98]",
//               "disabled:cursor-not-allowed disabled:opacity-60"
//             )}
//           >
//             {cartState === "loading" ? (
//               <>
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 Adding to cart…
//               </>
//             ) : (
//               <>
//                 <ShoppingCart className="h-4 w-4" />
//                 Add to cart
//                 {selected && (
//                   <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
//                     {formatPrice(selected.price, selected.currency)}
//                   </span>
//                 )}
//                 <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
//               </>
//             )}
//           </button>

//           <p className="mt-3 text-center text-xs text-slate-400">
//             30-day money-back guarantee
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
