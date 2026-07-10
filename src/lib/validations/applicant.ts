import { z } from "zod";

export const applicantFormSchema = z.object({
fullName: z.string().min(1, "Full name is required"),

email: z
.string()
.min(1, "Email is required")
.email("Invalid email address"),

phone: z.string().min(1, "Phone is required"),

address: z.string().min(1, "Address is required"),

lectureCenter: z.string().optional(),
previousCenter: z.string().optional(),

isNewStudent: z.boolean().default(true),

level: z.string().optional(),

careerChallenges: z.string().optional(),

referredBy: z.string().optional(),

documents: z.array(z.string()).optional(),

papers: z
.array(z.string().min(1))
.min(1, "At least one paper is required"),

employment: z
.object({
placeOfWork: z.string().optional(),
position: z.string().optional(),
})
.optional(),

sponsor: z
.object({
name: z.string().optional(),
phone: z.string().optional(),
email: z.string().email("Invalid email").optional(),
location: z.string().optional(),
workplace: z.string().optional(),
})
.optional(),
});

export type ApplicantFormData = z.infer<typeof applicantFormSchema>;
