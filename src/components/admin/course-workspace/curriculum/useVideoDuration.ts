"use client";

import { useEffect, useState } from "react";

/**
 * Reads a video file's duration in the browser, so an admin can sanity-check
 * the file before uploading gigabytes of the wrong lecture.
 */
export function useVideoDuration(file: File | null): number | null {
  const [duration, setDuration] = useState<{
    file: File | null;
    seconds: number | null;
  }>({ file: null, seconds: null });

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const el = document.createElement("video");
    el.preload = "metadata";
    el.onloadedmetadata = () =>
      setDuration({
        file,
        seconds: Number.isFinite(el.duration) ? Math.round(el.duration) : null,
      });
    el.onerror = () => setDuration({ file, seconds: null });
    el.src = url;

    return () => {
      el.onloadedmetadata = null;
      el.onerror = null;
      el.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return duration.file === file ? duration.seconds : null;
}
