// lib/courses.ts
// Shared read-side helpers for CourseCatalogItem. Anything that reads
// pricing, duration, or program info off a catalog course belongs
// here — not reimplemented per-component, which is how the old
// program/duration field-name drift happened in the first place.

import type { CourseCatalogItem, CourseCatalogPricing, CourseCatalogProgramRef } from "@/types/catalog";
import type { CoursePricing } from "@/types/domain";

  export function fmtSecs(sec: number): string {
  if (sec < 60) return `${sec}s`;
  
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);

  return parts.join(" ");
}


export function formatPrice(price: string | number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(typeof price === "string" ? Number(price) : price);
}

/**
 * The catalog list endpoint has no isActive flag on pricing — every
 * entry returned is already sale-eligible. Do not filter by it.
 */
export function getPricings(
  course: Pick<CourseCatalogItem, "pricings">
): CourseCatalogPricing[] {
  return course.pricings ?? [];
}

export function getLowestPricing(
  pricings: CourseCatalogPricing[]
): CourseCatalogPricing | null {
  if (!pricings.length) return null;
  return pricings.reduce(
    (min, p) => (Number(p.price) < Number(min.price) ? p : min),
    pricings[0]
  );
}

/** null = lifetime access. Works for both CourseCatalogPricing and full CoursePricing. */
export function accessLabel(pricing: { accessDurationDays: number | null }): string {
  return pricing.accessDurationDays == null
    ? "Lifetime access"
    : `${pricing.accessDurationDays}-days access`;
}

/**
 * Full CoursePricing (course detail endpoints) DOES have isActive,
 * unlike the trimmed catalog-list pricing — filter to active plans,
 * falling back to all if none are flagged active.
 */
export function getActiveFullPricings(pricings: CoursePricing[]): CoursePricing[] {
  const active = pricings.filter((p) => p.isActive);
  return active.length > 0 ? active : pricings;
}

/** Cheapest of a full CoursePricing[] list, by numeric price (Decimal serializes as string). */
export function getLowestFullPricing(pricings: CoursePricing[]): CoursePricing | null {
  if (!pricings.length) return null;
  return pricings.reduce(
    (min, p) => (Number(p.price) < Number(min.price) ? p : min),
    pricings[0]
  );
}

/**
 * A course can belong to zero, one, or multiple programs
 * (CourseCatalogItem.programs is a plural array) — this picks the one
 * with the lowest `position` for display purposes.
 */
export function getPrimaryProgram(
  course: Pick<CourseCatalogItem, "programs">
): CourseCatalogProgramRef["program"] | null {
  if (!course.programs?.length) return null;
  return [...course.programs].sort((a, b) => a.position - b.position)[0].program;
}

export function buildCourseHref(
  course: Pick<CourseCatalogItem, "slug" | "programs">
): string {
  const program = getPrimaryProgram(course);
  return program ? `/courses/${program.slug}/${course.slug}` : `/courses/c/${course.slug}`;
}

/**
 * When the route already specifies which program (e.g.
 * /courses/[programSlug]/[courseSlug]), resolve the breadcrumb against
 * that exact slug rather than guessing the "primary" one — a course
 * can belong to multiple programs, and the one in the URL is the one
 * the visitor actually navigated through.
 */
export function getProgramBySlug(
  course: Pick<CourseCatalogItem, "programs">,
  programSlug: string
): CourseCatalogProgramRef["program"] | null {
  return course.programs?.find((p) => p.program.slug === programSlug)?.program ?? null;
}

/** totalDurationSeconds is in SECONDS, not minutes. */
export function getDurationLabel(totalDurationSeconds: number): string {
  if (!totalDurationSeconds || totalDurationSeconds <= 0) {
    return "Self-paced";
  }

  if (totalDurationSeconds < 60) {
    return `${totalDurationSeconds}s`;
  }

  const totalMinutes = Math.floor(totalDurationSeconds / 60);

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return `${m}m`;
}

export function getLevelColorClasses(level: string): string {
  const l = level.toLowerCase();
  if (l.includes("begin")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (l.includes("inter")) return "bg-blue-50 text-blue-700 border-blue-200";
  if (l.includes("advanc") || l.includes("profession"))
    return "bg-violet-50 text-violet-700 border-violet-200";
  return "bg-slate-100 text-slate-600 border-slate-200";
}

export function isNewCourse(createdAt?: string): boolean {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
};