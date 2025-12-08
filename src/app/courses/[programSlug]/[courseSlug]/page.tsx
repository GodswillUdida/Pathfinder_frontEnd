// src/app/courses/[programSlug]/[courseSlug]/page.tsx

import { getCourseBySlugs } from "@/lib/api/course";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ programSlug: string; courseSlug: string }>;
}) {
  const { programSlug, courseSlug } = await params;
  const course = await getCourseBySlugs(programSlug, courseSlug);
  

  return (
    <div>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
    </div>
  );
}
