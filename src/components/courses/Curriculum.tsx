"use client";

import { memo, useState, useCallback } from "react";
import type { Module, Topic } from "@/types/course";
import type { Stats } from "./CoursePage";
import { fmtSecs } from "./course.helper";
import { TopicRow } from "./TopicRow";
import {
  ChevronDown, Clock, PlayCircle, Layers,
  Lock, BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CurriculumProps {
  modules:  Module[];
  enrolled: boolean;
  stats:    Stats;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getModuleDuration(mod: Module): number {
  return (mod.topics ?? []).reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0);
}

// function getModuleFreeCount(mod: Module): number {
//   return (mod.topics ?? []).filter((t) => t.isFree).length;
// }

// ─── Module item ─────────────────────────────────────────────────────────────

interface ModuleItemProps {
  mod:        Module;
  index:      number;
  enrolled:   boolean;
  isOpen:     boolean;
  isLast:     boolean;
  onToggle:   () => void;
}

function ModuleItem({ mod, index, enrolled, isOpen, isLast, onToggle }: ModuleItemProps) {
  const topicCount  = mod.topics?.length ?? 0;
  const duration    = getModuleDuration(mod);
  // const freeCount   = getModuleFreeCount(mod);
  const hasContent  = topicCount > 0;

  return (
    <div className="relative flex gap-0">
      {/* ── Left track ──────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center" style={{ width: 48, minWidth: 48 }}>
        {/* Chapter badge */}
        <button
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} module ${index + 1}: ${mod.title}`}
          className={cn(
            "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-200",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          )}
          style={
            isOpen
              ? { background: "#6366f1", borderColor: "#6366f1", color: "#fff", boxShadow: "0 0 0 4px rgba(99,102,241,0.15)" }
              : { background: "#fff", borderColor: "#e2e8f0", color: "#64748b" }
          }
        >
          {String(index + 1).padStart(2, "0")}
        </button>

        {/* Vertical connector */}
        {!isLast && (
          <div
            className="w-px flex-1 transition-colors duration-300"
            style={{
              background: isOpen
                ? "linear-gradient(to bottom, #6366f1 0%, #e2e8f0 100%)"
                : "#e2e8f0",
              minHeight: 16,
            }}
          />
        )}
      </div>

      {/* ── Module card ──────────────────────────────────────────────────── */}
      <div
        className="mb-3 flex-1 overflow-hidden rounded-2xl border transition-all duration-200"
        style={{
          borderColor: isOpen ? "rgba(99,102,241,0.25)" : "#e9edf2",
          background:  isOpen ? "rgba(99,102,241,0.02)" : "#fff",
          boxShadow:   isOpen
            ? "0 4px 16px -4px rgba(99,102,241,0.12)"
            : "0 1px 4px -1px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <button
          onClick={onToggle}
          disabled={!hasContent}
          aria-expanded={isOpen}
          className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/60 disabled:cursor-not-allowed"
        >
          <div className="flex-1 min-w-0">
            <p
              className="truncate text-[14px] font-semibold leading-snug"
              style={{ color: "#0f172a", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
            >
              {mod.title}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
                <PlayCircle className="h-3 w-3" aria-hidden="true" />
                {topicCount} {topicCount === 1 ? "lesson" : "lessons"}
              </span>
              {duration > 0 && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: "#94a3b8" }}>
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {fmtSecs(duration)}
                </span>
              )}
              {/* {!enrolled && freeCount > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    color:      "#6366f1",
                    border:     "0.5px solid rgba(99,102,241,0.2)",
                  }}
                >
                  {freeCount} free
                </span>
              )} */}
            </div>
          </div>

          {/* Chevron */}
          {hasContent && (
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-300",
                isOpen && "rotate-180"
              )}
              style={{ color: isOpen ? "#6366f1" : "#cbd5e1" }}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Topics list */}
        {isOpen && hasContent && (
          <div
            className="border-t"
            style={{ borderColor: "rgba(99,102,241,0.1)" }}
          >
            {(mod.topics ?? [])
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((topic, ti) => (
                <TopicRow
                  key={topic.id}
                  topic={topic}
                  enrolled={enrolled}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export const Curriculum = memo(function Curriculum({
  modules, enrolled, stats,
}: CurriculumProps) {
  // Default: first module open
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules[0] ? [modules[0].id] : [])
  );

  const toggle = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll   = () => setOpenIds(new Set(modules.map((m) => m.id)));
  const collapseAll = () => setOpenIds(new Set());
  const allOpen     = openIds.size === modules.length;

  // Summary
  const summary = [
    stats.moduleCount  > 0 && `${stats.moduleCount} modules`,
    stats.topicCount   > 0 && `${stats.topicCount} lessons`,
    stats.totalSeconds > 0 && fmtSecs(stats.totalSeconds),
  ].filter(Boolean).join(" · ");

  // ── Empty state ────────────────────────────────────────────────────────────

  if (modules.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed py-16 text-center"
        style={{ borderColor: "#e2e8f0", background: "#f8fafc" }}
      >
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "#f1f5f9" }}
        >
          <Layers className="h-8 w-8" style={{ color: "#94a3b8" }} aria-hidden="true" />
        </div>
        <p
          className="text-[16px] font-semibold"
          style={{ color: "#475569", fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
        >
          Curriculum coming soon
        </p>
        <p className="mt-1.5 text-[13px]" style={{ color: "#94a3b8" }}>
          Content is being prepared for this course.
        </p>
      </div>
    );
  }

  // ── Curriculum ─────────────────────────────────────────────────────────────

  return (
    <section aria-label="Course curriculum">

      {/* Section header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          {summary && (
            <p className="mt-1 text-[12px]" style={{ color: "#94a3b8" }}>{summary}</p>
          )}
        </div>

        {/* Expand / collapse all */}
        {modules.length > 1 && (
          <button
            onClick={allOpen ? collapseAll : expandAll}
            className="rounded-xl px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-slate-100"
            style={{
              color:       "#6366f1",
              border:      "0.5px solid rgba(99,102,241,0.25)",
              background:  "rgba(99,102,241,0.04)",
            }}
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        )}
      </div>

      {/* Module list with track */}
      <div role="list" aria-label="Course modules">
        {modules.map((mod, i) => (
          <div key={mod.id} role="listitem">
            <ModuleItem
              mod={mod}
              index={i}
              enrolled={enrolled}
              isOpen={openIds.has(mod.id)}
              isLast={i === modules.length - 1}
              onToggle={() => toggle(mod.id)}
            />
          </div>
        ))}
      </div>

      {/* Footer: enrollment nudge if not enrolled */}
      {!enrolled && stats.topicCount > 0 && (
        <div
          className="mt-4 flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{
            background: "rgba(99,102,241,0.04)",
            border:     "0.5px solid rgba(99,102,241,0.15)",
          }}
        >
          <Lock className="h-4 w-4 shrink-0" style={{ color: "#818cf8" }} aria-hidden="true" />
          <p className="text-[12px]" style={{ color: "#64748b" }}>
            <span className="font-semibold" style={{ color: "#4f46e5" }}>Enroll</span> to unlock all{" "}
            {stats.topicCount} lessons and access the full curriculum.
          </p>
        </div>
      )}
    </section>
  );
});