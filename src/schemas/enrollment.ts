// schemas/enrollment.ts
import { z } from "zod";

export const enrollmentRequestSchema = z.object({
  // courseId: z.string().min(1),
  name: z.string().min(2, "Name is required"),
  email: z.email(),
  phone: z.string().min(7),
  notes: z.string().optional(),
});

export type EnrollmentRequestInput = z.infer<typeof enrollmentRequestSchema>;
