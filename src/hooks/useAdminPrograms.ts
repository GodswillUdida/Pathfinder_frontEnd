import { safeFetch } from "@/lib/api/fetcher";
import { Program } from "@/types/course";
import { useQuery } from "@tanstack/react-query";


type ProgramResponse = { program: Program } | { data: Program } | Program;

// Fetch all admin courses
export function useProgramList() {
  return useQuery({
    queryKey: ["programs", "admin"],
    queryFn: async () => {
        const data = await safeFetch<{ programs: Program[] }>("/programs");
        
      if (!data) throw new Error("Failed to fetch courses");
      return data;
    },
  });
}

// Fetch single course
export function useProgram(id?: string) {
  return useQuery({
    queryKey: ["course", id],
    enabled: !!id,
    retry: false,
    // enabled: Boolean(id),
    queryFn: async () => {
      const res = await safeFetch<ProgramResponse>(`/programs/${id}`);

      console.log("Hook Data: ", res);

      if (!res) throw new Error("Course not found");

      const program =
        "program" in res ? res.program : "data" in res ? res.data : res;

      if (!program?.id) {
        throw new Error("Inavlid Course Response");
      }
      return program;
    },
  });
}
