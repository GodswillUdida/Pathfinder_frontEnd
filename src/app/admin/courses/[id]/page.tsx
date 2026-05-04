/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCourse, useUpdateCourse } from "@/hooks/useAdminCourses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  Building2,
  Globe,
  Clock,
  BarChart2,
  Users,
  ExternalLink,
} from "lucide-react";

interface Props {
  params: { id: string };
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

export default function AdminCourseDetailPage({ params }: Props) {
  const router = useRouter();
  const { id: courseId } = params;

  const { data: course, isLoading, error } = useCourse(courseId);
  const updateCourse = useUpdateCourse(courseId);

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isLoading) return <PageSkeleton />;

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as Error).message ?? "Failed to load course."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Course not found.</AlertDescription>
        </Alert>
      </div>
    );
  }


  const handleSubmit = async (values: any) => {
    setServerError(null);
    setSuccess(false);
    try {
      await updateCourse.mutateAsync(values);
      setSuccess(true);
      setTimeout(() => router.push("/admin/courses"), 1500);
    } catch (err: any) {
      setServerError(err.message ?? "Update failed. Please try again.");
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      {/* Back nav */}
      <Link href="/admin/courses">
        <Button variant="ghost" size="sm" className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </Link>

      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" >
  
                <Globe className="h-3 w-3 mr-1" />
            </Badge>
            {course.program?.title && (
              <Badge variant="outline" className="text-xs font-normal">
                {course.program.title}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {course.title}
          </h1>
          {course.description && (
            <p className="text-sm text-muted-foreground max-w-lg">
              {course.description}
            </p>
          )}
        </div>

        {course.program?.slug && course.slug && (
          <a
            href={`/courses/${course.program.slug}/${course.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <ExternalLink className="h-3.5 w-3.5" />
              View Live
            </Button>
          </a>
        )}
      </div>

      {/* Alerts */}
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Course updated successfully. Redirecting…</AlertDescription>
        </Alert>
      )}

      {/* Details card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Course Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {course.duration && (
              <DetailRow
                label="Duration"
                value={
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.duration}
                  </span>
                }
              />
            )}
            {course.level && (
              <DetailRow
                label="Level"
                value={
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.level}
                  </span>
                }
              />
            )}
            {/* {course.enrollmentCount !== undefined && (
              <DetailRow
                label="Enrolled"
                value={
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    {course.enrollmentCount}
                  </span>
                }
              />
            )} */}
            {course.program?.title && (
              <DetailRow label="Program" value={course.program.title} />
            )}
            {course.slug && (
              <DetailRow
                label="Slug"
                value={
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                    {course.slug}
                  </code>
                }
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit form placeholder */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Edit Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Uncomment and replace with your CourseForm component:
          <CourseForm
            courseId={courseId}
            initialData={course}
            onSubmit={handleSubmit}
            isSubmitting={updateCourse.isLoading}
          /> */}
          <div className="flex items-center justify-center py-10 border border-dashed rounded-lg">
            <div className="text-center">
              <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium">Course form goes here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Plug in your <code>CourseForm</code> component with{" "}
                <code>onSubmit={"{handleSubmit}"}</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2">
        <Link href="/admin/courses">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button
          onClick={() => handleSubmit({})}
          // disabled={updateCourse.isLoading || success}
        >
          {/* {updateCourse.isLoading ? "Saving…" : "Save Changes"} */}
        </Button>
      </div>
    </div>
  );
}