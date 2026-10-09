// hooks/use-video-progress.ts
"use client";

import { useEffect, useRef, useCallback } from "react";
import type { BunnyPlayerJsInstance } from "@/lib/bunny/player-js";

const FLUSH_INTERVAL_MS = 10_000;

interface ProgressPayload {
  topicId: string;
  enrollmentId: string;
  range: [number, number];
}

export function useVideoProgress(topicId: string, enrollmentId: string, player: BunnyPlayerJsInstance | null) {
  const lastFlushedAt = useRef(0);
  const segmentStart = useRef<number | null>(null);
  const pendingRange = useRef<[number, number] | null>(null);

  const flush = useCallback((useBeacon = false) => {
    if (!pendingRange.current) return;
    const payload: ProgressPayload = { topicId, enrollmentId, range: pendingRange.current };
    const body = JSON.stringify(payload);
    pendingRange.current = null;

    if (useBeacon && navigator.sendBeacon) {
      navigator.sendBeacon("/api/progress", new Blob([body], { type: "application/json" }));
      return;
    }
    // apiClient.post("api/v1/progress", {
    //     keepalive
    // } )
    fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body,
    }).catch(() => {
      // next tick's wider range or the unload beacon will cover this
    });
  }, [topicId, enrollmentId]);

  const handleTimeUpdate = useCallback((data: { seconds: number }) => {
    if (segmentStart.current === null) segmentStart.current = data.seconds;
    pendingRange.current = [segmentStart.current, data.seconds];

    const now = Date.now();
    if (now - lastFlushedAt.current >= FLUSH_INTERVAL_MS) {
      flush();
      lastFlushedAt.current = now;
      segmentStart.current = data.seconds;
    }
  }, [flush]);

  useEffect(() => {
    if (!player) return;
    player.on("pause", () => flush());
    player.on("ended", () => flush());

    const onHide = () => document.visibilityState === "hidden" && flush(true);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", () => flush(true));

    return () => {
      flush(true);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [player, flush]);

  return { handleTimeUpdate };
}