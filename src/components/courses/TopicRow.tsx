import { Topic } from "@/types/course";
import { Lock, PlayCircle } from "lucide-react";
import { fmtSecs } from "./course.helper";

export function TopicRow({ topic, enrolled }: { topic: Topic; enrolled: boolean }) {
    // A topic is "preview-able" if videoStatus is ready and no enrollment required,
    // or if an explicit isPreview flag is set (extend Topic if needed)
    const isReady = topic.videoStatus === "ready" || topic.bunnyVideoId != null;
    const isLocked = !enrolled && !isReady;
  
    return (
      <div
        className={[
          "flex items-center justify-between px-5 py-3 text-sm transition-colors",
          isLocked
            ? "text-slate-400"
            : "cursor-pointer text-slate-700 hover:bg-blue-50",
        ].join(" ")}
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={[
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
              isLocked ? "bg-slate-100" : "bg-blue-100",
            ].join(" ")}
          >
            {isLocked ? (
              <Lock className="h-3 w-3 text-slate-400" />
            ) : (
              <PlayCircle className="h-3 w-3 text-blue-600" />
            )}
          </span>
  
          <div className="min-w-0">
            <p className="truncate leading-snug">{topic.title}</p>
            {/* Show video status if not ready */}
            {topic.videoStatus && topic.videoStatus !== "ready" && (
              <p className="mt-0.5 text-[11px] capitalize text-amber-500">
                {topic.videoStatus}…
              </p>
            )}
          </div>
        </div>
  
        {/* Right */}
        <div className="ml-3 flex shrink-0 items-center gap-2">
          {topic.durationSeconds && topic.durationSeconds > 0 && (
            <span className="text-xs tabular-nums text-slate-400">
              {fmtSecs(topic.durationSeconds)}
            </span>
          )}
          {!isLocked && isReady && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
              Preview
            </span>
          )}
          {isLocked && <Lock className="h-3.5 w-3.5 text-slate-300" />}
        </div>
      </div>
    );
  }
  