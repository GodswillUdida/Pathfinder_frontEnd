
type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export function StatusPill({
  status,
  /** @deprecated Prefer `status` — kept for call sites not yet migrated */
  published,
}: {
  status?: CourseStatus;
  published?: boolean;
}) {
  const resolved: CourseStatus =
    status ?? (published ? "PUBLISHED" : "DRAFT");

  if (resolved === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/12 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-success transition-colors duration-300">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-success motion-safe:animate-pulse"
        />
        Published
      </span>
    );
  }

  if (resolved === "ARCHIVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-muted-foreground transition-colors duration-300">
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full border border-muted-foreground/50 bg-muted-foreground/20"
        />
        Archived
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-warning transition-colors duration-300">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning" />
      Draft
    </span>
  );
}