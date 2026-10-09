"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { ModuleForm } from "./ModuleForm";
import { ItemActionsMenu } from "./ItemActionsMenu";
import { TopicListItem } from "./TopicListItem";
import type { CreateModuleInput } from "@/schemas/curriculum.schema";
import type { Module } from "@/types/curriculum";

interface Props {
  index: number;
  module: Module;
  isUpdating?: boolean;
  onUpdate: (values: CreateModuleInput) => Promise<void> | void;
  onDelete: () => void;
  /** Wire these to your existing topic hooks — kept optional so this drops in without them. */
  onAddTopic?: (moduleId: string) => void;
  onEditTopic?: (moduleId: string, topicId: string) => void;
  onDeleteTopic?: (moduleId: string, topicId: string) => void;
}

export function ModuleListItem({
  index,
  module,
  isUpdating,
  onUpdate,
  onDelete,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);

  const number = String(index + 1).padStart(2, "0");
  const topicCount = module.topics?.length ?? 0;

  const handleUpdate = async (values: CreateModuleInput) => {
    await onUpdate(values);
    setEditing(false);
  };

  return (
    <div className="border-b border-[var(--line)]">
      {/* Row */}
      <div className="flex items-start gap-4 py-5">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-start gap-4 flex-1 min-w-0 text-left group focus-visible:outline-none"
          aria-expanded={expanded}
        >
          <span className="font-[family-name:var(--font-display)] text-[22px] leading-none italic text-[var(--ink-faint)] tabular-nums pt-0.5 shrink-0 w-9">
            {number}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-display)] text-[17px] sm:text-[18px] leading-snug text-[var(--ink)] transition-colors duration-150 group-hover:text-[var(--accent-strong)]">
                {module.title}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 text-[var(--ink-faint)] transition-transform duration-200 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </span>
            {module.description && (
              <span className="block mt-1 text-[13px] leading-relaxed text-[var(--ink-soft)] line-clamp-2">
                {module.description}
              </span>
            )}
            <span className="block mt-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-faint)] tabular-nums">
              {topicCount} {topicCount === 1 ? "lesson" : "lessons"}
            </span>
          </span>
        </button>

        <ItemActionsMenu
          onEdit={() => {
            setExpanded(true);
            setEditing(true);
          }}
          onDelete={onDelete}
        />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="curriculum-stagger pl-0 sm:pl-[52px] pb-6 space-y-4">
          {editing ? (
            <div className="py-1 border-t border-[var(--line)] pt-5">
              <p className="text-[10.5px] font-semibold tracking-[0.16em] uppercase text-[var(--accent-strong)] mb-4">
                Editing chapter
              </p>
              <ModuleForm
                defaultValues={{ title: module.title, description: module.description, position: module.position }}
                isSubmitting={isUpdating}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <>
              {topicCount > 0 ? (
                <div className="relative pl-4 border-l border-[var(--line)] space-y-0.5">
                  {module.topics.map((topic) => (
                    <TopicListItem
                      key={topic.id}
                      topic={topic}
                      moduleId={module.id}
                      onEdit={() => onEditTopic?.(module.id, topic.id)}
                      onDelete={() => onDeleteTopic?.(module.id, topic.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[12.5px] italic text-[var(--ink-faint)] font-[family-name:var(--font-display)]">
                  No lessons in this chapter yet.
                </p>
              )}

              <button
                type="button"
                onClick={() => onAddTopic?.(module.id)}
                className="inline-flex items-center gap-1.5 min-h-11 sm:min-h-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-faint)] transition-colors duration-150 hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                Add lesson
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}