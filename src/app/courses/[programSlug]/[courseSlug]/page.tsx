// src/app/courses/[programSlug]/[courseSlug]/page.tsx

import { getCourseBySlugs } from "@/lib/api/course";

export default async function CoursePage({
  params,
}: {
  params: { programSlug: string; courseSlug: string };
}) {
  const { programSlug, courseSlug } = params;
  const course = await getCourseBySlugs(programSlug, courseSlug);

  if (!course) {
    return <div>Course not found</div>;
  }
  return (
    <div>
      <h1>{course?.title}</h1>
      <p>{course?.description}</p>
    </div>
  );
}
