import { z } from "zod";

const resourceValidator = z.string().refine(
  (val) =>
    val === "" ||
    /^https?:\/\//.test(val) || // full URL
    /^[\w\-. ]+\.[A-Za-z0-9]{2,6}$/.test(val) || // simple filename with extension like "slides.pdf"
    /^[\w\-/\\ ]+$/.test(val), // filenames without ext or paths
  { message: "Must be a valid URL or filename" }
);

export const topicSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Topic title is required"),
  videoUrl: z.string().url().optional().nullable(),
  resources: z.array(resourceValidator).optional(), // filenames or URLs
});

export const moduleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(100, "Module title is too long"),
  description: z.string().max(500).optional().nullable(),
  topics: z.array(topicSchema).optional().default([]),
});

export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z.string().min(3).optional(),
  description: z.string().min(1).max(2000),
  thumbnail: z.string().url().optional().or(z.literal("")).optional(),
  price: z.number().min(0, "Invalid price"),
  type: z.enum(["online", "physical"]),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
  duration: z.string().optional().nullable(),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).optional().default([]),
  instructorId: z.string().uuid().optional(),
  programId: z.string().optional().nullable(),
  programTitle: z.string().optional().nullable(),
  videoPreview: z.string().url().optional().or(z.literal("")).optional(),
  modules: z.array(moduleSchema).optional().default([]),
  // modules: z
  //   .array(
  //     z.object({
  //       title: z.string().min(1).max(100),
  //       description: z.string().max(500).optional(),
  //       topics: z
  //         .array(
  //           z.object({
  //             title: z.string().min(1).max(100),
  //             videoUrl: z.string().url().optional(),
  //             resources: z
  //               .array(
  //                 z
  //                   .string()
  //                   .refine(
  //                     (val) =>
  //                       /^https?:\/\//.test(val) ||
  //                       /^[\w,\s-]+\.[A-Za-z]{3,4}$/.test(val),
  //                     "Must be a valid URL or filename"
  //                   )
  //               )
  //               .optional(),
  //           })
  //         )
  //         .optional()
  //         .default([]),
  //     })
  //   )
  //   .optional()
  //   .default([]),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  // courseId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
});

export const updateModuleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional().nullable(),
});

export const createTopicSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1),
  videoUrl: z.string().url().optional().nullable(),
  resources: z.array(resourceValidator).optional().default([]),
});

export const updateTopicSchema = z.object({
  title: z.string().min(1).optional(),
  videoUrl: z.string().url().optional().nullable(),
  resources: z.array(resourceValidator).optional(),
});

export const listCoursesQuery = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  type: z.enum(["online", "physical"]).optional(),
  limit: z.coerce.number().default(20),
  offset: z.coerce.number().default(0),
});
