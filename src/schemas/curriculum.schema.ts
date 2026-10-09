import { z } from "zod";

/* ---------- shared resource validator (mirrors backend exactly) ---------- */

export const resourceValidator = z.string().trim().refine(
  (val) => {
    if (!val) return true;
    if (/^https?:\/\/[^\s]+$/.test(val)) return true; // URL
    if (/^[\w\-. ]+\.[A-Za-z0-9]{2,10}$/.test(val)) return true; // filename.ext
    if (/^[\w\-/\\ ]+$/.test(val)) return true; // simple path/name
    return false;
  },
  { message: "Invalid resource format" },
);

/* ---------- Module ---------- */

export const createModuleSchema = z.object({
  title: z.string().min(3, "Title too short").max(200, "Title too long").trim(),
  description: z.string().max(500, "Description too long").optional().or(z.literal("")),
  position: z.coerce.number().int().min(0).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

/* ---------- Topic ---------- */

export const createTopicSchema = z.object({
  title: z.string().min(3, "Title is too short").max(200, "Title too long").trim(),
  resources: z.array(resourceValidator).optional(),
});

export const updateTopicSchema = createTopicSchema.partial();

export type CreateTopicInput = z.infer<typeof createTopicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;