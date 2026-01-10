import { PhysicalCourseLeadForm } from "@/components/enrollment/EnrollmentRequestForm";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getCourseBySlugs } from "@/lib/api/course";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Calendar,
  BarChart3,
  Tag,
  FolderOpen,
  Users,
} from "lucide-react";

export default async function CoursePage({
  params,
}: {
  params: { programSlug: string; courseSlug: string };
}) {
  const { programSlug, courseSlug } = await params;
  const course = await getCourseBySlugs(programSlug, courseSlug);

  if (!course) {
    return (
      <div className="min-h-screen bg-background font-['Inter']">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-foreground mb-2">
              Course Not Found
            </h2>
            <p className="text-muted-foreground">
              {
                "The course you're looking for doesn't exist or has been removed."
              }
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-['Inter']">
      <Navbar />

      {/* HERO SECTION */}
      <section className="border-b bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left Column - Course Info */}
            <div className="lg:col-span-3 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {course.category && (
                    <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest">
                      {course.category}
                    </span>
                  )}
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs font-medium text-muted-foreground/80 uppercase tracking-widest">
                    {course.type === "physical" ? "In-Person" : "Online"}
                  </span>
                </div>

                <h1 className="text-3xl lg:text-4xl font-['Manrope'] font-bold tracking-tight leading-tight text-foreground">
                  {course.title}
                </h1>

                {course.description && (
                  <p className="text-base text-muted-foreground leading-relaxed font-['Inter'] max-w-2xl">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Course Metadata */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                {course.level && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-1">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span className="uppercase tracking-widest font-medium">
                        Level
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {course.level}
                    </p>
                  </div>
                )}

                {course.duration && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="uppercase tracking-widest font-medium">
                        Duration
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {course.duration}
                    </p>
                  </div>
                )}

                {course.enrollmentCount && course.enrollmentCount > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-1">
                      <Users className="h-3.5 w-3.5" />
                      <span className="uppercase tracking-widest font-medium">
                        Students
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {course.enrollmentCount} enrolled
                    </p>
                  </div>
                )}

                {course.location && (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="uppercase tracking-widest font-medium">
                        Location
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground uppercase">
                      {course.location}
                    </p>
                  </div>
                )}
              </div>

              {/* Schedule */}
              {course.schedule && (
                <div className="border-l-2 border-foreground/80 pl-4 py-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70 mb-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="uppercase tracking-widest font-medium">
                      Schedule
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed text-foreground">
                    {course.schedule}
                  </p>
                </div>
              )}

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 text-xs font-medium border border-border/60 rounded-full text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Course Image */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-8">
                {course.thumbnail ? (
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-muted">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="aspect-3/4 w-full bg-muted" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ENROLLMENT SECTION */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl">
          <div className="mb-8">
            <h2 className="text-2xl font-['Manrope'] font-bold mb-2 text-foreground">
              {course.type === "physical"
                ? "Request Enrollment"
                : "Join This Course"}
            </h2>
            <p className="text-muted-foreground text-sm font-['Inter']">
              {course.type === "physical"
                ? "Submit your information to begin the enrollment process."
                : "Online enrollment is currently unavailable."}
            </p>
          </div>

          {course.type === "physical" ? (
            <div className="border-t border-border/50 pt-8">
              <PhysicalCourseLeadForm courseId={course.id} />
            </div>
          ) : (
            <div className="border border-border/60 rounded p-12 text-center">
              <h3 className="text-base font-medium mb-2 text-foreground">
                Coming Soon
              </h3>
              <p className="text-muted-foreground text-sm">
                Online enrollment functionality will be available shortly.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* COURSE DETAILS */}
      {(course.level ||
        course.duration ||
        (course.type === "physical" && course.location)) && (
        <section className="border-t border-border/50 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <h2 className="text-xl font-['Manrope'] font-bold mb-8 text-foreground">
              Course Overview
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {course.level && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium mb-2">
                    Skill Level
                  </h3>
                  <p className="text-sm font-['Inter'] text-foreground/90 leading-relaxed">
                    Designed for {course.level.toLowerCase()} learners with
                    tailored content and pacing.
                  </p>
                </div>
              )}

              {course.duration && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium mb-2">
                    Time Commitment
                  </h3>
                  <p className="text-sm font-['Inter'] text-foreground/90 leading-relaxed">
                    Complete the course in {course.duration} at your own pace.
                  </p>
                </div>
              )}

              {course.type === "physical" && course.location && (
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground/70 font-medium mb-2">
                    Location
                  </h3>
                  <p className="text-sm font-['Inter'] text-foreground/90 leading-relaxed">
                    {course.location}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
