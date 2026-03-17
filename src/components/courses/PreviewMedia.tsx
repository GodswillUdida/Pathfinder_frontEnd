import { Play } from "lucide-react";
import Image from "next/image";
import { memo } from "react";

export const PreviewMedia = memo(function PreviewMedia({
  thumbnail,
  videoPreview,
}: {
  thumbnail?: string | null;
  videoPreview?: string | null;
}) {
  if (videoPreview) {
    return (
      <div className="overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200">
        <video
          controls
          preload="metadata"
          poster={thumbnail ?? undefined}
          className="aspect-video w-full bg-slate-900"
        >
          <source src={videoPreview} />
        </video>
      </div>
    );
  }

  if (thumbnail) {
    return (
      <div className="group relative aspect-video overflow-hidden rounded-xl shadow-md ring-1 ring-slate-200">
        <Image
          src={thumbnail}
          alt="Course preview"
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 58vw"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-2xl transition-transform group-hover:scale-110">
            <Play className="h-6 w-6 translate-x-0.5 fill-blue-600 text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Play className="h-12 w-12 text-slate-300" />
        <span className="text-sm font-medium">No preview available</span>
      </div>
    </div>
  );
});
