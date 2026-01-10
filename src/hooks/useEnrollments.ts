import { getAllEnrollments } from "@/lib/api/enrollment";
import { useAuthStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

export function getAdminToken(): string {
    const { isAuthenticated, token, user } = useAuthStore.getState();
    
    if (!isAuthenticated || !token) {
        throw new Error("Admin not authenticated")
    }

    if (user?.role !== "admin") {
        throw new Error("Admin access required");
    }

  return token;
}

// Fetch all admin courses
export function useEnrollments() {
  return useQuery({
    queryKey: ["enrollments", "admin"],
      queryFn: () => getAllEnrollments(getAdminToken()),
    enabled:true,
    staleTime: 60 * 1000,
  });
}
