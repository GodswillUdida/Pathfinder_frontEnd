"use client";

import { memo, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBunnyPlayer } from "@/hooks/use-bunny-player";
import type { BunnyTimeUpdateData } from "@/lib/bunny/player-js";

interface BunnyPlayerProps {
  /** Bunny video GUID (providerAssetId) */
  videoGuid: string;
  /**
   * Pre-signed embed URL from your backend.
   * Must be of the form:
   * https://iframe.mediadelivery.net/embed/{libraryId}/{videoGuid}?token=...&expires=...
   */
  playbackUrl: string;
  className?: string;
  onTimeUpdate?: (data: BunnyTimeUpdateData) => void;
  onEnded?: () => void;
  /** Optional resume position (seconds) */
  startAt?: number;
}

export const BunnyPlayer = memo(function BunnyPlayer({
  videoGuid,
  playbackUrl,
  className,
  onTimeUpdate,
  onEnded,
  startAt,
}: BunnyPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [status, setStatus] = useState({
    videoGuid,
    playbackUrl,
    iframeLoaded: false,
    hasError: false,
  });
  const statusMatchesVideo =
    status.videoGuid === videoGuid && status.playbackUrl === playbackUrl;
  const iframeLoaded = statusMatchesVideo && status.iframeLoaded;
  const hasError = statusMatchesVideo && status.hasError;

  const handleError = useCallback(() => {
    setStatus({ videoGuid, playbackUrl, iframeLoaded: false, hasError: true });
  }, [videoGuid, playbackUrl]);

  const { isReady, seek } = useBunnyPlayer(iframeRef, videoGuid, {
    onTimeUpdate,
    onEnded,
    onError: handleError,
    onReady: () => {
      if (typeof startAt === "number" && startAt > 0) {
        seek(startAt);
      }
    },
  });

  if (!videoGuid || !playbackUrl) {
    return (
      <div
        className={cn(
          "flex aspect-video items-center justify-center rounded-2xl border border-gray-800 bg-gray-950",
          className,
        )}
      >
        <p className="text-[12px] font-medium tracking-wide text-gray-500">
          Video stream configuration unavailable
        </p>
      </div>
    );
  }

  const showLoading = (!iframeLoaded || !isReady) && !hasError;

  return (
    <div
      className={cn(
        "relative aspect-video w-full select-none overflow-hidden rounded-2xl bg-black shadow-lg",
        className,
      )}
    >
      {showLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 px-4 text-center">
          <AlertCircle className="mb-2 h-7 w-7 animate-pulse text-red-500" />
          <p className="text-[13px] font-medium text-white/80">
            Playback Security Failure
          </p>
          <p className="mt-1 max-w-xs text-[11px] text-white/40">
            We couldn&apos;t verify your authorization for this lesson. Please
            reload the module.
          </p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        key={videoGuid} // force clean remount on lesson change
        src={playbackUrl}
        className={cn(
          "h-full w-full border-0 transition-opacity duration-300",
          showLoading || hasError ? "opacity-0" : "opacity-100",
        )}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() =>
          setStatus({ videoGuid, playbackUrl, iframeLoaded: true, hasError: false })
        }
        onError={handleError}
        loading="eager"
        title="Secure Course Playback"
      />
    </div>
  );
});