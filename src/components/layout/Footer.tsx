"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  programs: [
    { name: "ICAN Lectures", href: "/courses" },
    { name: "Online Courses", href: "/courses" },
    { name: "Diploma Programs", href: "/courses" },
    { name: "All Courses", href: "/courses" },
  ],
  quickLinks: [
    { name: "About Us", href: "/about" },
    { name: "Our Instructors", href: "/instructors" },
    { name: "Success Stories", href: "/testimonials" },
    { name: "Career Support", href: "/careers" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "FAQs", href: "/faq" },
    { name: "Study Materials", href: "/resources" },
    { name: "Student Portal", href: "/portal" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Refund Policy", href: "/refund" },
    { name: "Contact Us", href: "/contact" },
  ],
};

const socialLinks = [
  {
    name: "Facebook",
    icon: Facebook,
    href: "https://facebook.com/accountantpathfinder",
  },
  {
    name: "Twitter",
    icon: Twitter,
    href: "https://x.com/accountantpath",
  },
  {
    name: "Instagram",
    icon: Instagram,
    href: "https://instagram.com/accountantpathfinder",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/company/accountantpathfinder",
  },
  {
    name: "YouTube",
    icon: Youtube,
    href: "https://youtube.com/@accountantpathfinder",
  },
];

const contactInfo = [
  {
    icon: MapPin,
    text: "45, Abeokuta Street off Yaya Abatan Road, Ogba, Ikeja, Lagos State.",
  },
  {
    icon: Phone,
    text: "+234 701 458 0375, +234 903 274 9238",
    href: "tel:+2347014580375",
  },
  {
    icon: Mail,
    text: "pathfinderofficialteam@gmail.com",
    href: "mailto:pathfinderofficialteam@gmail.com",
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      {/* Pattern */}
      <div className="absolute inset-0 bg-grid-white/5 bg-size:30px_30px opacity-10 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4"
          >
            <Link href="/" className="inline-block mb-6">
              <Image
                src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                alt="Accountant Pathfinder"
                width={180}
                height={60}
                className="h-20 w-auto brightness-0 invert"
              />
            </Link>

            <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
              Nigeria’s premier accounting education platform. Master ICAN,
              ACCA, and top-tier financial skills with expert-led programs.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm">
                Subscribe to our Newsletter
              </h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 rounded-lg focus-visible:ring-blue-500"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300"
                >
                  <s.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link Sections */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([section, links], i) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (i + 1) }}
              >
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide mb-4">
                  {section.replace(/([A-Z])/g, " $1")}
                </h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-gray-400 hover:text-blue-400 transition-colors text-sm flex items-center group"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {contactInfo.map((info, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                  <info.icon className="w-5 h-5 text-blue-400" />
                </div>
                {info.href ? (
                  <a
                    href={info.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors mt-2 uppercase font-bold"
                  >
                    {info.text}
                  </a>
                ) : (
                  <p className="text-sm text-gray-400 mt-2 uppercase">{info.text}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Accountant Pathfinder. All rights
            reserved.
          </p>

          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-500">
              Built by{" "}
              <span className="font-bold text-yellow-600">Udis Technologies</span>
            </span>
            <span className="text-gray-500">
              Powered by{" "}
              <span className="text-blue-400 font-semibold">PCOMA</span>
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
