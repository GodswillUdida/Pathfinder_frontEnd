"use client";

import { useCallback } from "react";
import { Archive, Copy, ExternalLink, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  usePublishCourse,
  useUnpublishCourse,
  useArchiveCourse,
} from "@/hooks/useCourses";
import type { CourseCatalogItem } from "@/types/catalog";
import { LEVEL_LABEL } from "./constants";
import { KebabMenu } from "./ui/KebabMenu";
import { StatusPill } from "./ui/StatusPill";

interface CourseHeaderProps {
  course: CourseCatalogItem;
  moduleCount?: number;
  topicCount?: number;
  totalDurationLabel?: string | null;
  onDelete: () => void;
}

const secondaryButton = cn(
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border px-4 text-[13px] font-medium text-muted-foreground sm:h-10",
  "transition-colors duration-300 hover:border-brand-300 hover:bg-secondary hover:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
);

export function CourseHeader({
  course,
  moduleCount,
  topicCount,
  totalDurationLabel,
  onDelete,
}: CourseHeaderProps) {
  const publish = usePublishCourse();
  const unpublish = useUnpublishCourse();
  const archive = useArchiveCourse();

  const published = course.status === "PUBLISHED";
  const archived = course.status === "ARCHIVED";
  const program = course.programs?.[0]?.program;
  const statusPending =
    publish.isPending || unpublish.isPending || archive.isPending;

  const togglePublish = useCallback(async () => {
    try {
      if (published) {
        await unpublish.mutateAsync(course.id);
        toast.success("Moved to draft.");
      } else {
        await publish.mutateAsync(course.id);
        toast.success("Published.");
      }
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to update status.");
    }
  }, [published, course.id, publish, unpublish]);

  const handleArchive = useCallback(async () => {
    try {
      await archive.mutateAsync(course.id);
      toast.success("Course archived.");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to archive course.");
    }
  }, [archive, course.id]);

  const liveHref =
    program?.slug && course.slug
      ? `/courses/${program.slug}/${course.slug}`
      : null;

  const meta = [
    moduleCount != null
      ? `${moduleCount} module${moduleCount === 1 ? "" : "s"}`
      : null,
    topicCount != null
      ? `${topicCount} topic${topicCount === 1 ? "" : "s"}`
      : null,
    totalDurationLabel,
  ].filter(Boolean) as string[];

  return (
    <header className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {course.level && (
            <span className="text-[12px] font-medium text-muted-foreground">
              {LEVEL_LABEL[course.level] ?? course.level}
            </span>
          )}
          <StatusPill
            status={course.status as "DRAFT" | "PUBLISHED" | "ARCHIVED"}
          />
        </div>

        <h1 className="font-display text-[clamp(1.35rem,2.8vw,1.85rem)] leading-[1.15] font-semibold tracking-tight text-balance text-foreground">
          {course.title}
        </h1>

        {(course.description || meta.length > 0) && (
          <div className="max-w-2xl space-y-1.5">
            {course.description && (
              <p className="line-clamp-3 text-[13.5px] leading-relaxed text-muted-foreground">
                {course.description}
              </p>
            )}
            {meta.length > 0 && (
              <p className="text-[12.5px] text-muted-foreground/80">
                {meta.join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {/* Publish / Unpublish — hidden when archived; restore via publish */}
        {!archived && (
          <button
            type="button"
            onClick={togglePublish}
            disabled={statusPending}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-5 text-[13px] font-semibold sm:h-10 sm:flex-none",
              "transition-colors duration-300 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              published
                ? "border border-border text-muted-foreground hover:border-brand-300 hover:bg-secondary hover:text-foreground"
                : "bg-primary text-primary-foreground hover:bg-brand-500",
            )}
          >
            {statusPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            )}
            {published ? "Unpublish" : "Publish"}
          </button>
        )}

        {archived && (
          <button
            type="button"
            onClick={togglePublish}
            disabled={statusPending}
            className={cn(
              "inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-5 text-[13px] font-semibold text-primary-foreground sm:h-10 sm:flex-none",
              "transition-colors duration-300 hover:bg-brand-500 active:scale-[0.98]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {statusPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            )}
            Restore &amp; publish
          </button>
        )}

        {liveHref && published && (
          <a
            href={liveHref}
            target="_blank"
            rel="noreferrer"
            className={secondaryButton}
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            Preview
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}

        <KebabMenu
          items={[
            // {
            //   label: "Duplicate course",
            //   icon: Copy,
            //   onClick: () => toast("Duplicate: wire this to your API"),
            // },
            ...(!archived
              ? [
                  {
                    label: "Archive course",
                    icon: Archive,
                    onClick: handleArchive,
                  },
                ]
              : []),
            {
              label: "Delete course",
              icon: Trash2,
              onClick: onDelete,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}