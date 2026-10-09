// src/lib/api/enrollment.ts
import { apiClient } from "@/lib/api/client";
import { EnrollmentWithCourse } from "@/types/domain";
// import type { Enrollment } from "@/types/dashboard";

export const enrollmentService = {
  getAll: async (): Promise<EnrollmentWithCourse[]> => {
    const res = await apiClient.get<EnrollmentWithCourse[]>("/enrollments");
    if (!res) {
      throw new Error("No Enrollments found");
    }
    return res.data!;
  },

  getById: async (id: string): Promise<EnrollmentWithCourse> => {
    const res = await apiClient.get<EnrollmentWithCourse>(`/enrollments/${id}`);

    console.log("res:", res.data);

    if (!res.data) {
      throw new Error("Enrollment not found");
    }

    return res.data;
  },
};
