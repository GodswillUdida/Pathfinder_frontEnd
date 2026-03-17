"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

import { CourseCard } from "./CourseCard";
import { Course, Program } from "@/types/course";

/* ===============================
   Types
================================ */

export interface ProgramGroup {
  program: Program | null;
  courses: Course[];
}

interface CourseGridProps {
  programGroups: ProgramGroup[];
  initialVisibleCourses?: number;
}

/* ===============================
   Helpers
================================ */

const getProgramKey = (program: Program | null) => program?.id ?? "standalone";

const getProgramTitle = (program: Program | null) =>
  program?.title ?? "Standalone Courses";

/* ===============================
   Component
================================ */

export function CourseGrid({
  programGroups,
  initialVisibleCourses = 3,
}: CourseGridProps) {
  /**
   * expansion state
   * {
   *   "programId": true
   * }
   */
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((key: string) => {
    setExpanded((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  /* ===============================
     Empty State
  ================================ */

  if (!programGroups.length) {
    return <EmptyState />;
  }

  return (
    <div className="container mx-auto px-10 pb-16">
      <div className="space-y-16">
        {programGroups.map((group, index) => {
          const programKey = getProgramKey(group.program);
          const isExpanded = expanded[programKey] ?? false;

          const visibleCourses = isExpanded
            ? group.courses
            : group.courses.slice(0, initialVisibleCourses);

          const remaining = group.courses.length - initialVisibleCourses;

          const hasMore = remaining > 0;

          return (
            <ProgramSection
              key={programKey}
              index={index}
              title={getProgramTitle(group.program)}
              program={group.program}
              courses={visibleCourses}
              totalCourses={group.courses.length}
              hasMore={hasMore}
              remaining={remaining}
              expanded={isExpanded}
              onToggle={() => toggleSection(programKey)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ===============================
   Program Section
================================ */

interface ProgramSectionProps {
  title: string;
  courses: Course[];
  program: Program | null;
  totalCourses: number;
  expanded: boolean;
  hasMore: boolean;
  remaining: number;
  index: number;
  onToggle: () => void;
}

function ProgramSection({
  title,
  courses,
  program,
  totalCourses,
  expanded,
  hasMore,
  remaining,
  index,
  onToggle,
}: ProgramSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      {/* Header */}
      <header className="mb-8 flex items-center gap-4">
        <div className="w-1 h-12 rounded-full bg-gradient-to-b from-blue-600 to-indigo-600" />

        <div>
          {/* <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2> */}
          <span className="mb-2 block font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">
            {String(index + 1).padStart(2, "0")} /{" "}
            {program?.slug ?? "standalone"}
          </span>

          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
            {title}
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {totalCourses} {totalCourses === 1 ? "course" : "courses"} available
          </p>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AnimatePresence mode="popLayout">
          {courses.map((course, i) => (
            <motion.div
              key={course.id}
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{
                duration: 0.25,
                delay: expanded ? 0 : i * 0.04,
              }}
            >
              {/* {courses.map((course, idx) => ( */}
              <CourseCard
                key={course.id}
                course={course}
                priority={i < 4} // first 4 get priority loading
                index={i}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Expand Button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={onToggle}
            className="group relative inline-flex items-center gap-3 px-5 py-2
              rounded-full border-2 border-gray-200 dark:border-gray-800
              bg-white dark:bg-gray-900
              hover:border-blue-500 hover:shadow-lg
              transition-all"
          >
            <span className="font-semibold text-gray-900 dark:text-white">
              {expanded
                ? "Show Less"
                : `Show ${remaining} More ${
                    remaining === 1 ? "Course" : "Courses"
                  }`}
            </span>

            <ChevronDown
              className={`w-5 h-5 text-blue-600 transition-transform ${
                expanded ? "rotate-180" : ""
              }`}
            />

            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity" />
          </button>
        </div>
      )}
    </motion.section>
  );
}

/* ===============================
   Empty State
================================ */

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        No Courses Available
      </h3>

      <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md">
        Check back soon for new courses and programs.
      </p>
    </motion.div>
  );
}
