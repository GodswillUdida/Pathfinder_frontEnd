"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCoursesList } from "@/hooks/useAdminCourses";
import {
  Search, Plus, BookOpen, AlertCircle,
  ArrowUpRight, Users, Clock, BarChart2,
  ChevronRight, Eye, Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Level = "Beginner" | "Intermediate" | "Advanced" | string;

type Course = {
  id:               string;
  title:            string;
  slug?:            string | null;
  thumbnail?:       string | null;
  description?:     string | null;
  duration?:        string | number | null;
  level?:           Level | null;
  createdAt?:       string;
  updatedAt?:       string;
  enrollmentCount?: number;
  isPublished?:     boolean;
  program?:         { id: string; title: string; slug?: string } | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, string> = {
  Beginner:     "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  Intermediate: "bg-blue-50   text-blue-800   border-blue-200   dark:bg-blue-500/10   dark:text-blue-400   dark:border-blue-500/20",
  Advanced:     "bg-pink-50    text-pink-800    border-pink-200    dark:bg-pink-500/10    dark:text-pink-400    dark:border-pink-500/20",
};

function getLevelStyle(level?: string | null): string {
  return LEVEL_STYLES[level ?? ""] ??
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/[0.06] dark:text-white/50 dark:border-white/[0.08]";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeDate(dateStr?: string): string | null {
  if (!dateStr) return null;
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return null;
  }
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function CourseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-100 dark:bg-white/[0.08]" />
      <div className="p-4 space-y-3">
        <div className="h-3.5 w-3/4 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
        <div className="h-3 w-full rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
        <div className="h-3 w-2/3 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
        <div className="flex gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
          <div className="h-7 flex-1 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
          <div className="h-7 w-8 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
}

// ─── Course card ─────────────────────────────────────────────────────────────

function CourseCard({ course }: { course: Course }) {
  const updatedDate = safeDate(course.updatedAt);

  return (
    <div className={cn(
      "group relative bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden flex flex-col",
      "border border-black/[0.06] dark:border-white/[0.07]",
      "hover:border-blue-300 dark:hover:border-blue-500/30",
      "transition-all duration-200 hover:shadow-sm"
    )}>
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-white/[0.05] overflow-hidden shrink-0">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-white/15" aria-hidden="true" />
          </div>
        )}

        {/* Published status dot */}
        <div className={cn(
          "absolute top-2.5 right-2.5 flex items-center gap-1.5 text-[9px] font-semibold px-2 py-0.5 rounded-full border",
          course.isPublished
            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
            : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            course.isPublished ? "bg-emerald-500" : "bg-blue-500"
          )} />
          {course.isPublished ? "Published" : "Draft"}
        </div>

        {/* Program label */}
        {course.program?.title && (
          <div className="absolute bottom-2.5 left-2.5 text-[9px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-full">
            {course.program.title}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-2.5">
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
          {course.title}
        </h3>

        <p className="text-[11px] text-gray-400 dark:text-white/40 leading-relaxed line-clamp-2 flex-1 min-h-[2.5rem]">
          {course.description ?? "No description provided."}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          {course.level && (
            <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1", getLevelStyle(course.level))}>
              <BarChart2 className="w-2.5 h-2.5" aria-hidden="true" />
              {course.level}
            </span>
          )}
          {course.duration && (
            <span className="text-[10px] text-gray-400 dark:text-white/35 flex items-center gap-1">
              <Clock className="w-3 h-3" aria-hidden="true" />
              {course.duration}
            </span>
          )}
          {course.enrollmentCount !== undefined && (
            <span className="text-[10px] text-gray-400 dark:text-white/35 flex items-center gap-1">
              <Users className="w-3 h-3" aria-hidden="true" />
              {course.enrollmentCount}
            </span>
          )}
        </div>

        {updatedDate && (
          <p className="text-[10px] text-gray-400 dark:text-white/25">
            Updated {updatedDate}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.05] mt-auto">
          <Link
            href={`/admin/courses/${course.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                       bg-gray-50 dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06]
                       text-[11px] font-medium text-gray-700 dark:text-white/70
                       hover:border-blue-300 dark:hover:border-bleu-500/30 hover:text-blue-700 dark:hover:text-blue-400
                       transition-all"
            aria-label={`View course: ${course.title}`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            View
          </Link>
          {course.program?.slug && course.slug && (
            <a
              href={`/courses/${course.program.slug}/${course.slug}`}
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-xl border border-black/[0.06] dark:border-white/[0.06]
                         flex items-center justify-center text-gray-400 dark:text-white/30
                         hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-700 dark:hover:text-white
                         transition-all"
              aria-label={`Preview ${course.title} live`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyAll() {
  return (
    <div className="flex flex-col items-center py-16 border border-dashed border-black/[0.1] dark:border-white/[0.1] rounded-2xl max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-4">
        <BookOpen className="w-6 h-6 text-gray-400 dark:text-white/30" />
      </div>
      <p className="text-[13px] font-semibold text-gray-900 dark:text-white mb-1">No courses yet</p>
      <p className="text-[11px] text-gray-400 dark:text-white/35 text-center mb-5 max-w-[220px] leading-relaxed">
        Go to a program and add your first course to get started.
      </p>
      <Link
        href="/admin/programs"
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        Browse programs
      </Link>
    </div>
  );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center py-14 bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07]">
      <Search className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" aria-hidden="true" />
      <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">No results for "{query}"</p>
      <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1 mb-4">Try a different search term or clear filters.</p>
      <button
        onClick={onClear}
        className="px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
      >
        Clear search
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const { data, isLoading, error, refetch } = useCoursesList();
  const courses: Course[] = data?.data ?? [];

  const [search, setSearch] = useState("");

  const filtered = useMemo((): Course[] => {
    const q = search.toLowerCase();
    return courses
      .filter((c) => {
        if (!q) return true;
        return (
          c.title.toLowerCase().includes(q) ||
          (c.program?.title ?? "").toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
  }, [courses, search]);

  // ── Loading ────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-7 space-y-7">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-6 w-24 rounded-xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
            <div className="h-3.5 w-48 rounded-xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
          </div>
          <div className="h-9 w-36 rounded-xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <CourseCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-7 space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px]">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {(error as Error).message ?? "Failed to load courses."}
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Page ───────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-6 py-4 space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Courses</h1>
          <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">
            All courses across your programs
          </p>
        </div>
        <Link
          href="/admin/programs"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors sm:w-auto w-full justify-center"
        >
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          Manage programs
        </Link>
      </div>

      {/* Stat pill */}
      {courses.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] rounded-xl">
            <BookOpen className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span className="text-[13px] font-bold text-gray-900 dark:text-white">{courses.length}</span>
            <span className="text-[11px] text-gray-400 dark:text-white/35">total courses</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[13px] font-bold text-gray-900 dark:text-white">
              {courses.filter((c) => c.isPublished).length}
            </span>
            <span className="text-[11px] text-gray-400 dark:text-white/35">published</span>
          </div>
        </div>
      )}

      {/* Empty — no courses at all */}
      {courses.length === 0 && <EmptyAll />}

      {/* Search + grid */}
      {courses.length > 0 && (
        <>
          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[12px]
                         bg-white dark:bg-white/[0.05]
                         border border-black/[0.08] dark:border-white/[0.08] rounded-xl
                         text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30
                         focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
              aria-label="Search courses"
            />
          </div>

          {/* Section label */}
          {!search && (
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
                All courses
              </h2>
            </div>
          )}

          {/* Results or empty search */}
          {filtered.length === 0 ? (
            <EmptySearch query={search} onClear={() => setSearch("")} />
          ) : (
            <>
              {search && (
                <p className="text-[12px] text-gray-400 dark:text-white/35">
                  {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
                </p>
              )}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}