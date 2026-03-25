"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import {
  Target,
  Users,
  Award,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Globe,
  Shield,
  Lightbulb,
  BookOpen,
  Briefcase,
  Globe2,
  HeartHandshake,
  TargetIcon,
  BookMarked,
  Users2,
  Cpu,
  Database,
  BookCheck,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, memo } from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: "blue" | "emerald" | "violet" | "amber";
}

interface CoreValue {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
}

interface Strength {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Tab {
  id: string;
  label: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATS: Stat[] = [
  { label: "Active Learners", value: "10000", icon: Users, color: "blue" },
  {
    label: "Certified Graduates",
    value: "8500",
    icon: Award,
    color: "emerald",
  },
  {
    label: "Course Completion",
    value: "98",
    icon: TrendingUp,
    color: "violet",
  },
  { label: "Countries Reached", value: "5", icon: Globe, color: "amber" },
];

const CORE_VALUES: CoreValue[] = [
  {
    title: "Integrity",
    description:
      "Upholding the highest standards of ethical conduct in all academic and professional engagements",
    icon: Shield,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Innovation",
    description:
      "Promoting continuous improvement, digital transformation, and creative thinking in education delivery",
    icon: Lightbulb,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    title: "Excellence",
    description:
      "Striving for exceptional outcomes in teaching, research, and professional consultancy services",
    icon: Award,
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: "Professionalism",
    description:
      "Maintaining discipline, respect, and quality assurance in all learning and work processes",
    icon: Briefcase,
    gradient: "from-purple-500 to-violet-500",
  },
  {
    title: "Impact",
    description:
      "Focusing on results that transform lives, organizations, and societies through practical education",
    icon: TargetIcon,
    gradient: "from-rose-500 to-pink-500",
  },
];

const UNIQUE_STRENGTHS: Strength[] = [
  {
    title: "Data-Driven Service Model",
    description:
      "Advanced analytics guiding personalized learning paths and curriculum development",
    icon: Database,
  },
  {
    title: "Elite Faculty Team",
    description:
      "Industry veterans and academic experts with real-world professional experience",
    icon: Users2,
  },
  {
    title: "Outstanding Exam Success Rates",
    description:
      "Consistent high pass rates for global professional certifications",
    icon: BookCheck,
  },
  {
    title: "Premium Learning Experience",
    description:
      "State-of-the-art digital tools and platforms enhancing learning experience",
    icon: Cpu,
  },
  {
    title: "Job Readiness & Placement",
    description:
      "We design each course to ensure immediate applicability and job readiness",
    icon: HeartHandshake,
  },
  {
    title: "Global Relevance",
    description:
      "Curriculum includes international taxation, IFRS, forensic accounting, and financial modeling",
    icon: Globe2,
  },
  {
    title: "Flexibility and Access",
    description:
      "Hybrid learning model combining physical and virtual education for professionals worldwide",
    icon: Globe,
  },
];

const CORE_OBJECTIVES = [
  "Bridge the persistent gap between academic theory and real-world application in finance, management, and technology",
  "Develop and deliver premium diploma and professional programs that meet current industry demands",
  "Provide highly effective preparatory lectures for global certifications including ICAN, ACCA, CIMA, CITN, IBAKM, and others",
  "Offer practical consultancy and training services to businesses through Accountants Pathfinder",
  "Integrate technology, data analytics, and applied research into traditional accounting and management education",
  "Build a global network of competent professionals equipped for both national and international roles",
];

const PROFESSIONAL_CERTIFICATIONS = [
  "ICAN (Institute of Chartered Accountants of Nigeria)",
  "ACCA (Association of Chartered Certified Accountants)",
  "CIMA (Chartered Institute of Management Accountants)",
  "CITN (Chartered Institute of Taxation of Nigeria)",
  "IBAKM (Institute of Business Analytics and Knowledge Management)",
  "Other Global Professional Bodies",
];

const TAB_CONTENT_IMAGES: Record<string, string> = {
  mission:
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80",
  vision:
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80",
  objectives:
    "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=800&q=80",
  certifications:
    "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=800&q=80",
};

const TABS: Tab[] = [
  { id: "mission", label: "Mission" },
  { id: "vision", label: "Vision" },
  { id: "objectives", label: "Core Objectives" },
  { id: "certifications", label: "Certifications" },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const AnimatedCounter = memo(
  ({ end, suffix = "" }: { end: number; suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
      if (hasAnimated) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setHasAnimated(true);

            const duration = 2000;
            const steps = 60;
            const increment = end / steps;
            const stepDuration = duration / steps;

            let currentCount = 0;
            const timer = setInterval(() => {
              currentCount += increment;
              if (currentCount >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(Math.floor(currentCount));
              }
            }, stepDuration);

            return () => clearInterval(timer);
          }
        },
        { threshold: 0.5 },
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    }, [end, hasAnimated]);

