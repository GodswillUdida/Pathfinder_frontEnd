import { Metadata } from "next";
import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/courses/LoadingSkeleton";
import { CoursesClient } from "@/components/courses/CoursesClient";
// import { Course } from "@/types/course";
import { getCourses } from "@/lib/api/course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professional Courses & Programs | Pathfinder",
  description:
    "Explore flexible online courses and diploma programs designed for your success. Browse 100+ courses across various categories.",
  openGraph: {
    title: "Professional Courses & Programs",
    description: "Discover courses that match your career goals.",
    images: ["/AP-Logo-5-(1).svg"],
  },
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CoursesClient initialCourses={courses} />
    </Suspense>
  );
}
