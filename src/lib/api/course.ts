// "use server";

import { Course } from "@/types/course";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export async function getCourses(): Promise<Course[]> {
  const url = `${API_BASE}/course`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    // next: { revalidate: 60 }, // uncomment if you want ISR
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch courses: ${res.status} — ${text}`);
  }

  const data = await res.json();

  // console.log("Response:", res);
  // console.log("Data:", data.courses ?? data);

  // backend should return { items: Course[] } or []
  return data.courses ?? data ?? [];
}

export async function getCourseById(id: string): Promise<Course | null> {
  const url = `${API_BASE}/courses/${id}`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch course ${id}: ${res.status} — ${text}`);
  }
  const data = await res.json();
  return data ?? null;
}

export async function getCourseBySlugs(
  programSlug: string,
  courseSlug: string
): Promise<Course | null> {
  try {
    const url = `${API_BASE}/course/${programSlug}/${courseSlug}`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(
        `Failed to fetch course ${courseSlug} in program ${programSlug}: ${res.status} — ${text}`
      );
    }
    const data = await res.json();
    console.log("Fetched course data:", data.course);
    return data.course ?? null;
  } catch (error) {
    console.error("Error fetching course by slugs:", error);
    return null;
  }
}
