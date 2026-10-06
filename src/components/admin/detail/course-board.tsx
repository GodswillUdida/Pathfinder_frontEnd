"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGroup, Reorder, motion, useReducedMotion } from "framer-motion";
import { FolderOpen, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CourseRow } from "./course-row";
import type { Course } from "@/types/domain";

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

const SPRING = { type: "spring" as const, stiffness: 380, damping: 32 };

function isPublished(c: Course) {
  return c.status === "PUBLISHED";
}

interface CourseBoardProps {
  courses: Course[];
  onReorder?: (ordered: Course[]) => void;
  onEdit: (course: Course) => void;
  onOpenFull: (course: Course) => void;
  onDelete: (course: Course) => void;
  onAdd: () => void;
}

export function CourseBoard({
  courses,
  onReorder,
  onEdit,
  onOpenFull,
  onDelete,
  onAdd,
}: CourseBoardProps) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [localOrder, setLocalOrder] = useState(courses);

  useEffect(() => {
    setLocalOrder(courses);
  }, [courses]);

  const isFiltering = query.trim().length > 0 || statusFilter !== "ALL";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return localOrder.filter((c) => {
      const title = (c.title ?? "").toLowerCase();
      const matchesQuery = !q || title.includes(q);
      const matchesStatus =
        statusFilter === "ALL" ? true : statusFilter === "PUBLISHED" ? isPublished(c) : !isPublished(c);
      return matchesQuery && matchesStatus;
    });
  }, [localOrder, query, statusFilter]);

  const publishedCount = useMemo(() => courses.filter(isPublished).length, [courses]);
  const draftCount = courses.length - publishedCount;

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("ALL");
  };

  /** Keyboard / touch alternative to dragging: swap with the neighbour and commit. */
  const move = (id: string, delta: -1 | 1) => {
    setLocalOrder((current) => {
      const from = current.findIndex((c) => c.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = current.slice();
      [next[from], next[to]] = [next[to], next[from]];
      onReorder?.(next);
      return next;
    });
  };

  // Empty state: no courses at all yet
  if (courses.length === 0) {
    return (
      <div className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_50%_0%,color-mix(in_oklch,var(--brand-500)_10%,transparent),transparent)]"
        />
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary ring-8 ring-accent/50">
          <FolderOpen className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="font-display text-base font-bold tracking-tight text-foreground">
          No courses yet
        </h3>
        <p className="mt-1.5 max-w-65 text-[13px] leading-relaxed text-muted-foreground">
          Add the first course to begin building this program&rsquo;s curriculum.
        </p>
        <Button onClick={onAdd} className="mt-5 gap-1.5 shadow-sm shadow-primary/25">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-70">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search courses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search courses"
            className="h-9 rounded-xl pr-9 pl-9 text-[13px]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <LayoutGroup id="course-status-filter">
          <div
            role="group"
            aria-label="Filter by status"
            className="flex items-center rounded-xl border border-border bg-secondary p-0.5"
          >
            {(
              [
                ["ALL", "All", courses.length],
                ["PUBLISHED", "Live", publishedCount],
                ["DRAFT", "Draft", draftCount],
              ] as const
            ).map(([value, label, count]) => {
              const on = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setStatusFilter(value)}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[12px] font-medium transition-colors duration-200",
                    on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="course-filter-pill"
                      transition={reduce ? { duration: 0 } : SPRING}
                      className="absolute inset-0 rounded-[10px] bg-card shadow-sm ring-1 ring-border"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                        on ? "bg-accent text-accent-foreground" : "text-muted-foreground/70",
                      )}
                    >
                      {count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>

      {/* Filter notice */}
      {isFiltering && (
        <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          <span>
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
            {courses.length}
            {statusFilter !== "ALL" && ` · ${statusFilter === "PUBLISHED" ? "live" : "draft"}`}
            {query.trim() && ` · “${query.trim()}”`}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center">
          <div className="mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-foreground">No courses match</p>
          <p className="mt-1 text-[12.5px] text-muted-foreground">Try a different search or filter</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      ) : isFiltering ? (
        // Dragging while filtered would silently reorder a hidden subset, so filtered results are static.
        <div className="space-y-2">
          {filtered.map((course) => (
            <CourseRow
              key={course.id}
              item={{ position: localOrder.findIndex((c) => c.id === course.id) + 1, course }}
              index={localOrder.findIndex((c) => c.id === course.id)}
              reorderable={false}
              onEdit={() => onEdit(course)}
              onOpenFull={() => onOpenFull(course)}
              onDelete={() => onDelete(course)}
            />
          ))}
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={localOrder}
          onReorder={(next) => {
            setLocalOrder(next);
            onReorder?.(next);
          }}
          className="space-y-2"
        >
          {localOrder.map((course, i) => (
            <CourseRow
              key={course.id}
              item={{ position: i + 1, course }}
              index={i}
              reorderable
              onEdit={() => onEdit(course)}
              onOpenFull={() => onOpenFull(course)}
              onDelete={() => onDelete(course)}
              onMove={(delta) => move(course.id, delta)}
              canMoveUp={i > 0}
              canMoveDown={i < localOrder.length - 1}
            />
          ))}
        </Reorder.Group>
      )}

      {!isFiltering && (
        <p className="pt-1 text-center text-[11px] text-muted-foreground/60">
          {courses.length} course{courses.length !== 1 && "s"} · drag, or use a row&rsquo;s menu, to
          reorder
        </p>
      )}
    </div>
  );
}