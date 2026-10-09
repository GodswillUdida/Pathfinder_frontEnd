// hooks/useCourses.ts
// Uses the SAME apiClient as useAdminPrograms — refresh token logic is
// centralised there. Import from @/lib/api/client, not a stale path.

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from "@tanstack/react-query";
import { courseApi } from "@/lib/api/course";
import type {
  CourseCatalogItem,
  CourseAdminDetail,
  CourseDetailItem,
  CoursePublicDetail,
} from "@/types/catalog";
import {
  CourseAnalytics,
  CourseFormInput,
  ListCoursesParams,
} from "@/types/admin";
import { ApiResponse, PaginatedResponse } from "@/types";

// ─── Query key factory ────────────────────────────────────────────────────────
// Single source of truth. Server-side prefetch MUST use this factory too.

export const courseKeys = {
  all: () => ["courses"] as const,
  lists: () => [...courseKeys.all(), "list"] as const,
  list: (params: ListCoursesParams) =>
    [...courseKeys.lists(), params] as const,
  details: () => [...courseKeys.all(), "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  analytics: (id: string) =>
    [...courseKeys.detail(id), "analytics"] as const,
  bySlug: (pSlug: string, cSlug: string) =>
    [...courseKeys.all(), "slug", pSlug, cSlug] as const,
  byCourseSlug: (courseSlug: string) =>
    [...courseKeys.all(), "slug", courseSlug] as const,
} as const;

// ─── Shared cache helpers ─────────────────────────────────────────────────────

function setCourseDetail(
  qc: ReturnType<typeof useQueryClient>,
  response: ApiResponse<CourseAdminDetail>,
) {
  const course = response.data;
  if (!course?.id) return;

  // Keep cache shape consistent with useCourse queryFn (ApiResponse wrapper)
  qc.setQueryData<ApiResponse<CourseAdminDetail>>(
    courseKeys.detail(course.id),
    response,
  );
}

function invalidateCourseLists(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: courseKeys.lists() });
}

// ─── List ─────────────────────────────────────────────────────────────────────

export function useCoursesList(
  params: ListCoursesParams = {},
): UseQueryResult<PaginatedResponse<CourseCatalogItem>, Error> {
  return useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseApi.list(params),
    staleTime: 30_000,
    retry: 2,
  });
}

// ─── Single course (admin detail) ─────────────────────────────────────────────

export function useCourse(
  id: string,
): UseQueryResult<ApiResponse<CourseAdminDetail>, Error> {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.getById(id),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  });
}

// ─── By slug (program + course) ───────────────────────────────────────────────

export function useCourseBySlug(
  programSlug: string,
  courseSlug: string,
): UseQueryResult<ApiResponse<CoursePublicDetail>, Error> {
  return useQuery({
    queryKey: courseKeys.bySlug(programSlug, courseSlug),
    queryFn: () => courseApi.getBySlug(programSlug, courseSlug),
    enabled: !!(programSlug && courseSlug),
    staleTime: 60_000,
  });
}

// ─── By course slug only ──────────────────────────────────────────────────────

// export function useStandaloneCourse(
//   courseSlug: string,
// ): UseQueryResult<ApiResponse<CourseDetailItem>, Error> {
//   return useQuery({
//     queryKey: courseKeys.byCourseSlug(courseSlug),
//     queryFn: () => courseApi.getByCourseSlug(courseSlug),
//     enabled: !!courseSlug,
//     staleTime: 60_000,
//   });
// }

// ─── Analytics ────────────────────────────────────────────────────────────────

export function useCourseAnalytics(
  id: string,
): UseQueryResult<ApiResponse<CourseAnalytics>, Error> {
  return useQuery({
    queryKey: courseKeys.analytics(id),
    queryFn: () => courseApi.getAnalytics(id),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 1000 * 60 * 30,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export interface CreateCourseVars {
  programId: string;
  data: CourseFormInput;
  onUploadProgress?: (pct: number) => void;
}

export function useCreateCourse(): UseMutationResult<
  ApiResponse<CourseAdminDetail>,
  Error,
  CreateCourseVars
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ programId, data }) => courseApi.create(programId, data),
    onSuccess: (response) => {
      setCourseDetail(qc, response);
      invalidateCourseLists(qc);
    },
  });
}

// ─── Update (optimistic scalars + rollback) ───────────────────────────────────

export interface UpdateCourseVars {
  courseId: string;
  programId?: string;
  data: CourseFormInput;
  onUploadProgress?: (pct: number) => void;
}

export function useUpdateCourse(): UseMutationResult<
  ApiResponse<CourseAdminDetail>,
  Error,
  UpdateCourseVars
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, data, onUploadProgress }) =>
      courseApi.update(courseId, data, onUploadProgress),

    // Only scalar fields shared between form + admin detail.
    // pricings left to onSuccess — form shape ≠ cached CoursePricing.
    onMutate: async ({ courseId, data }) => {
      await qc.cancelQueries({ queryKey: courseKeys.detail(courseId) });

      const previous = qc.getQueryData<ApiResponse<CourseAdminDetail>>(
        courseKeys.detail(courseId),
      );

      qc.setQueryData<ApiResponse<CourseAdminDetail>>(
        courseKeys.detail(courseId),
        (old) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: {
              ...old.data,
              title: data.title,
              description: data.description ?? old.data.description,
              level: data.level ?? old.data.level,
              status: data.status ?? old.data.status,
              tags: data.tags ?? old.data.tags,
              issuesCertificate:
                data.issuesCertificate ?? old.data.issuesCertificate,
            },
          };
        },
      );

      return { previous };
    },

    onError: (_err, { courseId }, context) => {
      if (context?.previous) {
        qc.setQueryData(courseKeys.detail(courseId), context.previous);
      }
    },

    onSuccess: (response, { courseId }) => {
      qc.setQueryData(courseKeys.detail(courseId), response);
      invalidateCourseLists(qc);
    },
  });
}

// ─── Status transitions ───────────────────────────────────────────────────────

type StatusMutationResult = UseMutationResult<
  ApiResponse<CourseAdminDetail>,
  Error,
  string
>;

function useCourseStatusMutation(
  action: "publish" | "unpublish" | "archive",
): StatusMutationResult {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseApi[action](id),
    onSuccess: (response) => {
      setCourseDetail(qc, response);
      invalidateCourseLists(qc);
      // Analytics may depend on status / visibility
      if (response.data?.id) {
        qc.invalidateQueries({
          queryKey: courseKeys.analytics(response.data.id),
        });
      }
    },
  });
}

export function usePublishCourse(): StatusMutationResult {
  return useCourseStatusMutation("publish");
}

export function useUnpublishCourse(): StatusMutationResult {
  return useCourseStatusMutation("unpublish");
}

export function useArchiveCourse(): StatusMutationResult {
  return useCourseStatusMutation("archive");
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export interface DeleteCourseVars {
  courseId: string;
}

export function useDeleteCourse(): UseMutationResult<
  ApiResponse<void>,
  Error,
  DeleteCourseVars
> {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId }) => courseApi.delete(courseId),
    onSuccess: (_res, { courseId }) => {
      qc.removeQueries({ queryKey: courseKeys.detail(courseId) });
      qc.removeQueries({ queryKey: courseKeys.analytics(courseId) });
      // Prefix match — every list(params) variant
      invalidateCourseLists(qc);
    },
  });
}