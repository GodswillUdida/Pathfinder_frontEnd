import { Metadata } from "next";
import { notFound } from "next/navigation";
import { courseApi } from "@/lib/api/course";
import { cache } from "react";
import CoursePage from "@/components/courses/CoursePage";

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export const getCourseCached = cache(courseApi.getByCourseSlug);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  try {
    const course = await getCourseCached(courseSlug);
    return {
      title: `${course.data?.title} | Pathfinder`,
      description:
        course.data?.description ||
        `Enroll in our ${course.data?.title} course today.`,
    };
  } catch {
    return { title: "Course Not Found | Pathfinder" };
  }
}

export default async function StandaloneCoursePage({ params }: PageProps) {
  const { courseSlug } = await params;
  let response: Awaited<ReturnType<typeof getCourseCached>>;

  try {
    response = await getCourseCached(courseSlug);
  } catch {
    notFound();
  }

  if (!response.data) {
    notFound();
  }

  return <CoursePage course={response.data} enrolled={false} />;
}
