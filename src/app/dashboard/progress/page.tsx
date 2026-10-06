"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Zap,
  Clock,
  Flame,
  CheckCircle2,
  Trophy,
  BookOpen,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEnrollments } from "@/hooks/use-enrollments";
import { useCertificate } from "@/hooks/useProgress";
import type {
  EnrollmentListItem,
} from "@/types/domain";


// ─── Helpers ─────────────────────────────────────────────────────────────────

function isCompleted(e: EnrollmentListItem): boolean {
  return e.progressPercentage === 100 || e.completedAt !== null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-black/6 bg-white p-4 dark:border-white/[0.07] dark:bg-white-4">
      <div
        className={cn(
          "mb-3 flex h-8 w-8 items-center justify-center rounded-[9px]",
          iconBg,
        )}
      >
        <Icon className={cn("h-4 w-4", iconColor)} aria-hidden />
      </div>
      <p className="mb-0.5 text-[24px] font-bold leading-none tracking-tight text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-white/35">{label}</p>
    </div>
  );
}

function ActivityChart() {
  // Static placeholder until a real weekly-activity endpoint exists
  const WEEKLY_ACTIVITY = [
    { day: "M", lessons: 2 },
    { day: "T", lessons: 4 },
    { day: "W", lessons: 1 },
    { day: "T", lessons: 5 },
    { day: "F", lessons: 6 },
    { day: "S", lessons: 2 },
    { day: "S", lessons: 1 },
  ];

  const max = Math.max(...WEEKLY_ACTIVITY.map((d) => d.lessons), 1);

  return (
    <div
      className="flex h-16 items-end gap-2"
      role="img"
      aria-label="Weekly activity bar chart"
    >
      {WEEKLY_ACTIVITY.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div
            className="w-full rounded-lg bg-indigo-600"
            style={{
              height: `${Math.round((d.lessons / max) * 52)}px`,
              opacity: d.lessons === max ? 1 : 0.3 + (d.lessons / max) * 0.5,
            }}
          />
          <span className="text-[9px] text-gray-400 dark:text-white/30">
            {d.day}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Certificates ────────────────────────────────────────────────────────────

function CertificateItem({
  enrollmentId,
  courseTitle,
}: {
  enrollmentId: string;
  courseTitle: string;
}) {
  const { data: certificate, isLoading } = useCertificate(enrollmentId);

  const handleDownload = () => {
    if (certificate?.url) {
      window.open(certificate.url, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/[0.05] p-2.5 dark:border-white/[0.06]">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-amber-50 dark:bg-amber-500/10">
        <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium text-gray-900 dark:text-white">
          {courseTitle}
        </p>
        <p className="text-[10px] text-gray-400 dark:text-white/35">
          Verified certificate
        </p>
      </div>
      <button
        onClick={handleDownload}
        disabled={isLoading || !certificate?.url}
        aria-label={`Download certificate for ${courseTitle}`}
        className="flex h-7 w-7 items-center justify-center rounded-[7px] text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 dark:hover:bg-white/[0.07] dark:hover:text-white"
      >
        <Download className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CertificatesSection({
  enrollments,
}: {
  enrollments: EnrollmentListItem[];
}) {
  const withCerts = enrollments.filter((e) => e.certificate);

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.07] dark:bg-white/[0.04]">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
          Certificates earned
        </p>
        <Link
          href="/dashboard/certificates"
          className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400"
        >
          View all
        </Link>
      </div>

      {withCerts.length === 0 ? (
        <div className="flex flex-col items-center py-6">
          <Trophy className="mb-2 h-8 w-8 text-gray-300 dark:text-white/20" />
          <p className="text-[12px] text-gray-500 dark:text-white/40">
            No certificates yet
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/30">
            Complete a course to earn one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {withCerts.map((e) => (
            <CertificateItem
              key={e.id}
              enrollmentId={e.id}
              courseTitle={e.course.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProgressPage() {
  const { data: enrollmentsData, isLoading } = useEnrollments();

  const enrollments = useMemo(
    () => (enrollmentsData ?? []) as unknown as EnrollmentListItem[],
    [enrollmentsData],
  );

  const completedCourses = useMemo(
    () => enrollments.filter(isCompleted),
    [enrollments],
  );

  // These stats are placeholders until you have a real progress-summary endpoint.
  // Do NOT try to derive lesson counts from the list payload.
  const stats = {
    xp: 0,
    hours: 0,
    streak: 0,
    lessonsDone: completedCourses.length, // safest available proxy for now
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          My progress
        </h1>
        <p className="mt-1 text-[12px] text-gray-400 dark:text-white/40">
          Tracking your learning journey
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={Zap}
          label="Total XP earned"
          value={stats.xp}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={Clock}
          label="Time learning"
          value={`${stats.hours}h`}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Flame}
          label="Day streak"
          value={stats.streak}
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Courses completed"
          value={stats.lessonsDone}
          iconBg="bg-purple-50 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Activity + Skills */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.07] dark:bg-white/[0.04]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
            This week&apos;s activity
          </p>
          <ActivityChart />
        </div>

        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.07] dark:bg-white/[0.04]">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
            Skills breakdown
          </p>
          <div className="py-8 text-center text-sm text-gray-400 dark:text-white/40">
            Skills insights coming soon…
          </div>
        </div>
      </div>

      {/* Certificates + Streak */}
      <div className="grid gap-4 sm:grid-cols-2">
        <CertificatesSection enrollments={enrollments} />

        <div className="rounded-2xl border border-black/[0.06] bg-white p-4 dark:border-white/[0.07] dark:bg-white/[0.04]">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
              Streak — last 28 days
            </p>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
              <Flame className="h-3.5 w-3.5" aria-hidden />
              {stats.streak}-day streak
            </div>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-white/50">
            Keep it going! Consistency is key.
          </p>
        </div>
      </div>

      {/* Course progress list */}
      {enrollments.length > 0 && (
        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
            Course progress
          </h2>
          <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white dark:border-white/[0.07] dark:bg-white/[0.04]">
            {enrollments.map((e, i) => {
              const pct = e.progressPercentage;
              const done = isCompleted(e);

              return (
                <div
                  key={e.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    i !== 0 &&
                      "border-t border-black/[0.04] dark:border-white/[0.04]",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px]",
                      done
                        ? "bg-emerald-50 dark:bg-emerald-500/10"
                        : "bg-indigo-50 dark:bg-indigo-500/10",
                    )}
                  >
                    {done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-gray-900 dark:text-white">
                      {e.course.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.08]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            done ? "bg-emerald-500" : "bg-indigo-600",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-[11px] font-semibold text-gray-600 dark:text-white/60">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isLoading && (
        <p className="text-center text-sm text-gray-500">
          Loading your progress…
        </p>
      )}
    </div>
  );
}