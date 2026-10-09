import type { ReactNode } from "react";
import type { CourseAdminDetail } from "@/types/catalog";
import type { ModuleWithTopics } from "@/types/domain";
import { LEVEL_LABEL } from "../constants";
import { summarizeCurriculum } from "../curriculum/content-meta";
import { formatDate } from "../utils";
import { PublishChecklist } from "./PublishChecklist";

export function OverviewPanel({
  course,
  modules,
}: {
  course: CourseAdminDetail;
  modules: ModuleWithTopics[];
}) {
  const totals = summarizeCurriculum(modules);

  const info: { label: string; value: ReactNode }[] = [
    {
      label: "Program",
      value: course.programs?.map((p) => p.program.title).join(", ") || "—",
    },
    {
      label: "Level",
      value: course.level ? (LEVEL_LABEL[course.level] ?? course.level) : "—",
    },
    { label: "Created", value: formatDate(course.createdAt) },
    { label: "Last updated", value: formatDate(course.updatedAt) },
  ];

  const stats = [
    { value: totals.modules, label: "modules" },
    { value: totals.topics, label: "topics" },
    { value: totals.readyVideos, label: "videos ready" },
  ];

  return (
    <div className="max-w-3xl space-y-10 py-8">
      <PublishChecklist totals={totals} />

      <section aria-labelledby="info-heading" className="space-y-4">
        <h2
          id="info-heading"
          className="font-display text-[13px] font-bold tracking-tight text-foreground"
        >
          Course information
        </h2>
        <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
          {info.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b border-border py-3"
            >
              <dt className="text-[12.5px] text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 truncate text-right text-[13.5px] font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        {course.description && (
          <p className="max-w-2xl pt-1 text-[13.5px] leading-relaxed text-muted-foreground">
            {course.description}
          </p>
        )}
      </section>

      <section aria-labelledby="snapshot-heading" className="space-y-4">
        <h2
          id="snapshot-heading"
          className="font-display text-[13px] font-bold tracking-tight text-foreground"
        >
          Content snapshot
        </h2>
        <div className="flex flex-wrap gap-x-10 gap-y-3">
          {stats.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <span className="font-display text-[22px] font-semibold tracking-tight tabular-nums text-foreground">
                {s.value}
              </span>
              <span className="text-[13px] text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
