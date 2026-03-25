import * as z from "zod";

export const courseSchema = z.object({
  id: z.string(),
  title: z.string(),
  instructor: z.string(),
  price: z.number(),
  originalPrice: z.number(),
  discount: z.number(),
  thumbnail: z.string(),
  duration: z.string(),
  lessons: z.number(),
  level: z.string(),
  rating: z.number(),
  students: z.number(),
  type: z.string(),
});

export type Course = z.infer<typeof courseSchema>;

export const cartItemSchema = z.object({
  course: courseSchema,
  quantity: z.number().min(1),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const couponSchema = z.object({
  code: z.string().min(1, { message: "Coupon code is required" }),
});

export type Coupon = z.infer<typeof couponSchema>;
