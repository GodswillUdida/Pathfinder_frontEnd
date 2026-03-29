// app/dashboard/page.tsx
"use client";

// import { useAuthStore } from "@/store/authStore";
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
} from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import type { Enrollment } from "@/types/dashboard";

function getProgress(enrollment: Enrollment): number {
  const allTopics = enrollment.course.modules.flatMap((m) => m.topics);
  if (allTopics.length === 0) return 0;
  const done = enrollment.progressRecords!.filter((p) => p.completed).length;
  return Math.round((done / allTopics.length) * 100);
}

function getTotalTopics(enrollment: Enrollment): number {
  return enrollment.course.modules.flatMap((m) => m.topics).length;
}

function getCompletedTopics(enrollment: Enrollment): number {
  return enrollment.progressRecords!.filter((p) => p.completed).length;
}

function getLastTopic(enrollment: Enrollment) {
  const completedIds = new Set(
    enrollment.progressRecords!.filter((p) => p.completed).map((p) => p.topicId)
  );
  for (const mod of enrollment.course.modules) {
    for (const topic of mod.topics) {
      if (!completedIds.has(topic.id)) return topic;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: Enrollment }) {
  const progress = getProgress(enrollment);
  const total = getTotalTopics(enrollment);
  const completed = getCompletedTopics(enrollment);
  const nextTopic = getLastTopic(enrollment);
  const expired = isPast(new Date(enrollment.expiresAt));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 overflow-hidden">
        {enrollment.course.thumbnail ? (
          <Image
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-blue-300" />
          </div>
        )}
        {/* Expired badge */}
        {expired && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Expired
          </div>
        )}
        {/* Progress pill */}
        {progress === 100 && (
          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Trophy className="w-3 h-3" /> Completed
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-semibold text-slate-900 text-[15px] leading-snug line-clamp-2 mb-3">
          {enrollment.course.title}
        </h3>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>
              {completed}/{total} lessons
            </span>
            <span className="font-medium text-slate-700">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Expiry */}
        <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {expired
            ? "Access expired"
            : `Expires ${formatDistanceToNow(new Date(enrollment.expiresAt), {
                addSuffix: true,
              })}`}
        </p>

        {/* CTA */}
        <Link
          href={`/dashboard/courses/${enrollment.id}${
            nextTopic ? `?topic=${nextTopic.id}` : ""
          }`}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
        >
          <PlayCircle className="w-4 h-4" />
          {progress === 0
            ? "Start learning"
            : progress === 100
            ? "Review course"
            : "Continue"}
        </Link>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { data: enrollments, isLoading, error } = useEnrollments();

  const activeCount =
    enrollments?.filter((e: any) => !isPast(new Date(e.expiresAt))).length ?? 0;
  const completedCount =
    enrollments?.filter((e: any) => getProgress(e) === 100).length ?? 0;
  const certCount = enrollments?.filter((e: any) => e.certificate).length ?? 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          {greeting}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Here's what's happening with your learning today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={BookOpen}
          label="Active courses"
          value={activeCount}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Trophy}
          label="Completed"
          value={completedCount}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Trophy}
          label="Certificates"
          value={certCount}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Enrollments */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">My courses</h2>
          <Link
            href="/dashboard/courses"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Failed to load courses. Please refresh.
          </div>
        )}

        {!isLoading && !error && enrollments?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">No courses yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Your enrolled courses will appear here.
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              Browse courses
            </Link>
          </div>
        )}

        {!isLoading && enrollments && enrollments.length > 0 && (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {enrollments.slice(0, 6).map((e: any) => (
              <EnrollmentCard key={e.id} enrollment={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
