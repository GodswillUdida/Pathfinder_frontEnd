import type { ModuleWithTopics, TopicResource } from "@/types/domain";

export type WorkspaceTab =
  | "overview"
  | "curriculum"
  | "students"
  | "analytics"
  | "settings";

/**
 * A topic as the curriculum UI reads it. `resources` is optional until the
 * domain type declares it; delete this intersection once it does.
 */
export type TopicWithResources = ModuleWithTopics["topics"][number] & {
  resources?: TopicResource[] | null;
};

/** What the create-topic mutation receives. Adapt in AddTopic.tsx if your API differs. */
export type CreateTopicPayload = {
  title: string;
  position: number;
  video?: File;
  resources?: File[];
};
