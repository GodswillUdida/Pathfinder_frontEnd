// app/auth/login/page.tsx
"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
// import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  EyeOff,
  Eye,
  ArrowRight,
  AlertCircle,
  ShieldAlert,
  UserX,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Error classifier (unchanged – excellent UX)
// ---------------------------------------------------------------------------
type ErrorKind =
  | "credentials"
  | "notfound"
  | "unverified"
  | "locked"
  | "generic";

interface ClassifiedError {
  kind: ErrorKind;
  title: string;
  detail: string;
  action?: { label: string; href: string };
}

function classifyError(msg: string): ClassifiedError {
  const m = msg.toLowerCase();
  if (
    m.includes("invalid credentials") ||
    m.includes("wrong password") ||
    m.includes("incorrect")
  ) {
    return {
      kind: "credentials",
      title: "Wrong email or password",
      detail:
        "Double-check your credentials and try again. Passwords are case-sensitive.",
      action: { label: "Reset password", href: "/forgot-password" },
    };
  }
  if (
    m.includes("not found") ||
    m.includes("no account") ||
    m.includes("user not found")
  ) {
    return {
      kind: "notfound",
      title: "No account found",
      detail:
        "We couldn't find an account with that email. Check for typos or create a new account.",
      action: { label: "Create account", href: "/auth/register" },
    };
  }
  if (
    m.includes("verify") ||
    m.includes("not verified") ||
    m.includes("not confirmed")
  ) {
    return {
      kind: "unverified",
      title: "Email not verified",
      detail:
        "Please verify your email before signing in. Check your inbox for the verification link.",
      action: {
        label: "Resend verification",
        href: "/auth/resend-verification",
      },
    };
  }
  if (
    m.includes("locked") ||
    m.includes("too many") ||
    m.includes("rate limit")
  ) {
    return {
      kind: "locked",
      title: "Too many attempts",
      detail:
        "Your account is temporarily locked. Please wait a few minutes before trying again.",
    };
  }
  return {
    kind: "generic",
    title: "Something went wrong",
    detail: msg || "An unexpected error occurred.",
  };
}

const errorIcons: Record<ErrorKind, React.ElementType> = {
  credentials: Lock,
  notfound: UserX,
  unverified: Mail,
  locked: ShieldAlert,
  generic: AlertCircle,
};

// ---------------------------------------------------------------------------
// Google Icon & Background (unchanged)
// ---------------------------------------------------------------------------
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
// Animation variants
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
// Inner Login Component
// ---------------------------------------------------------------------------
function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signInWithGoogle, isLoading } = useAuth();

  const [isPending, startTransition] = useTransition();
  const [isGooglePending, startGoogleTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<ClassifiedError | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const busy = isLoading || isPending;

  // Surface redirect reasons
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason === "expired")
      toast.info("Your session expired — please sign in again.");
    if (reason === "unauthorized")
      toast.error("You need to be signed in to access that page.");
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginForm) => {
    setError(null);
    startTransition(async () => {
      try {
        const user = await login(data.email, data.password);
        if (!user?.id) throw new Error("Unable to load user");

        toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);

        const redirect =
          searchParams.get("redirect") ??
          (["superadmin", "admin"].includes(user.role)
            ? "/admin/programs"
            : "/dashboard");

        router.push(redirect);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Invalid credentials";
        const classified = classifyError(msg);
        setError(classified);
        setAttemptCount((n) => n + 1);
        if (classified.kind === "credentials") {
          setTimeout(() => setFocus("password"), 50);
        }
      }
    });
  };

  const handleGoogle = () => {
    setError(null);
    startGoogleTransition(() => signInWithGoogle());
  };

  const ErrIcon = error ? errorIcons[error.kind] : AlertCircle;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT: Brand Panel */}
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
            Accountant Pathfinder
          </motion.p>
          <motion.h1
            // variants={fadeUp}
            className="text-[2.5rem] xl:text-[2.75rem] font-bold text-white leading-[1.1] mb-5"
          >
            Your path to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              financial mastery
            </span>{" "}
            starts here.
          </motion.h1>
          <motion.p
            // variants={fadeUp}
            className="text-slate-400 text-[15px] leading-[1.7]"
          >
            Access your courses, track your progress, and accelerate your
            accounting career — all in one place.
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
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Sign up free
              </Link>
            </p>
          </motion.div>

          {/* Google */}
          {/* <motion.div>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={isGooglePending || busy}
              className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.04] hover:bg-slate-50 dark:hover:bg-white/[0.07] text-slate-700 dark:text-slate-200 text-[13.5px] font-semibold transition-all duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
            >
              {isGooglePending ? (
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
              sign in with email
            </span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-white/[0.07]" />
          </motion.div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {/* Email */}
            <motion.div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-[13px] font-medium text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="pl-[38px] h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 transition-colors"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-[13px] font-medium text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  tabIndex={-1}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-slate-400 pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-[38px] pr-11 h-11 text-sm bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.09] rounded-xl focus-visible:ring-2 focus-visible:ring-indigo-500/30 focus-visible:border-indigo-500 transition-colors"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </motion.div>

            {/* Error Display */}
            {/* <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={error.kind + attemptCount}
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.08] px-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-[30px] h-[30px] rounded-lg bg-red-100 dark:bg-red-500/15 flex items-center justify-center shrink-0">
                      <ErrIcon className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-red-700 dark:text-red-400 leading-none mb-1">
                        {error.title}
                      </p>
                      <p className="text-[12px] text-red-600/75 dark:text-red-400/65 leading-snug">
                        {error.detail}
                      </p>
                      {error.action && (
                        <Link
                          href={error.action.href}
                          className="inline-block mt-1.5 text-[12px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                        >
                          {error.action.label} →
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence> */}

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/[0.08] px-4 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <ErrIcon className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-700 dark:text-red-400">
                        {error.title}
                      </p>
                      <p className="text-sm text-red-600/75 dark:text-red-400/65">
                        {error.detail}
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
                disabled={busy || isGooglePending}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all active:scale-[0.985] disabled:opacity-55"
              >
                {busy ? (
                  <>Signing in…</>
                ) : (
                  <>
                    Sign in <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Trust Signals & Legal */}
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
            By signing in, you agree to our{" "}
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

// ---------------------------------------------------------------------------
// Export with Suspense
// ---------------------------------------------------------------------------
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d1117]">
          <span className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
