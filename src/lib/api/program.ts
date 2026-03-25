import { safeFetch } from "@/lib/api/fetcher";
import type { Program } from "@/types/course";

type ProgramsResponse = {
  programs: any;
  // programs: Program[];
};

type ProgramResponse = {
  success: boolean;
  count: number;
  program: Program;
};

export async function getPrograms(): Promise<Program[]> {
  const res = await safeFetch<ProgramsResponse>("/programs");
  console.log("Programs: ", res);
  return res?.programs ?? [];
}

export async function getProgramById(id: string): Promise<Program | null> {
  if (!id) return null;

  const res = await safeFetch<ProgramResponse>(`/programs/${id}`);
  return res?.program ?? null;
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  if (!slug) return null;

  const res = await safeFetch<ProgramResponse>(`/programs/${slug}`);
  return res?.program ?? null;
}
