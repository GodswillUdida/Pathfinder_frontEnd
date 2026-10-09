"use client";

import {
  useForm,
  useWatch,
  SubmitHandler,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateApplicant } from "@/hooks/useApplicants";
import {
  ApplicantFormData,
  applicantFormSchema,
} from "@/lib/validations/applicant";
import {
  Loader2,
  Check,
  ChevronRight,
  User,
  BookOpen,
  FileText,
  Briefcase,
  Heart,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  PartyPopper,
  ArrowRight,
  Copy,
  Home,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import confetti from "canvas-confetti";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAPERS = ["Diploma", "ICAN", "ATS", "ATSWA", "CITN", "SAGE"] as const;

const LECTURE_CENTERS = [
  "Lagos Center",
  "Abuja Center",
  "Port Harcourt Center",
  "Ibadan Center",
  "Online / Virtual",
  "Other",
];

const ACADEMIC_LEVELS = [
  "100 Level",
  "200 Level",
  "300 Level",
  "400 Level",
  "Diploma",
  "Professional Level",
  "Other",
];

const REFERRAL_SOURCES = [
  "Friend / Family",
  "Social Media (Instagram, Facebook, TikTok)",
  "Google Search",
  "Advertisement",
  "University / School",
  "Previous Student",
  "Other",
];

const SECTIONS = [
  {
    id: "personal",
    index: 1,
    title: "Personal Information",
    description: "Basic details so we can contact you",
    icon: User,
    required: true,
  },
  {
    id: "academic",
    index: 2,
    title: "Academic Background",
    description: "Your current educational status",
    icon: BookOpen,
    required: true,
  },
  {
    id: "papers",
    index: 3,
    title: "Select Papers",
    description: "Choose the papers you want to register for",
    icon: FileText,
    required: true,
  },
  {
    id: "details",
    index: 4,
    title: "Additional Details",
    description: "Optional — helps us support you better",
    icon: Heart,
    required: false,
  },
  {
    id: "employment",
    index: 5,
    title: "Employment",
    description: "Optional — only if you are currently working",
    icon: Briefcase,
    required: false,
  },
  {
    id: "sponsor",
    index: 6,
    title: "Sponsor Information",
    description: "Optional — if someone is sponsoring you",
    icon: User,
    required: false,
  },
] as const;

// ─── Primitives ───────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-[13.5px] text-slate-900",
        "placeholder:text-slate-400 outline-none transition-all duration-200",
        "hover:border-slate-300",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
          : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20",
        className
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  children: ReactNode;
}

function Select({ className, error, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-[13.5px] text-slate-900",
          "outline-none transition-all duration-200 cursor-pointer",
          "hover:border-slate-300",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
            : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-[13.5px] text-slate-900",
        "placeholder:text-slate-400 outline-none resize-none transition-all duration-200",
        "hover:border-slate-300",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
          : "border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20",
        className
      )}
      {...props}
    />
  );
}

function Label({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[13px] font-medium text-slate-700 mb-1.5"
    >
      {children}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-[12px] text-red-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

function Field({
  htmlFor,
  label,
  required,
  error,
  hint,
  children,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[12px] text-slate-400">{hint}</p>
      )}
      <FieldError message={error} />
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  id,
  index,
  title,
  description,
  icon: Icon,
  required,
  children,
}: {
  id: string;
  index: number;
  title: string;
  description: string;
  icon: React.ElementType;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-36 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[11px] font-bold text-indigo-400 tracking-widest">
                {String(index).padStart(2, "0")}
              </span>
              <h2 className="text-[17px] font-semibold text-slate-900 tracking-tight">
                {title}
              </h2>
            </div>
            <p className="mt-1 text-[13px] text-slate-500">{description}</p>
          </div>
        </div>

        {!required && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            Optional
          </span>
        )}
      </div>

      {children}
    </section>
  );
}

// ─── Paper Chip ───────────────────────────────────────────────────────────────

function PaperChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex items-center justify-center rounded-xl border-2 py-3.5 px-3",
        "text-[13px] font-semibold transition-all duration-200 select-none",
        "hover:scale-[1.02] active:scale-[0.98]",
        selected
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50/40"
      )}
    >
      {selected && (
        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
      {label}
    </button>
  );
}

// ─── Side Nav ─────────────────────────────────────────────────────────────────

