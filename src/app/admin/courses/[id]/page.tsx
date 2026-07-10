  "use client";

  import { use, useState } from "react";
  import Link from "next/link";
  import { useRouter } from "next/navigation";
  import { useCourse, useUpdateCourse } from "@/hooks/useAdminCourses";
  import {
    AlertCircle, CheckCircle2, ArrowLeft, BookOpen,
    Globe, Clock, BarChart2, Users, ExternalLink,
    Pencil, Loader2,
  } from "lucide-react";
  import { cn } from "@/lib/utils";

  // ─── Types ────────────────────────────────────────────────────────────────────

  interface Props {
    params: Promise<{ id: string }>;
  }

  type Level = "Beginner" | "Intermediate" | "Advanced" | string;

  const LEVEL_STYLES: Record<string, string> = {
    Beginner: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    Intermediate: "bg-amber-50   text-amber-800   border-amber-200   dark:bg-amber-500/10   dark:text-amber-400   dark:border-amber-500/20",
    Advanced: "bg-pink-50    text-pink-800    border-pink-200    dark:bg-pink-500/10    dark:text-pink-400    dark:border-pink-500/20",
  };

  function getLevelStyle(level?: string | null): string {
    return LEVEL_STYLES[level ?? ""] ??
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/[0.06] dark:text-white/50 dark:border-white/[0.08]";
  }

  // ─── Skeleton ────────────────────────────────────────────────────────────────

  function PageSkeleton() {
    return (
      <div className="max-w-3xl mx-auto px-6 py-7 space-y-6 animate-pulse">
        <div className="h-4 w-32 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-20 rounded-full bg-gray-100 dark:bg-white/[0.08]" />
            <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-white/[0.08]" />
          </div>
          <div className="h-7 w-2/3 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
          <div className="h-4 w-full rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
          <div className="h-4 w-4/5 rounded-xl bg-gray-100 dark:bg-white/[0.08]" />
        </div>
        <div className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-white/[0.08]" />
        <div className="h-48 w-full rounded-2xl bg-gray-100 dark:bg-white/[0.08]" />
      </div>
    );
  }

  // ─── Detail row ───────────────────────────────────────────────────────────────

  function DetailRow({
    icon: Icon, label, children,
  }: {
    icon: React.ElementType; label: string; children: React.ReactNode;
  }) {
    return (
      <div className="flex items-center justify-between gap-4 py-3 border-b border-black/[0.04] dark:border-white/[0.05] last:border-0">
        <span className="flex items-center gap-2 text-[12px] text-gray-500 dark:text-white/40 shrink-0">
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          {label}
        </span>
        <span className="text-[12px] font-medium text-gray-900 dark:text-white text-right">
          {children ?? <span className="text-gray-400 dark:text-white/25">—</span>}
        </span>
      </div>
    );
  }

  // ─── Page ─────────────────────────────────────────────────────────────────────

  export default function AdminCourseDetailPage({ params }: Props) {
    const router = useRouter();
    const { id: courseId } = use(params);
    // const { id: courseId } = await params;

    const { data: course, isLoading, error } = useCourse(courseId);
    const updateCourse = useUpdateCourse(courseId);

    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // ── Loading ────────────────────────────────────

    if (isLoading) return <PageSkeleton />;

    // ── Error ──────────────────────────────────────

    if (error || !course) {
      return (
        <div className="max-w-3xl mx-auto px-6 py-7 space-y-4">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back to Courses
          </Link>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px]">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {error ? (error as Error).message ?? "Failed to load course." : "Course not found."}
          </div>
        </div>
      );
    }

    // ── Submit handler ─────────────────────────────

    const handleSubmit = async (values: Record<string, unknown>) => {
      setServerError(null);
      setSuccess(false);
      try {
        await updateCourse.mutateAsync(values);
        setSuccess(true);
        setTimeout(() => router.push("/admin/courses"), 1500);
      } catch (err: unknown) {
        setServerError((err as Error).message ?? "Update failed. Please try again.");
      }
    };

    const liveUrl = course.program?.slug && course.slug
      ? `/courses/${course.program.slug}/${course.slug}`
      : null;

    // ── Render ─────────────────────────────────────

    return (
      <div className="max-w-6xl mx-auto px-2 py-2 space-y-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-white/35">
          <Link
            href="/admin/courses"
            className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3 h-3.5" aria-hidden="true" />
            Courses
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-white/70 truncate max-w-70">{course.title}</span>
        </div>

        {/* Hero */}
        <div className="bg-white dark:bg-white/4 rounded-2xl border border-black/6 dark:border-white/[0.07] p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left */}
            <div className="space-y-3">
              {/* Badge row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "text-[9px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1",
                  getLevelStyle(course.level)
                )}>
                  <BarChart2 className="w-2.5 h-2.5" aria-hidden="true" />
                  {course.level ?? "All levels"}
                </span>

                {course.program?.title && (
                  <Link
                    href={`/admin/programs/${course.program.id}`}
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-full border text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                  >
                    {course.program.title}
                  </Link>
                )}

                <span className={cn(
                  "text-[9px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1",
                  course.isPublished
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    course.isPublished ? "bg-emerald-500" : "bg-amber-500"
                  )} />
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                {course.title}
              </h1>

              {/* Description */}
              {course.description && (
                <p className="text-[13px] text-gray-400 dark:text-white/50 leading-relaxed max-w-xl">
                  {course.description}
                </p>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/[0.08] dark:border-white/[0.08] text-[12px] font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                  aria-label="View course live"
                >
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  Live
                </a>
              )}
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-semibold transition-colors active:scale-[0.98] cursor-pointer">
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Feedback banners */}
        {serverError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px]" role="alert">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[12px]" role="status">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            Course updated successfully. Redirecting…
          </div>
        )}

        {/* Details card */}
        {/* <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35 mb-3">
            Course details
          </h2>
          <div>
            {course.duration && (
              <DetailRow icon={Clock} label="Duration">{course.duration}</DetailRow>
            )}
            {course.level && (
              <DetailRow icon={BarChart2} label="Level">{course.level}</DetailRow>
            )}
            {course.enrollmentCount !== undefined && (
              <DetailRow icon={Users} label="Enrolled">
                {course.enrollmentCount.toLocaleString()} students
              </DetailRow>
            )}
            {course.program?.title && (
              <DetailRow icon={BookOpen} label="Program">
                <Link
                  href={`/admin/programs/${course.program.id}`}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {course.program.title}
                </Link>
              </DetailRow>
            )}
            {course.slug && (
              <DetailRow icon={Globe} label="Slug">
                <code className="text-[11px] bg-gray-100 dark:bg-white/[0.08] border border-black/[0.06] dark:border-white/[0.06] px-2 py-0.5 rounded-lg">
                  {course.slug}
                </code>
              </DetailRow>
            )}
          </div>
        </div> */}

        {/* Course form slot */}
        {/* <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35 mb-4">
            Edit course
          </h2>
        
          <div className="flex flex-col items-center py-10 border border-dashed border-black/[0.08] dark:border-white/[0.08] rounded-xl">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-gray-400 dark:text-white/30" aria-hidden="true" />
            </div>
            <p className="text-[13px] font-medium text-gray-700 dark:text-white/70 mb-1">Course form</p>
            <p className="text-[11px] text-gray-400 dark:text-white/35 text-center max-w-[240px]">
              Plug in your <code className="bg-gray-100 dark:bg-white/[0.08] px-1 rounded">CourseForm</code> component with{" "}
              <code className="bg-gray-100 dark:bg-white/[0.08] px-1 rounded">onSubmit</code> and{" "}
              <code className="bg-gray-100 dark:bg-white/[0.08] px-1 rounded">initialData</code>.
            </p>
          </div>
        </div> */}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Link
            href="/admin/courses"
            className="px-4 py-2.5 rounded-xl border border-black/8 dark:border-white/8  text-[12px] font-medium text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSubmit({})}
            disabled={updateCourse.isPending || success}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[12px] font-semibold transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            {updateCourse.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </div>
      </div>
    );
  }