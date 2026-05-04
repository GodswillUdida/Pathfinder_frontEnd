// app/auth/register/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import z from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

type RegisterForm = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Shared UI Components (kept exactly as you designed)
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

// function GoogleIcon() {
//   return (
//     <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
//       <path
//         fill="#4285F4"
//         d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
//       />
//       <path
//         fill="#34A853"
//         d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
//       />
//       <path
//         fill="#FBBC05"
//         d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
//       />
//       <path
//         fill="#EA4335"
//         d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
//       />
//     </svg>
//   );
// }

// function PasswordStrength({ password }: { password: string }) {
//   if (!password) return null;

//   const checks = [
//     { label: "8+ characters", pass: password.length >= 8 },
//     { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
//     { label: "Number", pass: /[0-9]/.test(password) },
//   ];

//   const score = checks.filter((c) => c.pass).length;
//   const colors = ["bg-red-400", "bg-amber-400", "bg-emerald-400"];
//   const labels = ["Weak", "Fair", "Strong"];

//   return (
//     <div className="mt-2 space-y-2">
//       <div className="flex gap-1">
//         {[0, 1, 2].map((i) => (
//           <div
//             key={i}
//             className={`h-1 flex-1 rounded-full transition-all duration-300 ${
//               i < score ? colors[score - 1] : "bg-slate-200 dark:bg-white/10"
//             }`}
//           />
//         ))}
//       </div>
//       <div className="flex gap-3 flex-wrap">
//         {checks.map((c) => (
//           <span
//             key={c.label}
//             className={`flex items-center gap-1 text-[11px] transition-colors ${
//               c.pass
//                 ? "text-emerald-600 dark:text-emerald-400"
//                 : "text-slate-400"
//             }`}
//           >
//             <CheckCircle2
//               className={`w-3 h-3 ${c.pass ? "opacity-100" : "opacity-30"}`}
//             />
//             {c.label}
//           </span>
//         ))}
//       </div>
//       <p
//         className={`text-[11px] font-medium ${
//           colors[score - 1]?.replace("bg-", "text-") ?? "text-slate-400"
//         }`}
//       >
//         {score > 0 ? labels[score - 1] : ""}
//       </p>
//     </div>
//   );
// }

const STRENGTH_LEVELS = [
  {
    bar: "bg-red-400",
    text: "text-red-500 dark:text-red-400",
    label: "Weak",
  },
  {
    bar: "bg-amber-400",
    text: "text-amber-500 dark:text-amber-400",
    label: "Fair",
  },
  {
    bar: "bg-emerald-400",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Strong",
  },
] as const;

const PASSWORD_CHECKS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
] as const;

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const results = PASSWORD_CHECKS.map((c) => ({
    ...c,
    pass: c.test(password),
  }));
  const score = results.filter((c) => c.pass).length; // 0-3
  const level = STRENGTH_LEVELS[score - 1]; // undefined when score === 0

  return (
    <div className="mt-2 space-y-2" aria-live="polite" aria-atomic="true">
      <div
        className="flex gap-1"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-label="Password strength"
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score
                ? level?.bar ?? "bg-slate-200 dark:bg-white/10"
                : "bg-slate-200 dark:bg-white/10"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        {results.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-[11px] transition-colors ${
              c.pass
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400"
            }`}
          >
            <CheckCircle2
              className={`w-3 h-3 ${c.pass ? "opacity-100" : "opacity-30"}`}
              aria-hidden="true"
            />
            {c.label}
          </span>
        ))}
      </div>

      {level && (
        <p className={`text-[11px] font-medium ${level.text}`}>{level.label}</p>
      )}
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
// Register Page
// ---------------------------------------------------------------------------
export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, signInWithGoogle, isLoading } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  const watchedPassword = watch("password", "");
  const busy = isLoading || isPending;
  const googleBusy = isGooglePending;

  const onSubmit = (data: RegisterForm) => {
    setServerError(null);

    startTransition(async () => {
      try {
        await registerUser(data.name, data.email, data.password);
        toast.success("Account created! Please check your email to verify.");
        router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Registration failed";
        const lower = msg.toLowerCase();

        if (lower.includes("already")) {
          setServerError(
            "An account with this email already exists. Try signing in instead."
          );
        } else if (lower.includes("email")) {
          setServerError("This email address is not valid or cannot be used.");
        } else {
          setServerError(msg);
        }
      }
    });
  };

  const handleGoogle = () => {
    startGoogleTransition(() => signInWithGoogle());
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT: Brand Panel (unchanged - beautiful as before) */}
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
            Join Accountant Pathfinder
          </motion.p>
          <motion.h1
            // variants={fadeUp}
            className="text-[2.5rem] xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5"
          >
            Start your journey
            <br />
            to becoming a<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              top accountant.
            </span>
          </motion.h1>
          <motion.p
            // variants={fadeUp}
            className="text-slate-400 text-[15px] leading-[1.7]"
          >
            Join thousands of students who have transformed their careers
            through expert-led accounting courses.
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

      {/* RIGHT: Form Panel */}
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
          <motion.div className="mb-7">
            <h2 className="text-[1.7rem] font-bold text-slate-900 dark:text-white tracking-tight">
              Create an account
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Already have one?{" "}
              <Link
                href="/auth/login"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Google Button */}
          {/* <motion.div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleBusy || busy}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.07] text-slate-700 dark:text-slate-200 text-[13.5px] font-semibold transition-all duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              {googleBusy ? (
                <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              Continue with Google
            </button>
          </motion.div> */}

          {/* Divider */}
          <motion.div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.07]" />
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              register with email
            </span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.07]" />
          </motion.div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {/* Name, Email, Password fields (unchanged) */}
            <motion.div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  className="pl-[38px] h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 transition-colors"
                  {...registerField("name")}
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </motion.div>

            <motion.div className="space-y-1.5">
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
                  {...registerField("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </motion.div>

            <motion.div className="space-y-1.5">
              <label className="text-[13px] font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="pl-[38px] pr-11 h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 transition-colors"
                  {...registerField("password")}
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
              <PasswordStrength password={watchedPassword} />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Server Error */}
            <AnimatePresence mode="wait">
              {serverError && (
                <motion.div
                  key={serverError}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.08] px-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-[30px] h-[30px] rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-red-700 dark:text-red-400 leading-none mb-1">
                        {serverError.toLowerCase().includes("already")
                          ? "Account already exists"
                          : "Registration failed"}
                      </p>
                      <p className="text-[12px] text-red-600/75 dark:text-red-400/65">
                        {serverError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.div className="pt-1">
              <button
                type="submit"
                disabled={busy || googleBusy}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.985] disabled:opacity-55 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 shadow-sm hover:shadow-indigo-500/25 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                {busy ? (
                  <>
                    <span className="w-[18px] h-[18px] rounded-full border-2 border-white/25 border-t-white animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Trust signals & Legal */}
          <motion.div className="mt-7 flex items-center justify-center gap-5">
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

          <motion.p className="mt-5 text-center text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
