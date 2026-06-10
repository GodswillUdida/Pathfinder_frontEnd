// src/hooks/use-enrollments.ts
import { useQuery } from "@tanstack/react-query";
import type { Enrollment } from "@/types/dashboard";
import { apiClient } from "@/lib/api/client";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Extract data safely
const extractData = <T>(response: any): T => {
  if (!response) return [] as T;
  return response?.data ?? response;
};

export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments"],
    queryFn: async (): Promise<Enrollment[]> => {
      const response = await apiClient.get<ApiResponse<Enrollment[]>>("/enrollments");
      return extractData(response);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useEnrollment(id: string) {
  return useQuery({
    queryKey: ["enrollment", id],
    queryFn: async (): Promise<Enrollment> => {
      const response = await apiClient.get<ApiResponse<Enrollment>>(`/enrollments/${id}`);
      return extractData(response);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}