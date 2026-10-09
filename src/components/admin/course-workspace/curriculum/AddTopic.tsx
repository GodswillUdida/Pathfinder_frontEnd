"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateTopic } from "@/hooks/useCurriculum";
import { FieldHeader } from "../ui/FieldHeader";
import { Sheet, SheetBody, SheetFooter, SheetHeader } from "../ui/Sheet";
import { POSITION_BASE } from "../constants";
import type { CreateTopicPayload } from "../types";
import { PositionField } from "./PositionField";
import { ResourcesField } from "./ResourcesField";
import { VideoField } from "./VideoField";
import { mergeResources, validateVideo } from "./validation";

interface AddTopicProps {
  moduleId: string;
  /** Existing topics in display order; used for the position preview. */
  topics: { id: string; title: string }[];
  onCreated: () => void;
}

export function AddTopic({ moduleId, topics, onCreated }: AddTopicProps) {
  const uid = useId();
  const headingId = `${uid}-heading`;
  const titleId = `${uid}-title`;

  const createTopic = useCreateTopic(moduleId);
  const pending = createTopic.isPending;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [position, setPosition] = useState(topics.length + 1);
  const [video, setVideo] = useState<File | null>(null);
  const [resources, setResources] = useState<File[]>([]);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [resourceError, setResourceError] = useState<string | null>(null);

  const maxPosition = topics.length + 1;
  const safePosition = Math.min(Math.max(position, 1), maxPosition);
  const trimmedTitle = title.trim();
  const canSubmit = trimmedTitle.length > 0 && !pending;
  const dirty = trimmedTitle.length > 0 || video !== null || resources.length > 0;

  const reset = useCallback(() => {
    setTitle("");
    setVideo(null);
    setResources([]);
    setVideoError(null);
    setResourceError(null);
  }, []);

  const openSheet = () => {
    setPosition(topics.length + 1); // default: append to the end
    setOpen(true);
  };

  const finish = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  /** User-initiated close (X, Cancel, Escape, backdrop, swipe). */
  const requestClose = () => {
    if (pending) return;
    if (
      dirty &&
      !window.confirm("Discard this topic? The title and any files you added will be lost.")
    ) {
      return;
    }
    finish();
  };

  const pickVideo = (file: File | undefined) => {
    if (!file) return;
    const problem = validateVideo(file);
    setVideoError(problem);
    if (!problem) setVideo(file);
  };

  const addResources = (list: FileList | null) => {
    const { files, error } = mergeResources(resources, list);
    setResources(files);
    setResourceError(error);
  };

  const submit = async () => {
    if (!canSubmit) return;

    const payload: CreateTopicPayload = {
      title: trimmedTitle,
      position: safePosition - 1 + POSITION_BASE,
      ...(video ? { video } : {}),
      ...(resources.length ? { resources } : {}),
    };

    try {
      await createTopic.mutateAsync(
        payload as Parameters<typeof createTopic.mutateAsync>[0],
      );
      toast.success("Topic created.");
      finish();
      onCreated();
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to create topic.");
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openSheet}
        className="flex h-11 items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-semibold text-primary transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-10"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add topic
      </button>

      <Sheet
        open={open}
        onRequestClose={requestClose}
        labelledBy={headingId}
        dismissible={!pending}
        onSubmitShortcut={() => void submit()}
      >
        <SheetHeader
          eyebrow="Curriculum"
          title="New topic"
          titleId={headingId}
          onClose={requestClose}
          closeDisabled={pending}
        />

        <SheetBody>
          <div className="space-y-2">
            <FieldHeader index="01" label="Title" htmlFor={titleId} />
            <input
              id={titleId}
              data-autofocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
              placeholder="e.g. Recording accrued expenses"
              className="h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[16px] text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-60 sm:text-[13.5px]"
            />
          </div>

          <VideoField
            video={video}
            error={videoError}
            disabled={pending}
            onPick={pickVideo}
            onClear={() => setVideo(null)}
          />

          <ResourcesField
            files={resources}
            error={resourceError}
            disabled={pending}
            onAdd={addResources}
            onRemove={(i) => setResources((prev) => prev.filter((_, idx) => idx !== i))}
          />

          <PositionField
            value={safePosition}
            max={maxPosition}
            topics={topics}
            onChange={setPosition}
            disabled={pending}
          />
        </SheetBody>

        <SheetFooter>
          {!video && resources.length === 0 && (
            <p className="mb-3 text-[11.5px] text-muted-foreground">
              No content attached yet. You can add a video or resources later.
            </p>
          )}
          <div className="flex items-center gap-2.5">
            <span className="hidden text-[11px] text-muted-foreground/70 sm:block">
              Ctrl or ⌘ + Enter to create
            </span>
            <div className="ml-auto flex w-full items-center gap-2.5 sm:w-auto">
              <button
                type="button"
                onClick={requestClose}
                disabled={pending}
                className="h-11 flex-1 rounded-xl border border-border px-5 text-[13.5px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canSubmit}
                className="flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[13.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:flex-none"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    {video ? "Uploading…" : "Creating…"}
                  </>
                ) : (
                  "Create topic"
                )}
              </button>
            </div>
          </div>
        </SheetFooter>
      </Sheet>
    </>
  );
}
