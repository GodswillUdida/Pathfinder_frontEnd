import { Course, ProgramGroup, FilterState } from "@/types/course";

export function groupCoursesByProgram(courses: Course[]): ProgramGroup[] {
  const groups = new Map<string, Course[]>();

  courses.forEach((course) => {
    const programId = course.program?.id ?? "uncategorized";
    const existing = groups.get(programId) ?? [];
    groups.set(programId, [...existing, course]);
  });

  return Array.from(groups.entries()).map(([programId, courses]) => ({
    programId,
    programName: courses[0]?.program?.title ?? "Other Courses",
    courses,
  }));
}

export function filterCourses(
  courses: Course[],
  filters: FilterState
): Course[] {
  const normalizedQuery = filters.searchQuery.toLowerCase().trim();

  return courses.filter((course) => {
    // Search filter
    const matchesSearch =
      !normalizedQuery ||
      course.title.toLowerCase().includes(normalizedQuery) ||
      course.description?.toLowerCase().includes(normalizedQuery) ||
      course.tags?.some((tag) => tag.toLowerCase().includes(normalizedQuery));

    // Category filter
    const matchesCategory =
      filters.category === "all" || course.category === filters.category;

    // Level filter
    const matchesLevel =
      filters.level === "all" || course.level === filters.level;

    // Mode filter
    const matchesMode = filters.mode === "all" || course.type === filters.mode;

    return matchesSearch && matchesCategory && matchesLevel && matchesMode;
  });
}

export function getUniqueValues<T extends keyof Course>(
  courses: Course[],
  key: T
): string[] {
  return [...new Set(courses.map((c) => String(c[key])))].filter(Boolean);
}
