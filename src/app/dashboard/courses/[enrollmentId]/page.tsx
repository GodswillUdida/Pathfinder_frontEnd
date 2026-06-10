"use client";

import {
  useState, useEffect, useCallback, memo, useRef,
  useMemo,
} from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEnrollment } from "@/hooks/use-enrollments";
import type { Topic, Module } from "@/types/dashboard";
import {
  CheckCircle2, Circle, ChevronDown, ChevronRight,
  Loader2, AlertCircle, ArrowLeft, Lock,
  PlayCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEnrollmentProgress, useMarkTopicComplete } from "@/hooks/useProgress";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds?: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Bunny video player ───────────────────────────────────────────────────────

interface BunnyPlayerProps {
  videoGuid: string;
  libraryId?: string;
  autoplay?: boolean;
  className?: string;
}

const BunnyPlayer = memo(function BunnyPlayer({
  videoGuid,
  libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!,
  autoplay = false,
  className = "",
}: BunnyPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const embedUrl = `https://player.mediadelivery.net/embed/${libraryId}/${videoGuid}?autoplay=${autoplay}&preload=true&responsive=true`;
  console.log(embedUrl);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [videoGuid]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => setIsLoading(false);
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, [embedUrl]);

  if (!videoGuid) {
    return (
      <div className="aspect-video bg-gray-950 rounded-2xl flex items-center justify-center">
        <p className="text-[12px] text-gray-500">No video available</p>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-black rounded-2xl overflow-hidden aspect-video", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/70">
          <Loader2 className="w-8 h-8 animate-spin text-white/50" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/90">
          <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-[12px] text-white/60">Failed to load video</p>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onError={() => setHasError(true)}
        loading="lazy"
        title="Course video"
      />
    </div>
  );
});

// ─── Module accordion item ────────────────────────────────────────────────────

interface ModuleItemProps {
  mod: Module;
  completedIds: Set<string>;
  activeTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
}

