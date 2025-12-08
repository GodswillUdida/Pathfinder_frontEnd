"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRight, Sparkles } from "lucide-react";
import { ProgramGroup } from "@/types/course";
import { CourseCard } from "./CourseCard";
import Link from "next/link";

interface CourseGridProps {
  programGroups: ProgramGroup[];
  initialVisibleCourses?: number;
}

export function CourseGrid({
  programGroups,
  initialVisibleCourses = 3,
}: CourseGridProps) {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (programId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [programId]: !prev[programId],
    }));
  };

  return (
    <div className="container mx-auto px-8 pb-16">
      <div className="space-y-16">
        {programGroups.map((group, groupIndex) => {
          const isExpanded = expandedSections[group.programId];
          const visibleCourses = isExpanded
            ? group.courses
            : group.courses.slice(0, initialVisibleCourses);
          const hasMore = group.courses.length > initialVisibleCourses;
          const remainingCount = group.courses.length - initialVisibleCourses;

          return (
            <motion.section
              key={group.programId}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
            >
              {/* Section Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-12 bg-linear-to-b from-blue-600 to-indigo-600 rounded-full" />
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {group.programName}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {group.courses.length}{" "}
                        {group.courses.length === 1 ? "course" : "courses"}{" "}
                        available
                      </p>
                    </div>
                  </div>
                </div>

                {/* View All Link (optional) */}
                {group.programId && (
                  <Link
                    href={`/program/${group.programId}`}
                    className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-all group"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>

              {/* Courses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <AnimatePresence mode="popLayout">
                  {visibleCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{
                        duration: 0.3,
                        delay: isExpanded ? 0 : index * 0.05,
                      }}
                    >
                      <CourseCard course={course} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Show More/Less Button */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => toggleSection(group.programId)}
                    className="group relative inline-flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-full hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300"
                  >
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {isExpanded ? (
                        "Show Less"
                      ) : (
                        <>
                          Show {remainingCount} More{" "}
                          {remainingCount === 1 ? "Course" : "Courses"}
                        </>
                      )}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />

                    {/* Hover effect */}
                    <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity" />
                  </button>
                </motion.div>
              )}

              {/* Divider */}
              {groupIndex < programGroups.length - 1 && (
                <div className="mt-16 border-t border-gray-200 dark:border-gray-800" />
              )}
            </motion.section>
          );
        })}
      </div>

      {/* Empty State */}
      {programGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Courses Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Check back soon for new courses and programs
          </p>
        </motion.div>
      )}
    </div>
  );
}
