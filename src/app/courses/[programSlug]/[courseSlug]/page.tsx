import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cache } from "react";
import CoursePage from "@/components/courses/CoursePage";
import { courseApi } from "@/lib/api/course";

// Dedupes the fetch between generateMetadata and the page component
// within a single request — this is React's request-scoped cache(),
// not cross-request caching, so no TanStack Query hydration is needed
// here (there's no client-side refetch of course data on this page).
export const getCourseCached = cache(courseApi.getBySlug);

interface PageParams {
  programSlug: string;
  courseSlug: string;
}

interface Props {
  params: Promise<PageParams>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { programSlug, courseSlug } = await params;

  try {
    const res = await getCourseCached(programSlug, courseSlug);

    // The envelope ({success, data}) is truthy even on a 404 — check
    // .data specifically, same as the page component below does.
    if (!res?.data) {
      return {
        title: "Course not found | Pathfinder",
        description: "The requested course could not be found.",
      };
    }

    return {
      title: `${res.data.title} | Pathfinder`,
      description: res.data.description,
      openGraph: {
        title: `${res.data.title} | Pathfinder`,
        description: res.data.description ?? "Explore this course on Pathfinder.",
      },
    };
  } catch {
    return {
      title: "Course not found | Pathfinder",
      description: "The requested course could not be found.",
    };
  }
}

export default async function Page({ params }: Props) {
  const { programSlug, courseSlug } = await params;

  if (!programSlug || !courseSlug) {
    notFound();
  }

  let course;
  try {
    const res = await getCourseCached(programSlug, courseSlug);
    course = res?.data;
  } catch {
    notFound();
  }

  if (!course) {
    notFound();
  }

  // Pass enrolled={false} for public view (make this dynamic later
  // with auth + cookies/server-side session)
  return (
    <CoursePage
      course={course}
      programSlug={programSlug}
      enrolled={false}
    />
  );
}