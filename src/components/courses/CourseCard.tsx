"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { Course } from "@/types/course";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
      <div className="relative h-64 overflow-hidden rounded-t-lg">
        <Image
          src={course.thumbnail ?? " "}
          alt={course.title}
          fill
          className="h-34 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {
          course.level ? (<div className="absolute top-4 right-4 bg-blue-600 text-white px-2 py-1 rounded-full text-sm font-semibold">
            {course.level?.toLocaleUpperCase()}
          </div>) : null
        }
      </div>
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
          {/* <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
            {course.category || null}
          </span>  */}
          {
            course.category ? (<span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
            {course.category}
          </span> ) : null
          }
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration || "N/A"}
          </span>
          <span className="flex items-center gap-1 font-poppins">
            <Clock className="w-3 h-3" />
            {course.type?.toLocaleUpperCase() || "N/A"}
          </span>
        </div>

        <h3 className="text-sm font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 text-xs mb-4 flex-1 line-clamp-3">
          {course.description || "No description available."}
        </p>

        {course.tags && course.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            Tags:{" "}
            {course.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>{course.enrollmentCount ?? 0} enrolled</span>
          </div>
          <Link
            href={`/courses/${course.program?.slug}/${course.slug}`}
            passHref
          >
            <Button variant="ghost" size="sm" className="group/btn cursor-pointer transition-all duration-300 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500">
              Learn More
              <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
