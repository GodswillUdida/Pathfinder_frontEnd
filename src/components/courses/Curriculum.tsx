// ─── Curriculum ───────────────────────────────────────────────────────────────

import { Module } from "@/types/course";
import { memo } from "react";
import { fmtSecs } from "./course.helper";
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
  } from "@/components/ui/accordion";
import { Layers } from "lucide-react";
import { TopicRow } from "./TopicRow";
import { Stats } from "./CoursePage";

interface CurriculumProps {
    modules: Module[];
    enrolled: boolean;
    stats: Stats;
  }
  
export const Curriculum = memo(function Curriculum({
    modules,
    enrolled,
    stats,
  }: CurriculumProps) {
    const summary = [
      stats.moduleCount > 0 && `${stats.moduleCount} modules`,
      stats.topicCount > 0 && `${stats.topicCount} topics`,
      stats.totalSeconds > 0 && fmtSecs(stats.totalSeconds),
    ]
      .filter(Boolean)
      .join(" · ");
  
    return (
      <section>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-4">
          <h2 className="font-poppins text-2xl font-bold text-slate-900">
            Course Curriculum
          </h2>
          {summary && <p className="text-sm text-slate-400">{summary}</p>}
        </div>
  
        {modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
            <Layers className="mb-3 h-12 w-12 text-slate-300" />
            <p className="font-poppins text-lg font-semibold text-slate-500">
              Curriculum Coming Soon
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Content is being prepared for this course.
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-3">
            {modules.map((mod, mi) => (
              <AccordionItem
                key={mod.id}
                value={mod.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <AccordionTrigger className="group px-5 py-4 hover:no-underline hover:bg-slate-50 transition-colors data-[state=open]:bg-blue-50/60 data-[state=open]:border-b data-[state=open]:border-blue-100">
                  <div className="flex w-full items-center gap-4 text-left">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 font-poppins text-xs font-bold text-white group-data-[state=open]:bg-blue-700">
                      {String(mi + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-poppins truncate font-semibold text-slate-800">
                        {mod.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {mod.topics?.length ?? 0} topics
                        {mod.description && (
                          <span className="ml-2 text-slate-400">
                            · {mod.description}
                          </span>
                        )}
                      </p>
                    </div>
                    {/* Module total time */}
                    {mod.topics?.some((t) => t.durationSeconds) && (
                      <span className="shrink-0 font-mono text-xs text-slate-400">
                        {fmtSecs(
                          mod.topics.reduce(
                            (s, t) => s + (t.durationSeconds ?? 0),
                            0
                          )
                        )}
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
  
                <AccordionContent className="divide-y divide-slate-50 px-0 pb-1 pt-0">
                  {mod.topics
                    ?.slice()
                    .sort((a, b) => a.position - b.position)
                    .map((topic) => (
                      <TopicRow
                        key={topic.id}
                        topic={topic}
                        enrolled={enrolled}
                      />
                    ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>
    );
  });