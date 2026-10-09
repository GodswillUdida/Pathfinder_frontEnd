"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  loadPlayerJs,
  type BunnyPlayerJsInstance,
  type BunnyTimeUpdateData,
} from "@/lib/bunny/player-js";

interface UseBunnyPlayerOptions {
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (data: BunnyTimeUpdateData) => void;
  onEnded?: () => void;
  onError?: (err?: unknown) => void;
}

/**
 * Attaches Player.js to an already-rendered Bunny embed iframe.
 * Re-initialises only when videoGuid changes (lesson switch).
 */
export function useBunnyPlayer(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  videoGuid: string,
  options: UseBunnyPlayerOptions = {},
) {
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<BunnyPlayerJsInstance | null>(null);
  const optionsRef = useRef(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    let cancelled = false;
    let player: BunnyPlayerJsInstance | null = null;

    // Reset ready state asynchronously to avoid cascading renders
    Promise.resolve().then(() => {
      if (!cancelled) setIsReady(false);
    });

    if (!videoGuid) return;

    const handlers = {
      ready: () => {
        if (cancelled) return;
        setIsReady(true);
        optionsRef.current.onReady?.();
      },
      timeupdate: (data: unknown) => {
        if (cancelled) return;
        try {
          const parsed =
            typeof data === "string" ? JSON.parse(data) : data;
          if (
            parsed &&
            typeof parsed === "object" &&
            "seconds" in parsed &&
            typeof parsed.seconds === "number"
          ) {
            optionsRef.current.onTimeUpdate?.(
              parsed as BunnyTimeUpdateData,
            );
          }
        } catch {
          // ignore malformed payloads
        }
      },
      ended: () => {
        if (!cancelled) optionsRef.current.onEnded?.();
      },
      error: (err?: unknown) => {
        if (!cancelled) optionsRef.current.onError?.(err);
      },
      play: () => optionsRef.current.onPlay?.(),
      pause: () => optionsRef.current.onPause?.(),
    };

    loadPlayerJs()
      .then(() => {
        if (cancelled || !iframeRef.current || !window.playerjs) return;

        player = new window.playerjs.Player(iframeRef.current);
        playerRef.current = player;

        player.on("ready", handlers.ready);
        player.on("timeupdate", handlers.timeupdate);
        player.on("ended", handlers.ended);
        player.on("error", handlers.error);
        player.on("play", handlers.play);
        player.on("pause", handlers.pause);
      })
      .catch((err) => {
        if (!cancelled) optionsRef.current.onError?.(err);
      });

    return () => {
      cancelled = true;
      if (player) {
        player.off("ready", handlers.ready);
        player.off("timeupdate", handlers.timeupdate);
        player.off("ended", handlers.ended);
        player.off("error", handlers.error);
        player.off("play", handlers.play);
        player.off("pause", handlers.pause);
      }
      playerRef.current = null;
    };
  }, [videoGuid, iframeRef]);

  const play = useCallback(() => playerRef.current?.play(), []);
  const pause = useCallback(() => playerRef.current?.pause(), []);
  const seek = useCallback((seconds: number) => {
    playerRef.current?.setCurrentTime(seconds);
  }, []);

  return { isReady, play, pause, seek, player: playerRef };
}