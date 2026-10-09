"use client";

import { useMemo, useCallback } from "react";
import {
  PlayCircle, Clock, Layers, ChevronRight,
  BarChart2, Tag, Star, Home, BookOpen,
} from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { syne, dmSans } from "@/lib/fonts";
import type { CoursePublicDetail } from "@/types/catalog";
import type { CoursePricing } from "@/types/domain";
import Footer from "../layout/Footer";
import Navbar from "../layout/Navbar";
import { Curriculum } from "./Curriculum";
import { PreviewMedia } from "./PreviewMedia";
import { PricingCard } from "./PricingCard";
import { getActiveFullPricings, getDurationLabel, getProgramBySlug } from "@/lib/courses";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Stats {
  moduleCount: number;
  topicCount: number;
  totalSeconds: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Trusts the backend-maintained aggregate (Course.totalDurationSeconds)
 * rather than re-summing topic.durationSeconds client-side. The schema
 * explicitly documents totalDurationSeconds as a denormalized aggregate
 * over non-deleted topics only — a naive client reduce over whatever
 * topics happen to be in the response doesn't know about that and can
 * silently drift from the authoritative number.
 */
function computeStats(course: CoursePublicDetail): Stats {
  const modules = course.modules ?? [];
  const topicCount = modules.reduce((sum, mod) => sum + (mod.topics?.length ?? 0), 0);

  return {
    moduleCount: modules.length,
    topicCount,
    totalSeconds: course.totalDurationSeconds,
  };
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({
  icon: Icon, label,
}: {
  icon: React.ElementType; label: string;
}) {
  return (
    <span className="flex items-center gap-2 text-[13px] text-slate-300">
      <Icon className="h-4 w-4 text-indigo-400 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface CoursePageProps {
  course: CoursePublicDetail;
  /** The programSlug segment from the route, used to resolve which of the course's programs the visitor navigated through. */
  programSlug?: string;
  enrolled?: boolean;
}

export default function CoursePage({
  course,
  programSlug,
  enrolled = false,
}: CoursePageProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();

  const modules = course.modules ?? [];
  const pricings = getActiveFullPricings(course.pricings ?? []);
  const stats = useMemo(() => computeStats(course), [course]);
  const program = programSlug ? getProgramBySlug(course, programSlug) : null;

  // ── Cart handlers ──────────────────────────────────────────────────────────

  const handleAddToCart = useCallback(
    (p: CoursePricing) => {
      addItem({
        courseId: course.id,
        pricingId: p.id,
        durationSeconds: course.totalDurationSeconds,
        title: course.title,
        thumbnail: course.thumbnail ?? null,
        price: Number(p.price),
        currency: p.currency,
        instructor: course.instructor?.name ?? null,
        quantity: 1,
      });
    },
    [course, addItem]
  );

  const handleBuyNow = useCallback(
    (p: CoursePricing) => {
      addItem({
        courseId: course.id,
        pricingId: p.id,
        durationSeconds: course.totalDurationSeconds,
        title: course.title,
        thumbnail: course.thumbnail ?? null,
        price: Number(p.price),
        currency: p.currency,
        instructor: course.instructor?.name ?? null,
        quantity: 1,
      });
      router.push("/cart");
    },
    [course, addItem, router]
  );

  const hasTags = (course.tags?.length ?? 0) > 0;

  return (
    <div
      className={cn(dmSans.className, dmSans.variable, syne.variable, "min-h-screen")}
      style={{ background: "#f4f5f7" }}
    >
      <Navbar />

      {/* ── Breadcrumb ────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ background: "rgba(10,12,18,0.97)", borderColor: "rgba(255,255,255,0.06)" }}
        aria-label="Breadcrumb"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-[11px] text-slate-400 sm:px-6 lg:px-8">
          <Home className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-700" aria-hidden="true" />
          <span className="hover:text-slate-200 cursor-pointer transition-colors">Courses</span>
          {program && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0 text-slate-700" aria-hidden="true" />
              <span className="max-w-35 truncate hover:text-slate-200 cursor-pointer transition-colors">
                {program.title}
              </span>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0 text-slate-700" aria-hidden="true" />
          <span className="max-w-60 truncate font-semibold text-slate-200">
            {course.title}
          </span>
        </div>
      </nav>

      {/* ── Hero stage ────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: "#0a0c12" }}>
        {/* Background noise texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial accent glow */}
        <div
          className="pointer-events-none absolute -top-32 left-[30%] h-125 w-125 -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
          style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-stretch">
            {/* Left: hero copy */}
            <div className="flex-1 py-12 lg:py-16 lg:pr-16">

              {/* Tag chips */}
              {hasTags && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide"
                      style={{
                        background: "rgba(99,102,241,0.15)",
                        color: "#a5b4fc",
                        border: "0.5px solid rgba(99,102,241,0.3)",
                      }}
                    >
                      <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1
                className={cn(syne.className, "text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl xl:text-[3.25rem]")}
                style={{ textShadow: "0 2px 24px rgba(0,0,0,0.4)" }}
              >
                {course.title}
              </h1>

              {/* Description */}
              {course.description && (
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed" style={{ color: "#94a3b8" }}>
                  {course.description}
                </p>
              )}

              {/* Rating row */}
              <div className="mt-5 flex items-center gap-3">
                <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-400">5.0</span>
                <span className="text-sm" style={{ color: "#475569" }}>· New course</span>
              </div>

              {/* Stats strip */}
              <div
                className="mt-8 inline-flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl px-6 py-4"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                }}
              >
                {course.level && <StatPill icon={BarChart2} label={course.level} />}
                {stats.moduleCount > 0 && (
                  <StatPill icon={Layers} label={`${stats.moduleCount} modules`} />
                )}
                {stats.topicCount > 0 && (
                  <StatPill icon={PlayCircle} label={`${stats.topicCount} lessons`} />
                )}
                {stats.totalSeconds > 0 && (
                  <StatPill icon={Clock} label={`${getDurationLabel(stats.totalSeconds)} total`} />
                )}
              </div>
            </div>

            {/* Spacer for the overlapping pricing card */}
            <div className="hidden shrink-0 lg:block lg:w-90 xl:w-100" />
          </div>
        </div>
      </div>

      {/* ── Two-column body ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">

          {/* Left — scrollable content */}
          <div className="min-w-0 flex-1 space-y-8 py-4 lg:py-8">

            {/* Preview media */}
            <section aria-label="Course preview">
              <PreviewMedia
                thumbnail={course.thumbnail}
                videoPreview={course.videoPreview}
                title={course.title}
              />
            </section>

            {/* Curriculum */}
            <section aria-label="Course curriculum">
              <div className="mb-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                <h2 className={cn(syne.className, "text-xl font-bold")} style={{ color: "#0f1117" }}>
                  Course curriculum
                </h2>
              </div>
              <Curriculum modules={modules} enrolled={enrolled} stats={stats} />
            </section>
          </div>

          {/* Right — sticky pricing card (overlaps hero) */}
          <aside
            className="w-full shrink-0 pb-8 lg:-mt-65 lg:sticky lg:top-15 lg:w-90 xl:w-100"
            aria-label="Course pricing"
          >
            <PricingCard
              pricings={pricings}
              enrolled={enrolled}
              stats={stats}
              isInCart={isInCart}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}