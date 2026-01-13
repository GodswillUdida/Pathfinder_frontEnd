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
  BarChart3,
  Users,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type Program = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  courses?: Course[] | null;
  courseCount?: number;
  isPublished?: boolean;
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

  // Calculate stats safely
  const totalPrograms = programs.length;
  const totalCourses = programs.reduce((acc, program) => {
    return acc + (program.courses?.length || program.courseCount || 0);
  }, 0);
  
  const averageCourses = totalPrograms > 0 
    ? (totalCourses / totalPrograms).toFixed(1)
    : "0.0";

  const getPublishedCount = () => {
    return programs.filter(p => p.isPublished).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 md:p-8 bg-gradient-to-b from-background to-muted/5">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-11 w-40" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-l-4 border-l-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-7 w-16" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Programs Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-5 w-5" />
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
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 md:p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full border-destructive/20">
          <CardContent className="pt-6">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message || "Failed to load programs. Please try again."}
              </AlertDescription>
            </Alert>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Unable to Load Programs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  There was an error fetching your programs. This might be a temporary issue.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => refetch()} variant="outline">
                  Retry Loading
                </Button>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Program Anyway
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 bg-gradient-to-b from-background to-muted/5">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Programs
            </h1>
            <p className="text-muted-foreground">
              Manage your educational programs and courses
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="w-full sm:w-auto h-11 gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="h-4 w-4" />
            Create Program
          </Button>
        </div>

        {/* Stats Bar */}
        {programs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FolderOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalPrograms}</p>
                    <p className="text-sm text-muted-foreground">Total Programs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalCourses}</p>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{averageCourses}</p>
                    <p className="text-sm text-muted-foreground">Avg. Courses/Program</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{getPublishedCount()}/{totalPrograms}</p>
                    <p className="text-sm text-muted-foreground">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card> */}
          </div>
        )}

        {/* Empty State */}
        {programs.length === 0 && (
          <Card className="border-dashed shadow-lg max-w-2xl mx-auto bg-gradient-to-br from-card to-card/50">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <FolderOpen className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">No programs yet</h3>
              <p className="text-sm text-muted-foreground mb-8 max-w-md">
                Programs help you organize courses into structured learning paths. 
                Create your first program to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="lg"
                  className="gap-2 shadow-lg"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Program
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  // onClick={() => window.open('/docs', '_blank')}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Programs Grid */}
        {programs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Your Programs</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {totalPrograms} program{totalPrograms !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(true)}
                  className="gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add New
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => {
                const courseCount = program.courses?.length || program.courseCount || 0;
                // const isProgramPublished = program.isPublished || false;
                
                return (
                  <Card
                    key={program.id}
                    className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/30 bg-gradient-to-b from-card to-card/50 relative overflow-hidden"
                    onClick={() => handleProgramClick(program.id)}
                  >
                    {/* {isProgramPublished && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="text-xs px-2 py-0.5">
                          Published
                        </Badge>
                      </div>
                    )} */}
                    
                    <CardHeader className="space-y-3 pb-4">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl">
                          <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                      <CardTitle className="text-xl line-clamp-2 pr-8">
                        {program.title}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-10">
                        {program.description || "No description provided"}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {courseCount}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {courseCount === 1 ? "course" : "courses"}
                            </span>
                          </div>
                        </div>
                        
                        {courseCount === 0 && (
                          <Badge variant="outline" className="text-xs">
                            No courses
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Create Program Modal */}
        <CreateProgramModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCreated={handleProgramCreated}
        />
      </div>
    </div>
  );
}