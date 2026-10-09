// src/hooks/use-enrollments.ts
import { useQuery } from "@tanstack/react-query";
import { enrollmentService } from "@/lib/api/enrollment";
import { EnrollmentWithCourse } from "@/types/domain";

export function useEnrollments() {
  return useQuery<EnrollmentWithCourse[]>({
    queryKey: ["enrollments"],
    queryFn: enrollmentService.getAll,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useEnrollment(id: string) {
  return useQuery<EnrollmentWithCourse>({
    queryKey: ["enrollment", id],
    queryFn: () => enrollmentService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}