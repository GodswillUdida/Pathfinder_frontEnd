import { Users } from "lucide-react";

/** Empty state until an enrollments hook exists. Swap in a table when it does. */
export function StudentsPanel() {
  return (
    <div className="py-8">
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center sm:px-8 sm:py-16">
        <Users className="mx-auto mb-4 h-6 w-6 text-muted-foreground/60" aria-hidden />
        <p className="font-display text-[15px] font-semibold text-foreground">
          No students enrolled yet
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground">
          Students will appear here, with their progress, once enrollment opens for
          this course.
        </p>
      </div>
    </div>
  );
}
