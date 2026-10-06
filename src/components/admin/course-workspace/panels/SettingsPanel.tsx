import type { CourseAdminDetail } from "@/types/catalog";
import { cn } from "@/lib/utils";
import { LEVEL_LABEL } from "../constants";

export function SettingsPanel({
  course,
  onDelete,
}: {
  course: CourseAdminDetail;
  onDelete: () => void;
}) {
  const rows = [
    { label: "Title", value: course.title },
    {
      label: "Level",
      value: course.level ? (LEVEL_LABEL[course.level] ?? course.level) : "—",
    },
    {
      label: "Program",
      value: course.programs?.map((p) => p.program.title).join(", ") || "—",
    },
  ];

  return (
    <div className="max-w-2xl space-y-10 py-8">
      <section aria-labelledby="general-heading" className="space-y-4">
        <h2
          id="general-heading"
          className="font-display text-[13px] font-bold tracking-tight text-foreground"
        >
          General
        </h2>
        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 px-4 py-3.5"
            >
              <dt className="shrink-0 text-[12.5px] text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 truncate text-right text-[13.5px] font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="danger-heading" className="space-y-4">
        <h2
          id="danger-heading"
          className="font-display text-[13px] font-bold tracking-tight text-destructive"
        >
          Danger zone
        </h2>
        <div className="flex flex-col gap-4 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <p className="text-[13.5px] font-medium text-foreground">Delete this course</p>
            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
              Permanently removes the course, its modules, and topics. This can&apos;t
              be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={onDelete}
            className={cn(
              "h-11 shrink-0 rounded-xl border border-destructive/40 px-4 text-[13px] font-semibold text-destructive sm:h-10",
              "transition-colors duration-300 hover:bg-destructive/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            Delete course
          </button>
        </div>
      </section>
    </div>
  );
}
