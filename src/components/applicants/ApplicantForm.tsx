"use client";

import { Resolver, useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateApplicant } from "@/hooks/useApplicants";
import { useRouter } from "next/navigation";
import { ApplicantFormData, applicantFormSchema } from "@/lib/validations/applicant";
import {
  Loader2, Upload, X, Check, ChevronRight,
  User, BookOpen, FileText, Briefcase, Heart, File, AlertCircle,
  Badge,
} from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAPERS = ["Diploma", "ICAN", "ATS", "ATSWA", "CITN", "SAGE"] as const;

const SECTIONS = [
  { id: "personal",   index: 1, title: "Personal Information",    description: "Your basic contact details",                    icon: User      },
  { id: "academic",   index: 2, title: "Academic Background",     description: "Your educational background",                   icon: BookOpen  },
  { id: "papers",     index: 3, title: "Select Papers",           description: "Choose all papers you are registering for",     icon: FileText  },
  { id: "details",    index: 4, title: "Additional Details",      description: "Help us understand your goals",                 icon: Heart     },
  { id: "employment", index: 5, title: "Employment Information",  description: "Current job details (optional)",                icon: Briefcase },
  { id: "sponsor",    index: 6, title: "Sponsor Information",     description: "If someone is sponsoring your education",       icon: User      },
  // { id: "documents",  index: 7, title: "Supporting Documents",    description: "Upload files to support your application",      icon: File      },
] as const;

// ─── Primitives ───────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ className, error, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-[13px] text-gray-900",
        "placeholder:text-gray-400 outline-none transition-all duration-150",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
          : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15",
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
    <select
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-[13px] text-gray-900",
        "outline-none transition-all duration-150 cursor-pointer appearance-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
          : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border bg-white px-4 py-3 text-[13px] text-gray-900",
        "placeholder:text-gray-400 outline-none resize-none transition-all duration-150",
        error
          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/15"
          : "border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/15",
        className
      )}
      {...props}
    />
  );
}

