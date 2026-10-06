// lib/api/course.ts
import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginatedResponse } from "@/types";
import {
  CourseAnalytics,
  CourseFormInput,
  ListCoursesParams,
} from "@/types/admin";
import type {
  CourseCatalogItem,
  CourseAdminDetail,
  CoursePublicDetail,
} from "@/types/catalog";

// ─── FormData builder ─────────────────────────────────────────────────────────
// Rules:
//  1. File objects  → appended directly (multer handles them)
//  2. URL strings   → sent as thumbnail / videoPreview (backend accepts URL scalars)
//  3. Arrays        → JSON.stringify (backend parseJsonFields middleware)
//  4. Enums         → already UPPERCASE from schema — sent as-is
//  5. NEVER set Content-Type — browser sets multipart boundary automatically

export function buildCourseFormData(data: CourseFormInput): FormData {
  const fd = new FormData();

  fd.append("title", data.title.trim());
  fd.append("code", data.code.trim());
  fd.append("status", data.status);
  fd.append("level", data.level);
  fd.append("issuesCertificate", String(data.issuesCertificate));
  fd.append("description", data.description.trim());

  if (data.slug?.trim()) fd.append("slug", data.slug.trim());
  if (data.instructorId) fd.append("instructorId", data.instructorId);

  // Thumbnail: File → binary field name multer expects; string → URL scalar
  if (data.thumbnail instanceof File) {
    fd.append("thumbnail", data.thumbnail, data.thumbnail.name);
  } else if (typeof data.thumbnail === "string" && data.thumbnail.trim()) {
    fd.append("thumbnail", data.thumbnail.trim());
  }

  // Video preview: same pattern — field name must match multer.fields()
  if (data.videoPreview instanceof File) {
    fd.append("videoPreview", data.videoPreview, data.videoPreview.name);
  } else if (
    typeof data.videoPreview === "string" &&
    data.videoPreview.trim()
  ) {
    fd.append("videoPreview", data.videoPreview.trim());
  }

  fd.append("tags", JSON.stringify(data.tags ?? []));
  fd.append("pricings", JSON.stringify(data.pricings ?? []));

  return fd;
}

function hasMediaFile(data: CourseFormInput): boolean {
  return (
    data.thumbnail instanceof File || data.videoPreview instanceof File
  );
}

// ─── Course API ───────────────────────────────────────────────────────────────

export const courseApi = {
  /**
   * GET /courses
   * Shape: { success, data: CourseCatalogItem[], meta }
   */
  list(
    params: ListCoursesParams = {},
  ): Promise<PaginatedResponse<CourseCatalogItem>> {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.perPage) qs.set("perPage", String(params.perPage));
    if (params.search) qs.set("search", params.search);
    if (params.programId) qs.set("programId", params.programId);
    if (params.status) qs.set("status", params.status);
    if (params.level) qs.set("level", params.level);

    const query = qs.toString();
    return apiClient.get(`/courses${query ? `?${query}` : ""}`) as Promise<
      PaginatedResponse<CourseCatalogItem>
    >;
  },

  /** GET /courses/:id */
  getById(id: string): Promise<ApiResponse<CourseAdminDetail>> {
    return apiClient.get<CourseAdminDetail>(`/courses/${id}`);
  },

  /** GET /courses/slug/:courseSlug */
  getByCourseSlug(
    courseSlug: string,
  ): Promise<ApiResponse<CoursePublicDetail>> {
    return apiClient.get<CoursePublicDetail>(
      `/courses/slug/${courseSlug}`,
    );
  },

  /** GET /courses/slug/:programSlug/:courseSlug */
  getBySlug(
    programSlug: string,
    courseSlug: string,
  ): Promise<ApiResponse<CoursePublicDetail>> {
    return apiClient.get<CoursePublicDetail>(
      `/courses/slug/${programSlug}/${courseSlug}`,
    );
  },

  /** GET /courses/:id/analytics */
  getAnalytics(id: string): Promise<ApiResponse<CourseAnalytics>> {
    return apiClient.get<CourseAnalytics>(`/courses/${id}/analytics`);
  },

  /**
   * POST /courses/:programId
   * Multipart when a File is present; JSON otherwise.
   */
  create(
    programId: string,
    data: CourseFormInput,
  ): Promise<ApiResponse<CourseAdminDetail>> {
    if (!hasMediaFile(data)) {
      return apiClient.post<CourseAdminDetail>(
        `/courses/${programId}`,
        data as unknown as Record<string, unknown>,
      );
    }
    return apiClient.post<CourseAdminDetail>(
      `/courses/${programId}`,
      buildCourseFormData(data),
    );
  },

  /**
   * PATCH /courses/:id
   * Multipart when a File is present; JSON otherwise.
   */
  update(
    id: string,
    data: CourseFormInput,
    onUploadProgress?: (pct: number) => void,
  ): Promise<ApiResponse<CourseAdminDetail>> {
    if (!hasMediaFile(data)) {
      return apiClient.patch<CourseAdminDetail>(
        `/courses/${id}`,
        data as unknown as Record<string, unknown>,
        { onUploadProgress },
      );
    }
    return apiClient.patch<CourseAdminDetail>(
      `/courses/${id}`,
      buildCourseFormData(data),
      { onUploadProgress },
    );
  },

  /** POST /courses/:id/publish */
  publish(id: string): Promise<ApiResponse<CourseAdminDetail>> {
    return apiClient.post<CourseAdminDetail>(`/courses/${id}/publish`);
  },

  /** POST /courses/:id/unpublish */
  unpublish(id: string): Promise<ApiResponse<CourseAdminDetail>> {
    return apiClient.post<CourseAdminDetail>(`/courses/${id}/unpublish`);
  },

  /** POST /courses/:id/archive */
  archive(id: string): Promise<ApiResponse<CourseAdminDetail>> {
    return apiClient.post<CourseAdminDetail>(`/courses/${id}/archive`);
  },

  /** DELETE /courses/:id */
  delete(courseId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/courses/${courseId}`);
  },
} as const;