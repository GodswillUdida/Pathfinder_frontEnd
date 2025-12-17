import { Metadata } from "next";
import { CoursesClient } from "@/components/courses/CoursesClient";
import { getCourses } from "@/lib/api/course";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professional Courses & Programs | Pathfinder",
  description: "Explore flexible online courses and diploma programs.",
  // openGraph: {
  //   title: "Professional Courses & Programs",
  //   description: "Discover courses that match your career goals.",
  //   siteName:"Accountant Pathfinder",
  //   images  : ["/AP-Logo-5-(1).svg"],
  // },
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return <CoursesClient initialCourses={courses} />;
}
