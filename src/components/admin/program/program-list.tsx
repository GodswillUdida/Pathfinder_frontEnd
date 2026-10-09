"use client";

import { MotionConfig } from "framer-motion";
import { ArrowDown, ArrowUp, ArrowUpDown, FolderOpen, Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ProgramRow, PROGRAM_COLS } from "./program-row";
import type { ProgramWithCount } from "@/types/domain";

export type SortKey = "title" | "courses";
export type SortDir = "asc" | "desc";

const CARD = "overflow-hidden rounded-2xl border border-border bg-card";

// ─── Sort button ──────────────────────────────────────────────────────────────

function SortButton({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
  className?: string;
}) {
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md text-[11px] font-bold tracking-[0.1em] uppercase transition-colors duration-200",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {label}
      <Icon
        aria-hidden="true"
        className={cn(
          "h-3 w-3 transition-opacity duration-200",
          active ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-60",
        )}
      />
    </button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function ListSkeleton() {
  return (
    <div className={CARD} aria-hidden="true">
      <div className={cn("hidden border-b border-border bg-secondary/60 py-3 sm:grid", PROGRAM_COLS)}>
        <Skeleton className="h-4 w-4 rounded" />
        <span />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="ml-auto h-3 w-14" />
        <Skeleton className="ml-auto h-3 w-14" />
        <span />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn("grid border-b border-border py-3 last:border-b-0", PROGRAM_COLS)}
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-3.5 w-[180px] max-w-full" />
            <Skeleton className="h-3 w-[110px] max-w-full" />
          </div>
          <Skeleton className="ml-auto hidden h-3 w-8 sm:block" />
          <Skeleton className="ml-auto hidden h-5 w-20 rounded-full sm:block" />
          <Skeleton className="ml-auto h-7 w-7 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty states ─────────────────────────────────────────────────────────────

function EmptyState({
  query,
  isFiltered,
  onCreate,
  onClearFilters,
}: {
  query: string;
  isFiltered: boolean;
  onCreate: () => void;
  onClearFilters?: () => void;
}) {
  if (isFiltered) {
    return (
      <div className={cn(CARD, "flex flex-col items-center px-6 py-16")}>
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
          <Search className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="font-display text-base font-bold tracking-tight text-foreground">
          {query ? <>No matches for &ldquo;{query}&rdquo;</> : "No programs match this filter"}
        </p>
        <p className="mt-1.5 max-w-xs text-center text-[13px] text-muted-foreground">
          Try another search term, or clear the filters to see every program.
        </p>
        {onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-5">
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-dashed border-border bg-card px-6 py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_50%_0%,color-mix(in_oklch,var(--brand-500)_12%,transparent),transparent)]"
      />
      <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary ring-8 ring-accent/50">
        <FolderOpen className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="font-display text-xl font-bold tracking-tight text-foreground">
        No programs yet
      </p>
      <p className="mt-2 mb-6 max-w-sm text-center text-[13px] leading-relaxed text-muted-foreground">
        Programs organize courses into structured learning paths for your students.
      </p>
      <Button onClick={onCreate} className="gap-1.5 shadow-sm shadow-primary/25">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Create program
      </Button>
    </div>
  );
}

// ─── List ─────────────────────────────────────────────────────────────────────

interface ProgramListProps {
  programs: ProgramWithCount[];
  query: string;
  sort: { key: SortKey; dir: SortDir };
  onSort: (key: SortKey) => void;
  selected: Set<string>;
  allSelected: boolean;
  onToggleAll: () => void;
  onToggleRow: (id: string) => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  /** True when a search or status filter is active (falls back to `query !== ""`). */
  isFiltered?: boolean;
  onClearFilters?: () => void;
}

export function ProgramList({
  programs,
  query,
  sort,
  onSort,
  selected,
  allSelected,
  onToggleAll,
  onToggleRow,
  onOpen,
  onDelete,
  onCreate,
  isFiltered,
  onClearFilters,
}: ProgramListProps) {
  if (programs.length === 0) {
    return (
      <EmptyState
        query={query}
        isFiltered={isFiltered ?? query !== ""}
        onCreate={onCreate}
        onClearFilters={onClearFilters}
      />
    );
  }

  const ariaSort = (key: SortKey) =>
    sort.key !== key ? "none" : sort.dir === "asc" ? "ascending" : "descending";

  return (
    <MotionConfig reducedMotion="user">
      <div role="grid" aria-label="Programs" className={CARD}>
        {/* Header (sm+) */}
        <div
          role="row"
          className={cn("hidden border-b border-border bg-secondary/60 py-3 sm:grid", PROGRAM_COLS)}
        >
          <div role="columnheader" className="flex items-center">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleAll}
              aria-label="Select all programs on this page"
              className="h-4 w-4"
            />
          </div>
          <div role="columnheader" aria-hidden="true" />
          <div role="columnheader" aria-sort={ariaSort("title")}>
            <SortButton
              label="Program"
              active={sort.key === "title"}
              dir={sort.dir}
              onClick={() => onSort("title")}
            />
          </div>
          <div role="columnheader" aria-sort={ariaSort("courses")} className="flex justify-end">
            <SortButton
              label="Courses"
              active={sort.key === "courses"}
              dir={sort.dir}
              onClick={() => onSort("courses")}
            />
          </div>
          <div
            role="columnheader"
            className="text-right text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase"
          >
            Status
          </div>
          <div role="columnheader" aria-hidden="true" />
        </div>

        {/* Select-all (mobile) */}
        <label className="flex items-center gap-3 border-b border-border bg-secondary/60 px-4 py-2.5 text-xs font-medium text-muted-foreground sm:hidden">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onToggleAll}
            aria-label="Select all programs on this page"
            className="h-4 w-4"
          />
          Select all on this page
        </label>

        {/* Rows */}
        <div role="rowgroup">
          {programs.map((p, i) => (
            <ProgramRow
              key={p.id}
              program={p}
              index={i}
              selected={selected.has(p.id)}
              onToggleSelect={() => onToggleRow(p.id)}
              onOpen={() => onOpen(p.id)}
              onDelete={() => onDelete(p.id)}
            />
          ))}
        </div>
      </div>
    </MotionConfig>
  );
}