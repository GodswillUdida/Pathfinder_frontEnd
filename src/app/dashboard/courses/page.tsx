"use client";

import { useState, useMemo } from "react";
import { useEnrollments } from "@/hooks/use-enrollments";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, Clock, Trophy, PlayCircle,
  Loader2, AlertCircle, Search, Eye,
} from "lucide-react";
import { isPast, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Enrollment } from "@/types/dashboard";

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterValue = "all" | "active" | "completed" | "expired";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All",         value: "all" },
  { label: "In progress", value: "active" },
  { label: "Completed",   value: "completed" },
  { label: "Expired",     value: "expired" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getProgress(e: Enrollment): number {
  const total = e.course?.modules?.flatMap((m) => m.topics ?? []).length ?? 0;
  if (!total) return 0;
  const done = (e.progressRecords ?? []).filter((p) => p.completed).length;
  return Math.round((done / total) * 100);
}

function getNextReadyTopic(e: Enrollment) {
  const done = new Set(
    (e.progressRecords ?? []).filter((p) => p.completed).map((p) => p.topicId)
  );
  for (const mod of e.course?.modules ?? []) {
    for (const t of mod.topics ?? []) {
      if (!done.has(t.id) && t.videoStatus === "ready") return t;
    }
  }
  return null;
}

// ─── Course card ─────────────────────────────────────────────────────────────

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  const progress       = getProgress(enrollment);
  const expired        = isPast(new Date(enrollment.expiresAt));
  const nextTopic      = getNextReadyTopic(enrollment);
  const totalLessons   = enrollment.course?.modules?.flatMap((m) => m.topics ?? []).length ?? 0;
  const doneLessons    = (enrollment.progressRecords ?? []).filter((p) => p.completed).length;

  const ctaLabel  = progress === 0 ? "Start course" : progress === 100 ? "Review course" : "Continue";
  const ctaHref   = `/dashboard/courses/${enrollment.id}${nextTopic ? `?topic=${nextTopic.id}` : ""}`;
  const isDone    = progress === 100;

  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden flex flex-col hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
        {enrollment.course?.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-white/20" />
          </div>
        )}

        {/* Completed overlay */}
        {isDone && (
          <div className="absolute inset-0 bg-emerald-900/55 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white/95 dark:bg-white/90 rounded-xl px-4 py-1.5">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span className="text-[12px] font-semibold text-emerald-700">Completed</span>
            </div>
          </div>
        )}

        {/* Expired badge */}
        {expired && !isDone && (
          <div className="absolute top-3 right-3 text-[9px] font-semibold text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
            Expired
          </div>
        )}

        {/* Progress badge */}
        {!isDone && !expired && progress > 0 && (
          <div className="absolute top-3 right-3 text-[9px] font-semibold text-indigo-800 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full">
            {progress}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3 flex-1">
          {enrollment.course?.title}
        </h3>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/35 mb-1">
            <span>{doneLessons}/{totalLessons} lessons</span>
            <span className="font-medium text-gray-600 dark:text-white/60">{progress}%</span>
          </div>
          <div className="h-[3px] bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isDone ? "bg-emerald-500" : "bg-indigo-600"
              )}
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Expiry */}
        <p
          className={cn(
            "text-[10px] flex items-center gap-1 mb-3",
            expired ? "text-red-500" : "text-gray-400 dark:text-white/35"
          )}
        >
          <Clock className="w-3 h-3" />
          {expired
            ? "Access has expired"
            : `Expires ${formatDistanceToNow(new Date(enrollment.expiresAt), { addSuffix: true })}`}
        </p>

        {/* CTA */}
        <Link
          href={ctaHref}
          className={cn(
            "flex items-center justify-center gap-1.5 py-2.5 rounded-xl",
            "text-[12px] font-medium transition-all active:scale-[0.98]",
            isDone
              ? "bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.1]"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          )}
        >
          {isDone ? <Eye className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const { data: enrollmentsResponse, isLoading, error } = useEnrollments();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  // const enrollments = useMemo<Enrollment[]>(() => {
  //   if (!enrollmentsResponse) return [];
  //   if (Array.isArray(enrollmentsResponse)) return enrollmentsResponse;
  //   if (Array.isArray(enrollmentsResponse?.data)) return enrollmentsResponse.data;
  //   return [];
  // }, [enrollmentsResponse]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enrollmentsResponse?.filter((e) => {
      const progress = getProgress(e);
      const expired  = isPast(new Date(e.expiresAt));

      const matchFilter =
        filter === "all" ||
        (filter === "active"    && !expired && progress < 100) ||
        (filter === "completed" && progress === 100) ||
        (filter === "expired"   && expired);

      const matchSearch = e.course?.title?.toLowerCase().includes(q) ?? false;

      return matchFilter && matchSearch;
    });
  }, [enrollmentsResponse, filter, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">

      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">My courses</h1>
        <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">
          {enrollmentsResponse!.length} total enrollment{enrollmentsResponse!.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Controls ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
          <input
            type="search"
            placeholder="Search your courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-[12px] bg-white dark:bg-white/[0.05]
                       border border-black/[0.08] dark:border-white/[0.08] rounded-xl
                       text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            aria-label="Search courses"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Filter courses">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              role="tab"
              aria-selected={filter === f.value}
              className={cn(
                "px-4 py-2 rounded-[9px] text-[11px] font-medium transition-all border cursor-pointer",
                filter === f.value
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white dark:bg-white/[0.04] text-gray-600 dark:text-white/50 border-black/[0.07] dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/30"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── States ──────────────────────────────────── */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Failed to load your courses. Please try again.
        </div>
      )}

      {!isLoading && !error && filtered!.length === 0 && (
        <div className="flex flex-col items-center py-14 bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-gray-400 dark:text-white/30" />
          </div>
          <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">No courses found</p>
          <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1">
            {search ? "Try a different search term." : "Try changing your filter."}
          </p>
        </div>
      )}

      {/* ── Grid ────────────────────────────────────── */}
      {!isLoading && !error && filtered!.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered!.map((e) => (
            <CourseCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </div>
  );
}