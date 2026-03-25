// app/auth/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, EyeOff, Eye, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import z from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Animation variants — single stagger container, children inherit
// ---------------------------------------------------------------------------

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------------------------------------------------------------------------
// Google SVG icon (no external image dependency)
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LoginPage() {
  const router = useRouter();
  const { login, signInWithGoogle, isLoading } = useAuthStore();
  // const { login, isLoading } = useAuthStore();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isGooglePending, startGoogleTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const busy = isLoading || isPending;
  const googleBusy = isGooglePending;

  const onSubmit = (data: LoginForm) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const user = await login(data.email, data.password);
        if (!user?.id) throw new Error("Unable to load user");
        toast.success("Welcome back");
        router.push(
          ["superadmin", "admin"].includes(user.role)
            ? "/admin/programs"
            : "/dashboard"
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid credentials";
        setServerError(msg);
      }
    });
  };

  const handleGoogle = () => {
    startGoogleTransition(() => {
      // signInWithGoogle() does window.location.href = `${API_BASE}/auth/google`
      // Backend completes OAuth and redirects to FRONTEND_URL/auth/callback
      // with tokens in query params or sets a cookie.
      signInWithGoogle();
    });
  };

  return (
    // Full viewport — no Navbar/Footer wrapping a login page
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ── LEFT: brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between overflow-hidden bg-[#080d1a] p-14">
        {/* Background geometry */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-48 -right-48 w-[640px] h-[640px] rounded-full border border-blue-500/[0.08]" />
          <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full border border-blue-500/[0.06]" />
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#4f8ef7 1px,transparent 1px),linear-gradient(90deg,#4f8ef7 1px,transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-blue-700/[0.08] to-transparent" />
          <motion.div
            className="absolute top-1/3 right-1/3 w-72 h-72 rounded-full bg-blue-600/[0.06] blur-3xl"
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

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

        {/* Hero copy */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={container}
          className="relative z-10 max-w-sm"
        >
          <motion.p
            // variants={item}
            className="text-[11px] font-bold tracking-[0.22em] uppercase text-blue-400 mb-5"
          >
            Accountant Pathfinder
          </motion.p>
          <motion.h1
            // variants={item}
            className="text-[2.6rem] xl:text-5xl font-bold text-white leading-[1.12] mb-5"
          >
            Your path to
            <br />
            <span className="text-blue-400">financial mastery</span>
            <br />
            starts here.
          </motion.h1>
          <motion.p
            // variants={item}
            className="text-slate-400 text-[15px] leading-relaxed"
          >
            Access your courses, track progress, and accelerate your accounting
            career — all in one place.
          </motion.p>

          {/* Stats */}
          <motion.div
            // variants={item}
            className="flex gap-8 mt-10"
          >
            {[
              { value: "2,400+", label: "Students enrolled" },
              { value: "98%", label: "Pass rate" },
              { value: "40+", label: "Courses" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-[1.6rem] font-bold text-white leading-none">
                  {s.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="relative z-10 border-t border-white/[0.07] pt-6"
        >
          <p className="text-slate-500 text-[13px] italic leading-relaxed">
            "The best investment you can make is in your own education."
          </p>
          <p className="text-slate-600 text-xs mt-1.5">— Warren Buffett</p>
        </motion.div>
      </div>

      {/* ── RIGHT: form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-12 sm:px-10 bg-slate-50 dark:bg-[#0d1117]">
        {/* Mobile logo */}
        <div className="lg:hidden mb-10 self-start">
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
            //  variants={item}
            className="mb-8"
          >
            <h2 className="text-[1.65rem] font-bold text-slate-900 dark:text-white tracking-tight">
              Log in
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Enter your credentials to access your account
            </p>
          </motion.div>

          <motion.div
            // variants={item}
            className="mb-7"
          >
            {/* <h2 className="text-[1.65rem] font-bold text-slate-900 dark:text-white tracking-tight">
              Log in
            </h2> */}
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </motion.div>

          <motion.div
          //  variants={item}
          >
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleBusy || busy}
              className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 dark:border-white/[0.09] bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.07] text-slate-700 dark:text-slate-200 text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {googleBusy ? (
                <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </motion.div>

          <motion.div
            // variants={item}
            className="flex items-center gap-3 my-5"
          >
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
            <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
              or register with email
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.08]" />
          </motion.div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {/* Email */}
            <motion.div
              // variants={item}
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
                  className="pl-[38px] h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-colors"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              // variants={item}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  tabIndex={-1}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-[38px] pr-11 h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-colors"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Server error */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 px-3.5 py-2.5 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl"
              >
                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <p className="text-red-600 dark:text-red-400 text-sm leading-snug">
                  {serverError}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.div
              // variants={item}
              className="pt-1"
            >
              <button
                type="submit"
                disabled={busy}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.985] disabled:opacity-55 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 shadow-sm hover:shadow-blue-500/25 hover:shadow-lg"
              >
                {busy ? (
                  <>
                    <span className="w-[18px] h-[18px] rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Legal */}
          <motion.p
            // variants={item}
            className="mt-8 text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed"
          >
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
