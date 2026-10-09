"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEnrollment } from "@/hooks/use-enrollments";
import {
  useEnrollmentProgress,
  useUpsertProgress,
  useMarkTopicComplete,
} from "@/hooks/useProgress";
import { BunnyPlayer } from "@/components/topics/bunny-player";
import type { TopicWithRelations, ModuleWithTopics } from "@/types/domain";
import type { BunnyTimeUpdateData } from "@/lib/bunny/player-js";
import {
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Lock,
  PlayCircle,
  Clock,
  Circle,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

const PROGRESS_HEARTBEAT_MS = 8000;

function formatDuration(seconds?: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function isTopicReady(topic: TopicWithRelations): boolean {
  return topic.videoAsset?.status === "READY";
}

function getVideoGuid(topic: TopicWithRelations): string {
  return topic.videoAsset?.providerAssetId ?? "";
}

function sortCurriculum(modules: ModuleWithTopics[]): ModuleWithTopics[] {
  return [...modules]
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      ...m,
      topics: [...(m.topics ?? [])].sort((a, b) => a.position - b.position),
    }));
}

// ─── Module accordion item ───────────────────────────────────────────────────

interface ModuleItemProps {
  mod: ModuleWithTopics;
  completedIds: Set<string>;
  activeTopic: TopicWithRelations | null;
  onSelectTopic: (topic: TopicWithRelations) => void;
}

