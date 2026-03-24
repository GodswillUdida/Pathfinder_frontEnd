// app/auth/forgot-password/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

// ---------------------------------------------------------------------------
// Background decoration (left panel) — identical to login & register
// ---------------------------------------------------------------------------

function BackgroundOrbs() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage:
            "linear-gradient(#4f8ef7 1px,transparent 1px),linear-gradient(90deg,#4f8ef7 1px,transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />
      <div className="absolute -top-56 -right-56 w-[700px] h-[700px] rounded-full border border-white/[0.05]" />
      <div className="absolute -top-28 -right-28 w-[440px] h-[440px] rounded-full border border-white/[0.04]" />
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-indigo-900/20 to-transparent" />
      <motion.div
        className="absolute top-[28%] right-[26%] w-80 h-80 rounded-full bg-indigo-600/[0.07] blur-3xl"
        animate={{ scale: [1, 1.22, 1], opacity: [0.4, 0.75, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[18%] left-[8%] w-52 h-52 rounded-full bg-blue-400/[0.05] blur-2xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Google icon not needed here, but kept for consistency if we ever reuse
// (not rendered)

// ---------------------------------------------------------------------------
// Animation variants — exact match to login & register
// ---------------------------------------------------------------------------

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.065, delayChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { sendPasswordResetEmail, isLoading } = useAuthStore(); // Assumes this method exists in your authStore
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotSchema) });

  const busy = isLoading || isPending;

  const onSubmit = (data: ForgotForm) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await sendPasswordResetEmail(data.email);
        setIsSuccess(true);
        toast.success("Reset link sent! Check your email.");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to send reset link";
        setServerError(msg);
      }
    });
  };

  // Allow user to try again after error
  const handleTryAgain = () => {
    setIsSuccess(false);
    setServerError(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT: brand panel — 100% identical to login & register */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[54%] relative flex-col justify-between overflow-hidden bg-[#07091a] p-14 xl:p-16">
        <BackgroundOrbs />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Image
              src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
              alt="Accountant Pathfinder"
              width={176}
              height={44}
              className="h-10 w-auto brightness-0 invert opacity-90"
              priority
            />
          </Link>
        </div>

        {/* Hero */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="relative z-10 max-w-[360px]"
        >
          <motion.p
            // variants={fadeUp}
            className="text-[10.5px] font-bold tracking-[0.25em] uppercase text-indigo-400 mb-5"
          >
            Accountant Pathfinder
          </motion.p>
          <motion.h1
            // variants={fadeUp}
            className="text-[2.5rem] xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5"
          >
            Forgot your password?
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              No worries.
            </span>
          </motion.h1>
          <motion.p
            // variants={fadeUp}
            className="text-slate-400 text-[15px] leading-[1.7]"
          >
            We’ll send a secure reset link to your email. You’ll be back on
            track in seconds.
          </motion.p>

          {/* Stats — identical */}
          <motion.div
            // variants={fadeUp}
            className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/[0.07]"
          >
            {[
              { value: "2,400+", label: "Students enrolled" },
              { value: "98%", label: "Pass rate" },
              { value: "40+", label: "Courses" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Testimonial — identical */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          className="relative z-10"
        >
          <div className="flex gap-0.5 mb-3" aria-label="5 out of 5 stars">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-3.5 h-3.5 text-amber-400 fill-current"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-400 text-[13px] italic leading-relaxed">
            "Accountant Pathfinder helped me pass my ICAN exams on the first
            attempt. The structured approach is unmatched."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              AO
            </div>
            <div>
              <p className="text-[12px] font-semibold text-white/80">
                Adaeze Okafor
              </p>
              <p className="text-[10px] text-slate-500">ICAN Graduate, Lagos</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT: form panel — exact styling match to login & register */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-5 py-12 sm:px-10 bg-white dark:bg-[#0d1117]">
        {/* Mobile logo */}
        <div className="lg:hidden w-full max-w-[400px] mb-10">
          <Link href="/">
            <Image
              src="https://res.cloudinary.com/dirrncimm/image/upload/v1752703435/assets/AP_Logo_4_SVG_p7cqwy.svg"
              alt="Accountant Pathfinder"
              width={156}
              height={40}
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="w-full max-w-[400px]"
        >
          {/* Heading */}
          <motion.div
            //   variants={fadeUp}
            className="mb-7"
          >
            <h2 className="text-[1.7rem] font-bold text-slate-900 dark:text-white tracking-tight">
              Reset password
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Enter your email and we’ll send you a reset link.
            </p>
          </motion.div>

          {/* Form / Success State */}
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-4"
              >
                {/* Email */}
                <motion.div
                  // variants={fadeUp}
                  className="space-y-1.5"
                >
                  <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="pl-[38px] h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 transition-colors"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs">
                      {errors.email.message}
                    </p>
                  )}
                </motion.div>

                {/* Server error — styled exactly like login */}
                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.08] px-4 py-3.5"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-[30px] h-[30px] rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-semibold text-red-700 dark:text-red-400">
                            Something went wrong
                          </p>
                          <p className="text-[12px] text-red-600/75 dark:text-red-400/65">
                            {serverError}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.div
                  // variants={fadeUp}
                  className="pt-1"
                >
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.985] disabled:opacity-55 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 shadow-sm hover:shadow-indigo-500/25 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                  >
                    {busy ? (
                      <>
                        <span className="w-[18px] h-[18px] rounded-full border-2 border-white/25 border-t-white animate-spin" />
                        Sending reset link…
                      </>
                    ) : (
                      <>
                        Send reset link
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>

                {/* Back to login */}
                <motion.div
                  // variants={fadeUp}
                  className="text-center"
                >
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </Link>
                </motion.div>
              </motion.form>
            ) : (
              /* Success State */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-8 text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                  Check your email
                </h3>
                <p className="text-emerald-600/80 dark:text-emerald-400/70 text-[15px] leading-relaxed">
                  We’ve sent a password reset link to your inbox.
                  <br />
                  It should arrive within a minute.
                </p>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all"
                  >
                    Back to sign in
                  </button>
                  <button
                    onClick={handleTryAgain}
                    className="w-full h-11 border border-slate-200 dark:border-white/[0.09] text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all"
                  >
                    Send link again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust signals & Legal — same as login/register */}
          {!isSuccess && (
            <>
              <motion.div
                // variants={fadeUp}
                className="mt-7 flex items-center justify-center gap-5"
              >
                {[
                  { icon: "🔒", label: "256-bit SSL" },
                  { icon: "🛡️", label: "Data protected" },
                  { icon: "✓", label: "No spam, ever" },
                ].map((b) => (
                  <div key={b.label} className="flex items-center gap-1.5">
                    <span className="text-[11px]">{b.icon}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                      {b.label}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.p
                // variants={fadeUp}
                className="mt-6 text-center text-[11px] text-slate-400 dark:text-slate-500"
              >
                By requesting a reset, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Privacy Policy
                </Link>
              </motion.p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
