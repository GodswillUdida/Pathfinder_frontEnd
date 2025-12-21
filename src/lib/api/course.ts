import { safeFetch } from "@/lib/api/fetcher";
import type { Course } from "@/types/course";

type CoursesResponse = {
  courses: Course[];
};

type CourseResponse = {
  // success: boolean;
  course: Course;
};

export async function getCourses(): Promise<Course[]> {
  const res = await safeFetch<CoursesResponse>("/courses");
  return res?.courses ?? [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!id) return null;

  const res = await safeFetch<CourseResponse>(`/courses/${id}`);
  return res?.course ?? null;
}

export async function getCourseBySlugs(
  programSlug: string,
  courseSlug: string
): Promise<Course | null> {
  if (!programSlug || !courseSlug) return null;

  const res = await safeFetch<CourseResponse>(
    `/courses/${programSlug}/${courseSlug}`
  );

  return res?.course ?? null;
}
