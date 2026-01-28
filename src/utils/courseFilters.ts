import { Course, ProgramGroup, FilterState } from "@/types/course";

export function groupCoursesByProgram(courses: Course[]): ProgramGroup[] {
  const groups = new Map<string, ProgramGroup>();

  for (const course of courses) {
    const programId = course.program?.id ?? "uncategorized";

    if (!groups.has(programId)) {
      groups.set(programId, {
        programId,
        programName: course.program?.title ?? "Other Courses",
        courses: [],
      });
    }

    groups.get(programId)!.courses.push(course);
  }

  return Array.from(groups.values());
}


export function filterCourses(
  courses: Course[],
  filters: FilterState
): Course[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return courses.filter((course) => {
    // Search
    if (query) {
      const haystack = [
        course.title,
        course.description,
        ...(course.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(query)) return false;
    }

    // Category
    if (filters.category !== "all" && course.category !== filters.category) {
      return false;
    }

    // Level
    if (filters.level !== "all" && course.level !== filters.level) {
      return false;
    }

    // Mode
    if (filters.mode !== "all" && course.type !== filters.mode) {
      return false;
    }

    return true;
  });
}


export function getUniqueValues<T extends keyof Course>(
  courses: Course[],
  key: T
): string[] {
  const values = new Set<string>();

  for (const course of courses) {
    const value = course[key];

    if (typeof value === "string" && value.trim()) {
      values.add(value);
    }
  }

  return Array.from(values);
}

