import { motion } from "framer-motion";
import { CoursePricing } from "@/types/course";
import { useMemo, useState } from "react";
import { Stats } from "./CoursePage";
import { fmtSecs, formatPrice } from "./course.helper";
import {
  AlertCircle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  PlayCircle,
  Shield,
  ShoppingCart,
  Tv,
  Zap,
} from "lucide-react";
import { Button } from "../ui/button";

interface PricingCardProps {
  pricings: CoursePricing[];
  enrolled: boolean;
  stats: Stats;
  isInCart: (pricingId: string) => boolean;
  onAddToCart: (pricing: CoursePricing) => void;
  onBuyNow: (pricing: CoursePricing) => void;
}

export function PricingCard({
  pricings,
  enrolled,
  stats,
  isInCart,
  onAddToCart,
  onBuyNow,
}: PricingCardProps) {
  const displayPricings = useMemo(() => {
    const active = pricings.filter((p) => p.isActive);
    return active.length > 0 ? active : pricings;
  }, [pricings]);

  const defaultIdx = useMemo(
    () =>
      displayPricings.reduce(
        (mi, p, i, arr) => (p.price < arr[mi].price ? i : mi),
        0
      ),
    [displayPricings]
  );

  const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
  const selected = displayPricings[selectedIdx];

  const maxPrice = Math.max(...displayPricings.map((p) => p.price));
  const savingsPercent =
    selected && maxPrice > selected.price
      ? Math.round(((maxPrice - selected.price) / maxPrice) * 100)
      : 0;

  const perks = [
    stats.totalSeconds > 0 && {
      icon: Clock,
      text: `${fmtSecs(stats.totalSeconds)} on-demand video`,
    },
    stats.topicCount > 0 && {
      icon: PlayCircle,
      text: `${stats.topicCount} hands-on topics`,
    },
    stats.moduleCount > 0 && {
      icon: Layers,
      text: `${stats.moduleCount} structured modules`,
    },
    { icon: Award, text: "Official certificate of completion" },
    { icon: BookOpen, text: "Lifetime access — learn at your pace" },
    { icon: Tv, text: "Watch on any device, anywhere" },
    { icon: Shield, text: "30-day money-back guarantee" },
  ].filter(Boolean) as { icon: React.ElementType; text: string }[];

  // w-full pb-10 lg:pb-0
  // lg:-mt-[450px] xl:-mt-[400px]
  // lg:w-[368px] xl:w-[404px]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
      className="relative z-10
        w-full
        lg:w-[360px] xl:w-[380px] 2xl:w-[400px]
        lg:sticky
        lg:top-[76px]
        lg:self-start
        pb-10 lg:pb-16"
    >
      <div
        className="
            overflow-hidden rounded-2xl sm:rounded-3xl
            border border-slate-200/60
            bg-white/96 backdrop-blur-xl
            shadow-[0_20px_70px_-10px_rgba(37,99,235,0.20),0_10px_20px_-5px_rgba(0,0,0,0.09)]
            ring-1 ring-black/5
            transition-all duration-400
            hover:shadow-[0_32px_100px_-12px_rgba(37,99,235,0.26),0_12px_24px_-6px_rgba(0,0,0,0.10)]
            hover:-translate-y-1
          "
      >
        {/* ── Premium Gradient Header ── */}
        {selected ? (
          <div
            className="relative px-6 pb-9 pt-9 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #1e40af 0%, #3b82f6 48%, #60a5fa 100%)",
            }}
          >
            {/* Subtle noise overlay (optional — add /public/noise.png if desired) */}
            {/* <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none bg-[url('/noise.png')]" /> */}

            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <p className="font-poppins text-[11px] font-bold uppercase tracking-[0.24em] text-blue-100/90">
                  {selected.name || "Full Access"}
                </p>

                {displayPricings.length > 1 && savingsPercent > 0 && (
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    Save {savingsPercent}%
                  </span>
                )}
              </div>

              <p className="mt-4 font-poppins text-4xl sm:text-6xl font-bold leading-none text-white tracking-tight">
                {formatPrice(selected.price, selected.currency)}
                <span className="ml-2.5 text-xl font-bold opacity-80">
                  one-time
                </span>
              </p>

              {/* Transformation hook — emotionally powerful */}
              {/* <p className="mt-5 text-base font-medium text-blue-50 leading-relaxed max-w-[280px]">
                  Master {course.title.split(" ")[0]} in weeks — build real
                  projects, boost your portfolio, and unlock better opportunities.
                </p> */}

              {selected.durationDays > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm text-blue-50 backdrop-blur-sm">
                  <Clock className="h-4 w-4" />
                  {selected.durationDays}-day access period
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 px-6 py-8 text-center text-slate-600">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 font-medium">No active pricing plans</p>
          </div>
        )}

        {/* ── Trust & Social Proof ── */}
        {/* {selected && (
            <div className="border-b border-slate-100/80 bg-gradient-to-b from-white via-white to-slate-50/50 px-6 py-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`
                        h-10 w-10 rounded-full border-2 border-white shadow-sm
                        bg-gradient-to-br ${i % 2 === 0 ? "from-blue-500 to-indigo-600" : "from-indigo-500 to-blue-600"}
                      `}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-[15px]">
                    5,200+ students enrolled
                  </p>
                  <div className="flex items-center gap-1.5 text-amber-500 text-sm font-medium">
                    <Star className="h-4 w-4 fill-current" strokeWidth={0} />
                    4.9 • Outstanding
                  </div>
                </div>
              </div>
  
              <ul className="mt-5 space-y-2.5 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
                  <span>2026-updated content — latest tools & best practices</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Portfolio-ready projects you can show employers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-5 w-5 text-emerald-500 shrink-0" />
                  <span>Fast, helpful support + active community</span>
                </li>
              </ul>
            </div>
          )} */}

        {/* ── Plan Selector (when multiple) ── */}
        {displayPricings.length > 1 && (
          <div className="border-b border-slate-100 px-5 py-6">
            <p className="font-poppins mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Choose Your Plan
            </p>
            <div className="space-y-3">
              {displayPricings.map((p, i) => {
                const active = i === selectedIdx;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedIdx(i)}
                    className={`
                        group relative w-full rounded-xl border-2 px-5 py-4 text-left transition-all duration-200
                        ${
                          active
                            ? "border-blue-600 bg-blue-50/70 shadow-sm"
                            : "border-slate-200 hover:border-blue-400 hover:bg-slate-50/60"
                        }
                      `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`
                              flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors
                              ${
                                active
                                  ? "border-blue-600 bg-blue-600"
                                  : "border-slate-300 group-hover:border-blue-400"
                              }
                            `}
                        >
                          {active && (
                            <Check
                              className="h-4 w-4 text-white"
                              strokeWidth={3}
                            />
                          )}
                        </span>
                        <div>
                          <p
                            className={`font-poppins font-semibold ${
                              active ? "text-blue-700" : "text-slate-800"
                            }`}
                          >
                            {p.name || `Plan ${i + 1}`}
                          </p>
                          {p.durationDays > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {p.durationDays}-day access
                            </p>
                          )}
                        </div>
                      </div>
                      <p
                        className={`font-poppins text-lg font-bold ${
                          active ? "text-blue-700" : "text-slate-700"
                        }`}
                      >
                        {formatPrice(p.price, p.currency)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CTAs ── */}
        <div className="space-y-4 p-6">
          {enrolled ? (
            <div className="flex items-center justify-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 py-4 text-lg font-semibold text-emerald-700">
              <CheckCircle2 className="h-6 w-6" />
              You're Enrolled — Start Learning
            </div>
          ) : selected ? (
            <>
              <Button
                size="lg"
                onClick={() => onBuyNow(selected)}
                className="
                    h-14 w-full text-base sm:text-lg font-semibold
                    bg-gradient-to-r from-blue-600 to-indigo-600
                    hover:from-blue-700 hover:to-indigo-700
                    shadow-xl shadow-blue-600/25
                    transition-all duration-300
                    hover:shadow-2xl hover:shadow-blue-600/35
                    active:scale-[0.98]
                  "
              >
                Enroll Now – Get Instant Access
                <Zap className="ml-2 h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => onAddToCart(selected)}
                disabled={isInCart(selected.id)}
                className={`
                    h-12 w-full border-2 text-base font-medium
                    ${isInCart(selected.id) ? "opacity-60" : ""}
                  `}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isInCart(selected.id) ? "Added to Cart" : "Add to Cart"}
              </Button>
            </>
          ) : null}

          <p className="text-center text-xs text-slate-500 pt-2">
            <Shield className="inline h-3.5 w-3.5 mr-1.5" />
            30-day money-back guarantee • Secure checkout
          </p>
        </div>

        {/* ── Perks List ── */}
        {/* <div className="border-t border-slate-100 px-6 py-6">
            <p className="font-poppins mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              What's Included
            </p>
            <ul className="space-y-3">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50/70">
                    <Icon className="h-4 w-4 text-blue-600" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div> */}
      </div>
    </motion.div>
  );
}
