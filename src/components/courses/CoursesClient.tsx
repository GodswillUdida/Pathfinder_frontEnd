"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
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
import { useCourses } from "@/hooks/useCourses";
import type { Course, Program } from "@/types/course";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProgramGroup {
  program: Program | null;
  courses: Course[];
}

interface CoursesClientProps {
  initialCourses?: Course[];
  // course?: Course; // ← NEW: for single course detail pages
  // enrolled?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: CourseFilters = {
  searchQuery: "",
  level: "all",
  programSlug: "all",
};

const ALL_LEVELS_OPTION: FilterOption = { value: "all", label: "All Levels" };
const ALL_PROGRAMS_OPTION: FilterOption = {
  value: "all",
  label: "All Programs",
};

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

export function CoursesClient({ initialCourses = [] }: CoursesClientProps) {
  // if (course) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
  //       <Navbar />
  //       {/* You can replace this with your real single-course UI later */}
  //       <div className="container mx-auto px-4 py-12">
  //         <h1 className="text-4xl font-bold">{course.title}</h1>
  //         <p className="mt-4 text-lg text-slate-600">{course.description}</p>
  //         <div className="mt-8">
  //           {enrolled ? (
  //             <button className="rounded-xl bg-emerald-600 px-8 py-3 text-white">
  //               Continue Learning
  //             </button>
  //           ) : (
  //             <button className="rounded-xl bg-blue-600 px-8 py-3 text-white">
  //               Enroll Now
  //             </button>
  //           )}
  //         </div>
  //       </div>
  //       <Footer />
  //     </div>
  //   );
  // }

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<CourseFilters>(() =>
    filtersFromSearchParams(searchParams)
  );

  // Keep filters in sync if the user navigates back/forward
  useEffect(() => {
    setFilters((prev) => {
      const next = filtersFromSearchParams(searchParams);
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, [searchParams]);

  // Reflect filter changes in the URL (shallow, no scroll)
  const pushFiltersToURL = useCallback(
    (next: CourseFilters) => {
      const params = filtersToSearchParams(next);
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    },
    [router, pathname]
  );

  const handleFilterChange = useCallback(
    <K extends keyof CourseFilters>(key: K, value: CourseFilters[K]) => {
      setFilters((prev) => {
        const next = { ...prev, [key]: value };
        pushFiltersToURL(next);
        return next;
      });
    },
    [pushFiltersToURL]
  );

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    pushFiltersToURL(DEFAULT_FILTERS);
  }, [pushFiltersToURL]);

  // ─── Data ──────────────────────────────────────────────────────────────────

  const { data: coursesData, isLoading, error } = useCourses();
  const courses = coursesData ?? initialCourses;

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
      if (c.program?.slug && !seen.has(c.program.slug)) {
        seen.set(c.program.slug, c.program.title ?? c.program.slug);
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
        const inTitle = course.title?.toLowerCase().includes(query) ?? false;
        const inDescription =
          course.description?.toLowerCase().includes(query) ?? false;
        if (!inTitle && !inDescription) return false;
      }

      if (filters.level !== "all" && course.level !== filters.level)
        return false;

      if (
        filters.programSlug !== "all" &&
        course.program?.slug !== filters.programSlug
      )
        return false;

      return true;
    });
  }, [courses, filters]);

  const programGroups = useMemo<ProgramGroup[]>(() => {
    const map = new Map<string, ProgramGroup>();

    for (const course of filteredCourses) {
      const key = course.program?.id ?? "standalone";
      if (!map.has(key)) {
        map.set(key, { program: course.program ?? null, courses: [] });
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

  // ─── Render states ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner fontSize="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive">
        Failed to load courses. Please refresh.
      </div>
    );
  }

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <Hero totalCourses={courses.length} />

      <main className="container mx-auto px-4 py-8">
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

        {showNoResults ? (
          <NoResults onClearFilters={handleClearFilters} />
        ) : (
          <CourseGrid programGroups={programGroups} />
        )}
      </main>

      <Footer />
    </div>
  );
}
