// components/course/course-form.ts  (types + schema only — no JSX)
import { z } from "zod";

export const COURSE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
export const COURSE_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export type CourseLevel = (typeof COURSE_LEVELS)[number];
export type CourseStatus = (typeof COURSE_STATUSES)[number];


export const LEVEL_LABELS: Record<CourseLevel, string> = {
    BEGINNER: "Beginner",
    INTERMEDIATE: "Intermediate",
    ADVANCED: "Advanced",
};

export const STATUS_LABELS: Record<CourseStatus, string> = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
};

// ─── Pricing ──────────────────────────────────────────────────────────────────

export const pricingSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Plan name is required").max(60),
    price: z.coerce.number().min(0, "Price must be ≥ 0"),
    currency: z.string().length(3, "Currency must be 3-letter code").toUpperCase().default("NGN"),
    durationDays: z.coerce.number().int().min(1, "Must be at least 1 day"),
    isActive: z.boolean().default(true),
});

export type PricingField = z.infer<typeof pricingSchema>;

// ─── Media field (File | URL string | empty) ──────────────────────────────────

const mediaField = z
    .union([
        // SSR-safe File check
        typeof window !== "undefined"
            ? z.instanceof(File)
            : z.custom<File>(() => false),
        z.string().url("Must be a valid URL"),
        z.literal(""),
    ])
    .optional()
    .transform((v) => v ?? "");

// ─── Course form schema ───────────────────────────────────────────────────────

export const courseFormSchema = z.object({
    title: z
        .string()
        .min(3, "At least 3 characters")
        .max(120, "Max 120 characters"),

    slug: z
        .string()
        .max(80)
        .optional(),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters")
        .max(1000, "Max 1000 characters")
        .optional(),

    thumbnail: mediaField,
    videoPreview: mediaField,

    level: z
        .enum(COURSE_LEVELS)
        .optional(),

    status: z.enum(COURSE_STATUSES).default("DRAFT"),

    tags: z
        .array(z.string().min(1).max(30))
        .max(10, "Maximum 10 tags")
        .default([]),

    pricings: z
        .array(pricingSchema)
        .min(1, "At least one pricing plan is required"),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

// ─── Default values ───────────────────────────────────────────────────────────

export const defaultCourseFormValues: CourseFormData = {
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    videoPreview: "",
    status: "DRAFT",
    tags: [],
    pricings: [{ name: "Standard", price: 0, currency: "NGN", durationDays: 365, isActive: true }],
};

// ─── Course → form adapter ────────────────────────────────────────────────────

import type { Course } from "@/types/course";
// import { generateSlug } from "@/lib/api/course";

export function courseToFormValues(c: Course): CourseFormData {

    const rawStatus = (c.status ?? "DRAFT").toUpperCase() as CourseStatus;
    const safeStatus = COURSE_STATUSES.includes(rawStatus) ? rawStatus : "DRAFT";

    const rawLevel = c.level ? (c.level.toUpperCase() as CourseLevel) : undefined;
    const safeLevel = rawLevel && COURSE_LEVELS.includes(rawLevel) ? rawLevel : undefined;


    return {
        title: c.title,
        slug: c.slug ?? "",
        description: c.description ?? "",
        thumbnail: c.thumbnail ?? "",
        videoPreview: c.videoPreview ?? "",
        level: safeLevel,
        status: safeStatus,
        tags: c.tags ?? [],
        pricings: c.pricings?.length
            ? c.pricings
            : defaultCourseFormValues.pricings,
    };
}

// ─── Duration preset options ──────────────────────────────────────────────────

export const DURATION_PRESETS = [
    { value: 1, label: "1 day" },
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 60, label: "2 months" },
    { value: 90, label: "3 months" },
    { value: 180, label: "6 months" },
    { value: 365, label: "1 year" },
    { value: 730, label: "2 years" },
] as const;

// ─── Level style tokens ───────────────────────────────────────────────────────

export const LEVEL_STYLES: Record<CourseLevel, { bg: string; color: string; border: string }> = {
  BEGINNER:     { bg: "rgba(34,197,94,0.08)",  color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  INTERMEDIATE: { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.25)" },
  ADVANCED:     { bg: "rgba(239,68,68,0.08)",  color: "#b91c1c", border: "rgba(239,68,68,0.25)"  },
};

export const STATUS_STYLES: Record<CourseStatus, { bg: string; color: string; border: string }> = {
  DRAFT:     { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.25)" },
  PUBLISHED: { bg: "rgba(34,197,94,0.08)",  color: "#15803d", border: "rgba(34,197,94,0.25)"  },
  ARCHIVED:  { bg: "rgba(100,116,139,0.08)", color: "#475569", border: "rgba(100,116,139,0.25)" },
};