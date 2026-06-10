"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Play,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  courseFormSchema,
  type CourseFormData,
  type Course,
  defaultCourseFormValues,
} from "./Course.schema";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "details" | "media" | "pricing";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "details", label: "Details", icon: GraduationCap },
  { id: "media", label: "Media", icon: Upload },
  { id: "pricing", label: "Pricing", icon: Plus },
];

const DURATION_PRESETS = [30, 90, 180, 365, 730];

// ─── Reusable Field Component ───────────────────────────────────────────────

function Field({
  label,
  error,
  required = false,
  children,
  hint,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

// ─── Media Upload Field with Preview ────────────────────────────────────────

function MediaUploadField({
  label,
  value,
  onChange,
  error,
  type,
}: {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  type: "image" | "video";
}) {
  const [preview, setPreview] = useState<string>(value ?? "");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange(url); // You can handle actual upload later
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <Field label={label} error={error} required={false}>
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
            isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
          <p className="font-medium text-gray-700">Click or drag {type} here</p>
          {type === "image" ? <p className="text-xs text-gray-500 mt-1">Max 500KB • PNG, JPG</p>
            : <p className="text-xs text-gray-500 mt-1">Max 500MB • WEBM, MP4</p>}
        </div>
      </Field>

      <input
        type="file"
        ref={fileInputRef}
        accept={type === "image" ? "image/*" : "video/*"}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* URL Input */}
      <input
        type="url"
        placeholder="Or paste direct URL..."
        value={value ?? ""}
        onChange={(e) => {
          onChange(e.target.value);
          setPreview(e.target.value);
        }}
        className="w-full rounded-xl border px-4 py-3 text-sm"
      />

      {/* Preview */}
      {preview && (
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 mt-3">
          {type === "image" ? (
            <Image
              src={preview}
              alt="Preview"
              width={640}
              height={360}
              className="w-full object-cover"
            />
          ) : (
            <video src={preview} controls className="w-full aspect-video bg-black" />
          )}
          <button
            type="button"
            onClick={() => {
              setPreview("");
              onChange("");
            }}
            className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export function CourseFormModal({
  programId,
  course,
  open,
  onClose,
  onSaved,
}: {
  programId: string;
  course?: Course | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!course;
  const [tab, setTab] = useState<Tab>("details");
  const [saving, setSaving] = useState(false);
  const [serverErr, setServerErr] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(courseFormSchema),
    defaultValues: defaultCourseFormValues,
  });

  const { fields: pricingFields, append, remove } = useFieldArray({
    control,
    name: "pricings",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset(course ? {
        title: course.title,
        description: course.description ?? "",
        thumbnail: course.thumbnail ?? "",
        videoPreview: course.videoPreview ?? "",
        level: course.level ?? "BEGINNER",
        status: course.status ?? "DRAFT",
        tags: course.tags ?? [],
        pricings: course.pricings?.length
          ? course.pricings
          : defaultCourseFormValues.pricings,
      } : defaultCourseFormValues);
      setTab("details");
      setServerErr("");
    }
  }, [open, course, reset]);

  const onSubmit = async (data: CourseFormData) => {
    setSaving(true);
    setServerErr("");

    try {
      console.log("Submitting course:", data);
      // TODO: Implement real API call with FormData for files
      await new Promise((r) => setTimeout(r, 900));

      onSaved();
      onClose();
    } catch (err: any) {
      setServerErr(err.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Course" : "Create New Course"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex-1 py-4 text-sm font-medium border-b-2 transition-all",
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <t.icon className="inline w-4 h-4 mr-2" />
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-auto">
          <div className="p-6 space-y-8">
            {/* Details Tab */}
            {tab === "details" && (
              <>
                <Field label="Course Title" required error={errors.title?.message}>
                  <input
                    {...register("title")}
                    className="w-full border rounded-2xl px-4 py-3 text-sm"
                    placeholder="Advanced React & Next.js Mastery"
                  />
                </Field>

                <Field label="Description" error={errors.description?.message}>
                  <textarea
                    {...register("description")}
                    rows={5}
                    className="w-full border rounded-2xl px-4 py-3 text-sm resize-y"
                    placeholder="Describe what students will learn..."
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Level" error={errors.level?.message}>
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="w-full border rounded-2xl px-4 py-3">
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      )}
                    />
                  </Field>

                  <Field label="Status" error={errors.status?.message}>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <select {...field} className="w-full border rounded-2xl px-4 py-3">
                          <option value="DRAFT">Draft</option>
                          <option value="PUBLISHED">Published</option>
                        </select>
                      )}
                    />
                  </Field>
                </div>
              </>
            )}

            {/* Media Tab */}
            {tab === "media" && (
              <>
                <Controller
                  name="thumbnail"
                  control={control}
                  render={({ field }) => (
                    <MediaUploadField
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
                    <MediaUploadField
                      label="Video Preview"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.videoPreview?.message}
                      type="video"
                    />
                  )}
                />
              </>
            )}

            {/* Pricing Tab */}
            {tab === "pricing" && (
              <div className="space-y-5">
                {pricingFields.map((pf, index) => (
                  <div key={pf.id} className="border rounded-3xl p-6 bg-gray-50">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="font-semibold">Pricing Plan {index + 1}</h4>
                      {pricingFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Plan Name">
                        <input
                          {...register(`pricings.${index}.name`)}
                          className="w-full border rounded-2xl px-4 py-3"
                          placeholder="Monthly Access"
                        />
                      </Field>

                      <Field label="Price (₦)">
                        <input
                          type="number"
                          {...register(`pricings.${index}.price`, { valueAsNumber: true })}
                          className="w-full border rounded-2xl px-4 py-3"
                        />
                      </Field>

                      <Field label="Duration (days)">
                        <select
                          {...register(`pricings.${index}.durationDays`, { valueAsNumber: true })}
                          className="w-full border rounded-2xl px-4 py-3"
                        >
                          {DURATION_PRESETS.map((d) => (
                            <option key={d} value={d}>
                              {d} days
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    append({
                      name: "",
                      price: 0,
                      durationDays: 365,
                      isActive: true,
                    })
                  }
                  className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-3xl text-indigo-600 hover:bg-indigo-50 font-medium"
                >
                  + Add Another Pricing Plan
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-6 flex items-center justify-between">
            {serverErr && (
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {serverErr}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-3 text-gray-600 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 disabled:opacity-70 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEdit ? "Update Course" : "Create Course"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}