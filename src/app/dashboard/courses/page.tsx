"use client";

import { useState, useMemo } from "react";
import { useEnrollments } from "@/hooks/use-enrollments";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Trophy,
  PlayCircle,
  AlertCircle,
  Search,
  Eye,
} from "lucide-react";
import { isPast, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type {
  EnrollmentListItem,
} from "@/types/domain";


// ─── Types ───────────────────────────────────────────────────────────────────

type FilterValue = "all" | "active" | "completed" | "expired";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "In progress", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isExpired(e: EnrollmentListItem): boolean {
  if (e.expiresAt === null) return false; // lifetime
  return isPast(new Date(e.expiresAt));
}

function isCompleted(e: EnrollmentListItem): boolean {
  return e.progressPercentage === 100 || e.completedAt !== null;
}

function formatExpiry(e: EnrollmentListItem): string {
  if (e.expiresAt === null) return "Lifetime access";
  if (isExpired(e)) return "Access has expired";
  return `Expires ${formatDistanceToNow(new Date(e.expiresAt), {
    addSuffix: true,
  })}`;
}

// ─── Course card ─────────────────────────────────────────────────────────────

function CourseCard({ enrollment }: { enrollment: EnrollmentListItem }) {
  const progress = enrollment.progressPercentage;
  const expired = isExpired(enrollment);
  const isDone = isCompleted(enrollment);

  const ctaLabel =
    progress === 0 ? "Start course" : isDone ? "Review course" : "Continue";

  // List endpoint has no topics → no deep link
  const ctaHref = `/dashboard/courses/${enrollment.id}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/6 bg-white transition-all duration-200 hover:border-indigo-300 dark:border-white/6 dark:bg-white/4 dark:hover:border-indigo-500/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/5">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-gray-300 dark:text-white/20" />
          </div>
        )}

        {isDone && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-900/55">
            <div className="flex items-center gap-2 rounded-xl bg-white/95 px-4 py-1.5 dark:bg-white/90">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <span className="text-[12px] font-semibold text-emerald-700">
                Completed
              </span>
            </div>
          </div>
        )}

        {expired && !isDone && (
          <div className="absolute right-3 top-3 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-800">
            Expired
          </div>
        )}

        {!isDone && !expired && progress > 0 && (
          <div className="absolute right-3 top-3 rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[9px] font-semibold text-indigo-800">
            {progress}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-3 line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-gray-900 dark:text-white">
          {enrollment.course.title}
        </h3>

        {/* Progress */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-[10px] text-gray-400 dark:text-white/35">
            <span>Progress</span>
            <span className="font-medium text-gray-600 dark:text-white/60">
              {progress}%
            </span>
          </div>
          <div className="h-0.75 overflow-hidden rounded-full bg-gray-100 dark:bg-white/8">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isDone ? "bg-emerald-500" : "bg-indigo-600",
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
            "mb-3 flex items-center gap-1 text-[10px]",
            expired
              ? "text-red-500"
              : "text-gray-400 dark:text-white/35",
          )}
        >
          <Clock className="h-3 w-3" />
          {formatExpiry(enrollment)}
        </p>

        {/* CTA */}
        <Link
          href={ctaHref}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-medium transition-all active:scale-[0.98]",
            isDone
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/[0.07] dark:text-white/70 dark:hover:bg-white/10"
              : "bg-indigo-600 text-white hover:bg-indigo-700",
          )}
        >
          {isDone ? (
            <Eye className="h-3.5 w-3.5" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5" />
          )}
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

export function CourseCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-black/6 bg-white dark:border-white/6 dark:bg-white/4">
      <div className="aspect-video bg-gray-100 dark:bg-white/6" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-4/5 rounded bg-gray-100 dark:bg-white/8" />
        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-white/8" />
        <div className="h-8 w-full rounded-xl bg-gray-100 dark:bg-white/8" />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MyCoursesPage() {
  const { data: enrollmentsData, isLoading, error } = useEnrollments();
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  const enrollments = useMemo(
    () => (enrollmentsData ?? []) as unknown as EnrollmentListItem[],
    [enrollmentsData],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return enrollments.filter((e) => {
      const expired = isExpired(e);
      const completed = isCompleted(e);

      const matchFilter =
        filter === "all" ||
        (filter === "active" && !expired && !completed) ||
        (filter === "completed" && completed) ||
        (filter === "expired" && expired);

      const matchSearch =
        !q || e.course.title.toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [enrollments, filter, search]);

  const total = enrollments.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          My courses
        </h1>
        <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
          {isLoading
            ? "Loading…"
            : `${total} total enrollment${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-white/30" />
          <input
            type="search"
            placeholder="Search your courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-black/8 bg-white py-2 pl-9 pr-4 text-[12px] text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-white/8 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            aria-label="Search courses"
          />
        </div>

        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Filter courses"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              role="tab"
              aria-selected={filter === f.value}
              className={cn(
                "cursor-pointer rounded-[9px] border px-4 py-2 text-[11px] font-medium transition-all",
                filter === f.value
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-black/[0.07] bg-white text-gray-600 hover:border-indigo-300 dark:border-white/[0.07] dark:bg-white/4 dark:text-white/50 dark:hover:border-indigo-500/30",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-[12px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Failed to load your courses. Please try again.
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-black/6 bg-white py-14 dark:border-white/6 dark:bg-white/4">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/6">
            <BookOpen className="h-6 w-6 text-gray-400 dark:text-white/30" />
          </div>
          <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">
            No courses found
          </p>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/35">
            {search
              ? "Try a different search term."
              : "Try changing your filter."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <CourseCard key={e.id} enrollment={e} />
          ))}
        </div>
      )}
    </div>
  );
}