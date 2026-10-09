"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateModule } from "@/hooks/useCurriculum";
import { IconButton } from "../ui/IconButton";

const fieldClass =
  "w-full rounded-xl border border-border bg-background px-3.5 text-[16px] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60 sm:text-[13.5px]";

export function AddModuleCard({
  courseId,
  onCreated,
}: {
  courseId: string;
  onCreated: () => void;
}) {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descriptionId = `${uid}-description`;

  const createModule = useCreateModule(courseId);
  const pending = createModule.isPending;

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit = trimmedTitle.length > 0 && trimmedDescription.length > 0 && !pending;

  const reset = () => {
    setTitle("");
    setDescription("");
    setOpen(false);
  };

  const submit = async () => {
    if (!canSubmit) return;
    try {
      await createModule.mutateAsync({
        title: trimmedTitle,
        description: trimmedDescription,
      });
      toast.success("Module created.");
      reset();
      onCreated();
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to create module.");
    }
  };

  // Ctrl/Cmd+Enter submits from either field, Escape cancels. Plain Enter in
  // the textarea stays a line break.
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
    if (e.key === "Escape" && !pending) {
      e.preventDefault();
      reset();
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-[13px] font-semibold text-muted-foreground",
          "transition-colors duration-300 hover:border-brand-300 hover:bg-secondary hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add module
      </button>
    );
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="space-y-3.5 rounded-2xl border border-brand-300/60 bg-card p-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[14px] font-bold tracking-tight text-foreground">
          New module
        </h3>
        <IconButton label="Cancel" onClick={reset} disabled={pending}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>

      <div className="space-y-1.5">
        <label htmlFor={titleId} className="text-[12px] font-medium text-muted-foreground">
          Title
        </label>
        <input
          id={titleId}
          autoFocus
          value={title}
          disabled={pending}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Foundations of Accrual Accounting"
          className={cn(fieldClass, "h-11 sm:h-10")}
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor={descriptionId}
          className="text-[12px] font-medium text-muted-foreground"
        >
          Description
        </label>
        <textarea
          id={descriptionId}
          value={description}
          disabled={pending}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What will students learn in this module?"
          rows={3}
          className={cn(fieldClass, "resize-none py-2.5 leading-relaxed")}
        />
      </div>

      <div className="flex items-center gap-2.5 pt-1">
        <button
          type="button"
          onClick={reset}
          disabled={pending}
          className="h-11 flex-1 rounded-xl border border-border px-4 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:h-10 sm:flex-none"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!canSubmit}
          className="flex h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:h-10 sm:flex-none"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            "Create module"
          )}
        </button>
      </div>
    </div>
  );
}
