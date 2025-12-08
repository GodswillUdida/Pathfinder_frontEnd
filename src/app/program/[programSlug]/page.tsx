// app/program/[programSlug]/page.tsx
import { getProgramById } from "@/lib/api/program";

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgramById(id);

  return (
    <div>
      <h1>{program?.title}</h1>
      <p>{program?.description}</p>
      <p>{program?.description}</p>
      {/* <h1>Hello</h1> */}
      {/* Show courses inside this program */}
      {program?.courses?.map((course) => (
        <div key={course.id}>
          <h2>{course.title}</h2>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
}
