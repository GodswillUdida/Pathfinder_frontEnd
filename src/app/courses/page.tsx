import { Metadata } from "next";
import { Suspense } from "react";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { CoursesClient } from "@/components/courses/CoursesClient";
import { CoursesPageSkeleton } from "@/components/courses/CoursesPageSkeleton";
import { courseApi } from "@/lib/api/course";
import { getQueryClient } from "@/lib/query-client";
import { courseKeys } from "@/hooks/useCourses";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Professional Courses & Programs | Pathfinder",
  description: "Explore flexible online courses and diploma programs.",
};

export default async function CoursesPage() {
  const queryClient = getQueryClient();

  // Prefetches under courseKeys.list({}) — the SAME key useCoursesList()
  // builds client-side when called with no params. If this key and the
  // hook's key ever diverge, hydration silently misses and the duplicate
  // GET /courses request comes back.
  await queryClient.prefetchQuery({
    queryKey: courseKeys.list({}),
    queryFn: () => courseApi.list({}),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/*
        CoursesClient calls useSearchParams() (to sync filters with the
        URL) and useRouter().replace() (to write filter changes back).
        Next.js requires any component using useSearchParams() to sit
        under a Suspense boundary — omitting this is what produced
        "Cannot update a component (Router) while rendering a different
        component (CoursesClient)": without it, Next has to bail the
        subtree into client rendering on first paint, and that bail-out
        races with the router.replace() call from the filter-sync effect.
      */}
      <Suspense fallback={<CoursesPageSkeleton />}>
        <CoursesClient />
      </Suspense>
    </HydrationBoundary>
  );
}