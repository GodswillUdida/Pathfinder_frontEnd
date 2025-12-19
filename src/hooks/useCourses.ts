// src/hooks/useCourses.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { getCourses } from "@/lib/api/course";
import { postJSON } from "@/lib/api/request";
import { useAuthStore } from "@/store/userStore";
import type { Course } from "@/types/course";

type UseCoursesOptions = Omit<
  UseQueryOptions<Course[], Error>,
  "queryKey" | "queryFn"
>;

// Payload for creating a course
export type CoursePayload = {
  programId: string;
  title: string;
  description?: string;
  slug?: string;
  thumbnail?: string | File;
  type?: "physical" | "online";
  level?: string;
  duration?: string;
  tags?: string[];
  category?: string;
  location?: string;
  schedule?: string;
};

// Backend response type
export type CourseApiResponse = {
  success: boolean;
  course: Course
};

// Fetch all courses hook
export function useCourses(options?: UseCoursesOptions) {
  return useQuery<Course[], Error>({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 60_000, // 1 minute
    ...options,
  });
}

// Create course hook
export function useCreateCourse() {
  const queryClient = useQueryClient();
  const tokenFromState = useAuthStore((state) => state.token);


  return useMutation({
    mutationFn: async (payload: CoursePayload): Promise<Course> => {

      const token = tokenFromState || localStorage.getItem("token");
      if (!token)
        throw new Error("You are not logged in. Please login to continue.");

  const hasFile = payload.thumbnail instanceof File;


      // Map programId to backend field "program"
      const body:any = { ...payload, program: payload.programId };
      delete body.programId;

      if (payload.thumbnail instanceof File) {
        const formData = new FormData();
        formData.append("file", payload.thumbnail);

        const uploadRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        const uploadJson = await uploadRes.json();
        if (!uploadRes.ok || !uploadJson.url)
          throw new Error("Thumbnail upload failed");
        body.thumbnail = uploadJson.url;
      }

      const res = await postJSON<CourseApiResponse, typeof body>(
        `/courses/${payload.slug}/courses/physical`,
        body,
        { token }
      );

      if (!res.success || !res.course)
        throw new Error("Failed to create course");

      return res.course;
    },
    onSuccess: (_, variable) => {
      // Invalidate queries related to this program
      queryClient.invalidateQueries(["courses", variable.programId]);
    },
  });
}
