/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Plus,
  BookOpen,
  ArrowLeft,
  Clock,
  MapPin,
  GraduationCap,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { useProgram } from "@/hooks/useAdminPrograms";
import { CreateCourseModal } from "@/components/admin/CreateCourseModal";
// import { Course } from "@/types/course";

type Course = {
  title: string;
  slug?: string;
  description: string;
  thumbnail: string;
  level?: string;
  ctaegory?: string;
  tags?: string[];
  duration?: string;
  schedule?: string;
};

export default function ProgramPage() {
  const { programId } = useParams<{ programId: string }>();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useProgram(programId);

  console.log("Single pro data:", data);

  const navigateToCourse = (courseId: string) => {
    router.push(`/admin/programs/${programId}/courses/${courseId}`);
  };

  const handleBack = () => {
    router.push("/admin/programs");
  };

  const handleCourseCreated = () => {
    setIsModalOpen(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Program</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load program. Please try again."}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6">
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Program Not Found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {
                "The program you're looking for doesn't exist or has been removed."
              }
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Programs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const program = data;
  const courses = program?.courses ?? [];

  return (
    <div className="space-y-8 p-6 md:p-8">
      {/* Breadcrumb Navigation */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="gap-2 -ml-2 hover:bg-muted"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Programs
      </Button>

      {/* Program Header */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {program.title}
              </h1>
            </div>

            {program.description && (
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                {program.description}
              </p>
            )}
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="gap-2 w-full lg:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{courses.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {courses.length === 1 ? "Course" : "Courses"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter((c) => c.type === "physical").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Physical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {courses.filter((c: any) => c.type === "online").length}
                  </p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Courses</h2>
          {courses.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {courses.length} {courses.length === 1 ? "course" : "courses"}{" "}
              available
            </span>
          )}
        </div>

        {courses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-muted rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Start building your program by adding your first course. You can
                add both physical and online courses.
              </p>
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Course
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
                onClick={() => navigateToCourse(course.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigateToCourse(course.id);
                  }
                }}
              >
                <CardHeader className="space-y-3 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      variant={course.type === "physical" ? "online" : null}
                      className="text-xs"
                    >
                      {course.type === "physical" ? (
                        <>
                          <MapPin className="h-3 w-3 mr-1" />
                          Physical
                        </>
                      ) : (
                        <>
                          <BookOpen className="h-3 w-3 mr-1" />
                          Online
                        </>
                      )}
                    </Badge>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <CardTitle className="text-xl line-clamp-2 leading-snug">
                    {course.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                    {course.description || "No description available."}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {course.level && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        {course.level}
                      </Badge>
                    )}
                    {course.duration && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <Clock className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                    )}
                    {course.duration && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <MapPin className="h-3 w-3 mr-1" />
                        {course.duration}
                      </Badge>
                    )}
                    {/* {course.sc && (
                      <Badge variant="outline" className="text-xs font-normal">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    )} */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <CreateCourseModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        programId={program.id}
        onCreated={handleCourseCreated}
      />
    </div>
  );
}
