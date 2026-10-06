"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ExternalLink,
  EyeOff,
  Globe,
  ImagePlus,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Course, Program } from "@/types/domain";
import {
  getProgramReadiness,
  type ReadinessCheck,
  type ReadinessCheckId,
} from "./program-readiness";

interface ProgramHeaderProps {
  program: Program & { image?: string | null; slug?: string | null };
  courses: Course[];
  isPublishPending?: boolean;
  isArchivePending?: boolean;
  onTogglePublish: () => void;
  onEdit: () => void;
  onAddCourse: () => void;
  onDelete: () => void;
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function ProgramHeader({
  program,
  courses,
  isPublishPending = false,
  isArchivePending = false,
  onTogglePublish,
  onEdit,
  onAddCourse,
  onDelete,
}: ProgramHeaderProps) {
  const reduceMotion = useReducedMotion();
  const checklistId = useId();
  const blockedId = useId();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const isPublished = program.status === "PUBLISHED";
  const isPending = isPublishPending || isArchivePending;
  const readiness = getProgramReadiness(program, courses);

  const cover =
    program.image && program.image !== failedSrc ? program.image : null;
  const publicPath = program.slug ? `/programs/${program.slug}` : null;

  const showChecklist = !isPublished || !readiness.isComplete;
  const draftReady = !isPublished && readiness.isComplete;
  const publishBlocked = !isPublished && !readiness.canPublish;
  const publishIsPrimary = !isPublished && readiness.canPublish;

  const doneCount = readiness.checks.filter((c) => c.done).length;
  const totalChecks = readiness.checks.length;

  const checkActions: Partial<Record<ReadinessCheckId, () => void>> = {
    courses: onAddCourse,
    cover: onEdit,
  };

  function handlePublish() {
    if (publishBlocked || isPending) return;
    onTogglePublish();
  }

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl">
      {/* Brand wash — restrained */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_0%_0%,color-mix(in_oklch,var(--brand-500)_8%,transparent),transparent_60%)]"
      />

