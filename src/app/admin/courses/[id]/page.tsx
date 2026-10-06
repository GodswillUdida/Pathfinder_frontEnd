import { Suspense } from "react";
import type { Metadata } from "next";
import { CourseWorkspace } from "@/components/admin/course-workspace/CourseWorkspace";
import { PageSkeleton } from "@/components/admin/course-workspace/ui/PageSkeleton";

export const metadata: Metadata = {
  title: "Course workspace · Admin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

// Server component. It only unwraps the route param; everything interactive
// lives in the client tree. <Suspense> is required because the workspace
// reads the URL (?tab=) with useSearchParams.
export default async function AdminCourseWorkspacePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <CourseWorkspace courseId={id} />
    </Suspense>
  );
}
