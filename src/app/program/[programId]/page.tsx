// app/program/[programSlug]/page.tsx
import { getProgramById } from "@/lib/api/program";

export default async function ProgramPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const program = await getProgramById(id);

  console.log("Program Page data:", program);

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
