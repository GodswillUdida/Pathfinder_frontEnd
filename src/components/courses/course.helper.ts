import type { Course, CoursePricing, Module } from "@/types/course";

export const formatPrice = (price: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

  export function fmtSecs(sec: number): string {
    if (sec < 60) return `${sec}s`;
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h === 0) return `${m}m`;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

export function getActivePricings(course: Course): CoursePricing[] {
  if (!course.pricings?.length) return [];

  const active = course.pricings.filter((p) => p.isActive);

  return active.length ? active : course.pricings;
}

export function getLowestPricing(pricings: CoursePricing[]) {
  if (!pricings.length) return null;

  return pricings.reduce(
    (min, p) => (p.price < min.price ? p : min),
    pricings[0]
  );
}

export function getDurationLabel(duration: number | null) {
  if (!duration) return "Self-paced";

  const h = Math.floor(duration / 60);
  const m = duration % 60;

  if (h > 0) {
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  return `${m}m`;
}

export function isNew(createdAt?: string) {
  if (!createdAt) return false;

  return (
    Date.now() - new Date(createdAt).getTime() <
    14 * 24 * 60 * 60 * 1000
  );
}

export function computeStats(modules: Module[]) {
  let topicCount = 0;
  let totalSeconds = 0;

  modules.forEach((m) => {
    topicCount += m.topics?.length ?? 0;

    m.topics?.forEach((t) => {
      totalSeconds += t.durationSeconds ?? 0;
    });
  });

  return {
    moduleCount: modules.length,
    topicCount,
    totalSeconds,
  };
}