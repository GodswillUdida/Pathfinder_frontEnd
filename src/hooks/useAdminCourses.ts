import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Course } from "@/types/course";
import { safeFetch } from "@/lib/api/fetcher";
import { postJSON } from "@/lib/api/request";
import { useAuthStore } from "@/store/userStore";

type CourseResponse = { course: Course } | { data: Course } | Course;

// Fetch all admin courses
export function useCoursesList() {
  return useQuery({
    queryKey: ["courses", "admin"],
    queryFn: async () => {
      const data = await safeFetch<{ courses: Course[] }>("/courses");

      if (!data) throw new Error("Failed to fetch courses");
      return data;
    },
  });
}

// Fetch single course
export function useCourse(id?: string) {
  return useQuery({
    queryKey: ["course", id],
    enabled: !!id,
    retry: false,
    // enabled: Boolean(id),
    queryFn: async () => {
      const res = await safeFetch<CourseResponse>(`/courses/${id}`);

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

  const qc = useQueryClient();
  const tokenFromState = useAuthStore((state) => state.token);

  return useMutation({
    mutationFn: async (payload: Partial<Course> & { programId: string }) => {
      const token = tokenFromState || localStorage.getItem("token");
      if (!token)
        throw new Error("you are not logged in. please log in to continue");

      const body = { ...payload, program: payload.programId };
      delete (body as any).programId;

      const res = await postJSON<CourseApiResponse, Partial<Course>>(
        `/courses${payload.slug}/courses/physical`,
        body,
        { token }
      );

      return res.course;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["courses", "admin"] }),
  });
}

// Update course
export function useUpdateCourse(courseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Course>) => {
      const data = await postJSON<{ course: Course }, Partial<Course>>(
        `/${courseId}`,
        payload
      );
      return data.course;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses", "admin"] });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
  });
}
