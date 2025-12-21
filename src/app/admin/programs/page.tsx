"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProgramList } from "@/hooks/useAdminPrograms";
import { CreateProgramModal } from "@/components/admin/CreateProgramModal";
import { Course } from "@/types/course";
import {
  Plus,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Program = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  courses: Course[];
};

export default function AdminProgramPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useProgramList();
  const programs: Program[] = data?.programs ?? [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProgramClick = (programId: string) => {
    router.push(`/admin/programs/${programId}`);
  };

  const handleProgramCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading programs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || "Something went wrong while loading programs"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Programs
          </h1>
          <p className="text-muted-foreground">
            Manage your educational programs and courses
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          size="lg"
          className="w-full sm:w-auto h-11 gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Program
        </Button>
      </div>

      {/* Stats Bar */}
      {programs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{programs.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Programs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {programs.reduce((acc, p) => acc + p.courses.length, 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(
                      programs.reduce((acc, p) => acc + p.courses.length, 0) /
                      programs.length
                    ).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Avg. Courses/Program
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {programs.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No programs yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Get started by creating your first program. Programs help you
              organize courses and learning paths.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              size="lg"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Your First Program
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Programs Grid */}
      {programs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              onClick={() => handleProgramClick(program.id)}
            >
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  {program.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                  {program.description || "No description available"}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <div className="flex items-center gap-1.5 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {program.courses.length}
                    </span>
                    <span className="text-muted-foreground">
                      {program.courses.length === 1 ? "course" : "courses"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Program Modal */}
      <CreateProgramModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleProgramCreated}
      />
    </div>
  );
}
