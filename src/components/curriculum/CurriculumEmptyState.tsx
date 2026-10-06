// components/curriculum/CurriculumEmptyState.tsx
"use client";

import { Layers, Plus } from "lucide-react";

interface CurriculumEmptyStateProps {
  onAddModule: () => void;
}

export function CurriculumEmptyState({ onAddModule }: CurriculumEmptyStateProps) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.015]">
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <div
          className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.05]"
          aria-hidden="true"
        >
          <Layers className="h-4 w-4 text-gray-400 dark:text-white/35" />
        </div>

        <h3 className="text-[13.5px] font-semibold text-gray-900 dark:text-white mb-1">
          No curriculum yet
        </h3>
        <p className="text-[12.5px] leading-relaxed text-gray-400 dark:text-white/35 max-w-[280px] mb-6">
          Add a module to start structuring this course into topics and content.
        </p>

        <button
          type="button"
          onClick={onAddModule}
          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-[12.5px] font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
          Add first module
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-gray-100 dark:border-white/[0.06] py-3 text-[10.5px] font-medium tracking-wide text-gray-400 dark:text-white/25">
        <span>MODULE</span>
        <span className="h-px w-4 bg-gray-200 dark:bg-white/10" aria-hidden="true" />
        <span>TOPICS</span>
        <span className="h-px w-4 bg-gray-200 dark:bg-white/10" aria-hidden="true" />
        <span>CONTENT</span>
      </div>
    </div>
  );
}