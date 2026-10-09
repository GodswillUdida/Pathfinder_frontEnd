"use client";

import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks/use-enrollments";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Clock,
  Trophy,
  ArrowRight,
  PlayCircle,
  Loader2,
  AlertCircle,
  Flame,
  Zap,
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import type {
  EnrollmentListItem,
} from "@/types/domain";


// ─── Pure helpers ────────────────────────────────────────────────────────────

function isExpired(e: EnrollmentListItem): boolean {
  if (e.expiresAt === null) return false; // lifetime access
  return isPast(new Date(e.expiresAt));
}

function isCompleted(e: EnrollmentListItem): boolean {
  return e.progressPercentage === 100 || e.completedAt !== null;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatExpiry(e: EnrollmentListItem): string {
  if (e.expiresAt === null) return "Lifetime access";
  if (isExpired(e)) return "Access expired";
  return `Expires ${formatDistanceToNow(new Date(e.expiresAt), { addSuffix: true })}`;
}

// ─── Hero continue card ──────────────────────────────────────────────────────

function ContinueLearningCard({ enrollment }: { enrollment: EnrollmentListItem }) {
  const progress = enrollment.progressPercentage;

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-indigo-600 p-5">
      <div className="relative flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-white/15">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover"
            sizes="68px"
          />
        ) : (
          <BookOpen className="h-7 w-7 text-white/70" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-widest text-indigo-200">
          Pick up where you left off
        </p>
        <p className="mb-2 truncate text-[13px] font-semibold leading-snug text-white">
          {enrollment.course.title}
        </p>

        <div className="mb-1.5 h-0.75 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white/85 transition-all duration-700"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-indigo-200">{progress}% complete</span>
          <Link
            href={`/dashboard/courses/${enrollment.id}`}
            className="flex items-center gap-1 rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
          >
            <PlayCircle className="h-3 w-3" />
            Resume
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-black/6 bg-white p-4 dark:border-white/6 dark:bg-white/4">
      <div
        className={`mb-3 flex h-7 w-5 items-center justify-center rounded-[9px] ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className="mb-0.5 text-[20px] font-bold leading-none tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-white/40">{label}</p>
    </div>
  );
}

// ─── Enrollment card ─────────────────────────────────────────────────────────

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentListItem }) {
  const progress = enrollment.progressPercentage;
  const expired = isExpired(enrollment);

  const ctaLabel =
    progress === 0
      ? "Start learning"
      : progress === 100
        ? "Review course"
        : "Continue";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-black/6 bg-white transition-all duration-200 hover:border-indigo-300 dark:border-white/6 dark:bg-white/4 dark:hover:border-indigo-500/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-white/5">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-gray-300 dark:text-white/20" />
          </div>
        )}

        {progress === 100 && (
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-800">
            <Trophy className="h-2.5 w-2.5" />
            Completed
          </div>
        )}

        {expired && (
          <div className="absolute right-2.5 top-2.5 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-800">
            Expired
          </div>
        )}

        {progress > 0 && progress < 100 && !expired && (
          <div className="absolute right-2.5 top-2.5 rounded-full border border-indigo-200 bg-indigo-100 px-2 py-0.5 text-[9px] font-semibold text-indigo-800">
            {progress}%
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-3 line-clamp-2 text-[13px] font-semibold leading-snug text-gray-900 dark:text-white">
          {enrollment.course.title}
        </h3>

        {/* Progress */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-[10px] text-gray-400 dark:text-white/35">
            <span>Progress</span>
            <span className="font-medium text-gray-600 dark:text-white/60">
              {progress}%
            </span>
          </div>
          <div className="h-0.75 overflow-hidden rounded-full bg-gray-100 dark:bg-white/8">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expiry */}
        <p className="mb-3 flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/35">
          <Clock className="h-3 w-3" />
          {formatExpiry(enrollment)}
        </p>

        {/* CTA */}
        <Link
          href={`/dashboard/courses/${enrollment.id}`}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-[12px] font-medium text-white transition-colors hover:bg-indigo-700 active:scale-[0.98]"
        >
          <PlayCircle className="h-3.5 w-3.5" />
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function StudentDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: enrollmentsData, isLoading, error } = useEnrollments();

  // Typed as the slim list shape
  const enrollments = (enrollmentsData ?? []) as unknown as EnrollmentListItem[];

  const activeCount = enrollments.filter((e) => !isExpired(e)).length;
  const completedCount = enrollments.filter(isCompleted).length;
  const certCount = enrollments.filter((e) => e.certificate).length;

  const heroEnrollment =
    enrollments.find(
      (e) =>
        !isExpired(e) &&
        e.progressPercentage > 0 &&
        e.progressPercentage < 100,
    ) ?? null;

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        Please sign in to view your dashboard.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-md flex font-bold tracking-tight text-gray-900 dark:text-white">
            {getGreeting()}, {user.name?.split(" ")[0] ?? "Student"} 👋
          </h1>
          <p className="mt-1 text-[11px] text-gray-400 dark:text-white/40">
            Here&apos;s what&apos;s happening with your learning today.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 dark:border-orange-500/20 dark:bg-orange-500/10">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400">
            0-day streak
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={BookOpen}
          label="Active courses"
          value={activeCount}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={Trophy}
          label="Completed"
          value={completedCount}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Zap}
          label="Certificates"
          value={certCount}
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Continue learning */}
      {heroEnrollment && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">
              Continue learning
            </h2>
          </div>
          <ContinueLearningCard enrollment={heroEnrollment} />
        </section>
      )}

      {/* My courses */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-gray-900 dark:text-white">
            My courses
          </h2>
          <Link
            href="/dashboard/courses"
            className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 transition-colors hover:text-indigo-700"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-[12px] text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Failed to load courses. Please refresh.
          </div>
        )}

        {!isLoading && !error && enrollments.length === 0 && (
          <div className="flex flex-col items-center rounded-2xl border border-black/6 bg-white py-14 dark:border-white/6 dark:bg-white/4">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/6">
              <BookOpen className="h-6 w-6 text-gray-400 dark:text-white/30" />
            </div>
            <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">
              No courses yet
            </p>
            <p className="mb-4 mt-1 text-[11px] text-gray-400 dark:text-white/35">
              Your enrolled courses will appear here.
            </p>
            <Link
              href="/courses"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Browse courses
            </Link>
          </div>
        )}

        {!isLoading && !error && enrollments.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.slice(0, 6).map((e) => (
              <EnrollmentCard key={e.id} enrollment={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}