import type { Course } from "@/types/course";
import { apiClient } from "./client";
import { CoursePayload, CreateCourseResponse } from "@/hooks/useCourses";

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

export async function createCourse(payload: CoursePayload): Promise<Course> {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("type", payload.type);

  payload.description && formData.append("description", payload.description);
  payload.slug && formData.append("slug", payload.slug);
  payload.level && formData.append("level", payload.level);
  payload.duration && formData.append("duration", payload.duration);
  payload.category && formData.append("category", payload.category);
  payload.location && formData.append("location", payload.location);
  payload.schedule && formData.append("schedule", payload.schedule);

  payload.tags?.forEach((tag) => formData.append("tags[]", tag));

  if (payload.thumbnail instanceof File) {
    formData.append("thumbnail", payload.thumbnail);
  } else if (typeof payload.thumbnail === "string") {
    formData.append("thumbnailUrl", payload.thumbnail);
  }

  const res = await apiClient.post<CreateCourseResponse, FormData>(
    `/programs/${payload.programId}/courses/${payload.type}`,
    formData
  );

  return res.course;
}

export async function getCourses(): Promise<Course[]> {
  const res = await apiClient.get<CoursesResponse>("/courses");
  if (!res.success) {
    console.error("Failed to fetch courses:", res);
  }
  return res.data;
}

export async function getCourseById(id: string): Promise<Course | null> {
  if (!id) {
    throw new Error("Course ID is required");
  }

  const res = await apiClient.get<CourseResponse>(`/courses/${id}`);
  return res.data;
}

export async function getCourseBySlugs(
  programSlug: string,
  courseSlug: string
): Promise<Course> {
  if (!programSlug || !courseSlug) {
    throw new Error("Program slug and course slug are required");
  }

  const res = await apiClient.get<CourseResponse>(
    `/courses/${programSlug}/${courseSlug}`
  );

  return res.data;
}
