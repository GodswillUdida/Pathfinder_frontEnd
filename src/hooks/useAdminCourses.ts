import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/types/course";
import { safeFetch } from "@/lib/api/fetcher";
import { useAuthStore } from "@/store/authStore";
import { postRequest } from "@/lib/api/request";
import { PhysicalCourseInput } from "@/schemas/physicalCourse.schema";

type CourseResponse = { course: Course } | { data: Course } | Course;

export type CoursesApiResponse = {
  success: boolean;
  course: Course;
  courses?: Course[];
};


function appendThumbnail(
  formData: FormData,
  thumbnail?: File | string | null
) {
  if (!thumbnail) return;

  if (thumbnail instanceof File) {
    formData.append("thumbnail", thumbnail);
    return;
  }

  if (typeof thumbnail === "string") {
    formData.append("thumbnailUrl", thumbnail);
  }
}



// Fetch all admin courses
export function useCoursesList() {
  return useQuery({
    queryKey: ["courses", "admin"],
    queryFn: async () => {
      const data = await safeFetch<{ courses: Course[] }>("/courses");

      if (!data?.courses) throw new Error("Failed to fetch courses");
      return data.courses;
    },
    staleTime: 60_000,
    retry: 2,
  });
}

// Fetch single course
export function useCourse(courseId?: string) {
  return useQuery<Course, Error>({
    queryKey: ["course", courseId],
    enabled: !!courseId,
    retry: false,
    // enabled: Boolean(id),
    queryFn: async () => {
      const res = await safeFetch<CourseResponse>(`/courses/${courseId}`);

      console.log("Hook Data: ", res);

      if (!res) throw new Error("Course not found");

      const course =
        "course" in res ? res.course : "data" in res ? res.data : res;

      if (!course?.id) {
        throw new Error("Inavlid Course Response");
      }
      return course;
    },
  });
}

// Create course
export function useCreateCourse() {
  const queryClient = useQueryClient();
  // const tokenFromState = useAuthStore((state) => state.accessToken);

  return useMutation<Course, Error, PhysicalCourseInput>({
    mutationFn: async (payload) => {
      // const token = tokenFromState ?? localStorage.getItem("token");
      // if (!token) {
      //   throw new Error("Authentication required");
      // }

      const formData = new FormData();

      // Required
      formData.append("title", payload.title);
      formData.append("type", payload.type ?? "physical");
      formData.append("programId", payload.programId);

      // Optional strings
      payload.description && formData.append("description", payload.description);
      payload.slug && formData.append("slug", payload.slug);
      payload.level && formData.append("level", payload.level);
      payload.duration && formData.append("duration", payload.duration);
      payload.category && formData.append("category", payload.category);
      payload.location && formData.append("location", payload.location);
      payload.schedule && formData.append("schedule", payload.schedule);

      // Arrays
      payload.tags?.forEach((tag: string) =>
        formData.append("tags[]", tag)
      );

      // Thumbnail (clean + safe)
      appendThumbnail(formData, payload.thumbnail);

      const res = await postRequest<CoursesApiResponse, FormData>(
        `/programs/${payload.programId}/courses/physical`,
        formData,
        // { token }
      );

      return res.course;
    },

    onSuccess: (_course, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses", "admin"] });
      queryClient.invalidateQueries({
        queryKey: ["courses", variables.programId],
      });
    },
  });
}


// Update course
export function useUpdateCourse(courseId: string) {
  const qc = useQueryClient();
  // const tokenFromState = useAuthStore((state) => state.accessToken);

  return useMutation<Course, Error, Partial<Course>>({
    mutationFn: async (payload) => {
      if (!courseId) throw new Error("Course ID is required");

      // const token = tokenFromState || localStorage.getItem("token");
      // if (!token) throw new Error("Authentication required");

      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== "undefined" && value !== null) {
          if (key === "thumbnail" && value instanceof File) {
            formData.append("thumbnail", value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const res = await postRequest<CourseResponse, FormData>(
        `/${courseId}`,
        formData,
        // { token }
      );

      const course = "course" in res ? res.course : "data" in res ? res.data : res;
      return course;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", "admin"] });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}
