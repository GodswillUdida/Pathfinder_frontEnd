"use client";

import { useMemo, useState } from "react";
import { useCoursesList } from "@/hooks/useAdminCourses";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Edit2, 
  Plus, 
  BookOpen, 
  Building2, 
  Globe, 
  Filter, 
  SortAsc, 
  MoreVertical,
  Eye,
  Download,
  Trash2,
  Users,
  Calendar
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { PhysicalCourseForm } from "@/components/admin/PhysicalForm";
import { useProgramList } from "@/hooks/useAdminPrograms";
import { format } from "date-fns";

export default function AdminCoursesPage() {
  const { data, isLoading, error, refetch } = useCoursesList();
  const courses = data ?? [];
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedPhysicalProgram, setSelectedPhysicalProgram] = useState<string | null>(null);

  const { data: programData } = useProgramList();
  const programs = programData?.programs ?? [];

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courses
      .filter((c) => {
        const matchesSearch = 
          c.title.toLowerCase().includes(q) ||
          c.program?.title?.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q);
        
        // const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        const matchesType = typeFilter === "all" || c.type === typeFilter;
        
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [courses, search, statusFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = courses.length;
    const physical = courses.filter(c => c.type === "physical").length;
    const online = courses.filter(c => c.type !== "physical").length;
    
    return { total, physical, online, };
  }, [courses]);

  if (isLoading) return <SkeletonGrid />;
  if (error) return <EnhancedErrorState message={String(error)} onRetry={refetch} />;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/5 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage all your courses in one place
            </p>
          </div>
          
          {/* <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
            <Button className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
              <BookOpen className="h-4 w-4" />
              View Analytics
            </Button>
          </div> */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Courses"
            value={stats.total}
            icon={BookOpen}
            color="blue"
            trend={"+12%"}
          />
          <StatCard
            title="Physical"
            value={stats.physical}
            icon={Building2}
            color="green"
          />
          <StatCard
            title="Online"
            value={stats.online}
            icon={Globe}
            color="purple"
          />
          {/* <StatCard
            title="Published"
            value={stats.published}
            icon={CheckCircle}
            color="emerald"
          /> */}
          {/* <StatCard
            title="Drafts"
            value={stats.draft}
            icon={Clock}
            color="amber"
          /> */}
        </div>

        {/* Search and Filter Bar */}
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses by title, program, or description..."
                  className="pl-10"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <SortAsc className="h-4 w-4" />
                      Type
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTypeFilter("all")}>
                      All Types
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTypeFilter("physical")}>
                      Physical
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTypeFilter("online")}>
                      Online
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              Physical ({filteredCourses.length})
            </TabsTrigger>
            <TabsTrigger value="online">
              Online ({stats.online})
            </TabsTrigger>
          </TabsList>

          {/* ALL COURSES */}
          <TabsContent value="all">
            {filteredCourses.length === 0 ? (
              <EmptyCourseState onSearchChange={setSearch} />
            ) : (
              <EnhancedCourseGrid courses={filteredCourses} />
            )}
          </TabsContent>

          {/* PHYSICAL */}
          <TabsContent value="physical">
            {selectedPhysicalProgram ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Create Physical Course</h3>
                </div>
                <Card>
                  <CardContent className="pt-6">
                    <PhysicalCourseForm courseId={selectedPhysicalProgram} />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Select a Program</h3>
                  <Badge variant="outline">
                    {programs.length} programs
                  </Badge>
                </div>
                <ProgramSelector
                  programs={programs}
                  onSelect={setSelectedPhysicalProgram}
                />
              </div>
            )}
          </TabsContent>

          {/* ONLINE */}
          <TabsContent value="online">
            <ComingSoonFeature />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{programs.length}</div>
                <div className="text-sm text-muted-foreground">Active Programs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* -------------------------------- */
/* Enhanced Components              */
/* -------------------------------- */

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
  trend?: string; 
}) {
  const colorClasses = {
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20"
  };

  return (
    <Card className={`border-l-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses].split(' ')[0]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 text-xs font-medium text-green-500">
            ↑ {trend} from last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EnhancedCourseGrid({ courses }: { courses: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function CourseCard({ course }: { course: any }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/40 bg-gradient-to-b from-card to-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={course.type === "physical" ? "default" : "secondary"}>
                {course.type === "physical" ? "🏢 Physical" : "🌐 Online"}
              </Badge>
            </div>
            <CardTitle className="text-lg line-clamp-1 mb-1">
              {course.title}
            </CardTitle>
            {course.program?.title && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                Program: {" "}
                {course.program.title}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`/courses/${course.program?.slug}/${course.slug}`, '_blank')}>
                <Eye className="mr-2 h-4 w-4" />
                View Live
              </DropdownMenuItem>
              {/* <DropdownMenuItem onClick={() => window.location.href = `/admin/courses/${course.id}`}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Course
              </DropdownMenuItem> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {course.description || "No description provided"}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium">{course.duration || "Not set"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Level</span>
            <span className="font-medium">{course.level || "Not set"}</span>
          </div>
          {course.enrollmentCount !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Enrolled</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="font-medium">{course.enrollmentCount}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3 w-3" />
            Updated {formatDate(course.updatedAt)}
          </div>
          {/* <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            onClick={() => window.location.href = `/admin/courses/${course.id}`}
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </Button> */}
        </div>
      </CardFooter>
    </Card>
  );
}

function ProgramSelector({
  programs,
  onSelect,
}: {
  programs: any[];
  onSelect: (id: string) => void;
}) {
  if (programs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Programs Available</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            You need to create a program first before adding courses.
          </p>
          <Button asChild>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {programs.map((program) => (
        <Card 
          key={program.id} 
          className="cursor-pointer group hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary/50"
          onClick={() => onSelect(program.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <Badge variant="outline" className="text-xs">
                {program.courses?.length || 0} courses
              </Badge>
            </div>
            <CardTitle className="mt-4">{program.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {program.description || "No description available"}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full justify-between group-hover:text-primary">
              Add Course
              <Plus className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array(5).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Courses Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EnhancedErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full border-destructive/20">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {message || "Failed to load courses. Please try again."}
            </AlertDescription>
          </Alert>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Unable to Load Courses</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error fetching your courses. This might be a temporary issue.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={onRetry} variant="outline">
                Retry
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyCourseState({ onSearchChange }: { onSearchChange: (value: string) => void }) {
  return (
    <Card className="border-dashed max-w-2xl mx-auto">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3">No Courses Found</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Try adjusting your search or create your first course to get started.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => onSearchChange("")}
            variant="outline"
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear Filters
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create First Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ComingSoonFeature() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center">
          <Globe className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold mb-3">Online Courses Coming Soon</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          We're working on online course management features. Stay tuned for updates!
        </p>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          View Preview
        </Button>
      </CardContent>
    </Card>
  );
}