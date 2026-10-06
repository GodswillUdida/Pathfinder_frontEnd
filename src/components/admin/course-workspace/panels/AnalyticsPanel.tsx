import { BarChart3, BookOpen, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PLACEHOLDER DATA. These figures are hardcoded, so the panel says so
 * on screen rather than letting an admin mistake them for real numbers.
 * Replace `sample` with a real analytics hook and drop the notice.
 */
const sample = {
  students: 1200,
  pricings: 15,
  totalEnrollments: 3500,
  totalRevenue: 12500.75,
};

export function AnalyticsPanel() {
  return (
    <div className="space-y-4 py-6">
      <p
        role="note"
        className="rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-2.5 text-[12.5px] text-warning"
      >
        Sample figures. Live analytics for this course aren&apos;t connected yet.
      </p>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 rounded-2xl border border-border bg-card p-4 sm:col-span-7 sm:p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[12px] font-medium text-muted-foreground">
                Total students
              </p>
              <p className="font-display mt-2 text-[clamp(2rem,4vw,2.75rem)] font-semibold tracking-tight tabular-nums text-foreground">
                {sample.students.toLocaleString()}
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/15 text-primary">
              <Users className="h-5 w-5" aria-hidden />
            </div>
          </div>
        </div>

        <div className="col-span-12 grid gap-4 sm:col-span-5 sm:grid-rows-2">
          <Stat
            icon={<BookOpen className="h-4 w-4" aria-hidden />}
            tone="success"
            label="Active pricings"
            value={sample.pricings.toString()}
          />
          <Stat
            icon={<BarChart3 className="h-4 w-4" aria-hidden />}
            tone="warning"
            label="Total enrollments"
            value={sample.totalEnrollments.toLocaleString()}
          />
        </div>

        <div className="col-span-12 flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 text-primary">
            <Sparkles className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-[12px] text-muted-foreground">Total revenue</p>
            <p className="font-display text-[26px] font-semibold tracking-tight tabular-nums text-foreground">
              $
              {sample.totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  tone,
  label,
  value,
}: {
  icon: React.ReactNode;
  tone: "success" | "warning";
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            tone === "success" ? "bg-success/12 text-success" : "bg-warning/12 text-warning",
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground">{label}</p>
          <p className="font-display text-[22px] font-semibold tabular-nums text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
