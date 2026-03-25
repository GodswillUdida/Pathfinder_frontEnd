import { Metadata } from "next";
import { CoursesClient } from "@/components/courses/CoursesClient";
import { getCourses } from "@/lib/api/course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professional Courses & Programs | Pathfinder",
  description: "Explore flexible online courses and diploma programs.",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return <CoursesClient initialCourses={courses} />;
}
