"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Camera, User, Mail, Globe, MapPin, Twitter,
  Linkedin, Github, CheckCircle2, Loader2, Trophy,
  BookOpen, Zap, Flame,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileForm {
  name:     string;
  bio:      string;
  location: string;
  website:  string;
  twitter:  string;
  linkedin: string;
  github:   string;
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  label, icon: Icon, id, type = "text", placeholder, value, onChange, hint,
}: {
  label: string; icon: React.ElementType; id: string;
  type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-[12px] font-medium text-gray-600 dark:text-white/60 flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-[13px]
                   bg-white dark:bg-white/[0.05]
                   border border-black/[0.08] dark:border-white/[0.08] rounded-xl
                   text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25
                   focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                   transition-all"
      />
      {hint && <p className="text-[10px] text-gray-400 dark:text-white/30">{hint}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function UserProfilePage() {
  const { user } = useAuth();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    name:     user?.name ?? "",
    bio:      "",
    location: "",
    website:  "",
    twitter:  "",
    linkedin: "",
    github:   "",
  });

  const [isSaving,  setIsSaving]  = useState(false);
  const [savedOk,   setSavedOk]   = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(user?.avatar ?? null);

  const set = (key: keyof ProfileForm) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarSrc(url);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSavedOk(false);
    try {
      // Replace with real API call: await apiClient.patch("/profile", form);
      await new Promise((r) => setTimeout(r, 900));
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Mock stats — replace with real data
  const stats = [
    { icon: BookOpen,    label: "Courses",      value: 0 },
    { icon: Trophy,      label: "Certificates", value: 0 },
    { icon: Zap,         label: "XP",           value: "0" },
    { icon: Flame,       label: "Streak",       value: "0d" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 space-y-6">

      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Profile</h1>
        <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">Your public learning identity</p>
      </div>

      {/* ── Avatar + quick stats ─────────────────────── */}
      <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-5">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center overflow-hidden">
              {avatarSrc ? (
                <Image src={avatarSrc} alt="Avatar" fill className="object-cover" />
              ) : (
                <span className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">{initials}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              aria-label="Change avatar"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border border-black/[0.1] dark:border-white/[0.1] flex items-center justify-center text-gray-600 dark:text-white/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm"
            >
              <Camera className="w-3 h-3" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
              aria-label="Upload avatar image"
            />
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-gray-900 dark:text-white truncate">{user?.name ?? "Student"}</p>
            <p className="text-[12px] text-gray-400 dark:text-white/40 mt-0.5 truncate">{user?.email}</p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              {user?.role === "admin" || user?.role === "superadmin" ? "Admin" : "Student"}
            </p>
          </div>
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-black/[0.05] dark:border-white/[0.05]">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.05]"
            >
              <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-white/30 mb-1" aria-hidden="true" />
              <span className="text-[14px] font-bold text-gray-900 dark:text-white leading-none">{value}</span>
              <span className="text-[9px] text-gray-400 dark:text-white/30 mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Profile form ─────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-5 space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
          Basic info
        </h2>

        <Field id="name"     label="Display name" icon={User}    value={form.name}     onChange={set("name")}     placeholder="Your full name" />
        <Field id="location" label="Location"      icon={MapPin}  value={form.location} onChange={set("location")} placeholder="Lagos, Nigeria" />
        <Field id="website"  label="Website"       icon={Globe}   value={form.website}  onChange={set("website")}  placeholder="https://yoursite.com" type="url" />

        {/* Bio */}
        <div className="space-y-1.5">
          <label htmlFor="bio" className="text-[12px] font-medium text-gray-600 dark:text-white/60">
            Bio
          </label>
          <textarea
            id="bio"
            value={form.bio}
            onChange={(e) => set("bio")(e.target.value)}
            placeholder="A short intro about yourself…"
            rows={3}
            maxLength={200}
            className="w-full px-3 py-2 text-[13px] resize-none
                       bg-white dark:bg-white/[0.05]
                       border border-black/[0.08] dark:border-white/[0.08] rounded-xl
                       text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                       transition-all"
          />
          <p className="text-[10px] text-gray-400 dark:text-white/30 text-right">{form.bio.length}/200</p>
        </div>
      </div>

      {/* ── Social links ─────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-5 space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35">
          Social links
        </h2>
        <Field id="twitter"  label="Twitter / X" icon={X}  value={form.twitter}  onChange={set("twitter")}  placeholder="@handle" />
        <Field id="linkedin" label="LinkedIn"     icon={Linkedin} value={form.linkedin} onChange={set("linkedin")} placeholder="linkedin.com/in/yourname" />
        {/* <Field id="github"   label="GitHub"       icon={Github}   value={form.github}   onChange={set("github")}   placeholder="github.com/yourusername" /> */}
      </div>

      {/* ── Save ─────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3">
        {savedOk && (
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Profile saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                     bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-medium
                     transition-colors active:scale-[0.98] disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}