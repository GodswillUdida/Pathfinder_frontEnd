"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useCoursesList } from "@/hooks/useAdminCourses";
import { useProgramList } from "@/hooks/useAdminPrograms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  BookOpen,
  Building2,
  Globe,
  MoreVertical,
  Eye,
  Trash2,
  AlertCircle,
  ArrowUpRight,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

type CourseType = "physical" | "online";

type Course = {
  id: string;
  title: string;
  slug?: string;
  thumbnail?: string | null;
  description?: string | null;
  duration?: string | number | null;
  level?: string | null;
  createdAt?: string;
  updatedAt?: string;
  enrollmentCount?: number;
  tags?: string[];
  program?: { id: string; title: string; slug?: string } | null;
};

function CourseCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-5 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="pt-3 border-t flex justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}


// function CourseCard({ course }: { course: Course }) {
//   const isPhysical = course.type === "physical";
//   const date = course.updatedAt
//     ? (() => {
//         try {
//           return format(new Date(course.updatedAt), "MMM d, yyyy");
//         } catch {
//           return null;
//         }
//       })()
//     : null;

//   return (
//     <Card className="group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border hover:border-primary/30">
//       <CardHeader className="pb-3">
//         <div className="flex items-start justify-between">
//           <Badge
//             variant={isPhysical ? "default" : "secondary"}
//             className="text-xs"
//           >
//             {isPhysical ? (
//               <Building2 className="h-3 w-3 mr-1" />
//             ) : (
//               <Globe className="h-3 w-3 mr-1" />
//             )}
//             {isPhysical ? "Physical" : "Online"}
//           </Badge>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {course.program?.slug && course.slug && (
//                 <DropdownMenuItem asChild>
//                   <a
//                     href={`/courses/${course.program.slug}/${course.slug}`}
//                     target="_blank"
//                     rel="noreferrer"
//                   >
//                     <Eye className="mr-2 h-4 w-4" />
//                     View Live
//                   </a>
//                 </DropdownMenuItem>
//               )}
//               <DropdownMenuSeparator />
//               <DropdownMenuItem className="text-destructive focus:text-destructive">
//                 <Trash2 className="mr-2 h-4 w-4" />
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         <div className="mt-1">
//           <CardTitle className="text-base font-semibold leading-snug line-clamp-1">
//             {course.title}
//           </CardTitle>
//           {course.program?.title && (
//             <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
//               {course.program.title}
//             </p>
//           )}
//         </div>
//       </CardHeader>

//       <CardContent className="pt-0 space-y-3">
//         <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
//           {course.description ?? "No description provided"}
//         </p>

//         <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
//           {course.duration && (
//             <>
//               <span className="text-muted-foreground">Duration</span>
//               <span className="font-medium text-right">{course.duration}</span>
//             </>
//           )}
//           {course.level && (
//             <>
//               <span className="text-muted-foreground">Level</span>
//               <span className="font-medium text-right">{course.level}</span>
//             </>
//           )}
//           {course.enrollmentCount !== undefined && (
//             <>
//               <span className="text-muted-foreground">Enrolled</span>
//               <span className="font-medium text-right">
//                 {course.enrollmentCount}
//               </span>
//             </>
//           )}
//         </div>

//         {date && (
//           <div className="pt-3 border-t text-xs text-muted-foreground">
//             Updated {date}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }


