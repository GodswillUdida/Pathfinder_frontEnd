"use client";

import { useMemo, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import Footer from "@/components/layout/Footer";
import { Hero } from "@/components/courses/Hero";
import {
  Filters,
  type CourseFilters,
  type FilterOption,
} from "@/components/courses/Filters";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { NoResults } from "@/components/courses/NoResults";
import { Spinner } from "@/components/ui/spinner";
import Navbar from "../layout/Navbar";
import { useCoursesList } from "@/hooks/useCourses";
import type { CatalogProgramGroup, CourseCatalogItem } from "@/types/catalog";
import { getPrimaryProgram } from "@/lib/courses";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: CourseFilters = {
  searchQuery: "",
  level: "all",
  programSlug: "all",
};

const ALL_LEVELS_OPTION: FilterOption = { value: "all", label: "All Levels" };
const ALL_PROGRAMS_OPTION: FilterOption = { value: "all", label: "All Programs" };

// ─── URL helpers ──────────────────────────────────────────────────────────────

function filtersToSearchParams(filters: CourseFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.searchQuery) params.set("q", filters.searchQuery);
  if (filters.level !== "all") params.set("level", filters.level);
  if (filters.programSlug !== "all") params.set("program", filters.programSlug);
  return params;
}

function filtersFromSearchParams(searchParams: URLSearchParams): CourseFilters {
  return {
    searchQuery: searchParams.get("q") ?? DEFAULT_FILTERS.searchQuery,
    level: searchParams.get("level") ?? DEFAULT_FILTERS.level,
    programSlug: searchParams.get("program") ?? DEFAULT_FILTERS.programSlug,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoursesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const catalogRef = useRef<HTMLElement>(null);

  // Derived directly from the URL — no useState/useEffect pair syncing a
  // copy of it. That extra render+effect cycle was what raced with
  // router.replace() below and produced the "Cannot update Router while
  // rendering CoursesClient" warning. The URL is the source of truth;
  // there's nothing to keep in sync because there's only one copy.
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);

  const pushFiltersToURL = useCallback(
    (next: CourseFilters) => {
      const params = filtersToSearchParams(next);
      const queryString = params.toString();
      const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;
      router.replace(newUrl, { scroll: false });
    },
    [router, pathname]
  );

  const handleFilterChange = useCallback(
    <K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => {
      pushFiltersToURL({ ...filters, [key]: value });
    },
    [filters, pushFiltersToURL]
  );

  const handleClearFilters = useCallback(() => {
    pushFiltersToURL(DEFAULT_FILTERS);
  }, [pushFiltersToURL]);

  const scrollToCatalog = useCallback(() => {
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ─── Data ──────────────────────────────────────────────────────────────────
  // Hydrated by app/courses/page.tsx's prefetchQuery under courseKeys.list({})
  // — data is present on first client render, no loading flash on a fresh nav.

  const { data, isLoading, error } = useCoursesList();

  const courses = useMemo<CourseCatalogItem[]>(() => data?.data ?? [], [data]);

  // ─── Derived filter options ─────────────────────────────────────────────────

  const levelOptions = useMemo<FilterOption[]>(() => {
    const unique = Array.from(
      new Set(courses.map((c) => c.level).filter(Boolean))
    ).sort() as string[];

    return [ALL_LEVELS_OPTION, ...unique.map((v) => ({ value: v, label: v }))];
  }, [courses]);

  const programOptions = useMemo<FilterOption[]>(() => {
    const seen = new Map<string, string>(); // slug → name

    courses.forEach((c) => {
      const program = getPrimaryProgram(c);
      if (program && !seen.has(program.slug)) {
        seen.set(program.slug, program.title);
      }
    });

    const options = Array.from(seen.entries())
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([value, label]) => ({ value, label }));

    return [ALL_PROGRAMS_OPTION, ...options];
  }, [courses]);

  // ─── Filtering ─────────────────────────────────────────────────────────────

  const filteredCourses = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase();

    return courses.filter((course) => {
      if (query) {
        const inTitle = course.title.toLowerCase().includes(query);
        const inDescription = course.description?.toLowerCase().includes(query) ?? false;
        if (!inTitle && !inDescription) return false;
      }

      if (filters.level !== "all" && course.level !== filters.level) return false;

      if (filters.programSlug !== "all") {
        const program = getPrimaryProgram(course);
        if (program?.slug !== filters.programSlug) return false;
      }

      return true;
    });
  }, [courses, filters]);

  const programGroups = useMemo<CatalogProgramGroup[]>(() => {
    const map = new Map<string, CatalogProgramGroup>();

    for (const course of filteredCourses) {
      const program = getPrimaryProgram(course);
      const key = program?.id ?? "standalone";
      if (!map.has(key)) {
        map.set(key, { program, courses: [] });
      }
      map.get(key)!.courses.push(course);
    }

    return Array.from(map.values());
  }, [filteredCourses]);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.level !== "all" ||
    filters.programSlug !== "all";

  const showNoResults = programGroups.length === 0 && hasActiveFilters;
  const isEmpty = courses.length === 0;

  // ─── Render states ────────────────────────────────────────────────────────

  if (isLoading && courses.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error && courses.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <Navbar />
        <Hero totalCourses={0} />
        <main className="container mx-auto px-4 py-8">
          <NoResults variant="empty" />
        </main>
        <Footer />
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <Hero totalCourses={courses.length} onBrowseClick={scrollToCatalog} />
      <main ref={catalogRef} className="container mx-auto px-4 py-8 scroll-mt-20">
        <Filters
          levels={levelOptions}
          programs={programOptions}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          filteredCount={filteredCourses.length}
          totalCourses={courses.length}
          className="mb-8"
        />

        {isEmpty ? (
          <NoResults variant="empty" />
        ) : showNoResults ? (
          <NoResults onClearFilters={handleClearFilters} />
        ) : (
          <CourseGrid programGroups={programGroups} />
        )}
      </main>
      <Footer />
    </div>
  );
}
