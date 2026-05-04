import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/types/course";
import { safeFetch } from "@/lib/api/fetcher";
import { postRequest } from "@/lib/api/request";
import { PhysicalCourseInput } from "@/schemas/physicalCourse.schema";

// type CourseResponse = { course: Course } | { data: Course } | Course;

export type CoursesApiResponse = {
  success: boolean;
  data: Course;
  meta: {
    total: number;
    limit: number;
    offset: number;
    pages: number;
  };
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
  return useQuery<any>({
    queryKey: ["courses", "admin"],
    queryFn: async () => {
      const data = await safeFetch<CoursesApiResponse>("/courses");

      // if (!data.success) {
      //   console.error("Failed to fetch courses:", data);
      //   return [];
      // }

      if (!data.success) throw new Error("Failed to fetch courses");
      return data;
    },
    staleTime: 30_000,
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
      const res = await safeFetch<CoursesApiResponse>(`/courses/${courseId}`);

      console.log("", res);

      if (!res) throw new Error("Course not found");

      const course =
        "course" in res ? res.data : "data" in res ? res.data : res;

      if (!course?.id) {
        throw new Error("Inavlid Course Response");
      }
      return course;
    },
  });
}

// Fetch courses by program Slug
export function useGetCourseBySlugs(programSlug?: string, courseSlug?: string) {
  return useQuery<Course, Error>({
    queryKey: ["courses", programSlug, courseSlug],
    enabled: !!programSlug && !!courseSlug,
    retry: false,
    queryFn: async () => {
      const res = await safeFetch<CoursesApiResponse>(
        `/courses/${programSlug}/${courseSlug}`
      );

      if (!res) throw new Error("Course not found");

      const course = "data" in res ? res.data : res;

      if (!course?.id) {
        throw new Error("Invalid Course Response");
      }
      return course;
    }
  });
};

// Create course
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation<Course, Error, PhysicalCourseInput>({
    mutationFn: async (payload) => {

      const formData = new FormData();

      formData.append("title", payload.title);
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
        `/courses/${payload.programId}`,
        formData,
      );

      return res.data;
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

  return useMutation<Course, Error, Partial<Course>>({
    mutationFn: async (payload): Promise<Course> => {
      if (!courseId) throw new Error("Course ID is required");

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

      const res = await postRequest<CoursesApiResponse, FormData>(
        `/${courseId}`,
        formData,
      );

      const course = "course" in res ? res.data : "data" in res ? res.data : res;
      return course as Course;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", "admin"] });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (courseId) => {
      if (!courseId) throw new Error("Course ID is required");
      await postRequest<void, {}>(`/courses/${courseId}/delete`, {});
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", "admin"] });
    },
  });
}