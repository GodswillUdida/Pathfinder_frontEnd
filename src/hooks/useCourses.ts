// src/hooks/useCourses.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { createCourse, getCourses } from "@/lib/api/course";
import type { Course } from "@/types/course";

type UseCoursesOptions = Omit<
  UseQueryOptions<Course[], Error>,
  "queryKey" | "queryFn"
>;

export type UseCoursesParams = {
  programId: string;
  enabled?: boolean;
};

export type CoursePayload = {
  programId: string;
  title: string;
  description?: string;
  slug?: string;
  thumbnail?: File | string; // local upload OR URL
  type: "physical" | "online";
  level?: string;
  duration?: string;
  tags?: string[];
  category?: string;
  location?: string;
  schedule?: string;
};

export type CreateCourseResponse = {
  success: true;
  course: Course;
};


const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (programId?: string) =>
    [...courseKeys.lists(), { programId }] as const,
};

/* -------------------------------------------------------------------------- */
/*                               FETCH COURSES                                */
/* -------------------------------------------------------------------------- */

export function useCourses(
  params?: UseCoursesParams,
  options?: UseCoursesOptions
) {
  return useQuery<Course[], Error>({
    queryKey: courseKeys.list(params?.programId),
    queryFn: () => getCourses(),
    staleTime: 60_000,
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                              CREATE COURSE                                 */
/* -------------------------------------------------------------------------- */

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, CoursePayload>({
    mutationFn: createCourse,

    onSuccess: (newCourse, variables) => {

      // ✅ Option 1: invalidate (safe)
      queryClient.invalidateQueries({
        queryKey: courseKeys.list(variables.programId),
      });

      // ✅ Option 2 (better UX): optimistic update
      queryClient.setQueryData<Course[]>(
        courseKeys.list(variables.programId),
        (old) => (old ? [newCourse, ...old] : [newCourse])
      );

    },
  });
}
