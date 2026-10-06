// types/curriculum-admin.ts
// Admin-only form/mutation input shapes. These narrow types/domain.ts —
// they never redeclare a model. If a field isn't on Course/Module/Topic
// in domain.ts, it doesn't belong in an input type either.

import { z } from "zod";
import type { CourseLevel, CourseStatus, ResourceType } from "./domain";

// ────────────────────────────────────────────────
// Drag & drop
// ────────────────────────────────────────────────

export const DND_TYPE = {
  MODULE: "module",
  TOPIC: "topic",
} as const;

export const MODULE_GROUP = "modules";

// ────────────────────────────────────────────────
// Pricing form
// accessDurationDays replaces the fabricated "durationDays" /
// string-enum DurationDays. null = lifetime; the form should expose
// a "Lifetime" toggle that sets the coerced number to undefined/null
// rather than inventing a sentinel value.
// ────────────────────────────────────────────────

export const pricingFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Plan name is required").max(60),
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code")
    .toUpperCase()
    .default("NGN"),
  /** null = lifetime access. Omit or set null when the "Lifetime" toggle is on. */
  accessDurationDays: z.coerce.number().int().min(1).nullable(),
  isFree: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type PricingFormValues = z.infer<typeof pricingFormSchema>;

// ────────────────────────────────────────────────
// Topic resources (input side)
// TopicResource on the backend is a full relation:
// { type, title, url, sizeBytes, position }. A resource input must
// carry a type and title, not just a bare URL string.
// ────────────────────────────────────────────────

export const topicResourceInputSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["PDF", "EXCEL", "WORD", "TEMPLATE", "LINK"] satisfies readonly ResourceType[]),
  title: z.string().min(1, "Resource title is required"),
  url: z.string().url("Must be a valid URL"),
  position: z.number().int().min(0).default(0),
});

export type TopicResourceInput = z.infer<typeof topicResourceInputSchema>;

// ────────────────────────────────────────────────
// Module / Topic mutations
// Scoped per ModuleListItem — moduleId is supplied by the calling
// hook's closure, not embedded in the payload.
// ────────────────────────────────────────────────

export interface CreateModuleInput {
  title: string;
  description?: string;
  position?: number;
}

export type UpdateModuleInput = Partial<CreateModuleInput>;

/**
 * Video attachment is intentionally excluded — it's a separate hook
 * not yet integrated into TopicForm. Do not add videoUrl/bunnyVideoId
 * here until that integration lands.
 */
export interface CreateTopicInput {
  title: string;
  resources?: TopicResourceInput[];
}

export type UpdateTopicInput = Partial<CreateTopicInput>;

// ────────────────────────────────────────────────
// Course create/edit form
// Dropped vs. the old admin.ts CourseInput: `type: "online" | "physical"`
// and `category` — neither field exists on the Course model. Re-add
// only if there's a corresponding backend column; confirm before wiring
// a form to fields the API will silently ignore.
// ────────────────────────────────────────────────

export interface CourseFormInput {
  title: string;
  description: string;
  slug?: string | null;
  code: string;
  thumbnail?: File | string | null;
  videoPreview?: File | string | null;
  level: CourseLevel;
  status: CourseStatus;
  issuesCertificate: boolean;
  tags: string[];
  pricings: PricingFormValues[];
  instructorId?: string | null;
}

export interface ProgramFormInput {
  title: string;
  description: string;
  image?: File | string | null;
  status: CourseStatus;
}

// ────────────────────────────────────────────────
// Admin course/program list filters
// ────────────────────────────────────────────────

export interface ListCoursesParams {
  page?: number;
  perPage?: number;
  search?: string;
  programId?: string;
  status?: CourseStatus;
  level?: CourseLevel;
}

export interface CourseAnalytics {
  courseId: string;
  totalEnrollments: number;
  completionRate: number;
  averageProgress: number;
  revenue: number;
}