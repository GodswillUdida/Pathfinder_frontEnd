"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useId,
  useMemo,
} from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  Resolver,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { toast } from "sonner";
import {
  X,
  Plus,
  Trash2,
  Upload,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateCourse, useUpdateCourse } from "@/hooks/useCourses";
import type { Course } from "@/types/domain";
import {
  CourseFormData,
  courseFormSchema,
  courseToFormValues,
  defaultCourseFormValues,
  DURATION_PRESETS,
} from "../courses/course-form";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "details" | "media" | "pricing";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "details", label: "Details", icon: GraduationCap },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "pricing", label: "Pricing", icon: DollarSign },
];

const LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "PROFESSIONAL"] as const;
const STATUSES = ["DRAFT", "PUBLISHED"] as const;

// ─── Shared field ─────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  error,
  required = false,
  hint,
  children,
}: {
  id?: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-[12px] font-semibold text-foreground"
      >
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-destructive" role="alert">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (err?: boolean) =>
  cn(
    "w-full rounded-lg border bg-background px-3 py-2.5 text-[13px] outline-none transition-colors",
    "placeholder:text-muted-foreground/60",
    err
      ? "border-destructive/60 focus:border-destructive focus:ring-2 focus:ring-destructive/20"
      : "border-border focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
  );

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  error?: string;
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
      <div className="flex min-h-[28px] flex-wrap gap-1.5">
        {value.length === 0 && (
          <span className="text-[11px] text-muted-foreground">No tags yet — up to 10</span>
        )}
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="rounded-full p-0.5 hover:bg-blue-100 dark:hover:bg-blue-500/20"
            >
              <X className="h-2.5 w-2.5" />
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
            }}
            placeholder="Type a tag, press Enter…"
            maxLength={30}
            className={cn(inputClass(!!error), "flex-1 py-2")}
          />
          <button
            type="button"
            onClick={commit}
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[12px] font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-40 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      )}
      <p className="text-[10px] text-muted-foreground">{value.length}/10</p>
    </div>
  );
}

// ─── Media field ──────────────────────────────────────────────────────────────

