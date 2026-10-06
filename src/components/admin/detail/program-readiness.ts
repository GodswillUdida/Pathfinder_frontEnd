import type { Course } from "@/types/domain";

export type ReadinessCheckId = "courses" | "published-course" | "cover";

export interface ReadinessCheck {
  id: ReadinessCheckId;
  done: boolean;
  /** Shown once the check passes. */
  doneLabel: string;
  /** Imperative shown while the check is open. */
  todoLabel: string;
  /** While the program is a draft, publishing is refused until this passes. */
  blocksPublish: boolean;
}

export interface ProgramReadiness {
  /** Ordered by priority: what blocks publishing first, polish last. */
  checks: ReadinessCheck[];
  /** Every check has passed. */
  isComplete: boolean;
  /** No blocking check is open, so a draft may be published. */
  canPublish: boolean;
  /** First open check that blocks publishing, if any. */
  blocker: ReadinessCheck | null;
}

export function getProgramReadiness(
  program: { image?: string | null },
  courses: ReadonlyArray<Pick<Course, "status">>,
): ProgramReadiness {
  const checks: ReadinessCheck[] = [
    {
      id: "courses",
      done: courses.length > 0,
      doneLabel: "Courses added",
      todoLabel: "Add a course",
      blocksPublish: true,
    },
    {
      id: "published-course",
      done: courses.some((course) => course.status === "PUBLISHED"),
      doneLabel: "Course published",
      todoLabel: "Publish a course",
      blocksPublish: false,
    },
    {
      id: "cover",
      done: Boolean(program.image),
      doneLabel: "Cover image added",
      todoLabel: "Add a cover image",
      blocksPublish: false,
    },
  ];

  const blocker =
    checks.find((check) => !check.done && check.blocksPublish) ?? null;

  return {
    checks,
    isComplete: checks.every((check) => check.done),
    canPublish: blocker === null,
    blocker,
  };
}