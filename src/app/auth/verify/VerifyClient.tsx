// app/auth/verify/page.tsx
"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Shared UI (exact match to login/register/forgot-password)
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
// 6-digit OTP (auto-submit on last digit)
// ---------------------------------------------------------------------------
function OTPInput({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  onComplete: (code: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleInput = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;
    const next = [...value];
    next[index] = raw.slice(-1);
    onChange(next);
    if (raw && index < 5) refs.current[index + 1]?.focus();
    if (next.join("").length === 6) onComplete(next.join(""));
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...value];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    onChange(next);
    if (next.join("").length === 6) onComplete(next.join(""));
  };

  return (
    <div
      className="flex items-center justify-center gap-3"
      role="group"
      aria-label="6-digit code"
    >
      {value.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleInput(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-12 h-14 text-center text-4xl font-semibold bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.09] rounded-3xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-900 dark:text-white disabled:opacity-50"
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------
export function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const { verifyEmail, resendVerificationEmail, isLoading } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const busy = isLoading || isPending;

  // Countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(
      () => setResendTimer((t) => Math.max(0, t - 1)),
      1000
    );
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleVerify = (code: string) => {
    if (code.length !== 6 || !email) return;
    setServerError(null);

    startTransition(async () => {
      try {
        await verifyEmail(email, code);
        setIsSuccess(true);
        toast.success("Email verified successfully!");
        setTimeout(() => router.push("/auth/login"), 1400);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Invalid or expired code";
        setServerError(msg);
        setOtp(Array(6).fill(""));
      }
    });
  };

  const handleResend = () => {
    if (!email || resendTimer > 0 || busy) return;
    setServerError(null);

    startTransition(async () => {
      try {
        await resendVerificationEmail(email);
        setResendTimer(60);
        toast.success("New 6-digit code sent!");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to resend code";
        setServerError(msg);
      }
    });
  };

  // Guard — no email = redirect
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d1117]">
        <div className="text-center">
          <p className="text-red-500">Missing email address.</p>
          <button
            onClick={() => router.push("/auth/register")}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Go back to register →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT PANEL — identical to all other auth pages */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[54%] relative flex-col justify-between overflow-hidden bg-[#07091a] p-14 xl:p-16">
        <BackgroundOrbs />

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
            One last step
          </motion.p>
          <motion.h1
            // variants={fadeUp}
            className="text-[2.5rem] xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5"
          >
            Verify your email
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              to continue
            </span>
          </motion.h1>
          <motion.p
            // variants={fadeUp}
            className="text-slate-400 text-[15px] leading-[1.7]"
          >
            We sent a 6-digit code to your inbox. Enter it below to activate
            your account.
          </motion.p>

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

        {/* Testimonial */}
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
            attempt."
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

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen px-5 py-12 sm:px-10 bg-white dark:bg-[#0d1117]">
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
          <motion.div
            //  variants={fadeUp}
            className="mb-7 text-center"
          >
            <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-5">
              <Mail className="w-7 h-7 text-indigo-600" />
            </div>
            <h2 className="text-[1.7rem] font-bold tracking-tight">
              Enter verification code
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {email}
              </span>
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <motion.div
                // variants={fadeUp}
                >
                  <OTPInput
                    value={otp}
                    onChange={setOtp}
                    onComplete={handleVerify}
                    disabled={busy}
                  />
                </motion.div>

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.08] px-4 py-3.5"
                    >
                      <div className="flex gap-3">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        <div className="text-[13px]">
                          <p className="font-semibold text-red-700 dark:text-red-400">
                            Invalid code
                          </p>
                          <p className="text-red-600/75 dark:text-red-400/65">
                            {serverError}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                // variants={fadeUp}
                >
                  <button
                    onClick={() => {
                      const code = otp.join("");
                      if (code.length === 6) handleVerify(code);
                    }}
                    disabled={otp.join("").length !== 6 || busy}
                    className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all active:scale-[0.985] disabled:opacity-55"
                  >
                    {busy ? (
                      <>
                        {" "}
                        <span className="w-[18px] h-[18px] rounded-full border-2 border-white/25 border-t-white animate-spin" />{" "}
                        Verifying…{" "}
                      </>
                    ) : (
                      <>
                        {" "}
                        Verify code <ArrowRight className="w-4 h-4" />{" "}
                      </>
                    )}
                  </button>
                </motion.div>

                <motion.div
                  // variants={fadeUp}
                  className="text-center"
                >
                  <button
                    onClick={handleResend}
                    disabled={resendTimer > 0 || busy}
                    className="text-sm text-slate-500 hover:text-indigo-600 disabled:text-slate-400 transition-colors"
                  >
                    {resendTimer > 0 ? (
                      <>
                        {" "}
                        <Clock className="w-3.5 h-3.5 inline" /> Resend in{" "}
                        {resendTimer}s{" "}
                      </>
                    ) : (
                      "Resend verification code"
                    )}
                  </button>
                </motion.div>

                <motion.div
                  // variants={fadeUp}
                  className="text-center"
                >
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to sign in
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-8 text-center"
              >
                <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-700">
                  Email verified!
                </h3>
                <p className="text-emerald-600/80 mt-2">
                  Welcome to Accountant Pathfinder.
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="mt-8 w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  Login to Access your account
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
