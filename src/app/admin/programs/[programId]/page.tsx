import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramWorkspace } from "@/components/admin/detail/program-workspace";
import { apiClient } from "@/lib/api/client";

interface ProgramDetailPageProps {
  params: Promise<{ programId: string }>;
}

// Typing matching your custom global type matrix definitions
interface ProgramDetailPayload {
  id: string;
  title: string;
  slug: string;
  // add other fields matching your backend signature if needed
}

/**
 * ── DECOUPLED METADATA RESOLUTION ENGINE ─────────────────────────────────────
 * Resolves the tab text cleanly via your decoupled backend REST cluster.
 * Next.js automatically dedupes parallel requests to the exact same URL path.
 */
export async function generateMetadata({ params }: ProgramDetailPageProps): Promise<Metadata> {
  const { programId } = await params;
  if (!programId) return { title: "Program Management Matrix" };

  try {
    // Queries your microservice/backend endpoint from the Node server layer
    const res = await apiClient.get<ProgramDetailPayload>(`/programs/${programId}`);

    if (!res?.success || !res.data) {
      return { title: "Program Not Found | Pathfinder Admin" };
    }

    return {
      title: `${res.data.title} | Pathfinder Admin`,
      description: `Administrative runtime terminal for managing course tracks within ${res.data.title}.`,
    };
  } catch {
    return { title: "Program Core | Pathfinder Admin" };
  }
}

/**
 * ── PRIMARY ADMINISTRATIVE VIEWPORT CONTAINER ──────────────────────────────
 */
export default async function ProgramDetailPage({ params }: ProgramDetailPageProps) {
  const { programId } = await params;

  if (!programId) {
    notFound();
  }

  return (
    <div 
      className="w-full min-h-full animate-in fade-in slide-in-from-bottom-2 duration-400 ease-out fill-mode-both"
      // style={{ contain: "layout" }} // Isolates style calculations for 0ms render updates
    >
      <ProgramWorkspace programId={programId} />
    </div>
  );
}
