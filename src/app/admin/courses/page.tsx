// app/admin/courses/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  BookOpen,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Layers,
  CircleCheck,
  PenLine,
  Archive,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCoursesList } from "@/hooks/useCourses";
import type { CourseStatus } from "@/types/domain";

type StatusFilter = "ALL" | CourseStatus;
type SortKey = "updated" | "title" | "duration";

const PAGE_SIZE = 9;

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;

function formatDuration(seconds?: number | null): string | null {
  if (!seconds || Number.isNaN(seconds)) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function safeDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  try {
    return format(new Date(dateStr), "MMM d, yyyy");
  } catch {
    return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Stat pill                                                                  */
/* -------------------------------------------------------------------------- */

function StatPill({
  label,
  count,
  Icon,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  Icon: typeof BookOpen;
  active: boolean;
  onClick: () => void;
  tone: "all" | "success" | "warning" | "muted";
}) {
  const toneRing =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-primary";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex min-w-33 flex-1 items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        active
          ? "border-primary/40 bg-accent shadow-sm shadow-primary/10"
          : "border-border bg-card hover:border-brand-300 hover:bg-accent/50",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary transition-transform duration-300 group-hover:scale-105",
          toneRing,
        )}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-extrabold leading-none tracking-tight tabular-nums text-foreground">
          {count}
        </span>
        <span className="mt-1 block text-[11.5px] font-medium tracking-tight text-muted-foreground">
          {label}
        </span>
      </span>
      {active && (
        <motion.span
          layoutId="stat-underline"
          transition={SPRING}
          className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-primary"
        />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Course card                                                                */
/* -------------------------------------------------------------------------- */

type CourseCardData = {
  id: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  totalDurationSeconds?: number | null;
  updatedAt?: string | null;
  status: CourseStatus;
  level?: string | null;
};

function CourseCard({ course, index }: { course: CourseCardData; index: number }) {
  const duration = formatDuration(course.totalDurationSeconds);
  const updated = safeDate(course.updatedAt);
  const isPublished = course.status === "PUBLISHED";
  const isDraft = course.status === "DRAFT";

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ ...SPRING, delay: Math.min(index, 8) * 0.035 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card",
        "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-navy/10",
      )}
    >
      {/* Thumbnail */}
      <Link
        href={`/admin/courses/${course.id}`}
        className="relative block aspect-16/10 w-full overflow-hidden bg-secondary focus-visible:outline-none"
      >
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground/30" aria-hidden="true" />
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-brand-navy/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
            isPublished && "bg-success/90 text-success-foreground",
            isDraft && "bg-warning/90 text-warning-foreground",
            !isPublished && !isDraft && "bg-background/80 text-muted-foreground",
          )}
        >
          {isPublished ? "Live" : isDraft ? "Draft" : "Archived"}
        </span>

        {duration && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-brand-navy/75 px-2 py-1 text-[10.5px] font-semibold text-white backdrop-blur-md">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {duration}
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {course.level && (
          <span className="w-fit rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-indigo">
            {course.level}
          </span>
        )}

        <Link
          href={`/admin/courses/${course.id}`}
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {course.title || "Untitled course"}
          </h3>
        </Link>

        {course.description && (
          <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
          <span className="text-[11px] text-muted-foreground">
            {updated ? `Updated ${updated}` : "—"}
          </span>
          <Link
            href={`/admin/courses/${course.id}`}
            aria-label={`Open ${course.title}`}
            className="inline-flex items-center gap-1 text-[12.5px] font-bold tracking-tight text-primary"
          >
            Open
            <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 transition-transform duration-300 group-hover:translate-x-0" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-16/10 w-full animate-pulse bg-muted" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="flex justify-between pt-3">
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty states                                                              */
/* -------------------------------------------------------------------------- */

function EmptyAll() {
  return (
    <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-20 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-card shadow-sm">
        <BookOpen className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
        No courses yet
      </h3>
      <p className="mt-1.5 max-w-70 text-[13px] leading-relaxed text-muted-foreground">
        Courses live inside programs. Open a program to create your first one.
      </p>
      <Link
        href="/admin/programs"
        className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-[13px] font-bold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Browse programs
      </Link>
    </div>
  );
}

function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-16 text-center">
      <Search className="mb-3 h-7 w-7 text-muted-foreground/30" aria-hidden="true" />
      <p className="text-[14px] font-semibold text-foreground">
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Try a different term, or clear filters.
      </p>
      <button
        onClick={onClear}
        className="mt-4 text-[13px] font-bold text-primary underline-offset-4 hover:underline"
      >
        Clear search
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pagination                                                                */
/* -------------------------------------------------------------------------- */

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const nums = useMemo(() => {
    const set = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return [...set].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5 pt-2"
    >
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
        className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground transition-all duration-300 hover:border-brand-300 hover:text-foreground disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>

      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && (
            <span className="px-1 text-[12px] text-muted-foreground/50">…</span>
          )}
          <button
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              "relative grid h-9 w-9 place-items-center rounded-xl text-[13px] font-semibold tabular-nums transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              n === page
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {n === page && (
              <motion.span
                layoutId="page-pill"
                transition={SPRING}
                className="absolute inset-0 -z-10 rounded-xl bg-primary"
              />
            )}
            {n}
          </button>
        </span>
      ))}

      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
        className="grid h-9 w-9 place-items-center rounded-xl border border-border text-muted-foreground transition-all duration-300 hover:border-brand-300 hover:text-foreground disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function AdminCoursesPage() {
  const { data, isLoading, error, refetch } = useCoursesList();
  const courses = useMemo(() => data?.data ?? [], [data]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = courses.filter((c) => {
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" ? true : c.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    return [...list].sort((a, b) => {
      if (sortKey === "title") return a.title.localeCompare(b.title);
      if (sortKey === "duration")
        return (b.totalDurationSeconds ?? 0) - (a.totalDurationSeconds ?? 0);
      const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return db - da;
    });
  }, [courses, search, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = courses.filter((c) => c.status === "DRAFT").length;
  const archivedCount = courses.filter((c) => c.status === "ARCHIVED").length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 sm:px-6 mt-4">
        <div className="flex items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {(error as Error).message ?? "Failed to load courses."}
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-xl border border-border px-6 py-2 text-[13px] text-accent-foreground cursor-pointer duration-300 ease-in-out font-semibold transition-colors hover:bg-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:mt-0 mt-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-indigo">
            Catalog
          </p>
          <h1 className="font-display mt-1 text-[1.7rem] font-extrabold tracking-tight text-foreground">
            All courses
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {courses.length} course{courses.length !== 1 && "s"} across every program
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search courses"
              className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-9 text-accent-foreground text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {/* {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )} */}
          </div>

          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(e) => {
                setSortKey(e.target.value as SortKey);
                setPage(1);
              }}
              aria-label="Sort courses"
              className="h-10 appearance-none rounded-full border border-border bg-card pl-9 pr-8 text-[13px] font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="updated">Recently updated</option>
              <option value="title">Title A–Z</option>
              <option value="duration">Longest duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats / filters */}
      {courses.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          <StatPill
            label="All courses"
            count={courses.length}
            Icon={Layers}
            active={statusFilter === "ALL"}
            onClick={() => {
              setStatusFilter("ALL");
              setPage(1);
            }}
            tone="all"
          />
          <StatPill
            label="Live"
            count={publishedCount}
            Icon={CircleCheck}
            active={statusFilter === "PUBLISHED"}
            onClick={() => {
              setStatusFilter("PUBLISHED");
              setPage(1);
            }}
            tone="success"
          />
          <StatPill
            label="Draft"
            count={draftCount}
            Icon={PenLine}
            active={statusFilter === "DRAFT"}
            onClick={() => {
              setStatusFilter("DRAFT");
              setPage(1);
            }}
            tone="warning"
          />
          <StatPill
            label="Archived"
            count={archivedCount}
            Icon={Archive}
            active={statusFilter === "ARCHIVED"}
            onClick={() => {
              setStatusFilter("ARCHIVED");
              setPage(1);
            }}
            tone="muted"
          />
        </div>
      )}

      {/* Grid */}
      {courses.length === 0 ? (
        <div className="grid grid-cols-1">
          <EmptyAll />
        </div>
      ) : filtered.length === 0 ? (
        <div className="grid grid-cols-1">
            <EmptySearch
              query={search}
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
            />
        </div>
      ) : (
        <>
          <p className="text-[12px] text-muted-foreground">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {pageItems.map((course, i) => (
                <CourseCard key={course.id} course={course} index={i} />
              ))}
            </AnimatePresence>
          </div>

          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}