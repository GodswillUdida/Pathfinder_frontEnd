"use client";

import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModuleWithTopics } from "@/types/domain";
import type { TopicWithResources } from "../types";
import { formatDuration } from "../utils";
import { AddTopic } from "./AddTopic";
import { isTopicReady } from "./content-meta";
import { ModuleReadinessBar } from "./ModuleReadinessBar";
import { TopicRow } from "./TopicRow";

interface ModuleCardProps {
  mod: ModuleWithTopics;
  /** 0-based display index (not the raw `position`, which can have gaps). */
  index: number;
  open: boolean;
  onToggle: () => void;
  onChanged: () => void;
}

export function ModuleCard({ mod, index, open, onToggle, onChanged }: ModuleCardProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const buttonId = `${uid}-trigger`;
  const regionId = `${uid}-region`;

  const topics = mod.topics as TopicWithResources[];
  console.log("topics", topics);
  const readyCount = topics.filter(isTopicReady).length;
  const duration = formatDuration(
    topics.reduce((sum, t) => sum + (t.durationSeconds ?? 0), 0) || null,
  );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-card transition-colors duration-300",
        open ? "border-brand-300/60" : "border-border",
      )}
    >
      <button
        id={buttonId}
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={onToggle}
        className="flex min-h-16 w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary font-mono text-[11px] font-bold tabular-nums text-brand-indigo">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span className="block truncate text-[13.5px] font-semibold tracking-tight text-foreground">
              {mod.title}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2.5 text-[11px] text-muted-foreground">
              <span>
                {topics.length} topic{topics.length === 1 ? "" : "s"}
              </span>
              {duration && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden /> {duration}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-4">
          {topics.length > 0 && (
            <ModuleReadinessBar ready={readyCount} total={topics.length} />
          )}
          <ChevronDown
            aria-hidden
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-300",
              open && "rotate-180",
            )}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={regionId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3">
              {topics.length > 0 ? (
                <ul className="relative mb-2 space-y-0.5">
                  {/* Connecting rule: topics read as children of this module */}
                  <span
                    aria-hidden
                    className="absolute top-3 bottom-3 left-3.25 w-px bg-border"
                  />
                  {topics.map((topic, i) => (
                    <TopicRow key={topic.id} topic={topic} index={i} />
                  ))}
                </ul>
              ) : (
                <p className="mb-2 text-[12.5px] text-muted-foreground">
                  No topics yet. Add the first lesson for this module.
                </p>
              )}
              <AddTopic moduleId={mod.id} topics={topics} onCreated={onChanged} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
