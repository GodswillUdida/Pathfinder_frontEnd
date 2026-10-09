import type { ComponentType } from "react";
import { CircleDashed, Layers2, ListChecks, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CurriculumTotals } from "./content-meta";

function Tile({
  icon: Icon,
  label,
  value,
  of,
  warn,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  of?: number;
  warn?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-3.5 py-3",
        warn ? "border-warning/30 bg-warning/5" : "border-border bg-card",
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-[11px]",
          warn ? "text-warning" : "text-muted-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p
        className={cn(
          "font-display mt-1 text-[18px] font-bold tabular-nums",
          warn ? "text-warning" : "text-foreground",
        )}
      >
        {value}
        {of != null && (
          <span className="text-[12px] font-medium text-muted-foreground">/{of}</span>
        )}
      </p>
    </div>
  );
}

/** At-a-glance shape of the curriculum: 2x2 on phones, one row from `sm`. */
export function CurriculumSummary({ totals }: { totals: CurriculumTotals }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      <Tile icon={Layers2} label="Modules" value={totals.modules} />
      <Tile icon={ListChecks} label="Topics" value={totals.topics} />
      <Tile
        icon={Video}
        label="Videos ready"
        value={totals.readyVideos}
        of={totals.videoTopics}
      />
      <Tile
        icon={CircleDashed}
        label="Needs content"
        value={totals.emptyTopics}
        warn={totals.emptyTopics > 0}
      />
    </div>
  );
}
