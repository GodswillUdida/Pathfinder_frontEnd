// types/course.ts
export type CourseMode = "online" | "physical" | "hybrid";

export interface Instructor {
  id: string;
  name: string;
  avatar?: string | null;
  role?: "student" | "instructor" | "admin";
}

export type Topic = {
  id: string;
  title: string;
  videoUrl?: string;
  resources?: string[];
};

export type Module = {
  id: string;
  title: string;
  description?: string;
  topics: Topic[];
  // videoUrl?: string;
};

export interface Program {
  id: string;
  title: string;
  description: string;
  slug?: string;
  image: string;
  courses: Course[];
}

export interface Course {
  id: string;
  title: string;
  slug?: string;
  topics?: string[];
  type: CourseMode;
  description: string | null;
  thumbnail: string | null;
  price: number | null;
  tags?: string[] | null;
  level?: string;
  duration?: string;
  durationOptions?: ("3-months" | "6-months" | "1-year")[] | null;
  category?: string | null;
  instructor?: { id: string; name: string };
  videoPreview?: string; // URL to a preview video
  program?: Program | null; // e.g. "ican"
  modules?: Module[] | null;
  createdAt?: string;
  enrollmentCount?: number;
  studentsCount: number;
}

export interface ProgramGroup {
  programId: string;
  programName: string;
  programSLug?: string;
  courses: Course[];
}

export interface FilterState {
  searchQuery: string;
  category: string;
  level: string;
  mode: string;
}

export const DEFAULT_CATEGORY = "Uncategorized" as const;
export const DEFAULT_LEVEL = "Beginner" as const;
export const DEFAULT_TYPE = "online" as const;

// src/types/index.ts
// export type Module = {
//   id: string;
//   title: string;
//   description?: string;
//   videoUrl?: string;
// };

// export type Course = {
//   id: string;
//   title: string;
//   description: string;
//   mode: "online" | "physical" | "hybrid";
//   durationOptions?: ("3-months" | "6-months" | "1-year")[];
//   modules?: Module[];
//   price?: number;
// };

export type Enrollment = {
  id: string;
  programId: string;
  courseId: string;
  userId?: string;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
};
