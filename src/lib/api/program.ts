import { safeFetch } from "@/lib/api/fetcher";
import type { Program } from "@/types/course";

type ProgramsResponse = {
  programs: Program[];
};

type ProgramResponse = {
  program: Program;
};

export async function getPrograms(): Promise<Program[]> {
  const res = await safeFetch<ProgramsResponse>("/programs");
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
