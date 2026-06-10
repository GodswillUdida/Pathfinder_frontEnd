"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateProgramModal } from "@/components/admin/CreateProgramModal";
import { useDeleteProgram, useProgramList } from "@/hooks/useAdminPrograms";
import type { Course } from "@/types/course";
import {
  Plus, BookOpen, GraduationCap, AlertCircle,
  ArrowRight, FolderOpen, Search, MoreVertical,
  Pencil, Trash2, Eye, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Program = {
  id:           string;
  title:        string;
  slug:         string;
  description?: string | null;
  courses?:     Course[] | null;
  courseCount?: number;
  isPublished?: boolean;
  deletedAt?:   string | null;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCourseCount(p: Program): number {
  return p.courses?.length ?? p.courseCount ?? 0;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-5 space-y-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-[10px] bg-gray-100 dark:bg-white/[0.08]" />
        <div className="w-4 h-4 rounded bg-gray-100 dark:bg-white/[0.08]" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded-lg bg-gray-100 dark:bg-white/[0.08]" />
        <div className="h-3 w-full rounded-lg bg-gray-100 dark:bg-white/[0.08]" />
        <div className="h-3 w-2/3 rounded-lg bg-gray-100 dark:bg-white/[0.08]" />
      </div>
      <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
        <div className="h-3 w-20 rounded-lg bg-gray-100 dark:bg-white/[0.08]" />
        <div className="h-5 w-14 rounded-full bg-gray-100 dark:bg-white/[0.08]" />
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  value, label, icon: Icon, accentClass,
}: {
  value: string | number; label: string;
  icon: React.ElementType; accentClass: string;
}) {
  return (
    <div className={cn(
      "bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-4",
      "border-l-2", accentClass
    )}>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-gray-500 dark:text-white/50" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[22px] font-bold text-gray-900 dark:text-white leading-none tracking-tight">{value}</p>
          <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">{label}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Program card ─────────────────────────────────────────────────────────────

function ProgramCard({
  program,
  onClick,
  onDelete,
}: {
  program: Program;
  onClick: () => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const count = getCourseCount(program);

  const statusBadge = program.deletedAt
    ? { label: "Deleted",   cls: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" }
    : program.isPublished
    ? { label: "Published", cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" }
    : { label: "Draft",     cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" };

  return (
    <div className={cn(
      "group relative bg-white dark:bg-white/[0.04] rounded-2xl",
      "border border-black/[0.06] dark:border-white/[0.07]",
      "hover:border-indigo-300 dark:hover:border-indigo-500/30",
      "transition-all duration-200 hover:shadow-sm",
      "flex flex-col"
    )}>
      {/* Clickable body */}
      <button
        onClick={onClick}
        className="flex-1 text-left p-5 space-y-3"
        aria-label={`Open program: ${program.title}`}
      >
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-[10px] bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 dark:text-white/20 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-150" aria-hidden="true" />
        </div>

        {/* Title */}
        <div>
          <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2">
            {program.title}
          </h3>
          <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1 line-clamp-2 min-h-[2rem] leading-relaxed">
            {program.description ?? "No description provided."}
          </p>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-3 border-t border-black/[0.04] dark:border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-gray-400 dark:text-white/30" aria-hidden="true" />
            <span className="text-[11px] font-medium text-gray-600 dark:text-white/60">{count}</span>
            <span className="text-[10px] text-gray-400 dark:text-white/30">{count === 1 ? "course" : "courses"}</span>
          </div>
          <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border", statusBadge.cls)}>
            {statusBadge.label}
          </span>
        </div>
      </button>

      {/* Context menu */}
      <div className="absolute top-3 right-10">
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
            aria-label="Program options"
            className={cn(
              "w-7 h-7 rounded-[7px] flex items-center justify-center transition-all",
              "text-gray-400 dark:text-white/30",
              "hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-gray-700 dark:hover:text-white",
              menuOpen ? "bg-gray-100 dark:bg-white/[0.07] text-gray-700 dark:text-white" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-[#141923] border border-black/[0.08] dark:border-white/[0.1] rounded-xl shadow-lg overflow-hidden py-1">
                {[
                  { icon: Eye,    label: "View",   action: onClick },
                  { icon: Pencil, label: "Edit",   action: () => {} },
                  { icon: Trash2, label: "Delete", action: () => onDelete(program.id), danger: true },
                ].map(({ icon: Icon, label, action, danger }) => (
                  <button
                    key={label}
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(false); action(); }}
                    className={cn(
                      "flex items-center gap-2 w-full px-3 py-2 text-[12px] transition-colors",
                      danger
                        ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08]"
                        : "text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ query, onAction }: { query: string; onAction: () => void }) {
  if (query) {
    return (
      <div className="flex flex-col items-center py-16 bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07]">
        <Search className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
        <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">No programs match "{query}"</p>
        <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1">Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-16 border border-dashed border-black/[0.1] dark:border-white/[0.1] rounded-2xl max-w-sm mx-auto">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-4">
        <FolderOpen className="w-6 h-6 text-gray-400 dark:text-white/30" />
      </div>
      <p className="text-[13px] font-semibold text-gray-900 dark:text-white mb-1">No programs yet</p>
      <p className="text-[11px] text-gray-400 dark:text-white/35 text-center mb-5 max-w-[220px] leading-relaxed">
        Programs organise courses into structured learning paths.
      </p>
      <button
        onClick={onAction}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors"
      >
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        Create Program
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProgramPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useProgramList();
  const { mutate: deleteProgram, isPending: isDeleting } = useDeleteProgram();

  const programs: Program[] = data?.programs ?? [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = programs.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalCourses   = programs.reduce((acc, p) => acc + getCourseCount(p), 0);
  const publishedCount = programs.filter((p) => p.isPublished && !p.deletedAt).length;
  const avgCourses     = programs.length > 0
    ? (totalCourses / programs.length).toFixed(1)
    : "0.0";

  const handleCreated = () => { setIsModalOpen(false); refetch(); };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    deleteProgram(id, { onSuccess: () => refetch() });
  };

  // ── Loading ────────────────────────────────────

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-7 space-y-7">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-6 w-28 rounded-xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
            <div className="h-3.5 w-48 rounded-xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded-xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[60px] rounded-2xl bg-gray-100 dark:bg-white/[0.08] animate-pulse" />
          ))}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-7 space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-[12px]">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {(error as Error).message ?? "Failed to load programs."}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl text-[12px] font-medium border border-black/[0.08] dark:border-white/[0.08] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
          >
            Retry
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            New Program
          </button>
        </div>
      </div>
    );
  }

  // ── Page ───────────────────────────────────────

  return (
    <div className="max-w-6xl mx-auto px-6 py-7 space-y-7">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Programs</h1>
          <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">Manage educational programs and course paths</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-semibold transition-colors active:scale-[0.98] sm:w-auto w-full justify-center"
        >
          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
          New Program
        </button>
      </div>

      {/* Stats */}
      {programs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <StatCard value={programs.length}   label="Total programs"         icon={FolderOpen}    accentClass="border-l-indigo-500" />
          <StatCard value={totalCourses}       label="Total courses"          icon={BookOpen}      accentClass="border-l-blue-500" />
          <StatCard value={publishedCount}     label="Published"              icon={GraduationCap} accentClass="border-l-emerald-500" />
          <StatCard value={avgCourses}     label="Average Course per program"              icon={GraduationCap} accentClass="border-l-emerald-500" />
        </div>
      )}

      {/* Search + grid */}
      {programs.length > 0 && (
        <>
          {/* Search */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search programs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-[12px]
                         bg-white dark:bg-white/[0.05]
                         border border-black/[0.08] dark:border-white/[0.08] rounded-xl
                         text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              aria-label="Search programs"
            />
          </div>

          {/* Section label */}
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
              {search ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}` : "All programs"}
            </h2>
            <span className="text-[10px] font-semibold text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
              {programs.length} total
            </span>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <ProgramCard
                  key={p.id}
                  program={p}
                  onClick={() => router.push(`/admin/programs/${p.id}`)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <EmptyState query={search} onAction={() => setIsModalOpen(true)} />
          )}
        </>
      )}

      {/* Empty — no programs at all */}
      {programs.length === 0 && (
        <EmptyState query="" onAction={() => setIsModalOpen(true)} />
      )}

      <CreateProgramModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}