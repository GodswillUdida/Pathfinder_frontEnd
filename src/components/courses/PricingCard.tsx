"use client";

import { useMemo, useState } from "react";
import type { CoursePricing } from "@/types/course";
import type { Stats } from "./CoursePage";
import { fmtSecs, formatPrice } from "./course.helper";
import { formatDuration } from "@/lib/formatDuration";
import {
  AlertCircle, Award, Check, CheckCircle2, Clock,
  Layers, PlayCircle, Shield, ShoppingCart, Star,
  Tv, Zap, Users, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PricingCardProps {
  pricings:     CoursePricing[];
  enrolled:     boolean;
  stats:        Stats;
  isInCart:     (pricingId: string) => boolean;
  onAddToCart:  (pricing: CoursePricing) => void;
  onBuyNow:     (pricing: CoursePricing) => void;
}

// ─── Perk row ─────────────────────────────────────────────────────────────────

function Perk({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ background: "rgba(99,102,241,0.1)" }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color: "#818cf8" }} aria-hidden="true" />
      </div>
      <span className="text-[13px]" style={{ color: "#475569" }}>{label}</span>
    </li>
  );
}

// ─── Social proof avatars ─────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#6366f1,#8b5cf6)",
  "linear-gradient(135deg,#0ea5e9,#6366f1)",
  "linear-gradient(135deg,#f59e0b,#ef4444)",
  "linear-gradient(135deg,#10b981,#0ea5e9)",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingCard({
  pricings, enrolled, stats, isInCart, onAddToCart, onBuyNow,
}: PricingCardProps) {

  // Filter to active plans; fall back to all
  const displayPricings = useMemo(() => {
    const active = pricings.filter((p) => p.isActive);
    return active.length > 0 ? active : pricings;
  }, [pricings]);

  // Default to cheapest plan
  const defaultIdx = useMemo(
    () => displayPricings.reduce(
      (mi, p, i, arr) => (p.price < arr[mi].price ? i : mi),
      0
    ),
    [displayPricings]
  );

  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const selected = displayPricings[selectedIdx];

  const maxPrice       = Math.max(...displayPricings.map((p) => p.price));
  const savingsPct     = selected && maxPrice > selected.price
    ? Math.round(((maxPrice - selected.price) / maxPrice) * 100)
    : 0;

  const perks = [
    stats.totalSeconds > 0 && { icon: Clock,      label: `${fmtSecs(stats.totalSeconds)} on-demand video` },
    stats.topicCount   > 0 && { icon: PlayCircle,  label: `${stats.topicCount} lessons with exercises` },
    stats.moduleCount  > 0 && { icon: Layers,      label: `${stats.moduleCount} structured modules` },
    { icon: Award, label: "Certificate of completion" },
    { icon: Tv,    label: "Stream on any device" },
  ].filter(Boolean) as { icon: React.ElementType; label: string }[];

  return (
    <div
      className="w-full overflow-hidden rounded-3xl"
      style={{
        background:   "#ffffff",
        border:       "0.5px solid rgba(0,0,0,0.08)",
        boxShadow:    "0 24px 64px -12px rgba(99,102,241,0.18), 0 8px 20px -6px rgba(0,0,0,0.1)",
      }}
    >

      {/* ── Hero header ─────────────────────────────────────────────────── */}
      {selected ? (
        <div
          className="relative overflow-hidden px-6 py-8"
          style={{
            background: "linear-gradient(140deg, #1e1b4b 0%, #312e81 45%, #4338ca 100%)",
          }}
        >
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,.8) 24px,rgba(255,255,255,.8) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.8) 24px,rgba(255,255,255,.8) 25px)",
            }}
          />

          {/* Glow orb */}
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full opacity-30 blur-3xl"
            style={{ background: "#818cf8" }}
          />

          <div className="relative z-10 space-y-4">
            {/* Plan label + savings badge */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em]"
                style={{ color: "rgba(199,210,254,0.8)" }}
              >
                {selected.name || "Full access"}
              </span>
              {savingsPct > 0 && displayPricings.length > 1 && (
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color:      "#fff",
                    border:     "0.5px solid rgba(255,255,255,0.2)",
                  }}
                >
                  Save {savingsPct}%
                </span>
              )}
            </div>

            {/* Price */}
            <div>
              <p
                className="text-5xl font-bold leading-none tracking-tight text-white"
                // style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)" }}
              >
                {formatPrice(selected.price, selected.currency)}
              </p>
              <p className="mt-1.5 text-sm" style={{ color: "rgba(199,210,254,0.7)" }}>
                one-time payment
              </p>
            </div>

            {/* Duration pill */}
            {selected.durationDays > 0 && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color:      "#c7d2fe",
                  border:     "0.5px solid rgba(255,255,255,0.15)",
                }}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {formatDuration(selected.durationDays)} access
              </div>
            )}
          </div>
        </div>
      ) : (
        /* No active pricing */
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{ background: "#f1f5f9" }}
          >
            <Lock className="h-5 w-5" style={{ color: "#94a3b8" }} aria-hidden="true" />
          </div>
          <p className="text-sm font-medium" style={{ color: "#64748b" }}>
            No active plans available
          </p>
        </div>
      )}

      {/* ── Social proof ─────────────────────────────────────────────────── */}
      {selected && (
        <div
          className="px-6 py-5"
          style={{ borderBottom: "0.5px solid #f1f5f9" }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar stack */}
            <div className="flex -space-x-2" aria-hidden="true">
              {AVATAR_GRADIENTS.map((bg, i) => (
                <div
                  key={i}
                  className="h-9 w-9 rounded-full border-2 border-white"
                  style={{ background: bg, boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}
                />
              ))}
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#0f172a" }}>
                5,200+ students enrolled
              </p>
              <div className="mt-0.5 flex items-center gap-1 text-[12px] font-semibold" style={{ color: "#f59e0b" }}>
                <Star className="h-3 w-3 fill-current" strokeWidth={0} aria-hidden="true" />
                4.9 · Outstanding rating
              </div>
            </div>
          </div>

          {/* Trust bullets */}
          <ul className="mt-4 space-y-2">
            {[
              "2026-updated content — latest tools & practices",
              "Portfolio-ready projects for your CV",
              // "Lifetime community access",
            ].map((text) => (
              <li key={text} className="flex items-start gap-2 text-[12px]" style={{ color: "#475569" }}>
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: "#22c55e" }}
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Plan selector ─────────────────────────────────────────────────── */}
      {displayPricings.length > 1 && (
        <div
          className="px-5 py-5"
          style={{ borderBottom: "0.5px solid #f1f5f9" }}
        >
          <p
            className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "#94a3b8" }}
          >
            Choose your plan
          </p>
          <div className="space-y-2" role="radiogroup" aria-label="Pricing plan selection">
            {displayPricings.map((p, i) => {
              const active = i === selectedIdx;
              return (
                <button
                  key={p.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedIdx(i)}
                  className={cn(
                    "relative w-full rounded-2xl border-2 px-4 py-3.5 text-left transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                  )}
                  style={
                    active
                      ? { borderColor: "#6366f1", background: "rgba(99,102,241,0.05)" }
                      : { borderColor: "#e2e8f0", background: "#fff" }
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Radio indicator */}
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors"
                        style={
                          active
                            ? { borderColor: "#6366f1", background: "#6366f1" }
                            : { borderColor: "#cbd5e1", background: "transparent" }
                        }
                      >
                        {active && (
                          <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden="true" />
                        )}
                      </span>
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: active ? "#4f46e5" : "#1e293b" }}
                      >
                        {p.name || formatDuration(p.durationDays)}
                      </span>
                    </div>

                    {/* Price */}
                    <span
                      className="text-[15px] font-bold"
                      style={{ color: active ? "#4f46e5" : "#334155" }}
                    >
                      {formatPrice(p.price, p.currency)}
                    </span>
                  </div>

                  {/* Active ring accent */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-full"
                      style={{ background: "#6366f1" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CTAs ──────────────────────────────────────────────────────────── */}
      <div className="space-y-3 px-6 py-6">
        {enrolled ? (
          /* Already enrolled */
          <div
            className="flex items-center justify-center gap-3 rounded-2xl py-4 text-[14px] font-semibold"
            style={{
              background: "rgba(34,197,94,0.08)",
              border:     "1.5px solid rgba(34,197,94,0.25)",
              color:      "#15803d",
            }}
            role="status"
            aria-label="You are enrolled in this course"
          >
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            Enrolled — Start Learning
          </div>
        ) : selected ? (
          <>
            {/* Primary: Enroll now */}
            <button
              onClick={() => onBuyNow(selected)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-[14px] font-bold text-white transition-all duration-200 active:scale-[0.98] cursor-pointer bg-blue-600 hover:bg-blue-800"
              // style={{
              //   background:  "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
              //   boxShadow:   "0 8px 20px -4px rgba(99,102,241,0.4)",
              // }}
              aria-label="Enroll now and get instant access"
            >
              <Zap className="h-4 w-4" aria-hidden="true" />
              Enroll Now — Instant Access
            </button>

            {/* Secondary: Add to cart */}
            <button
              onClick={() => onAddToCart(selected)}
              disabled={isInCart(selected.id)}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-[13px] font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer bg-[#e2e8f0]"
              // style={{
              //   background:   "transparent",
              //   border:       "1.5px solid #e2e8f0",
              //   color:        isInCart(selected.id) ? "#94a3b8" : "#334155",
              // }}
              aria-label={isInCart(selected.id) ? "Already in cart" : "Add to cart"}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {isInCart(selected.id) ? "Already in Cart" : "Add to Cart"}
            </button>
          </>
        ) : null}

        {/* Secure checkout note */}
        <p
          className="flex items-center justify-center gap-1.5 pt-1 text-center text-[11px]"
          style={{ color: "#94a3b8" }}
        >
          <Shield className="h-3.5 w-3.5" aria-hidden="true" />
          Secure checkout · 30-day refund guarantee
        </p>
      </div>

      {/* ── Perks ─────────────────────────────────────────────────────────── */}
      <div
        className="px-6 pb-6 pt-4"
        style={{ borderTop: "0.5px solid #f1f5f9" }}
      >
        <p
          className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: "#94a3b8" }}
        >
          What's included
        </p>
        <ul className="space-y-3">
          {perks.map(({ icon, label }) => (
            <Perk key={label} icon={icon} label={label} />
          ))}
        </ul>
      </div>
    </div>
  );
}