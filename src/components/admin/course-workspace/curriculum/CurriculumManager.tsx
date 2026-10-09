"use client";

import { useMemo, useState } from "react";
import { BookOpen, Layers } from "lucide-react";
import { CurriculumBuilder } from "@/components/curriculum/CurriculumBuilder";
import type { ModuleWithTopics } from "@/types/domain";
import { AddModuleCard } from "./AddModuleCard";
import { summarizeCurriculum } from "./content-meta";
import { CurriculumSummary } from "./CurriculumSummary";
import { ModuleCard } from "./ModuleCard";

interface CurriculumManagerProps {
  courseId: string;
  modules: ModuleWithTopics[];
  onChanged: () => void;
}

export function CurriculumManager({ courseId, modules, onChanged }: CurriculumManagerProps) {
  // `undefined` = "auto": the first module is open until the user chooses.
  // Works even when modules arrive after the first render.
  const [chosen, setChosen] = useState<string | null | undefined>(undefined);
  const expanded = chosen === undefined ? (modules[0]?.id ?? null) : chosen;

  const totals = useMemo(() => summarizeCurriculum(modules), [modules]);

  return (
    <div className="space-y-6 py-6">
      {modules.length > 0 && <CurriculumSummary totals={totals} />}

      <section aria-labelledby="modules-heading" className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2
            id="modules-heading"
            className="font-display text-[13px] font-bold tracking-tight text-foreground"
          >
            Modules
          </h2>
          <span className="flex items-center gap-1 text-[11.5px] text-muted-foreground">
            <Layers className="h-3.5 w-3.5" aria-hidden />
            {modules.length} module{modules.length === 1 ? "" : "s"}
          </span>
        </div>

        {modules.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
            <BookOpen className="mb-3 h-6 w-6 text-muted-foreground/60" aria-hidden />
            <p className="font-display text-[15px] font-semibold text-foreground">
              This course has no modules yet
            </p>
            <p className="mt-1 max-w-xs text-[13px] text-muted-foreground">
              Modules group related topics. Add your first one below, then fill it
              with lessons.
            </p>
          </div>
        ) : (
          modules.map((mod, i) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              index={i}
              open={expanded === mod.id}
              onToggle={() => setChosen(expanded === mod.id ? null : mod.id)}
              onChanged={onChanged}
            />
          ))
        )}
      </section>

      <AddModuleCard courseId={courseId} onCreated={onChanged} />

      <section aria-labelledby="editor-heading" className="space-y-2.5 pt-2">
        <h2
          id="editor-heading"
          className="font-display text-[13px] font-bold tracking-tight text-foreground"
        >
          Detailed editor
        </h2>
        <CurriculumBuilder courseId={courseId} />
      </section>
    </div>
  );
}
