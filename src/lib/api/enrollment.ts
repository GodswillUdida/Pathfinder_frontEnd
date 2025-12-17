// lib/api/enrollment.ts
import { EnrollmentRequestInput } from "@/schemas/enrollment";
import { postJSON } from "@/lib/api/request";
import { safeFetch } from "./fetcher";
import { Enrollment } from "@/types/course";

export type EnrollmentResponse = {
  success: true;
  message?: string;
};

export type GetEnrollmentsResponse = {
  success: boolean;
  data: Enrollment[];
};

export async function submitEnrollmentRequest(
  courseId: string,
  payload: EnrollmentRequestInput
): Promise<EnrollmentResponse> {
  if (!courseId) {
    throw new Error("courseId is required.");
  }

  return postJSON<EnrollmentResponse, EnrollmentRequestInput>(
    `/enrollment-requests/${courseId}/enroll`,
    payload
  );
}

export async function getAllEnrollments(token: string): Promise<any> {
  const res = await safeFetch<GetEnrollmentsResponse>(
    "/enrollment-requests/all",
    { token }
  );

  console.log("Enrollments: ", res?.data);

  if (!res?.success) {
    throw new Error("Failed to fetch enrollments");
  }

  return res.data;
}
