"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Trash2,
  Lock,
  ShieldCheck,
  Tag,
  Clock,
  PlayCircle,
  Star,
  BookOpen,
  Layers,
  Check,
  ChevronRight,
} from "lucide-react";
import { useCart } from "@/store/cart.store";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { formatDuration } from "@/components/admin/course-workspace/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItemData {
  pricingId: string;
  courseId: string;
  title: string;
  thumbnail: string;
  price: number;
  currency: string;
  quantity: number;
  instructor?: string;
  level?: string;
  durationSeconds?: number;
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
  duration?: number | null;
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
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
};

// ─── Level badge ──────────────────────────────────────────────────────────────

function LevelBadge({ level }: { level?: string }) {
  if (!level) return null;

  const styles: Record<string, string> = {
    BEGINNER: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    INTERMEDIATE: "bg-amber-50 text-amber-800 border-amber-200/60",
    ADVANCED: "bg-rose-50 text-rose-800 border-rose-200/60",
    PROFESSIONAL: "bg-indigo-50 text-indigo-800 border-indigo-200/60",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${
        styles[level] ?? "bg-slate-50 text-slate-700 border-slate-200/60"
      }`}
    >
      {level}
    </span>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyCart({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <ShoppingBag className="h-6 w-6 text-slate-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Your cart is empty
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          Choose a course and start building the skills you need. Everything you
          add will appear here.
        </p>

        <button
          onClick={onBrowse}
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-medium cursor-pointer text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
        >
          Browse courses
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Cart Item ────────────────────────────────────────────────────────────────

interface CartItemProps {
  item: CartItemData;
  onRemove: () => void;
}

function CartItemRow({ item, onRemove }: CartItemProps) {

  console.log("Rendering CartItemRow for item:", item);
  return (
    <article className="group flex gap-4 border-b border-slate-100 py-6 last:border-0 sm:gap-5">
      {/* Thumbnail */}
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:h-24 sm:w-36">
        {item.thumbnail ? (
          <Image
            src={item.thumbnail}
            alt=""
            fill
            className="object-cover"
            sizes="144px"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-7 w-7 text-slate-300" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-medium leading-snug text-slate-900 line-clamp-2">
              {item.title}
            </h3>
            {item.instructor && (
              <p className="mt-0.5 text-sm text-slate-500">
                {item.instructor}
              </p>
            )}
          </div>

          <button
            onClick={onRemove}
            aria-label={`Remove ${item.title} from cart`}
            className="shrink-0 rounded-lg p-2 text-red-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <LevelBadge level={item.level} />
          {item.durationSeconds && (
            <span className="flex items-center font-bold gap-1 text-xs text-slate-500">
              Total duration:{" "}
              {/* <Clock className="h-3.5 w-3.5" aria-hidden /> */}
              {formatDuration(item.durationSeconds)}
            </span>
          )}
          {item.topicCount != null && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <PlayCircle className="h-3.5 w-3.5" aria-hidden />
              {item.topicCount} lessons
            </span>
          )}
          {item.moduleCount != null && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Layers className="h-3.5 w-3.5" aria-hidden />
              {item.moduleCount} modules
            </span>
          )}
        </div>

        {/* Includes + Price */}
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="hidden items-center font-semibold gap-4 text-xs text-slate-500 sm:flex">
            {item.price === 0 ? (
              <ArrowRight className="h-3.5 w-3.5 text-blue-400" aria-hidden />
            ) : (
              <Star className="h-3.5 w-3.5 text-slate-400" aria-hidden /> 
            )}
            <span>Lifetime access</span>
          </div>
          <div className="flex items-center gap-2">
            {item.price === 0 ? (
              <span className="text-sm font-bold text-blue-600">Free</span>
            ) : (
              <p className="text-base font-semibold tabular-nums text-slate-900">
                {fmt(item.price * item.quantity, item.currency)}
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Recommended course ───────────────────────────────────────────────────────

function RecommendedCard({ course }: { course: RecommendedCourse }) {
  const href =
    course.program?.slug && course.slug
      ? `/courses/${course.program.slug}/${course.slug}`
      : `/courses/${course.id}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, 33vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-medium leading-snug text-slate-900 line-clamp-2">
          {course.title}
        </h3>

        {course.instructor && (
          <p className="text-xs text-slate-500">{course.instructor}</p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm font-semibold tabular-nums text-slate-900">
            {fmt(course.price, course.currency)}
          </span>
          <span className="flex items-center gap-0.5 text-xs font-medium text-slate-500 transition group-hover:text-slate-800">
            View
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Recommendations ──────────────────────────────────────────────────────────

function RecommendationSection({
  cartItems,
  allCourses,
}: {
  cartItems: CartItemData[];
  allCourses: RecommendedCourse[];
}) {
  const cartIds = new Set(cartItems.map((i) => i.courseId));

  // Simple relevance: exclude items already in cart, take first 3.
  // Extend scoring when tags/category become available on RecommendedCourse.
  const recommendations = allCourses
    .filter((c) => !cartIds.has(c.id))
    .slice(0, 3);

  if (recommendations.length === 0) return null;

  return (
    <section aria-labelledby="recommendations-heading" className="mt-20 border-t border-slate-100 pt-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2
            id="recommendations-heading"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            You might also like
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Courses that pair well with what’s in your cart
          </p>
        </div>
        <Link
          href="/courses"
          className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex sm:items-center sm:gap-1"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((course) => (
          <RecommendedCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CartPageProps {
  recommendedCourses?: RecommendedCourse[];
}

export default function CartPage({ recommendedCourses = [] }: CartPageProps) {
  const router = useRouter();
  const { items, removeItem, getTotal } = useCart();


  const subtotal = useMemo(() => getTotal(), [getTotal]);
  const courseCount = items.length;

  if (courseCount === 0) {
    return (
      <div className="min-h-screen bg-[#fafaf9] text-slate-900">
        <Navbar />
        <EmptyCart onBrowse={() => router.push("/courses")} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        {/* Page header */}
        <header className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Cart
          </h1> 
          <p className="mt-1.5 text-sm text-slate-500">
            {courseCount} {courseCount === 1 ? "course" : "courses"}
          </p>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          {/* Cart items */}
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 sm:px-6">
              {items.map((item) => (
                <CartItemRow
                  key={item.pricingId}
                  item={item as CartItemData}
                  onRemove={() => removeItem(item.pricingId)}
                />
              ))}
            </div>
          </div>

          {/* Order summary */}
          <aside
            className="w-full shrink-0 lg:sticky lg:top-8 lg:w-[340px]"
            aria-label="Order summary"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">
                Order summary
              </h2>

              <div className="mt-5 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.pricingId}
                    className="flex items-start justify-between gap-3 text-sm"
                  >
                    <span className="line-clamp-2 text-slate-600">
                      {item.title}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums text-slate-900">
                      {fmt(item.price * item.quantity, item.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="my-5 h-px bg-slate-100" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium tabular-nums text-slate-900">
                    {fmt(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount</span>
                  <span className="text-slate-400">—</span>
                </div>
              </div>

              <div className="mt-5 flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-900">Total</span>
                <span className="text-xl font-semibold tabular-nums text-slate-900">
                  {fmt(subtotal)}
                </span>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
              >
                Proceed to checkout
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                You won’t be charged yet
              </p>

              <button
                disabled
                title="Coupon codes coming soon"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-medium text-slate-400 disabled:cursor-not-allowed"
              >
                <Tag className="h-3.5 w-3.5" />
                Apply coupon
              </button>

              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" aria-hidden />
                  Secure
                </span>
                <span className="h-3 w-px bg-slate-200" />
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Encrypted
                </span>
              </div>
            </div>
          </aside>
        </div>

        {recommendedCourses.length > 0 && (
          <RecommendationSection
            cartItems={items as CartItemData[]}
            allCourses={recommendedCourses}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}