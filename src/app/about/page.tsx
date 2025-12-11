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
  Sparkles,
  ArrowRight,
  Linkedin,
  Twitter,
  Globe,
  Zap,
  Heart,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const stats = [
  { label: "Active Learners", value: "10,000+", icon: Users, color: "blue" },
  { label: "Expert Instructors", value: "50+", icon: Award, color: "purple" },
  {
    label: "Course Completion",
    value: "95%",
    icon: TrendingUp,
    color: "green",
  },
  { label: "Countries Reached", value: "25+", icon: Target, color: "orange" },
];

const values = [
  {
    title: "Excellence",
    description:
      "We deliver world-class education through meticulously designed courses and expert instruction that exceeds industry standards.",
    icon: Award,
    gradient: "from-blue-500 to-blue-600",
  },
  {
    title: "Accessibility",
    description:
      "Quality education should be available to everyone, regardless of background, location, or financial circumstances.",
    icon: Users,
    gradient: "from-purple-500 to-purple-600",
  },
  {
    title: "Innovation",
    description:
      "We continuously evolve our platform and content to stay ahead of industry trends and technological advancements.",
    icon: Zap,
    gradient: "from-orange-500 to-orange-600",
  },
  {
    title: "Impact",
    description:
      "Our success is measured by the real-world career advancement and life transformation of our learners.",
    icon: Heart,
    gradient: "from-pink-500 to-pink-600",
  },
];

const team = [
  {
    name: "Dr. President Onomouorhoya",
    role: "Chief Academic Officer",
    image:
      "https://res.cloudinary.com/dirrncimm/image/upload/v1752703446/assets/dr_president_bunldd.jpg",
    bio: "15+ years in educational leadership",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Mr. Michael Oluwalere",
    role: "Head of Curriculum",
    image:
      "https://res.cloudinary.com/dirrncimm/image/upload/v1752703439/assets/Olawalere_juzvxj.jpg",
    bio: "Former Fortune 500 training director",
    social: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Mr. Emmanuel Udida",
    role: "Director of Student Success",
    image:
      "https://res.cloudinary.com/dirrncimm/image/upload/v1752703443/assets/Official_Pics_pflcth.jpg",
    bio: "Passionate about learner outcomes",
    social: { linkedin: "#", twitter: "#" },
  },
  // {
  //   name: "David Kim",
  //   role: "Technology Lead",
  //   image:
  //     "https://res.cloudinary.com/dirrncimm/image/upload/v1752703446/assets/dr_president_bunldd.jpg",
  //   bio: "Building the future of e-learning",
  //   social: { linkedin: "#", twitter: "#" },
  // },
];

const achievements = [
  "Industry-recognized certifications",
  "Hands-on practical projects",
  "Lifetime access to materials",
  "Career support & mentorship",
  "1-on-1 expert consultations",
  "Job placement assistance",
];

