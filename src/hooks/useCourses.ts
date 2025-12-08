import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/lib/api/course";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
    staleTime: 60_000, // 1 minute
    // gcTime: 5 * 60_000, // 5 minutes
  });
};
