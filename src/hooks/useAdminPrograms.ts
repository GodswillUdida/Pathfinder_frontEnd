/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Program, ProgramDetail } from "@/types/domain";

export const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (filters?: string) => [...programKeys.lists(), filters] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  slug: (slug: string) => [...programKeys.all, "slug", slug] as const,
};

// Fetch all admin program
export function useProgramList() {
  return useQuery({
    queryKey: programKeys.lists(),
    queryFn: async () => {
      const res = await apiClient.get<Program[]>("/programs");

      if (!res.success) {
        throw new Error("Failed to fetch programs");
      }
      return res.data; //only return the data array, not the whole response
    },
    staleTime: 1000 * 5, // ✅ 5 secs
    gcTime: 1000 * 60, // ✅ 1 min
    retry: 2,
  });
}

// Fetch single Program
export function useProgram(programId?: string) {
  return useQuery({
    queryKey: programKeys.detail(programId ?? ""),
    enabled: Boolean(programId),
    queryFn: async () => {
      if (!programId) {
        throw new Error("Program ID is required");
      }
      const res = await apiClient.get<ProgramDetail>(`/programs/${programId}`);

      if (!res.success || !res.data) {
        throw new Error(res.message || "Failed to fetch program");
      }

      return res.data; //only return the data object, not the whole response
    },
    staleTime: 1000 * 60 * 5, // ✅ 5 min
    gcTime: 1000 * 60 * 2, // ✅ 2 min
  });
}

// ----------------------
// GET PROGRAM BY SLUG (missing before)
// ----------------------
export function useProgramBySlug(slug?: string) {
  return useQuery({
    queryKey: slug ? programKeys.slug(slug) : [],
    enabled: !!slug,
    queryFn: async () => {
      const res = await apiClient.get<Program>(`/programs/by-slug/${slug}`);

      if (!res.success || !res.data)
        throw new Error("Failed to fetch program by slug");

      return res.data;
    },
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => {
      const res = await apiClient.post<Program>("/programs", payload);

      if (!res?.success || !res.data) {
        throw new Error(res?.message || "Failed to create program");
      }
      return res.data;
    },
    onSuccess: async () => {
      // queryClient.setQueryData<{ programs: Program[] }>(
      //   ["programs", "admin"],
      //   (old) => ({
      //     programs: old ? [...old.programs, newProgram] : [newProgram],
      //   }),
      // );
      await queryClient.invalidateQueries({
        queryKey: programKeys.lists(),
      });
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}

export function useUpdateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      programId,
      data,
    }: {
      programId: string;
      data: {
        title?: string;
        description?: string;
        image?: string;
        status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      };
    }) => {
      const res = await apiClient.patch<Program>(
        `/programs/${programId}`,
        data,
      );

      if (!res?.success || !res.data) {
        throw new Error(res?.message || "Failed to update program");
      }

      return res.data;
    },

    onSuccess: async (updatedProgram) => {
      queryClient.setQueryData(
        programKeys.detail(updatedProgram.id),
        updatedProgram,
      );

      await queryClient.invalidateQueries({
        queryKey: programKeys.lists(),
      });
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      const res = await apiClient.delete(`/programs/${programId}`);

      if (!res?.success) {
        throw new Error(res.message || "Failed to delete program");
      }
      return programId;
    },
    onSuccess: async (deletedId) => {
      queryClient.removeQueries({
        queryKey: programKeys.detail(deletedId),
      });

      await queryClient.invalidateQueries({
        queryKey: programKeys.lists(),
      });

      // queryClient.setQueryData<{ programs: Program[] }>(
      //   ["programs", "admin"],
      //   (old) => ({
      //     programs: old
      //       ? old.programs.filter((program) => program.id !== deletedId)
      //       : [],
      //   }),
      // );
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}

/**
 * POST /api/v1/programs/:id/publish
 *
 * Publish a Program.
 */
export function usePublishProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      const res = await apiClient.post<Program>(
        `/programs/${programId}/publish`,
      );

      if (!res?.success || !res.data) {
        throw new Error(res?.message || "Failed to publish program");
      }

      return res.data;
    },
    onSuccess: async (updatedProgram) => {
      queryClient.setQueryData(
        programKeys.detail(updatedProgram.id),
        updatedProgram,
      );

      await queryClient.invalidateQueries({
        queryKey: programKeys.lists(),
      });
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}

/**
 * POST /api/v1/programs/:id/restore
 *
 * Restore a soft-deleted Program.
 */
export function useRestoreProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      const res = await apiClient.post<Program>(
        `/programs/${programId}/restore`,
      );

      if (!res?.success || !res.data) {
        throw new Error(res?.message || "Failed to restore program");
      }

      return res.data;
    },
    onSuccess: async (restoredProgram) => {
      queryClient.setQueryData(
        programKeys.detail(restoredProgram.id),
        restoredProgram,
      );

      await queryClient.invalidateQueries({
        queryKey: programKeys.lists(),
      });
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}

/**
 * POST /api/v1/programs/:id/archive
 *
 * Archive a Program.
 */
export function useArchiveProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      const res = await apiClient.post<Program>(
        `/programs/${programId}/archive`,
      );

      if (!res?.success || !res.data) {
        throw new Error(res?.message || "Failed to archive program");
      }

      return res.data;
    },
    onSuccess: async (archivedProgram) => {
      queryClient.setQueryData(
        programKeys.detail(archivedProgram.id),
        archivedProgram,
      );

      await queryClient.invalidateQueries({
        queryKey: programKeys.lists(),
      });
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}

export function useReorderCourses() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ programId, courseId, position }: { programId: string; courseId: string; position: number }) => {
      const res = await apiClient.patch(`/programs/${programId}/courses/reorder`, { courseId, position });
      if (!res?.success) {
        throw new Error(res.message || "Failed to reorder courses");
      }
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: programKeys.details(),
      });
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}
