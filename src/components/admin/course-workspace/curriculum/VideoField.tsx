"use client";

import { useId, useState } from "react";
import { Trash2, UploadCloud, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldHeader } from "../ui/FieldHeader";
import { IconButton } from "../ui/IconButton";
import { MAX_VIDEO_BYTES } from "../constants";
import { formatBytes, formatClock } from "../utils";
import { useVideoDuration } from "./useVideoDuration";

interface VideoFieldProps {
  video: File | null;
  error: string | null;
  disabled?: boolean;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}

export function VideoField({ video, error, disabled, onPick, onClear }: VideoFieldProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const duration = useVideoDuration(video);

  return (
    <div className="space-y-2">
      <FieldHeader index="02" label="Video lesson" optional htmlFor={inputId} />

      {video ? (
        <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-success/15 text-success">
            <Video className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {video.name}
            </p>
            <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
              {formatBytes(video.size)}
              {duration != null && ` · ${formatClock(duration)}`}
            </p>
          </div>
          <IconButton
            label="Remove video"
            variant="danger"
            disabled={disabled}
            onClick={onClear}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!disabled) onPick(e.dataTransfer.files[0]);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-dashed px-4 py-7 text-center transition-colors duration-300",
            "focus-within:ring-2 focus-within:ring-ring",
            disabled && "pointer-events-none opacity-60",
            dragging
              ? "border-primary bg-accent"
              : "border-border bg-card hover:border-brand-300 hover:bg-secondary/60",
          )}
        >
          <UploadCloud className="h-6 w-6 text-primary" aria-hidden />
          <span className="text-[13px] font-semibold text-foreground">
            Tap to choose a video
            <span className="hidden sm:inline"> or drop it here</span>
          </span>
          <span className="text-[11.5px] text-muted-foreground">
            MP4, MOV or WebM, up to {formatBytes(MAX_VIDEO_BYTES)}
          </span>
          <input
            id={inputId}
            type="file"
            accept="video/*"
            disabled={disabled}
            className="sr-only"
            onChange={(e) => {
              onPick(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      )}

      {error && (
        <p role="alert" className="text-[12px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