    return (
      <p ref={ref} className="text-3xl lg:text-4xl font-bold mb-2">
        {count.toLocaleString()}
        {suffix}
      </p>
    );
  },
);

// Debugging name
AnimatedCounter.displayName = "AnimatedCounter";

const SectionTitle = memo(
  ({
    children,
    subtitle,
  }: {
    children: React.ReactNode;
    subtitle?: string;
  }) => {
    const words = children?.toString().split(" ") || [];
    const lastWord = words.pop();
    const firstWords = words.join(" ");

    return (
      <div className="text-center mb-12 lg:mb-16">
        <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-4">
          {firstWords}{" "}
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {lastWord}
            </span>
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-blue-200"
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
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        )}
      </div>
    );
  },
);

SectionTitle.displayName = "SectionTitle";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("mission");
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const getColorClasses = (color: Stat["color"]) => {
    const colors = {
      blue: {
        bg: "from-blue-50 to-blue-100",
        text: "text-blue-600",
        hover: "group-hover:text-blue-600",
      },
      emerald: {
        bg: "from-emerald-50 to-emerald-100",
        text: "text-emerald-600",
        hover: "group-hover:text-emerald-600",
      },
      violet: {
        bg: "from-violet-50 to-violet-100",
        text: "text-violet-600",
        hover: "group-hover:text-violet-600",
      },
      amber: {
        bg: "from-amber-50 to-amber-100",
        text: "text-amber-600",
        hover: "group-hover:text-amber-600",
      },
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950">
        {/* Geometric Background */}
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.2),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_50%,rgba(56,189,248,0.15),transparent_50%)]" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div>
              <div className="text-3xl text-white font-['Inter']">About us</div>
              <h1 className=" flex text-4xl sm:text-5xl lg:text-34xl font-bold text-white mb-6 gap-x-2 leading-tight">
                <span className="block">Accountants</span>
                <span className="block bg-gradient-to-r from-blue-300 via-blue-200 to-cyan-300 bg-clip-text text-transparent">
                  Pathfinder
                </span>
                {/* <span className="block mt-3 text-white">Education</span> */}
              </h1>

              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed max-w-lg">
                We bridge academic excellence with practical application,
                preparing professionals for global accounting and finance
                leadership roles through innovative education solutions.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/courses"
                  className="group px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900"
                >
                  <span className="flex items-center justify-center gap-3">
                    Explore Our Programs
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
                <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900">
                  <span className="flex items-center justify-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Download Brochure
                  </span>
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80"
                  alt="Professional accounting education"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 w-64 hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <AnimatedCounter end={98} suffix="%" />
                    <p className="text-sm text-gray-600">
                      Student Satisfaction
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
            {STATS.map((stat, idx) => {
              const colors = getColorClasses(stat.color);
              const numericEnd = parseInt(stat.value, 10);
              const suffix =
                stat.label === "Course Completion"
                  ? "%"
                  : stat.label === "Countries Reached"
                    ? "+"
                    : "+";

              return (
                <div
                  key={idx}
                  className={`group relative bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 lg:p-8 text-center transition-all duration-500 cursor-pointer ${
                    hoveredStat === idx
                      ? "scale-105 shadow-2xl -translate-y-2"
                      : "hover:shadow-xl hover:-translate-y-1"
                  }`}
                  onMouseEnter={() => setHoveredStat(idx)}
                  onMouseLeave={() => setHoveredStat(null)}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative">
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br mb-6 transition-all duration-300 ${
                        hoveredStat === idx
                          ? "scale-110 rotate-6"
                          : "group-hover:scale-110"
                      } ${colors.bg}`}
                    >
                      <stat.icon
                        className={`h-7 w-7 transition-colors duration-300 ${
                          hoveredStat === idx ? colors.text : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div
                      className={`transition-all duration-300 ${
                        hoveredStat === idx
                          ? "text-gray-900 scale-105"
                          : "text-gray-900"
                      }`}
                    >
                      <AnimatedCounter end={numericEnd} suffix={suffix} />
                    </div>
                    <p
                      className={`text-sm font-medium tracking-wide transition-colors duration-300 ${
                        hoveredStat === idx ? colors.text : "text-gray-600"
                      }`}
                    >
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section ref={sectionRef} className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="The foundation upon which we build educational excellence and professional success">
            Our Guiding Principles
          </SectionTitle>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12 overflow-x-auto pb-2">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-white text-blue-600 shadow-lg transform scale-105"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Image Column */}
            <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src={TAB_CONTENT_IMAGES[activeTab]}
                alt={activeTab}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />

              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {activeTab === "mission" ? (
                      <Target className="h-5 w-5 text-white" />
                    ) : activeTab === "vision" ? (
                      <Globe className="h-5 w-5 text-white" />
                    ) : activeTab === "objectives" ? (
                      <TargetIcon className="h-5 w-5 text-white" />
                    ) : (
                      <Award className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white uppercase tracking-wider">
                      Featured Insight
                    </p>
                    <p className="text-lg font-bold text-white">
                      {activeTab === "mission"
                        ? "Practical Excellence"
                        : activeTab === "vision"
                          ? "Global Leadership"
                          : activeTab === "objectives"
                            ? "Strategic Goals"
                            : "Professional Recognition"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div
              className={`transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {activeTab === "mission" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Target className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Our Mission
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
                    </div>
                  </div>

                  <p className="text-lg text-gray-700 leading-relaxed">
                    To equip individuals and organizations with practical,
                    globally relevant accounting, business, technology, and
                    management skills through premium education, hands-on
                    training, and innovation-driven faculty engagement.
                  </p>

                  <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                    {[
                      "Practical Skill Development",
                      "Global Curriculum Standards",
                      "Industry-Aligned Training",
                      "Innovative Delivery Methods",
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                          <CheckCircle2 className="h-3 w-3 text-blue-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "vision" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Globe className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Our Vision
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full" />
                    </div>
                  </div>

                  <p className="text-lg text-gray-700 leading-relaxed">
                    To become the world&apos;s foremost applied accounting and
                    management institution, recognized globally for producing
                    elite professionals who drive economic transformation and
                    ethical enterprise.
                  </p>
                </div>
              )}

              {activeTab === "objectives" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <TargetIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Core Objectives
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {CORE_OBJECTIVES.map((objective, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="font-semibold text-emerald-600">
                            {idx + 1}
                          </span>
                        </div>
                        <p className="text-gray-700">{objective}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "certifications" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                      <Award className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        Global Certifications
                      </h3>
                      <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {PROFESSIONAL_CERTIFICATIONS.map((cert, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-colors duration-300"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BookMarked className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-800">
                          {cert}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="The principles that define our educational philosophy and institutional culture">
            Our Core Values
          </SectionTitle>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {CORE_VALUES.map((value, idx) => (
              <div
                key={idx}
                className="group relative bg-gradient-to-b from-white to-gray-50 border border-gray-100 rounded-2xl p-6 lg:p-8 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 from-blue-500/10 to-indigo-500/10" />

                <div className="relative">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Strengths Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle subtitle="What sets Pathfinder apart in professional accounting education">
            Our Unique Strengths
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {UNIQUE_STRENGTHS.map((strength, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-gray-200 rounded-2xl p-6 lg:p-8 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <strength.icon className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-clip-text text-transparent">
                    {strength.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {strength.description}
                  </p>
                </div>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <ChevronRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-gray-950 relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/5 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6">
              Begin Your Professional{" "}
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Journey
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Connect with us to explore how Pathfinder can accelerate your
              career in accounting and finance
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <a
                href="mailto:pathfinderofficial@gmail.com"
                className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <Mail className="h-8 w-8 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-semibold mb-2">Email Us</p>
                <p className="text-sm text-gray-300 break-words">
                  pathfinderofficialteam@gmail.com
                </p>
              </a>

              <a
                href="tel:+2347014580375"
                className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <Phone className="h-8 w-8 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-semibold mb-2">Call Us</p>
                <p className="text-sm text-gray-300">+234 701 458 0375</p>
              </a>

              <a
                href="tel:+2349032749238"
                className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-all duration-300 hover:scale-[1.02]"
              >
                <Phone className="h-8 w-8 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-semibold mb-2">Call Us</p>
                <p className="text-sm text-gray-300">+234 903 274 9238</p>
              </a>

              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-all duration-300 hover:scale-[1.02]">
                <MapPin className="h-8 w-8 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="font-semibold mb-2">Visit Us</p>
                <p className="text-sm text-gray-300">Lagos, Nigeria</p>
              </div>
            </div>

            <button className="group px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-2xl hover:shadow-cyan-900/50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-900">
              <span className="flex items-center justify-center gap-3">
                Schedule a Consultation
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
