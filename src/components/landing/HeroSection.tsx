"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

// Move slides outside component
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

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Video Url
  //  https://www.shutterstock.com/shutterstock/videos/3759358001/preview/stock-footage-aerial-view-of-waves-crashing-against-jagged-black-lava-shoreline-in-hawaii-creating-dramatic.webm

  useEffect(() => {
    const timer = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length),
      5000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Light Tinted Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 items-center gap-10 min-h-[calc(100vh-5rem)] py-12">
          {/* LEFT SECTION */}
          <div className="lg:col-span-7 space-y-8">
            {/* Announcement */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-700">
                New Batch Starting January 2026
              </span>
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                Limited Seats
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900 font-agency">
                Elevate Your
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-blue-600">
                    Career Path
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-4 text-blue-200"
                    viewBox="0 0 300 12"
                    fill="none"
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
                <span>in Accounting</span>
              </h1>

              <p className="text-sm text-gray-600 max-w-xl leading-relaxed font-inter">
                Join thousands of learners who have transformed their careers
                with our expert-led, practical accounting courses designed for
                real-world success.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-2 gap-3">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700 font-poppins">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button className="group relative px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all">
                <span className="flex items-center gap-2">
                  Start Learning Today
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button
                onClick={() => setIsVideoPlaying(true)}
                className="group px-8 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Watch Demo
                </span>
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-6 border-t border-gray-100">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-linear-to-br from-blue-400 to-blue-600"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-600">2K+</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 text-yellow-400"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">4.9/5</span> from
                  2,000+ reviews
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (SLIDER) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
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
                    width={500}
                    height={625}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}

              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
            </div>

            {/* Slide indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide
                      ? "w-8 bg-white"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO MODAL */}
      {isVideoPlaying && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsVideoPlaying(false)}
        >
          <div className="relative w-full max-w-4xl aspect-video bg-gray-900 rounded-2xl overflow-hidden">
            <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center">
              ✕
            </button>
            <div className="w-full h-full flex items-center justify-center text-white">
              <p className="text-lg font-medium">Video player coming soon</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
