"use server";

import { Program } from "@/types/course";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// universal safe fetcher
async function safeFetch<T>(path: string): Promise<T | null> {
  if (!API_BASE) {
    console.warn("NEXT_PUBLIC_API_URL is not set");
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });

    if (!res.ok) {
      console.error(
        `Failed fetch for ${path}: ${res.status} ${res.statusText}`
      );
      return null;
    }

    const data = await res.json();
    return data ?? null;
  } catch (err) {
    console.error(`Error fetching ${path}:`, err);
    return null;
  }
}

// fetch all programs safely
export async function getPrograms(): Promise<Program[]> {
  const data = await safeFetch<{ programs: Program[] }>(`/programs`);
  return data?.programs ?? [];
}

// fetch a single program safely
export async function getProgramById(id: string): Promise<Program | null> {
  const data = await safeFetch<Program>(`/programs/${id}`);
  return data ?? null;
}
