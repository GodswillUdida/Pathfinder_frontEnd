import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCourseBySlugs } from "@/lib/api/course";
import CoursePage from "@/components/courses/CoursePage";
import { cache } from "react";

export const getCourseCached = cache(getCourseBySlugs);

interface PageParams {
  programSlug: string;
  courseSlug: string;
}

interface Props {
  params: Promise<PageParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programSlug, courseSlug } = await params;

  const course = await getCourseCached(programSlug, courseSlug);

  if (!course) {
    return {
      title: "Course not found | Pathfinder",
      description: "The requested course could not be found.",
    };
  }

  return {
    title: `${course.title} | Pathfinder`,
    description: course.description,
    openGraph: {
      title: `${course.title} | Pathfinder`,
      description: course.description,
      // Add images, url, etc. if you have course.thumbnail
    },
  };
}

export default async function Page({ params }: Props) {
  const { programSlug, courseSlug } = await params;

  // Extra safety (dynamic routes can theoretically be malformed in edge cases)
  if (!programSlug || !courseSlug) {
    notFound();
  }

  const course = await getCourseCached(programSlug, courseSlug);

  if (!course) {
    notFound();
  }

  // Pass enrolled={false} for public view (you can make this dynamic later
  // with auth + cookies/server-side session)
  return <CoursePage course={course} enrolled={false} />;
}