function ModuleItem({ mod, completedIds, activeTopic, onSelectTopic }: ModuleItemProps) {
  const [isOpen, setIsOpen] = useState(
    mod.topics.some((t) => t.id === activeTopic?.id)
  );

  // Auto-open when active topic belongs to this module
  useEffect(() => {
    if (mod.topics.some((t) => t.id === activeTopic?.id)) setIsOpen(true);
  }, [activeTopic, mod.topics]);

  const doneCount = mod.topics.filter((t) => completedIds.has(t.id)).length;

  return (
    <div className="border border-black/[0.06] dark:border-white/[0.07] rounded-xl overflow-hidden">
      {/* Module header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors text-left"
        aria-expanded={isOpen}
      >
        <ChevronRight
          className={cn(
            "w-3.5 h-3.5 text-gray-400 dark:text-white/30 shrink-0 transition-transform duration-200",
            isOpen && "rotate-90"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-gray-900 dark:text-white truncate leading-tight">
            {mod.title}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-white/35 mt-0.5">
            {doneCount}/{mod.topics.length} completed
          </p>
        </div>
      </button>

      {/* Topics */}
      {isOpen && (
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
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
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all text-[12px]",
                  "border-l-2",
                  active
                    ? "bg-indigo-50 dark:bg-indigo-500/[0.1] border-l-indigo-500"
                    : "hover:bg-gray-50 dark:hover:bg-white/[0.03] border-l-transparent",
                  !ready && "opacity-40 cursor-not-allowed"
                )}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  ) : !ready ? (
                    <Lock className="w-3.5 h-3.5 text-gray-300 dark:text-white/20" />
                  ) : (
                    <Circle
                      className={cn(
                        "w-3.5 h-3.5",
                        active ? "text-indigo-500" : "text-gray-300 dark:text-white/20"
                      )}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "font-medium truncate leading-tight",
                      active ? "text-indigo-700 dark:text-indigo-400"
                        : done ? "text-gray-400 dark:text-white/30 line-through"
                          : "text-gray-700 dark:text-white/70"
                    )}
                  >
                    {topic.title}
                  </p>
                  {topic.durationSeconds && (
                    <p className="text-[10px] text-gray-400 dark:text-white/30 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDuration(topic.durationSeconds)}
                    </p>
                  )}
                </div>

                {active && <PlayCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CourseWatchPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: enrollment, isLoading, error } = useEnrollment(enrollmentId);
  const { data: progressData } = useEnrollmentProgress(enrollmentId as string);
  const { mutateAsync, isPending } = useMarkTopicComplete();

  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [markingDone, setMarkingDone] = useState(false);

  // Use fresh progress data from dedicated endpoint
  const completedIds = new Set(
    (progressData?.topics ?? []).filter((t) => t.completed).map((t) => t.topicId)
  );

  // Set initial topic from URL or first available
  useEffect(() => {
    if (!enrollment) return;
    const allTopics = enrollment.course.modules.flatMap((m) => m.topics);
    const fromQuery = searchParams.get("topic");

    const target = fromQuery
      ? allTopics.find((t) => t.id === fromQuery)
      : allTopics.find((t) => !completedIds.has(t.id) && t.videoStatus === "ready") ??
      allTopics[0];

    if (target) setActiveTopic(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollment, searchParams, completedIds]);

  const handleSelectTopic = useCallback(
    (topic: Topic) => {
      setActiveTopic(topic);
      router.replace(`/dashboard/courses/${enrollmentId}?topic=${topic.id}`, { scroll: false });
    },
    [enrollmentId, router]
  );

  const markComplete = async () => {
    if (!activeTopic || isPending) return;
    // setMarkingDone(true);
    try {
      await mutateAsync({
        enrollmentId: enrollmentId as string,
        topicId: activeTopic.id,
      });

      goToNext();
      // await apiClient.post("/progress", { enrollmentId, topicId: activeTopic.id });
      // router.refresh();
    } catch (err) {
      console.error("Mark complete failed", err);
      toast.error("Mark Complete failed.")
    }
    // finally {
    //   setMarkingDone(false);
    // }
  };

  const readyTopics = useMemo(() => {
    return enrollment?.course.modules
      .flatMap((m) => m.topics)
      .filter((t) => t.videoStatus === "ready") ?? [];
  }, [enrollment]);

  const goToNext = useCallback(() => {
    if (!activeTopic || readyTopics.length === 0) return;

    const idx = readyTopics.findIndex((t) => t.id === activeTopic.id);

    if (idx !== -1 && idx < readyTopics.length - 1) {
      handleSelectTopic(readyTopics[idx + 1]);
    }
  }, [activeTopic, readyTopics, handleSelectTopic]);

  // const goToNext = useCallback(() => {
  //   if (!enrollment || !activeTopic) return;
  //   const readyTopics = enrollment.course.modules
  //     .flatMap((m) => m.topics)
  //     .filter((t) => t.videoStatus === "ready");
  //   const idx = readyTopics.findIndex((t) => t.id === activeTopic.id);
  //   if (idx < readyTopics.length - 1) handleSelectTopic(readyTopics[idx + 1]);
  // }, [enrollment, activeTopic, handleSelectTopic]);

  // ── Loading / Error ─────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-[13px] text-gray-600 dark:text-white/60">Could not load this course.</p>
        <Link href="/dashboard" className="text-[12px] text-indigo-600 hover:text-indigo-700 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  // ── Derived values ──────────────────────────────

  const allTopics = enrollment?.course.modules.flatMap((m) => m.topics) ?? [];
  // const readyTopics = allTopics.filter((t) => t.videoStatus === "ready");
  const totalTopics = allTopics.length;
  const doneCount = completedIds.size;
  const progress = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
  const isLastTopic = activeTopic
    ? allTopics.filter((t) => t.videoStatus === "ready").slice(-1)[0]?.id === activeTopic.id
    : false;
  // const isLastTopic = readyTopics.findIndex((t) => t.id === activeTopic?.id) === readyTopics.length - 0;
  const isDone = activeTopic ? completedIds.has(activeTopic.id) : false;

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-5">

      {/* ── Back bar ──────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/dashboard"
          className="w-8 h-8 rounded-[9px] border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-white/[0.04] flex items-center justify-center text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[14px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
            {enrollment.course.title}
          </h1>
          <p className="text-[10px] text-gray-400 dark:text-white/35 mt-0.5">
            {doneCount}/{totalTopics} lessons · {progress}% complete
          </p>
        </div>
        {/* Overall progress mini bar */}
        <div className="hidden sm:block w-24 h-[3px] bg-gray-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* ── Two-pane layout ───────────────────────── */}
      <div className="flex flex-col xl:flex-row gap-4 items-start">

        {/* ── Player + info pane ────────────────── */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Video */}
          {activeTopic ? (
            <BunnyPlayer videoGuid={activeTopic.bunnyVideoId ?? ""} />
          ) : (
            <div className="aspect-video bg-gray-950 dark:bg-black rounded-2xl flex items-center justify-center">
              <p className="text-[12px] text-gray-500 dark:text-white/30">Select a lesson to begin</p>
            </div>
          )}

          {/* Topic info panel */}
          {activeTopic && (
            <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug">
                    {activeTopic.title}
                  </h2>
                  {activeTopic.durationSeconds && (
                    <p className="text-[11px] text-gray-400 dark:text-white/35 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(activeTopic.durationSeconds)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isDone ? (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={markComplete}
                      disabled={markingDone}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-medium transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {markingDone ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Mark complete
                    </button>
                  )}

                  {!isLastTopic && (
                    <button
                      onClick={goToNext}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors cursor-pointer"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Overall progress */}
              <div className="pt-3 border-t border-black/[0.05] dark:border-white/[0.06]">
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/35 mb-1">
                  <span>Course progress</span>
                  <span className="font-medium text-gray-600 dark:text-white/60">{progress}%</span>
                </div>
                <div className="h-[3px] bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-700"
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
        </div>

        {/* ── Curriculum sidebar ────────────────── */}
        <div className="xl:w-72 shrink-0 space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35 mb-2 px-0.5">
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