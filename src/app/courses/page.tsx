import { Metadata } from "next";
import { CoursesClient } from "@/components/courses/CoursesClient";
import { getCourses } from "@/lib/api/course";

interface Course {
  id: string;
  title: string;
  description: string;
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professional Courses & Programs | Pathfinder",
  description: "Explore flexible online courses and diploma programs.",
};

export default async function CoursesPage() {

  let courses: any[] = [];
  
  try {
    courses = await getCourses();
  }  catch (error: unknown) {
    console.error("Error fetching courses for page:", error);
  }

  return <CoursesClient initialCourses={courses} />;
}
