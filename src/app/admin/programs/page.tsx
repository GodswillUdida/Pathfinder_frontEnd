import type { Metadata } from "next";
import { ProgramsDirectory } from "@/components/admin/program/programs-directory";

export const metadata: Metadata = {
  title: "Programs Management Terminal",
  description: "Configure academic programs, curriculum matrix tracks, and course paths.",
};

export default function ProgramsPage() {
  return (
    <div 
      className="w-full min-h-full animate-in fade-in slide-in-from-bottom-3 duration-400 ease-out fill-mode-both"
    >
      <ProgramsDirectory />
    </div>
  );
}
