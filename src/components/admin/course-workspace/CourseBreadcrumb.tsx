"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Layers,
} from "lucide-react";

interface CourseBreadcrumbProps {
  courseTitle: string;
  program?: { id: string; title: string } | null;
}

export function CourseBreadcrumb({
  courseTitle,
  program,
}: CourseBreadcrumbProps) {
  const link =
    "inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <nav aria-label="Breadcrumb">
      {/* Mobile: compact back + current context */}
      <div className="flex items-center gap-2 sm:hidden mt-7">
        <Link
          href={
            program?.id ? `/admin/programs/${program.id}` : "/admin/courses"
          }
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:border-brand-300 hover:text-foreground active:bg-secondary"
          aria-label={
            program?.title
              ? `Back to ${program.title}`
              : "Back to courses"
          }
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold leading-tight text-foreground">
            {courseTitle}
          </p>
          {program?.title && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              in {program.title}
            </p>
          )}
        </div>
      </div>

      {/* Tablet / desktop: full trail */}
      <ol className="hidden min-w-0 items-center gap-1.5 text-[12.5px] text-muted-foreground sm:flex">
        <li className="shrink-0">
          <Link href="/admin/courses" className={link}>
            <BookOpen className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
            Courses
          </Link>
        </li>

        {program?.title ? (
          <>
            <li aria-hidden className="shrink-0">
              <ChevronRight className="h-3.5 w-3.5 opacity-40" />
            </li>
            <li className="min-w-0 shrink">
              <Link
                href={`/admin/programs/${program.id}`}
                className={`${link} max-w-48 truncate lg:max-w-[16rem]`}
              >
                <Layers className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
                <span className="truncate">{program.title}</span>
              </Link>
            </li>
            <li aria-hidden className="shrink-0">
              <ChevronRight className="h-3.5 w-3.5 opacity-40" />
            </li>
          </>
        ) : (
          <li aria-hidden className="shrink-0">
            <ChevronRight className="h-3.5 w-3.5 opacity-40" />
          </li>
        )}

        <li
          aria-current="page"
          className="flex min-w-0 items-center gap-1.5 font-medium text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
          <span className="truncate">{courseTitle}</span>
        </li>
      </ol>
    </nav>
  );
}