import { Circle, CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurriculumTotals } from "../curriculum/content-meta";

interface Step {
  done: boolean;
  label: string;
  detail?: string;
}

function buildSteps(t: CurriculumTotals): Step[] {
  return [
    { done: t.modules > 0, label: "Add at least one module" },
    { done: t.topics > 0, label: "Add at least one topic" },
    {
      done: t.topics > 0 && t.emptyTopics === 0,
      label: "Give every topic a video or resources",
      detail:
        t.emptyTopics > 0
          ? `${t.emptyTopics} topic${t.emptyTopics === 1 ? "" : "s"} still empty`
          : undefined,
    },
    {
      done: t.topics > 0 && t.pendingVideos === 0,
      label: "Wait for every video to finish processing",
      detail:
        t.pendingVideos > 0
          ? `${t.pendingVideos} video${t.pendingVideos === 1 ? "" : "s"} not ready`
          : undefined,
    },
  ];
}

export function PublishChecklist({ totals }: { totals: CurriculumTotals }) {
  const steps = buildSteps(totals);
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  return (
    <section aria-labelledby="checklist-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2
          id="checklist-heading"
          className="font-display text-[13px] font-bold tracking-tight text-foreground"
        >
          Before you publish
        </h2>
        <span className="font-mono text-[11.5px] tabular-nums text-muted-foreground">
          {doneCount}/{steps.length} done
        </span>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {steps.map((step) => (
          <li key={step.label} className="flex items-start gap-3 px-4 py-3">
            {step.done ? (
              <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" aria-hidden />
            )}
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[13px]",
                  step.done ? "text-muted-foreground line-through" : "text-foreground",
                )}
              >
                {step.label}
                <span className="sr-only">{step.done ? " (done)" : " (not done)"}</span>
              </p>
              {step.detail && (
                <p className="mt-0.5 text-[12px] text-warning">{step.detail}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

      {allDone && (
        <p className="text-[12.5px] text-success">
          Everything is in place. This course is ready to publish.
        </p>
      )}
    </section>
  );
}
