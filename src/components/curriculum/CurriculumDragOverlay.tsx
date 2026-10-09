import { Layers } from "lucide-react";
import type { Module } from "@/types/curriculum";

export function CurriculumDragOverlay({ activeDragId, modules }: { activeDragId: string | null; modules: Module[] }) {
  if (!activeDragId) return null;
  const mod = modules.find((m) => m.id === activeDragId);
  if (!mod) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-white dark:bg-[#1a1c24] border border-amber-300 dark:border-amber-500/40 shadow-xl w-72 pointer-events-none">
      <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
        <Layers className="w-3 h-3 text-amber-600 dark:text-amber-400" />
      </div>
      <span className="text-[13px] font-semibold text-gray-900 dark:text-white truncate">{mod.title}</span>
    </div>
  );
}