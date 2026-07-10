// hooks/useCourses.ts
// Uses the SAME apiClient as useAdminPrograms — refresh token logic is centralised there.
// "Invalid or expired token" was caused by a stale import path that bypassed the
// cookie-credential fetch and interceptor chain. Fixed by importing from @/lib/api/client.

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import {
  courseApi,
  type ListCoursesParams,
  type CourseAnalytics,
} from "@/lib/api/course";
import type { CourseFormData } from "@/components/courses/course-form";
import type { ApiResponse, PaginatedResponse } from "@/types";
import { type Course } from "@/types/course";

// ─── Query key factory ────────────────────────────────────────────────────────

export const courseKeys = {
  all:       ()                             => ["courses"]                               as const,
  lists:     ()                             => [...courseKeys.all(), "list"]             as const,
  list:      (params: ListCoursesParams)    => [...courseKeys.lists(), params]           as const,
  details:   ()                             => [...courseKeys.all(), "detail"]           as const,
  detail:    (id: string)                   => [...courseKeys.details(), id]             as const,
  analytics: (id: string)                   => [...courseKeys.detail(id), "analytics"]  as const,
  bySlug:    (pSlug: string, cSlug: string) => [...courseKeys.all(), "slug", pSlug, cSlug] as const,
} as const;

// ─── List ─────────────────────────────────────────────────────────────────────

export function useCoursesList(
  params: ListCoursesParams = {}
): UseQueryResult<PaginatedResponse<Course>, Error> {
  return useQuery({
    queryKey:  courseKeys.list(params),
    queryFn:   () => courseApi.list(params),
    staleTime: 30_000,
    retry:     2,
  });
}

// ─── Single course ────────────────────────────────────────────────────────────

export function useCourse(id: string): UseQueryResult<ApiResponse<Course>, Error> {
  return useQuery({
    queryKey:  courseKeys.detail(id),
    queryFn:   () => courseApi.getById(id),
    enabled:   !!id,
    staleTime: 60_000,
    gcTime:    1000 * 60 * 30,
    retry:     2,
  });
}

// ─── By slug ──────────────────────────────────────────────────────────────────

export function useCourseBySlug(
  programSlug: string,
  courseSlug: string
): UseQueryResult<ApiResponse<Course>, Error> {
  return useQuery({
    queryKey: courseKeys.bySlug(programSlug, courseSlug),
    queryFn:  () => courseApi.getBySlug(programSlug, courseSlug),
    enabled:  !!(programSlug && courseSlug),
    staleTime: 60_000,
  });
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export function useCourseAnalytics(id: string): UseQueryResult<ApiResponse<CourseAnalytics>, Error> {
  return useQuery({
    queryKey:  courseKeys.analytics(id),
    queryFn:   () => courseApi.getAnalytics(id),
    enabled:   !!id,
    staleTime: 60_000,
    gcTime:    1000 * 60 * 30,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export interface CreateCourseVars {
  programId:         string;
  data:              CourseFormData;
  onUploadProgress?: (pct: number) => void;
}

export function useCreateCourse(): UseMutationResult<
  ApiResponse<Course>,
  Error,
  CreateCourseVars
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, data, onUploadProgress }) =>
      courseApi.create(programId, data, onUploadProgress),

    onSuccess: (response) => {
      // Invalidate all list queries
      qc.invalidateQueries({ queryKey: courseKeys.lists() });
      // Seed detail cache to avoid a redundant fetch
      if (response.data?.id) {
        qc.setQueryData(courseKeys.detail(response.data.id), response);
      }
    },

    onError: (err: Error) => {
      if (err.message?.toLowerCase().includes("token")) {
        // Auth error already handled by apiClient's auth:expired event
        // Log for observability but don't double-handle
        console.warn("[useCourses] Auth error on create:", err.message);
      }
    },
  });
}

// ─── Update (with optimistic update + rollback) ───────────────────────────────

export interface UpdateCourseVars {
  courseId:          string;
  programId:         string;
  data:              CourseFormData;
  onUploadProgress?: (pct: number) => void;
}

export function useUpdateCourse(): UseMutationResult<
  ApiResponse<Course>,
  Error,
  UpdateCourseVars
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data, onUploadProgress }) =>
      courseApi.update(courseId, data, onUploadProgress),

    // Optimistic update — update UI before server confirms
    onMutate: async ({ courseId, data }) => {
      await qc.cancelQueries({ queryKey: courseKeys.detail(courseId) });

      const previous = qc.getQueryData<ApiResponse<Course>>(courseKeys.detail(courseId));

      qc.setQueryData<ApiResponse<Course>>(courseKeys.detail(courseId), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            title:       data.title,
            description: data.description ?? old.data.description,
            level:       data.level       ?? old.data.level,
            status:      data.status      ?? old.data.status,
            tags:        data.tags        ?? old.data.tags,
            pricings:    data.pricings    ?? old.data.pricings,
          },
        };
      });

      return { previous };
    },

    // Roll back on failure
    onError: (_err, { courseId }, context) => {
      if (context?.previous) {
        qc.setQueryData(courseKeys.detail(courseId), context.previous);
      }
    },

    // Settle with server truth
    onSuccess: (response, { courseId }) => {
      qc.setQueryData(courseKeys.detail(courseId), response);
      qc.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export interface DeleteCourseVars {
  courseId:  string;
  programId: string;
}

export function useDeleteCourse(): UseMutationResult<
  ApiResponse<void>,
  Error,
  DeleteCourseVars
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId }) => courseApi.delete(courseId),

    onSuccess: (_, { courseId }) => {
      qc.removeQueries({ queryKey: courseKeys.detail(courseId) });
      qc.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
}