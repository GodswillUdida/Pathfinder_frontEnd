// src/hooks/use-enrollments.ts
import { useQuery } from "@tanstack/react-query";
import type { Enrollment } from "@/types/dashboard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

async function fetchWithCredentials<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include", // ← This is the key
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data ?? data; // Handle both { data: [...] } and direct array
}

export function useEnrollments() {
  return useQuery<Enrollment[]>({
    queryKey: ["enrollments"],
    queryFn: () => fetchWithCredentials(`${API_BASE}/enrollments`),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useEnrollment(id: string) {
  return useQuery<Enrollment>({
    queryKey: ["enrollment", id],
    queryFn: () => fetchWithCredentials(`${API_BASE}/enrollments/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}
