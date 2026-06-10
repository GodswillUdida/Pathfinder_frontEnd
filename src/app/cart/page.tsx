"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, ShoppingBag, Trash2, LockIcon,
  ShieldCheckIcon, Tag, Clock, BarChart2,
  PlayCircle, Star, BookOpen, Layers, Zap,
  CheckCircle2, ChevronRight,
} from "lucide-react";
import { useCart } from "@/store/cart.store";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemData {
  pricingId: string;
  courseId: string;
  title: string;
  thumbnail: string;
  price: number;
  currency: string;
  quantity: number;
  // Extended fields — populated from course data if available
  instructor?: string;
  level?: string;
  duration?: string;
  moduleCount?: number;
  topicCount?: number;
  rating?: number;
  category?: string;
  tags?: string[];
}

interface RecommendedCourse {
  id: string;
  title: string;
  thumbnail?: string | null;
  instructor?: string;
  level?: string;
  duration?: string;
  price: number;
  currency: string;
  rating?: number;
  topicCount?: number;
  slug?: string;
  program?: { slug?: string };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const fmt = (n: number, currency = "NGN"): string => {
  if (currency === "NGN") return NGN.format(Math.round(n));
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.round(n));
};

// ─── Level styles ──────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Beginner: { bg: "rgba(34,197,94,0.08)", color: "#15803d", border: "rgba(34,197,94,0.2)" },
  Intermediate: { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.2)" },
  Advanced: { bg: "rgba(239,68,68,0.08)", color: "#b91c1c", border: "rgba(239,68,68,0.2)" },
};

function getLevelStyle(level?: string) {
  return LEVEL_STYLES[level ?? ""] ?? { bg: "rgba(99,102,241,0.08)", color: "#4f46e5", border: "rgba(99,102,241,0.2)" };
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6">
      <div className="relative">
        <div
          className="absolute inset-0 scale-150 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #c7d2fe 0%, transparent 70%)" }}
        />
        <div
          className="relative flex h-24 w-24 items-center justify-center rounded-3xl"
          style={{
            background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            border: "0.5px solid rgba(99,102,241,0.2)",
            boxShadow: "0 8px 32px -8px rgba(99,102,241,0.2)",
          }}
        >
          <ShoppingBag className="h-10 w-10" style={{ color: "#6366f1" }} strokeWidth={1.5} />
        </div>
      </div>

      <div className="text-center">
        <h2
          className="text-3xl font-bold tracking-tight"
          style={{
            color: "var(--text-primary, #0f1117)",
            fontFamily: "var(--font-display, 'Syne', sans-serif)",
          }}
        >
          Your cart is empty
        </h2>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed" style={{ color: "#64748b" }}>
          The next chapter of your professional journey awaits. Pick a course and start learning today.
        </p>
      </div>

      <button
        onClick={onBrowse}
        className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-semibold text-white transition-all duration-300 active:scale-[0.98] cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
          boxShadow: "0 8px 24px -4px rgba(99,102,241,0.4)",
        }}
      >
        Browse courses
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Cart Item ────────────────────────────────────────────────────────────────

interface CartItemProps {
  item: CartItemData;
  index: number;
  onRemove: () => void;
}

