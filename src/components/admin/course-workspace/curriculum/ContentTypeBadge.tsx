import { CircleDashed, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TopicWithResources } from "../types";
import { getContentMeta } from "./content-meta";

const base =
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase";

export function ContentTypeBadge({ topic }: { topic: TopicWithResources }) {
  const meta = getContentMeta(topic);
  const status = topic.videoAsset?.status;

  if (meta.kind === "empty") {
    return (
      <span className={cn(base, "bg-muted text-muted-foreground/80")}>
        <CircleDashed className="h-3 w-3" aria-hidden />
        No content
      </span>
    );
  }

  if (meta.kind === "resources-only") {
    return (
      <span className={cn(base, "bg-brand-indigo/12 text-brand-indigo")}>
        <FileText className="h-3 w-3" aria-hidden />
        {meta.count} resource{meta.count === 1 ? "" : "s"}
      </span>
    );
  }

  // video-only or mixed: lead with the video state, append resource count
  const tone =
    status === "READY"
      ? "bg-success/12 text-success"
      : status === "FAILED"
        ? "bg-destructive/12 text-destructive"
        : "bg-warning/12 text-warning";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn(base, tone)}>
        <Video className="h-3 w-3" aria-hidden />
        {status ? status.toLowerCase() : "video"}
      </span>
      {meta.kind === "mixed" && (
        <span
          className={cn(base, "bg-brand-indigo/12 text-brand-indigo")}
          title={`${meta.count} resource${meta.count === 1 ? "" : "s"}`}
        >
          <FileText className="h-3 w-3" aria-hidden />+{meta.count}
        </span>
      )}
    </span>
  );
}