      <div className="relative px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        {/* ── Mobile-first stack ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {/* Top row: cover + identity */}
          <div className="flex gap-4 sm:gap-5">
            {/* Cover */}
            <div
              className={cn(
                "relative aspect-4/3 w-22 shrink-0 overflow-hidden rounded-xl bg-secondary sm:aspect-16/10 sm:w-44 sm:rounded-2xl",
                cover
                  ? "ring-1 ring-border"
                  : "border-2 border-dashed border-primary/25 bg-accent",
              )}
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={`Cover for ${program.title}`}
                  fill
                  sizes="(min-width: 640px) 176px, 88px"
                  className="object-cover"
                  onError={() => setFailedSrc(cover)}
                />
              ) : (
                <button
                  type="button"
                  onClick={onEdit}
                  aria-label="Add a cover image"
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-1 text-accent-foreground transition-colors hover:bg-primary/10 active:bg-primary/15",
                    focusRing,
                  )}
                >
                  <ImagePlus className="size-5" aria-hidden="true" />
                  <span className="hidden text-[12px] font-semibold sm:block">
                    Add cover
                  </span>
                </button>
              )}
            </div>

            {/* Title + meta */}
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[1.35rem] font-bold leading-[1.2] tracking-tight text-foreground text-balance sm:text-[1.75rem] lg:text-[2rem]">
                {program.title}
              </h1>

              <dl className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                <div>
                  <dt className="sr-only">Status</dt>
                  <dd aria-live="polite">
                    <StatusIndicator
                      status={program.status}
                      pending={isPending}
                    />
                  </dd>
                </div>
                <div>
                  <dt className="sr-only">Courses</dt>
                  <dd className="rounded-full bg-secondary px-2.5 py-1 text-[12px] text-muted-foreground sm:px-3 sm:text-[12.5px]">
                    <span className="font-mono font-semibold tabular-nums text-foreground">
                      {courses.length}
                    </span>{" "}
                    {courses.length === 1 ? "course" : "courses"}
                  </dd>
                </div>
                {publicPath && (
                  <div className="hidden min-w-0 max-w-full sm:block">
                    <dt className="sr-only">Public address</dt>
                    <dd
                      title={publicPath}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-mono text-[12px] text-muted-foreground"
                    >
                      <Globe className="size-3 shrink-0" aria-hidden="true" />
                      <span className="truncate">{publicPath}</span>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Description */}
          <div className="min-w-0">
            {program.description ? (
              <p className="line-clamp-3 max-w-[68ch] text-[14px] leading-relaxed text-muted-foreground sm:text-[15px]">
                {program.description}
              </p>
            ) : (
              <button
                type="button"
                onClick={onEdit}
                className={cn(
                  "rounded-sm text-[14px] text-muted-foreground underline decoration-border decoration-dashed underline-offset-4 transition-colors hover:text-primary hover:decoration-primary sm:text-[15px]",
                  focusRing,
                )}
              >
                Add a description
              </button>
            )}
          </div>

          {/* Actions — full-width on mobile, compact on desktop */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <div className="flex gap-2">
              {/* Primary publish (when ready) takes full row on mobile */}
              {!isPublished && (
                <Button
                  type="button"
                  variant={publishIsPrimary ? "default" : "outline"}
                  onClick={handlePublish}
                  aria-disabled={publishBlocked || isPending || undefined}
                  aria-busy={isPending || undefined}
                  aria-describedby={publishBlocked ? blockedId : undefined}
                  className={cn(
                    "h-11 flex-1 rounded-xl sm:h-9 sm:flex-none",
                    publishIsPrimary && "shadow-sm shadow-primary/20",
                    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
                  )}
                >
                  {isPending && (
                    <Loader2
                      className="size-4 animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                  )}
                  {isPending
                    ? isPublished
                      ? "Unpublishing…"
                      : "Publishing…"
                    : isPublished
                      ? "Unpublish"
                      : "Publish"}
                </Button>
              )}

              <Button
                type="button"
                variant={publishIsPrimary ? "secondary" : "default"}
                onClick={onAddCourse}
                className={cn(
                  "h-11 flex-1 rounded-xl sm:h-9 sm:flex-none",
                  !publishIsPrimary && "shadow-sm shadow-primary/20",
                )}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add course
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label="More program actions"
                    className="size-11 shrink-0 rounded-xl sm:size-9"
                  >
                    <MoreHorizontal className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onSelect={onEdit}>
                    <Pencil className="size-4" aria-hidden="true" />
                    Edit program
                  </DropdownMenuItem>
                  {publicPath && (
                    <DropdownMenuItem asChild>
                      <a href={publicPath} target="_blank" rel="noreferrer">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        Open public page
                      </a>
                    </DropdownMenuItem>
                  )}
                  {isPublished && (
                    <DropdownMenuItem
                      onSelect={onTogglePublish}
                      disabled={isPending}
                    >
                      <EyeOff className="size-4" aria-hidden="true" />
                      Unpublish
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={onDelete}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    Delete program
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {publishBlocked && readiness.blocker && (
              <span id={blockedId} className="sr-only">
                {readiness.blocker.todoLabel} before you can publish.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Launch checklist */}
      <AnimatePresence initial={false}>
        {showChecklist && (
          <motion.div
            key="checklist"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative overflow-hidden"
          >
            <div
              role="group"
              aria-labelledby={checklistId}
              className={cn(
                "flex flex-col gap-3 border-t border-border px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-10 lg:px-8",
                draftReady
                  ? "bg-success/5"
                  : isPublished
                    ? "bg-warning/10"
                    : "bg-secondary/40",
              )}
            >
              <div className="lg:w-56 lg:shrink-0">
                <h2
                  id={checklistId}
                  className="inline-flex items-center gap-2 font-display text-sm font-bold tracking-tight text-foreground"
                >
                  {draftReady && (
                    <CheckCircle2
                      className="size-4 text-success"
                      aria-hidden="true"
                    />
                  )}
                  {isPublished
                    ? "Needs attention"
                    : draftReady
                      ? "Ready to publish"
                      : "Before you publish"}
                </h2>

                {!draftReady && totalChecks > 0 && (
                  <>
                    <div className="mt-2.5 flex gap-1" aria-hidden="true">
                      {readiness.checks.map((c) => (
                        <span
                          key={c.id}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors duration-500",
                            c.done ? "bg-primary" : "bg-border",
                          )}
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                      {doneCount} of {totalChecks} complete
                    </p>
                  </>
                )}
              </div>

              {!draftReady && (
                <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-1">
                  {readiness.checks.map((check) => (
                    <ChecklistItem
                      key={check.id}
                      check={check}
                      required={
                        !isPublished && check.blocksPublish && !check.done
                      }
                      onAction={checkActions[check.id]}
                    />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function StatusIndicator({
  status,
  pending,
}: {
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  pending: boolean;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-semibold tracking-tight sm:gap-2 sm:px-3 sm:text-[12.5px]";

  if (pending) {
    const pendingLabel =
      status === "PUBLISHED"
        ? "Unpublishing…"
        : status === "ARCHIVED"
          ? "Restoring…"
          : "Publishing…";

    return (
      <span className={cn(base, "border-border bg-secondary text-foreground")}>
        <Loader2
          className="size-3.5 animate-spin motion-reduce:animate-none"
          aria-hidden="true"
        />
        {pendingLabel}
      </span>
    );
  }

  if (status === "PUBLISHED") {
    return (
      <span
        className={cn(
          base,
          "border-success/30 bg-success/10 text-[color-mix(in_oklch,var(--success),black_28%)] dark:text-success",
        )}
      >
        <span aria-hidden="true" className="size-2 rounded-full bg-success" />
        Published
      </span>
    );
  }

  if (status === "ARCHIVED") {
    return (
      <span
        className={cn(
          base,
          "border-border bg-secondary text-muted-foreground",
        )}
      >
        <span
          aria-hidden="true"
          className="size-2 rounded-full border-[1.5px] border-muted-foreground/60 bg-muted-foreground/20"
        />
        Archived
      </span>
    );
  }

  return (
    <span className={cn(base, "border-border bg-secondary text-foreground")}>
      <span
        aria-hidden="true"
        className="size-2 rounded-full border-[1.5px] border-muted-foreground"
      />
      Draft
    </span>
  );
}

function ChecklistItem({
  check,
  required,
  onAction,
}: {
  check: ReadinessCheck;
  required: boolean;
  onAction?: () => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center",
        onAction && !check.done ? "min-h-11 sm:min-h-8" : "min-h-8",
      )}
    >
      {check.done ? (
        <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          <span className="sr-only">Done: </span>
          {check.doneLabel}
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 text-sm">
          <Circle className="size-4 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">To do: </span>
          {onAction ? (
            <button
              type="button"
              onClick={onAction}
              className={cn(
                "-my-3 rounded-sm py-3 font-semibold text-foreground underline decoration-primary/40 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary sm:-my-2 sm:py-2",
                focusRing,
              )}
            >
              {check.todoLabel}
            </button>
          ) : (
            <span className="font-semibold text-foreground">
              {check.todoLabel}
            </span>
          )}
          {required && (
            <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground uppercase">
              Required
            </span>
          )}
        </span>
      )}
    </li>
  );
}