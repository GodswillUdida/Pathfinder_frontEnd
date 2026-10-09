export default async function ProgramPage({ params }: { params: Promise<{ programSlug: string }> }) {
  const { programSlug } = await params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Program: {programSlug}</h1>
      <p className="text-gray-600 dark:text-gray-400">
        This is a placeholder page for the program &quot;{programSlug}&quot;. You can
        customize this page to display program-specific information, courses, and
        other relevant content.
      </p>
    </div>
  );
}

