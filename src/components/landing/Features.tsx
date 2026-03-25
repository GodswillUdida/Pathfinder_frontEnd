"use client";

import { useRef, memo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Laptop,
  Briefcase,
  Clock,
  HeartHandshake,
  CheckCircle2,
  BookImage,
  Award,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: ColorKey;
  image: string;
  stats: string;
}

interface Stat {
  value: string;
  label: string;
}

type ColorKey = "blue" | "green" | "purple" | "indigo" | "amber" | "pink";

// ============================================================================
// CONSTANTS
// ============================================================================

// Tailwind-safe color mappings (no dynamic classes)
const ICON_BG: Record<ColorKey, string> = {
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
  green: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300",
  purple:
    "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
  indigo:
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300",
};

const BAR_COLOR: Record<ColorKey, string> = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  purple: "from-purple-500 to-purple-600",
  indigo: "from-indigo-500 to-indigo-600",
  amber: "from-amber-500 to-amber-600",
  pink: "from-pink-500 to-pink-600",
};

const FEATURES: Feature[] = [
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
    stats: "98% Success Rate",
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

const BENEFITS: string[] = [
  "Industry-recognized certifications",
  "Lifetime course access",
  "Money-back guarantee",
  "Job placement assistance",
];

const STATS: Stat[] = [
  { value: "500+", label: "Students Trained" },
  { value: "98%", label: "Success Rate" },
  { value: "20+", label: "Expert Instructors" },
  { value: "100+", label: "Partner Companies" },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const FeatureCard = memo(
  ({
    feature,
    index,
  }: {
    feature: Feature;
    index: number;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group h-full"
      >
        <article className="relative h-full bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-xl transition-all duration-300">
          {/* Image */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-800">
            <Image
              src={feature.image}
              alt={`${feature.title} illustration`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={index < 3}
            />
          </div>

          {/* Icon */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${ICON_BG[feature.color]}`}
            aria-hidden="true"
          >
            <feature.icon className="w-7 h-7" />
          </div>

          {/* Content */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
            {feature.description}
          </p>

          {/* Stats Badge */}
          <div className="mt-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs font-semibold rounded-full">
              <TrendingUp className="w-3 h-3" />
              {feature.stats}
            </span>
          </div>

          {/* Hover bar */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${BAR_COLOR[feature.color]} rounded-b-2xl`}
            aria-hidden="true"
          />
        </article>
      </motion.div>
    );
  }
);
//             aria-hidden="true"
//           />
//         </article>
//       </motion.div>
//     );
//   }
// );

FeatureCard.displayName = "FeatureCard";

const StatCard = memo(
  ({
    stat,
    index,
  }: {
    stat: Stat;
    index: number;
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="text-center bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 group"
      >
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
          {stat.value}
        </div>
        <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">
          {stat.label}
        </div>
      </motion.div>
    );
  }
);
//           {stat.label}
//         </div>
//       </motion.div>
//     );
//   }
// );

StatCard.displayName = "StatCard";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 overflow-hidden"
      aria-labelledby="features-heading"
    >
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 dark:bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-6 border border-blue-200 dark:border-blue-800"
          >
            <Award className="w-4 h-4" aria-hidden="true" />
            <span>Our Competitive Advantage</span>
          </motion.div>

          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 tracking-tight"
          >
            Everything You Need
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              To Succeed
            </span>
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Comprehensive training, career support, and industry connections to
            transform your accounting career.
          </p>
        </motion.header>

        {/* Features Grid */}
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-16"
          role="list"
          aria-label="Platform features"
        >
          {FEATURES.map((feature, idx) => (
            <div key={feature.title} role="listitem">
              <FeatureCard
                feature={feature}
                index={idx}
              />
            </div>
          ))}
        </div>

        {/* Value Proposition Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 lg:p-10 shadow-xl mb-16"
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Everything You Need to Succeed
              </h3>
              <p className="text-blue-100">
                From enrollment to job placement — we&apos;ve got you covered.
              </p>
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full lg:w-auto"
              role="list"
              aria-label="Key benefits"
            >
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-white"
                  role="listitem"
                >
                  <div
                    className="shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:gap-8"
          role="list"
          aria-label="Platform statistics"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} role="listitem">
              <StatCard
                stat={stat}
                index={i}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}