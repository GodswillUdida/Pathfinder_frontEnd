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
import { useAuth } from "@/context/AuthContext";
import { useEnrollments } from "@/hooks/use-enrollments";
import {
  useProgressSummary,
  useEnrollmentProgress,
  useCertificate,
} from "@/hooks/useProgress"; // Adjust path if needed
import type { Enrollment } from "@/types/dashboard";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getProgress(e: Enrollment): number {
  const total = e.course.modules.flatMap((m) => m.topics).length;
  if (!total) return 0;
  const done = (e.progressRecords ?? []).filter((p) => p.completed).length;
  return Math.round((done / total) * 100);
}

function getTotalCompleted(e: Enrollment): number {
  return (e.progressRecords ?? []).filter((p) => p.completed).length;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.07]">
      <div className={cn("w-8 h-8 rounded-[9px] flex items-center justify-center mb-3", iconBg)}>
        <Icon className={cn("w-4 h-4", iconColor)} aria-hidden="true" />
      </div>
      <p className="text-[24px] font-bold text-gray-900 dark:text-white leading-none tracking-tight mb-0.5">
        {value}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-white/35">{label}</p>
    </div>
  );
}

// Activity Chart (kept static for now — can be replaced with real weekly data later)
function ActivityChart() {
  const WEEKLY_ACTIVITY = [
    { day: "M", lessons: 2 },
    { day: "T", lessons: 4 },
    { day: "W", lessons: 1 },
    { day: "T", lessons: 5 },
    { day: "F", lessons: 6 },
    { day: "S", lessons: 2 },
    { day: "S", lessons: 1 },
  ];

  const max = Math.max(...WEEKLY_ACTIVITY.map((d) => d.lessons));

  return (
    <div className="flex gap-2 items-end h-16" role="img" aria-label="Weekly activity bar chart">
      {WEEKLY_ACTIVITY.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-[4px] bg-indigo-600"
            style={{
              height: `${Math.round((d.lessons / max) * 52)}px`,
              opacity: d.lessons === max ? 1 : 0.3 + (d.lessons / max) * 0.5,
            }}
          />
          <span className="text-[9px] text-gray-400 dark:text-white/30">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function StreakCalendar({ streakDays = 5 }: { streakDays?: number }) {
  // You can enhance this with real 28-day data from backend later
  return (
    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
      <Flame className="w-3.5 h-3.5" aria-hidden="true" />
      {streakDays}-day streak
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProgressPage() {
  //   const { user } = useAuth();
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments();
  //   const { data: progressSummary, isLoading: summaryLoading } = useProgressSummary();

  const enrollments: Enrollment[] = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : [];

  // console.log("Enrollments: ", enrollments)

  const totalCompleted = useMemo(
    () => enrollments.reduce((sum, e) => sum + getTotalCompleted(e), 0),
    [enrollments]
  );

  const completedCourses = enrollments.filter((e) => getProgress(e) === 100);
  console.log("Completed Courses: ", completedCourses);

  // Stats from real summary (fallback to calculated values)
  //   const xp = progressSummary?.xp ?? 0;
  //   const streak = progressSummary?.streak ?? 0;
  //   const totalHours = Math.floor((progressSummary?.timeSpentMinutes ?? totalCompleted * 15) / 60);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">My progress</h1>
        <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">Tracking your learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Zap}
          label="Total XP earned"
          value={10}
          iconBg="bg-indigo-50 dark:bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          icon={Clock}
          label="Time learning"
          value={`${4}h`}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={Flame}
          label="Day streak"
          value={5}
          iconBg="bg-amber-50 dark:bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
        />
        <StatCard
          icon={CheckCircle2}
          label="Lessons done"
          value={totalCompleted}
          iconBg="bg-purple-50 dark:bg-purple-500/10"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Activity + Skills */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Weekly activity */}
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.07]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35 mb-4">
            This week's activity
          </p>
          <ActivityChart />
        </div>

        {/* Skills breakdown — keep mock for now or extend summary API */}
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.07]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35 mb-4">
            Skills breakdown
          </p>
          <div className="text-center py-8 text-gray-400 dark:text-white/40 text-sm">
            Skills insights coming soon...
          </div>
        </div>
      </div>

      {/* Certificates + Streak */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Certificates */}
        <CertificatesSection enrollments={enrollments} />

        {/* Streak */}
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.07]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
              Streak — last 28 days
            </p>
            <StreakCalendar streakDays={10} />
          </div>
          <div className="text-[13px] text-gray-500 dark:text-white/50">
            Keep it going! Consistency is key.
          </div>
        </div>
      </div>

      {/* Course progress list */}
      {enrollments.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35 mb-3">
            Course progress
          </h2>
          <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] overflow-hidden">
            {enrollments.map((e, i) => {
              const pct = getProgress(e);
              const completed = getTotalCompleted(e);
              const total = e.course.modules.flatMap((m) => m.topics).length;
              const isDone = pct === 100;

              return (
                <div
                  key={e.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    i !== 0 && "border-t border-black/[0.04] dark:border-white/[0.04]"
                  )}
                >
                  <div
                    className={cn(
                      "w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0",
                      isDone ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-indigo-50 dark:bg-indigo-500/10"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-gray-900 dark:text-white truncate">
                      {e.course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-[3px] bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", isDone ? "bg-emerald-500" : "bg-indigo-600")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400 dark:text-white/30 shrink-0">
                        {completed}/{total}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-gray-600 dark:text-white/60 shrink-0">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {enrollmentsLoading && <p className="text-center text-gray-500">Loading your progress...</p>}
    </div>
  );
}

// Extracted for cleanliness
function CertificatesSection({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-black/[0.06] dark:border-white/[0.07]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.07em] text-gray-400 dark:text-white/35">
          Certificates earned
        </p>
        <Link
          href="/dashboard/certificates"
          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View all
        </Link>
      </div>

      {enrollments.filter((e) => e.certificate).length === 0 ? (
        <div className="flex flex-col items-center py-6">
          <Trophy className="w-8 h-8 text-gray-300 dark:text-white/20 mb-2" />
          <p className="text-[12px] text-gray-500 dark:text-white/40">No certificates yet</p>
          <p className="text-[11px] text-gray-400 dark:text-white/30 mt-0.5">Complete a course to earn one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {enrollments
            .filter((e) => e.certificate)
            .map((e) => (
              <CertificateItem key={e.id} enrollmentId={e.id} courseTitle={e.course.title} />
            ))}
        </div>
      )}
    </div>
  );
}

function CertificateItem({ enrollmentId, courseTitle }: { enrollmentId: string; courseTitle: string }) {
  const { data: certificate, isLoading } = useCertificate(enrollmentId);

  const handleDownload = () => {
    if (certificate?.url) {
      window.open(certificate.url, "_blank");
    } else {
      // Fallback: trigger backend generation if needed
      console.log("Trigger certificate generation for", enrollmentId);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2.5 border border-black/[0.05] dark:border-white/[0.06] rounded-xl">
      <div className="w-8 h-8 rounded-[8px] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0">
        <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-900 dark:text-white truncate">{courseTitle}</p>
        <p className="text-[10px] text-gray-400 dark:text-white/35">Verified certificate</p>
      </div>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        aria-label={`Download certificate for ${courseTitle}`}
        className="w-7 h-7 rounded-[7px] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-all disabled:opacity-50"
      >
        <Download className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}