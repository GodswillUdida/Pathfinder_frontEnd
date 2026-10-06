"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */
const linkGroups = [
  {
    title: "Programs",
    links: [
      { name: "ICAN Lectures", href: "/courses" },
      { name: "Online Courses", href: "/courses" },
      { name: "Diploma Programs", href: "/courses" },
      { name: "All Courses", href: "/courses" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", href: "/about" },
      { name: "Our Instructors", href: "/instructors" },
      { name: "Success Stories", href: "/testimonials" },
      { name: "Career Support", href: "/careers" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Blog", href: "/blog" },
      { name: "FAQs", href: "/faq" },
      { name: "Study Materials", href: "/resources" },
      { name: "Student Portal", href: "/portal" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund" },
      { name: "Contact Us", href: "/contact" },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "https://facebook.com/accountantpathfinder" },
  { name: "Twitter", icon: Twitter, href: "https://x.com/accountantpath" },
  { name: "Instagram", icon: Instagram, href: "https://instagram.com/accountantpathfinder" },
  { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/accountantpathfinder" },
  { name: "YouTube", icon: Youtube, href: "https://youtube.com/@accountantpathfinder" },
];

/* -------------------------------------------------------------------------- */
/*  Spotlight card: cursor-lit surface + glowing edge                         */
/* -------------------------------------------------------------------------- */
function SpotlightCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "nav" | "section";
}) {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  // Amber glow + indigo edge for brand alignment
  const glow = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, color-mix(in oklch, var(--brand-amber) 12%, transparent), transparent 70%)`;
  const edge = useMotionTemplate`radial-gradient(260px circle at ${x}px ${y}px, color-mix(in oklch, var(--brand-indigo) 70%, transparent), transparent 70%)`;

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

  const MotionTag = motion[Tag];

  return (
    <MotionTag onMouseMove={onMove} className={`pf-card ${className}`}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: glow }}
      />
      <motion.div aria-hidden className="pf-ring" style={{ background: edge }} />
      <div className="relative">{children}</div>
    </MotionTag>
  );
}

/* -------------------------------------------------------------------------- */
/*  Newsletter                                                                */
/* -------------------------------------------------------------------------- */
type Status = "idle" | "loading" | "success" | "error";

function Newsletter({ onSubscribe }: { onSubscribe?: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }
    setStatus("loading");
    try {
      await onSubscribe?.(email);
      setStatus("success");
      setMessage("You're on the list. Watch your inbox.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <label htmlFor="pf-email" className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-3 @xl:flex-row">
        <input
          id="pf-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          aria-invalid={status === "error"}
          aria-describedby="pf-email-msg"
          className="pf-input"
        />
        <motion.button
          type="submit"
          disabled={status === "loading"}
          whileTap={{ scale: 0.96 }}
          className="pf-cta shrink-0 justify-center disabled:opacity-70"
        >
          {status === "success" ? (
            <>
              Subscribed <Check className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              {status === "loading" ? "Joining…" : "Subscribe"}
              <ArrowRight className="pf-arrow h-4 w-4" aria-hidden />
            </>
          )}
        </motion.button>
      </div>
      <p
        id="pf-email-msg"
        role="status"
        aria-live="polite"
        className="mt-3 min-h-5 text-sm"
        style={{
          color:
            status === "error"
              ? "var(--pf-danger)"
              : status === "success"
                ? "var(--pf-accent)"
                : "var(--pf-muted)",
        }}
      >
        {message || "Course updates and study insights. No spam, unsubscribe any time."}
      </p>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Footer                                                                    */
/* -------------------------------------------------------------------------- */
type FooterProps = {
  onSubscribe?: (email: string) => Promise<void>;
};

const Footer = ({ onSubscribe }: FooterProps) => {
  const reduce = useReducedMotion();

  const reveal = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-60px" },
          transition: { type: "spring" as const, stiffness: 120, damping: 20, delay },
        };

  return (
    <footer
      className="pf-root dark"
      style={{ contain: "layout paint style" }}
    >
      {/* Atmosphere: amber hairline, navy + indigo blooms, dot matrix */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--brand-amber), transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 rounded-full blur-3xl"
        style={{
          top: "-8rem",
          left: "-6rem",
          width: "clamp(16rem, 40vw, 34rem)",
          aspectRatio: "1",
          background: "color-mix(in oklch, var(--primary) 22%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -z-10 rounded-full blur-3xl"
        style={{
          right: "-8rem",
          bottom: "10rem",
          width: "clamp(14rem, 34vw, 28rem)",
          aspectRatio: "1",
          background: "color-mix(in oklch, var(--brand-indigo) 14%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 7%, transparent) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(180deg, black, transparent 70%)",
          WebkitMaskImage: "linear-gradient(180deg, black, transparent 70%)",
        }}
      />

      <div
        className="@container mx-auto w-full"
        style={{
          maxWidth: "88rem",
          paddingInline: "clamp(1rem, 4vw, 3rem)",
          paddingTop: "clamp(3rem, 7vw, 6rem)",
        }}
      >
        <div
          className="grid grid-cols-1 @3xl:grid-cols-12"
          style={{ gap: "clamp(0.75rem, 1.5vw, 1.25rem)" }}
        >
      
          {/* ── Brand (tall, asymmetric) ─────────────────────────────── */}
          <motion.div {...reveal(0.05)} className="@3xl:col-span-5 @3xl:row-span-2">
            <SpotlightCard className="h-full">
              <div className="flex h-full flex-col justify-between gap-10">
                <div>
                  <Link
                    href="/"
                    aria-label="Accountant Pathfinder home"
                    className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pf-bg)] rounded-md"
                  >
                    <Image
                      src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
                      alt="Accountant Pathfinder"
                      width={180}
                      height={60}
                      className="h-14 w-auto brightness-0 invert"
                    />
                  </Link>
                  <p
                    className="pf-display mt-8 max-w-xs text-2xl font-bold leading-tight"
                    style={{ color: "var(--pf-ink)" }}
                  >
                    Learn from practitioners.
                    <br />
                    <span style={{ color: "var(--pf-muted)" }}>Qualify with confidence.</span>
                  </p>
                  <Link href="/portal" className="pf-cta mt-7">
                    Open Student Portal
                    <ArrowUpRight className="pf-arrow h-4 w-4" aria-hidden />
                  </Link>
                </div>

                <div>
                  <p className="pf-eyebrow mb-4">
                    <i>●</i> Follow along
                  </p>
                  <ul className="flex flex-wrap gap-2.5">
                    {socialLinks.map(({ name, icon: Icon, href }) => (
                      <li key={name}>
                        <motion.a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={name}
                          className="pf-social"
                          whileHover={reduce ? undefined : { y: -4, scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          transition={{ type: "spring", stiffness: 420, damping: 18 }}
                        >
                          <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden />
                        </motion.a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── Navigation ───────────────────────────────────────────── */}
          <motion.div {...reveal(0.1)} className="@3xl:col-span-7">
            <SpotlightCard as="nav" className="h-full">
              <div className="grid grid-cols-2 gap-x-6 gap-y-9 @xl:grid-cols-4">
                {linkGroups.map((group, i) => {
                  const id = `pf-nav-${group.title.toLowerCase()}`;
                  return (
                    <div key={group.title}>
                      <h3 id={id} className="pf-eyebrow mb-4">
                        <i>{String(i + 1).padStart(2, "0")}</i>
                        {group.title}
                      </h3>
                      <ul aria-labelledby={id} className="flex flex-col">
                        {group.links.map((link) => (
                          <li key={link.name}>
                            <Link href={link.href} className="pf-link">
                              {link.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </SpotlightCard>
          </motion.div>

          {/* ── Contact ──────────────────────────────────────────────── */}
          <motion.div {...reveal(0.15)} className="@3xl:col-span-7">
            <SpotlightCard className="h-full">
              <p className="pf-eyebrow mb-6">
                <i>●</i> Visit or reach us
              </p>
              <div className="grid gap-6 @xl:grid-cols-2">
                <div className="pf-contact flex items-start gap-4 @xl:col-span-2">
                  <span className="pf-tile">
                    <MapPin className="h-5 w-5" aria-hidden />
                  </span>
                  <address className="pt-1.5 text-[0.95rem] not-italic leading-relaxed">
                    45, Abeokuta Street off Yaya Abatan Road,
                    <br />
                    Ogba, Ikeja, Lagos State.
                  </address>
                </div>

                <div className="pf-contact flex items-start gap-4">
                  <span className="pf-tile">
                    <Phone className="h-5 w-5" aria-hidden />
                  </span>
                  <div className="flex flex-col pt-1.5 text-[0.95rem]">
                    <a
                      href="tel:+2347014580375"
                      className="font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pf-bg)] rounded-sm"
                      style={{ color: "var(--pf-ink)" }}
                    >
                      +234 701 458 0375
                    </a>
                    <a
                      href="tel:+2349032749238"
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pf-bg)] rounded-sm"
                    >
                      +234 903 274 9238
                    </a>
                  </div>
                </div>

                <div className="pf-contact flex min-w-0 items-start gap-4">
                  <span className="pf-tile">
                    <Mail className="h-5 w-5" aria-hidden />
                  </span>
                  <a
                    href="mailto:pathfinderofficialteam@gmail.com"
                    className="min-w-0 break-words pt-2 text-[0.95rem] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pf-bg)] rounded-sm"
                    style={{ color: "var(--pf-ink)" }}
                  >
                    pathfinderofficialteam@gmail.com
                  </a>
                </div>
              </div>
            </SpotlightCard>
          </motion.div>

    {/* ── CTA band ─────────────────────────────────────────────── */}
          <motion.div {...reveal()} className="@3xl:col-span-12">
            <SpotlightCard>
              <div className="grid items-center gap-8 @3xl:grid-cols-[1.15fr_1fr] @3xl:gap-14">
                <div>
                  <p className="pf-eyebrow mb-4">
                    <i>●</i> Newsletter
                  </p>
                  <h2
                    className="pf-display font-extrabold"
                    style={{
                      color: "var(--pf-ink)",
                      fontSize: "clamp(1.9rem, 4.6vw, 3.6rem)",
                      lineHeight: 1.02,
                    }}
                  >
                    Chart your path to{" "}
                    <span style={{ color: "var(--pf-accent)" }}>chartered.</span>
                  </h2>
                  <p className="mt-4 max-w-lg text-[0.98rem] leading-relaxed">
                    Nigeria&rsquo;s premier accounting education platform. Master ICAN,
                    ACCA, and top-tier financial skills with expert-led programs.
                  </p>
                </div>
                <Newsletter onSubscribe={onSubscribe} />
              </div>
            </SpotlightCard>
          </motion.div>


        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────── */}
        <div className="pf-ledger mt-[clamp(2rem,5vw,4rem)]" aria-hidden />
        <div className="flex flex-col items-center justify-between gap-4 py-6 text-sm @xl:flex-row">
          <p>© {new Date().getFullYear()} Accountant Pathfinder. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span>
              Built by{" "}
              <span className="font-bold" style={{ color: "var(--pf-gold)" }}>
                Udis Technologies
              </span>
            </span>
            <span>
              Powered by{" "}
              <span className="font-bold" style={{ color: "var(--pf-accent)" }}>
                PCOMA
              </span>
            </span>
            <motion.button
              type="button"
              aria-label="Back to top"
              onClick={() =>
                window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })
              }
              className="pf-social !h-10 !w-10"
              whileHover={reduce ? undefined : { y: -4 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 420, damping: 18 }}
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Oversized wordmark ───────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none select-none overflow-hidden text-center">
        <div className="pf-display pf-wordmark" style={{ transform: "translateY(12%)" }}>
          PATHFINDER
        </div>
      </div>
    </footer>
  );
};

export default Footer;