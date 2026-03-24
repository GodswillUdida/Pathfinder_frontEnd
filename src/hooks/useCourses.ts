// src/hooks/useCourses.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { getCourses } from "@/lib/api/course";
// import { postForm } from "@/lib/api/request";
import { useAuthStore } from "@/store/authStore";
import type { Course } from "@/types/course";
import { postRequest } from "@/lib/api/request";

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

type CreateCourseResponse = {
  success: true;
  course: Course;
};

/* -------------------------------------------------------------------------- */
/*                               FETCH COURSES                                */
/* -------------------------------------------------------------------------- */

export function useCourses(
  // { enabled = true }: UseCoursesParams,
  options?: UseCoursesOptions
) {
  return useQuery<Course[], Error>({
    queryKey: ["courses"],
    queryFn: () => getCourses(),
    // enabled: Boolean(programId) && enabled,
    staleTime: 60_000,
    ...options,
  });
}

/* -------------------------------------------------------------------------- */
/*                              CREATE COURSE                                 */
/* -------------------------------------------------------------------------- */

export function useCreateCourse() {
  const queryClient = useQueryClient();
  const tokenFromStore = useAuthStore((s) => s.accessToken);

  return useMutation<Course, Error, CoursePayload>({
    mutationFn: async (payload) => {
      const token = tokenFromStore ?? localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const formData = new FormData();

      // Required
      formData.append("title", payload.title);
      formData.append("type", payload.type);

      console.log("Payload:", payload);

      // Optional fields
      payload.description &&
        formData.append("description", payload.description);
      payload.slug && formData.append("slug", payload.slug);
      payload.level && formData.append("level", payload.level);
      payload.duration && formData.append("duration", payload.duration);
      payload.category && formData.append("category", payload.category);
      payload.location && formData.append("location", payload.location);
      payload.schedule && formData.append("schedule", payload.schedule);

      payload.tags?.forEach((tag) => {
        formData.append("tags[]", tag);
      });

      // Thumbnail: file OR URL
      if (payload.thumbnail instanceof File) {
        formData.append("thumbnail", payload.thumbnail);
      } else if (typeof payload.thumbnail === "string") {
        formData.append("thumbnailUrl", payload.thumbnail);
      }

      const res = await postRequest<CreateCourseResponse, typeof formData>(
        `/programs/${payload.programId}/courses/${payload.type}`,
        formData,
        { token }
      );

      return res.course;
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.programId],
      });
    },
  });
}
