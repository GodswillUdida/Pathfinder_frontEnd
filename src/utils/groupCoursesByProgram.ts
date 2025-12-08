// import type { Course } from "@/hooks/useCourses";

import { Course } from "@/types/course";

export type ProgramGroup = {
  id: string;
  title: string;
  image?: string;
  courses: Course[];
};

const DEFAULT_PROGRAM_IMAGE = "/default-program-image.jpg";
const DEFAULT_COURSE_THUMB = "/default-course.jpg";

export function groupCoursesByProgram(items: Course[]): ProgramGroup[] {
  const map = new Map<string, ProgramGroup>();

  for (const c of items) {
    const programTitle = c.program?.title ?? "Standalone Courses";
    const programId = c.program?.id ?? "standalone";
    const programImage =
      c.program?.image ?? c.thumbnail ?? DEFAULT_PROGRAM_IMAGE;

    if (!map.has(programTitle)) {
      map.set(programTitle, {
        id: programId,
        title: programTitle,
        image: programImage,
        courses: [],
      });
    }

    const normalized: Course = {
      ...c,
      price: typeof c.price === "number" ? c.price : Number(c.price) || 0,
      category: c.category ?? "Uncategorized",
      level: c.level ?? "unknown",
      type: c.type ?? "online",
      thumbnail: c.thumbnail ?? DEFAULT_COURSE_THUMB,
    };

    map.get(programTitle)!.courses.push(normalized);
  }

  return Array.from(map.values());
}
