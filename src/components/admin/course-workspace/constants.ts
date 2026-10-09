import type { WorkspaceTab } from "./types";

export const TABS: { key: WorkspaceTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "curriculum", label: "Curriculum" },
  { key: "students", label: "Students" },
  { key: "analytics", label: "Analytics" },
  { key: "settings", label: "Settings" },
];

export const DEFAULT_TAB: WorkspaceTab = "curriculum";

export function parseTab(value: string | null): WorkspaceTab {
  const match = TABS.find((t) => t.key === value);
  return match ? match.key : DEFAULT_TAB;
}

export const tabId = (key: WorkspaceTab) => `course-tab-${key}`;
export const panelId = (key: WorkspaceTab) => `course-panel-${key}`;

export const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  PROFESSIONAL: "Professional",
};

/* Upload limits */
export const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024; // 2 GB
export const MAX_RESOURCE_BYTES = 10 * 1024 * 1024; // 10 MB each
export const MAX_RESOURCES = 10;
export const RESOURCE_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip,.png,.jpg,.jpeg";

/** Set to 1 if your API stores topic positions 1-based. */
export const POSITION_BASE: 0 | 1 = 0;
