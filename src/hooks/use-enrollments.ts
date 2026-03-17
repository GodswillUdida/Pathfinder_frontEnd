import { getAllEnrollments } from "@/lib/api/enrollment";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import type { Enrollment } from "@/types/dashboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

async function fetchWithAuth<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getAdminToken(): string {
  const { isAuthenticated, token, user } = useAuthStore.getState();

  if (!isAuthenticated || !token) {
    throw new Error("Admin not authenticated");
  }

  if (user?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return token;
}

// // Fetch all admin courses
// export function useEnrollments() {
//   return useQuery({
//     queryKey: ["enrollments", "admin"],
//     queryFn: () => getAllEnrollments(getAdminToken()),
//     enabled: true,
//     staleTime: 60 * 1000,
//   });
// }

export function useEnrollments() {
  const token = useAuthStore((s) => s.token);

  return useQuery<Enrollment[]>({
    queryKey: ["enrollments"],
    queryFn: () =>
      fetchWithAuth<{ data: Enrollment[] }>(
        `${API_BASE}/enrollments`,
        token!
      ).then((r) => r.data ?? r),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEnrollment(id: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery<Enrollment>({
    queryKey: ["enrollment", id],
    queryFn: () =>
      fetchWithAuth<{ data: Enrollment }>(
        `${API_BASE}/enrollments/${id}`,
        token!
      ).then((r) => r.data ?? r),
    enabled: !!token && !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePlaybackUrl(topicId: string, enabled: boolean) {
  const token = useAuthStore((s) => s.token);

  return useQuery<string>({
    queryKey: ["playback", topicId],
    queryFn: () =>
      fetchWithAuth<{ url: string }>(
        `${API_BASE}/topics/${topicId}/play`,
        token!
      ).then((r) => r.url),
    enabled: !!token && !!topicId && enabled,
    staleTime: 1000 * 60 * 50, // token is valid for 60m, refetch at 50m
    gcTime: 1000 * 60 * 60,
  });
}
