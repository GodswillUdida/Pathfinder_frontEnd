import type { TopicWithResources } from "../types";
import { formatClock } from "../utils";
import { ContentTypeBadge } from "./ContentTypeBadge";

/**
 * Mobile: badge and length sit under the title so long titles never fight
 * the badge for space. From `sm`: one line, badge on the right.
 */
export function TopicRow({ topic, index }: { topic: TopicWithResources; index: number }) {
  const length = topic.durationSeconds ? formatClock(topic.durationSeconds) : null;

  return (
    <li className="relative flex items-start gap-3 rounded-lg py-2 hover:bg-secondary/50">
      <span className="relative z-10 grid h-6.5 w-6.5 shrink-0 place-items-center rounded-full border border-border bg-card font-mono text-[10px] tabular-nums text-muted-foreground">
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-[26px] text-foreground">
          {topic.title}
        </p>
        <div className="mb-0.5 flex flex-wrap items-center gap-2 sm:hidden">
          <ContentTypeBadge topic={topic} />
          {length && (
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {length}
            </span>
          )}
        </div>
      </div>

      <div className="hidden shrink-0 items-center gap-3 self-center sm:flex">
        {length && (
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {length}
          </span>
        )}
        <ContentTypeBadge topic={topic} />
      </div>
    </li>
  );
}
