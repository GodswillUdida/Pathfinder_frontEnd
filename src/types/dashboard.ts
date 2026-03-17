// types/dashboard.ts

export interface Topic {
  id: string;
  title: string;
  description?: string;
  position: number;
  durationSeconds?: number;
  thumbnailUrl?: string;
  videoStatus: "uploaded" | "processing" | "ready" | "failed";
  bunnyVideoId?: string;
  isFree: boolean;
  moduleId: string;
}

export interface Module {
  id: string;
  title: string;
  position: number;
  courseId: string;
  topics: Topic[];
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  modules: Module[];
}

export interface ProgressRecord {
  id: string;
  topicId: string;
  completed: boolean;
  completedAt?: string;
  enrollmentId: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  startedAt: string;
  expiresAt: string;
  paymentStatus: string;
  course: Course;
  progressRecords: ProgressRecord[];
  certificate?: { id: string; issuedAt: string } | null;
}
