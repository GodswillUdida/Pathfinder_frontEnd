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
  levels: FilterOption[];
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

// ─── Helper ───────────────────────────────────────────────────────────────────

function getActiveFilterBadges(
  filters: CourseFilters,
  levels: FilterOption[],
  programs: FilterOption[]
) {
  const badges: Array<{ key: keyof CourseFilters; label: string }> = [];

  if (filters.searchQuery.trim()) {
    badges.push({ key: "searchQuery", label: `"${filters.searchQuery}"` });
  }
  if (filters.level && filters.level !== "all") {
    const level = levels.find((l) => l.value === filters.level);
    if (level) badges.push({ key: "level", label: level.label });
  }
  if (filters.programSlug && filters.programSlug !== "all") {
    const program = programs.find((p) => p.value === filters.programSlug);
    if (program) badges.push({ key: "programSlug", label: program.label });
  }

  return badges;
}

// ─── Main Component ───────────────────────────────────────────────────────────

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
  const isFiltered = filteredCount < totalCourses;

  const handleClearSingle = useCallback(
    (key: keyof CourseFilters) => {
      onFilterChange(key, DEFAULT_FILTERS[key]);
    },
    [onFilterChange]
  );

  const handleSearchClear = () => onFilterChange("searchQuery", "");

  return (
    <section aria-label="Course filters" className={cn("space-y-4", className)}>
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="course-search"
            type="search"
            placeholder="Search courses by title or keyword..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange("searchQuery", e.target.value)}
            className="pl-9 pr-10 h-11"
            aria-label="Search courses"
          />
          {filters.searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {/* <X className="h-4 w-4" /> */}
            </button>
          )}
        </div>

        {/* Level Select */}
        <Select
          value={filters.level}
          onValueChange={(value) => onFilterChange("level", value)}
        >
          <SelectTrigger className="h-11 min-w-[140px] sm:w-auto">
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

        {/* Program Select */}
        <Select
          value={filters.programSlug}
          onValueChange={(value) => onFilterChange("programSlug", value)}
        >
          <SelectTrigger className="h-11 min-w-[160px] sm:w-auto">
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

      {/* Results & Active Filters */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing{" "}
          <span className="font-medium text-foreground">
            {filteredCount.toLocaleString()}
          </span>
          {isFiltered && (
            <>
              {" of "}
              <span className="font-medium text-foreground">
                {totalCourses.toLocaleString()}
              </span>
            </>
          )}{" "}
          courses
        </p>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="text-xs uppercase tracking-widest font-medium">
                Active Filters
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeBadges.map(({ key, label }) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="pl-3 pr-1.5 py-1 text-sm font-normal"
                >
                  {label}
                  <button
                    type="button"
                    aria-label={`Remove ${label} filter`}
                    onClick={() => handleClearSingle(key)}
                    className="ml-2 rounded hover:bg-muted p-0.5 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))}

              {activeBadges.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="text-xs h-8 text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}