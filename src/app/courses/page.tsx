import { Metadata } from "next";
import { CoursesClient } from "@/components/courses/CoursesClient";
import { courseApi } from "@/lib/api/course";

// interface Course {
//   id: string;
//   title: string;
//   description: string;
// }

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professional Courses & Programs | Pathfinder",
  description: "Explore flexible online courses and diploma programs.",
};

export default async function CoursesPage() {

  let courses: any[] = [];
  
  try {
    const res = await courseApi.list();
    // console.log("Fetched courses for page:", res.data);
    courses = res.data;
  }  catch (error: unknown) {
    console.error("Error fetching courses for page:", error);
  }

  return <CoursesClient initialCourses={courses} />;
}
