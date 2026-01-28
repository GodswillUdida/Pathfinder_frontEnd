"use client";

import { useRef, memo } from "react";
import { motion } from "framer-motion";
import { Award, Building2, Handshake, type LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Partner {
  id: number;
  name: string;
  description: string;
  logo: string;
  website: string;
}

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PARTNERS: readonly Partner[] = [
  {
    id: 1,
    name: "PCOMA",
    description: "Leading provider of professional accounting education",
    logo: "/partners/pathfinder.png",
    website: "https://pathfindercollege.com",
  },
  {
    id: 2,
    name: "World Innovators University",
    description: "Offering globally recognized accounting qualifications",
    logo: "/partners/world-innovators.png",
    website: "https://wiuglobal.com",
  },
  {
    id: 3,
    name: "Institute of Business Administration",
    description:
      "Collaborating on advanced accounting programs and internships",
    logo: "/partners/iba.png",
    website: "https://www.ibakmglobal.com",
  },
  {
    id: 4,
    name: "Chartered Institute of Business Administration",
    description: "Providing industry insights and professional training",
    logo: "/partners/ciba.png",
    website: "https://cibakmglobal.com",
  },
  {
    id: 5,
    name: "WIEMO",
    description:
      "Promotion and advancement of innovation and education excellence",
    logo: "https://res.cloudinary.com/dirrncimm/image/upload/v1752904913/pathfinder/images/wiemo_kwlyva.jpg",
    website: "https://wiemo.org",
  },
] as const;

const BENEFITS: readonly Benefit[] = [
  {
    icon: Award,
    title: "Industry Recognition",
    description:
      "Accredited by leading professional bodies and regulatory authorities.",
    color: "bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400",
  },
  {
    icon: Building2,
    title: "Corporate Partnerships",
    description:
      "Direct placement opportunities with top firms and organizations.",
    color:
      "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Handshake,
    title: "Career Support",
    description:
      "Access to exclusive internships and job placements through our network.",
    color:
      "bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400",
  },
] as const;

const TRUST_BADGES = [
  { icon: Award, label: "Accredited Programs" },
  { icon: Building2, label: "Industry Recognized" },
] as const;

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const PartnerCard = memo(
  ({ partner, index }: { partner: Partner; index: number }) => {
    return (
      <motion.a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        className="group block h-full"
        aria-label={`Visit ${partner.name} website`}
      >
        <article className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
          {/* Logo */}
          <div className="relative w-full h-24 mb-4 flex items-center justify-center">
            <Image
              src={partner.logo}
              alt={`${partner.name} logo`}
              fill
              className="object-contain transition-all duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority={index < 5}
            />
          </div>

          {/* Partner Name */}
          <h3 className="text-sm font-bold text-gray-900 dark:text-white text-center mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {partner.name}
          </h3>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-600/95 to-blue-500/95 dark:from-blue-900/95 dark:to-blue-800/95 rounded-2xl p-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p className="text-sm text-white text-center leading-relaxed">
              {partner.description}
            </p>
          </div>
        </article>
      </motion.a>
    );
  },
);

PartnerCard.displayName = "PartnerCard";

const BenefitCard = memo(
  ({ benefit, index }: { benefit: Benefit; index: number }) => {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
        className="relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 lg:p-8 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm hover:shadow-lg transition-all duration-300 group"
      >
        <div
          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform duration-300 group-hover:scale-110 ${benefit.color}`}
          aria-hidden="true"
        >
          <benefit.icon className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {benefit.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {benefit.description}
        </p>
      </motion.article>
    );
  },
);

BenefitCard.displayName = "BenefitCard";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      id="partners"
      ref={sectionRef}
      className="relative py-16 lg:py-24 bg-white dark:bg-gray-950 overflow-hidden"
      aria-labelledby="partners-heading"
    >
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/30 to-transparent dark:via-blue-950/20"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 lg:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-sm font-semibold rounded-full mb-6 border border-blue-200 dark:border-blue-800"
          >
            <Handshake className="w-4 h-4" aria-hidden="true" />
            <span>Trusted Partnerships</span>
          </motion.div>

          <h2
            id="partners-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Our Partners & Affiliations
          </h2>

          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Collaborating with industry leaders to deliver world-class
            accounting education and career opportunities.
          </p>
        </motion.header>

        {/* Partner Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8 mb-16"
          role="list"
          aria-label="Partner organizations"
        >
          {PARTNERS.map((partner, index) => (
            <div key={partner.id} role="listitem">
              <PartnerCard partner={partner} index={index} />
            </div>
          ))}
        </motion.div>

        {/* Trust Badge Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Trusted by over 10,000+ students and professionals
          </p>

          <div
            className="flex flex-wrap items-center justify-center gap-8 opacity-50 dark:opacity-30"
            role="list"
            aria-label="Trust indicators"
          >
            {TRUST_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2"
                role="listitem"
              >
                <badge.icon
                  className="w-5 h-5 text-gray-600 dark:text-gray-400"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-400">
                  {badge.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          role="list"
          aria-label="Partnership benefits"
        >
          {BENEFITS.map((benefit, index) => (
            <div key={benefit.title} role="listitem">
              <BenefitCard benefit={benefit} index={index} />
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 rounded-2xl p-8 sm:p-10 shadow-xl">
            <div className="text-left flex-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Interested in Partnership?
              </h3>

              <p className="text-blue-100">
                Join our network of industry leaders and help develop
                Nigeria&apos;s accounting professionals.
              </p>
            </div>

            <Link
              href="/partnership"
              className="bg-white hover:bg-gray-100 text-blue-600 font-semibold px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
              aria-label="Learn more about partnership opportunities"
            >
              Become a Partner
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
