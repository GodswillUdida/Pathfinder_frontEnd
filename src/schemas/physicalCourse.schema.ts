import { z } from "zod";
import { sl, ta } from "zod/v4/locales";

/**
 * Shared enums (reuse across frontend + backend)
 */
export const CourseLevelEnum = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export type CourseLevel = z.infer<typeof CourseLevelEnum>;

export const CourseTypeEnum = z.literal("physical");

/**
 * Physical course creation schema
 * Form-focused, not Prisma-focused
 */
export const physicalCourseSchema = z.object({
  // Core identity
  title: z
    .string()
    .min(2, "Title is too short")
    .max(120, "Title is too long"),

    slug: z
    .string()
    .min(2, "Slug is too short")
    .max(120, "Slug is too long")
    .optional(),

  description: z
    .string()
    .min(20, "Description must be detailed")
    .max(2000, "Description is too long"),

  // Discriminator
  type: CourseTypeEnum,

  // Academic metadata
  level: CourseLevelEnum,

  category: z
    .string()
    .min(2, "Category is required")
    .max(50),

  duration: z
    .string()
    .min(2, "Duration is required")
    .max(50),

  // Physical-only fields
  schedule: z
    .string()
    .min(3, "Schedule is required")
    .max(255),

    location: z
    .string()
    .min(3, "Location is required")
    .max(255),

    tags: z
    .array(
      z
        .string()
        .min(1, "Tag cannot be empty")
        .max(30, "Tag is too long")
    )
    .max(10, "Too many tags")
    .optional(),

  // Relations (IDs only — never nested objects)
  programId: z
    .string()
    .uuid("Invalid program reference"),

  instructorId: z
    .string()
    .uuid("Invalid instructor reference")
    .optional(),

  // Media
  thumbnail: z
    .string()
    .optional(),

  // Future-ready fields (safe defaults)
  capacity: z
    .number()
    .int()
    .positive()
    .optional(),

  campus: z
    .string()
    .max(100)
    .optional(),
});

/**
 * Inferred types
 */
export type PhysicalCourseInput = z.infer<
  typeof physicalCourseSchema
>;

/**
 * Update schema (PATCH-safe)
 */
export const updatePhysicalCourseSchema =
  physicalCourseSchema.partial();

export type UpdatePhysicalCourseInput = z.infer<
  typeof updatePhysicalCourseSchema
>;
