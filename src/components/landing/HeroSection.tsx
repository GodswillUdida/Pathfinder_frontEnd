"use client";

import { useState, useEffect, useCallback, useRef, memo, type MouseEvent, type ReactNode } from "react";
import {
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle,
  X,
  Star,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  TYPES & DATA                                                              */
/* -------------------------------------------------------------------------- */

interface Slide {
  image: string;
  alt: string;
}

interface Certification {
  name: string;
  tone: "blue" | "indigo" | "success" | "muted";
}

interface Stats {
  rating: number;
  reviews: number;
  students: number;
  successRate: number;
}

const SLIDES: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
    alt: "Students learning together",
  },
  {
    image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
    alt: "Professional training environment",
  },
  {
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
    alt: "Modern classroom",
  },
];

const CERTIFICATIONS: Certification[] = [
  { name: "ATS", tone: "success" },
  { name: "ICAN", tone: "blue" },
  { name: "ACCA", tone: "blue" },
  { name: "DIPLOMA", tone: "indigo" },
  { name: "CIMA", tone: "indigo" },
  { name: "CITN", tone: "muted" },
];

const BENEFITS: string[] = [
  "Practical, hands-on learning",
  "Industry-recognized certification",
  "Flexible online access",
  "Expert instructors",
  "Job placement support",
  "Lifetime access to materials",
];

const STATS: Stats = {
  rating: 4.9,
  reviews: 2847,
  students: 12500,
  successRate: 98,
};

const VIDEO_URL =
  "https://res.cloudinary.com/dirrncimm/video/upload/v1689973032/samples/elephants.mp4";

const TYPEWRITER_SPEED = 85;
const SLIDE_INTERVAL = 5500;
const CERT_ROTATION_INTERVAL = 3200;

/* -------------------------------------------------------------------------- */
/*  Spotlight surface                                                         */
/* -------------------------------------------------------------------------- */

function SpotlightSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  // Soft blue glow only — no amber
  const glow = useMotionTemplate`radial-gradient(480px circle at ${x}px ${y}px, color-mix(in oklch, var(--brand-500) 10%, transparent), transparent 70%)`;
  const edge = useMotionTemplate`radial-gradient(280px circle at ${x}px ${y}px, color-mix(in oklch, var(--brand-indigo) 55%, transparent), transparent 70%)`;

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  return (
    <motion.div
      onMouseMove={onMove}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card ${className}`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: glow }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: edge,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }}
      />
      <div className="relative z-0 h-full w-full">{children}</div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/*  VIDEO PLAYER                                                              */
/* -------------------------------------------------------------------------- */

const VideoPlayer = memo(function VideoPlayer({
  videoRef,
  isPlaying,
  isMuted,
  isLoading,
  onTogglePlay,
  onToggleMute,
  onFullscreen,
  onClose,
  onLoadedData,
  onEnded,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  onClose: () => void;
  onLoadedData: () => void;
  onEnded: () => void;
}) {
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlay = () => setIsVideoPaused(false);
    const handlePause = () => setIsVideoPaused(true);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [videoRef]);

  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-[400px] px-4 sm:px-0">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-brand-navy/30"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Play className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">
                Platform Demo
              </p>
              <p className="text-xs text-muted-foreground">See how it works</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 hover:bg-secondary hover:text-foreground hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close video"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative aspect-video bg-brand-navy">
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="h-full w-full object-cover"
            muted={isMuted}
            playsInline
            onLoadedData={onLoadedData}
            onPlay={onLoadedData}
            onEnded={onEnded}
            preload="metadata"
            autoPlay
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/60">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-navy/80 to-transparent p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={onTogglePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 transition-all duration-300 hover:bg-white/25 hover:scale-105 active:scale-95"
                >
                  {isVideoPaused ? (
                    <Play className="ml-0.5 h-4 w-4 text-white" />
                  ) : (
                    <Pause className="h-4 w-4 text-white" />
                  )}
                </button>
                <button
                  onClick={onToggleMute}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/15"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-white" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <button
                onClick={onFullscreen}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/15"
              >
                <Maximize2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*  MAIN HERO                                                                 */
/* -------------------------------------------------------------------------- */

export default function HeroSection() {
  const reduce = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [activeCert, setActiveCert] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fullText = "Career Path in";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typingIndex < fullText.length) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingText((prev) => prev + fullText.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
      }, TYPEWRITER_SPEED);
    } else {
      setIsTypingComplete(true);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [typingIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCert((prev) => (prev + 1) % CERTIFICATIONS.length);
    }, CERT_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, []);

  const handleVideoToggle = useCallback(() => {
    if (!isVideoPlaying) {
      setIsVideoPlaying(true);
      setIsVideoLoading(true);
      setTimeout(() => {
        videoRef.current?.play().catch(() => setIsVideoLoading(false));
      }, 100);
    } else if (videoRef.current) {
      if (videoRef.current.paused) {
        setIsVideoLoading(true);
        videoRef.current.play().catch(() => setIsVideoLoading(false));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying]);

  const handleVideoLoad = useCallback(() => setIsVideoLoading(false), []);
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);
  const handleFullscreen = useCallback(() => {
    videoRef.current?.requestFullscreen?.();
  }, []);
  const handleVideoClose = useCallback(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);
  const handleVideoEnded = useCallback(() => setIsVideoPlaying(false), []);

  const toneClasses = {
    blue: "bg-primary text-primary-foreground shadow-primary/25",
    indigo: "bg-brand-indigo text-white shadow-brand-indigo/20",
    success: "bg-success text-success-foreground shadow-success/20",
    muted: "bg-secondary text-foreground border border-border",
  };

  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 24 },
          animate: mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
          transition: { type: "spring" as const, stiffness: 140, damping: 22, delay },
        };

  return (
    <>
      <section
        className="relative overflow-hidden bg-background"
        style={{ contain: "layout paint style" }}
      >
        {/* Quiet atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 rounded-full blur-3xl"
          style={{
            top: "-10rem",
            left: "-8rem",
            width: "clamp(18rem, 42vw, 36rem)",
            aspectRatio: "1",
            background: "color-mix(in oklch, var(--primary) 14%, transparent)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -z-10 rounded-full blur-3xl"
          style={{
            right: "-6rem",
            top: "18%",
            width: "clamp(14rem, 32vw, 26rem)",
            aspectRatio: "1",
            background: "color-mix(in oklch, var(--brand-indigo) 10%, transparent)",
          }}
        />

        <div
          className="page-container relative"
          style={{ paddingBlock: "clamp(3.5rem, 8vw, 6.5rem)" }}
        >
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
            {/* ───────────── LEFT ───────────── */}
            <div className="lg:col-span-6 space-y-8">
              <motion.div {...reveal(0)}>
                <p className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  Nigeria’s premier accounting platform
                </p>

                <h1 className="font-display text-[clamp(2.4rem,5.2vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight text-foreground">
                  Elevate Your
                  <br />
                  <span className="relative text-primary">
                    {typingText}
                    {!isTypingComplete && (
                      <span className="ml-0.5 inline-block h-[0.85em] w-[2px] animate-pulse bg-primary align-middle" />
                    )}
                  </span>
                </h1>

                {/* Certification pills — blue / indigo dominant */}
                <div className="mt-7 flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert, idx) => {
                    const isActive = activeCert === idx;
                    return (
                      <button
                        key={cert.name}
                        onClick={() => setActiveCert(idx)}
                        className={`
                          relative rounded-full px-4 py-2 text-[13px] font-semibold tracking-tight
                          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                          hover:scale-[1.04] active:scale-[0.97]
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
                          ${
                            isActive
                              ? `${toneClasses[cert.tone]} shadow-md`
                              : "border border-border bg-card text-muted-foreground hover:border-brand-300 hover:text-foreground"
                          }
                        `}
                      >
                        {cert.name}
                        {isActive && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-6 max-w-lg text-[1.05rem] leading-relaxed text-muted-foreground">
                  Join{" "}
                  <span className="font-semibold text-foreground">
                    {STATS.students.toLocaleString()}+
                  </span>{" "}
                  learners who have transformed their careers with our
                  expert-led, practical courses.
                </p>
              </motion.div>

              {/* Benefits */}
              <motion.div
                {...reveal(0.08)}
                className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2"
              >
                {BENEFITS.map((benefit) => (
                  <div key={benefit} className="group flex items-center gap-2.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/12 transition-transform duration-300 group-hover:scale-110">
                      <CheckCircle className="h-3.5 w-3.5 text-success" />
                    </div>
                    <span className="text-[13.5px] text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                      {benefit}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                {...reveal(0.14)}
                className="flex flex-col gap-3 pt-1 sm:flex-row"
              >
                <Link
                  href="/courses"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/35 active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Start Learning Today
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <button
                  onClick={handleVideoToggle}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 hover:border-brand-300 hover:bg-secondary active:translate-y-0 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/10">
                    {isVideoLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    ) : (
                      <Play className="ml-0.5 h-3.5 w-3.5 fill-current text-foreground" />
                    )}
                  </div>
                  Watch Demo
                </button>
              </motion.div>

              {/* Social proof */}
              <motion.div
                {...reveal(0.2)}
                className="flex flex-wrap items-center gap-6 border-t border-border pt-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-9 w-9 rounded-full border-2 border-background bg-gradient-to-br from-brand-400 to-brand-700 transition-transform duration-300 hover:z-10 hover:scale-110"
                    />
                  ))}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-secondary transition-transform duration-300 hover:scale-110">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {Math.floor(STATS.students / 1000)}K+
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-3.5 w-3.5 fill-brand-amber text-brand-amber"
                      />
                    ))}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {STATS.rating}/5
                    </span>{" "}
                    from {STATS.reviews.toLocaleString()}+ reviews
                  </p>
                </div>
              </motion.div>
            </div>

            {/* ───────────── RIGHT — Media card (image fixed) ───────────── */}
            <motion.div {...reveal(0.12)} className="relative lg:col-span-6">
              {/* Explicit height container so next/image fill works */}
              <div className="relative aspect-[4/5] w-full">
                <SpotlightSurface className="absolute inset-0 h-full w-full">
                  <div className="relative h-full w-full">
                    {SLIDES.map((slide, index) => (
                      <div
                        key={index}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                          index === currentSlide
                            ? "opacity-100 scale-100"
                            : "opacity-0 scale-[1.03]"
                        }`}
                      >
                        <Image
                          src={slide.image}
                          alt={slide.alt}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority={index === 0}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    ))}

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/45 via-transparent to-transparent" />

                    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {SLIDES.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`h-1.5 rounded-full transition-all duration-400 ${
                            index === currentSlide
                              ? "w-6 bg-primary shadow-sm"
                              : "w-1.5 bg-white/45 hover:bg-white/75"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </SpotlightSurface>
              </div>

              {/* Floating Success */}
              <motion.div
                className="absolute -bottom-5 -left-5 hidden lg:block"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg shadow-brand-navy/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/12">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-foreground">
                      {STATS.successRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Rating — amber only here */}
              <motion.div
                className="absolute -right-5 -top-5 hidden lg:block"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              >
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg shadow-brand-navy/10 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-amber/12">
                    <Award className="h-5 w-5 text-brand-amber" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-foreground">
                      {STATS.rating}
                    </p>
                    <p className="text-xs text-muted-foreground">Top Rated</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <VideoPlayer
        videoRef={videoRef}
        isPlaying={isVideoPlaying}
        isMuted={isMuted}
        isLoading={isVideoLoading}
        onTogglePlay={handleVideoToggle}
        onToggleMute={toggleMute}
        onFullscreen={handleFullscreen}
        onClose={handleVideoClose}
        onLoadedData={handleVideoLoad}
        onEnded={handleVideoEnded}
      />
    </>
  );
}