"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Lock, Moon, Sun, Monitor, Globe,
  Trash2, LogOut, ChevronRight, CheckCircle2,
  Loader2, Shield, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type Theme         = "system" | "light" | "dark";
type EmailFreq     = "instant" | "daily" | "weekly" | "never";
type PasswordState = { current: string; next: string; confirm: string };

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-white/35 mb-3">
      {children}
    </h2>
  );
}

function SettingRow({
  icon: Icon, label, description, children, danger = false,
}: {
  icon: React.ElementType; label: string; description?: string;
  children?: React.ReactNode; danger?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
      <div className={cn(
        "w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 mt-0.5",
        danger
          ? "bg-red-50 dark:bg-red-500/10"
          : "bg-gray-100 dark:bg-white/[0.06]"
      )}>
        <Icon className={cn("w-4 h-4", danger ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-white/50")} aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] font-medium", danger ? "text-red-700 dark:text-red-400" : "text-gray-900 dark:text-white")}>
          {label}
        </p>
        {description && (
          <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0 ml-2">{children}</div>}
    </div>
  );
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30",
        checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-white/[0.12]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200",
          checked && "translate-x-4"
        )}
      />
    </button>
  );
}

function PasswordInput({
  id, label, value, onChange, show, onToggleShow,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; show: boolean; onToggleShow: () => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-[11px] font-medium text-gray-500 dark:text-white/40">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 pr-10 text-[13px]
                     bg-white dark:bg-white/[0.05]
                     border border-black/[0.08] dark:border-white/[0.08] rounded-xl
                     text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                     transition-all"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white/60 transition-colors"
        >
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { logout } = useAuth();
  const router     = useRouter();

  // ── Notification prefs
  const [notifEmail,    setNotifEmail]    = useState(true);
  const [notifProgress, setNotifProgress] = useState(true);
  const [notifUpdates,  setNotifUpdates]  = useState(false);
  const [emailFreq,     setEmailFreq]     = useState<EmailFreq>("daily");

  // ── Appearance
  const [theme, setTheme] = useState<Theme>("system");

  // ── Password
  const [pw,          setPw]          = useState<PasswordState>({ current: "", next: "", confirm: "" });
  const [showPw,      setShowPw]      = useState(false);
  const [isSavingPw,  setIsSavingPw]  = useState(false);
  const [pwSaved,     setPwSaved]     = useState(false);
  const [pwError,     setPwError]     = useState("");

  // ── General save
  const [isSaving, setIsSaving] = useState(false);
  const [savedOk,  setSavedOk]  = useState(false);

  const handleSaveNotifs = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsSaving(false);
    setSavedOk(true);
    setTimeout(() => setSavedOk(false), 3000);
  };

  const handleSavePw = async () => {
    setPwError("");
    if (!pw.current)                     return setPwError("Current password is required.");
    if (pw.next.length < 8)              return setPwError("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm)          return setPwError("Passwords do not match.");

    setIsSavingPw(true);
    try {
      // await apiClient.post("/auth/change-password", { current: pw.current, next: pw.next });
      await new Promise((r) => setTimeout(r, 900));
      setPwSaved(true);
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    } catch {
      setPwError("Incorrect current password. Please try again.");
    } finally {
      setIsSavingPw(false);
    }
  };

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/auth/login");
  }, [logout, router]);

  const THEME_OPTIONS: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light",  label: "Light",  icon: Sun },
    { value: "dark",   label: "Dark",   icon: Moon },
  ];

  const EMAIL_FREQ: { value: EmailFreq; label: string }[] = [
    { value: "instant", label: "Instantly" },
    { value: "daily",   label: "Daily digest" },
    { value: "weekly",  label: "Weekly summary" },
    { value: "never",   label: "Never" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-2 space-y-6">

      {/* ── Header ──────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-[12px] text-gray-400 dark:text-white/40 mt-1">Manage your preferences and account</p>
      </div>

      {/* ── Notifications ────────────────────────────── */}
      <section aria-labelledby="notif-heading">
        <SectionHeading>
          <span id="notif-heading">Notifications</span>
        </SectionHeading>
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] px-4">
          <SettingRow icon={Bell} label="Email notifications" description="Receive course updates and announcements by email.">
            <Toggle id="notif-email" checked={notifEmail} onChange={setNotifEmail} />
          </SettingRow>
          <SettingRow icon={Bell} label="Progress reminders" description="Get nudged when you haven't learned in a while.">
            <Toggle id="notif-progress" checked={notifProgress} onChange={setNotifProgress} />
          </SettingRow>
          <SettingRow icon={Bell} label="Product updates" description="News about new courses and platform features.">
            <Toggle id="notif-updates" checked={notifUpdates} onChange={setNotifUpdates} />
          </SettingRow>

          {/* Email frequency */}
          {notifEmail && (
            <div className="py-3.5 border-b border-black/[0.04] dark:border-white/[0.04]">
              <p className="text-[12px] font-medium text-gray-700 dark:text-white/70 mb-2">Email frequency</p>
              <div className="flex flex-wrap gap-2">
                {EMAIL_FREQ.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setEmailFreq(f.value)}
                    aria-pressed={emailFreq === f.value}
                    className={cn(
                      "px-3 py-1.5 rounded-[9px] text-[11px] font-medium border transition-all",
                      emailFreq === f.value
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-white/[0.04] text-gray-600 dark:text-white/50 border-black/[0.07] dark:border-white/[0.07] hover:border-indigo-300"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveNotifs}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] font-medium transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {savedOk ? <><CheckCircle2 className="w-3.5 h-3.5" />Saved</> : isSaving ? "Saving…" : "Save preferences"}
          </button>
        </div>
      </section>

      {/* ── Appearance ───────────────────────────────── */}
      <section aria-labelledby="appearance-heading">
        <SectionHeading>
          <span id="appearance-heading">Appearance</span>
        </SectionHeading>
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-4">
          <p className="text-[12px] font-medium text-gray-700 dark:text-white/70 mb-3">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                aria-pressed={theme === value}
                className={cn(
                  "flex flex-col items-center gap-2 py-3 rounded-xl border transition-all",
                  theme === value
                    ? "bg-indigo-50 dark:bg-indigo-500/[0.12] border-indigo-300 dark:border-indigo-500/30"
                    : "bg-white dark:bg-white/[0.04] border-black/[0.07] dark:border-white/[0.07] hover:border-indigo-200 dark:hover:border-indigo-500/20"
                )}
              >
                <Icon className={cn("w-5 h-5", theme === value ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 dark:text-white/35")} aria-hidden="true" />
                <span className={cn("text-[11px] font-medium", theme === value ? "text-indigo-700 dark:text-indigo-400" : "text-gray-500 dark:text-white/40")}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ─────────────────────────────────── */}
      <section aria-labelledby="security-heading">
        <SectionHeading>
          <span id="security-heading">Security</span>
        </SectionHeading>
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] p-4 space-y-3">
          <PasswordInput
            id="pw-current" label="Current password"
            value={pw.current} onChange={(v) => setPw((p) => ({ ...p, current: v }))}
            show={showPw} onToggleShow={() => setShowPw((s) => !s)}
          />
          <PasswordInput
            id="pw-next" label="New password (min. 8 characters)"
            value={pw.next} onChange={(v) => setPw((p) => ({ ...p, next: v }))}
            show={showPw} onToggleShow={() => setShowPw((s) => !s)}
          />
          <PasswordInput
            id="pw-confirm" label="Confirm new password"
            value={pw.confirm} onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
            show={showPw} onToggleShow={() => setShowPw((s) => !s)}
          />

          {pwError && (
            <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
              <Shield className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {pwError}
            </p>
          )}
          {pwSaved && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
              Password updated successfully.
            </p>
          )}

          <button
            onClick={handleSavePw}
            disabled={isSavingPw}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[12px] font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors active:scale-[0.98] disabled:opacity-60"
          >
            {isSavingPw ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            {isSavingPw ? "Updating…" : "Update password"}
          </button>
        </div>
      </section>

      {/* ── Account actions ───────────────────────────── */}
      <section aria-labelledby="account-heading">
        <SectionHeading>
          <span id="account-heading">Account</span>
        </SectionHeading>
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.07] px-4">
          <SettingRow icon={Globe} label="Language" description="Interface language is currently set to English (US).">
            <button
              aria-label="Change language"
              className="flex items-center gap-1 text-[12px] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              English <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </SettingRow>
          <SettingRow icon={LogOut} label="Sign out" description="Sign out of your account on this device.">
            <button
              onClick={handleLogout}
              className="text-[12px] font-medium text-gray-600 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </SettingRow>
          <SettingRow icon={Trash2} label="Delete account" description="Permanently delete your account and all data. This cannot be undone." danger>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
                  // await apiClient.delete("/account");
                }
              }}
              className="text-[12px] font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </SettingRow>
        </div>
      </section>
    </div>
  );
}