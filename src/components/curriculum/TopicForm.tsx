  "use client";

  import { useId, useRef, useState, useCallback } from "react";
  import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
  import { zodResolver } from "@hookform/resolvers/zod";
  import {
    Loader2,
    Plus,
    X,
    Link2,
    FileText,
    FileType2,
    UploadCloud,
    Film,
    CheckCircle2,
    AlertCircle,
  } from "lucide-react";
  import { z } from "zod";

  /* ------------------------------------------------------------------ */
  /* Types & local schema                                                */
  /* Reconcile `resourceValidator` on the backend to this shape, or      */
  /* adjust the discriminant below to match.                             */
  /* ------------------------------------------------------------------ */

  const urlResourceSchema = z.object({
    type: z.literal("URL"),
    label: z.string().min(1, "Label required").max(120),
    url: z.string().trim().url("Enter a valid URL"),
  });

  const fileResourceSchema = z.object({
    type: z.enum(["PDF", "DOCX"]),
    label: z.string().min(1, "Label required").max(120),
    file: z
      .instanceof(File, { message: "File required" })
      .refine((f) => f.size <= 20 * 1024 * 1024, "Max 20MB"),
  });

  const resourceItemSchema = z.discriminatedUnion("type", [
    urlResourceSchema,
    fileResourceSchema,
  ]);

  const topicFormSchema = z.object({
    title: z.string().min(2, "Title too short").max(200).trim(),
    resources: z.array(resourceItemSchema),
  });

  export type TopicFormValues = z.infer<typeof topicFormSchema>;
  export type ResourceItem = z.infer<typeof resourceItemSchema>;

  const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime";
  const VIDEO_MAX_MB = 2048;
  const TITLE_MAX = 200;

  const RESOURCE_TYPE_META = {
    URL: { label: "URL", icon: Link2, accept: undefined },
    PDF: { label: "PDF", icon: FileText, accept: ".pdf,application/pdf" },
    DOCX: {
      label: "DOCX",
      icon: FileType2,
      accept:
        ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  } as const;

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  }

  /**
   * Builds the multipart payload the backend `createTopic` controller expects.
   * Move into lib/curriculum if reused by the edit-topic flow.
   */
  export function buildTopicFormData(
    values: TopicFormValues,
    video: File,
    idempotencyKey: string,
  ) {
    const fd = new FormData();
    fd.append("title", values.title);
    fd.append("video", video);
    fd.append("idempotencyKey", idempotencyKey);

    const serializable = values.resources.map((r) =>
      r.type === "URL" ? r : { type: r.type, label: r.label },
    );
    fd.append("resources", JSON.stringify(serializable));

    values.resources.forEach((r) => {
      if (r.type !== "URL") fd.append("resourceFiles", r.file);
    });

    return fd;
  }

  /* ------------------------------------------------------------------ */
  /* Props                                                               */
  /* ------------------------------------------------------------------ */

  interface Props {
    defaultValues?: Partial<TopicFormValues>;
    onSubmit: (values: TopicFormValues, video: File, idempotencyKey: string) => Promise<void> | void;
    onCancel: () => void;
    isSubmitting?: boolean;
    /** 0-100, fed from your mutation's XHR/axios onUploadProgress */
    uploadProgress?: number;
    submitLabel?: string;
  }

  export function TopicForm({
    defaultValues,
    onSubmit,
    onCancel,
    isSubmitting,
    uploadProgress,
    submitLabel = "Create topic",
  }: Props) {
    const titleId = useId();
    const resourcesLabelId = useId();
    const idempotencyKey = useRef(crypto.randomUUID()).current;

    const {
      register,
      control,
      handleSubmit,
      watch,
      setValue,
      formState: { errors, isValid, isDirty },
    } = useForm<TopicFormValues>({
      resolver: zodResolver(topicFormSchema),
      mode: "onChange",
      defaultValues: { title: "", resources: [], ...defaultValues },
    });

    const { fields, append, remove, update } = useFieldArray({
      control,
      name: "resources",
    });

    const titleValue = watch("title") ?? "";

    /* ---- video state (kept outside RHF; it's a raw file, not a schema field) ---- */
    const [video, setVideo] = useState<File | null>(null);
    const [videoError, setVideoError] = useState<string | null>(null);
    const [isDraggingVideo, setIsDraggingVideo] = useState(false);
    const [videoDuration, setVideoDuration] = useState<number | null>(null);

    const acceptVideoFile = useCallback((file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("video/")) {
        setVideoError("Please select a video file.");
        return;
      }
      if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
        setVideoError(`Max video size is ${VIDEO_MAX_MB}MB.`);
        return;
      }
      setVideoError(null);
      setVideo(file);
    }, []);

    const submitHandler = handleSubmit((values) => {
      if (!video) {
        setVideoError("A video is required.");
        return;
      }
      return onSubmit(values, video, idempotencyKey);
    });

    const isBusy = !!isSubmitting;

    return (
      <form onSubmit={submitHandler} className="space-y-6" noValidate>
        {/* Video */}
        <div className="space-y-1.5">
          <span className="block text-[11.5px] font-semibold text-gray-700 dark:text-white/70">
            Video <span className="text-red-500">*</span>
          </span>

          {!video ? (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingVideo(true);
              }}
              onDragLeave={() => setIsDraggingVideo(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingVideo(false);
                acceptVideoFile(e.dataTransfer.files?.[0]);
              }}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                isDraggingVideo
                  ? "border-blue-400 bg-amber-50 dark:bg-amber-500/10"
                  : "border-black/10 hover:border-blue-300 dark:border-white/10 dark:hover:border-blue-500/40"
              }`}
            >
              <UploadCloud className="size-6 text-gray-400 dark:text-white/30" aria-hidden="true" />
              <span className="text-[12px] font-medium text-gray-700 dark:text-white/70">
                Drop a video, or tap to browse
              </span>
              <span className="text-[10.5px] text-gray-400 dark:text-white/30">
                MP4, WebM, MOV up to {VIDEO_MAX_MB}MB
              </span>
              <input
                type="file"
                accept={VIDEO_ACCEPT}
                className="sr-only"
                onChange={(e) => acceptVideoFile(e.target.files?.[0])}
              />
            </label>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-blue-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Film className="size-5" />
              </div>
              <video
                src={URL.createObjectURL(video)}
                className="hidden"
                onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-medium text-gray-900 dark:text-white">
                  {video.name}
                </p>
                <p className="text-[10.5px] text-gray-400 dark:text-white/30">
                  {formatBytes(video.size)}
                  {videoDuration ? ` · ${Math.round(videoDuration)}s` : ""}
                </p>
              </div>
              {isBusy && typeof uploadProgress === "number" ? (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-[width] duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[10.5px] tabular-nums text-gray-400 dark:text-white/30">
                    {uploadProgress}%
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVideo(null);
                    setVideoDuration(null);
                  }}
                  disabled={isBusy}
                  aria-label="Remove video"
                  className="shrink-0 cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white/35 dark:hover:bg-red-500/10"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          )}
          {videoError && (
            <p className="flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400" role="alert">
              <AlertCircle className="size-3" aria-hidden="true" />
              {videoError}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor={titleId} className="text-[11.5px] font-semibold text-gray-700 dark:text-white/70">
              Title <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[10.5px] tabular-nums ${
                titleValue.length > TITLE_MAX - 20
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 dark:text-white/30"
              }`}
            >
              {titleValue.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            id={titleId}
            autoFocus
            maxLength={TITLE_MAX}
            {...register("title")}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            placeholder="e.g. Installing dependencies"
            className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[13px] text-gray-900 outline-hidden transition-colors placeholder:text-gray-400 focus-visible:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-400/60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/25"
          />
          {errors.title && (
            <p id={`${titleId}-error`} role="alert" className="text-[11px] text-red-600 dark:text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Resources */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span id={resourcesLabelId} className="text-[11.5px] font-semibold text-gray-700 dark:text-white/70">
              Resources
            </span>
            <div className="flex gap-1">
              {(Object.keys(RESOURCE_TYPE_META) as (keyof typeof RESOURCE_TYPE_META)[]).map((type) => {
                const meta = RESOURCE_TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      append(
                        type === "URL"
                          ? { type: "URL", label: "", url: "" }
                          : ({ type, label: "" } as ResourceItem),
                      )
                    }
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-blue-700 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    <Icon className="size-3" aria-hidden="true" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {fields.length === 0 ? (
            <div
              role="note"
              aria-labelledby={resourcesLabelId}
              className="rounded-xl border border-dashed border-black/10 px-3 py-4 text-center text-[11px] text-gray-400 dark:border-white/10 dark:text-white/30"
            >
              No resources attached. Add a link, PDF, or DOCX.
            </div>
          ) : (
            <div className="space-y-2" role="list" aria-labelledby={resourcesLabelId}>
              {fields.map((field, index) => {
                const item = field as unknown as ResourceItem;
                const meta = RESOURCE_TYPE_META[item.type];
                const Icon = meta.icon;
                const rowErrors = errors.resources?.[index] as
                  | { label?: { message?: string }; url?: { message?: string }; file?: { message?: string } }
                  | undefined;

                return (
                  <div
                    key={field.id}
                    role="listitem"
                    className="flex items-start gap-2 rounded-xl border border-black/10 bg-white p-2.5 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <Icon className="size-3.5" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <input
                        {...register(`resources.${index}.label` as const)}
                        placeholder={`${meta.label} label`}
                        aria-label={`Resource ${index + 1} label`}
                        className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[12.5px] text-gray-900 outline-hidden transition-colors placeholder:text-gray-400 focus-visible:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-400/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/25"
                      />

                      {item.type === "URL" ? (
                        <input
                          {...register(`resources.${index}.url` as const)}
                          placeholder="https://example.com/slides.pdf"
                          aria-label={`Resource ${index + 1} URL`}
                          className="w-full rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-[12.5px] text-gray-900 outline-hidden transition-colors placeholder:text-gray-400 focus-visible:border-blue-400/60 focus-visible:ring-2 focus-visible:ring-blue-400/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/25"
                        />
                      ) : (
                        <Controller
                          control={control}
                          name={`resources.${index}.file` as const}
                          render={({ field: fileField }) => {
                            const currentFile = fileField.value as File | undefined;
                            return currentFile ? (
                              <div className="flex items-center justify-between rounded-lg border border-black/10 bg-black/[0.02] px-2.5 py-1.5 text-[11.5px] dark:border-white/10 dark:bg-white/[0.02]">
                                <span className="truncate text-gray-600 dark:text-white/60">
                                  {currentFile.name} · {formatBytes(currentFile.size)}
                                </span>
                                <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                              </div>
                            ) : (
                              <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/15 px-2.5 py-1.5 text-[11.5px] text-gray-500 transition-colors hover:border-amber-300 hover:text-amber-700 dark:border-white/15 dark:text-white/40 dark:hover:border-amber-500/40 dark:hover:text-amber-400">
                                <UploadCloud className="size-3.5" aria-hidden="true" />
                                Choose {meta.label} file
                                <input
                                  type="file"
                                  accept={meta.accept}
                                  className="sr-only"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) fileField.onChange(f);
                                  }}
                                />
                              </label>
                            );
                          }}
                        />
                      )}

                      {(rowErrors?.label?.message || rowErrors?.url?.message || rowErrors?.file?.message) && (
                        <p className="text-[11px] text-red-600 dark:text-red-400" role="alert">
                          {rowErrors?.label?.message || rowErrors?.url?.message || rowErrors?.file?.message}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Remove resource ${index + 1}`}
                      className="mt-1 shrink-0 cursor-pointer rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-white/35 dark:hover:bg-red-500/10"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="cursor-pointer rounded-xl border border-black/10 px-4 py-2.5 text-[12px] font-medium text-gray-700 transition-colors hover:bg-black/[0.03] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/[0.05]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid || !isDirty || !video || isBusy}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-500 px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-blue-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400/60 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-1"
          >
            {isBusy && <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />}
            {isBusy ? "Uploading…" : submitLabel}
          </button>
        </div>
      </form>
    );
  }