"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowRight, Play, CheckCircle, Sparkles, X, Star } from "lucide-react";
import Image from "next/image";

const SLIDES = [
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

const BENEFITS = [
  "Practical, hands-on learning",
  "Industry-recognized certification",
  "Flexible online access",
  "Expert instructors",
];

const STATS = {
  rating: 4.9,
  reviews: 2000,
  students: 2000,
};

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleVideoClose = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  const handleSlideChange = useCallback((index:number) => {
    setCurrentSlide(index);
  }, []);

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 items-center gap-12 lg:gap-16 min-h-[calc(100vh-4rem)] py-12 lg:py-16">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 space-y-8">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-full shadow-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">
                New Batch Starting January 2026
              </span>
              <span className="bg-linear-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                Limited Seats
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900">
                Elevate Your
                <br />
                <span className="relative inline-block mt-2">
                  <span className="relative z-10 bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Career Path
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-4 text-blue-200"
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
                <br />
                in Accounting
              </h1>

              <p className="text-lg text-gray-600 max-w-xl leading-relaxed">
                Join thousands of learners who have transformed their careers
                with our expert-led, practical accounting courses designed for
                real-world success.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                className="group relative px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                aria-label="Start learning today"
              >
                <span className="flex items-center justify-center gap-2">
                  Start Learning Today
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </button>

              <button
                onClick={() => setIsVideoPlaying(true)}
                className="group px-8 py-4 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 hover:shadow-md transition-all duration-200"
                aria-label="Watch demonstration video"
              >
                <span className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Play className="h-4 w-4 text-blue-600 group-hover:text-white fill-current ml-0.5" />
                  </div>
                  Watch Demo
                </span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center gap-8 pt-6 border-t border-gray-100">
              {/* Student Avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-linear-to-br from-blue-400 to-indigo-600 shadow-sm"
                      aria-hidden="true"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center shadow-sm">
                    <span className="text-xs font-bold text-gray-700">
                      {STATS.students >= 1000
                        ? `${Math.floor(STATS.students / 1000)}K+`
                        : `${STATS.students}+`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
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
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
              {/* Image Slides */}
              {SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 45vw"
                  />
                </div>
              ))}

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Slide Indicators */}
              <div
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
                role="tablist"
                aria-label="Image carousel"
              >
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleSlideChange(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "w-8 bg-white"
                        : "w-1.5 bg-white/50 hover:bg-white/70"
                    }`}
                    role="tab"
                    aria-selected={index === currentSlide}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">98%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleVideoClose}
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
        >
          <div
            className="relative w-full max-w-5xl aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleVideoClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white flex items-center justify-center transition-colors duration-200"
              aria-label="Close video"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Placeholder */}
            <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <Play className="h-8 w-8 fill-current ml-1" />
              </div>
              <p className="text-lg font-medium">Demo video coming soon</p>
              <p className="text-sm text-gray-400">
                Experience our platform firsthand
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
