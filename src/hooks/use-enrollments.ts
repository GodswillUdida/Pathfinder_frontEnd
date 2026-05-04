// src/hooks/use-enrollments.ts
import { useQuery } from "@tanstack/react-query";
import type { Enrollment } from "@/types/dashboard";
import { safeFetch } from "@/lib/api/fetcher";

export function useEnrollments() {
  return useQuery<Enrollment[]>({
    queryKey: ["enrollments"],
    queryFn: () => safeFetch<Enrollment[]>("/enrollments"),
    staleTime: 30_000, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
}

export function useEnrollment(id: string) {
  return useQuery<Enrollment>({
    queryKey: ["enrollment", id],
    queryFn: () => safeFetch<Enrollment>(`/enrollments/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
