// app/program/[programSlug]/page.tsx
import { notFound } from "next/navigation";
import { getProgramBySlug } from "@/lib/api/program";

export default async function ProgramPage({
  params,
}: {
  params: { programSlug: string };
}) {
  const program = await getProgramBySlug(params.programSlug);

  if (!program) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{program.title}</h1>
        <p className="text-gray-600 mt-2">{program.description}</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {program.courses?.map((course) => (
          <article
            key={course.id}
            className="p-4 border rounded-xl hover:shadow transition"
          >
            <h2 className="font-semibold text-lg">{course.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
