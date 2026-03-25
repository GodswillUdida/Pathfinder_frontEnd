// app/dashboard/courses/page.tsx
"use client";

import { useState } from "react";
import { useEnrollments } from "@/hooks/use-enrollments";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Trophy,
  PlayCircle,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { isPast, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Enrollment } from "@/types/dashboard";

function getProgress(e: Enrollment) {
  const total = e.course.modules.flatMap((m) => m.topics).length;
  if (!total) return 0;
  return Math.round(
    (e.progressRecords.filter((p) => p.completed).length / total) * 100
  );
}

function getNextTopic(e: Enrollment) {
  const done = new Set(
    e.progressRecords.filter((p) => p.completed).map((p) => p.topicId)
  );
  for (const mod of e.course.modules) {
    for (const t of mod.topics) {
      if (!done.has(t.id) && t.videoStatus === "ready") return t;
    }
  }
  return null;
}

type Filter = "all" | "active" | "completed" | "expired";

export default function MyCoursesPage() {
  const { data: enrollments, isLoading, error } = useEnrollments();
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filtered = enrollments?.filter((e: any) => {
    const progress = getProgress(e);
    const expired = isPast(new Date(e.expiresAt));
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && !expired && progress < 100) ||
      (filter === "completed" && progress === 100) ||
      (filter === "expired" && expired);
    const matchesSearch = e.course.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const FILTERS: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "In progress", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Expired", value: "expired" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My courses</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {enrollments?.length ?? 0} total enrollments
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all border",
                filter === f.value
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          Failed to load courses. Please refresh the page.
        </div>
      )}

      {!isLoading && filtered?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/80">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-700">No courses found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search or filter.
          </p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && filtered && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((enrollment: any) => {
            const progress = getProgress(enrollment);
            const expired = isPast(new Date(enrollment.expiresAt));
            const nextTopic = getNextTopic(enrollment);
            const total = enrollment.course.modules.flatMap(
              (m: any) => m.topics
            ).length;
            const completed = enrollment.progressRecords.filter(
              (p: any) => p.completed
            ).length;

            return (
              <div
                key={enrollment.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 group flex flex-col"
              >
                {/* Thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden shrink-0">
                  {enrollment.course.thumbnail ? (
                    <Image
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-14 h-14 text-blue-200" />
                    </div>
                  )}
                  {progress === 100 && (
                    <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur rounded-full px-4 py-1.5 flex items-center gap-2 text-emerald-700 text-sm font-semibold">
                        <Trophy className="w-4 h-4" /> Completed
                      </div>
                    </div>
                  )}
                  {expired && progress < 100 && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      Expired
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-2 mb-3">
                    {enrollment.course.title}
                  </h3>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>
                        {completed}/{total} lessons
                      </span>
                      <span className="font-medium text-slate-700">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Expiry */}
                  <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    {expired
                      ? "Access expired"
                      : `Expires ${formatDistanceToNow(
                          new Date(enrollment.expiresAt),
                          { addSuffix: true }
                        )}`}
                  </p>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Link
                      href={`/dashboard/courses/${enrollment.id}${
                        nextTopic ? `?topic=${nextTopic.id}` : ""
                      }`}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      {progress === 0
                        ? "Start learning"
                        : progress === 100
                        ? "Review"
                        : "Continue"}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
