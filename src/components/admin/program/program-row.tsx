"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BookOpen, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Program, ProgramWithCount } from "@/types/domain";

/**
 * Column template shared by the list header and every row, so columns always align.
 * Callers add their own `grid` / `hidden sm:grid` display class.
 * Mobile: check · avatar · title · actions.  sm+: check · avatar · title · courses · status · actions.
 */
export const PROGRAM_COLS =
  "items-center gap-x-3 px-4 sm:gap-x-4 sm:px-6 " +
  "grid-cols-[1rem_2.5rem_minmax(0,1fr)_2rem] " +
  "sm:grid-cols-[1rem_2.5rem_minmax(0,1fr)_5rem_7.5rem_2rem]";

// ─── Avatar palette: deterministic, all in the brand blue family ─────────────

const PALETTE = [
  "bg-brand-600 text-white",
  "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300",
  "bg-brand-900 text-brand-100 dark:bg-brand-800",
  "bg-brand-cyan/20 text-info dark:text-brand-cyan",
  "bg-brand-200 text-brand-800 dark:bg-brand-400/25 dark:text-brand-100",
] as const;

function paletteFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function ProgramAvatar({ program }: { program: Program }) {
  if (program.image) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-muted ring-1 ring-border">
        <Image src={program.image} alt="" fill sizes="40px" className="object-cover" />
      </div>
    );
  }

  const initial = program.title.trim().charAt(0).toUpperCase() || "P";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display text-[15px] font-bold tracking-tight",
        "transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-105 group-hover:-rotate-3",
        paletteFor(program.id),
      )}
    >
      {initial}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

export function StatusBadge({
  status,
  compact = false,
}: {
  status: Program["status"];
  compact?: boolean;
}) {
  const isPublished = status === "PUBLISHED";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-tight",
        compact ? "px-2 py-0.5 text-[10.5px]" : "px-2.5 py-0.5 text-[11px]",
        isPublished
          ? "border-success/30 bg-success/10 text-[color-mix(in_oklch,var(--success),black_28%)] dark:text-success"
          : "border-warning/40 bg-warning/15 text-[color-mix(in_oklch,var(--warning),black_55%)] dark:text-warning",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", isPublished ? "bg-success" : "bg-warning")}
      />
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface ProgramRowProps {
  program: ProgramWithCount;
  selected: boolean;
  onToggleSelect: () => void;
  onOpen: () => void;
  onDelete: () => void;
  /** Position in the list, used only to stagger the entrance. */
  index?: number;
}

export function ProgramRow({
  program,
  selected,
  onToggleSelect,
  onOpen,
  onDelete,
  index = 0,
}: ProgramRowProps) {
  const courseCount = program._count?.courses ?? 0;
  const stop = {
    onClick: (e: React.MouseEvent) => e.stopPropagation(),
    onKeyDown: (e: React.KeyboardEvent) => e.stopPropagation(),
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        default: { type: "spring", stiffness: 260, damping: 26, delay: Math.min(index, 10) * 0.03 },
        layout: { type: "spring", stiffness: 350, damping: 35 },
      }}
      role="row"
      aria-selected={selected}
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        "group relative grid cursor-pointer border-b border-border py-3 outline-none last:border-b-0",
        PROGRAM_COLS,
        "transition-colors duration-200",
        selected ? "bg-accent" : "hover:bg-accent/40",
        "focus-visible:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
      )}
    >
      {/* Brand accent bar */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-2.5 left-0 w-[3px] origin-center rounded-r-full bg-primary",
          "scale-y-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "group-hover:scale-y-100 group-focus-visible:scale-y-100",
          selected && "scale-y-100",
        )}
      />

      {/* Checkbox */}
      <div role="gridcell" className="flex items-center" {...stop}>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          aria-label={`Select ${program.title}`}
          className="h-4 w-4"
        />
      </div>

      {/* Avatar */}
      <div role="gridcell">
        <ProgramAvatar program={program} />
      </div>

      {/* Title, description, mobile meta */}
      <div role="gridcell" className="min-w-0">
        <p
          title={program.title}
          className="truncate text-sm font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-primary"
        >
          {program.title}
        </p>
        {program.description && (
          <p title={program.description} className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
            {program.description}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2 sm:hidden">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <BookOpen className="h-3 w-3 opacity-70" aria-hidden="true" />
            <span className="font-mono tabular-nums">{courseCount}</span>
            <span>{courseCount === 1 ? "course" : "courses"}</span>
          </span>
          <StatusBadge status={program.status} compact />
        </div>
      </div>

      {/* Courses (sm+) */}
      <div
        role="gridcell"
        className={cn(
          "hidden text-right font-mono text-[13px] tabular-nums sm:block",
          courseCount === 0 ? "text-muted-foreground/60" : "font-medium text-foreground",
        )}
      >
        {courseCount}
      </div>

      {/* Status (sm+) */}
      <div role="gridcell" className="hidden justify-end sm:flex">
        <StatusBadge status={program.status} />
      </div>

      {/* Actions */}
      <div role="gridcell" className="flex justify-end" {...stop}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={`Options for ${program.title}`}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg text-muted-foreground",
                "transition-[background-color,color,opacity] duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                // Always visible on touch devices; revealed on hover / focus for pointer users.
                "sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
                "[@media(hover:none)]:opacity-100",
                "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:opacity-100",
              )}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={onOpen} className="gap-2">
              <Eye className="h-3.5 w-3.5" />
              View details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onDelete}
              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}