"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import {
  Target,
  Users,
  Award,
  TrendingUp,
  Globe,
  Shield,
  Lightbulb,
  Briefcase,
  TargetIcon,
  BookMarked,
  Users2,
  Cpu,
  Database,
  BookCheck,
  HeartHandshake,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef, memo } from "react";

// ============================================================================
// TYPES
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
// DATA
// ============================================================================

const STATS: Stat[] = [
  { label: "Active Learners", value: "10000", icon: Users, color: "blue" },
  { label: "Certified Graduates", value: "8500", icon: Award, color: "emerald" },
  { label: "Course Completion", value: "98", icon: TrendingUp, color: "violet" },
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
    title: "Dual Service Model",
    description: "Through PCOMA, we deliver academic and professional training",
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

            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= end) {
                setCount(end);
                clearInterval(timer);
              } else {
                setCount(Math.floor(current));
              }
            }, stepDuration);

            return () => clearInterval(timer);
          }
        },
        { threshold: 0.5 }
      );

      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [end, hasAnimated]);

    return (
      <p ref={ref} className="text-3xl lg:text-4xl font-bold text-slate-900">
        {count.toLocaleString()}
        {suffix}
      </p>
    );
  }
);
AnimatedCounter.displayName = "AnimatedCounter";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("mission");
  const [hoveredStat, setHoveredStat] = useState<number | null>(null);

  const getColorClasses = (color: Stat["color"]) => {
    const map = {
      blue: { bg: "bg-blue-50", text: "text-blue-600" },
      emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
      violet: { bg: "bg-violet-50", text: "text-violet-600" },
      amber: { bg: "bg-amber-50", text: "text-amber-600" },
    };
    return map[color];
  };

  return (
    <div className="min-h-screen bg-white antialiased">
      <Navbar />

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative bg-[#0f172a] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
            {/* Left Content */}
            <div>
              <p className="text-blue-300 font-medium text-sm tracking-wider uppercase mb-4">
                About Us
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Bridging Theory with{" "}
                <span className="text-blue-300">Applied Excellence</span>
              </h1>
              <p className="mt-6 text-lg text-slate-300 leading-relaxed max-w-xl">
                We are a premier educational institution dedicated to bridging
                the gap between academic theory and practical application in
                accounting, business, technology, and management. Through our
                dual service model, we equip individuals and organizations with
                the skills needed to excel in today’s professional landscape.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition shadow-lg"
                >
                  Explore Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=80"
                  alt="Professional education"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-5 hidden lg:flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">98%</p>
                  <p className="text-sm text-slate-500">Student Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── STATS ───────────────── */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {STATS.map((stat, idx) => {
              const colors = getColorClasses(stat.color);
              const numericEnd = parseInt(stat.value, 10);
              const suffix =
                stat.label === "Course Completion"
                  ? "%"
                  : "+";

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredStat(idx)}
                  onMouseLeave={() => setHoveredStat(null)}
                  className={`group relative bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center transition-all duration-300 ${
                    hoveredStat === idx
                      ? "shadow-lg -translate-y-1 border-slate-200"
                      : "hover:shadow-md"
                  }`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colors.bg} mb-5 transition-transform duration-300 ${
                      hoveredStat === idx ? "scale-110" : ""
                    }`}
                  >
                    <stat.icon className={`h-6 w-6 ${colors.text}`} />
                  </div>
                  <AnimatedCounter end={numericEnd} suffix={suffix} />
                  <p className={`mt-1 text-sm font-medium ${colors.text}`}>
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────── MISSION / VISION / OBJECTIVES / CERTS ───────────────── */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Our Guiding Principles
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              The foundation upon which we build educational excellence and
              professional success
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10 overflow-x-auto pb-1">
            <div className="inline-flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Image */}
            <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[520px] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={TAB_CONTENT_IMAGES[activeTab]}
                alt={activeTab}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white/80 text-sm font-medium uppercase tracking-wider">
                  Featured
                </p>
                <p className="text-white text-xl font-bold mt-1">
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

            {/* Content */}
            <div>
              {activeTab === "mission" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    To equip individuals and organizations with practical,
                    globally relevant accounting, business, technology, and
                    management skills through premium education, hands-on
                    training, and innovation-driven faculty engagement.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4 pt-4">
                    {[
                      "Practical Skill Development",
                      "Global Curriculum Standards",
                      "Industry-Aligned Training",
                      "Innovative Delivery Methods",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-700">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "vision" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Our Vision
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    To become the world’s foremost applied accounting and
                    management institution, recognized globally for producing
                    elite professionals who drive economic transformation and
                    ethical enterprise.
                  </p>
                </div>
              )}

              {activeTab === "objectives" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                      <TargetIcon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Core Objectives
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {CORE_OBJECTIVES.map((obj, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl"
                      >
                        <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {obj}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "certifications" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Global Certifications
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {PROFESSIONAL_CERTIFICATIONS.map((cert) => (
                      <div
                        key={cert}
                        className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <BookMarked className="h-5 w-5 text-blue-600" />
                        </div>
                        <span className="font-medium text-slate-800 text-sm">
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

      {/* ───────────────── CORE VALUES ───────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Our Core Values
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              The principles that define our educational philosophy and
              institutional culture
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_VALUES.map((value) => (
              <div
                key={value.title}
                className="group bg-slate-50 border border-slate-100 rounded-2xl p-6 lg:p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
                >
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── UNIQUE STRENGTHS ───────────────── */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Our Unique Strengths
            </h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              What sets Pathfinder apart in professional accounting education
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {UNIQUE_STRENGTHS.map((strength) => (
              <div
                key={strength.title}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition">
                  <strength.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {strength.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {strength.description}
                </p>
                <ChevronRight className="absolute bottom-6 right-6 h-4 w-4 text-blue-600 opacity-0 group-hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}