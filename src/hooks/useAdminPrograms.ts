/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/types/course";
import { apiClient } from "@/lib/api/client";

interface Program {
  id: string;
  title: string;
  description?: string;
  slug: string;
  image?: string;
  courses: Course[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
}

type ProgramApiResponse = {
  success: boolean;
  program?: Program;
  error?: string;
};

// Fetch all admin program
export function useProgramList() {
  return useQuery<{ programs: Program[] }>({
    queryKey: ["programs", "admin"],
    queryFn: async () => {
      const data = await apiClient.get<{ programs: Program[] }>("/programs");
      if (!data) throw new Error("Failed to fetch programs");
      return data;
    },
    staleTime: 10 * 1000,
    retry: 2,
  });
}

// Fetch single Program
export function useProgram(programId?: string) {
  return useQuery({
    queryKey: ["program", programId],
    enabled: !!programId,
    retry: false,
    queryFn: async () => {
      const res = await apiClient.get<ProgramApiResponse>(`/programs/${programId}`);

      if (!res?.success || !res.program?.id) {
        throw new Error("Invalid Program Response");
      }

      return res.program;
    },
  });
}

export function useCreateProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { title: string; description?: string }) => {

      const res = await apiClient.post<ProgramApiResponse, typeof payload>(
        "/programs",
        payload,
      );

      if (!res?.success || !res.program) {
        throw new Error(res.error || "Failed to create program");
      }
      return res.program;
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
