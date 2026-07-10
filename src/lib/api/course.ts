// lib/api/course.ts
import { apiClient } from "@/lib/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types";
import type { CourseFormData } from "@/components/courses/course-form";
import { Course } from "@/types/course";

// ─── Query params ─────────────────────────────────────────────────────────────

export interface ListCoursesParams {
  page?:      number;
  perPage?:   number;
  search?:    string;
  programId?: string;
  status?:    string;
  level?:     string;
}

// ─── FormData builder ─────────────────────────────────────────────────────────
// Rules:
//  1. File objects  → appended directly (multer handles them)
//  2. URL strings   → sent as thumbnailUrl / videoPreviewUrl
//  3. Arrays        → JSON.stringify (backend parseJsonFields middleware)
//  4. Enums         → already UPPERCASE from schema — sent as-is
//  5. NEVER set Content-Type — browser sets multipart boundary automatically

export function buildCourseFormData(data: CourseFormData): FormData {
  const fd = new FormData();

  fd.append("title",  data.title.trim());

  // Enums are already UPPERCASE from the Zod schema
  fd.append("status", data.status);

  if (data.slug?.trim())        fd.append("slug",        data.slug.trim());
  if (data.description?.trim()) fd.append("description", data.description.trim());
  if (data.level)               fd.append("level",       data.level);   // "BEGINNER" | ...

  // Thumbnail: File → binary upload, string → URL reference
  if (data.thumbnail instanceof File) {
    fd.append("thumbnail",    data.thumbnail, data.thumbnail.name);
  } else if (data.thumbnail?.trim()) {
    fd.append("thumbnailUrl", data.thumbnail.trim());
  }

  // Video preview: same pattern
  if (data.videoPreview instanceof File) {
    fd.append("videoPreview",    data.videoPreview, data.videoPreview.name);
  } else if (data.videoPreview?.trim()) {
    fd.append("videoPreviewUrl", data.videoPreview.trim());
  }

  // Arrays → JSON strings (backend parseJsonFields parses them back)
  fd.append("tags",     JSON.stringify(data.tags     ?? []));
  fd.append("pricings", JSON.stringify(data.pricings ?? []));

  return fd;
}

// ─── Analytics shape ─────────────────────────────────────────────────────────

export interface CourseAnalytics {
  courseId:         string;
  totalEnrollments: number;
  completionRate:   number;
  averageProgress:  number;
  revenue:          number;
}

// ─── Course API ───────────────────────────────────────────────────────────────

export const courseApi = {
  /**
   * GET /courses
   */
  list(params: ListCoursesParams = {}): Promise<PaginatedResponse<Course>> {
    const qs = new URLSearchParams();
    if (params.page)      qs.set("page",      String(params.page));
    if (params.perPage)   qs.set("perPage",   String(params.perPage));
    if (params.search)    qs.set("search",    params.search);
    if (params.programId) qs.set("programId", params.programId);
    if (params.status)    qs.set("status",    params.status);
    if (params.level)     qs.set("level",     params.level);
    const query = qs.toString();
    return apiClient.get<Course[]>(
      `/courses${query ? `?${query}` : ""}`
    ) as Promise<PaginatedResponse<Course>>;
  },

  /**
   * GET /courses/:id
   */
  getById(id: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>(`/courses/${id}`);
  },

  /**
   * GET /courses/:programSlug/:courseSlug
   */
  getBySlug(programSlug: string, courseSlug: string): Promise<ApiResponse<Course>> {
    return apiClient.get<Course>(`/courses/${programSlug}/${courseSlug}`);
  },

  /**
   * GET /courses/:id/analytics
   */
  getAnalytics(id: string): Promise<ApiResponse<CourseAnalytics>> {
    return apiClient.get<CourseAnalytics>(`/courses/${id}/analytics`);
  },

  /**
   * POST /courses/:programId   ← backend route: router.post("/:programId", ...)
   */
  create(
    programId: string,
    data: CourseFormData,
    onUploadProgress?: (pct: number) => void,
  ): Promise<ApiResponse<Course>> {
    const fd = buildCourseFormData(data);
    return apiClient.post<Course>(`/courses/${programId}`, fd, { onUploadProgress });
  },

  /**
   * PATCH /courses/:id         ← backend route: router.patch("/:id", ...)
   */
  update(
    id: string,
    data: CourseFormData,
    onUploadProgress?: (pct: number) => void,
  ): Promise<ApiResponse<Course>> {
    const fd = buildCourseFormData(data);
    return apiClient.patch<Course>(`/courses/${id}`, fd, { onUploadProgress });
  },

  /**
   * DELETE /courses/:id        ← backend route: router.delete("/:id", ...)
   */
  delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/courses/${id}`);
  },
} as const;