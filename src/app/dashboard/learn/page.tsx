"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search, BookOpen, Layers, Star, Clock, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = "all" | "frontend" | "backend" | "design" | "data";
type Level    = "Beginner" | "Intermediate" | "Advanced";

interface Course {
  id:          string;
  title:       string;
  category:    Exclude<Category, "all">;
  lessons:     number;
  level:       Level;
  thumbnail?:  string;
  featured?:   boolean;
  description: string;
}

// ─── Static data (replace with API fetch) ────────────────────────────────────

const COURSES: Course[] = [
  { id: "react-hooks",    title: "React Hooks Deep Dive",          category: "frontend", lessons: 33, level: "Intermediate", featured: true,  description: "Master useState, useEffect, useCallback, and custom hooks." },
  { id: "postgres",       title: "PostgreSQL for App Developers",  category: "backend",  lessons: 28, level: "Beginner",     featured: true,  description: "Relational databases from zero to production-ready queries." },
  { id: "ux-principles",  title: "UI/UX Principles That Work",     category: "design",   lessons: 24, level: "Beginner",     featured: true,  description: "Craft interfaces that are clear, usable, and delightful." },
  { id: "typescript",     title: "TypeScript Mastery",             category: "frontend", lessons: 30, level: "Intermediate", featured: false, description: "Type-safe JavaScript — generics, inference, and advanced patterns." },
  { id: "nodejs-apis",    title: "Node.js & REST APIs",            category: "backend",  lessons: 25, level: "Intermediate", featured: false, description: "Build scalable HTTP services with Express and best practices." },
  { id: "python-data",    title: "Python for Data Science",        category: "data",     lessons: 40, level: "Beginner",     featured: false, description: "Pandas, NumPy, and Matplotlib — the full data workflow." },
  { id: "css-arch",       title: "CSS Architecture & Systems",     category: "frontend", lessons: 18, level: "Advanced",     featured: false, description: "Scalable CSS: design tokens, BEM, utility-first, and Tailwind." },
  { id: "d3-viz",         title: "Data Visualisation with D3",     category: "data",     lessons: 22, level: "Advanced",     featured: false, description: "Interactive charts and bespoke visualisations in the browser." },
  { id: "docker",         title: "Docker & Containerisation",      category: "backend",  lessons: 20, level: "Intermediate", featured: false, description: "Package, ship, and run apps reliably with Docker and Compose." },
  { id: "figma-adv",      title: "Advanced Figma Workflows",       category: "design",   lessons: 16, level: "Intermediate", featured: false, description: "Auto-layout, variables, components, and dev handoff." },
];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "All",      value: "all" },
  { label: "Frontend", value: "frontend" },
  { label: "Backend",  value: "backend" },
  { label: "Design",   value: "design" },
  { label: "Data",     value: "data" },
];

// ─── Level badge ─────────────────────────────────────────────────────────────

const LEVEL_STYLES: Record<Level, string> = {
  Beginner:     "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  Intermediate: "bg-amber-50  text-amber-800   border-amber-200   dark:bg-amber-500/10   dark:text-amber-400   dark:border-amber-500/20",
  Advanced:     "bg-pink-50   text-pink-800    border-pink-200    dark:bg-pink-500/10    dark:text-pink-400    dark:border-pink-500/20",
};

// ─── Category colour accents ──────────────────────────────────────────────────

