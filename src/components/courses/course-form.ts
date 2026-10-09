// components/courses/course-form.ts
import { z } from "zod";
import type { Course, CourseLevel, CourseStatus, CoursePricing } from "@/types/domain";

export const COURSE_LEVELS = [
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "PROFESSIONAL",
] as const satisfies readonly CourseLevel[];

export const COURSE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const satisfies readonly CourseStatus[];

export const LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  PROFESSIONAL: "Professional",
};

export const STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

// ─── Pricing (matches CoursePricing) ─────────────────────────────────────────

export const pricingSchema = z.object({
  id: z.string().optional(),
  name: z.string().max(60).nullable().optional(),
  /** Keep as number in the form; serialize to string for the API. */
  price: z.coerce.number().min(0, "Price must be ≥ 0"),
  isFree: z.boolean().default(false),
  currency: z.string().length(3).toUpperCase().default("NGN"),
  /** null = lifetime access */
  accessDurationDays: z.coerce.number().int().min(1).nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type PricingField = z.infer<typeof pricingSchema>;

// ─── Media ───────────────────────────────────────────────────────────────────

const mediaField = z
  .union([
    typeof window !== "undefined"
      ? z.instanceof(File)
      : z.custom<File>(() => false),
    z.string().url("Must be a valid URL"),
    z.literal(""),
  ])
  .optional()
  .transform((v) => v ?? "");

// ─── Course form ─────────────────────────────────────────────────────────────

export const courseFormSchema = z.object({
  title: z.string().min(3, "At least 3 characters").max(120),
  slug: z.string().max(80).optional(),
  code: z.string().min(1, "Code is required"),
  // code: z
  //   .string()
  //   .min(2, "Code is required")
  //   .max(32)
  //   .regex(/^[A-Za-z0-9-_]+$/, "Letters, numbers, - and _ only"),
  description: z.string().min(10, "At least 10 characters").max(2000),
  thumbnail: mediaField,
  videoPreview: mediaField,
  level: z.enum(COURSE_LEVELS),
  status: z.enum(COURSE_STATUSES).default("DRAFT"),
  tags: z.array(z.string().min(1).max(30)).max(10).default([]),
  issuesCertificate: z.boolean().default(false),
  instructorId: z.string().uuid().nullable().optional(),
  pricings: z.array(pricingSchema).min(1, "At least one pricing plan"),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export const defaultCourseFormValues: CourseFormData = {
  title: "",
  slug: "",
  code: "",
  description: "",
  thumbnail: "",
  videoPreview: "",
  level: "BEGINNER",
  status: "DRAFT",
  tags: [],
  issuesCertificate: false,
  instructorId: null,
  pricings: [
    {
      name: "Monthly",
      price: 0,
      isFree: false,
      currency: "NGN",
      accessDurationDays: 30,
      sortOrder: 0,
      isActive: true,
    },
  ],
};

export function courseToFormValues(
  c: Course & { pricings?: CoursePricing[] }
): CourseFormData {
  return {
    title: c.title,
    slug: c.slug ?? "",
    code: c.code ?? "",
    description: c.description ?? "",
    thumbnail: c.thumbnail ?? "",
    videoPreview: c.videoPreview ?? "",
    level: c.level,
    status: c.status,
    tags: c.tags ?? [],
    issuesCertificate: c.issuesCertificate ?? false,
    instructorId: c.instructorId,
    pricings:
      c.pricings?.length
        ? c.pricings.map((p, i) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            isFree: p.isFree,
            currency: p.currency || "NGN",
            accessDurationDays: p.accessDurationDays,
            sortOrder: p.sortOrder ?? i,
            isActive: p.isActive,
          }))
        : defaultCourseFormValues.pricings,
  };
}

export const DURATION_PRESETS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "3 months" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
  { value: null, label: "Lifetime" },
] as const;

export const LEVEL_STYLES: Record<
  CourseLevel,
  { bg: string; color: string; border: string }
> = {
  BEGINNER: {
    bg: "rgba(34,197,94,0.08)",
    color: "#15803d",
    border: "rgba(34,197,94,0.25)",
  },
  INTERMEDIATE: {
    bg: "rgba(245,158,11,0.08)",
    color: "#b45309",
    border: "rgba(245,158,11,0.25)",
  },
  ADVANCED: {
    bg: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    border: "rgba(239,68,68,0.25)",
  },
  PROFESSIONAL: {
    bg: "rgba(99,102,241,0.08)",
    color: "#4338ca",
    border: "rgba(99,102,241,0.25)",
  },
};

export const STATUS_STYLES: Record<
  CourseStatus,
  { bg: string; color: string; border: string }
> = {
  DRAFT: {
    bg: "rgba(245,158,11,0.08)",
    color: "#b45309",
    border: "rgba(245,158,11,0.25)",
  },
  PUBLISHED: {
    bg: "rgba(34,197,94,0.08)",
    color: "#15803d",
    border: "rgba(34,197,94,0.25)",
  },
  ARCHIVED: {
    bg: "rgba(100,116,139,0.08)",
    color: "#475569",
    border: "rgba(100,116,139,0.25)",
  },
};