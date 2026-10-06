"use client";

import { useState } from "react";
import Image from "next/image";
import { Reorder, useDragControls, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Clock,
  ExternalLink,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/domain";

type ProgramCourse = {
  position: number;
  course: Course;
};

interface CourseRowProps {
  item: ProgramCourse;
  index: number;
  reorderable: boolean;
  onEdit: () => void;
  onOpenFull: () => void;
  onDelete: () => void;
  onMove?: (delta: -1 | 1) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}

function formatDuration(duration?: string | number | null) {
  const secs = Number(duration);
  if (!secs || Number.isNaN(secs)) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function CourseRow({
  item,
  reorderable,
  onEdit,
  onOpenFull,
  onDelete,
  onMove,
  canMoveUp = false,
  canMoveDown = false,
}: CourseRowProps) {
  const { course, position } = item;
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  const isPublished = course.status === "PUBLISHED";
  const duration = formatDuration(course.totalDurationSeconds);
  const title = course.title?.trim() || "Untitled Course";

  // Abstract layout rendering loop to maintain complete semantic symmetry 
  const renderRowLayout = (
    <article
      className={cn(
        "group relative flex items-center gap-4 border-b border-border/60 bg-background px-4 py-3.5 antialiased select-none",
        "transition-[background-color,box-shadow] duration-150 ease-out",
        "focus-within:bg-muted/40 hover:bg-muted/30",
        isDragging && "border-t border-border/80 bg-background/90 shadow-lg shadow-foreground/5 backdrop-blur-md"
      )}
    >
      {/* Structural Minimal Drag Anchor Handle */}
      {reorderable && (
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          aria-label={`Drag anchor to sort: ${title}`}
          className={cn(
            "flex h-8 w-6 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/40",
            "transition-colors hover:bg-muted hover:text-foreground/80 active:cursor-grabbing",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}

      {/* Index Position Identifier Token */}
      <span className="w-5 shrink-0 text-right font-mono text-[11px] font-medium tracking-tight text-muted-foreground/60 tabular-nums">
        {String(position).padStart(2, "0")}
      </span>

      {/* Ultra-sharp High Contrast Thumbnail Component */}
      <div className="relative aspect-[16/10] h-10 w-16 shrink-0 overflow-hidden rounded-md border border-border/80 bg-muted/50 sm:h-11 sm:w-20">
        {course.thumbnail ? (
          <Image 
            src={course.thumbnail} 
            alt="" 
            fill 
            sizes="(max-w-640px) 64px, 80px" 
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/30">
            <BookOpen className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Typography Core Information Block */}
      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <button
            type="button"
            onClick={onOpenFull}
            className="group/title block min-w-0 text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h3 className="truncate text-[15px] font-medium tracking-tight text-foreground/90 transition-colors group-hover/title:text-primary">
              {title}
            </h3>
          </button>

          <div className="flex items-center gap-2.5 text-[11.5px] font-normal text-muted-foreground/80">
            {duration && (
              <span className="flex items-center gap-1 tabular-nums">
                <Clock className="h-3 w-3 opacity-70" />
                {duration}
              </span>
            )}
            {duration && course.level && <span className="h-1 w-1 rounded-full bg-border" />}
            {course.level && (
              <span className="font-medium tracking-tight text-muted-foreground/70 lowercase first-letter:uppercase">
                {course.level}
              </span>
            )}
          </div>
        </div>

        {/* Clean, Non-AI Flattened Status Badge Matrix */}
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded border px-1.5 py-0.5 text-[10.5px] font-medium tracking-tight",
            isPublished
              ? "border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
              : "border-amber-500/15 bg-amber-500/5 text-amber-600 dark:text-amber-400"
          )}
        >
          {isPublished ? "Published" : "Draft"}
        </span>
      </div>

      {/* Action Row Component Controller */}
      <div className="flex shrink-0 items-center" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Open options menu for ${title}`}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground/60",
                "transition-[background-color,border-color,color] duration-150",
                "hover:border-border hover:bg-muted hover:text-foreground",
                "data-[state=open]:border-border data-[state=open]:bg-muted data-[state=open]:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100"
              )}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 shadow-xl shadow-foreground/5">
            <DropdownMenuItem onSelect={onEdit} className="text-xs">
              <Pencil className="mr-2 h-3.5 w-3.5 opacity-60" />
              Quick edit
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenFull} className="text-xs">
              <ExternalLink className="mr-2 h-3.5 w-3.5 opacity-60" />
              Open builder
            </DropdownMenuItem>
            {reorderable && onMove && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onMove(-1)} disabled={!canMoveUp} className="text-xs">
                  <ArrowUp className="mr-2 h-3.5 w-3.5 opacity-60" />
                  Move up
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onMove(1)} disabled={!canMoveDown} className="text-xs">
                  <ArrowDown className="mr-2 h-3.5 w-3.5 opacity-60" />
                  Move down
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="text-xs text-destructive focus:bg-destructive/5 focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Delete course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );

  // ── NEXT-GEN CONTEXT ESCAPE ENGINES ─────────────────────────────────────────
  // Bypasses parent execution structures dynamically without component reconstruction loops
  if (reorderable) {
    return (
      <Reorder.Item
        value={course}
        dragListener={false}
        dragControls={controls}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileDrag={{ y: -2, scale: 0.995 }}
        className="relative block list-none focus:outline-none"
        style={{ contentVisibility: "auto" }}
      >
        {renderRowLayout}
      </Reorder.Item>
    );
  }

  return (
    <motion.div 
      layout="position" 
      className="relative block list-none"
      style={{ contentVisibility: "auto" }}
    >
      {renderRowLayout}
    </motion.div>
  );
}