function CartItemCard({ item, index, onRemove }: CartItemProps) {
  const levelStyle = getLevelStyle(item.level);

  return (
    <div
      className="group relative flex gap-5 overflow-hidden rounded-3xl border transition-all duration-300"
      style={{
        background: "#ffffff",
        borderColor: "#f1f0ec",
        boxShadow: "0 2px 12px -4px rgba(0,0,0,0.06)",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Thumbnail */}
      {/* <div className="relative h-full w-[160px] shrink-0 overflow-hidden sm:w-[180px]">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            width={200}
            height={700}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="180px"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)" }}
          >
            <BookOpen className="h-10 w-10" style={{ color: "#262e53" }} />
          </div>
        )}
     
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.1) 100%)" }}
        />
      </div> */}
      <div className="relative w-[160px] sm:w-[180px] aspect-[4/3] shrink-0 overflow-hidden rounded-2xl">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="180px"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
            }}
          >
            <BookOpen className="h-10 w-10" style={{ color: "#262e53" }} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 py-5 pr-5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p
              className="text-[15px] font-bold leading-snug line-clamp-2 font-['Inter']"
              style={{
                color: "#0f1117",
                // fontFamily: "var(--font-display, 'Syne', sans-serif)",
              }}
            >
              {item.title}
            </p>
            {item.instructor && (
              <p className="mt-1 text-[12px] font-medium" style={{ color: "#94a3b8" }}>
                by {item.instructor}
              </p>
            )}
          </div>

          {/* Remove */}
          <button
            onClick={onRemove}
            aria-label={`Remove ${item.title} from cart`}
            className="shrink-0 opacity-0 group-hover:opacity-100 flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-150 hover:bg-red-50"
            style={{ borderColor: "#fee2e2", color: "#ef4444" }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Course meta chips */}
        <div className="flex flex-wrap items-center gap-2">
          {item.level && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{
                background: levelStyle.bg,
                color: levelStyle.color,  
                border: `0.5px solid ${levelStyle.border}`,
              }}
            >
              {item.level}
            </span>
          )}
          {item.duration && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
              <Clock className="h-3 w-3" aria-hidden="true" />
              {item.duration}
            </span>
          )}
          {item.topicCount && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
              <PlayCircle className="h-3 w-3" aria-hidden="true" />
              {item.topicCount} lessons
            </span>
          )}
          {item.moduleCount && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
              <Layers className="h-3 w-3" aria-hidden="true" />
              {item.moduleCount} modules
            </span>
          )}
        </div>

        {/* Includes highlights */}
        <div className="flex flex-wrap gap-3">
          {[
            "Certificate of completion",
            "Watch on any device",
          ].map((highlight) => (
            <span key={highlight} className="flex items-center gap-1.5 text-[11px] font-['Inter']" style={{ color: "#64748b" }}>
              <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: "#22c55e" }} aria-hidden="true" />
              {highlight}
            </span>
          ))}
        </div>

        {/* Price row */}
        <div className="mt-auto flex items-center justify-between border-t pt-3" style={{ borderColor: "#f8f8f6" }}>
          <div className="flex items-baseline gap-2">
            <span
              className="text-[20px] font-bold tabular-nums font-['Inter']"
              style={{
                color: "#0f1117",
                // fontFamily: "var(--font-display, 'Syne', sans-serif)",
              }}
            >
              {fmt(item.price * item.quantity, item.currency)}
            </span>
          </div>

          {/* Mobile remove */}
          <button
            onClick={onRemove}
            aria-label={`Remove ${item.title}`}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-medium transition-all duration-150 hover:bg-red-50 sm:hidden"
            style={{ borderColor: "#fee2e2", color: "#ef4444" }}
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Recommended course card ──────────────────────────────────────────────────

