import { z } from "zod";

export const HeroSchema = z.object({
  headline: z.object({
    prefix: z.string(),
    main: z.string(),
  }),
  benefits: z.array(z.string()),
  slides: z.array(
    z.object({
      image: z.string().url(),
      alt: z.string(),
    }),
  ),
});
export type HeroType = z.infer<typeof HeroSchema>;