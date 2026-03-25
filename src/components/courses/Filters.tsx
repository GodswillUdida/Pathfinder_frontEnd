"use client";

import { useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterOption {
  value: string;
  label: string;
}

export interface CourseFilters {
  searchQuery: string;
  level: string;
  programSlug: string;
}

const DEFAULT_FILTERS: CourseFilters = {
  searchQuery: "",
  level: "all",
  programSlug: "all",
};

interface FiltersProps {
  /** Available level options. Include { value: "all", label: "All Levels" } as first item. */
  levels: FilterOption[];
  /** Available program options. Include { value: "all", label: "All Programs" } as first item. */
  programs: FilterOption[];
  filters: CourseFilters;
  onFilterChange: <K extends keyof CourseFilters>(
    key: K,
    value: CourseFilters[K]
  ) => void;
  onClearFilters: () => void;
  filteredCount: number;
  totalCourses: number;
  className?: string;
}

// ─── Derived helpers ──────────────────────────────────────────────────────────

function getActiveFilterBadges(
  filters: CourseFilters,
  levels: FilterOption[],
  programs: FilterOption[]
): Array<{ key: keyof CourseFilters; label: string }> {
  const badges: Array<{ key: keyof CourseFilters; label: string }> = [];

  if (filters.searchQuery.trim()) {
    badges.push({ key: "searchQuery", label: `"${filters.searchQuery}"` });
  }
  if (filters.level && filters.level !== "all") {
    const level = levels.find((l) => l.value === filters.level);
    badges.push({ key: "level", label: level?.label ?? filters.level });
  }
  if (filters.programSlug && filters.programSlug !== "all") {
    const program = programs.find((p) => p.value === filters.programSlug);
    badges.push({
      key: "programSlug",
      label: program?.label ?? filters.programSlug,
    });
  }

  return badges;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Filters({
  levels,
  programs,
  filters,
  onFilterChange,
  onClearFilters,
  filteredCount,
  totalCourses,
  className,
}: FiltersProps) {
  const activeBadges = useMemo(
    () => getActiveFilterBadges(filters, levels, programs),
    [filters, levels, programs]
  );

  const hasActiveFilters = activeBadges.length > 0;

  const handleClearSingle = useCallback(
    (key: keyof CourseFilters) => {
      onFilterChange(key, DEFAULT_FILTERS[key]);
    },
    [onFilterChange]
  );

  const isFiltered = filteredCount < totalCourses;

  return (
    <section aria-label="Course filters" className={cn("space-y-3", className)}>
      {/* Controls row */}
      <div
        role="search"
        aria-label="Search and filter courses"
        className="grid gap-3 sm:grid-cols-[1fr_auto_auto]"
      >
        {/* Search */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="course-search"
            type="search"
            placeholder="Search courses…"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            className="pl-9 pr-4"
            aria-label="Search courses by name or keyword"
            autoComplete="off"
            spellCheck={false}
          />
          {filters.searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onFilterChange("searchQuery", "")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Level */}
        <Select
          value={filters.level || "all"}
          onValueChange={(value) => onFilterChange("level", value)}
        >
          <SelectTrigger
            className={cn(
              "w-[160px]",
              filters.level &&
                filters.level !== "all" &&
                "ring-2 ring-ring ring-offset-1"
            )}
            aria-label="Filter by level"
          >
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            {levels.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Program */}
        <Select
          value={filters.programSlug || "all"}
          onValueChange={(value) => onFilterChange("programSlug", value)}
        >
          <SelectTrigger
            className={cn(
              "w-[180px]",
              filters.programSlug &&
                filters.programSlug !== "all" &&
                "ring-2 ring-ring ring-offset-1"
            )}
            aria-label="Filter by program"
          >
            <SelectValue placeholder="All Programs" />
          </SelectTrigger>
          <SelectContent>
            {programs.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Status & active badge row */}
      <div className="flex min-h-[28px] flex-wrap items-center justify-between gap-2">
        {/* Result count — announced to screen readers on change */}
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFiltered ? (
            <>
              <span className="font-medium text-foreground">
                {filteredCount}
              </span>
              {" of "}
              <span className="font-medium text-foreground">
                {totalCourses}
              </span>
              {" courses"}
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">
                {totalCourses}
              </span>
              {" courses"}
            </>
          )}
        </p>

        {/* Active filter badges + clear all */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            <SlidersHorizontal
              className="h-3.5 w-3.5 text-muted-foreground"
              aria-hidden="true"
            />

            {activeBadges.map(({ key, label }) => (
              <Badge
                key={key}
                variant="secondary"
                className="gap-1 pr-1 text-xs font-normal"
              >
                {label}
                <button
                  type="button"
                  aria-label={`Remove filter: ${label}`}
                  onClick={() => handleClearSingle(key)}
                  className="ml-0.5 rounded-sm opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}

            {activeBadges.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-6 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
                aria-label="Clear all filters"
              >
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
