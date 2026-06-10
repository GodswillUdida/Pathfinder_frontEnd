"use client";

import { useEffect, useRef } from "react";
import { useCreateProgram } from "@/hooks/useAdminPrograms";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X, GraduationCap, Loader2, CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Schema ───────────────────────────────────────────────────────────────────

const programSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be 100 characters or fewer"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or fewer")
    .optional(),
});

type ProgramForm = z.infer<typeof programSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateProgramModalProps {
  open:      boolean;
  onClose:   () => void;
  onCreated: () => void;
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  id, label, error, hint, children,
}: {
  id: string; label: string; error?: string; hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="text-[12px] font-medium text-gray-700 dark:text-white/70"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[10px] text-gray-400 dark:text-white/30">{hint}</p>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function CreateProgramModal({
  open, onClose, onCreated,
}: CreateProgramModalProps) {
  const { mutateAsync, isPending } = useCreateProgram();
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProgramForm>({
    resolver: zodResolver(programSchema),
    defaultValues: { title: "", description: "" },
  });

  const descriptionValue = watch("description") ?? "";

  // Focus first field on open; close on Escape
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => firstFieldRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(timer); window.removeEventListener("keydown", onKey); };
  }, [open, isPending, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onSubmit = async (data: ProgramForm) => {
    try {
      await mutateAsync(data);
      toast.success("Program created.");
      reset();
      onCreated();
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Failed to create program.";
      if (msg.includes("Authorization") || msg.includes("401")) {
        toast.error("Session expired. Please sign in again.");
      } else {
        toast.error(msg);
      }
    }
  };

  const handleClose = () => {
    if (isPending) return;
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className={cn(
            "w-full max-w-md pointer-events-auto",
            "bg-white dark:bg-[#0f1117]",
            "border border-black/[0.08] dark:border-white/[0.08]",
            "rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50",
            "overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-150"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[8px] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <h2
                id="modal-title"
                className="text-[14px] font-semibold text-gray-900 dark:text-white"
              >
                New program
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isPending}
              aria-label="Close modal"
              className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all disabled:opacity-40"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="px-6 py-5 space-y-4">

              {/* Title */}
              <Field id="title" label="Title" error={errors.title?.message}>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Accounting Technician Scheme"
                  {...register("title")}
                  ref={(el) => {
                    register("title").ref(el);
                    (firstFieldRef as React.RefObject<HTMLInputElement | null>).current = el;
                  }}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  className={cn(
                    "w-full px-3 py-2 text-[13px] rounded-xl transition-all",
                    "bg-white dark:bg-white/[0.05]",
                    "border border-black/[0.08] dark:border-white/[0.08]",
                    "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-amber-400",
                    errors.title && "border-red-400 focus:ring-red-500/20 focus:border-red-400"
                  )}
                />
              </Field>

              {/* Description */}
              <Field
                id="description"
                label="Description"
                error={errors.description?.message}
                hint={`${descriptionValue.length}/500 characters`}
              >
                <textarea
                  id="description"
                  rows={3}
                  placeholder="A short summary of what this program covers…"
                  {...register("description")}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? "description-error" : undefined}
                  className={cn(
                    "w-full px-3 py-2 text-[13px] rounded-xl resize-none transition-all",
                    "bg-white dark:bg-white/[0.05]",
                    "border border-black/[0.08] dark:border-white/[0.08]",
                    "text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400",
                    errors.description && "border-red-400 focus:ring-red-500/20 focus:border-red-400"
                  )}
                />
              </Field>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-black/[0.06] dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-[12px] font-medium border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-white/70 hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors disabled:opacity-40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    Creating…
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-3.5 h-3.5" aria-hidden="true" />
                    Create program
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}