const Badge = ({ children, type }: { children: React.ReactNode, type?: CourseType }) => (
  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest ${type === 'physical' ? 'bg-brand-contrast/10 text-brand-contrast' : 'bg-accent/10 text-accent border border-accent/20'}`}>
    {children}
  </span>
);

const StatPill = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: any }) => (
  <div className="glass-panel p-4 rounded-3xl flex flex-col gap-1 min-w-[140px] relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity">
      <Icon size={40} className="text-brand-contrast" />
    </div>
    <span className="text-brand-contrast/40 font-mono text-[10px] uppercase tracking-wider">{label}</span>
    <span className="text-2xl font-display font-bold leading-none text-brand-contrast">{value}</span>
  </div>
);

const CourseCard = ({ course, index }: { course: Course, index: number, key?: React.Key }) => {

  const date = course.updatedAt
    ? (() => {
      try {
        return format(new Date(course.updatedAt), "MMM d, yyyy");
      } catch {
        return null;
      }
    })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <div className="rounded-[2rem] overflow-hidden flex flex-col h-full transition-all duration-500 group-hover:border-accent/40 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-3">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-brand-contrast/5">
          <img
            src={course.thumbnail ?? `https://source.unsplash.com/400x300/?${encodeURIComponent(course.title)}`}
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100 border border-b"
          />
          <div className="absolute inset-0" />
          <div className="absolute top-4 left-4 border rounded-full">
            <Badge >{course.level || "All Levels"}</Badge>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-blue-500 block uppercase tracking-wide">{course.program?.title}</span>
              <h3 className="text-lg font-[Poppins] font-bold leading-tight text-brand-contrast transition-colors">{course.title}</h3>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 flex flex-col space-y-4">
          <p className="text-xs text-brand-contrast/60 font-sans line-clamp-2 leading-relaxed">
            {course.description || "No description provided for this course."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-brand-contrast/30" />
              <span className="text-xs font-mono text-brand-contrast/60">{course.enrollmentCount || 0} enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-brand-contrast/30" />
              <span className="text-xs font-['Poppins'] text-brand-contrast/60">{course.duration || "N/A"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-contrast/5 flex items-center justify-between">
            {/* <span className="text-[10px] font-mono text-brand-contrast/20 uppercase tracking-widest">lv. {course.level || "All Levels"}</span> */}

            {/* <span className="flex text-sm ">
            <p className="font-medium text-brand-contrast">Tags:</p>
              <p>
                {course.tags && course.tags.length > 0 ? (
                  course.tags.join(", ")
                ) : (
                  <span className="text-brand-contrast/30 italic">No tags</span>
                )}
              </p>
            </span> */}

            {date && (
              <div className="pt-3 border-t text-xs text-muted-foreground">
                Updated {date}
              </div>
            )}

            <a href={`/courses/${course.program?.slug}/${course.slug}`} className="flex items-center gap-1 text-xs font-bold hover:gap-2 transition-all group/btn cursor-pointer text-blue-500">
              Explore <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <Card className="border-dashed max-w-md mx-auto">
      <CardContent className="flex flex-col items-center py-12 text-center">
        <div className="w-12 h-12 mb-4 rounded-xl bg-muted flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold mb-1.5">No courses found</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Try adjusting your search or filters.
        </p>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminCoursesPage() {
  const { data, isLoading, error, refetch } = useCoursesList();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const courses = data?.data ?? [];

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "physical" | "online">(
    "all"
  );

  const filtered = useMemo((): Course[] => {
    const q: string = search.toLowerCase();
    return courses
      .filter((c: Course): boolean => {
        const matchesSearch: boolean =
          c.title.toLowerCase().includes(q) ||
          (c.program?.title ?? "").toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q);
        const matchesType: boolean =
          typeFilter === "all";
        return matchesSearch && matchesType;
      })
      .sort((a: Course, b: Course): number => {
        const da: number = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db: number = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
  }, [courses, search, typeFilter]);

  if (isLoading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {(error as Error).message ?? "Failed to load courses."}
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all courses across your programs.
          </p>
        </div>
        <Link href="/admin/programs">
          <Button variant="outline" className="gap-2 sm:w-auto w-full">
            <ArrowUpRight className="h-4 w-4" />
            Manage Programs
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {courses.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <StatPill label="total" value={courses.length} icon={BookOpen} />
        </div>
      )}

      {/* Filters */}
      {courses.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses..."
              className="pl-9"
            />
          </div>
        </div>
      )}

      {/* Content */}
      {courses.length === 0 ? (
        <Card className="border-dashed max-w-md mx-auto">
          <CardContent className="flex flex-col items-center py-14 text-center">
            <div className="w-12 h-12 mb-4 rounded-xl bg-muted flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-1.5">No courses yet</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Go to a program to add your first course.
            </p>
            <Link href="/admin/programs">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Browse Programs
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          onClear={() => {
            setSearch("");
            setTypeFilter("all");
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((course, index) => (
              <CourseCard key={course.id} course={course} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}