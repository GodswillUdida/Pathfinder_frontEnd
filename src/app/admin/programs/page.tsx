"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateProgramModal } from "@/components/admin/CreateProgramModal";
import { useDeleteProgram, useProgramList } from "@/hooks/useAdminPrograms";
import { Course } from "@/types/course";
import {
  Plus,
  BookOpen,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  FolderOpen,
} from "lucide-react";

type Program = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  courses?: Course[] | null;
  courseCount?: number;
  isPublished?: boolean;
  deletedAt?: string | null;
};

function ProgramCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-3 border-t">
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
  accent,
}: {
  value: string | number;
  label: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className={`border-l-4 ${accent}`}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgramCard({
  program,
  onClick,
}: {
  program: Program;
  onClick: () => void;
}) {
  const courseCount = program.courses?.length ?? program.courseCount ?? 0;
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border hover:border-primary/40"
    >
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
        <CardTitle className="text-base font-semibold leading-snug line-clamp-2">
          {program.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {program.description ?? "No description provided"}
        </p>
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-1.5 text-sm">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">{courseCount}</span>
            <span className="text-muted-foreground text-xs">
              {courseCount === 1 ? "course" : "courses"}
            </span>
          </div>
          {courseCount === 0 && (
            <Badge variant="outline" className="text-xs">
              Empty
            </Badge>
          )}
          {program.isPublished && (
            <Badge variant="default" className="text-xs">
              Published
            </Badge>
          )}

          {!program.isPublished && (
            <Badge variant="outline" className="text-xs">
              Draft
            </Badge>
          )}

          {program.deletedAt && (
            <Badge variant="destructive" className="text-xs">
              Deleted
            </Badge>
          )}


        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onAction }: { onAction: () => void }) {
  return (
    <Card className="border-dashed max-w-lg mx-auto">
      <CardContent className="flex flex-col items-center py-14 text-center">
        <div className="w-14 h-14 mb-5 rounded-xl bg-muted flex items-center justify-center">
          <FolderOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">No programs yet</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Programs organize courses into structured learning paths. Create your first to get started.
        </p>
        <Button onClick={onAction} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminProgramPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useProgramList();
  const programs: Program[] = data?.programs ?? [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalCourses = programs.reduce(
    (acc, p) => acc + (p.courses?.length ?? p.courseCount ?? 0),
    0
  );
  const averageCourses =
    programs.length > 0 ? (totalCourses / programs.length).toFixed(1) : "0.0";

  const handleCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <ProgramCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as Error).message ?? "Failed to load programs."}
          </AlertDescription>
        </Alert>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Programs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage educational programs and courses
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 sm:w-auto w-full">
          <Plus className="h-4 w-4" />
          New Program
        </Button>
      </div>

      {/* Stats */}
      {programs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            value={programs.length}
            label="Total Programs"
            icon={FolderOpen}
            accent="border-l-primary"
          />
          <StatCard
            value={totalCourses}
            label="Total Courses"
            icon={BookOpen}
            accent="border-l-blue-500"
          />
          <StatCard
            value={averageCourses}
            label="Avg. Courses / Program"
            icon={GraduationCap}
            accent="border-l-emerald-500"
          />
        </div>
      )}

      {/* Empty State */}
      {programs.length === 0 && (
        <EmptyState onAction={() => setIsModalOpen(true)} />
      )}

      {/* Grid */}
      {programs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              All Programs
            </h2>
            <Badge variant="secondary" className="text-xs">
              {programs.length} total
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                program={program}
                onClick={() => router.push(`/admin/programs/${program.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      <CreateProgramModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}