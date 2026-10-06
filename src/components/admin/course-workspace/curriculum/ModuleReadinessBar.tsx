import { cn } from "@/lib/utils";

/** Bar shows from `sm` up; the fraction always shows. */
export function ModuleReadinessBar({ ready, total }: { ready: number; total: number }) {
  const pct = total > 0 ? Math.round((ready / total) * 100) : 0;
  return (
    <div
      className="flex items-center gap-2"
      role="img"
      aria-label={`${ready} of ${total} topics ready`}
    >
      <div className="hidden h-1 w-14 overflow-hidden rounded-full bg-muted sm:block">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            pct === 100
              ? "bg-success"
              : pct === 0
                ? "bg-muted-foreground/30"
                : "bg-warning",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
        {ready}/{total}
      </span>
    </div>
  );
}