function RecommendedCard({ course }: { course: RecommendedCourse }) {
  const href = course.program?.slug && course.slug
    ? `/courses/${course.program.slug}/${course.slug}`
    : `/courses/${course.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-3xl border transition-all duration-300 hover:border-indigo-200 hover:shadow-lg"
      style={{
        background: "#ffffff",
        borderColor: "#f1f0ec",
        boxShadow: "0 2px 12px -4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)" }}
          >
            <BookOpen className="h-10 w-10" style={{ color: "#a5b4fc" }} />
          </div>
        )}

        {/* Hover play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/20">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100 scale-75"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <PlayCircle className="h-5 w-5" style={{ color: "#4f46e5" }} />
          </div>
        </div>

        {/* Level badge */}
        {course.level && (() => {
          const s = getLevelStyle(course.level);
          return (
            <div
              className="absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
              style={{ background: s.bg, color: s.color, border: `0.5px solid ${s.border}`, backdropFilter: "blur(4px)" }}
            >
              {course.level}
            </div>
          );
        })()}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p
          className="text-[13px] font-bold leading-snug line-clamp-2"
          style={{ color: "#0f1117", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
        >
          {course.title}
        </p>
        {course.instructor && (
          <p className="text-[11px]" style={{ color: "#94a3b8" }}>
            by {course.instructor}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {course.rating && (
            <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "#f59e0b" }}>
              <Star className="h-3 w-3 fill-current" aria-hidden="true" />
              {course.rating.toFixed(1)}
            </span>
          )}
          {course.duration && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
              <Clock className="h-3 w-3" aria-hidden="true" />
              {course.duration}
            </span>
          )}
          {course.topicCount && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
              <PlayCircle className="h-3 w-3" aria-hidden="true" />
              {course.topicCount}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t" style={{ borderColor: "#f8f8f6" }}>
          <span
            className="text-[16px] font-bold tabular-nums"
            style={{ color: "#0f1117", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
          >
            {fmt(course.price, course.currency)}
          </span>
          <span
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all duration-200"
            style={{
              background: "rgba(99,102,241,0.06)",
              color: "#4f46e5",
              border: "0.5px solid rgba(99,102,241,0.2)",
            }}
          >
            View course
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Recommendations section ──────────────────────────────────────────────────

interface RecommendationSectionProps {
  cartItems: CartItemData[];
  /**
   * All courses from the catalogue.
   * Pass the full list — this component filters by tags/category against cart.
   */
  allCourses: RecommendedCourse[];
}

function RecommendationSection({ cartItems, allCourses }: RecommendationSectionProps) {
  // Derive tags and categories from cart
  const cartIds = new Set(cartItems.map((i) => i.courseId));
  const cartTags = new Set(cartItems.flatMap((i) => i.tags ?? []));
  const cartCats = new Set(cartItems.map((i) => i.category).filter(Boolean));

  // Score each course: +2 for matching tag, +1 for matching category
  const scored = allCourses
    .filter((c) => !cartIds.has(c.id))
    .map((c) => {
      let score = 0;
      // Note: RecommendedCourse doesn't have tags/category in its type — extend if available
      return { course: c, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.course);

  if (scored.length === 0) return null;

  return (
    <section aria-labelledby="recommendations-heading" className="mt-16">
      {/* Section header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{ background: "rgba(99,102,241,0.1)" }}
            >
              <Zap className="h-3.5 w-3.5" style={{ color: "#6366f1" }} aria-hidden="true" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: "#94a3b8" }}>
              Curated for you
            </span>
          </div>
          <h2
            id="recommendations-heading"
            className="text-[28px] font-bold tracking-tight"
            style={{
              color: "#0f1117",
              fontFamily: "var(--font-display, 'Syne', sans-serif)",
            }}
          >
            Continue your journey
          </h2>
          <p className="mt-1.5 text-[14px]" style={{ color: "#64748b" }}>
            Courses that complement what you're already learning
          </p>
        </div>

        <Link
          href="/courses"
          className="hidden items-center gap-1.5 rounded-xl px-4 py-2 text-[12px] font-semibold transition-all sm:flex"
          style={{
            color: "#4f46e5",
            border: "0.5px solid rgba(99,102,241,0.25)",
            background: "rgba(99,102,241,0.04)",
          }}
        >
          Browse all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {scored.map((course) => (
          <RecommendedCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CartPageProps {
  /**
   * Recommended courses from your catalogue (passed from server or SWR).
   * Defaults to [] if not provided.
   */
  recommendedCourses?: RecommendedCourse[];
}

export default function CartPage({ recommendedCourses = [] }: CartPageProps) {
  const router = useRouter();
  const { items, removeItem, getTotal } = useCart();

  const subtotal = useMemo(() => getTotal(), [getTotal, items]);
  const courseCount = items.length;

  // ── Empty cart ─────────────────────────────────────────────────────────────

  if (courseCount === 0) {
    return (
      <div className="min-h-screen" style={{ background: "#faf9f6", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
        <Navbar />
        <EmptyCart onBrowse={() => router.push("/courses")} />
        <Footer />
      </div>
    );
  }

  // ── Filled cart ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ background: "#faf9f6", fontFamily: "var(--font-body, 'DM Sans', sans-serif)" }}>
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">

        {/* ── Page title ──────────────────────────────────────────────────── */}
        <div className="mb-10">
          <h1
            className="text-[36px] font-bold tracking-tight sm:text-[44px] font-['Poppins']"
            style={{
              color: "#0f1117",
              // fontFamily: "var(--font-display, 'Syne', sans-serif)",
            }}
          >
            Your learning{" "}
            <span style={{ color: "#6366f1" }}>bundle</span>
          </h1>
          <p className="mt-2 text-[14px] font-['Inter'] " style={{ color: "#545a63" }}>
            {courseCount} {courseCount === 1 ? "course" : "courses"} ready to unlock
          </p>
        </div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* Left — cart items */}
          <div className="flex-1 min-w-0 space-y-4">
            {items.map((item, i) => (
              <CartItemCard
                key={item.pricingId}
                item={item as CartItemData}
                index={i}
                onRemove={() => removeItem(item.pricingId)}
              />
            ))}
          </div>

          {/* Right — sticky order summary */}
          <aside
            className="w-full shrink-0 lg:sticky lg:top-8 lg:w-[360px] xl:w-[400px]"
            aria-label="Order summary"
          >
            <div
              className="overflow-hidden rounded-3xl border"
              style={{
                background: "#ffffff",
                borderColor: "#f1f0ec",
                boxShadow: "0 16px 48px -12px rgba(0,0,0,0.1)",
              }}
            >
              {/* Summary header */}
              <div
                className="px-6 py-5 border-b"
                style={{
                  background: "linear-gradient(135deg, #f8faff 0%, #f3f0ff 100%)",
                  borderColor: "#ede9fe",
                }}
              >
                <p
                  className="text-[18px] font-bold tracking-tight font-['Inter']"
                  style={{
                    color: "#0f1117",
                    // fontFamily: "var(--font-display, 'Syne', sans-serif)"
                  }}
                >
                  Order summary
                </p>
                <p className="mt-0.5 text-[12px] font-['Poppins']" style={{ color: "#94a3b8" }}>
                  Review your learning investment
                </p>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Line items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.pricingId} className="flex items-center justify-between gap-3">
                      <span
                        className="line-clamp-1 flex-1 text-[13px] font-['Inter']"
                        style={{ color: "#475569" }}
                      >
                        {item.title}
                      </span>
                      <span
                        className="shrink-0 tabular-nums text-[13px] font-semibold font-['Inter']"
                        style={{ color: "#0f1117" }}
                      >
                        {fmt(item.price * item.quantity, item.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px" style={{ background: "#f1f0ec" }} />

                {/* Totals */}
                <div className="space-y-2 font-['Inter']">
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: "#94a3b8" }}>Subtotal</span>
                    <span className="font-medium tabular-nums" style={{ color: "#475569" }}>
                      {fmt(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: "#94a3b8" }}>Discount</span>
                    <span style={{ color: "#94a3b8" }}>—</span>
                  </div>
                </div>

                {/* Grand total */}
                <div
                  className="flex items-baseline justify-between rounded-2xl px-4 py-4"
                  style={{ background: "rgba(99,102,241,0.04)", border: "0.5px solid rgba(99,102,241,0.12)" }}
                >
                  <span
                    className="text-[15px] font-semibold font-['Inter']"
                    style={{ color: "#4f46e5" }}
                  >
                    Total
                  </span>
                  <span
                    className="text-[28px] font-bold tabular-nums font-['Inter']"
                    style={{
                      color: "#0f1117",
                      // fontFamily: "var(--font-display, 'Syne', sans-serif)"
                    }}
                  >
                    {fmt(subtotal)}
                  </span>
                </div>

                {/* Checkout CTA */}
                <button
                  onClick={() => router.push("/checkout")}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-bold text-white transition-all duration-200 active:scale-[0.98] cursor-pointer hover:opacity-80"
                  style={{
                    background: "linear-gradient(135deg, #35379b 0%, #4f46e5 100%)",
                    boxShadow: "0 8px 24px -4px rgba(99,102,241,0.4)",
                  }}
                >
                  <Zap className="h-4 w-4" aria-hidden="true" />
                  Unlock all courses
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p
                  className="flex items-center justify-center gap-1 text-center text-[11px]"
                  style={{ color: "#94a3b8" }}
                >
                  You won't be charged yet
                </p>

                {/* Coupon */}
                <button
                  disabled
                  title="Coupon codes coming soon"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    border: "0.5px solid #e2e8f0",
                    color: "#94a3b8",
                    background: "transparent",
                  }}
                >
                  <Tag className="h-3.5 w-3.5" />
                  Apply coupon code
                </button>

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "#6366f1" }}>
                    <LockIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    Secure checkout
                  </span>
                  <span className="h-3 w-px" style={{ background: "#e2e8f0" }} />
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "#6366f1" }}>
                    <ShieldCheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    SSL encrypted
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Recommendations ─────────────────────────────────────────────── */}
        {recommendedCourses.length > 0 && (
          <RecommendationSection
            cartItems={items as CartItemData[]}
            allCourses={recommendedCourses}
          />
        )}
      </div>

      <Footer />
    </div>
  );
}