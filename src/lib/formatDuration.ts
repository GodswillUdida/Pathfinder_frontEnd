// src/lib/formatDuration.ts
export function formatDuration(durationDays: number): string {
  if (durationDays <= 0) return '';

  // 1 day
  if (durationDays === 1) {
    return '1 day access';
  }

  // Less than 30 days → show in weeks or days
  if (durationDays < 30) {
    const weeks = Math.round(durationDays / 7);
    if (weeks === 1) return '1 week access';
    return `${weeks} weeks access`;
  }

  // 30 days and above → show in months
  const months = Math.round(durationDays / 30);
  if (months === 1) return '1 month access';
  return `${months} months access`;
}