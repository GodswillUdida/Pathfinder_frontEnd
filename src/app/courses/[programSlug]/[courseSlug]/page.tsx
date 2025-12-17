import { PhysicalCourseLeadForm } from "@/components/enrollment/EnrollmentRequestForm";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getCourseBySlugs } from "@/lib/api/course";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

export default async function CoursePage({
  params,
}: {
  params: { programSlug: string; courseSlug: string };
}) {
  const { programSlug, courseSlug } = await params;
  const course = await getCourseBySlugs(programSlug, courseSlug);

  if (!course) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-red-500 text-lg">
        Course not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* HERO */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12 space-y-4">
          <Badge variant="secondary" className="w-fit">
            {course.type === "physical" ? "Physical Course" : "Online Course"}
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight">
            {course.title}
          </h1>

          <Image
            src={course.thumbnail || ""}
            alt={`Image of ${course.title}`}
            width={350}
            height={300}
            className="object-cover"
          />

          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            {course.description}
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        {course.type === "physical" ? (
          <PhysicalCourseLeadForm courseId={course.id} />
        ) : (
          <div className="rounded-lg border bg-muted/40 p-6 text-center">
            <p className="text-lg font-medium">Online enrollment coming soon</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This course will support direct online enrollment shortly.
            </p>
          </div>
        )}
      </section>

      <Separator />

      <Footer />
    </div>
  );
}
