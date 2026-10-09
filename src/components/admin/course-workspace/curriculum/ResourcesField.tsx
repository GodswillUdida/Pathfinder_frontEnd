"use client";

import { FileText, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldHeader } from "../ui/FieldHeader";
import { IconButton } from "../ui/IconButton";
import { MAX_RESOURCES, RESOURCE_ACCEPT } from "../constants";
import { formatBytes } from "../utils";

interface ResourcesFieldProps {
  files: File[];
  error: string | null;
  disabled?: boolean;
  onAdd: (list: FileList | null) => void;
  onRemove: (index: number) => void;
}

export function ResourcesField({ files, error, disabled, onAdd, onRemove }: ResourcesFieldProps) {
  const full = files.length >= MAX_RESOURCES;

  return (
    <div className="space-y-2">
      <FieldHeader index="03" label="Resources" optional />

      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${f.size}-${f.lastModified}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card py-1.5 pr-1.5 pl-3"
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-indigo" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-foreground">{f.name}</p>
                <p className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
                  {formatBytes(f.size)}
                </p>
              </div>
              <IconButton
                label={`Remove ${f.name}`}
                variant="danger"
                disabled={disabled}
                onClick={() => onRemove(i)}
              >
                <X className="h-4 w-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      <label
        className={cn(
          "flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border text-[13px] font-semibold text-muted-foreground transition-colors duration-300",
          "hover:border-brand-300 hover:bg-secondary hover:text-foreground focus-within:ring-2 focus-within:ring-ring",
          (disabled || full) && "pointer-events-none opacity-50",
        )}
      >
        <Paperclip className="h-4 w-4" aria-hidden />
        {files.length ? "Add more files" : "Attach files"}
        <input
          type="file"
          multiple
          accept={RESOURCE_ACCEPT}
          disabled={disabled || full}
          className="sr-only"
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      <p className="text-[11.5px] text-muted-foreground">
        PDF, Office, CSV, ZIP or images. {files.length}/{MAX_RESOURCES} files.
      </p>

      {error && (
        <p role="alert" className="text-[12px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
