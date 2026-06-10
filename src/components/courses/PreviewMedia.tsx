"use client";

import { memo, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Play, Pause, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoSourceType = "mp4" | "youtube" | "bunny" | null;

interface PreviewMediaProps {
  thumbnail?: string | null;
  videoPreview?: string | null;
  title?: string;
  className?: string;
}

/** Extract YouTube ID */
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

/** Detect video source type */
function getSourceType(url: string): VideoSourceType {
  if (!url) return null;
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("bunny.net") || url.includes("mediadelivery.net")) return "bunny";
  if (url.endsWith(".mp4") || url.includes(".mp4")) return "mp4";
  return "mp4"; // fallback
}

export const PreviewMedia = memo(function PreviewMedia({
  thumbnail,
  videoPreview,
  title = "Course Preview",
  className,
}: PreviewMediaProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const sourceType = videoPreview ? getSourceType(videoPreview) : null;

  const handlePlayClick = () => {
    if (!videoPreview) return;
    setIsLoading(true);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setIsLoading(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // YouTube Embed URL
  const youtubeEmbedUrl = sourceType === "youtube" && videoPreview
    ? `https://www.youtube.com/embed/${getYouTubeId(videoPreview)}?autoplay=1&rel=0&modestbranding=1`
    : null;

  // Bunny Embed URL
  const bunnyEmbedUrl = sourceType === "bunny" && videoPreview
    ? `${videoPreview}?autoplay=false`
    : null;

  return (
    <div className={cn("group relative w-full rounded-3xl overflow-hidden shadow-xl bg-black", className)}>
      {/* Thumbnail State */}
      {!isPlaying && (
        <div
          className="relative aspect-video cursor-pointer"
          onClick={handlePlayClick}
          role="button"
          tabIndex={0}
          aria-label={`Play preview: ${title}`}
          onKeyDown={(e) => e.key === "Enter" && handlePlayClick()}
        >
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black flex items-center justify-center">
              <div className="text-slate-400 text-center">
                <Play className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No preview available</p>
              </div>
            </div>
          )}

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Preview Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-medium rounded-full flex items-center gap-1.5 border border-white/10">
            <span className="text-emerald-400">▶</span>
            PREVIEW
          </div>

          {/* Big Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95">
              <Play className="h-12 w-12 text-indigo-600 ml-1" fill="#4f46e5" />
            </div>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white text-lg font-semibold line-clamp-2 drop-shadow-md">
              {title}
            </p>
          </div>
        </div>
      )}

      {/* Video Player State */}
      {isPlaying && videoPreview && (
        <div className="relative aspect-video bg-black">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/80">
              <Loader2 className="w-10 h-10 animate-spin text-white/70" />
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>

          {/* MP4 Video */}
          {sourceType === "mp4" && (
            <video
              ref={videoRef}
              src={videoPreview}
              poster={thumbnail || undefined}
              controls
              autoPlay
              className="w-full h-full"
              onLoadedData={() => setIsLoading(false)}
            />
          )}

          {/* YouTube Embed */}
          {sourceType === "youtube" && youtubeEmbedUrl && (
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => setIsLoading(false)}
            />
          )}

          {/* Bunny Embed */}
          {sourceType === "bunny" && bunnyEmbedUrl && (
            <iframe
              src={bunnyEmbedUrl}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
      )}
    </div>
  );
});