const milestones = [
  { year: "2020", title: "Founded", desc: "Pathfinder was born" },
  { year: "2021", title: "1K Students", desc: "Hit first milestone" },
  { year: "2023", title: "5K Students", desc: "Rapid growth phase" },
  { year: "2024", title: "10K+ Students", desc: "Global expansion" },
];

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("Mission");

  return (
    <div className="bg-white font-inter antialiased">
      <Navbar />
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-linear-to-br from-gray-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8 text-white">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-semibold font-poppins">
              About Pathfinder
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 font-poppins leading-tight max-w-4xl mx-auto">
            Transforming Careers Through
            <span className="block mt-2 bg-linear-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              World-Class Education
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            {
              "At Pathfinder, we believe that quality education is the key to unlocking your full potential. Our mission is to provide accessible, industry-relevant learning experiences that empower individuals to achieve their career goals and thrive in today's competitive job market."
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl font-poppins">
              <span className="flex items-center justify-center gap-2">
                Explore Our Story
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm font-poppins">
              Join Our Team
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section - Optimized Grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-4 sm:p-6 lg:p-8 text-center shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-linear-to-br ${
                    stat.color === "blue"
                      ? "from-blue-100 to-blue-50"
                      : stat.color === "purple"
                      ? "from-purple-100 to-purple-50"
                      : stat.color === "green"
                      ? "from-green-100 to-green-50"
                      : "from-orange-100 to-orange-50"
                  } rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon
                    className={`h-6 w-6 sm:h-7 sm:w-7 ${
                      stat.color === "blue"
                        ? "text-blue-600"
                        : stat.color === "purple"
                        ? "text-purple-600"
                        : stat.color === "green"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  />
                </div>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 font-poppins">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-gray-600 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision Tabs */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12 overflow-x-auto">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              {["Mission", "Vision", "Story"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all font-poppins whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Content */}
            <div className="order-2 lg:order-1">
              {activeTab === "Mission" && (
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-poppins">
                    Our Mission
                  </h2>
                  <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                    <p>
                      Pathfinder is dedicated to providing high-quality online
                      education that helps individuals achieve their career
                      goals. Our platform offers a comprehensive range of
                      professional courses and programs designed by industry
                      experts.
                    </p>
                    <p>
                      {
                        "We believe in accessible education for all and strive to create a supportive learning environment that fosters growth and development. Our mission is to empower learners with the skills and knowledge they need to succeed in today's competitive job market."
                      }
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 pt-4">
                    {achievements.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm sm:text-base text-gray-700 font-medium">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "Vision" && (
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-poppins">
                    Our Vision
                  </h2>
                  <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                    <p>
                      {
                        "To become the world's most trusted platform for professional development, where millions of learners transform their careers and lives through innovative, accessible education. "
                      }
                    </p>
                    <p>
                      We envision a future where quality education breaks down
                      all barriers— geographic, economic, and social—enabling
                      every individual to reach their full potential and
                      contribute meaningfully to the global economy.
                    </p>
                  </div>
                  <div className="bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                    <Shield className="h-10 w-10 text-blue-600 mb-3" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                      Our Commitment
                    </h3>
                    <p className="text-gray-600">
                      {
                        "We're committed to maintaining the highest standards of educational excellence while continuously innovating to meet the evolving needs of modern learners and industries."
                      }
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "Story" && (
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 font-poppins">
                    Our Journey
                  </h2>
                  <div className="space-y-4 text-base sm:text-lg text-gray-600 leading-relaxed">
                    <p>
                      Founded in 2020, Pathfinder began with a simple yet
                      powerful idea: quality education should be accessible to
                      everyone, everywhere.
                    </p>
                    <p>
                      What started as a small initiative has grown into a
                      thriving platform serving over 10,000 learners across 25
                      countries, with expert instructors and cutting-edge
                      curriculum.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {milestones.map((milestone, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <div className="shrink-0 w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold font-poppins">
                          {milestone.year}
                        </div>
                        <div className="flex-1 pt-1">
                          <h4 className="font-bold text-gray-900 mb-1 font-poppins">
                            {milestone.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {milestone.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 relative">
              <div className="relative aspect-square lg:aspect-4/5 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src={
                    activeTab === "Mission"
                      ? "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
                      : activeTab === "Vision"
                      ? "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80"
                      : "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80"
                  }
                  alt={activeTab}
                  className="w-full h-full object-cover"
                  width={800}
                  height={800}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-60 hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 font-poppins">
                      25+
                    </p>
                    <p className="text-xs text-gray-600 font-medium">
                      Countries
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Global reach, local impact
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Our Core Values
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and every decision we
              make
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-6 lg:p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 cursor-pointer"
              >
                <div
                  className={`w-14 h-14 lg:w-16 lg:h-16 bg-linear-to-br ${value.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                >
                  <value.icon className="h-7 w-7 lg:h-8 lg:w-8 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3 font-poppins">
                  {value.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-poppins">
              Meet Our Leadership
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Experienced educators and industry professionals dedicated to your
              success
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative mb-6 overflow-hidden rounded-2xl aspect-square shadow-lg">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 gap-4">
                    <a
                      href={member.social.linkedin}
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                    >
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </a>
                    <a
                      href={member.social.twitter}
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75"
                    >
                      <Twitter className="h-5 w-5 text-blue-400" />
                    </a>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 font-poppins">
                  {member.name}
                </h3>
                <p className="text-sm sm:text-base text-blue-600 font-semibold mb-2 font-poppins">
                  {member.role}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-700 via-blue-700 to-blue-900 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full filter blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 font-poppins">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Have questions or want to learn more? Our team is here to help you
            succeed.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <a
              href="mailto:pathfinderofficial@gmail.com"
              className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Mail className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold mb-2 font-poppins">Email Us</p>
              <p className="text-sm text-blue-100 break-words">
                pathfinderofficial@gmail.com
              </p>
            </a>

            <a
              href="tel:+2348012345678"
              className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white hover:bg-white/20 transition-all duration-300"
            >
              <Phone className="h-8 w-8 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold mb-2 font-poppins">Call Us</p>
              <p className="text-sm text-blue-100">+234 801 234 5678</p>
            </a>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white">
              <MapPin className="h-8 w-8 mx-auto mb-3" />
              <p className="font-semibold mb-2 font-poppins">Visit Us</p>
              <p className="text-sm text-blue-100">Lagos, Nigeria</p>
            </div>
          </div>

          <button className="group px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-2xl hover:shadow-blue-900/50 hover:scale-105 font-poppins">
            <span className="flex items-center justify-center gap-2">
              Send Us a Message
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </section>

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