function MediaField({
  id,
  label,
  value,
  onChange,
  error,
  type,
}: {
  id: string;
  label: string;
  value?: File | string;
  onChange: (v: File | string) => void;
  error?: string;
  type: "image" | "video";
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDrag] = useState(false);

  const previewSrc = useMemo(() => {
    if (value instanceof File) return URL.createObjectURL(value);
    return value ?? "";
  }, [value]);

  useEffect(() => {
    return () => {
      if (value instanceof File && previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [value, previewSrc]);

  const hasPreview = !!previewSrc;
  const displayName = value instanceof File ? value.name : null;

  const clear = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <Field id={id} label={label} error={error}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) onChange(f);
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 text-center transition-colors",
            dragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-500/10"
              : "border-border hover:border-blue-400 hover:bg-muted/40"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
            <Upload className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
          </div>
          {displayName ? (
            <p className="max-w-full truncate px-4 text-[12px] font-medium">{displayName}</p>
          ) : (
            <>
              <p className="text-[13px] font-medium text-foreground">
                Drop {type === "image" ? "an image" : "a video"} here
              </p>
              <p className="text-[11px] text-muted-foreground">
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
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onChange(f);
          }}
        />
      </Field>

      <div className="relative">
        <LinkIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="url"
          placeholder="Or paste a URL…"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass(!!error), "pl-9")}
        />
      </div>

      {hasPreview && (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {type === "image" ? (
            <Image
              src={previewSrc}
              alt=""
              width={640}
              height={360}
              className="aspect-video w-full object-cover"
              unoptimized={value instanceof File}
            />
          ) : (
            <video src={previewSrc} preload="metadata" className="aspect-video w-full bg-black" controls />
          )}
          <button
            type="button"
            onClick={clear}
            aria-label="Remove media"
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface CourseModalProps {
  programId: string;
  course?: Course | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function CreateCourseModal({
  programId,
  course,
  open,
  onClose,
  onSaved,
}: CourseModalProps) {
  const uid = useId();
  const isEdit = !!course;

  const [tab, setTab] = useState<Tab>("details");
  const [uploadPct, setUploadPct] = useState(0);
  const [serverErr, setServerErr] = useState("");
  const [savedOk, setSavedOk] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const createCourse = useCreateCourse();
  const updateCourse = useUpdateCourse();
  const saving = createCourse.isPending || updateCourse.isPending;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema) as unknown as Resolver<CourseFormData>,
    defaultValues: defaultCourseFormValues,
    mode: "onChange",
  });

  const { fields: plans, append: addPlan, remove: removePlan } = useFieldArray({
    control,
    name: "pricings",
  });

  const titleValue = useWatch({ control, name: "title" }) as string | undefined;

  // Auto slug (create only)
  useEffect(() => {
    if (!isEdit && titleValue !== undefined) {
      setValue(
        "slug",
        titleValue
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
        { shouldValidate: true }
      );
    }
  }, [titleValue, isEdit, setValue]);

  // Reset on open
  useEffect(() => {
    if (!open) return;
    reset(course ? courseToFormValues(course) : defaultCourseFormValues);
    const t = window.setTimeout(() => {
      setTab("details");
      setServerErr("");
      setSavedOk(false);
      setUploadPct(0);
      firstInputRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open, course, reset]);

  // Escape + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  const onSubmit = async (data: CourseFormData) => {
    setServerErr("");
    setUploadPct(0);
    const onUploadProgress = (pct: number) => setUploadPct(pct);
    const courseInput = {
      ...data,
      pricings: data.pricings.map((pricing) => ({
        id: pricing.id,
        name: pricing.name ?? "",
        price: pricing.price,
        currency: pricing.currency,
        accessDurationDays: pricing.accessDurationDays,
        isFree: pricing.isFree,
        isActive: pricing.isActive,
      })),
    };

    try {
      if (isEdit && course) {
        await updateCourse.mutateAsync({
          courseId: course.id,
          programId,
          data: courseInput,
          onUploadProgress,
        });
        toast.success("Course updated");
      } else {
        await createCourse.mutateAsync({ programId, data: courseInput, onUploadProgress });
        toast.success("Course created");
      }
      setSavedOk(true);
      setTimeout(() => {
        onSaved();
        onClose();
        reset();
      }, 500);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "Failed to save course.";
      setServerErr(msg);
      toast.error(msg);
      setUploadPct(0);
    }
  };

  const onInvalid = (errs: typeof errors) => {
    if (errs.title || errs.slug || errs.code || errs.description || errs.level || errs.status || errs.tags) {
      setTab("details");
    } else if (errs.thumbnail || errs.videoPreview) {
      setTab("media");
    } else if (errs.pricings) {
      setTab("pricing");
    }
    toast.error("Please fix the highlighted fields");
  };

  const handleClose = useCallback(() => {
    if (saving) return;
    reset();
    onClose();
  }, [saving, reset, onClose]);

  const tabErrors: Record<Tab, boolean> = {
    details: !!(
      errors.title ||
      errors.description ||
      errors.level ||
      errors.status ||
      errors.tags ||
      errors.slug ||
      errors.code
    ),
    media: !!(errors.thumbnail || errors.videoPreview),
    pricing: !!errors.pricings,
  };

  const tabIndex = TABS.findIndex((t) => t.id === tab);

  const { ref: titleRegisterRef, ...titleRegisterRest } = register("title");

  // Create is always allowed (no isDirty block). Edit still requires changes.
  const canSubmit = !saving && !savedOk && (isEdit ? isDirty : true);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px]"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        className={cn(
          "fixed z-50 flex flex-col bg-background shadow-xl",
          "inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl",
          "sm:inset-0 sm:m-auto sm:max-h-[86vh] sm:w-full sm:max-w-xl sm:rounded-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
          <div className="h-1 w-9 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <h2 id={`${uid}-title`} className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                {isEdit ? "Edit course" : "New course"}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {isEdit ? "Update details, media & pricing" : "Add to this program"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex shrink-0 gap-0.5 border-b border-border px-3" role="tablist">
          {TABS.map(({ id, label, icon: Icon }, i) => {
            const active = tab === id;
            const done = i < tabIndex;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className={cn(
                  "relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium transition-colors",
                  active ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                    active
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : done
                        ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </span>
                <span className="hidden sm:inline">{label}</span>
                {tabErrors[id] && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-destructive" />
                )}
                {active && (
                  <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                )}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">
            {/* DETAILS */}
            {tab === "details" && (
              <div className="space-y-5">
                <Field id={`${uid}-title`} label="Course title" required error={errors.title?.message}>
                  <input
                    id={`${uid}-title`}
                    type="text"
                    placeholder="e.g. Financial Accounting Fundamentals"
                    {...titleRegisterRest}
                    ref={(el) => {
                      titleRegisterRef(el);
                      firstInputRef.current = el;
                    }}
                    className={inputClass(!!errors.title)}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id={`${uid}-code`} label="Code" required error={errors.code?.message} hint="Short unique code">
                    <input
                      id={`${uid}-code`}
                      type="text"
                      placeholder="e.g. ACC-101"
                      {...register("code")}
                      className={inputClass(!!errors.code)}
                    />
                  </Field>

                  <Field id={`${uid}-slug`} label="Slug" error={errors.slug?.message} hint="Used in the public URL">
                    <div
                      className={cn(
                        "flex items-center rounded-lg border bg-background focus-within:ring-2 focus-within:ring-blue-500/20",
                        errors.slug ? "border-destructive/60" : "border-border focus-within:border-blue-500"
                      )}
                    >
                      <span className="shrink-0 pl-3 text-[11px] text-muted-foreground">/courses/</span>
                      <input
                        id={`${uid}-slug`}
                        type="text"
                        {...register("slug")}
                        className="flex-1 border-0 bg-transparent py-2.5 pr-3 text-[13px] outline-none"
                      />
                    </div>
                  </Field>
                </div>

                <Field id={`${uid}-desc`} label="Description" error={errors.description?.message}>
                  <textarea
                    id={`${uid}-desc`}
                    rows={3}
                    placeholder="What will learners achieve in this course?"
                    {...register("description")}
                    className={cn(inputClass(!!errors.description), "resize-none")}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Level" error={errors.level?.message}>
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <div className="grid grid-cols-2 gap-1.5">
                          {LEVELS.map((lvl) => {
                            const active = field.value === lvl;
                            return (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => field.onChange(lvl)}
                                className={cn(
                                  "rounded-lg border px-2.5 py-2 text-[11px] font-semibold transition-colors",
                                  active
                                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-300"
                                    : "border-border text-muted-foreground hover:border-blue-300 hover:text-foreground"
                                )}
                                aria-pressed={active}
                              >
                                {lvl.charAt(0) + lvl.slice(1).toLowerCase()}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </Field>

                  <Field label="Status" error={errors.status?.message}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <div className="grid gap-1.5">
                          {STATUSES.map((s) => {
                            const active = field.value === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => field.onChange(s)}
                                className={cn(
                                  "flex items-center justify-between rounded-lg border px-3 py-2.5 text-[12px] font-semibold transition-colors",
                                  active
                                    ? s === "PUBLISHED"
                                      ? "border-emerald-500/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-400"
                                      : "border-amber-500/60 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-400"
                                    : "border-border text-muted-foreground hover:text-foreground"
                                )}
                                aria-pressed={active}
                              >
                                {s === "PUBLISHED" ? "Published" : "Draft"}
                                {active && <CheckCircle2 className="h-3.5 w-3.5" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    />
                  </Field>
                </div>

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
              </div>
            )}

            {/* MEDIA */}
            {tab === "media" && (
              <div className="space-y-6">
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
                      label="Preview video"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.videoPreview?.message}
                      type="video"
                    />
                  )}
                />
              </div>
            )}

            {/* PRICING – matches Postman shape exactly */}
            {tab === "pricing" && (
              <div className="space-y-3">
                {plans.map((plan, i) => (
                  <div key={plan.id} className="space-y-3.5 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Plan {i + 1}
                      </span>
                      {plans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlan(i)}
                          aria-label={`Remove plan ${i + 1}`}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field id={`${uid}-plan-${i}-name`} label="Plan name" error={errors.pricings?.[i]?.name?.message}>
                        <input
                          id={`${uid}-plan-${i}-name`}
                          type="text"
                          placeholder="e.g. Monthly"
                          {...register(`pricings.${i}.name`)}
                          className={inputClass(!!errors.pricings?.[i]?.name)}
                        />
                      </Field>
                      <Field id={`${uid}-plan-${i}-price`} label="Price (₦)" error={errors.pricings?.[i]?.price?.message}>
                        <input
                          id={`${uid}-plan-${i}-price`}
                          type="number"
                          min={0}
                          step={100}
                          placeholder="45000"
                          {...register(`pricings.${i}.price`, { valueAsNumber: true })}
                          className={inputClass(!!errors.pricings?.[i]?.price)}
                        />
                      </Field>
                    </div>

                    <Field
                      id={`${uid}-plan-${i}-duration`}
                      label="Access duration (days)"
                      error={errors.pricings?.[i]?.accessDurationDays?.message}
                      hint="30 = monthly, 365 = yearly, etc."
                    >
                      <Controller
                        name={`pricings.${i}.accessDurationDays`}
                        control={control}
                        render={({ field }) => (
                          <>
                            <div className="mb-2 flex flex-wrap gap-1.5">
                              {DURATION_PRESETS.map(({ value, label }) => (
                                <button
                                  key={String(value)}
                                  type="button"
                                  onClick={() =>
                                    setValue(`pricings.${i}.accessDurationDays`, value, {
                                      shouldValidate: true,
                                    })
                                  }
                                  className={cn(
                                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                                    field.value === value
                                      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300 dark:bg-blue-500/20 dark:text-blue-300"
                                      : "bg-muted text-muted-foreground hover:text-foreground"
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <input
                              id={`${uid}-plan-${i}-duration`}
                              type="number"
                              min={1}
                              placeholder="Custom days…"
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                              }
                              className={inputClass(!!errors.pricings?.[i]?.accessDurationDays)}
                            />
                          </>
                        )}
                      />
                    </Field>

                    <Controller
                      name={`pricings.${i}.isActive`}
                      control={control}
                      render={({ field }) => (
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!!field.value}
                            onClick={() => field.onChange(!field.value)}
                            className={cn(
                              "relative h-5 w-9 rounded-full transition-colors",
                              field.value ? "bg-blue-600 dark:bg-blue-500" : "bg-muted-foreground/30"
                            )}
                          >
                            <span
                              className={cn(
                                "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                                field.value ? "left-[18px]" : "left-0.5"
                              )}
                            />
                          </button>
                          <span className="text-[12px] text-muted-foreground">
                            {field.value ? "Active" : "Inactive"}
                          </span>
                        </div>
                      )}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    addPlan({
                      name: "Monthly",
                      price: 0,
                      currency: "NGN",
                      accessDurationDays: 30,
                      isActive: true,
                      isFree: false,
                      sortOrder: plans.length + 1,
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 py-3 text-[13px] font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-300"
                >
                  <Plus className="h-4 w-4" />
                  Add pricing plan
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 space-y-3 border-t border-border bg-muted/20 px-5 py-3.5">
            {saving && uploadPct > 0 && uploadPct < 100 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Uploading media…</span>
                  <span>{uploadPct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500"
                    style={{ width: `${uploadPct}%` }}
                  />
                </div>
              </div>
            )}

            {serverErr && (
              <p className="flex items-center gap-1.5 text-[12px] text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {serverErr}
              </p>
            )}

            {savedOk && (
              <p className="flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                {isEdit ? "Course updated" : "Course created"}
              </p>
            )}

            <div className="flex items-center gap-2">
              <div className="flex flex-1 gap-2 sm:hidden">
                {tabIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab(TABS[tabIndex - 1].id)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2.5 text-[12px] font-medium text-muted-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
                {tabIndex < TABS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setTab(TABS[tabIndex + 1].id)}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-border px-3 py-2.5 text-[12px] font-medium"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="hidden flex-1 sm:block" />

              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="rounded-lg px-4 py-2.5 text-[12px] font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {uploadPct > 0 ? `${uploadPct}%` : "Saving…"}
                  </>
                ) : savedOk ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Saved
                  </>
                ) : isEdit ? (
                  "Save changes"
                ) : (
                  "Create course"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}