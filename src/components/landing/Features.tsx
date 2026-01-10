"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Laptop,
  Briefcase,
  Clock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  BookImage,
  Award,
} from "lucide-react";
import Image from "next/image";

// Tailwind-friendly safe, no dynamic color classes
const ICON_BG = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  green: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
  purple:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  indigo:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
};

const BAR_COLOR = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-600",
  amber: "from-amber-500 to-amber-600",
  pink: "from-pink-500 to-pink-600",
};

const features = [
  {
    title: "Expert-Led Training",
    description:
      "Learn from certified accountants and industry professionals with years of real-world experience in accounting, taxation, and financial management.",
    icon: BookImage,
    color: "blue",
    image: "https://accountantss-pathfinder.vercel.app/assets/F-CTlMFJZc.webp",
    stats: "20+ Expert Instructors",
  },
  {
    title: "Proven Success Rate",
    description:
      "Join thousands of successful graduates with our 95% pass rate and employment success across leading firms in Nigeria and beyond.",
    icon: TrendingUp,
    color: "green",
    image:
      "https://accountantss-pathfinder.vercel.app/assets/diploma-Bx0v4kKR.webp",
    stats: "95% Success Rate",
  },
  {
    title: "Modern Learning Tools",
    description:
      "Access HD video lectures, interactive quizzes, resources, and cutting-edge learning management systems designed for your success.",
    icon: Laptop,
    color: "purple",
    image:
      "https://accountantss-pathfinder.vercel.app/assets/tool2-Dkjm-o88.webp",
    stats: "24/7 Access",
  },
  {
    title: "Career Placement",
    description:
      "Direct placement opportunities through our corporate network, including Big Four firms and leading Nigerian companies.",
    icon: Briefcase,
    color: "indigo",
    image:
      "https://accountantss-pathfinder.vercel.app/assets/job-C5HDZGxd.webp",
    stats: "500+ Placements",
  },
  {
    title: "Flexible Scheduling",
    description:
      "Choose from online, physical, or hybrid modes. Study at your own pace with lifetime access to course materials.",
    icon: Clock,
    color: "amber",
    image:
      "https://accountantss-pathfinder.vercel.app/assets/upscalemedia-transformed-BuZfPZV9.jpeg",
    stats: "Learn Your Way",
  },
  {
    title: "Personalized Support",
    description:
      "Get one-on-one mentorship, career counseling, and dedicated support from enrollment to job placement.",
    icon: HeartHandshake,
    color: "pink",
    image:
      "https://accountantss-pathfinder.vercel.app/assets/one%20on%20one%202-ksSVd6uh.webp",
    stats: "1-on-1 Mentorship",
  },
];

const benefits = [
  "Industry-recognized certifications",
  "Lifetime course access",
  "Money-back guarantee",
  "Job placement assistance",
];

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-20 lg:py-28 bg-linear-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 overflow-hidden"
    >
      {/* Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-6 border border-blue-200"
          >
            <Award className="w-4 h-4" />
            Our Competitive Advantage
          </motion.div>

          <h2 className="text-3xl sm:text-5xl lg:text-5xl font-bold mb-6 tracking-normal">
            Everything You Need
            <br />
            <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              To Succeed
            </span>
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive training, career support, and industry connections to
            transform your accounting career.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {features.map((f, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative h-full bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all">
                {/* Image */}
                <Image
                  src={f.image}
                  alt={f.title}
                  width={300}
                  height={200}
                  className="rounded-md"
                />

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mt-4 ${
                    ICON_BG[f.color as keyof typeof ICON_BG]
                  }`}
                >
                  <f.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-blue-700 dark:text-white mt-4 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                  {f.description}
                </p>

                {/* Stats */}
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-blue-700 text-xs font-semibold rounded-full">
                    {f.stats}
                  </span>
                </div>

                {/* Hover bar */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-linear-to-r ${
                    BAR_COLOR[f.color as keyof typeof BAR_COLOR]
                  } rounded-b-2xl`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Value Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-10 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Everything You Need to Succeed
              </h3>
              <p className="text-blue-100">
                From enrollment to job placement — we’ve got you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-white">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8 mt-16"
        >
          {[
            { value: "500+", label: "Students Trained" },
            { value: "95%", label: "Success Rate" },
            { value: "20+", label: "Expert Instructors" },
            { value: "100+", label: "Partner Companies" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md"
            >
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600 mb-2">
                {s.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-medium">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
