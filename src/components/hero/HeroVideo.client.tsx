"use client";

export default function HeroVideo() {
  return (
    <video
      controls
      preload="none"
      playsInline
      className="fixed bottom-6 right-6 w-80 rounded-xl shadow-xl"
    />
  );
}
