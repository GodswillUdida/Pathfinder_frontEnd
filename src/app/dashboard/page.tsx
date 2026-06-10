"use client";

import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks/use-enrollments";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen, Clock, Trophy, ArrowRight,
  PlayCircle, Loader2, AlertCircle, Flame,
  Zap,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import type { Enrollment } from "@/types/dashboard";

// ─── Pure helpers (no hooks) ─────────────────────────────────────────────────

function getProgress(e: Enrollment): number {
  const total = e.course.modules.flatMap((m) => m.topics).length;
  if (!total) return 0;
  const done = (e.progressRecords ?? []).filter((p) => p.completed).length;
  return Math.round((done / total) * 100);
}

function getTotalTopics(e: Enrollment): number {
  return e.course.modules.flatMap((m) => m.topics).length;
}

function getCompletedTopics(e: Enrollment): number {
  return (e.progressRecords ?? []).filter((p) => p.completed).length;
}

function getNextTopic(e: Enrollment) {
  const doneIds = new Set(
    (e.progressRecords ?? []).filter((p) => p.completed).map((p) => p.topicId)
  );
  for (const mod of e.course.modules) {
    for (const topic of mod.topics) {
      if (!doneIds.has(topic.id)) return topic;
    }
  }
  return null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Hero continue card ───────────────────────────────────────────────────────

function ContinueLearningCard({ enrollment }: { enrollment: Enrollment }) {
  const progress  = getProgress(enrollment);
  const total     = getTotalTopics(enrollment);
  const completed = getCompletedTopics(enrollment);
  const nextTopic = getNextTopic(enrollment);

  return (
    <div className="flex items-center gap-4 bg-indigo-600 rounded-2xl p-5">
      {/* Thumbnail */}
      <div className="w-[68px] h-[68px] rounded-xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden relative">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover"
          />
        ) : (
          <BookOpen className="w-7 h-7 text-white/70" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-indigo-200 mb-1">
          Pick up where you left off
        </p>
        <p className="text-[13px] font-semibold text-white leading-snug truncate mb-2">
          {enrollment.course.title}
        </p>

        {/* Progress bar */}
        <div className="h-[3px] bg-white/20 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-white/85 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-indigo-200">
            {progress}% · {completed}/{total} lessons
          </span>
          <Link
            href={`/dashboard/courses/${enrollment.id}${nextTopic ? `?topic=${nextTopic.id}` : ""}`}
            className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-white px-3 py-1 rounded-full hover:bg-indigo-50 transition-colors"
          >
            <PlayCircle className="w-3 h-3" />
            Resume
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.06]">
      <div className={`w-[34px] h-[34px] rounded-[9px] flex items-center justify-center mb-3 ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-[26px] font-bold text-gray-900 dark:text-white leading-none tracking-tight mb-0.5">
        {value}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-white/40">{label}</p>
    </div>
  );
}

// ─── Enrollment card ──────────────────────────────────────────────────────────

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const progress  = getProgress(enrollment);
  const total     = getTotalTopics(enrollment);
  const completed = getCompletedTopics(enrollment);
  const nextTopic = getNextTopic(enrollment);
  const expired   = isPast(new Date(enrollment.expiresAt));

  const ctaLabel =
    progress === 0 ? "Start learning" : progress === 100 ? "Review course" : "Continue";
  const ctaHref  = `/dashboard/courses/${enrollment.id}${nextTopic ? `?topic=${nextTopic.id}` : ""}`;

  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.06] overflow-hidden flex flex-col hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-300 dark:text-white/20" />
          </div>
        )}

        {/* Status badges */}
        {progress === 100 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[9px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
            <Trophy className="w-2.5 h-2.5" />
            Completed
          </div>
        )}
        {expired && (
          <div className="absolute top-2.5 right-2.5 text-[9px] font-semibold text-red-800 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
            Expired
          </div>
        )}

        {/* Progress overlay badge */}
        {progress > 0 && progress < 100 && (
          <div className="absolute top-2.5 right-2.5 text-[9px] font-semibold text-indigo-800 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full">
            {progress}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3">
          {enrollment.course.title}
        </h3>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/35 mb-1">
            <span>{completed}/{total} lessons</span>
            <span className="font-medium text-gray-600 dark:text-white/60">{progress}%</span>
          </div>
          <div className="h-[3px] bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expiry */}
        <p className="text-[10px] text-gray-400 dark:text-white/35 flex items-center gap-1 mb-3">
          <Clock className="w-3 h-3" />
          {expired
            ? "Access expired"
            : `Expires ${formatDistanceToNow(new Date(enrollment.expiresAt), { addSuffix: true })}`}
        </p>

        {/* CTA */}
        <Link
          href={ctaHref}
          className="mt-auto flex items-center justify-center gap-1.5 py-2.5 rounded-xl
                     bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium
                     transition-colors active:scale-[0.98]"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: enrollmentsData, isLoading, error } = useEnrollments();

  // Derive stats
  const activeCount    = enrollmentsData?.filter((e) => !isPast(new Date(e.expiresAt))).length;
  const completedCount = enrollmentsData?.filter((e) => getProgress(e) === 100).length;
  const certCount      = enrollmentsData?.filter((e) => e.certificate).length;

  // Find the most-recently-active incomplete enrollment for the hero card
  const heroEnrollment = enrollmentsData?.find(
    (e) => !isPast(new Date(e.expiresAt)) && getProgress(e) > 0 && getProgress(e) < 100
  ) ?? null;

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-sm text-gray-500">
        Please sign in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-5">

      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="flex text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            {getGreeting()}, {user.name?.split(" ")[0] ?? "Student"} 👋
            {/* <div className="animate-shake">👋</div> */}
          </h1>
          <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">
            Here's what's happening with your learning today.
          </p>
        </div>

        {/* Streak badge */}
        {/* <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-full">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">0-day streak</span>
        </div> */}
      </div>

      {/* ── Stats ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={BookOpen}    label="Active courses" value={activeCount!}    iconBg="bg-indigo-50 dark:bg-indigo-500/10"  iconColor="text-indigo-600 dark:text-indigo-400" />
        <StatCard icon={Trophy}      label="Completed"      value={completedCount!} iconBg="bg-emerald-50 dark:bg-emerald-500/10" iconColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard icon={Zap}         label="Certificates"   value={certCount!}      iconBg="bg-amber-50 dark:bg-amber-500/10"    iconColor="text-amber-600 dark:text-amber-400" />
      </div>

      {/* ── Continue learning hero ───────────────────── */}
      {heroEnrollment && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">Continue learning</h2>
          </div>
          <ContinueLearningCard enrollment={heroEnrollment} />
        </section>
      )}

      {/* ── Enrollments grid ─────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">My courses</h2>
          <Link
            href="/dashboard/courses"
            className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Failed to load courses. Please refresh.
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && enrollmentsData?.length === 0 && (
          <div className="flex flex-col items-center py-14 bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-gray-400 dark:text-white/30" />
            </div>
            <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">No courses yet</p>
            <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1 mb-4">Your enrolled courses will appear here.</p>
            <Link
              href="/courses"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors"
            >
              Browse courses
            </Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && !error && enrollmentsData!.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrollmentsData?.slice(0, 6).map((e) => (
              <EnrollmentCard key={e.id} enrollment={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}