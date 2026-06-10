import { Enrollment } from "@/types/course";
import { apiClient } from "./client";

export interface Progress {
  topicId: string;
  completed: boolean;
  completedAt?: string;
}

export interface EnrollmentProgress {
  enrollmentId: string;
  topics: Progress[];
}

export interface ProgressSummary {
  totalTopics: number;
  completedTopics: number;
  percentage: number;
}

export interface Certificate {
    enrollmentId: string;
    issuedAt: Date | string;
    url: string;
    verification: string;
    courseTitleAtIssuance: string;
    enrollment: Enrollment
}

export const upsertProgress = (data: {
  enrollmentId: string;
  topicId: string;
}) =>
  apiClient.post<EnrollmentProgress>("/progress", data);

// MARK COMPLETE
export const markTopicComplete = (enrollmentId: string, topicId: string) =>
  apiClient.patch(
    `/progress/${enrollmentId}/topics/${topicId}/complete`
  );

// GET ENROLLMENT
export const getEnrollmentProgress = (enrollmentId: string) =>
  apiClient.get<EnrollmentProgress>(
    `/progress/${enrollmentId}`
  );

// GET SINGLE
export const getSingleProgress = (
  enrollmentId: string,
  topicId: string
) =>
  apiClient.get<Progress>(
    `/progress/${enrollmentId}/topics/${topicId}`
  );

// RESET
export const resetProgress = (enrollmentId: string) =>
  apiClient.delete(`/progress/${enrollmentId}/reset`);

// SUMMARY
export const getProgressSummary = () =>
  apiClient.get<any>("/progress/summary");

// ADMIN
export const getCourseProgressAdmin = (courseId: string) =>
  apiClient.get(`/progress/admin/courses/${courseId}`);

// CERTIFICATE
export const getCertificate = (enrollmentId: string) =>
  apiClient.get<Certificate>(
    `/certificates/${enrollmentId}`
  );

// export const upsertProgress = async (data: {
//   enrollmentId: string;
//   topicId: string;
// }) => {
//   const res = await apiClient.post("/progress", data);
//   return res.data;
// };



// export async function getProgressSummary() {
//     const res = await apiClient.get<any>("/progress/summary");

//     if (!res.success) throw new Error("Failed to load progress ", res);
//     return res.json();


// }

// export async function getCertificates(): Promise<Certificate> {
//     const res = await apiClient.get<any>("/certificates");
//     if (!res.ok) throw new Error("Failed to load certificates");
//     return res.json();
// }