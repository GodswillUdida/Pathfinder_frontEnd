"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { createModuleSchema, type CreateModuleInput } from "@/schemas/curriculum.schema";

interface Props {
  defaultValues?: Partial<CreateModuleInput>;
  onSubmit: (values: CreateModuleInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ModuleForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save module",
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.input<typeof createModuleSchema>, undefined, CreateModuleInput>({
    resolver: zodResolver(createModuleSchema),
    mode: "onChange",
    defaultValues: { title: "", description: "", position: 0, ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 font-[family-name:var(--font-body)]" noValidate>
      <div className="space-y-2">
        <label htmlFor="module-title" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
          Title <span className="text-[var(--danger)]">*</span>
        </label>
        <input
          id="module-title"
          {...register("title")}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "module-title-error" : undefined}
          className="w-full min-h-11 bg-transparent border-0 border-b border-[var(--line-strong)] px-0 pb-2 font-[family-name:var(--font-display)] text-[19px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] placeholder:not-italic italic outline-none transition-[border-color,border-width] duration-150 focus:border-b-2 focus:border-[var(--accent)]"
          placeholder="e.g. Getting Started"
        />
        {errors.title && (
          <p id="module-title-error" className="text-[11.5px] text-[var(--danger)]" role="alert">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="module-description" className="block text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-faint)]">
          Description
        </label>
        <textarea
          id="module-description"
          {...register("description")}
          rows={2}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? "module-description-error" : undefined}
          className="w-full bg-transparent border-0 border-b border-[var(--line-strong)] px-0 pb-2 text-[14px] leading-relaxed text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none resize-none transition-[border-color,border-width] duration-150 focus:border-b-2 focus:border-[var(--accent)]"
          placeholder="Optional short summary of this module"
        />
        {errors.description && (
          <p id="module-description-error" className="text-[11.5px] text-[var(--danger)]" role="alert">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-5 pt-1">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex items-center gap-2 min-h-11 px-5 bg-[var(--ink)] text-[var(--paper)] text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 hover:bg-[var(--accent-strong)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]"
        >
          {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="min-h-11 sm:min-h-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)] transition-colors duration-150 hover:text-[var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
} 