"use client";

import { useState, useMemo, useCallback } from "react";
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
  initialCourses: Course[];
}

export function CoursesClient({ initialCourses = [] }: CoursesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fetch data with hydration + React Query
  const { data, isLoading, error } = useCourses({
    initialData: initialCourses
  });

  const courses = useMemo<Course[]>(
    () => 
      data ?? initialCourses ?? [],
    [data, initialCourses]
  )

  // Load filters from URL
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: searchParams.get("q") ?? "",
    category: searchParams.get("category") ?? "all",
    level: searchParams.get("level") ?? "all",
    mode: searchParams.get("mode") ?? "all",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Sync filters to URL
  const updateURL = useCallback(
    (next: FilterState) => {
      const params = new URLSearchParams();

      if (next.searchQuery) params.set("q", next.searchQuery);
      if (next.category !== "all") params.set("category", next.category);
      if (next.level !== "all") params.set("level", next.level);
      if (next.mode !== "all") params.set("mode", next.mode);

      router.push(params.toString(), {
        scroll: false,
      });
    },
    [router]
  );

  const debouncedUpdateURL = useDebouncedCallback(updateURL, 300);

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);

      if (key === "searchQuery") {
        debouncedUpdateURL(next);
      } else {
        updateURL(next);
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

  // Filter options (unique)
  const categories = useMemo(
    () => getUniqueValues(courses, "category"),
    [courses]
  );

  const levels = useMemo(() => getUniqueValues(courses, "level"), [courses]);

  const modes = useMemo(() => getUniqueValues(courses, "type"), [courses]);

  // Filtered + Program grouped
  const filteredCourses = useMemo(
    () => filterCourses(courses, filters),
    [courses, filters]
  );

  const programGroups = useMemo(
    () => groupCoursesByProgram(filteredCourses),
    [filteredCourses]
  );

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.category !== "all" ||
    filters.level !== "all" ||
    filters.mode !== "all";

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
        showFilters={showFilters}
        setShowFilters={setShowFilters}
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