const CATEGORY_THUMB: Record<Exclude<Category, "all">, { bg: string; icon: React.ElementType }> = {
  frontend: { bg: "bg-indigo-50  dark:bg-indigo-500/10",  icon: Layers },
  backend:  { bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: BookOpen },
  design:   { bg: "bg-amber-50   dark:bg-amber-500/10",   icon: Star },
  data:     { bg: "bg-purple-50  dark:bg-purple-500/10",  icon: Clock },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function CourseCard({ course, featured = false }: { course: Course; featured?: boolean }) {
  const { bg, icon: Icon } = CATEGORY_THUMB[course.category];

  return (
    <Link
      href={`/courses/${course.id}`}
      className={cn(
        "group flex flex-col bg-white dark:bg-white/[0.04] rounded-2xl overflow-hidden",
        "border border-black/[0.06] dark:border-white/[0.07]",
        "hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-200"
      )}
    >
      {/* Thumbnail */}
      <div className={cn("relative flex items-center justify-center", featured ? "aspect-[2/1]" : "aspect-video", bg)}>
        {course.thumbnail ? (
          <Image src={course.thumbnail} alt={course.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <Icon className="w-10 h-10 text-current opacity-25" aria-hidden="true" />
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 text-[9px] font-semibold text-indigo-800 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 px-2 py-0.5 rounded-full">
            <Star className="w-2.5 h-2.5" aria-hidden="true" />
            Featured
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 flex-1 flex flex-col">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400 dark:text-white/30 mb-1 capitalize">
          {course.category}
        </p>
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-2">
          {course.title}
        </h3>
        {featured && (
          <p className="text-[11px] text-gray-400 dark:text-white/40 leading-relaxed mb-3 line-clamp-2">
            {course.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between">
          <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/35">
            <BookOpen className="w-3 h-3" aria-hidden="true" />
            {course.lessons} lessons
          </span>
          <span className={cn("text-[9px] font-semibold px-2 py-0.5 rounded-full border", LEVEL_STYLES[course.level])}>
            {course.level}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch]     = useState("");

  const featured = useMemo(() => COURSES.filter((c) => c.featured), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return COURSES.filter((c) => {
      const matchCat    = category === "all" || c.category === category;
      const matchSearch = c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [category, search]);

  const showFeatured = category === "all" && !search;

  return (
    // <div className="max-w-5xl mx-auto px-4 py-2 space-y-6">

    //   {/* ── Header ──────────────────────────────────── */}
    //   <div>
    //     <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Browse courses</h1>
    //     <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">Discover what to learn next</p>
    //   </div>

    //   {/* ── Controls ────────────────────────────────── */}
    //   <div className="flex flex-col sm:flex-row gap-3">
    //     {/* Search */}
    //     <div className="relative flex-1 max-w-xs">
    //       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
    //       <input
    //         type="search"
    //         placeholder="Search all courses…"
    //         value={search}
    //         onChange={(e) => setSearch(e.target.value)}
    //         className="w-full pl-9 pr-4 py-2 text-[12px]
    //                    bg-white dark:bg-white/[0.05]
    //                    border border-black/[0.08] dark:border-white/[0.08] rounded-xl
    //                    text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/30
    //                    focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
    //         aria-label="Search courses"
    //       />
    //     </div>

    //     {/* Category filters */}
    //     <div className="flex gap-1.5 flex-wrap" role="tablist" aria-label="Filter by category">
    //       {CATEGORIES.map((cat) => (
    //         <button
    //           key={cat.value}
    //           onClick={() => setCategory(cat.value)}
    //           role="tab"
    //           aria-selected={category === cat.value}
    //           className={cn(
    //             "px-3.5 py-1.5 rounded-[9px] text-[11px] font-medium transition-all border",
    //             category === cat.value
    //               ? "bg-indigo-600 text-white border-indigo-600"
    //               : "bg-white dark:bg-white/[0.04] text-gray-600 dark:text-white/50 border-black/[0.07] dark:border-white/[0.07] hover:border-indigo-300 dark:hover:border-indigo-500/30"
    //           )}
    //         >
    //           {cat.label}
    //         </button>
    //       ))}
    //     </div>
    //   </div>

    //   {/* ── Featured section ─────────────────────────── */}
    //   {showFeatured && (
    //     <section aria-label="Featured courses">
    //       <div className="flex items-center justify-between mb-3">
    //         <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
    //           Featured
    //         </h2>
    //       </div>
    //       <div className="grid sm:grid-cols-3 gap-4">
    //         {featured.map((c) => <CourseCard key={c.id} course={c} featured />)}
    //       </div>
    //     </section>
    //   )}

    //   {/* ── All / filtered courses ────────────────────── */}
    //   <section aria-label="All courses">
    //     <div className="flex items-center justify-between mb-3">
    //       <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
    //         {showFeatured ? "All courses" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
    //       </h2>
    //     </div>

    //     {filtered.length === 0 ? (
    //       <div className="flex flex-col items-center py-14 bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.06]">
    //         <BookOpen className="w-10 h-10 text-gray-300 dark:text-white/20 mb-3" />
    //         <p className="text-[13px] font-medium text-gray-700 dark:text-white/70">No courses found</p>
    //         <p className="text-[11px] text-gray-400 dark:text-white/35 mt-1">Try a different search or category.</p>
    //       </div>
    //     ) : (
    //       <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    //         {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
    //       </div>
    //     )}
    //   </section>
    // </div>
    <div>Learn Page</div>
  );
}