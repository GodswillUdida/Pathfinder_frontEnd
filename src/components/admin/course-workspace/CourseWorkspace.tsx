"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { DeleteConfirmModal } from "@/components/program/Deleteconfirmmodal";
import { useCourse, useDeleteCourse } from "@/hooks/useCourses";
import { useCurriculum } from "@/hooks/useCurriculum";
import type { CourseAdminDetail } from "@/types/catalog";
import type { ModuleWithTopics } from "@/types/domain";
import { parseTab, panelId, tabId } from "./constants";
import { CourseBreadcrumb } from "./CourseBreadcrumb";
import { CourseHeader } from "./CourseHeader";
import { CurriculumManager } from "./curriculum/CurriculumManager";
import { AnalyticsPanel } from "./panels/AnalyticsPanel";
import { OverviewPanel } from "./panels/OverviewPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { StudentsPanel } from "./panels/StudentsPanel";
import { TabBar } from "./TabBar";
import type { WorkspaceTab } from "./types";
import { PageSkeleton } from "./ui/PageSkeleton";
import { formatDuration, sortByPosition } from "./utils";

/**
 * Orchestrator: data, active tab (the URL is the single source of truth),
 * and the delete flow. Must render under <Suspense> because of
 * useSearchParams (see app/admin/courses/[id]/page.tsx).
 */
export function CourseWorkspace({ courseId }: { courseId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data, isLoading, error } = useCourse(courseId);
  const course = data?.data as CourseAdminDetail | undefined;
  const deleteCourse = useDeleteCourse();
  const { data: curriculum, refetch: refetchCurriculum } = useCurriculum(courseId);

  const [deleteOpen, setDeleteOpen] = useState(false);

  const activeTab = parseTab(searchParams.get("tab"));
  const changeTab = useCallback(
    (tab: WorkspaceTab) => {
      const qs = new URLSearchParams(searchParams.toString());
      qs.set("tab", tab);
      router.replace(`${pathname}?${qs.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const modules = useMemo<ModuleWithTopics[]>(() => {
    if (!curriculum?.length) return [];
    return sortByPosition(curriculum).map((m) => ({
      ...m,
      topics: sortByPosition(m.topics),
    }));
  }, [curriculum]);

  const topicCount = useMemo(
    () => modules.reduce((sum, m) => sum + m.topics.length, 0),
    [modules],
  );

  const durationLabel = useMemo(() => {
    const secs = modules.reduce(
      (sum, m) => sum + m.topics.reduce((s, t) => s + (t.durationSeconds ?? 0), 0),
      0,
    );
    return formatDuration(secs || null);
  }, [modules]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!course) return;
    try {
      await deleteCourse.mutateAsync({ courseId: course.id });
      toast.success("Course deleted.");
      router.push("/admin/courses");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to delete course.");
    }
  }, [deleteCourse, course, router]);

  if (isLoading) return <PageSkeleton />;

  if (error || !course) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <AlertCircle className="mx-auto h-9 w-9 text-destructive" aria-hidden />
        <p className="font-display mt-5 text-[16px] font-semibold text-foreground">
          {error ? "Couldn't load this course" : "Course not found"}
        </p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          {error
            ? ((error as Error).message ?? "Check your connection and try again.")
            : "It may have been deleted, or the link is wrong."}
        </p>
        <Link
          href="/admin/courses"
          className="mt-8 inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-primary transition-colors hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to courses
        </Link>
      </div>
    );
  }

  const program = course.programs?.[0]?.program;

  return (
    <div className="page-container space-y-7 py-[clamp(1.25rem,2.5vw,2rem)]">
      <CourseBreadcrumb
        courseTitle={course.title}
        program={program ? { id: program.id, title: program.title } : null}
      />

      <CourseHeader
        course={course}
        moduleCount={modules.length || undefined}
        topicCount={topicCount || undefined}
        totalDurationLabel={durationLabel}
        onDelete={() => setDeleteOpen(true)}
      />

      <TabBar active={activeTab} onChange={changeTab} />

      <div
        role="tabpanel"
        id={panelId(activeTab)}
        aria-labelledby={tabId(activeTab)}
        tabIndex={0}
        className="focus-visible:outline-none"
      >
        {activeTab === "overview" && <OverviewPanel course={course} modules={modules} />}
        {activeTab === "curriculum" && (
          <CurriculumManager
            courseId={courseId}
            modules={modules}
            onChanged={() => void refetchCurriculum()}
          />
        )}
        {activeTab === "students" && <StudentsPanel />}
        {activeTab === "analytics" && <AnalyticsPanel />}
        {activeTab === "settings" && (
          <SettingsPanel course={course} onDelete={() => setDeleteOpen(true)} />
        )}
      </div>

      <DeleteConfirmModal
        open={deleteOpen}
        courseName={course.title}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
}
