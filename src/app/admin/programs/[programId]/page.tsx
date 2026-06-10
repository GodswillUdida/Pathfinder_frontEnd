"use client";

import { memo, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useProgram } from "@/hooks/useAdminPrograms";
import { useDeleteCourse } from "@/hooks/useAdminCourses";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  BarChart2,
  Clock,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  XCircle,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CourseFormModal } from "@/components/program/Courseformmodal";
import { DeleteConfirmModal } from "@/components/program/Deleteconfirmmodal";
import type { Course } from "@/components/program/Course.schema";

// ─── Level Styles ───────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  Beginner: { bg: "rgba(34,197,94,0.08)", color: "#15803d", border: "rgba(34,197,94,0.25)" },
  Intermediate: { bg: "rgba(245,158,11,0.08)", color: "#b45309", border: "rgba(245,158,11,0.25)" },
  Advanced: { bg: "rgba(239,68,68,0.08)", color: "#b91c1c", border: "rgba(239,68,68,0.25)" },
};

function getLevelStyle(level?: string | null) {
  return LEVEL_STYLES[level ?? ""] ?? {
    bg: "rgba(99,102,241,0.06)",
    color: "#6366f1",
    border: "rgba(99,102,241,0.2)",
  };
}

// ─── Course Row (Memoized) ───────────────────────────────────────────────────

interface CourseRowProps {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
}

const CourseRow = memo(function CourseRow({ course, onEdit, onDelete }: CourseRowProps) {
  const levelStyle = getLevelStyle(course.level);
  const isPublished = course.isPublished ?? course.status === "PUBLISHED";

  return (
    <div className="group flex items-center gap-4 rounded-2xl border bg-white px-4 py-4 transition-all hover:border-indigo-200 hover:shadow-sm">
      {/* Thumbnail */}
      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <BookOpen className="h-6 w-6 text-gray-300" />
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{course.title}</p>

        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
          {/* Status */}
          <span className="flex items-center gap-1 font-medium">
            {isPublished ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span className={isPublished ? "text-emerald-700" : "text-amber-700"}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </span>

          {/* Level */}
          {course.level && (
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{
                backgroundColor: levelStyle.bg,
                color: levelStyle.color,
                border: `1px solid ${levelStyle.border}`,
              }}
            >
              {course.level}
            </span>
          )}

          {/* Duration */}
          {course.duration && (
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              {course.duration}s
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(course)}
          className="rounded-xl p-2 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          aria-label="Edit course"
        >
          <Pencil className="h-4 w-4" />
        </button>

        {course.program?.slug && course.slug && (
          <a
            href={`/courses/${course.program.slug}/${course.slug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            aria-label="View live course"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <button
          onClick={() => onDelete(course)}
          className="rounded-xl p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          aria-label="Delete course"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

// ─── Stat Bar ───────────────────────────────────────────────────────────────

const StatBar = memo(({ label, value, icon: Icon }: {
  label: string;
  value: number;
  icon: React.ElementType;
}) => (
  <div className="rounded-2xl border bg-white p-4" style={{ borderColor: "#f1f0ec" }}>
    <div className="flex items-center gap-3">
      <div className="rounded-xl p-2.5" style={{ background: "rgba(99,102,241,0.08)" }}>
        <Icon className="h-5 w-5" style={{ color: "#6366f1" }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  </div>
));

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProgramPage() {
  const { programId } = useParams<{ programId: string }>();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useProgram(programId);
  const { mutateAsync: deleteCourse } = useDeleteCourse() ?? { mutateAsync: async () => {} };

  // Local State
  const [formOpen, setFormOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [search, setSearch] = useState("");

  // Handlers
  const openCreate = useCallback(() => {
    setEditCourse(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((course: Course) => {
    setEditCourse(course);
    setFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditCourse(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteCourse(deleteTarget.id);
    setDeleteTarget(null);
    refetch();
  }, [deleteTarget, deleteCourse, refetch]);

  // Filtered Courses
  const courses = useMemo(() => {
    const allCourses = (data?.courses ?? []) as unknown as Course[];
    if (!search.trim()) return allCourses;

    const q = search.toLowerCase();
    return allCourses.filter((course) =>
      course.title.toLowerCase().includes(q) ||
      (course.description ?? "").toLowerCase().includes(q) ||
      (course.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
    );
  }, [data?.courses, search]);

  const publishedCount = useMemo(() => 
    courses.filter((c) => c.isPublished ?? c.status === "PUBLISHED").length, 
    [courses]
  );

  // ── Loading & Error States ─────────────────────────────────────────────────

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-6 py-8">Loading program...</div>;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-lg font-semibold">Program not found</p>
        <button
          onClick={() => router.push("/admin/programs")}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm text-white hover:bg-indigo-700"
        >
          Back to Programs
        </button>
      </div>
    );
  }

  // ── Main Render ────────────────────────────────────────────────────────────

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/programs" className="hover:text-slate-700 flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Programs
          </Link>
          <span>/</span>
          <span className="font-medium text-slate-900 truncate">{data.title}</span>
        </nav>

        {/* Program Header */}
        <div className="rounded-3xl border bg-white p-6 shadow-sm" style={{ borderColor: "#f1f0ec" }}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="rounded-2xl bg-indigo-50 p-3">
                <GraduationCap className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{data.title}</h1>
                {data.description && (
                  <p className="mt-2 text-slate-600">{data.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-2xl bg-blue-800 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-800 active:scale-95 transition-all cursor-pointer duration-300ms"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        </div>

        {/* Stats */}
        {courses.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatBar label="Total Courses" value={courses.length} icon={BookOpen} />
            <StatBar label="Published" value={publishedCount} icon={CheckCircle2} />
            <StatBar label="Drafts" value={courses.length - publishedCount} icon={Layers} />
          </div>
        )}

        {/* Courses Section */}
        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Courses</h2>

            {courses.length > 0 && (
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border py-2.5 pl-10 text-sm focus:border-indigo-300 focus:ring-1"
                />
              </div>
            )}
          </div>

          {/* Empty / No Results */}
          {courses.length === 0 && (
            <div className="rounded-3xl border border-dashed py-20 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
              <p className="mt-4 text-slate-600">No courses found</p>
            </div>
          )}

          {/* Course List */}
          {courses.length > 0 && (
            <div className="space-y-3">
              {courses.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modals */}
      <CourseFormModal
        programId={programId}
        course={editCourse}
        open={formOpen}
        onClose={closeForm}
        onSaved={() => {
          closeForm();
          refetch();
        }}
      />

      <DeleteConfirmModal
        open={!!deleteTarget}
        courseName={deleteTarget?.title ?? ""}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}