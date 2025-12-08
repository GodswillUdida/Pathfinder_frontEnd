"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface HeroProps {
  totalCourses: number;
}

export function Hero({ totalCourses }: HeroProps) {
  return (
    <div className="relative bg-linear-to-r from-blue-600 to-indigo-600 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/10 bg-size-[20px_20px]" />
      <div className="relative container mx-auto px-4 py-20 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6 border border-white/30">
            <GraduationCap className="w-4 h-4" /> {totalCourses} Courses
            Available
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Explore Our{" "}
            <span className="text-blue-200">Professional Programs</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Discover flexible online courses and diploma programs designed for
            your success.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
