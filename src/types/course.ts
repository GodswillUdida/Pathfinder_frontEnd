// types/course.ts
// Last updated: aligned to Prisma schema (February 2026)

import z from "zod";
import { Program } from "./program";

// ────────────────────────────────────────────────
// Core types – keep relations optional & flat where possible
// ────────────────────────────────────────────────


// types/course.ts

export type CourseLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED"; // adjust as needed

export const pricingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Plan name is required").max(60),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  currency: z.string().length(3, "Currency must be 3-letter code").toUpperCase().default("NGN"),
  durationDays: z.coerce.number().int().min(1, "Must be at least 1 day"),
  isActive: z.boolean().default(true),
});

export type PricingField = z.infer<typeof pricingSchema>;



export interface Course {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  videoPreview?: string | null;
  level?: CourseLevel | null;
  status?: CourseStatus;
  isPublished?: boolean;
  duration?: string | null;
  tags?: string[];
  pricings?: PricingField[];
  program?: { id: string; title: string; slug?: string } | null;
  enrollmentsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseFormData {
  title: string;
  description?: string;
  thumbnail?: File | string;
  videoPreview?: File | string;
  level?: CourseLevel;
  status: CourseStatus;
  tags: string[];
  pricings: PricingField[];
}


export interface Instructor {
  id: string;
  name: string;
  // avatar?: string | null;     // add if you expose it later
  // email?: string | null;
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

// export interface Course {
//   id: string;
//   title: string;
//   slug: string;
//   description: string;
//   thumbnail: string;
//   videoPreview?: string | null;
//   level?: string | null;
//   tags: string[];
//   duration?: number;
//   status: CourseStatus;
//   instructor?: Instructor | null;
//   instructorId?: string | null;
//   program?: Program | null;
//   programId?: string | null;
//   pricings?: CoursePricing[]; // usually included when needed (e.g. buy page)
//   modules?: Module[]; // usually loaded on course detail page
//   createdAt: string;
//   updatedAt: string;
//   deletedAt?: string | null;
// }

// For CourseGrid / grouping display
export interface ProgramGroup {
  program: Program | null; // null = standalone courses
  // courses: Course[];
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

export interface ListCoursesParams {
  page?:      number;
  perPage?:   number;
  search?:    string;
  programId?: string;
  status?:    string;
  level?:     string;
}


export interface CourseAnalytics {
  courseId:         string;
  totalEnrollments: number;
  completionRate:   number;
  averageProgress:  number;
  revenue:          number;
}
