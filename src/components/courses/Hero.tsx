"use client";

import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  totalCourses?: number;
  onBrowseClick?: () => void;
}

export function Hero({ totalCourses = 0, onBrowseClick }: HeroProps) {
  const handleBrowseClick = () => {
    if (onBrowseClick) {
      onBrowseClick();
      return;
    }
    // Sensible default for contexts where no scroll target was wired up.
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  return (
    <section className="relative bg-linear-to-br from-blue-600 via-indigo-700 to-violet-700 overflow-hidden pt-16 pb-12 md:pt-10 md:pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] bg-size-[24px_24px]" />
      <div className="absolute inset-0 bg-linear-to-b from-black/20 via-transparent to-black/30" />

      <div className="relative container mx-auto px-5 max-w-4xl text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-full text-sm font-medium border border-white/25 mb-6">
            <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-indigo-700" />
            </div>
            <span>
              {totalCourses > 0 ? `${totalCourses}+ Professional Courses` : "Professional Courses"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-[1.05] mb-4">
            Master In-Demand Skills with
            <span className="block bg-linear-to-r from-blue-200 to-white bg-clip-text text-transparent mt-1">
              Industry-Leading Programs
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Flexible online courses and diplomas built for real career growth.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Button
              type="button"
              size="lg"
              onClick={handleBrowseClick}
              className="group bg-white text-indigo-700 hover:bg-white/95 font-semibold rounded-full px-8 h-12 text-base shadow-xl shadow-black/10"
            >
              Browse All Courses
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}