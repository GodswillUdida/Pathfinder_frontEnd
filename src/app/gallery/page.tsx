"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  ZoomIn,
  LayoutGrid,
  Grid3x3,
  Calendar,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

// ============================================================================
// TYPES
// ============================================================================

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
  date: string;
  likes: number;
  type: string;
}

// ============================================================================
// DATA
// ============================================================================

const categories = [
  { id: "all", name: "All" },
  { id: "classroom", name: "Classroom" },
  { id: "events", name: "Events" },
  { id: "graduation", name: "Graduation" },
  { id: "workshops", name: "Workshops" },
];

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&q=80",
    title: "Collaborative Learning Session",
    category: "classroom",
    date: "Dec 2024",
    likes: 142,
    type: "image",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=80",
    title: "Business Strategy Workshop",
    category: "workshops",
    date: "Nov 2024",
    likes: 89,
    type: "image",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80",
    title: "Interactive Study Group",
    category: "classroom",
    date: "Dec 2024",
    likes: 156,
    type: "image",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&q=80",
    title: "Graduation Ceremony 2024",
    category: "graduation",
    date: "Oct 2024",
    likes: 234,
    type: "image",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
    title: "Team Building Activity",
    category: "events",
    date: "Nov 2024",
    likes: 98,
    type: "image",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80",
    title: "Professional Development Seminar",
    category: "workshops",
    date: "Dec 2024",
    likes: 112,
    type: "image",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80",
    title: "Leadership Training",
    category: "workshops",
    date: "Nov 2024",
    likes: 167,
    type: "image",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80",
    title: "Student Success Stories",
    category: "graduation",
    date: "Oct 2024",
    likes: 201,
    type: "image",
  },
  {
    id: 9,
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=900&q=80",
    title: "Annual Networking Event",
    category: "events",
    date: "Sep 2024",
    likes: 143,
    type: "image",
  },
  {
    id: 10,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=900&q=80",
    title: "Modern Learning Environment",
    category: "classroom",
    date: "Dec 2024",
    likes: 87,
    type: "image",
  },
  {
    id: 11,
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=900&q=80",
    title: "Certificate Award Ceremony",
    category: "graduation",
    date: "Oct 2024",
    likes: 189,
    type: "image",
  },
  {
    id: 12,
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=900&q=80",
    title: "Industry Expert Lecture",
    category: "events",
    date: "Nov 2024",
    likes: 134,
    type: "image",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [layout, setLayout] = useState<"masonry" | "grid">("masonry");
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());

  const filteredItems =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedImage(null);
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedImage, filteredItems]);

  const handlePrevious = () => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedImage.id
    );
    const previousIndex =
      currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    setSelectedImage(filteredItems[previousIndex]);
  };

  const handleNext = () => {
    if (!selectedImage) return;
    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedImage.id
    );
    const nextIndex =
      currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredItems[nextIndex]);
  };

  const toggleLike = (id: number) => {
    setLikedImages((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] antialiased">
      <Navbar />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-medium tracking-widest text-slate-500 uppercase mb-4">
            Gallery
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight">
            Moments that shape
            <br className="hidden sm:block" /> our community
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            A visual journey through classrooms, events, graduations, and the
            everyday moments that define Pathfinder.
          </p>
        </div>
      </section>

      {/* ───────────────── FILTERS ───────────────── */}
      <section className="sticky top-16 z-30 bg-[#fafafa]/80 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 bg-slate-200/50 rounded-full p-1">
              <button
                onClick={() => setLayout("masonry")}
                className={`p-2 rounded-full transition-all ${
                  layout === "masonry"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                aria-label="Masonry view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setLayout("grid")}
                className={`p-2 rounded-full transition-all ${
                  layout === "grid"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── GALLERY ───────────────── */}
      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={
              layout === "masonry"
                ? "columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            }
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative break-inside-avoid cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={900}
                    height={700}
                    className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />

                  {/* Soft overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                  {/* Bottom info */}
                  <div className="absolute inset-x-0 bottom-0 p-5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-white font-medium text-[15px] drop-shadow-sm">
                      {item.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-3 text-white/80 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {item.likes}
                      </span>
                    </div>
                  </div>

                  {/* Zoom indicator */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
                    <ZoomIn className="h-4 w-4 text-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-32 text-center">
              <p className="text-slate-400 text-lg">No photos in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────── LIGHTBOX ───────────────── */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          />

          {/* Close */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 sm:left-8 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="relative z-10 max-w-5xl w-full mx-6 text-center">
            <div className="relative inline-block">
              <Image
                src={selectedImage.image}
                alt={selectedImage.title}
                width={1200}
                height={800}
                className="max-h-[72vh] w-auto rounded-lg shadow-2xl object-contain"
                priority
              />
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-medium text-white tracking-tight">
                {selectedImage.title}
              </h3>

              <div className="mt-3 flex items-center justify-center gap-6 text-white/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {selectedImage.date}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(selectedImage.id);
                  }}
                  className="flex items-center gap-1.5 hover:text-white transition"
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${
                      likedImages.has(selectedImage.id)
                        ? "fill-rose-500 text-rose-500"
                        : ""
                    }`}
                  />
                  {selectedImage.likes +
                    (likedImages.has(selectedImage.id) ? 1 : 0)}
                </button>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition">
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition">
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}