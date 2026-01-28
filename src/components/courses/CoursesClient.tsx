"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Hero } from "@/components/courses/Hero";
import { Filters } from "@/components/courses/Filters";
import { CourseGrid } from "@/components/courses/CourseGrid";
import { NoResults } from "@/components/courses/NoResults";
import { FilterState, Course } from "@/types/course";
import {
  groupCoursesByProgram,
  filterCourses,
  getUniqueValues,
} from "@/utils/courseFilters";
import { useDebouncedCallback } from "use-debounce";
import { useCourses } from "@/hooks/useCourses";
import { Spinner } from "@/components/ui/spinner";
import Footer from "@/components/layout/Footer";

interface CoursesClientProps {
  initialCourses?: Course[];
}

export function CoursesClient({ initialCourses = [] }: CoursesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ----------------- Filters synced with URL -----------------
  const getFiltersFromURL = useCallback((): FilterState => {
    return {
      searchQuery: searchParams.get("q") ?? "",
      category: searchParams.get("category") ?? "all",
      level: searchParams.get("level") ?? "all",
      mode: searchParams.get("mode") ?? "all",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterState>(getFiltersFromURL);

  // Update URL without full page reload
  const updateURL = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams();
      if (next.searchQuery) params.set("q", next.searchQuery);
      if (next.category !== "all") params.set("category", next.category);
      if (next.level !== "all") params.set("level", next.level);
      if (next.mode !== "all") params.set("mode", next.mode);

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Debounced URL update for search input
  const debouncedUpdateURL = useDebouncedCallback(updateURL, 300);

  // ----------------- Handle filter changes -----------------
  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);

      if (key === "searchQuery") {
        debouncedUpdateURL(next); // debounce typing
      } else {
        updateURL(next); // immediate for selects
      }
    },
    [filters, debouncedUpdateURL, updateURL]
  );

  const clearFilters = useCallback(() => {
    const base: FilterState = {
      searchQuery: "",
      category: "all",
      level: "all",
      mode: "all",
    };
    setFilters(base);
    updateURL(base);
  }, [updateURL]);

  // ----------------- Fetch courses -----------------
  const { data: coursesData, isLoading, error } = useCourses({
    programId: filters.mode !== "all" ? filters.mode : "",
  });

  const courses = useMemo<Course[]>(() => coursesData ?? initialCourses, [
    coursesData,
    initialCourses,
  ]);

  // ----------------- Filtered & grouped courses -----------------
  const filteredCourses = useMemo(
    () => filterCourses(courses, filters),
    [courses, filters]
  );

  const programGroups = useMemo(
    () => groupCoursesByProgram(filteredCourses),
    [filteredCourses]
  );

  // ----------------- Filter options -----------------
  const categories = useMemo(() => getUniqueValues(courses, "category"), [
    courses,
  ]);
  const levels = useMemo(() => getUniqueValues(courses, "level"), [courses]);
  const modes = useMemo(() => getUniqueValues(courses, "type"), [courses]);

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.category !== "all" ||
    filters.level !== "all" ||
    filters.mode !== "all";

  // ----------------- Sync filters with URL on mount -----------------
  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    setFilters(urlFilters);
  }, [getFiltersFromURL]);

  // ----------------- Render -----------------
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner fontSize="lg" />
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Failed to load courses.
      </div>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <Hero totalCourses={courses.length} />

      <Filters
        categories={categories}
        levels={levels}
        modes={modes}
        filters={filters}
        onFilterChange={handleFilterChange}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
        showFilters={false} // default hidden on mobile
        setShowFilters={() => {}} // can add toggle for mobile
        filteredCount={filteredCourses.length}
        totalCourses={courses.length}
      />

      {programGroups.length === 0 && hasActiveFilters ? (
        <NoResults onClearFilters={clearFilters} />
      ) : (
        <CourseGrid programGroups={programGroups} />
      )}

      <Footer />
    </div>
  );
}
