// lib/api/progress.ts
import { apiClient } from "./client";
import { Certificate } from "@/types/domain";

// Matches progress.service.ts::upsertProgress / markTopicComplete return shape —
// a single Prisma `progress` row, not an enrollment-level aggregate.
export interface ProgressRecord {
  id: string;
  enrollmentId: string;
  topicId: string;
  completed: boolean;
  watchedSeconds: number | null;
  lastWatchedAt: string | null;
  topic: {
    id: string;
    title: string;
    durationSeconds: number | null;
    videoStatus?: "PROCESSING" | "READY" | "FAILED";
  };
}

// Matches progress.service.ts::getProgressByEnrollment return shape exactly.
export interface EnrollmentProgress {
  records: ProgressRecord[];
  completedCount: number;
  totalTopics: number;
  percentage: number;
}

export interface ProgressSummary {
  totalCompleted: number;
  totalLessons: number;
  timeSpentMinutes: number;
  xp: number;
  streak: number;
}

// export interface Certificate {
//   enrollmentId: string;
//   issuedAt: Date | string;
//   url: string;
//   verification: string;
//   courseTitleAtIssuance: string;
//   enrollment: Enrollment;
// }

// UPSERT — the watchedSeconds heartbeat. Backend auto-completes at 90% watched.
export const upsertProgress = (data: {
  enrollmentId: string;
  topicId: string;
  watchedSeconds?: number;
}) => apiClient.post<ProgressRecord>("/progress", data);

// MARK COMPLETE — explicit, bypasses the 90% threshold
export const markTopicComplete = (enrollmentId: string, topicId: string) =>
  apiClient.patch<ProgressRecord>(`/progress/${enrollmentId}/topics/${topicId}/complete`);

// GET ENROLLMENT
export const getEnrollmentProgress = (enrollmentId: string) =>
  apiClient.get<EnrollmentProgress>(`/progress/${enrollmentId}`);

// GET SINGLE
export const getSingleProgress = (enrollmentId: string, topicId: string) =>
  apiClient.get<ProgressRecord | null>(`/progress/${enrollmentId}/topics/${topicId}`);

// RESET
export const resetProgress = (enrollmentId: string) =>
  apiClient.delete<{ deletedCount: number }>(`/progress/${enrollmentId}/reset`);

// SUMMARY
export const getProgressSummary = () => apiClient.get<ProgressSummary>("/progress/summary");

// ADMIN
export const getCourseProgressAdmin = (courseId: string) =>
  apiClient.get<
    Array<{
      enrollmentId: string;
      user: unknown;
      totalTopics: number;
      completedCount: number;
      percentage: number;
      lastActivity: string | null;
    }>
  >(`/progress/admin/courses/${courseId}`);

// CERTIFICATE
export const getCertificate = (enrollmentId: string) =>
  apiClient.get<Certificate>(`/certificates/${enrollmentId}`);