import type { ModuleWithTopics } from "@/types/domain";
import type { TopicWithResources } from "../types";

export type ContentMeta =
  | { kind: "video-only" }
  | { kind: "resources-only"; count: number }
  | { kind: "mixed"; count: number }
  | { kind: "empty" };

export function getContentMeta(topic: TopicWithResources): ContentMeta {
  const hasVideo = !!topic.videoAsset;
  const resourceCount = topic.resources?.length ?? 0;

  if (hasVideo && resourceCount > 0) return { kind: "mixed", count: resourceCount };
  if (hasVideo) return { kind: "video-only" };
  if (resourceCount > 0) return { kind: "resources-only", count: resourceCount };
  return { kind: "empty" };
}

/** Shippable = has some content, and its video (if any) has finished processing. */
export function isTopicReady(topic: TopicWithResources): boolean {
  const meta = getContentMeta(topic);
  if (meta.kind === "empty") return false;
  if (meta.kind === "resources-only") return true;
  return topic.videoAsset?.status === "READY";
}

export interface CurriculumTotals {
  modules: number;
  topics: number;
  videoTopics: number;
  readyVideos: number;
  pendingVideos: number;
  resourceOnlyTopics: number;
  emptyTopics: number;
}

export function summarizeCurriculum(modules: ModuleWithTopics[]): CurriculumTotals {
  const totals: CurriculumTotals = {
    modules: modules.length,
    topics: 0,
    videoTopics: 0,
    readyVideos: 0,
    pendingVideos: 0,
    resourceOnlyTopics: 0,
    emptyTopics: 0,
  };

  for (const mod of modules) {
    for (const topic of mod.topics as TopicWithResources[]) {
      totals.topics += 1;
      const meta = getContentMeta(topic);
      if (meta.kind === "video-only" || meta.kind === "mixed") {
        totals.videoTopics += 1;
        if (topic.videoAsset?.status === "READY") totals.readyVideos += 1;
      } else if (meta.kind === "resources-only") {
        totals.resourceOnlyTopics += 1;
      } else {
        totals.emptyTopics += 1;
      }
    }
  }

  totals.pendingVideos = totals.videoTopics - totals.readyVideos;
  return totals;
}
