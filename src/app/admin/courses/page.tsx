"use client";

import { useMemo, useState } from "react";
import { useCoursesList } from "@/hooks/useAdminCourses";
// import { useProgramsList } from "@/hooks/useAdminPrograms"; // assume you have this

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Edit2 } from "lucide-react";

// import { CourseForm } from "@/components/admin/CourseForm";
import { PhysicalCourseForm } from "@/components/admin/PhysicalForm";
import { useProgramList } from "@/hooks/useAdminPrograms";

export default function AdminCoursesPage() {
  const { data, isLoading, error } = useCoursesList();
  const courses = data ?? [];
  console.log("Courses:", courses)

  const [search, setSearch] = useState("");
  const [selectedPhysicalProgram, setSelectedPhysicalProgram] = useState<
    string | null
  >(null);
  const [selectedOnlineProgram, setSelectedOnlineProgram] = useState<
    string | null
  >(null);

  const { data:program } = useProgramList();
  // fetch all programs
  const programs = program?.programs;

  // console.log("Page Pro:", programs)

  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.program?.title?.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [courses, search]);

  if (isLoading) return <SkeletonGrid />;
  if (error) return <ErrorState message={String(error)} />;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header search={search} setSearch={setSearch} />

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="physical">Create Physical</TabsTrigger>
          <TabsTrigger value="online">Create Online</TabsTrigger>
        </TabsList>

        {/* ALL COURSES */}
        <TabsContent value="all">
          <CourseGrid courses={filteredCourses} />
        </TabsContent>

        {/* PHYSICAL */}
        <TabsContent value="physical">
          {!selectedPhysicalProgram ? (
            <ProgramSelector
              programs={programs ?? []}
              onSelect={(id) => setSelectedPhysicalProgram(id)}
            />
          ) : (
            <PhysicalCourseForm courseId={selectedPhysicalProgram} />
          )}
        </TabsContent>

        {/* ONLINE */}
        {/* <TabsContent value="online">
          {!selectedOnlineProgram ? (
            <ProgramSelector
              programs={programs ?? []}
              onSelect={(id) => setSelectedOnlineProgram(id)}
            />
          ) : (
            <CourseForm courseId={selectedOnlineProgram} />
          )}
        </TabsContent> */}
      </Tabs>
    </div>
  );
}

/* -------------------------------- */
/* Components                        */
/* -------------------------------- */

function Header({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <h1 className="text-3xl font-bold">Courses</h1>

      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="pl-10"
        />
      </div>
    </div>
  );
}

function ProgramSelector({
  programs,
  onSelect,
}: {
  programs: any[];
  onSelect: (id: string) => void;
}) {
  if (!programs.length)
    return <p className="text-center py-10">No programs found.</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() => onSelect(p.id)}
        >
          <CardHeader>
            <CardTitle>{p.title}</CardTitle>
          </CardHeader>
          <CardContent>{p.description || "No description"}</CardContent>
        </Card>
      ))}
    </div>
  );
}

function CourseGrid({ courses }: { courses: any[] }) {
  if (!courses.length)
    return <p className="text-center py-10">No courses found.</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <Card key={course.id} className="group hover:shadow-lg transition">
          <CardHeader>
            <CardTitle>{course.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {course.type?.toUpperCase()}
            </p>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3">
              {course.description || "No description"}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2"
              onClick={() =>
                (window.location.href = `/admin/courses/${course.id}`)
              }
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-xl" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[60vh] text-red-500">
      {message}
    </div>
  );
}

