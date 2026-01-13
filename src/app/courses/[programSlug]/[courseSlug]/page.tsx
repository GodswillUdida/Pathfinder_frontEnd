import { PhysicalCourseLeadForm } from "@/components/enrollment/EnrollmentRequestForm";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { getCourseBySlugs } from "@/lib/api/course";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Calendar,
  BarChart3,
  AwardIcon,
  Tag,
  Users,
  CheckCircle,
  BookOpen,
  Award,
  ChevronRight,
  Star,
  Bookmark,
  Share2,
  Eye,
  FileText,
  Video,
  Download,
  Brain,
  Target,
  TrendingUp,
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <Card className="max-w-md mx-auto border-none shadow-2xl bg-gradient-to-br from-card to-card/80">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-['Manrope'] font-bold text-foreground mb-3">
                Course Not Found
              </h2>
              <p className="text-muted-foreground mb-6">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <a href="/">Browse All Courses</a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/programs">Explore Programs</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isPhysical = course.type === "physical";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/5">
      <Navbar />

      {/* HERO IMAGE SECTION */}
      <section className="relative overflow-hidden">
        {/* <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10" /> */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />

        {/* Main Image */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-3xl shadow-2xl">
            {course.thumbnail ? (
              <Image
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/80 to-muted/60 flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /> */}

            {/* Image Overlay Content */}
            <div className="absolute bottom-8 left-8 right-8 z-20">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white border-0">
                  {isPhysical ? "🏢 In-Person" : "🌐 Online"}
                </Badge>
                {course.category && (
                  <Badge variant="secondary" className="px-4 py-1.5 backdrop-blur-sm bg-white/10 text-white border-0">
                    {course.category}
                  </Badge>
                )}
                {/* <div className="flex items-center gap-2 ml-auto">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div> */}
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-['Manrope'] font-bold text-white leading-tight mb-4 max-w-4xl">
                {course.title}
              </h1>

              {course.description && (
                <p className="text-lg text-white/90 leading-relaxed max-w-2xl mb-6">
                  {course.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6">
                {course.enrollmentCount && course.enrollmentCount > 0 && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Users className="h-5 w-5" />
                    <span className="font-semibold">{course.enrollmentCount}+ Students</span>
                  </div>
                )}
                {course.duration && (
                  <div className="flex items-center gap-2 text-white/90">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">{course.duration}</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center gap-2 text-white/90">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-semibold">{course.level}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="relative -mt-16 z-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Right Column - Enrollment Card */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-8 space-y-6">
                {/* Enrollment Card */}
                <Card className="border-border/40 shadow-xl bg-gradient-to-b from-card via-card to-card/90">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-xl font-['Manrope'] font-bold text-foreground mb-2">
                          {isPhysical ? "Secure Your Spot" : "Start Learning"}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                          {isPhysical
                            ? "Limited seats available for next session"
                            : "Access instantly after enrollment"}
                        </p>
                      </div>

                      <div className="lg:col-span-2 space-y-8">
                        {/* Course Info Cards */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <Card className="border-border/40 shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0">
                                  <Target className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-['Manrope'] font-semibold text-lg mb-2">Learning Outcomes</h3>
                                  <p className="text-muted-foreground text-sm">
                                    Master key concepts and practical skills through hands-on projects and real-world applications.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-border/40 shadow-lg bg-card/50 backdrop-blur-sm">
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0">
                                  <Brain className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-['Manrope'] font-semibold text-lg mb-2">Prerequisites</h3>
                                  <p className="text-muted-foreground text-sm">
                                    Basic understanding recommended. Suitable for {course.level?.toLowerCase() || "all"} levels.
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Schedule & Details */}
                        <Card className="border-border/40 shadow-lg">
                          <CardContent className="p-6">
                            <Tabs defaultValue="details" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">Course Details</TabsTrigger>
                                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                                {/* <TabsTrigger value="curriculum">Curriculum</TabsTrigger> */}
                              </TabsList>

                              <TabsContent value="details" className="space-y-4 pt-6">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">COURSE TYPE</h4>
                                    <p className="text-foreground font-medium">{isPhysical ? "In-Person" : "Online"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">DURATION</h4>
                                    <p className="text-foreground font-medium">{course.duration || "Flexible"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">SKILL LEVEL</h4>
                                    <p className="text-foreground font-medium">{course.level || "All Levels"}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">FORMAT</h4>
                                    <p className="text-foreground font-medium">
                                      {isPhysical ? "Hands-on Workshop" : "Self-Paced Learning"}
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent value="schedule" className="pt-6">
                                {course.schedule ? (
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                                      <Calendar className="h-5 w-5 text-primary mt-0.5" />
                                      <div>
                                        <h4 className="font-medium mb-1">Course Schedule</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                                          {course.schedule}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">Schedule information coming soon.</p>
                                )}
                              </TabsContent>
{/* 
                              <TabsContent value="curriculum" className="pt-6">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Course Progress</h4>
                                    <span className="text-sm text-muted-foreground">0/12 modules</span>
                                  </div>
                                  <Progress value={0} className="h-2" />
                                  <p className="text-sm text-muted-foreground">
                                    Comprehensive curriculum with interactive lessons, projects, and assessments.
                                  </p>
                                </div>
                              </TabsContent> */}
                            </Tabs>
                          </CardContent>
                        </Card>

                        {/* Skills Section */}
                        {/* {course.tags && course.tags.length > 0 && (
                <Card className="border-border/40 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-['Manrope'] font-semibold text-xl mb-4">What You'll Learn</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {course.tags.map((tag: string, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/10 border border-border/40"
                        >
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )} */}

                        {/* Benefits Section */}
                        <Card className="border-border/40 shadow-lg bg-gradient-to-br from-card to-card/80">
                          <CardContent className="p-6">
                            <h3 className="font-['Manrope'] font-semibold text-xl mb-6">Why Choose This Course?</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Star className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Expert Instruction</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Learn from industry professionals with years of experience.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <FileText className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Project Portfolio</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Build real projects to showcase your skills.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Award className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Certification</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Earn a recognized certificate upon completion.
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Career Support</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Access career resources and job placement assistance.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Course Highlights */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Next Session</span>
                          <span className="font-semibold">May 15, {new Date().getFullYear()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Seats Available</span>
                          <span className="font-semibold">{isPhysical ? "12/30" : "Unlimited"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Session Length</span>
                          <span className="font-semibold">{course.duration || "Flexible"}</span>
                        </div>
                      </div>

                      <Separator />

                      {/* Enrollment Form */}
                      <div className="pt-2">
                        {isPhysical ? (
                          <>
                            <div className="space-y-4 mb-6">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm">Personalized mentorship</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm">Hands-on projects</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <AwardIcon className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm">Certificate included</span>
                              </div>
                            </div>
                            <PhysicalCourseLeadForm courseId={course.id} />
                          </>
                        ) : (
                          <div className="text-center py-6 space-y-6">
                            <div className="space-y-4">
                              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
                                <Award className="h-8 w-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold mb-2 text-foreground">
                                  Online Enrollment Opening Soon
                                </h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                  Join the waitlist for early access and exclusive benefits.
                                </p>
                              </div>
                              <Button className="w-full" size="lg">
                                Join Waitlist
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                            <div className="pt-4 border-t">
                              <Button variant="outline" className="w-full" size="sm">
                                <Download className="mr-2 h-4 w-4" />
                                Download Syllabus
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Info Card */}
                {/* <Card className="border-border/40 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-4">Need Help Deciding?</h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Video className="mr-2 h-4 w-4" />
                        Watch Course Preview
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        Download Syllabus
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="mr-2 h-4 w-4" />
                        Schedule a Tour
                      </Button>
                    </div>
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-muted-foreground text-center">
                        Have questions?{" "}
                        <a href="#" className="text-primary font-medium hover:underline">
                          Contact our team
                        </a>
                      </p>
                    </div>
                  </CardContent>
                </Card> */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Card className="border-none shadow-2xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
            <CardContent className="p-12 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-3xl font-['Manrope'] font-bold text-foreground mb-4">
                  Transform Your Career Today
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Join thousands of students who have accelerated their careers with our courses.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* <Button size="lg" className="gap-2 px-8">
                    {isPhysical ? "Request Enrollment" : "Join Waitlist"}
                    <ChevronRight className="h-4 w-4" />
                  </Button> */}
                  <Button size="lg" variant="outline" className="px-8">
                    Download Course Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}