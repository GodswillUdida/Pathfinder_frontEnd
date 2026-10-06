import {
  MAX_RESOURCES,
  MAX_RESOURCE_BYTES,
  MAX_VIDEO_BYTES,
} from "../constants";
import { formatBytes } from "../utils";

export function validateVideo(file: File): string | null {
  if (!file.type.startsWith("video/")) {
    return "That isn't a video file. Try MP4, MOV or WebM.";
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return `This video is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_VIDEO_BYTES)}.`;
  }
  return null;
}

/** Merges newly picked files into the list: dedupes, enforces size and count limits. */
export function mergeResources(
  existing: File[],
  incoming: FileList | null,
): { files: File[]; error: string | null } {
  if (!incoming?.length) return { files: existing, error: null };

  const problems: string[] = [];
  const files = [...existing];

  for (const f of Array.from(incoming)) {
    const duplicate = files.some(
      (r) =>
        r.name === f.name && r.size === f.size && r.lastModified === f.lastModified,
    );
    if (duplicate) continue;

    if (f.size > MAX_RESOURCE_BYTES) {
      problems.push(`${f.name} is over ${formatBytes(MAX_RESOURCE_BYTES)}`);
      continue;
    }
    if (files.length >= MAX_RESOURCES) {
      problems.push(`Only ${MAX_RESOURCES} resources per topic`);
      break;
    }
    files.push(f);
  }

  return { files, error: problems.length ? `${problems.join(". ")}.` : null };
}
