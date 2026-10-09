// lib/fonts.ts
// next/font self-hosts and preloads these at build time — no runtime
// @import, no layout shift while the font loads. Both expose a
// `--font-display` / `--font-body` CSS variable via `.variable`, which
// cascades to any descendant using `var(--font-display, ...)` inline
// styles (Curriculum.tsx and PricingCard.tsx already reference these
// variables directly and need no changes once a `.variable` ancestor
// exists in the tree).
import { Syne, DM_Sans } from "next/font/google";

export const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});