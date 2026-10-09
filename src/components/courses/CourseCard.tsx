"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  Clock,
  Signal,
  ShoppingCart,
  ArrowUpRight,
  Check,
  Loader2,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart.store";
import {
  formatPrice,
  getPricings,
  getLowestPricing,
  getPrimaryProgram,
  buildCourseHref,
  getDurationLabel,
  accessLabel,
  getLevelColorClasses,
  isNewCourse,
} from "@/lib/courses";
import type { CourseCatalogItem, CourseCatalogPricing } from "@/types/catalog";

const FALLBACK_IMAGE = "/images/course-placeholder.png";

type CartState = "idle" | "loading" | "added";

interface CourseCardProps {
  course: CourseCatalogItem;
  priority?: boolean;
  index?: number;
}

export function CourseCard({
  course,
  priority = false,
  index = 0,
}: CourseCardProps) {
  const { addItem, isInCart } = useCart();

  const pricings = getPricings(course);
  const lowestPricing = getLowestPricing(pricings);
  const hasMultiple = pricings.length > 1;
  const primaryProgram = getPrimaryProgram(course);

  const href = buildCourseHref(course);
  const durationLabel = getDurationLabel(course.totalDurationSeconds);
  const shouldPrio = priority || index < 4;

  const [cartState, setCartState] = useState<CartState>("idle");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(lowestPricing?.id ?? "");

  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedPricing =
    pricings.find((p) => p.id === selectedId) ?? lowestPricing;
  const alreadyInCart = selectedPricing ? isInCart(selectedPricing.id) : false;
  const effectiveState: CartState = alreadyInCart ? "added" : cartState;

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const doAddToCart = useCallback(
    (pricing: CourseCatalogPricing) => {
      if (isInCart(pricing.id)) {
        setCartState("added");
        return;
      }

      setCartState("loading");
      addItem({
        courseId: course.id,
        pricingId: pricing.id,
        title: course.title,
        thumbnail: course.thumbnail ?? null,
        // No instructor join on this endpoint — fetch separately if
        // the cart/checkout UI needs a name.
        instructor: null,
        price: Number(pricing.price),
        currency: pricing.currency,
        quantity: 1,
        durationSeconds: course.totalDurationSeconds,
      });

      setTimeout(() => {
        setCartState("added");
        resetTimer.current = setTimeout(() => setCartState("idle"), 2500);
      }, 400);
    },
    [addItem, course, isInCart, setCartState],
  );

  const handleCartClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!pricings.length || effectiveState !== "idle") return;

      if (hasMultiple) {
        setSheetOpen(true);
      } else if (lowestPricing) {
        doAddToCart(lowestPricing);
      }
    },
    [
      pricings.length,
      effectiveState,
      hasMultiple,
      lowestPricing,
      doAddToCart,
      setSheetOpen,
    ],
  );

  const handleSheetConfirm = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedPricing) return;
      doAddToCart(selectedPricing);
      setSheetOpen(false);
    },
    [selectedPricing, doAddToCart, setSheetOpen],
  );

  const handleSheetClose = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSheetOpen(false);
    },
    [setSheetOpen],
  );

  return (
    <>
      <Link
        href={href}
        aria-label={`View course: ${course.title}`}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl bg-white",
          "border border-slate-200/80",
          "shadow-[0_1px_4px_rgba(0,0,0,0.05),0_4px_16px_rgba(0,0,0,0.04)]",
          "transition-all duration-300 ease-out",
          "hover:-translate-y-1.5",
          "hover:border-blue-200",
          "hover:shadow-[0_12px_36px_rgba(37,99,235,0.12),0_3px_10px_rgba(0,0,0,0.07)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        )}
      >
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

          <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />

          {course.level && (
            <div className="absolute right-3 top-3 z-10">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5",
                  "font-mono text-[10px] uppercase tracking-wide backdrop-blur-sm",
                  getLevelColorClasses(course.level),
                )}
              >
                <Signal className="h-2.5 w-2.5" />
                {course.level}
              </span>
            </div>
          )}

          <div
            className={cn(
              "absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full",
              "bg-blue-600 shadow-lg shadow-blue-500/40",
              "-translate-x-1 opacity-0 transition-all duration-200",
              "group-hover:translate-x-0 group-hover:opacity-100",
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5 text-white" />
          </div>

          {isNewCourse(course.createdAt) && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="rounded-full bg-blue-600 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-white shadow-sm">
                New
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 pb-5">
          {primaryProgram && (
            <p className="truncate font-mono text-[10px] uppercase tracking-[0.18em] text-blue-500">
              {primaryProgram.title}
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
              {durationLabel}
            </span>
          </div>

          {course.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border-2 border-slate-100 bg-slate-50 px-2.5 py-0.5 font-mono text-[10px] text-slate-400 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-3">
            {lowestPricing ? (
              <div className="flex flex-col leading-none">
                {hasMultiple && (
                  <span className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-slate-400">
                    from
                  </span>
                )}
                <span className="text-lg font-bold text-blue-600">
                  {lowestPricing.isFree
                    ? "Free"
                    : formatPrice(lowestPricing.price, lowestPricing.currency)}
                </span>
                {!hasMultiple && (
                  <span className="mt-0.5 font-mono text-[10px] text-slate-400">
                    {accessLabel(lowestPricing)}
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
                !pricings.length && "pointer-events-none opacity-40",
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-blue-500 via-blue-400 to-blue-500/0 transition-transform duration-300 group-hover:scale-x-100" />
      </Link>

      {hasMultiple && (
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
      )}
    </>
  );
}

interface PricingSheetProps {
  open: boolean;
  course: CourseCatalogItem;
  pricings: CourseCatalogPricing[];
  selectedId: string;
  lowestId: string;
  onSelect: (id: string) => void;
  onConfirm: (e: React.MouseEvent) => void;
  onClose: (e: React.MouseEvent) => void;
  cartState: CartState;
}
function PricingSheet({
  open,
  course,
  pricings,
  selectedId,
  lowestId,
  onSelect,
  onConfirm,
  onClose,
  cartState,
}: PricingSheetProps) {
  const selected = pricings.find((p) => p.id === selectedId);
  const primaryProgram = getPrimaryProgram(course);

  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose(e as unknown as React.MouseEvent);
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Choose a plan for ${course.title}`}
    >
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0",
          "bg-slate-950/45 backdrop-blur-sm",
          "animate-in fade-in duration-200",
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "relative z-10 w-full max-w-md overflow-hidden",
          "rounded-t-[28px] sm:rounded-[28px]",
          "border border-slate-200/80 bg-white",
          "shadow-[0_30px_100px_-25px_rgba(15,23,42,0.35)]",
          "animate-in slide-in-from-bottom-5 fade-in duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-slate-200" />
        </div>

        {/* ───────────────── Header ───────────────── */}
        <div className="px-5 pb-5 pt-5 sm:px-6 sm:pt-6">
          <div className="flex items-start gap-4">
            {/* Course marker */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
              <ShoppingCart className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                {primaryProgram?.title ?? "Course"}
              </p>

              <h3 className="line-clamp-2 text-[17px] font-bold leading-snug tracking-[-0.02em] text-slate-950">
                {course.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                "text-slate-400",
                "transition-all duration-150",
                "hover:bg-slate-100 hover:text-slate-700",
                "active:scale-95",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Section intro */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-slate-950">
              Choose your access
            </h4>

            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              Select the plan that works best for how long you want access to
              this course.
            </p>
          </div>
        </div>

        {/* ───────────────── Plans ───────────────── */}
        <div className="px-5 pb-5 sm:px-6">
          <div className="space-y-2.5">
            {pricings.map((p, i) => {
              const isSelected = p.id === selectedId;
              const isBest = p.id === lowestId;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(p.id);
                  }}
                  aria-pressed={isSelected}
                  className={cn(
                    "group relative flex w-full items-center gap-3",
                    "rounded-2xl border p-4 text-left",
                    "transition-all duration-200",
                    "cursor-pointer",
                    isSelected
                      ? [
                          "border-slate-950 bg-slate-950",
                          "shadow-[0_10px_30px_-12px_rgba(15,23,42,0.45)]",
                        ]
                      : [
                          "border-slate-200 bg-white",
                          "hover:border-slate-300 hover:bg-slate-50",
                          "hover:shadow-sm",
                        ],
                  )}
                >
                  {/* Radio */}
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      "transition-all duration-200",
                      isSelected
                        ? "border-white bg-white"
                        : "border-slate-300 bg-white group-hover:border-slate-400",
                    )}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-slate-950" />
                    )}
                  </span>

                  {/* Plan information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-sm font-bold tracking-[-0.01em]",
                          isSelected
                            ? "text-white"
                            : "text-slate-900",
                        )}
                      >
                        {p.name ?? `Plan ${i + 1}`}
                      </p>

                      {isBest && pricings.length > 1 && (
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-1.5 py-0.5",
                            "text-[9px] font-bold uppercase tracking-wide",
                            isSelected
                              ? "bg-white/10 text-amber-300"
                              : "bg-amber-50 text-amber-700",
                          )}
                        >
                          Best value
                        </span>
                      )}
                    </div>

                    <p
                      className={cn(
                        "mt-1 text-xs",
                        isSelected
                          ? "text-slate-400"
                          : "text-slate-500",
                      )}
                    >
                      {accessLabel(p)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        "text-base font-bold tracking-[-0.02em]",
                        isSelected
                          ? "text-white"
                          : "text-slate-950",
                      )}
                    >
                      {p.isFree
                        ? "Free"
                        : formatPrice(p.price, p.currency)}
                    </p>

                    {p.isFree && (
                      <p
                        className={cn(
                          "mt-0.5 text-[10px]",
                          isSelected
                            ? "text-emerald-400"
                            : "text-emerald-600",
                        )}
                      >
                        No payment required
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ───────────────── Confirmation ───────────────── */}
        <div className="border-t border-slate-100 bg-slate-50/70 px-5 pb-6 pt-4 sm:px-6">
          {/* Selected plan summary */}
          {selected && (
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Selected
                </p>

                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  {selected.name}
                </p>
              </div>

              <p className="text-sm font-bold text-slate-950">
                {selected.isFree
                  ? "Free"
                  : formatPrice(selected.price, selected.currency)}
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={!selected || cartState === "loading"}
            className={cn(
              "group flex h-14 w-full items-center rounded-2xl px-3",
              "cursor-pointer overflow-hidden",
              "bg-slate-950 text-white",
              "shadow-[0_10px_30px_-12px_rgba(15,23,42,0.5)]",
              "transition-all duration-200",
              "hover:-translate-y-0.5 hover:bg-slate-900",
              "hover:shadow-[0_15px_35px_-12px_rgba(15,23,42,0.6)]",
              "active:translate-y-0 active:scale-[0.99]",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "disabled:hover:translate-y-0",
            )}
          >
            {cartState === "loading" ? (
              <div className="flex w-full items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-semibold">
                  Adding to cart…
                </span>
              </div>
            ) : (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ShoppingCart className="h-4 w-4" />
                </span>

                <span className="ml-3 text-sm font-semibold">
                  Add to cart
                </span>

                {selected && (
                  <span
                    className={cn(
                      "ml-auto mr-2 rounded-lg px-2.5 py-1",
                      "text-xs font-semibold",
                      selected.isFree
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-white/10 text-white/80",
                    )}
                  >
                    {selected.isFree
                      ? "Free"
                      : formatPrice(selected.price, selected.currency)}
                  </span>
                )}

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:bg-white/10 group-hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <Shield className="h-3 w-3" />
            <span>Secure checkout · 30-days money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
}
