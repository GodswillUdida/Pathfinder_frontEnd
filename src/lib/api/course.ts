// "use server";

import { Course } from "@/types/course";

interface FetchCoursesResponse {
  courses: Course[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function safeURL(path: string) {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return `${API_BASE}${path}`;
}

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const url = safeURL(path);

    if (!url) return null;

    const res = await fetch(url, {
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch ${path}: ${res.status} — ${text}`);
    }
    const data = await res.json();
    return data ?? null;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

export async function getCourses(): Promise<Course[]> {
  const data = await safeFetch<FetchCoursesResponse>(`/courses`);
  return data?.courses ?? [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const data = await safeFetch<Course>(`/courses/${id}`);
  return data ?? null;
}

export async function getCourseBySlugs(
  programSlug: string,
  courseSlug: string
): Promise<Course | null> {
  const data = await safeFetch<Course>(
    `/programs/${programSlug}/courses/${courseSlug}`
  );
  return data ?? null;
}
