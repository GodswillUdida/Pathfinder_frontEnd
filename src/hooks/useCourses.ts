// src/hooks/useCourses.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { getCourses } from "@/lib/api/course";
import type { Course } from "@/types/course";

type UseCoursesOptions = Omit<
  UseQueryOptions<Course[], Error>,
  "queryKey" | "queryFn"
>;

export function useCourses(options?: UseCoursesOptions) {
  return useQuery<Course[], Error>({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 60_000, // 1 minute
    ...options,
  });
}
