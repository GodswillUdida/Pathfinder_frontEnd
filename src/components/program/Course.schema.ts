import { z } from "zod";

// ─── Enums (Match Prisma) ────────────────────────────────────────────────────

export const CourseStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export const CourseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]);

export type CourseStatus = z.infer<typeof CourseStatusEnum>;
export type CourseLevel = z.infer<typeof CourseLevelEnum>;

// ─── Pricing Schema ──────────────────────────────────────────────────────────

export const pricingSchema = z.object({
  id:          z.string().uuid().optional(),           // present on edit
  name:        z.string().min(1, "Plan name is required").max(80).trim(),
  price:       z.coerce.number().min(0, "Price must be ≥ 0"),
  currency:    z.string().length(3).default("NGN"),
  durationDays: z.coerce.number().int().min(1, "Duration must be at least 1 day"),
  isActive:    z.boolean().default(true),
});

export type PricingField = z.infer<typeof pricingSchema>;

// ─── Course Form Schema (for create/edit) ────────────────────────────────────

export const courseFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title is too long")
    .trim(),

  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional(),

  description: z
    .string()
    .max(2000, "Description is too long")
    .optional(),

  thumbnail: z
    .string()
    .url("Invalid thumbnail URL")
    .optional()
    .or(z.literal("")),

  videoPreview: z
    .string()
    .url("Invalid video preview URL")
    .optional()
    .or(z.literal("")),

  level: CourseLevelEnum.optional().default("BEGINNER"),

  status: CourseStatusEnum.default("DRAFT"),

  tags: z
    .array(z.string().trim().min(1).max(30))
    .max(12, "Maximum 12 tags allowed")
    .default([]),

  pricings: z
    .array(pricingSchema)
    .min(1, "At least one pricing plan is required"),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

// ─── Course Entity (Full response shape from backend) ────────────────────────

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnail?: string | null;
  videoPreview?: string | null;
  level?: CourseLevel | null;
  status: CourseStatus;
  tags: string[];
  duration?: number | null;
  instructorId?: string | null;
  programId?: string | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  pricings?: PricingField[];
  program?: {
    id: string;
    title: string;
    slug?: string;
  } | null;
  instructor?: {
    id: string;
    fullName?: string;
    email?: string;
  } | null;

  // Optional frontend flags
  isPublished?: boolean;
}

// ─── Helper for default form values ──────────────────────────────────────────

export const defaultCourseFormValues: CourseFormData = {
  title: "",
  description: "",
  thumbnail: "",
  videoPreview: "",
  level: "BEGINNER",
  status: "DRAFT",
  tags: [],
  pricings: [
    {
      name: "Standard Access",
      price: 0,
      currency: "NGN",
      durationDays: 365,
      isActive: true,
    },
  ],
};