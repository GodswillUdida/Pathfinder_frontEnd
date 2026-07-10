/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { ApiResponse, PaginatedResponse } from "@/types";
import { Program, ProgramDetail } from "@/types/program";

// interface Program {
//   id: string;
//   title: string;
//   description?: string;
//   slug: string;
//   image?: string;
//   courses: Course[];
//   createdAt: string;
//   updatedAt: string;
//   deletedAt: string;
// }

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
    staleTime: 1000 * 60 * 5, // ✅ 5 min
    gcTime: 1000 * 60 * 30,   // ✅ 30 min
    retry: 2,
  });
}

// Fetch single Program
export function useProgram(programId?: string) {
  return useQuery({
    queryKey: programId ? programKeys.detail(programId) : [],
    enabled: !!programId,
    queryFn: async () => {
      const res = await apiClient.get<ProgramDetail>(`/programs/${programId}`);

      if (!res.success) {
        throw new Error(res.message || "Failed to fetch program");
      }

      return res.data; //only return the data object, not the whole response
    },
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
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

      if (!res) throw new Error("Failed to fetch program by slug");

      return res.data;
    },
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => {

      const res = await apiClient.post<Program>(
        "/programs",
        payload,
      );

      if (!res?.success || !res.data) {
        throw new Error(res.message || "Failed to create program");
      }
      return res.data;
    },
    onSuccess: (newProgram) => {
      queryClient.setQueryData<{ programs: Program[] }>(
        ["programs", "admin"],
        (old) => ({
          programs: old ? [...old.programs, newProgram] : [newProgram],
        })
      );
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
}

export function useDeleteProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      await apiClient.delete(`/programs/${programId}`);
      return programId;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<{ programs: Program[] }>(
        ["programs", "admin"],
        (old) => ({
          programs: old
            ? old.programs.filter((program) => program.id !== deletedId)
            : [],
        })
      );
    },
    onError: (err: any) => {
      if (err.message.includes("Authorization")) {
        console.warn("Authorization error: user might need to login again.");
      }
    },
  });
};
