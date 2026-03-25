import { safeFetch } from "@/lib/api/fetcher";
import type { Course } from "@/types/course";

type CoursesResponse = {
  success: boolean;
  data: Course[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
};

type CourseResponse = {
  success: boolean;
  data: Course;
};

export async function getCourses(): Promise<Course[]> {
  const res = await safeFetch<CoursesResponse>("/courses");
  if (!res?.data) return [];
  return res.data;
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!id) {
    throw new Error("Course ID is required");
  }

  const res = await safeFetch<CourseResponse>(`/courses/${id}`);
  return res.data;
}

export async function getCourseBySlugs(
  programSlug: string,
  courseSlug: string
): Promise<Course> {
  if (!programSlug || !courseSlug) {
    throw new Error("Program slug and course slug are required");
  }

  const res = await safeFetch<CourseResponse>(
    `/courses/${programSlug}/${courseSlug}`
  );

  return res.data;
}
