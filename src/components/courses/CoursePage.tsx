"use client";

import { useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  PlayCircle,
  Clock,
  Layers,
  ChevronRight,
  BarChart2,
  Tag,
  Star,
  Home,
} from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import type { Course, Module, Topic, CoursePricing } from "@/types/course";
import { fmtSecs, formatPrice, getActivePricings } from "./course.helper";
import Footer from "../layout/Footer";
import { Curriculum } from "./Curriculum";
import { PreviewMedia } from "./PreviewMedia";
import { PricingCard } from "./PricingCard";
import Header from "../layout/Header";
import Navbar from "../layout/Navbar";

// ─── Computed stats ───────────────────────────────────────────────────────────

export interface Stats {
  moduleCount: number;
  topicCount: number;
  totalSeconds: number;
}

function computeStats(modules: Module[]): Stats {
  let topicCount = 0;
  let totalSeconds = 0;

  modules.forEach((mod) => {
    topicCount += mod.topics?.length ?? 0;
    mod.topics?.forEach((t) => {
      totalSeconds += t.durationSeconds ?? 0;
    });
  });

  return { moduleCount: modules.length, topicCount, totalSeconds };
}

interface CoursePageProps {
  course: Course;
  enrolled?: boolean;
}

export default function CoursePage({
  course,
  enrolled = false,
}: CoursePageProps) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();

  const modules: Module[] = course.modules ?? [];
  // const pricings: CoursePricing[] = course.pricings ?? [];
  const pricings = getActivePricings(course);
  // const stats = useMemo(() => computeStats(modules), [modules]);
  const stats = useMemo(
    () => computeStats(course.modules ?? []),
    [course.modules]
  );

  // ── Cart handlers ──────────────────────────────────────────────────────────

  const handleAddToCart = useCallback(
    (p: CoursePricing) => {
      addItem({
        courseId: course.id,
        pricingId: p.id,
        title: course.title,
        thumbnail: course.thumbnail ?? null,
        price: p.price,
        currency: p.currency,
        quantity: 1,
      });
      // router.push("/checkout");
    },
    [course, addItem]
  );

  const handleBuyNow = useCallback(
    (p: CoursePricing) => {
      addItem({
        courseId: course.id,
        pricingId: p.id,
        title: course.title,
        thumbnail: course.thumbnail ?? null,
        price: p.price,
        currency: p.currency,
        quantity: 1,
      });
      router.push("/cart");
    },
    [course, addItem, router]
  );

  return (
    <>
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap");
        .font-poppins {
          font-family: "Poppins", sans-serif;
        }
        .font-inter {
          font-family: "Inter", sans-serif;
        }
      `}</style>

      <div className="font-inter min-h-screen bg-slate-50">
        <Navbar />
        {/* ── Sticky breadcrumb nav ──────────────────────────────────────── */}
        <nav className="sticky top-0 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-slate-500 sm:px-6 lg:px-8">
            <Home className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
            <span>Courses</span>
            {course.program && (
              <>
                <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
                <span className="max-w-[140px] truncate">
                  {course.program.title}
                </span>
              </>
            )}
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
            <span className="max-w-[200px] truncate font-semibold text-slate-800">
              {course.title}
            </span>
          </div>
        </nav>

        {/* ── Dark hero ─────────────────────────────────────────────────── */}
        <div className="border-b border-slate-800 bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-stretch">
              {/* Hero text — left */}
              <div className="flex-1 py-10 lg:pr-12">
                {/* Tags */}
                {course.tags?.length > 0 && (
                  <motion.div
                    // {...fadeUp(0)}
                    className="mb-4 flex flex-wrap gap-2"
                  >
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-blue-500/20 px-2.5 py-0.5 text-xs font-medium text-blue-300 ring-1 ring-inset ring-blue-400/30"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Title */}
                <motion.h1
                  // {...fadeUp(0.05)}
                  className="font-poppins text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl xl:text-[2.75rem]"
                >
                  {course.title}
                </motion.h1>

                {/* Description */}
                <motion.p
                  // {...fadeUp(0.1)}
                  className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300"
                >
                  {course.description}
                </motion.p>

                {/* Stats row */}
                <motion.div
                  // {...fadeUp(0.13)
                  // }
                  className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-300"
                >
                  {course.level && (
                    <span className="flex items-center gap-1.5">
                      <BarChart2 className="h-4 w-4 text-blue-400" />
                      {course.level}
                    </span>
                  )}
                  {stats.moduleCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-blue-400" />
                      {stats.moduleCount} modules
                    </span>
                  )}
                  {stats.topicCount > 0 && (
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="h-4 w-4 text-blue-400" />
                      {stats.topicCount} topics
                    </span>
                  )}
                  {stats.totalSeconds > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-blue-400" />
                      {fmtSecs(stats.totalSeconds)} total
                    </span>
                  )}
                </motion.div>

                {/* Rating */}
                <motion.div className="mt-4 flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-amber-400">
                    5.0
                  </span>
                  <span className="text-sm text-slate-500">(New course)</span>
                </motion.div>
              </div>

              {/* Spacer that reserves room for the overlapping card on desktop */}
              <div className="hidden shrink-0 lg:block lg:w-[340px] xl:w-[376px]" />
            </div>
          </div>
        </div>

        {/* ══ Two-column body ═══════════════════════════════════════════════ */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            {/* ─── Left — scrollable content ────────────────────────────── */}
            <div className="min-w-0 flex-1 space-y-10 py-8">
              <motion.div>
                <PreviewMedia
                  thumbnail={course.thumbnail}
                  videoPreview={course.videoPreview}
                />
              </motion.div>

              <motion.div>
                <Curriculum
                  modules={modules}
                  enrolled={enrolled}
                  stats={stats}
                />
              </motion.div>
            </div>

            {/* ─── Right — sticky pricing card (overlaps hero) ──────────── */}
            <motion.aside className="w-full shrink-0 pb-8 lg:-mt-[280px] lg:sticky lg:top-[74px] lg:w-[340px] xl:w-[376px]">
              <PricingCard
                pricings={pricings}
                enrolled={enrolled}
                stats={stats}
                isInCart={isInCart}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            </motion.aside>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
