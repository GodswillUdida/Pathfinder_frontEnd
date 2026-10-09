"use client";

import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { AlertCircle, ArrowLeft, FileQuestion, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useProgram,
  useDeleteProgram,
  useReorderCourses,
  usePublishProgram,
  useArchiveProgram,
} from "@/hooks/useAdminPrograms";
import { useDeleteCourse } from "@/hooks/useCourses";
import { CreateCourseModal } from "@/components/program/CreateCourseModal";
import { ProgramHeader } from "./program-header";
import { CourseBoard } from "./course-board";
import { EditProgramSheet } from "./edit-program-sheet";
import type { Course } from "@/types/domain";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Shared bits                                                               */
/* -------------------------------------------------------------------------- */

const PAGE =
  "mx-auto w-full max-w-7xl px-[clamp(1rem,3vw,2rem)]  pb-24";

const reveal = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: {
    type: "spring" as const,
    stiffness: 140,
    damping: 20,
    delay: i * 0.07,
  },
});

/** Full-page state (error / not found). */
function StateCard({
  tone,
  title,
  message,
  children,
}: {
  tone: "danger" | "muted";
  title: string;
  message: string;
  children: ReactNode;
}) {
  const Icon = tone === "danger" ? AlertCircle : FileQuestion;
  return (
    <div className={PAGE}>
      <div
        role={tone === "danger" ? "alert" : "status"}
        className="mx-auto mt-[clamp(1.5rem,8vh,5rem)] max-w-md rounded-3xl border border-border bg-card p-[clamp(1.5rem,4vw,2.5rem)] text-center"
      >
        <div
          className={cn(
            "mx-auto grid h-14 w-14 place-items-center rounded-2xl ring-8",
            tone === "danger"
              ? "bg-destructive/10 text-destructive ring-destructive/5"
              : "bg-secondary text-muted-foreground ring-secondary/50",
          )}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className={PAGE} aria-busy="true" aria-label="Loading program">
      <Skeleton className="h-5 w-44 rounded-lg" />

      <div className="mt-5 rounded-3xl border border-border bg-card p-[clamp(1.25rem,2.5vw,2rem)]">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-6 w-64 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      <div className="ledger-rule my-8" aria-hidden="true" />

      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.25rem] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Destructive confirmation dialog                                           */
/* -------------------------------------------------------------------------- */

function DangerDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending = false,
  onConfirm,
  requireText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  /** When set, the user must type this text before the action unlocks. */
  requireText?: string;
}) {
  const [typed, setTyped] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (pending) return;
    if (!nextOpen) setTyped("");
    onOpenChange(nextOpen);
  };

  const unlocked =
    !requireText ||
    typed.trim().toLowerCase() === requireText.trim().toLowerCase();

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-1 grid h-11 w-11 place-items-center self-center rounded-xl bg-destructive/10 text-destructive sm:self-start">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="font-display tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {requireText && (
          <label className="block text-xs font-medium text-muted-foreground">
            Type{" "}
            <span className="font-bold border-2 p-0.5 border-red-300 rounded mx-1 text-foreground">
              {requireText}
            </span>{" "}
            to confirm
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={pending}
              className="mt-2 h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus-visible:border-destructive focus-visible:ring-4 focus-visible:ring-destructive/15"
            />
          </label>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending || !unlocked}
            // Keep the dialog open until the request finishes, so "Deleting…" is actually visible.
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {pending ? "Deleting…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Workspace                                                                 */
/* -------------------------------------------------------------------------- */

export function ProgramWorkspace({ programId }: { programId: string }) {
  const router = useRouter();
  const { data: program, isLoading, error, refetch } = useProgram(programId);

  // const { mutateAsync: updateProgram, isPending: isUpdatingPending } =
  //   useUpdateProgram();
  const { mutateAsync: deleteProgram, isPending: isDeleteProgramPending } =
    useDeleteProgram();
  const { mutateAsync: deleteCourse, isPending: isDeleteCoursePending } =
    useDeleteCourse();
    const { mutateAsync: publishProgram, isPending: isPublishPending } =
  usePublishProgram();
const { mutateAsync: archiveProgram, isPending: isArchivePending } =
  useArchiveProgram();
  const { mutateAsync: reorderCourses } = useReorderCourses();

  const [editOpen, setEditOpen] = useState(false);
  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  // Target and open are separate so the dialog title doesn't blank out while it animates closed.
  const [deleteCourseTarget, setDeleteCourseTarget] = useState<Course | null>(
    null,
  );
  const [deleteCourseOpen, setDeleteCourseOpen] = useState(false);
  const [deleteProgramOpen, setDeleteProgramOpen] = useState(false);

  // The program endpoint returns a course summary; child components use Course.
  // Memoised so CourseBoard receives a stable array between unrelated renders.
  const courses = useMemo<Course[]>(
    () =>
      (program?.courses ?? []).map((pc) => ({
        id: pc.course.id,
        title: pc.course.title,
        slug: pc.course.slug,
        code: "",
        description: "",
        thumbnail: pc.course.thumbnail,
        videoPreview: null,
        level: pc.course.level,
        tags: [],
        status: pc.course.status,
        issuesCertificate: false,
        instructorId: null,
        totalDurationSeconds: pc.course.totalDurationSeconds,
        deletedAt: null,
        createdAt: "",
        updatedAt: "",
      })),
    [program],
  );

  const openCreateCourse = useCallback(() => {
    setEditingCourse(null);
    setCourseFormOpen(true);
  }, []);
  const openEditCourse = useCallback((c: Course) => {
    setEditingCourse(c);
    setCourseFormOpen(true);
  }, []);
  const closeCourseForm = useCallback(() => {
    setCourseFormOpen(false);
    setEditingCourse(null);
  }, []);
  const requestDeleteCourse = useCallback((c: Course) => {
    setDeleteCourseTarget(c);
    setDeleteCourseOpen(true);
  }, []);

const handleTogglePublish = async () => {
  if (!program) return;

  const goingLive = program.status !== "PUBLISHED";

  if (goingLive && (program.courses?.length ?? 0) === 0) {
    toast.error("Add at least one course before publishing.");
    return;
  }

  try {
    if (goingLive) {
      await publishProgram(programId);
      toast.success("Program published. Visible to learners.");
    } else {
      await archiveProgram(programId); // or a dedicated unpublish endpoint if you have one
      toast.success("Program archived.");
    }
    refetch();
  } catch (err: unknown) {
    toast.error((err as Error).message ?? "Failed to update status.");
  }
};

  const handleReorder = useCallback(
    async (ordered: Course[]) => {
      try {
        await Promise.all(
          ordered.map((course, position) =>
            reorderCourses({
              programId,
              courseId: course.id,
              position,
            }),
          ),
        );
      } catch {
        toast.error("Couldn't save the new order. Reverting.");
        refetch();
      }
    },
    [programId, refetch, reorderCourses],
  );

  const handleDeleteCourse = async () => {
    if (!deleteCourseTarget) return;
    try {
      await deleteCourse({ courseId: deleteCourseTarget.id });
      toast.success("Course deleted.");
      refetch();
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to delete course.");
    } finally {
      setDeleteCourseOpen(false);
    }
  };

  const handleDeleteProgram = async () => {
    try {
      await deleteProgram(programId);
      toast.success("Program deleted.");
      router.push("/admin/programs");
    } catch (err: unknown) {
      toast.error((err as Error).message ?? "Failed to delete program.");
      setDeleteProgramOpen(false);
    }
  };

  if (isLoading) return <WorkspaceSkeleton />;

  if (error || !program) {
    return (
      <StateCard
        tone={error ? "danger" : "muted"}
        title={error ? "Couldn't load this program" : "Program not found"}
        message={
          error
            ? ((error as Error).message ?? "Please try again.")
            : "It may have been deleted or moved."
        }
      >
        {error && (
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        )}
        <Button
          onClick={() => router.push("/admin/programs")}
          className="shadow-sm shadow-primary/25"
        >
          Back to programs
        </Button>
      </StateCard>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className={PAGE}>
        {/* Breadcrumb */}
        <motion.nav aria-label="Breadcrumb" {...reveal(0)}>
          <ol className="flex items-center gap-2 text-[13px] mt-12 sm:mt-0">
            <li>
              <Link
                href="/admin/programs"
                className="group inline-flex items-center gap-2 rounded-lg py-1 pr-2 font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg border border-border bg-card transition-[transform,border-color,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-x-0.5 group-hover:border-brand-300 group-hover:text-primary">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Programs
              </Link>
            </li>
            <li aria-hidden="true" className="text-border">
              /
            </li>
            <li
              aria-current="page"
              className="min-w-0 max-w-[40ch] truncate font-medium text-foreground"
            >
              {program.title}
            </li>
          </ol>
        </motion.nav>

        <motion.div {...reveal(1)} className="mt-5">
          <ProgramHeader
            program={program}
            courses={courses}
            isPublishPending={isPublishPending}
            isArchivePending={isArchivePending}
            onTogglePublish={handleTogglePublish}
            onEdit={() => setEditOpen(true)}
            onAddCourse={openCreateCourse}
            onDelete={() => setDeleteProgramOpen(true)}
          />
        </motion.div>

        <motion.section aria-label="Courses" {...reveal(2)} className="mt-8">
          {/* <div className="ledger-rule mb-6" aria-hidden="true" /> */}
          <CourseBoard
            courses={courses}
            onReorder={handleReorder}
            onEdit={openEditCourse}
            onOpenFull={(c) => router.push(`/admin/courses/${c.id}`)}
            onDelete={requestDeleteCourse}
            onAdd={openCreateCourse}
          />
        </motion.section>

        <EditProgramSheet
          program={program}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            setEditOpen(false);
            refetch();
          }}
        />

        <CreateCourseModal
          programId={programId}
          course={editingCourse}
          open={courseFormOpen}
          onClose={closeCourseForm}
          onSaved={() => {
            closeCourseForm();
            refetch();
          }}
        />

        <DangerDialog
          open={deleteCourseOpen}
          onOpenChange={setDeleteCourseOpen}
          title={`Delete “${deleteCourseTarget?.title ?? "this course"}”?`}
          description="This can’t be undone."
          confirmLabel="Delete course"
          pending={isDeleteCoursePending}
          onConfirm={handleDeleteCourse}
        />

        <DangerDialog
          open={deleteProgramOpen}
          onOpenChange={setDeleteProgramOpen}
          title={`Delete “${program?.title}”?`}
          description={
            <>
              This permanently deletes the program and its {courses.length}{" "}
              {courses.length === 1 ? "course" : "courses"}. This can’t be
              undone.
            </>
          }
          confirmLabel="Delete program"
          pending={isDeleteProgramPending}
          onConfirm={handleDeleteProgram}
          // Only ask for typed confirmation when real content would be lost.
          requireText={courses.length > 0 ? program?.title : undefined}
        />
      </div>
    </MotionConfig>
  );
}
