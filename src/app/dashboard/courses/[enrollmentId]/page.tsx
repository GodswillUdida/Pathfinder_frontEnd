// app/dashboard/courses/[enrollmentId]/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEnrollment, usePlaybackUrl } from "@/hooks/use-enrollments";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import type { Topic, Module } from "@/types/dashboard";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Lock,
  PlayCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Video player — Bunny signed iframe
// ---------------------------------------------------------------------------

function BunnyPlayer({ topicId }: { topicId: string }) {
  const { data: url, isLoading, error } = usePlaybackUrl(topicId, true);

  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="w-full aspect-video bg-black flex flex-col items-center justify-center gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-white/60 text-sm">Failed to load video</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black">
      <iframe
        src={url}
        className="w-full h-full"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module accordion item
// ---------------------------------------------------------------------------

function ModuleItem({
  mod,
  completedIds,
  activeTopic,
  onSelectTopic,
}: {
  mod: Module;
  completedIds: Set<string>;
  activeTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
}) {
  const [open, setOpen] = useState(
    mod.topics.some((t) => t.id === activeTopic?.id)
  );

  // Open the module containing the active topic automatically
  useEffect(() => {
    if (mod.topics.some((t) => t.id === activeTopic?.id)) {
      setOpen(true);
    }
  }, [activeTopic, mod.topics]);

  const completedCount = mod.topics.filter((t) =>
    completedIds.has(t.id)
  ).length;

  return (
    <div className="border border-slate-200/80 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <div
          className={cn(
            "transition-transform duration-200",
            open && "rotate-90"
          )}
        >
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {mod.title}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount}/{mod.topics.length} completed
          </p>
        </div>
      </button>

      {open && (
        <div className="divide-y divide-slate-100">
          {mod.topics.map((topic) => {
            const done = completedIds.has(topic.id);
            const active = topic.id === activeTopic?.id;
            const ready = topic.videoStatus === "ready";

            return (
              <button
                key={topic.id}
                onClick={() => ready && onSelectTopic(topic)}
                disabled={!ready}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors text-sm",
                  active
                    ? "bg-blue-50 border-l-2 border-l-blue-500"
                    : "hover:bg-slate-50 border-l-2 border-l-transparent",
                  !ready && "opacity-50 cursor-not-allowed"
                )}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : !ready ? (
                    <Lock className="w-4 h-4 text-slate-300" />
                  ) : (
                    <Circle
                      className={cn(
                        "w-4 h-4",
                        active ? "text-blue-500" : "text-slate-300"
                      )}
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium truncate leading-snug",
                      active
                        ? "text-blue-700"
                        : done
                        ? "text-slate-500"
                        : "text-slate-700"
                    )}
                  >
                    {topic.title}
                  </p>
                  {topic.durationSeconds && (
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(topic.durationSeconds)}
                    </p>
                  )}
                </div>

                {active && (
                  <PlayCircle className="w-4 h-4 text-blue-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CourseWatchPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  // const token = useAuthStore((s) => s.accessToken);

  const { data: enrollment, isLoading, error } = useEnrollment(enrollmentId);

  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [markingDone, setMarkingDone] = useState(false);

  // Completed topic IDs from progressRecords
  const completedIds = new Set(
    enrollment
      ?.progressRecords!.filter((p) => p.completed)
      .map((p) => p.topicId) ?? []
  );

  // Set initial topic from query param or first available
  useEffect(() => {
    if (!enrollment) return;
    const allTopics = enrollment.course.modules.flatMap((m) => m.topics);
    const topicIdFromQuery = searchParams.get("topic");

    const target = topicIdFromQuery
      ? allTopics.find((t) => t.id === topicIdFromQuery)
      : allTopics.find(
          (t) => !completedIds.has(t.id) && t.videoStatus === "ready"
        ) ?? allTopics[0];

    if (target) setActiveTopic(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment]);

  // Update URL when topic changes (without push — no history entry)
  const handleSelectTopic = useCallback(
    (topic: Topic) => {
      setActiveTopic(topic);
      router.replace(`/dashboard/courses/${enrollmentId}?topic=${topic.id}`, {
        scroll: false,
      });
    },
    [enrollmentId, router]
  );

  // Mark topic as complete
  const markComplete = async () => {
    if (!activeTopic || completedIds.has(activeTopic.id) || markingDone) return;
    setMarkingDone(true);
    try {
      await fetch(`${API_BASE}/progress`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",

          // Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          enrollmentId,
          topicId: activeTopic.id,
        }),
      });
      // Invalidate enrollment cache so progress re-fetches
      // (if using React Query, call queryClient.invalidateQueries)
      router.refresh();
    } catch {
      // silently fail — user can retry
    } finally {
      setMarkingDone(false);
    }
  };

  // Navigate to next topic automatically
  const goToNext = useCallback(() => {
    if (!enrollment || !activeTopic) return;
    const allTopics = enrollment.course.modules
      .flatMap((m) => m.topics)
      .filter((t) => t.videoStatus === "ready");
    const idx = allTopics.findIndex((t) => t.id === activeTopic.id);
    if (idx < allTopics.length - 1) {
      handleSelectTopic(allTopics[idx + 1]);
    }
  }, [enrollment, activeTopic, handleSelectTopic]);

  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-slate-600">Could not load this course.</p>
        <Link
          href="/dashboard"
          className="text-blue-600 text-sm hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const allTopics = enrollment.course.modules.flatMap((m) => m.topics);
  const totalTopics = allTopics.length;
  const completedCount = completedIds.size;
  const progress =
    totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const isLastTopic =
    allTopics
      .filter((t) => t.videoStatus === "ready")
      .findIndex((t) => t.id === activeTopic?.id) ===
    allTopics.filter((t) => t.videoStatus === "ready").length - 1;

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Back + title */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-900 truncate">
            {enrollment.course.title}
          </h1>
          <p className="text-xs text-slate-400">
            {completedCount}/{totalTopics} lessons · {progress}% complete
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Player + info */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Video */}
          <div className="rounded-2xl overflow-hidden bg-black shadow-lg">
            {activeTopic ? (
              <BunnyPlayer topicId={activeTopic.id} />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-slate-900">
                <p className="text-slate-500 text-sm">
                  Select a lesson to begin
                </p>
              </div>
            )}
          </div>

          {/* Topic title + actions */}
          {activeTopic && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {activeTopic.title}
                  </h2>
                  {activeTopic.durationSeconds && (
                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(activeTopic.durationSeconds)}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mark complete */}
                  {!completedIds.has(activeTopic.id) ? (
                    <button
                      onClick={markComplete}
                      disabled={markingDone}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
                    >
                      {markingDone ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      Mark complete
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Completed
                    </span>
                  )}

                  {/* Next lesson */}
                  {!isLastTopic && (
                    <button
                      onClick={goToNext}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Overall progress bar */}
              <div className="mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Course progress</span>
                  <span className="font-medium text-slate-700">
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Curriculum sidebar */}
        <div className="xl:w-80 shrink-0 space-y-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Course content
          </h3>
          {enrollment.course.modules
            .sort((a, b) => a.position - b.position)
            .map((mod) => (
              <ModuleItem
                key={mod.id}
                mod={mod}
                completedIds={completedIds}
                activeTopic={activeTopic}
                onSelectTopic={handleSelectTopic}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