function Label({
  children, required, htmlFor,
}: {
  children: ReactNode; required?: boolean; htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-[12px] font-semibold text-gray-700 mb-1.5">
      {children}
      {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-[11px] text-red-600" role="alert" aria-live="polite">
      <AlertCircle className="h-3 w-3 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

function Field({
  htmlFor, label, required, error, hint, children,
}: {
  htmlFor?: string; label: string; required?: boolean;
  error?: string; hint?: string; children: ReactNode;
}) {
  return (
    <div className="space-y-0">
      <Label htmlFor={htmlFor} required={required}>{label}</Label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[11px] text-gray-400">{hint}</p>}
      <FieldError message={error} />
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px bg-gray-100 my-10" />;
}

function SectionHeader({
  id, index, title, description, icon: Icon,
}: {
  id: string; index: number; title: string; description: string; icon: React.ElementType;
}) {
  return (
    <div id={id} className="flex items-start gap-4 mb-8 scroll-mt-30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
        <Icon className="h-4.5 w-4.5 text-indigo-600" aria-hidden="true" />
      </div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] font-bold text-indigo-400 tracking-widest uppercase">
            {String(index).padStart(2, "0")}
          </span>
          <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">{title}</h2>
        </div>
        <p className="mt-0.5 text-[12px] text-gray-500">{description}</p>
      </div>
    </div>
  );
}

// ─── Desktop side nav ────────────────────────────────────────────────────────

function SideNav({ activeId, passedIds }: { activeId: string; passedIds: Set<string> }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <nav
      className="hidden lg:flex flex-col gap-0.5 sticky top-35 w-43 shrink-0 self-start"
      aria-label="Form sections"
    >
      {SECTIONS.map(({ id, index, title, icon: Icon }) => {
        const isPassed = passedIds.has(id);
        const isActive = activeId === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium",
              "transition-all duration-150 text-left group",
              isActive
                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-50 border border-transparent"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold font-mono",
                "transition-all duration-150",
                isActive
                  ? "bg-indigo-600 text-white"
                  : isPassed
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-gray-100 text-gray-500"
              )}
            >
              {isPassed && !isActive ? (
                <Check className="h-3 w-3" strokeWidth={3} />
              ) : (
                String(index)
              )}
            </span>
            <span className="truncate">{title.split(" ")[0]}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Paper chip ──────────────────────────────────────────────────────────────

function PaperChip({
  label, selected, onClick,
}: {
  label: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 rounded-2xl border-2 py-4 px-3",
        "text-[12px] font-bold tracking-wide transition-all duration-150 select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        selected
          ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-indigo-300 hover:bg-indigo-50/30"
      )}
    >
      {selected && (
        <span
          className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600"
          aria-hidden="true"
        >
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
      )}
      {label}
    </button>
  );
}

// ─── File attachment row ─────────────────────────────────────────────────────

function FileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isPdf = file.type === "application/pdf";
  const sizeMb = (file.size / 1024 / 1024).toFixed(2);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 group">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold",
          isPdf ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
        )}
      >
        {isPdf ? "PDF" : "IMG"}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-gray-900 truncate">{file.name}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{sizeMb} MB</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

export function ApplicantForm({ onSuccess }: { onSuccess?: () => void }) {
  const router          = useRouter();
  const createApplicant = useCreateApplicant();
  const fileInputRef    = useRef<HTMLInputElement>(null);

  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [uploadedFiles,  setUploadedFiles]  = useState<File[]>([]);
  const [activeId,       setActiveId]       = useState<(typeof SECTIONS)[number]["id"]>(SECTIONS[0].id);
  const [passedIds,      setPassedIds]      = useState<Set<string>>(new Set());

  // ── Form ────────────────────────────────────────────────────────────────────

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ApplicantFormData>({
    resolver: zodResolver(applicantFormSchema),
    defaultValues: {
      fullName:       "",
      email:          "",
      phone:          "",
      address:        "",
      lectureCenter:  "",
      previousCenter: "",
      isNewStudent:   true,
      level:          "",
      careerChallenges: "",
      referredBy:     "",
      papers:         [],
      employment: { placeOfWork: "", position: "" },
      sponsor:    { name: "", phone: "", email: "", location: "", workplace: "" },
      documents:  [],
    },
    mode: "onBlur",
  });

  // ── IntersectionObserver — sync with CreateApplicantPage ────────────────────

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);
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

  // ── Handlers ────────────────────────────────────────────────────────────────

  const togglePaper = (paper: string) => {
    const next = selectedPapers.includes(paper)
      ? selectedPapers.filter((p) => p !== paper)
      : [...selectedPapers, paper];
    setSelectedPapers(next);
    setValue("papers", next, { shouldValidate: true });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (!incoming.length) return;
    // Validate size — max 10 MB per file
    const valid = incoming.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`"${f.name}" exceeds 10 MB and was skipped.`);
        return false;
      }
      return true;
    });
    const next = [...uploadedFiles, ...valid];
    setUploadedFiles(next);
    setValue("documents", next as never);
    // Reset so the same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (i: number) => {
    const next = uploadedFiles.filter((_, idx) => idx !== i);
    setUploadedFiles(next);
    setValue("documents", next as never);
  };

  const handleClearForm = () => {
    reset();
    setSelectedPapers([]);
    setUploadedFiles([]);
  };

  const onSubmit: SubmitHandler<ApplicantFormData> = async (data) => {
    try {
      await createApplicant.mutateAsync(data);
      toast.success("Application submitted successfully!");
      handleClearForm();
      // if (onSuccess) {
      //   onSuccess();
      // } else {
      //   router.push("/application-submitted");
      // }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit application.";
      toast.error(message);
    }
  };

  const isPending = createApplicant.isPending || isSubmitting;

  // ── Completion calc ──────────────────────────────────────────────────────────

  const fullName = watch("fullName");
  const email = watch("email");
  const phone = watch("phone");
  const address = watch("address");

  const requiredFields = [
    fullName, email, phone, address,
    selectedPapers.length > 0 ? "ok" : "",
  ];
  const completionPct = Math.round(
    (requiredFields.filter(Boolean).length / requiredFields.length) * 100
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-10">
      {/* Desktop sticky nav */}
      <SideNav activeId={activeId} passedIds={passedIds} />

      {/* Form body */}
      <div className="flex-1 min-w-0">

        {/* Completion bar */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[13px] font-bold text-gray-900">Application Progress</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Complete all required fields before submitting
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[22px] font-bold text-indigo-600 leading-none">{completionPct}%</span>
              <span className="text-[10px] text-gray-400 mt-0.5">complete</span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── 01 Personal ─────────────────────────────────────────────── */}
          <SectionHeader {...SECTIONS[0]} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              htmlFor="fullName" label="Full Name" required
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
              htmlFor="email" label="Email Address" required
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
              htmlFor="phone" label="Phone Number" required
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
              htmlFor="address" label="Home Address" required
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

          <SectionDivider />

          {/* ── 02 Academic ─────────────────────────────────────────────── */}
          <SectionHeader {...SECTIONS[1]} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              htmlFor="lectureCenter" label="Current Lecture Center"
              error={errors.lectureCenter?.message}
            >
              <Input
                id="lectureCenter"
                placeholder="e.g. Lagos Center"
                error={!!errors.lectureCenter}
                {...register("lectureCenter")}
              />
            </Field>

            <Field
              htmlFor="previousCenter" label="Previous Lecture Center"
              error={errors.previousCenter?.message}
            >
              <Input
                id="previousCenter"
                placeholder="e.g. Abuja Center"
                error={!!errors.previousCenter}
                {...register("previousCenter")}
              />
            </Field>

            <Field
              htmlFor="level" label="Academic Level"
              error={errors.level?.message}
            >
              <Input
                id="level"
                placeholder="e.g. 100L, 200L, Diploma"
                error={!!errors.level}
                {...register("level")}
              />
            </Field>

            <Field htmlFor="isNewStudent" label="Student Type">
              <Select id="isNewStudent" {...register("isNewStudent")}>
                <option value="true">New Student</option>
                <option value="false">Returning Student</option>
              </Select>
            </Field>
          </div>

          <SectionDivider />

          {/* ── 03 Papers ───────────────────────────────────────────────── */}
          <SectionHeader {...SECTIONS[2]} />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-gray-700">
                Select papers to register for
              </span>
              <span className="text-red-500 text-[12px]" aria-hidden="true">*</span>
              {selectedPapers.length > 0 && (
                <span className="ml-auto text-[11px] font-bold text-indigo-600">
                  {selectedPapers.length} selected
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {PAPERS.map((paper) => (
                <PaperChip
                  key={paper}
                  label={paper}
                  selected={selectedPapers.includes(paper)}
                  onClick={() => togglePaper(paper)}
                />
              ))}
            </div>

            {(errors.papers as { message?: string })?.message && (
              <FieldError message={(errors.papers as { message?: string }).message} />
            )}

            {/* Selected summary */}
            {selectedPapers.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedPapers.map((p) => (
                  <span
                    key={p}
                    className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-bold text-white"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => togglePaper(p)}
                      aria-label={`Remove ${p}`}
                      className="hover:bg-indigo-500 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <SectionDivider />

          {/* ── 04 Details ──────────────────────────────────────────────── */}
          <SectionHeader {...SECTIONS[3]} />
          <div className="space-y-5">
            <Field
              htmlFor="careerChallenges" label="Career Challenges or Goals"
              error={errors.careerChallenges?.message}
              hint="Share any professional challenges you face or goals you want to achieve"
            >
              <Textarea
                id="careerChallenges"
                placeholder="Tell us about your career goals or challenges…"
                rows={4}
                error={!!errors.careerChallenges}
                {...register("careerChallenges")}
              />
            </Field>

            <Field
              htmlFor="referredBy" label="How Did You Hear About Us?"
              error={errors.referredBy?.message}
            >
              <Input
                id="referredBy"
                placeholder="Friend, Social Media, Google, Advertisement…"
                error={!!errors.referredBy}
                {...register("referredBy")}
              />
            </Field>
          </div>

          <SectionDivider />

          {/* ── 05 Employment ───────────────────────────────────────────── */}
          <SectionHeader {...SECTIONS[4]} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              htmlFor="placeOfWork" label="Place of Work"
              error={errors.employment?.placeOfWork?.message}
            >
              <Input
                id="placeOfWork"
                placeholder="Company or organisation name"
                error={!!errors.employment?.placeOfWork}
                {...register("employment.placeOfWork")}
              />
            </Field>

            <Field
              htmlFor="position" label="Position / Job Title"
              error={errors.employment?.position?.message}
            >
              <Input
                id="position"
                placeholder="e.g. Accountant, Analyst"
                error={!!errors.employment?.position}
                {...register("employment.position")}
              />
            </Field>
          </div>

          <SectionDivider />

          {/* ── 06 Sponsor ──────────────────────────────────────────────── */}
          <SectionHeader {...SECTIONS[5]} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              htmlFor="sponsorName" label="Sponsor Full Name"
              error={errors.sponsor?.name?.message}
            >
              <Input
                id="sponsorName"
                placeholder="Full name"
                error={!!errors.sponsor?.name}
                {...register("sponsor.name")}
              />
            </Field>

            <Field
              htmlFor="sponsorPhone" label="Sponsor Phone"
              error={errors.sponsor?.phone?.message}
            >
              <Input
                id="sponsorPhone"
                type="tel"
                placeholder="+234 800 000 0000"
                error={!!errors.sponsor?.phone}
                {...register("sponsor.phone")}
              />
            </Field>

            <Field
              htmlFor="sponsorEmail" label="Sponsor Email"
              error={errors.sponsor?.email?.message}
            >
              <Input
                id="sponsorEmail"
                type="email"
                placeholder="sponsor@email.com"
                error={!!errors.sponsor?.email}
                {...register("sponsor.email")}
              />
            </Field>

            <Field
              htmlFor="sponsorLocation" label="Sponsor Location"
              error={errors.sponsor?.location?.message}
            >
              <Input
                id="sponsorLocation"
                placeholder="City / Area"
                error={!!errors.sponsor?.location}
                {...register("sponsor.location")}
              />
            </Field>

            <Field
              htmlFor="sponsorWorkplace" label="Sponsor Workplace"
              error={errors.sponsor?.workplace?.message}
              // spans 2 cols on ≥sm
            >
              <Input
                id="sponsorWorkplace"
                placeholder="Company / Organisation name"
                error={!!errors.sponsor?.workplace}
                {...register("sponsor.workplace")}
              />
            </Field>
          </div>

          <SectionDivider />

          {/* ── 07 Documents ────────────────────────────────────────────── */}
          {/* <SectionHeader {...SECTIONS[6]} />
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "group w-full rounded-2xl border-2 border-dashed p-10",
                "flex flex-col items-center gap-3 text-center",
                "transition-all duration-150",
                "border-indigo-200 bg-indigo-50/20 hover:border-indigo-400 hover:bg-indigo-50/60"
              )}
              aria-label="Upload supporting documents"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                <Upload className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-gray-800">
                  Drop files here or click to upload
                </p>
                <p className="mt-1 text-[12px] text-gray-500">
                  PDF, JPG, PNG — max 10 MB per file
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-[12px] font-semibold text-white group-hover:bg-indigo-700 transition-colors">
                Choose Files
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.pdf"
              className="hidden"
              aria-label="File upload input"
              onChange={handleFileChange}
            />

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-[12px] font-semibold text-gray-700">
                  {uploadedFiles.length} {uploadedFiles.length === 1 ? "file" : "files"} attached
                </p>
                {uploadedFiles.map((file, i) => (
                  <FileRow key={`${file.name}-${i}`} file={file} onRemove={() => removeFile(i)} />
                ))}
              </div>
            )}
          </div> */}

          {/* ── Sticky submit footer ─────────────────────────────────────── */}
          <div className="sticky bottom-0 left-0 right-0 z-20 mt-12">
            {/* Fade shadow */}
            <div
              className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-linear-to-t from-[#F9F9F7] to-transparent"
              aria-hidden="true"
            />
            <div className="border-t border-gray-200 bg-[#F9F9F7]/95 backdrop-blur-sm py-4 flex items-center justify-between gap-4">
              <p className="hidden sm:block text-[12px] text-gray-500">
                Fields marked <span className="text-red-500 font-bold">*</span> are required
              </p>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={handleClearForm}
                  disabled={isPending}
                  className={cn(
                    "rounded-xl border border-gray-200 bg-white px-5 py-2.5 cursor-pointer",
                    "text-[13px] font-semibold text-gray-700",
                    "hover:bg-gray-50 transition-colors",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  Clear form
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className={cn(
                    "flex min-w-43 items-center justify-center gap-2 rounded-xl cursor-pointer",
                    "bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5",
                    "text-[13px] font-bold text-white",
                    "transition-all duration-150 active:scale-[0.98]",
                    "disabled:opacity-60 disabled:cursor-not-allowed"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
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