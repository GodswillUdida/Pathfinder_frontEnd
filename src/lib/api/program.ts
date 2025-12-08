"use server";

import { Program } from "@/types/course";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export async function getPrograms(): Promise<Program[]> {
  const url = `${API_BASE}/programs`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch programs: ${res.status} — ${text}`);
  }
  const data = await res.json();
  return data.programs ?? data ?? [];
}

export async function getProgramById(id: string): Promise<Program | null> {
  const url = `${API_BASE}/programs/${id}`;
  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to fetch program with slug ${id}: ${res.status} — ${text}`
    );
  }
  const data = await res.json();
  console.log("Program data:", data ?? null);
  return data ?? null;
}
