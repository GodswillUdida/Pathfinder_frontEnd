"use client";

import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Heart,
  ZoomIn,
  Filter,
  Grid3x3,
  LayoutGrid,
  Calendar,
  Users,
  Award,
  Sparkles,
  Play,
} from "lucide-react";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category: string;
  date: string;
  likes: number;
  type: string;
}

const categories = [
  { id: "all", name: "All Photos", count: 48 },
  { id: "classroom", name: "Classroom", count: 18 },
  { id: "events", name: "Events", count: 12 },
  { id: "graduation", name: "Graduation", count: 10 },
  { id: "workshops", name: "Workshops", count: 8 },
];

const galleryItems = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    title: "Collaborative Learning Session",
    category: "classroom",
    date: "Dec 2024",
    likes: 142,
    type: "image",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&q=80",
    title: "Business Strategy Workshop",
    category: "workshops",
    date: "Nov 2024",
    likes: 89,
    type: "image",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80",
    title: "Interactive Study Group",
    category: "classroom",
    date: "Dec 2024",
    likes: 156,
    type: "image",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    title: "Graduation Ceremony 2024",
    category: "graduation",
    date: "Oct 2024",
    likes: 234,
    type: "image",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
    title: "Team Building Activity",
    category: "events",
    date: "Nov 2024",
    likes: 98,
    type: "image",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
    title: "Professional Development Seminar",
    category: "workshops",
    date: "Dec 2024",
    likes: 112,
    type: "image",
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    title: "Leadership Training",
    category: "workshops",
    date: "Nov 2024",
    likes: 167,
    type: "image",
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    title: "Student Success Stories",
    category: "graduation",
    date: "Oct 2024",
    likes: 201,
    type: "image",
  },
  {
    id: 9,
    image:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80",
    title: "Annual Networking Event",
    category: "events",
    date: "Sep 2024",
    likes: 143,
    type: "image",
  },
  {
    id: 10,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
    title: "Modern Learning Environment",
    category: "classroom",
    date: "Dec 2024",
    likes: 87,
    type: "image",
  },
  {
    id: 11,
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80",
    title: "Certificate Award Ceremony",
    category: "graduation",
    date: "Oct 2024",
    likes: 189,
    type: "image",
  },
  {
    id: 12,
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
    title: "Industry Expert Lecture",
    category: "events",
    date: "Nov 2024",
    likes: 134,
    type: "image",
  },
];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [layout, setLayout] = useState("masonry");
  const [likedImages, setLikedImages] = useState(new Set());

  const filteredItems =
    activeCategory === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  const handleImageClick = (item: GalleryItem): void => {
    setSelectedImage(item);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handlePrevious = () => {
    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedImage?.id
    );
    const previousIndex =
      currentIndex > 0 ? currentIndex - 1 : filteredItems.length - 1;
    setSelectedImage(filteredItems[previousIndex]);
  };

  const handleNext = () => {
    const currentIndex = filteredItems.findIndex(
      (item) => item.id === selectedImage?.id
    );
    const nextIndex =
      currentIndex < filteredItems.length - 1 ? currentIndex + 1 : 0;
    setSelectedImage(filteredItems[nextIndex]);
  };

  const toggleLike = (id: number) => {
    const newLiked = new Set(likedImages);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedImages(newLiked);
  };

  return (
    <div className="bg-white font-inter antialiased min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-6 text-white">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold font-poppins">
              Moments That Matter
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins leading-tight">
            Our Gallery
          </h1>

          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Explore memorable moments from classrooms, events, graduations, and
            workshops. Witness the journey of learning and success.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Users className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold text-white font-poppins">
                2,500+
              </p>
              <p className="text-sm text-white/80">Students</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Calendar className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold text-white font-poppins">150+</p>
              <p className="text-sm text-white/80">Events</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Award className="h-6 w-6 text-white mx-auto mb-2" />
              <p className="text-2xl font-bold text-white font-poppins">
                1,000+
              </p>
              <p className="text-sm text-white/80">Graduates</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Layout Toggle */}
      <section className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all font-poppins ${
                    activeCategory === cat.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      activeCategory === cat.id ? "bg-white/20" : "bg-gray-200"
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setLayout("masonry")}
                className={`p-2 rounded-lg transition-all ${
                  layout === "masonry"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLayout("grid")}
                className={`p-2 rounded-lg transition-all ${
                  layout === "grid"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div
            className={
              layout === "masonry"
                ? "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
                : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            }
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group relative break-inside-avoid cursor-pointer"
                onClick={() => handleImageClick(item)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500">
                  {/* Image */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={800}
                    height={600}
                    className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-lg mb-2 font-poppins">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-white/80 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {item.likes}
                        </span>
                      </div>
                    </div>

                    {/* Zoom Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <ZoomIn className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900 font-poppins">
                    {categories.find((c) => c.id === item.category)?.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all z-10"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 sm:left-8 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 sm:right-8 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <div className="max-w-6xl max-h-[90vh] mx-4 sm:mx-8">
            <Image
              src={selectedImage.image}
              alt={selectedImage.title}
              width={800}
              height={600}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Image Info */}
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-3 font-poppins">
                {selectedImage.title}
              </h3>
              <div className="flex items-center justify-center gap-6 text-white/80">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {selectedImage.date}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(selectedImage.id);
                  }}
                  className="flex items-center gap-2 hover:text-pink-400 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      likedImages.has(selectedImage.id)
                        ? "fill-pink-500 text-pink-500"
                        : ""
                    }`}
                  />
                  {selectedImage.likes +
                    (likedImages.has(selectedImage.id) ? 1 : 0)}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl text-white font-semibold transition-all font-poppins">
                  <Download className="h-5 w-5" />
                  Download
                </button>
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl text-white font-semibold transition-all font-poppins">
                  <Share2 className="h-5 w-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(50px, 50px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
