// src/types/admin.ts
export type TopicInput = {
  id?: string;
  title: string;
  videoUrl?: string | null;
  resources?: string[]; // filenames or URLs
};

export type ModuleInput = {
  id?: string;
  title: string;
  description?: string | null;
  topics?: TopicInput[];
};

export type CourseInput = {
  title: string;
  slug?: string;
  description: string;
  thumbnail?: string | null;
  price: number;
  type: "online" | "physical";
  level?: "beginner" | "intermediate" | "advanced" | "expert" | null;
  duration?: string | null;
  category?: string | null;
  tags?: string[];
  programId?: string | null;
  programTitle?: string | null;
  instructorId?: string | null;
  videoPreview?: string | null;
  modules?: ModuleInput[];
};

export const ADMIN_NAV = [
  // { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Programs", path: "/admin/programs" },
  { name: "Courses", path: "/admin/courses" },
  { name: "Enrollments", path: "/admin/enrollments" },
  // { name: "Users", path: "/admin/users" },
  // { name: "Settings", path: "/admin/settings" },
];

export const USER_NAV = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "My Courses", path: "/dashboard/courses" },
  { name: "Profile", path: "/dashboard/profile" },
];
