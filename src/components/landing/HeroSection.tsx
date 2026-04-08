"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
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

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Slide {
  image: string;
  alt: string;
}

interface Certification {
  name: string;
  color: string;
  icon: string;
}

interface Stats {
  rating: number;
  reviews: number;
  students: number;
  successRate: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SLIDES: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",
    alt: "Students learning together",
  },
  {
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",
    alt: "Professional training environment",
  },
  {
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",
    alt: "Modern classroom",
  },
];

const CERTIFICATIONS: Certification[] = [
  { name: "ATS", color: "from-emerald-500 to-teal-600", icon: "💼" },
  { name: "ICAN", color: "from-blue-500 to-cyan-600", icon: "📊" },
  { name: "ACCA", color: "from-amber-500 to-orange-600", icon: "🎓" },
  { name: "DIPLOMA", color: "from-purple-500 to-fuchsia-600", icon: "📜" },
  { name: "CIMA", color: "from-pink-500 to-rose-600", icon: "🏆" },
  { name: "CITN", color: "from-indigo-500 to-violet-600", icon: "⚡" },
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

const TYPEWRITER_SPEED = 100;
const SLIDE_INTERVAL = 5000;
const CERT_ROTATION_INTERVAL = 3000;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const VideoPlayer = memo(
  ({
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
  }) => {
    const [isVideoPaused, setIsVideoPaused] = useState(false);

    useEffect(() => {
      const videoElement = videoRef.current;
      if (!videoElement) return;

      const handlePlay = () => setIsVideoPaused(false);
      const handlePause = () => setIsVideoPaused(true);

      videoElement.addEventListener("play", handlePlay);
      videoElement.addEventListener("pause", handlePause);

      return () => {
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("pause", handlePause);
      };
    }, [videoRef]);

    if (!isPlaying) return null;

    return (
      <div className="fixed bottom-6 right-6 z-50 w-full max-w-[420px] animate-slideInScale px-4 sm:px-0">
        <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 blur-xl" />

          <div className="relative">
            {/* Video Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    Platform Demo
                  </h3>
                  <p className="text-xs text-gray-600">See how it works</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl hover:bg-white/80 flex items-center justify-center transition-all duration-200 group"
                aria-label="Close video"
              >
                <X className="h-4 w-4 text-gray-500 group-hover:text-gray-900 transition-colors" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                src={VIDEO_URL}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                onLoadedData={onLoadedData}
                onPlay={onLoadedData}
                onEnded={onEnded}
                preload="metadata"
                autoPlay
              />

              {isLoading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-white">Loading video...</p>
                  </div>
                </div>
              )}

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={onTogglePlay}
                      className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                      aria-label={isVideoPaused ? "Play video" : "Pause video"}
                    >
                      {isVideoPaused ? (
                        <Play className="h-5 w-5 text-white ml-0.5" />
                      ) : (
                        <Pause className="h-5 w-5 text-white" />
                      )}
                    </button>

                    <button
                      onClick={onToggleMute}
                      className="w-9 h-9 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-label={isMuted ? "Unmute" : "Mute"}
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
                    className="w-9 h-9 rounded-xl hover:bg-white/20 flex items-center justify-center transition-colors"
                    aria-label="Enter fullscreen"
                  >
                    <Maximize2 className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = "VideoPlayer";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HeroSection() {
  // State Management
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [typingIndex, setTypingIndex] = useState(0);
  const [activeCert, setActiveCert] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isVisible] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const heroRef = useRef<HTMLDivElement>(null);

  const fullText = "Career Path in";

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Typewriter effect
  useEffect(() => {
    if (typingIndex < fullText.length) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingText((prev) => prev + fullText.charAt(typingIndex));
        setTypingIndex((prev) => prev + 1);
      }, TYPEWRITER_SPEED);
    } else {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTypingComplete(true);
      }, 0);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [typingIndex, fullText]);

  // Auto-rotate certifications
  useEffect(() => {
    const certInterval = setInterval(() => {
      setActiveCert((prev) => (prev + 1) % CERTIFICATIONS.length);
    }, CERT_ROTATION_INTERVAL);
    return () => clearInterval(certInterval);
  }, []);

  // Auto-rotate slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(slideTimer);
  }, []);

  // Cleanup video on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
      }
    };
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleVideoToggle = useCallback(() => {
    if (!isVideoPlaying) {
      // Opening video player
      setIsVideoPlaying(true);
      setIsVideoLoading(true);

      // Use setTimeout to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch((error) => {
            console.error("Video playback failed:", error);
            setIsVideoLoading(false);
          });
        }
      }, 100);
    } else {
      // Toggling play/pause while player is open
      if (videoRef.current) {
        if (videoRef.current.paused) {
          setIsVideoLoading(true);
          videoRef.current.play().catch((error) => {
            console.error("Video playback failed:", error);
            setIsVideoLoading(false);
          });
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, [isVideoPlaying]);

  const handleVideoLoad = useCallback(() => {
    setIsVideoLoading(false);
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen().catch((error) => {
        console.error("Fullscreen request failed:", error);
      });
    }
  }, []);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const handleVideoClose = useCallback(() => {
    setIsVideoPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const handleVideoEnded = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <section
        ref={heroRef}
        className="relative bg-gradient-to-b from-blue-50 via-white to-indigo-50 overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse-slow" />
          <div
            className="absolute bottom-40 left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-100/10 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(59 130 246) 1px, transparent 0)`,
            backgroundSize: "50px 50px",
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 items-center gap-12 lg:gap-16 min-h-[calc(100vh-4rem)] py-12 lg:py-16">
            {/* LEFT CONTENT */}
            <div className="lg:col-span-7 space-y-8">
              {/* Main Headline */}
              <div
                className={`space-y-6 transition-all duration-700 delay-100 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <h1
                  id="hero-heading"
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900"
                >
                  Elevate Your
                  <br />
                  <span className="relative inline-block mt-2">
                    <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {typingText}
                      {!isTypingComplete && (
                        <span className="animate-blink">|</span>
                      )}
                    </span>
                    <svg
                      className={`absolute -bottom-2 left-0 w-full h-4 text-blue-200 transition-all duration-1000 ${
                        isTypingComplete
                          ? "opacity-100 scale-x-100"
                          : "opacity-0 scale-x-0"
                      }`}
                      viewBox="0 0 300 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 10C50 2 150 2 298 10"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Certification Pills */}
                <div
                  className="flex flex-wrap gap-3 mt-6"
                  role="group"
                  aria-label="Available certifications"
                >
                  {CERTIFICATIONS.map((cert, idx) => (
                    <button
                      key={cert.name}
                      onClick={() => setActiveCert(idx)}
                      className={`group relative px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-500 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        activeCert === idx
                          ? `bg-gradient-to-r ${cert.color} text-white shadow-xl scale-105`
                          : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 shadow-md hover:shadow-lg"
                      }`}
                      style={{
                        animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                      }}
                      aria-pressed={activeCert === idx}
                    >
                      <span className="flex items-center gap-2">
                        {cert.name}
                      </span>
                      {activeCert === idx && (
                        <div className="absolute -top-1 -right-1 w-3 h-3">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                  Join{" "}
                  <span className="font-bold text-blue-600">
                    {STATS.students.toLocaleString()}+
                  </span>{" "}
                  learners who have transformed their careers with our
                  expert-led, practical courses designed for real-world success.
                </p>
              </div>

              {/* Benefits Grid */}
              <div
                className={`grid sm:grid-cols-2 gap-4 transition-all duration-700 delay-200 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {BENEFITS.map((benefit, idx) => (
                  <div
                    key={benefit}
                    className="group flex items-start gap-3 p-1 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105 cursor-pointer"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${
                        0.3 + idx * 0.1
                      }s both`,
                    }}
                  >
                    <div className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div
                className={`flex flex-col sm:flex-row gap-4 pt-2 transition-all duration-700 delay-300 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <Link
                  href="/courses"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Start learning today"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    Start Learning Today
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                </Link>

                <button
                  onClick={handleVideoToggle}
                  className="group px-8 py-4 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Watch demonstration video"
                >
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-300 group-hover:scale-110">
                      {isVideoLoading ? (
                        <Loader2 className="h-4 w-4 text-blue-600 group-hover:text-white animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 text-blue-600 group-hover:text-white fill-current ml-0.5 transition-colors" />
                      )}
                    </div>
                    Watch Demo
                  </span>
                </button>
              </div>

              {/* Social Proof */}
              <div
                className={`flex flex-wrap items-center gap-8 pt-6 border-t border-gray-200 transition-all duration-700 delay-400 ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                {/* Student Avatars */}
                <div className="flex items-center gap-3">
                  <div
                    className="flex -space-x-2"
                    role="img"
                    aria-label="Student avatars"
                  >
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md hover:scale-110 hover:z-10 transition-transform duration-300"
                        style={{
                          animation: `bounceIn 0.6s ease-out ${
                            0.5 + i * 0.1
                          }s both`,
                        }}
                        aria-hidden="true"
                      />
                    ))}
                    <div
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-300"
                      style={{
                        animation: `bounceIn 0.6s ease-out 0.9s both`,
                      }}
                    >
                      <span className="text-xs font-bold text-gray-700">
                        {STATS.students >= 10000
                          ? `${Math.floor(STATS.students / 1000)}K+`
                          : `${STATS.students}+`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <div
                    className="flex items-center gap-1 mb-1.5"
                    role="img"
                    aria-label={`${STATS.rating} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        style={{
                          animation: `scaleIn 0.3s ease-out ${
                            0.6 + i * 0.1
                          }s both`,
                        }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    <span className="font-bold text-gray-900">
                      {STATS.rating}/5
                    </span>{" "}
                    from {STATS.reviews.toLocaleString()}+ reviews
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - IMAGE SLIDER */}
            <div
              className={`lg:col-span-5 relative transition-all duration-700 delay-500 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />

                <div className="relative h-full rounded-3xl overflow-hidden">
                  {/* Image Slides */}
                  {SLIDES.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${
                        index === currentSlide
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-105"
                      }`}
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 45vw"
                        priority={index === 0}
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  ))}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Slide Indicators */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
                    {SLIDES.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlideChange(index)}
                        className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/20 ${
                          index === currentSlide
                            ? "w-8 bg-white shadow-md"
                            : "w-2 bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                        aria-current={index === currentSlide}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 hidden lg:block hover:scale-105 transition-transform duration-300"
                style={{
                  animation: `floatUp 0.8s ease-out 1s both`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg animate-pulse">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {STATS.successRate}%
                    </p>
                    <p className="text-sm text-gray-600">Success Rate</p>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 hidden lg:block hover:scale-105 transition-transform duration-300"
                style={{
                  animation: `floatDown 0.8s ease-out 1.2s both`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">
                      {STATS.rating}
                    </p>
                    <p className="text-xs text-gray-600">Top Rated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Component */}
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

      {/* Animations Styles */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }

        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          99% {
            opacity: 0;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes floatUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        .animate-slideInScale {
          animation: slideInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </>
  );
}
