"use client";

import { useEffect, useRef, useState } from "react";
import { Check, GraduationCap } from "lucide-react";
import { ApplicantForm } from "@/components/applicants/ApplicantForm";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";

// ─── Step config ──────────────────────────────────────────────────────────────

export const REGISTRATION_STEPS = [
  { id: "personal",   label: "Personal",   shortLabel: "Personal"   },
  { id: "academic",   label: "Academic",   shortLabel: "Academic"   },
  { id: "papers",     label: "Papers",     shortLabel: "Papers"     },
  { id: "details",    label: "Details",    shortLabel: "Details"    },
  { id: "employment", label: "Employment", shortLabel: "Work"       },
  { id: "sponsor",    label: "Sponsor",    shortLabel: "Sponsor"    },
  // { id: "documents",  label: "Documents",  shortLabel: "Docs"       },
] as const;

type StepId = (typeof REGISTRATION_STEPS)[number]["id"];

// ─── Mobile step indicator ─────────────────────────────────────────────────────

function MobileStepRow({
  activeId,
  passedIds,
}: {
  activeId: StepId;
  passedIds: Set<string>;
}) {
  const activeIndex = REGISTRATION_STEPS.findIndex((s) => s.id === activeId);

  return (
    <div className="flex items-center gap-0 overflow-x-auto scrollbar-none -mx-4 px-4">
      {REGISTRATION_STEPS.map((step, i) => {
        const isPassed  = passedIds.has(step.id);
        const isActive  = step.id === activeId;
        const isLast    = i === REGISTRATION_STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all duration-200",
                  isPassed
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : isActive
                      ? "border-indigo-600 bg-white text-indigo-600"
                      : "border-gray-200 bg-white text-gray-400"
                )}
              >
                {isPassed ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  String(i + 1)
                )}
              </div>
              <span
                className={cn(
                  "text-[9px] font-semibold whitespace-nowrap transition-colors",
                  isActive ? "text-indigo-600" : isPassed ? "text-indigo-400" : "text-gray-400"
                )}
              >
                {step.shortLabel}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-px w-8 mb-4 mx-1 transition-colors duration-300",
                  passedIds.has(REGISTRATION_STEPS[i + 1].id) || isActive
                    ? "bg-indigo-300"
                    : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateApplicantPage() {
  const [activeId,  setActiveId]  = useState<StepId>(REGISTRATION_STEPS[0].id);
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Wait one tick for sections to mount
    const timer = setTimeout(() => {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.id as StepId;
              setActiveId(id);

              const idx = REGISTRATION_STEPS.findIndex((s) => s.id === id);
              setPassedIds((prev) => {
                const next = new Set(prev);
                // Mark every section BEFORE the current one as passed
                REGISTRATION_STEPS.slice(0, idx).forEach((s) => next.add(s.id));
                return next;
              });
            }
          });
        },
        // Top 15% of viewport triggers the step as "active"
        { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
      );

      REGISTRATION_STEPS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) observerRef.current?.observe(el);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      observerRef.current?.disconnect();
    };
  }, []);

  const activeIndex   = REGISTRATION_STEPS.findIndex((s) => s.id === activeId);
  const progressPct   = Math.round(((activeIndex + 1) / REGISTRATION_STEPS.length) * 100);
  const activeStep    = REGISTRATION_STEPS[activeIndex];

  return (
    <div className="min-h-screen bg-[#F9F9F7]">
      <Navbar />

      {/* ── Sticky page header ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">

          {/* Top row */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-gray-900 leading-tight">
                  Student Registration
                </h1>
                <p className="text-[11px] text-gray-500 leading-tight">
                  Step {activeIndex + 1} of {REGISTRATION_STEPS.length} —{" "}
                  <span className="font-semibold text-indigo-600">{activeStep.label}</span>
                </p>
              </div>
            </div>

            {/* Progress pill */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-700">{progressPct}%</span>
              </div>
              <div className="h-2 w-32 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Mobile step indicator */}
          <div className="pb-3 sm:hidden">
            <MobileStepRow activeId={activeId} passedIds={passedIds} />
          </div>

          {/* Desktop step row */}
          <div className="hidden sm:flex items-center gap-0 pb-0 overflow-x-auto scrollbar-none">
            {REGISTRATION_STEPS.map((step, i) => {
              const isPassed = passedIds.has(step.id);
              const isActive = step.id === activeId;
              const isLast   = i === REGISTRATION_STEPS.length - 1;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(step.id)
                        ?.scrollIntoView({ behavior: "smooth", block: "start" })
                    }
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-semibold",
                      "transition-all duration-150 whitespace-nowrap",
                      isActive
                        ? "border-indigo-600 text-indigo-700"
                        : isPassed
                          ? "border-transparent text-indigo-400 hover:text-indigo-600"
                          : "border-transparent text-gray-400 hover:text-gray-600"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
                        isActive
                          ? "bg-indigo-600 text-white"
                          : isPassed
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {isPassed ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    </span>
                    {step.label}
                  </button>
                  {!isLast && (
                    <div className="h-px w-4 shrink-0 bg-gray-200 mb-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ApplicantForm />
      </main>
    </div>
  );
}