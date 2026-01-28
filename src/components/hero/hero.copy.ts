import { HeroSchema } from "./hero.schema";

export const HERO_COPY = HeroSchema.parse({
  headline: {
    prefix: "Elevate Your",
    main: "Accounting Career",
  },
  benefits: [
    "Practical, hands-on learning",
    "Industry-recognized certification",
    "Flexible online access",
    "Expert instructors",
    "Job placement support",
    "Lifetime access",
  ],
  stats: {
    rating: 4.9,
    reviews: 2000,
    students: 2000,
  },
  slides: [
    { image: "...", alt: "Students learning together" },
    { image: "...", alt: "Professional training environment" },
  ],
});
