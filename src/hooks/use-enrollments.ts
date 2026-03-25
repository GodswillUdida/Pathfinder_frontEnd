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

export function useEnrollments() {
  const token = useAuthStore((s) => s.token);

  return useQuery<Enrollment[]>({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await fetchWithAuth<
        { data: Enrollment[] } | { enrollments: Enrollment[] } | Enrollment[]
      >(`${API_BASE}/enrollments`, token!);

      if (Array.isArray(res)) return res;
      if ("data" in res && Array.isArray(res.data)) return res.data;
      if ("enrollments" in res && Array.isArray(res.enrollments))
        return res.enrollments;
      return [];
    },
    enabled: !!token,
    retry: false, // ← stop hammering on 404
    staleTime: 1000 * 60 * 5,
  });
}

export function useEnrollment(id: string) {
  const token = useAuthStore((s) => s.token);

  return useQuery<Enrollment>({
    queryKey: ["enrollment", id],
    queryFn: async () => {
      const res = await fetchWithAuth<{ data: Enrollment } | Enrollment>(
        `${API_BASE}/enrollments/${id}`,
        token!
      );
      return (res as any).data ?? res;
    },
    enabled: !!token && !!id,
    retry: false, // ← same here
    staleTime: 1000 * 60 * 2,
  });
}

export function usePlaybackUrl(topicId: string, enabled: boolean) {
  const token = useAuthStore((s) => s.accessToken ?? s.token);

  return useQuery<string>({
    queryKey: ["playback", topicId],
    queryFn: async () => {
      const res = await fetchWithAuth<{ url: string }>(
        `${API_BASE}/topics/${topicId}/play`,
        token!
      );
      return res.url;
    },
    enabled: !!token && !!topicId && enabled,
    staleTime: 1000 * 60 * 50,
    gcTime: 1000 * 60 * 60,
  });
}
