"use client";

import {
  useEffect, useRef, useState, useCallback, useId,
} from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import {
  X, Plus, Trash2, Upload, GraduationCap, Loader2,
  CheckCircle2, AlertCircle, ImageIcon, DollarSign,
  ChevronRight, Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateCourse, useUpdateCourse } from "@/hooks/useCourses";
import type { Course } from "@/types/course";
import { CourseFormData, courseFormSchema, courseToFormValues, defaultCourseFormValues, DURATION_PRESETS, LEVEL_STYLES } from "../courses/course-form";

// ─── Tab ─────────────────────────────────────────────────────────────────────

type Tab = "details" | "media" | "pricing";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "details", label: "Details",  icon: GraduationCap },
  { id: "media",   label: "Media",    icon: ImageIcon },
  { id: "pricing", label: "Pricing",  icon: DollarSign },
];

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  id, label, error, required = false, hint, children,
}: {
  id?: string; label: string; error?: string; required?: boolean;
  hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[12px] font-semibold text-gray-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-600" role="alert">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Input class ──────────────────────────────────────────────────────────────

const input = (err?: boolean) =>
  cn(
    "w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition-all",
    "placeholder:text-gray-400",
    err
      ? "border-red-300 bg-red-50 focus:ring-2 focus:ring-red-400/20 focus:border-red-400"
      : "border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
  );

// ─── Tag chip input ───────────────────────────────────────────────────────────

function TagInput({
  value, onChange, error,
}: {
  value: string[]; onChange: (v: string[]) => void; error?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const tag = draft.trim().toLowerCase();
    if (!tag || value.includes(tag) || value.length >= 10) return;
    onChange([...value, tag]);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <div className="flex min-h-[32px] flex-wrap gap-1.5">
        {value.length === 0 && (
          <span className="text-[11px] text-gray-400">No tags yet — add up to 10</span>
        )}
        {value.map((tag, i) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              background: "rgba(99,102,241,0.08)",
              color:      "#4f46e5",
              border:     "0.5px solid rgba(99,102,241,0.25)",
            }}
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              aria-label={`Remove tag "${tag}"`}
              className="rounded-full p-px hover:bg-indigo-100 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>

      {value.length < 10 && (
        <div className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
            placeholder="Type a tag, press Enter…"
            maxLength={30}
            className={cn(input(!!error), "flex-1 py-2")}
          />
          <button
            type="button"
            onClick={commit}
            disabled={!draft.trim()}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-[12px] font-semibold transition-colors disabled:opacity-40"
            style={{
              background: "rgba(99,102,241,0.08)",
              color:      "#4f46e5",
              border:     "0.5px solid rgba(99,102,241,0.2)",
            }}
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      )}

      <p className="text-[10px] text-gray-400">{value.length}/10 tags</p>
    </div>
  );
}

// ─── Media field ──────────────────────────────────────────────────────────────

function MediaField({
  id, label, value, onChange, error, type,
}: {
  id: string; label: string; value?: File | string;
  onChange: (v: File | string) => void;
  error?: string; type: "image" | "video";
}) {
  const fileRef              = useRef<HTMLInputElement>(null);
  const [dragging, setDrag]  = useState(false);

  const previewSrc  = value instanceof File ? URL.createObjectURL(value) : (value ?? "");
  const hasPreview  = !!previewSrc;
  const displayName = value instanceof File ? value.name : null;

  const handleFile = (f: File) => onChange(f);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };
  const clear = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Field id={id} label={label} error={error}>
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={`Upload ${label}`}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl",
            "border-2 border-dashed py-7 text-center transition-all duration-150",
            dragging ? "border-indigo-400 bg-indigo-50" : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
          )}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: "rgba(99,102,241,0.08)" }}
          >
            <Upload className="h-5 w-5" style={{ color: "#6366f1" }} aria-hidden="true" />
          </div>
          {displayName ? (
            <p className="max-w-full truncate px-4 text-[12px] font-medium text-gray-700">
              {displayName}
            </p>
          ) : (
            <>
              <p className="text-[13px] font-medium text-gray-700">
                Drop {type === "image" ? "an image" : "a video"} here
              </p>
              <p className="text-[11px] text-gray-400">
                {type === "image" ? "PNG, JPG, WEBP — max 500 KB" : "MP4, WEBM — max 50 MB"}
              </p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={type === "image" ? "image/*" : "video/*"}
          className="hidden"
          aria-label={`File input for ${label}`}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </Field>

      {/* URL fallback */}
      <div className="relative">
        <LinkIcon
          className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="url"
          placeholder="Or paste a URL…"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(input(!!error), "pl-9")}
          aria-label={`${label} URL`}
        />
      </div>

      {/* Live preview */}
      {hasPreview && (
        <div className="relative overflow-hidden rounded-2xl border border-gray-200">
          {type === "image" ? (
            <Image
              src={previewSrc}
              alt={`${label} preview`}
              width={640}
              height={360}
              className="aspect-video w-full object-cover"
              unoptimized={value instanceof File}
            />
          ) : (
            <video
              src={previewSrc}
              preload="metadata"
              className="aspect-video w-full bg-gray-900"
            />
          )}
          <button
            type="button"
            onClick={clear}
            aria-label="Remove media"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Upload progress ──────────────────────────────────────────────────────────

function UploadProgress({ pct }: { pct: number }) {
  return (
    <div className="space-y-1.5" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-[11px] text-gray-500">
        <span>Uploading…</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
        />
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CourseModalProps {
  programId: string;
  course?:   Course | null;
  open:      boolean;
  onClose:   () => void;
  onSaved:   () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function CreateCourseModal({
  programId, course, open, onClose, onSaved,
}: CourseModalProps) {
  const uid    = useId();
  const isEdit = !!course;

  const [tab,       setTab]       = useState<Tab>("details");
  const [uploadPct, setUploadPct] = useState(0);
  const [serverErr, setServerErr] = useState("");
  const [savedOk,   setSavedOk]   = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const saving = createCourse.isPending || updateCourse.isPending;

  const {
    register, control, handleSubmit, reset, watch, setValue,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    resolver:      zodResolver(courseFormSchema),
    defaultValues: defaultCourseFormValues,
  });

  const { fields: plans, append: addPlan, remove: removePlan } = useFieldArray({
    control,
    name: "pricings",
  });

  // Auto-generate slug from title
  const titleValue = watch("title");
  useEffect(() => {
    if (!isEdit) setValue("slug", titleValue ? titleValue.toLowerCase().replace(/ /g, "-") : "", { shouldValidate: false });
  }, [titleValue, isEdit, setValue]);

  // Reset on open / course change
  useEffect(() => {
    if (!open) return;
    reset(course ? courseToFormValues(course) : defaultCourseFormValues);
    setTab("details");
    setServerErr("");
    setSavedOk(false);
    setUploadPct(0);
    const t = setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open, course, reset]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, saving, onClose]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const onSubmit = async (data: CourseFormData) => {
    setServerErr("");
    setUploadPct(0);
    const onUploadProgress = (pct: number) => setUploadPct(pct);

    try {
      if (isEdit && course) {
        await updateCourse.mutateAsync({ courseId: course.id, programId, data, onUploadProgress });
        toast.success("Course updated successfully");
      } else {
        await createCourse.mutateAsync({ programId, data, onUploadProgress });
        toast.success("Course created successfully");
      }
      setSavedOk(true);
      setTimeout(() => { onSaved(); onClose(); reset(); }, 700);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Failed to save course.";
      setServerErr(msg);
      toast.error(msg);
      setUploadPct(0);
    }
  };

  const handleClose = useCallback(() => {
    if (saving) return;
    reset();
    onClose();
  }, [saving, reset, onClose]);

  // Tab error indicators
  const tabErrors: Record<Tab, boolean> = {
    details: !!(errors.title || errors.description || errors.level || errors.status || errors.tags),
    media:   !!(errors.thumbnail || errors.videoPreview),
    pricing: !!(errors.pricings),
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        style={{ backdropFilter: "blur(3px)" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog — bottom sheet (mobile) / centered (≥sm) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className={cn(
          "fixed z-50 flex flex-col bg-white",
          "inset-x-0 bottom-0 max-h-[94vh] rounded-t-3xl",
          "sm:inset-0 sm:m-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:rounded-3xl",
          "animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 duration-200"
        )}
        style={{ boxShadow: "0 32px 80px -12px rgba(0,0,0,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pb-1 pt-3 sm:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-gray-200" />
        </div>

        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "rgba(99,102,241,0.08)" }}
            >
              <GraduationCap className="h-4 w-4 text-indigo-600" />
            </div>
            <h2
              id={`${uid}-title`}
              className="text-[15px] font-bold text-gray-900"
            >
              {isEdit ? "Edit course" : "New course"}
            </h2>
            {isEdit && (
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                style={{ background: "rgba(99,102,241,0.08)", color: "#6366f1" }}
              >
                Editing
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <div
          className="flex shrink-0 border-b border-gray-100 px-5"
          role="tablist"
          aria-label="Course form sections"
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "relative flex items-center gap-1.5 border-b-2 px-3 py-3 text-[12px] font-semibold transition-all duration-150",
                tab === id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
              {tabErrors[id] && (
                <span
                  className="absolute right-1 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500"
                  aria-label={`${label} section has validation errors`}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Scrollable form body ───────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">

            {/* ── DETAILS ─────────────────────────────────────────────── */}
            {tab === "details" && (
              <>
                <Field
                  id={`${uid}-title`}
                  label="Course title"
                  required
                  error={errors.title?.message}
                >
                  <input
                    id={`${uid}-title`}
                    type="text"
                    placeholder="e.g. React Hooks Deep Dive"
                    {...register("title")}
                    ref={(el) => {
                      register("title").ref(el);
                      (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    }}
                    className={input(!!errors.title)}
                  />
                </Field>

                {/* Slug — auto-generated, editable */}
                <Field
                  id={`${uid}-slug`}
                  label="Slug"
                  error={errors.slug?.message}
                  hint="Auto-generated from title. Edit if needed."
                >
                  <div className="flex items-center rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400">
                    <span className="shrink-0 pl-3 text-[11px] text-gray-400">/courses/</span>
                    <input
                      id={`${uid}-slug`}
                      type="text"
                      {...register("slug")}
                      className="flex-1 rounded-r-xl border-none bg-transparent py-2.5 pr-3 text-[13px] outline-none placeholder:text-gray-400"
                    />
                  </div>
                </Field>

                <Field
                  id={`${uid}-desc`}
                  label="Description"
                  error={errors.description?.message}
                >
                  <textarea
                    id={`${uid}-desc`}
                    rows={4}
                    placeholder="What will students learn in this course?"
                    {...register("description")}
                    className={cn(input(!!errors.description), "resize-none")}
                  />
                </Field>

                {/* Level + Status — 2-col on ≥sm */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Level */}
                  <Field label="Level" error={errors.level?.message}>
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-1.5">
                          {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((lvl) => {
                            const active = field.value === lvl;
                            const s = LEVEL_STYLES[lvl];
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => field.onChange(active ? undefined : lvl)}
                                className="flex items-center rounded-xl px-3 py-2 text-[12px] font-semibold transition-all duration-150"
                                style={
                                  active
                                    ? { background: s.bg, color: s.color, border: `1.5px solid ${s.border}` }
                                    : { background: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb" }
                                }
                                aria-pressed={active}
                              >
                                {lvl}
                                {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </Field>

                  {/* Status */}
                  <Field label="Publication status" error={errors.status?.message}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="flex flex-col gap-1.5">
                          {(["DRAFT", "PUBLISHED"] as const).map((s) => {
                            const active = field.value === s;
                            const style = active
                              ? s === "PUBLISHED"
                                ? { background: "rgba(34,197,94,0.08)",  color: "#15803d", border: "1.5px solid rgba(34,197,94,0.25)"  }
                                : { background: "rgba(245,158,11,0.08)", color: "#b45309", border: "1.5px solid rgba(245,158,11,0.25)" }
                              : { background: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb" };

                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => field.onChange(s)}
                                className="flex items-center rounded-xl px-3 py-2 text-[12px] font-semibold capitalize transition-all duration-150"
                                style={style}
                                aria-pressed={active}
                              >
                                {s}
                                {active && <CheckCircle2 className="ml-auto h-3.5 w-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </Field>
                </div>

                {/* Tags */}
                <Field label="Tags" error={errors.tags?.message}>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        value={field.value ?? []}
                        onChange={field.onChange}
                        error={errors.tags?.message}
                      />
                    )}
                  />
                </Field>
              </>
            )}

            {/* ── MEDIA ───────────────────────────────────────────────── */}
            {tab === "media" && (
              <>
                <Controller
                  name="thumbnail"
                  control={control}
                  render={({ field }) => (
                    <MediaField
                      id={`${uid}-thumbnail`}
                      label="Thumbnail"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.thumbnail?.message}
                      type="image"
                    />
                  )}
                />
                <Controller
                  name="videoPreview"
                  control={control}
                  render={({ field }) => (
                    <MediaField
                      id={`${uid}-video`}
                      label="Video preview"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.videoPreview?.message}
                      type="video"
                    />
                  )}
                />
              </>
            )}

            {/* ── PRICING ─────────────────────────────────────────────── */}
            {tab === "pricing" && (
              <div className="space-y-4">
                {plans.map((plan, i) => (
                  <div
                    key={plan.id}
                    className="space-y-3 rounded-2xl border p-4"
                    style={{ borderColor: "#e5e7eb", background: "#fafafa" }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider"
                        style={{ color: "#6366f1" }}
                      >
                        Plan {i + 1}
                      </span>
                      {plans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlan(i)}
                          aria-label={`Remove plan ${i + 1}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field
                        id={`${uid}-plan-${i}-name`}
                        label="Plan name"
                        error={errors.pricings?.[i]?.name?.message}
                      >
                        <input
                          id={`${uid}-plan-${i}-name`}
                          type="text"
                          placeholder="e.g. Standard"
                          {...register(`pricings.${i}.name`)}
                          className={input(!!errors.pricings?.[i]?.name)}
                        />
                      </Field>
                      <Field
                        id={`${uid}-plan-${i}-price`}
                        label="Price (₦)"
                        error={errors.pricings?.[i]?.price?.message}
                      >
                        <input
                          id={`${uid}-plan-${i}-price`}
                          type="number"
                          min={0}
                          step={100}
                          placeholder="0"
                          {...register(`pricings.${i}.price`)}
                          className={input(!!errors.pricings?.[i]?.price)}
                        />
                      </Field>
                    </div>

                    {/* Duration presets + manual input */}
                    <Field
                      id={`${uid}-plan-${i}-duration`}
                      label="Duration (days)"
                      error={errors.pricings?.[i]?.durationDays?.message}
                      hint="Pick a preset or enter a custom value"
                    >
                      <div className="mb-2 flex flex-wrap gap-2">
                        {DURATION_PRESETS.map(({ value, label }: { value: number; label: string }) => {
                          const currentVal = watch(`pricings.${i}.durationDays`);
                          const active = Number(currentVal) === value;
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setValue(`pricings.${i}.durationDays`, value, { shouldValidate: true })}
                              className="rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all duration-150"
                              style={
                                active
                                  ? { background: "rgba(99,102,241,0.08)", color: "#4f46e5", border: "1.5px solid rgba(99,102,241,0.25)" }
                                  : { background: "#f9fafb", color: "#6b7280", border: "1px solid #e5e7eb" }
                              }
                              aria-pressed={active}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        id={`${uid}-plan-${i}-duration`}
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Custom days…"
                        {...register(`pricings.${i}.durationDays`)}
                        className={input(!!errors.pricings?.[i]?.durationDays)}
                      />
                    </Field>

                    {/* Active toggle */}
                    <div className="flex items-center gap-3">
                      <Controller
                        name={`pricings.${i}.isActive`}
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={field.value}
                            onClick={() => field.onChange(!field.value)}
                            className="relative h-5 w-9 rounded-full transition-colors duration-200"
                            style={{ background: field.value ? "#6366f1" : "#e5e7eb" }}
                          >
                            <span
                              className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                              style={{ transform: field.value ? "translateX(16px)" : "none" }}
                            />
                          </button>
                        )}
                      />
                      <span className="text-[12px] text-gray-500">
                        {watch(`pricings.${i}.isActive`) ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addPlan({ name: "", price: 0, currency: "NGN", durationDays: 365, isActive: true })}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-semibold transition-all duration-150"
                  style={{
                    border:     "1.5px dashed rgba(99,102,241,0.3)",
                    background: "rgba(99,102,241,0.03)",
                    color:      "#6366f1",
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Add pricing plan
                </button>
              </div>
            )}
          </div>

          {/* ── Footer ──────────────────────────────────────────────────── */}
          <div
            className="flex shrink-0 flex-col gap-3 border-t border-gray-100 px-5 py-4"
            style={{ background: "#fafafa" }}
          >
            {/* Upload progress */}
            {saving && uploadPct > 0 && uploadPct < 100 && (
              <UploadProgress pct={uploadPct} />
            )}

            {/* Server error */}
            {serverErr && (
              <p className="flex items-center gap-1.5 text-[12px] text-red-600" role="alert">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {serverErr}
              </p>
            )}

            {/* Success */}
            {savedOk && (
              <p className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {isEdit ? "Course updated!" : "Course created!"}
              </p>
            )}

            {/* Mobile: tab navigation shortcut */}
            {tab !== "pricing" && (
              <button
                type="button"
                onClick={() => setTab(tab === "details" ? "media" : "pricing")}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-2.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-100 sm:hidden"
              >
                Next: {tab === "details" ? "Media" : "Pricing"}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-xl px-4 py-2.5 text-[12px] font-semibold text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || savedOk || (!isDirty && isEdit)}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-bold text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg,#6366f1,#4f46e5)",
                  boxShadow:  "0 4px 14px -4px rgba(99,102,241,0.4)",
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {uploadPct > 0 ? `${uploadPct}%` : "Saving…"}
                  </>
                ) : savedOk ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Saved!
                  </>
                ) : (
                  isEdit ? "Save changes" : "Create course"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};