function ModuleItem({
  mod,
  completedIds,
  activeTopic,
  onSelectTopic,
}: ModuleItemProps) {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const hasActiveTopic = mod.topics.some((t) => t.id === activeTopic?.id);
  const expanded = isOpen ?? hasActiveTopic;
  const doneCount = mod.topics.filter((t) => completedIds.has(t.id)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-black/6 dark:border-white/[0.07]">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !(v ?? hasActiveTopic))}
        className="flex w-full min-h-[44px] cursor-pointer items-center gap-2.5 bg-gray-50 px-3.5 py-3 text-left transition-colors hover:bg-gray-100 active:bg-gray-100 dark:bg-white/3 dark:hover:bg-white/5 dark:active:bg-white/5"
        aria-expanded={expanded}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 dark:text-white/30",
            expanded && "rotate-90",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight text-gray-900 dark:text-white sm:text-[12px]">
            {mod.title}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/35 sm:text-[10px]">
            {doneCount}/{mod.topics.length} completed
          </p>
        </div>
      </button>

      {expanded && (
        <div className="divide-y divide-black/4 dark:divide-white/4">
          {mod.topics.map((topic) => {
            const done = completedIds.has(topic.id);
            const active = topic.id === activeTopic?.id;
            const ready = isTopicReady(topic);

            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => ready && onSelectTopic(topic)}
                disabled={!ready}
                className={cn(
                  "flex w-full min-h-[48px] items-center gap-3 border-l-2 px-4 py-3 text-left text-[13px] transition-all sm:min-h-0 sm:gap-2.5 sm:py-2.5 sm:text-[12px]",
                  active
                    ? "border-l-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-l-transparent hover:bg-gray-50 active:bg-gray-50 dark:hover:bg-white/3 dark:active:bg-white/3",
                  !ready && "cursor-not-allowed opacity-40",
                )}
              >
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 sm:h-3.5 sm:w-3.5" />
                  ) : !ready ? (
                    <Lock className="h-4 w-4 text-gray-300 dark:text-white/20 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <Circle
                      className={cn(
                        "h-4 w-4 sm:h-3.5 sm:w-3.5",
                        active
                          ? "text-indigo-500"
                          : "text-gray-300 dark:text-white/20",
                      )}
                    />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "leading-snug font-medium",
                      active
                        ? "text-indigo-700 dark:text-indigo-400"
                        : done
                          ? "text-gray-400 line-through dark:text-white/30"
                          : "text-gray-700 dark:text-white/70",
                    )}
                  >
                    {topic.title}
                  </p>
                  {topic.durationSeconds > 0 && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/30 sm:text-[10px]">
                      <Clock className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                      {formatDuration(topic.durationSeconds)}
                    </p>
                  )}
                </div>

                {active && (
                  <PlayCircle className="h-4 w-4 shrink-0 text-indigo-500 sm:h-3.5 sm:w-3.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Curriculum list (shared between mobile sheet & desktop sidebar) ─────────

function CurriculumList({
  modules,
  completedIds,
  activeTopic,
  onSelectTopic,
}: {
  modules: ModuleWithTopics[];
  completedIds: Set<string>;
  activeTopic: TopicWithRelations | null;
  onSelectTopic: (topic: TopicWithRelations) => void;
}) {
  return (
    <div className="space-y-2">
      {modules.map((mod) => (
        <ModuleItem
          key={mod.id}
          mod={mod}
          completedIds={completedIds}
          activeTopic={activeTopic}
          onSelectTopic={onSelectTopic}
        />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CourseWatchPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: enrollment, isLoading, error } = useEnrollment(enrollmentId);
  const { data: progressData } = useEnrollmentProgress(enrollmentId);
  const { mutate: sendHeartbeat } = useUpsertProgress();
  const { mutate: markComplete, isPending: isMarking } = useMarkTopicComplete();

  const [mobileCurriculumOpen, setMobileCurriculumOpen] = useState(false);

  const completedIds = useMemo(
    () =>
      new Set(
        progressData?.data?.records
          ?.filter((r) => r.completed)
          .map((r) => r.topicId) ?? [],
      ),
    [progressData],
  );

  const sortedModules = useMemo(
    () => {
      const modules = (
        enrollment?.course as unknown as
          | { modules?: ModuleWithTopics[] }
          | undefined
      )?.modules;
      return modules ? sortCurriculum(modules) : [];
    },
    [enrollment],
  );

  const allTopics = useMemo(
    () => sortedModules.flatMap((m) => m.topics),
    [sortedModules],
  );

  const readyTopics = useMemo(
    () => allTopics.filter(isTopicReady),
    [allTopics],
  );

  const activeTopic = useMemo((): TopicWithRelations | null => {
    if (!enrollment || allTopics.length === 0) return null;

    const fromQuery = searchParams.get("topic");
    if (fromQuery) {
      return allTopics.find((t) => t.id === fromQuery) ?? null;
    }

    return (
      allTopics.find((t) => !completedIds.has(t.id) && isTopicReady(t)) ??
      allTopics[0] ??
      null
    );
  }, [enrollment, searchParams, completedIds, allTopics]);

  const handleSelectTopic = useCallback(
    (topic: TopicWithRelations) => {
      router.replace(
        `/dashboard/courses/${enrollmentId}?topic=${topic.id}`,
        { scroll: false },
      );
      // Close mobile curriculum after selection
      setMobileCurriculumOpen(false);
    },
    [enrollmentId, router],
  );

  const goToNext = useCallback(() => {
    if (!activeTopic || readyTopics.length === 0) return;
    const idx = readyTopics.findIndex((t) => t.id === activeTopic.id);
    if (idx !== -1 && idx < readyTopics.length - 1) {
      handleSelectTopic(readyTopics[idx + 1]);
    }
  }, [activeTopic, readyTopics, handleSelectTopic]);

  // ── Watch-progress heartbeat ───────────────────────────────────────────────

  const lastHeartbeatRef = useRef(0);

  useEffect(() => {
    lastHeartbeatRef.current = 0;
  }, [activeTopic?.id]);

  const handleTimeUpdate = useCallback(
    (data: BunnyTimeUpdateData) => {
      if (!activeTopic || !data.duration) return;

      const now = Date.now();
      if (now - lastHeartbeatRef.current < PROGRESS_HEARTBEAT_MS) return;

      lastHeartbeatRef.current = now;
      sendHeartbeat({
        enrollmentId,
        topicId: activeTopic.id,
        watchedSeconds: Math.floor(data.seconds),
      });
    },
    [activeTopic, enrollmentId, sendHeartbeat],
  );

  const handleEnded = useCallback(() => {
    if (!activeTopic || completedIds.has(activeTopic.id)) return;

    markComplete(
      { enrollmentId, topicId: activeTopic.id },
      {
        onError: () =>
          toast.error("Couldn't save your progress for this lesson."),
      },
    );
  }, [activeTopic, completedIds, enrollmentId, markComplete]);

  const handleManualMarkComplete = useCallback(() => {
    if (!activeTopic || isMarking) return;

    markComplete(
      { enrollmentId, topicId: activeTopic.id },
      {
        onSuccess: goToNext,
        onError: () =>
          toast.error("Couldn't mark this lesson complete. Please try again."),
      },
    );
  }, [activeTopic, isMarking, enrollmentId, markComplete, goToNext]);

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <p className="text-center text-[13px] text-gray-600 dark:text-white/60">
          Could not load this course.
        </p>
        <Link
          href="/dashboard"
          className="text-[13px] text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const totalTopics = allTopics.length;
  const doneCount = completedIds.size;
  const progress =
    totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;

  const isLastTopic = activeTopic
    ? readyTopics[readyTopics.length - 1]?.id === activeTopic.id
    : false;
  const isDone = activeTopic ? completedIds.has(activeTopic.id) : false;

  return (
    <div className="mx-auto max-w-400 px-3 pb-8 pt-3 sm:px-4 sm:py-2">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-white text-gray-500 transition-colors hover:text-gray-900 active:bg-gray-50 dark:border-white/8 dark:bg-white/4 dark:text-white/50 dark:hover:text-white sm:h-8 sm:w-8 sm:rounded-[9px]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold leading-tight text-gray-900 dark:text-white sm:text-[14px]">
            {enrollment.course.title}
          </h1>
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/35 sm:text-[10px]">
            {doneCount}/{totalTopics} lessons · {progress}% complete
          </p>
        </div>

        {/* Desktop progress bar */}
        <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-gray-200 sm:block dark:bg-white/8">
          <div
            className="h-full rounded-full bg-indigo-600"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Mobile progress bar (full width under header) */}
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-gray-200 sm:hidden dark:bg-white/8">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 xl:h-[calc(100vh-8rem)] xl:flex-row xl:items-start">
        {/* Player + lesson info */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Player */}
          <div className="-mx-3 overflow-hidden sm:mx-0 sm:rounded-2xl">
            {activeTopic && isTopicReady(activeTopic) ? (
              <BunnyPlayer
                key={activeTopic.id}
                videoGuid={getVideoGuid(activeTopic)}
                playbackUrl={activeTopic.videoAsset?.providerData?.playbackIds?.[0] ?? ""}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-950 sm:rounded-2xl dark:bg-black">
                <p className="px-4 text-center text-[13px] text-gray-500 dark:text-white/30">
                  {activeTopic
                    ? "This lesson is not ready yet"
                    : "Select a lesson to begin"}
                </p>
              </div>
            )}
          </div>

          {/* Current lesson card */}
          {activeTopic && (
            <div className="rounded-2xl border border-black/6 bg-white p-4 dark:border-white/[0.07] dark:bg-white/4">
              <div className="mb-4">
                <h2 className="text-[16px] font-semibold leading-snug text-gray-900 dark:text-white sm:text-[15px]">
                  {activeTopic.title}
                </h2>
                {activeTopic.durationSeconds > 0 && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-white/35 sm:text-[11px]">
                    <Clock className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
                    {formatDuration(activeTopic.durationSeconds)}
                  </p>
                )}
              </div>

              {/* Actions — full width on mobile, inline on larger */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  {isDone ? (
                    <span className="flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-[13px] font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 sm:min-h-0 sm:flex-none sm:rounded-[9px] sm:px-3 sm:py-1.5 sm:text-[12px]">
                      <CheckCircle2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      Completed
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleManualMarkComplete}
                      disabled={isMarking}
                      className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-[13px] font-medium text-white transition-colors hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 sm:min-h-0 sm:flex-none sm:rounded-[9px] sm:px-3 sm:py-1.5 sm:text-[12px]"
                    >
                      {isMarking ? (
                        <Loader2 className="h-4 w-4 animate-spin sm:h-3.5 sm:w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                      )}
                      Mark complete
                    </button>
                  )}

                  {!isLastTopic && (
                    <button
                      type="button"
                      onClick={goToNext}
                      className="flex min-h-[44px] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-[13px] font-medium text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800 sm:min-h-0 sm:flex-none sm:rounded-[9px] sm:px-3 sm:py-1.5 sm:text-[12px]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress (mobile already has header bar; keep subtle here) */}
              <div className="mt-4 border-t border-black/5 pt-3 dark:border-white/6">
                <div className="mb-1.5 flex justify-between text-[11px] text-gray-400 dark:text-white/35 sm:text-[10px]">
                  <span>Course progress</span>
                  <span className="font-medium text-gray-600 dark:text-white/60">
                    {progress}%
                  </span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/8 sm:h-0.75">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Mobile curriculum (collapsible) ──────────────────────────── */}
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setMobileCurriculumOpen((v) => !v)}
              className="flex w-full min-h-[48px] items-center justify-between rounded-2xl border border-black/6 bg-white px-4 py-3 text-left dark:border-white/[0.07] dark:bg-white/4"
              aria-expanded={mobileCurriculumOpen}
            >
              <div className="flex items-center gap-2.5">
                <List className="h-4 w-4 text-gray-400 dark:text-white/40" />
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 dark:text-white">
                    Course content
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-white/35">
                    {doneCount}/{totalTopics} lessons completed
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-gray-400 transition-transform duration-200 dark:text-white/40",
                  mobileCurriculumOpen && "rotate-180",
                )}
              />
            </button>

            {mobileCurriculumOpen && (
              <div className="mt-2 space-y-2">
                <CurriculumList
                  modules={sortedModules}
                  completedIds={completedIds}
                  activeTopic={activeTopic}
                  onSelectTopic={handleSelectTopic}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Desktop sidebar (scrollable only) ──────────────────────────── */}
        <div className="hidden w-72 shrink-0 flex-col xl:flex xl:h-full">
          <h3 className="mb-2 shrink-0 px-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
            Course content
          </h3>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            <CurriculumList
              modules={sortedModules}
              completedIds={completedIds}
              activeTopic={activeTopic}
              onSelectTopic={handleSelectTopic}
            />
          </div>
        </div>
      </div>
    </div>
  );
}