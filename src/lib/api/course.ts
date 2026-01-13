import { safeFetch } from "@/lib/api/fetcher";
import type { Course } from "@/types/course";

type CoursesResponse = {
  success: boolean;
  courses: Course[];
};

type CourseResponse = {
  course: Course;
};

export async function getCourses(): Promise<Course[]> {
  const { courses } = await safeFetch<CoursesResponse>("/courses");
  return courses;
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!id) {
    throw new Error("Course ID is required");
  }

  const { course } = await safeFetch<CourseResponse>(`/courses/${id}`);
  return course;
}

export async function getCourseBySlugs(
  programSlug: string,
  courseSlug: string
): Promise<Course> {
 if (!programSlug || !courseSlug) {
    throw new Error("Program slug and course slug are required");
  }

  const { course } = await safeFetch<CourseResponse>(
    `/courses/${programSlug}/${courseSlug}`
  );

  return course;
}