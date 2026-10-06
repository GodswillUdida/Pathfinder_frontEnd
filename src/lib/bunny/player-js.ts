// Thin typed wrapper around Bunny's Player.js — loaded once, cached globally.

export interface BunnyTimeUpdateData {
  seconds: number;
  duration: number;
}

export interface BunnyPlayerJsInstance {
  on(
    event: "ready" | "play" | "pause" | "ended" | "timeupdate" | "error",
    cb: (data?: unknown) => void,
  ): void;
  off(event: string, cb: (data?: unknown) => void): void;
  play(): void;
  pause(): void;
  getCurrentTime(cb: (seconds: number) => void): void;
  setCurrentTime(seconds: number): void;
  getDuration(cb: (seconds: number) => void): void;
  mute(): void;
  unmute(): void;
  setVolume(vol: number): void;
}

declare global {
  interface Window {
    playerjs?: {
      Player: new (target: string | HTMLIFrameElement) => BunnyPlayerJsInstance;
    };
  }
}

const PLAYER_JS_SRC =
  "https://assets.mediadelivery.net/playerjs/player-0.1.0.min.js";

let loadPromise: Promise<void> | null = null;

export function loadPlayerJs(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.playerjs) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PLAYER_JS_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Failed to load player.js")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = PLAYER_JS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load player.js"));
    document.head.appendChild(script);
  });

  return loadPromise;
}