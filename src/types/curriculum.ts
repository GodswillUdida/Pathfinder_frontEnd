export type TopicType = "VIDEO" | "PDF" | "QUIZ" | "ARTICLE";

export const DND_TYPE = {
  MODULE: "module",
  TOPIC: "topic",
} as const;

export const MODULE_GROUP = "modules";

export interface Topic {
  id: string;
  moduleId: string;
  title: string;
  slug?: string;
  position?: number;
  durationSeconds?: number;
  resources?: string[];
  /** Present when API returns nested video asset */
  videoAsset?: {
    id: string;
    status: "QUEUED" | "PROCESSING" | "UPLOADED" | "READY" | "FAILED";
    providerAssetId?: string | null;
  } | null;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  position?: number;
  topics: Topic[];
}

export interface CreateModuleInput {
  title: string;
  description?: string;
  position?: number;
}

export type UpdateModuleInput = Partial<CreateModuleInput>;

/**
 * Create topic — video is required by the API (multipart field "video").
 * Use this shape in the form; convert to FormData in the mutation.
 */

export interface CreateTopicInput {
  title: string;
  description?: string;
  /** Required on create. Must be sent as FormData field name "video". */
  video: File;
  resources?: string[];
}

/**
 * Update topic scalars (JSON). Replace video via a separate multipart call
 * if your API supports it.
 */
export interface UpdateTopicInput {
  title?: string;
  description?: string;
  resources?: string[];
  position?: number;
}

/** Optional: dedicated video replace payload */
export interface ReplaceTopicVideoInput {
  video: File;
}