function SideNav({
  activeId,
  passedIds,
}: {
  activeId: string;
  passedIds: Set<string>;
}) {
  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav className="hidden lg:flex flex-col gap-1 sticky top-36 w-48 shrink-0 self-start">
      {SECTIONS.map(({ id, index, title, required }) => {
        const isPassed = passedIds.has(id);
        const isActive = activeId === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium text-left transition-all duration-200",
              isActive
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold",
                isActive
                  ? "bg-indigo-600 text-white"
                  : isPassed
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {isPassed && !isActive ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                index
              )}
            </span>
            <span className="truncate">{title.split(" ")[0]}</span>
            {!required && (
              <span className="ml-auto text-[10px] text-slate-400">Opt</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  applicationId,
  onReset,
}: {
  applicationId: string | null;
  onReset: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!applicationId) return;
    await navigator.clipboard.writeText(applicationId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xl text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
          Application submitted
        </h2>
        <p className="mt-3 text-[15px] text-slate-500 leading-relaxed">
          Thank you. We’ve received your registration and our team will review
          it shortly.
        </p>

        {applicationId && (
          <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Application ID
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-semibold text-slate-800 tracking-tight">
                {applicationId.slice(0, 8)}…{applicationId.slice(-4)}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-medium text-indigo-600 hover:bg-indigo-50 transition"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 rounded-2xl bg-indigo-50/70 border border-indigo-100 p-5 text-left">
          <p className="text-[13px] font-semibold text-indigo-900 flex items-center gap-2 mb-3">
            <PartyPopper className="h-4 w-4" />
            What happens next?
          </p>
          <ul className="space-y-2 text-[13px] text-indigo-800/80">
            <li className="flex gap-2">
              <span className="text-indigo-400">•</span>
              You’ll receive a confirmation email shortly
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400">•</span>
              Our team will review your application
            </li>
            <li className="flex gap-2">
              <span className="text-indigo-400">•</span>
              We’ll contact you if anything else is needed
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-[13px] font-semibold text-white hover:bg-indigo-700 transition shadow-sm"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            Submit another
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanOptional(value?: string) {
  return value && value.trim() !== "" ? value.trim() : undefined;
}

function buildPayload(data: ApplicantFormData, papers: string[]) {
  const hasEmployment =
    cleanOptional(data.employment?.placeOfWork) ||
    cleanOptional(data.employment?.position);

  const hasSponsor =
    cleanOptional(data.sponsor?.name) ||
    cleanOptional(data.sponsor?.phone) ||
    cleanOptional(data.sponsor?.email) ||
    cleanOptional(data.sponsor?.location) ||
    cleanOptional(data.sponsor?.workplace);

  return {
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    address: data.address.trim(),
    lectureCenter: cleanOptional(data.lectureCenter),
    previousCenter: cleanOptional(data.previousCenter),
    isNewStudent: data.isNewStudent,
    level: cleanOptional(data.level),
    careerChallenges: cleanOptional(data.careerChallenges),
    referredBy: cleanOptional(data.referredBy),
    papers,
    documents: data.documents ?? [],
    employment: hasEmployment
      ? {
          placeOfWork: cleanOptional(data.employment?.placeOfWork),
          position: cleanOptional(data.employment?.position),
        }
      : undefined,
    sponsor: hasSponsor
      ? {
          name: cleanOptional(data.sponsor?.name),
          phone: cleanOptional(data.sponsor?.phone),
          email: cleanOptional(data.sponsor?.email),
          location: cleanOptional(data.sponsor?.location),
          workplace: cleanOptional(data.sponsor?.workplace),
        }
      : undefined,
  };
}

function triggerConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.65 },
    colors: ["#4f46e5", "#818cf8", "#22c55e", "#f59e0b", "#ec4899"],
  });

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
  }, 200);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
  }, 350);
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function ApplicantForm({ onSuccess }: { onSuccess?: () => void }) {
  const createApplicant = useCreateApplicant();
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<(typeof SECTIONS)[number]["id"]>(
    SECTIONS[0].id
  );
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<
    z.input<typeof applicantFormSchema>,
    unknown,
    ApplicantFormData
  >({
    resolver: zodResolver(applicantFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      address: "",
      lectureCenter: "",
      previousCenter: "",
      isNewStudent: true,
      level: "",
      careerChallenges: "",
      referredBy: "",
      papers: [],
      employment: { placeOfWork: "", position: "" },
      sponsor: {
        name: "",
        phone: "",
        email: "",
        location: "",
        workplace: "",
      },
      documents: [],
    },
    mode: "onBlur",
  });

  // Sync papers with RHF
  useEffect(() => {
    setValue("papers", selectedPapers, { shouldValidate: false });
  }, [selectedPapers, setValue]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id as (typeof SECTIONS)[number]["id"]);
            const idx = SECTIONS.findIndex((s) => s.id === id);
            setPassedIds((prev) => {
              const next = new Set(prev);
              SECTIONS.slice(0, idx).forEach((s) => next.add(s.id));
              return next;
            });
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const togglePaper = (paper: string) => {
    const next = selectedPapers.includes(paper)
      ? selectedPapers.filter((p) => p !== paper)
      : [...selectedPapers, paper];

    setSelectedPapers(next);
    setValue("papers", next, { shouldValidate: true, shouldDirty: true });
  };

  const handleClearForm = () => {
    reset();
    setSelectedPapers([]);
  };

  const handleResetSuccess = () => {
    setIsSuccess(false);
    setApplicationId(null);
    handleClearForm();
  };

  const onSubmit: SubmitHandler<ApplicantFormData> = async (data) => {
    try {
      const payload = buildPayload(data, selectedPapers);

      const result = await createApplicant.mutateAsync(payload);

      // Support both single object and array responses
      const created =
        result?.data && !Array.isArray(result.data)
          ? result.data
          : Array.isArray(result?.data)
          ? result.data[0]
          : result;

      const id = created?.id ?? null;

      setApplicationId(id);
      setIsSuccess(true);
      triggerConfetti();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Failed to submit application.";
      toast.error(message);
    }
  };

  const onInvalid = (formErrors: FieldErrors<ApplicantFormData>) => {
    if (formErrors.papers?.message) {
      toast.error(formErrors.papers.message);
      return;
    }

    const firstKey = Object.keys(formErrors)[0] as keyof ApplicantFormData;
    const firstError = formErrors[firstKey];

    if (firstError?.message) {
      toast.error(firstError.message);
    } else {
      toast.error("Please fix the highlighted errors before submitting.");
    }
  };

  const isPending = createApplicant.isPending || isSubmitting;

  const [fullName, email, phone, address] = useWatch({
    control,
    name: ["fullName", "email", "phone", "address"],
  });

  const requiredFilled = [
    fullName,
    email,
    phone,
    address,
    selectedPapers.length > 0,
  ].filter(Boolean).length;
  const completionPct = Math.round((requiredFilled / 5) * 100);

  // ── Success State ─────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <SuccessScreen
        applicationId={applicationId}
        onReset={handleResetSuccess}
      />
    );
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex gap-10">
      <SideNav activeId={activeId} passedIds={passedIds} />

      <div className="flex-1 min-w-0 space-y-6">
        {/* Progress */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[14px] font-semibold text-slate-900">
                Application Progress
              </p>
              <p className="text-[12px] text-slate-500 mt-0.5">
                Only a few required fields — the rest is optional
              </p>
            </div>
            <p className="text-2xl font-bold text-indigo-600 tabular-nums">
              {completionPct}%
            </p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
          className="space-y-6"
        >
          {/* 01 Personal */}
          <SectionCard {...SECTIONS[0]}>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                htmlFor="fullName"
                label="Full Name"
                required
                error={errors.fullName?.message}
              >
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  error={!!errors.fullName}
                  {...register("fullName")}
                />
              </Field>

              <Field
                htmlFor="email"
                label="Email Address"
                required
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  error={!!errors.email}
                  {...register("email")}
                />
              </Field>

              <Field
                htmlFor="phone"
                label="Phone Number"
                required
                error={errors.phone?.message}
              >
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+234 800 000 0000"
                  error={!!errors.phone}
                  {...register("phone")}
                />
              </Field>

              <Field
                htmlFor="address"
                label="Home Address"
                required
                error={errors.address?.message}
              >
                <Input
                  id="address"
                  placeholder="123 Main Street, Lagos"
                  error={!!errors.address}
                  {...register("address")}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 02 Academic */}
          <SectionCard {...SECTIONS[1]}>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field htmlFor="lectureCenter" label="Current Lecture Center">
                <Select id="lectureCenter" {...register("lectureCenter")}>
                  <option value="">Select center</option>
                  {LECTURE_CENTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="previousCenter" label="Previous Lecture Center">
                <Select id="previousCenter" {...register("previousCenter")}>
                  <option value="">Select center (if any)</option>
                  {LECTURE_CENTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="level" label="Academic Level">
                <Select id="level" {...register("level")}>
                  <option value="">Select level</option>
                  {ACADEMIC_LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field htmlFor="isNewStudent" label="Student Type">
                <Select id="isNewStudent" {...register("isNewStudent")}>
                  <option value="true">New Student</option>
                  <option value="false">Returning Student</option>
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* 03 Papers */}
          <SectionCard {...SECTIONS[2]}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-medium text-slate-700">
                  Select one or more papers{" "}
                  <span className="text-red-500">*</span>
                </p>
                {selectedPapers.length > 0 && (
                  <span className="text-[12px] font-semibold text-indigo-600">
                    {selectedPapers.length} selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAPERS.map((paper) => (
                  <PaperChip
                    key={paper}
                    label={paper}
                    selected={selectedPapers.includes(paper)}
                    onClick={() => togglePaper(paper)}
                  />
                ))}
              </div>

              {errors.papers?.message && (
                <FieldError message={errors.papers.message} />
              )}
            </div>
          </SectionCard>

          {/* 04 Details */}
          <SectionCard {...SECTIONS[3]}>
            <div className="space-y-5">
              <Field
                htmlFor="careerChallenges"
                label="Career Goals or Challenges"
                hint="This helps us support you better (optional)"
              >
                <Textarea
                  id="careerChallenges"
                  placeholder="What do you hope to achieve?"
                  rows={3}
                  {...register("careerChallenges")}
                />
              </Field>

              <Field htmlFor="referredBy" label="How did you hear about us?">
                <Select id="referredBy" {...register("referredBy")}>
                  <option value="">Select an option</option>
                  {REFERRAL_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </SectionCard>

          {/* 05 Employment */}
          <SectionCard {...SECTIONS[4]}>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field htmlFor="placeOfWork" label="Place of Work">
                <Input
                  id="placeOfWork"
                  placeholder="Company name"
                  {...register("employment.placeOfWork")}
                />
              </Field>
              <Field htmlFor="position" label="Position / Job Title">
                <Input
                  id="position"
                  placeholder="e.g. Accountant"
                  {...register("employment.position")}
                />
              </Field>
            </div>
          </SectionCard>

          {/* 06 Sponsor */}
          <SectionCard {...SECTIONS[5]}>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field htmlFor="sponsorName" label="Sponsor Full Name">
                <Input
                  id="sponsorName"
                  placeholder="Full name"
                  {...register("sponsor.name")}
                />
              </Field>
              <Field htmlFor="sponsorPhone" label="Sponsor Phone">
                <Input
                  id="sponsorPhone"
                  type="tel"
                  placeholder="+234..."
                  {...register("sponsor.phone")}
                />
              </Field>
              <Field
                htmlFor="sponsorEmail"
                label="Sponsor Email"
                error={errors.sponsor?.email?.message}
              >
                <Input
                  id="sponsorEmail"
                  type="email"
                  placeholder="email@example.com"
                  error={!!errors.sponsor?.email}
                  {...register("sponsor.email")}
                />
              </Field>
              <Field htmlFor="sponsorLocation" label="Sponsor Location">
                <Input
                  id="sponsorLocation"
                  placeholder="City"
                  {...register("sponsor.location")}
                />
              </Field>
              <Field htmlFor="sponsorWorkplace" label="Sponsor Workplace">
                <Input
                  id="sponsorWorkplace"
                  placeholder="Company name"
                  {...register("sponsor.workplace")}
                />
              </Field>
            </div>
          </SectionCard>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 z-20 pt-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xl p-4 shadow-lg flex items-center justify-between gap-4">
              <p className="hidden sm:block text-[13px] text-slate-500">
                Only fields marked{" "}
                <span className="text-red-500 font-semibold">*</span> are
                required
              </p>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={isPending}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-40"
                >
                  Clear
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "flex min-w-37.5 items-center justify-center gap-2 rounded-xl px-6 py-2.5",
                    "bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold",
                    "shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                    "active:translate-y-0 active:scale-[0.98]",
                    "disabled:opacity-60 disabled:hover:translate-y-0"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}