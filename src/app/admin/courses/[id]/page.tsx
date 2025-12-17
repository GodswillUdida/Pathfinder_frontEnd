"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCourse, useUpdateCourse } from "@/hooks/useAdminCourses";
import { CourseForm } from "@/components/admin/CourseForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface Props {
  params: { courseId: string };
}

export default function AdminEditCoursePage({ params }: Props) {
  const router = useRouter();
  const { courseId } = params;

  const { data: course, isLoading, error } = useCourse(courseId);
  const updateCourse = useUpdateCourse(courseId);

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    );
  }

  if (!course) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Course not found</AlertDescription>
      </Alert>
    );
  }

  const handleSubmit = async (values: any) => {
    setServerError(null);
    setSuccess(false);

    try {
      await updateCourse.mutateAsync(values);
      setSuccess(true);

      setTimeout(() => {
        router.push("/admin/courses");
      }, 1500);
    } catch (err: any) {
      setServerError(err.message || "Update failed");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Course</h1>

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Course updated successfully</AlertDescription>
        </Alert>
      )}

      <CourseForm initialData={course} onSubmit={handleSubmit} />
    </div>
  );
}
