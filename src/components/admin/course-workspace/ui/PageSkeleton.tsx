/**
 * Server-safe (no hooks). No CSS containment: a skeleton must never
 * collapse a scroll ancestor's measured height.
 */
export function PageSkeleton() {
  return (
    <div
      className="page-container space-y-8 py-[clamp(1.25rem,2.5vw,2rem)]"
      aria-busy="true"
      aria-label="Loading course"
    >
      <div className="h-3 w-48 animate-pulse rounded-full bg-muted" />
      <div className="space-y-4">
        <div className="h-3 w-28 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-full max-w-80 animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-full max-w-64 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-11 w-full max-w-md animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
