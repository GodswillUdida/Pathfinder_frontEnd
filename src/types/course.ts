// types/course.ts
// Last updated: aligned to Prisma schema (February 2026)

// ────────────────────────────────────────────────
// Core types – keep relations optional & flat where possible
// ────────────────────────────────────────────────

export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Instructor {
  id: string;
  name: string;
  // avatar?: string | null;     // add if you expose it later
  // email?: string | null;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  image?: string | null;
  slug: string;
  status: CourseStatus;
  price?: number | null;
  currency: string; // default "NGN"
  // courses?: Course[];          // usually not nested deeply – load separately
  createdAt: string; // ISO
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CoursePricing {
  id: string;
  courseId: string;
  name?: string | null; // e.g. "1 Day Access", "Full Access"
  price: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
  createdAt: string;
  // course?: Course;             // usually not needed here
  // enrollments?: Enrollment[];  // usually not nested
}

export interface Module {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  courseId: string;
  position: number;
  topics: Topic[];
  views: number;
  completions: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  bunnyVideoId?: string | null;
  videoStatus?: string | null; // "created" | "uploaded" | "processing" | "ready" | "failed"
  durationSeconds?: number | null;
  thumbnailUrl?: string | null;
  fileSizeBytes?: number | null;
  videoWidth?: number | null;
  videoHeight?: number | null;
  resources?: Record<string, any> | null; // Json field
  moduleId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // videoUrl?: string;           // usually constructed in frontend (e.g. bunny cdn + bunnyVideoId)
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string | null;
  videoPreview?: string | null;

  level?: string | null;
  tags: string[];
  duration?: number | null;

  status: CourseStatus;

  instructor?: Instructor | null;
  instructorId?: string | null;

  program?: Program | null;
  programId?: string | null;

  pricings?: CoursePricing[]; // usually included when needed (e.g. buy page)
  modules?: Module[]; // usually loaded on course detail page

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// For CourseGrid / grouping display
export interface ProgramGroup {
  program: Program | null; // null = standalone courses
  courses: Course[];
  programId?: string; // convenience
  programSlug?: string; // convenience
}

// ────────────────────────────────────────────────
// Filter state – aligned to what actually exists
// ────────────────────────────────────────────────

export interface FilterState {
  searchQuery: string;
  level: string; // "all" | actual level values
  programSlug: string; // "all" | program slugs (replaces old "mode")
  // category: string;            // removed – no longer in schema
}

// Constants (update defaults if needed)
export const DEFAULT_LEVEL = "all" as const;
export const DEFAULT_PROGRAM = "all" as const;

// ────────────────────────────────────────────────
// Enrollment (minimal – matches your current schema)
// ────────────────────────────────────────────────

export interface Enrollment {
  id: string;
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
  } | null;
  userId: string;

  course: {
    id: string;
    title: string;
    slug: string;
  };
  courseId: string;

  pricing: {
    id: string;
    name?: string | null;
    price: number;
    durationDays: number;
  };
  pricingId: string;

  orderItemId: string;
  orderId?: string | null;

  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"; // adjust to your PaymentStatus enum
  paymentRef?: string | null;

  startedAt: string;
  expiresAt: string;
  completedAt?: string | null;

  progressPercentage: number;

  status?: "pending" | "paid" | "failed" | "refunded" | "expired"; // can be derived

  createdAt: string;
  updatedAt: string;
}
