"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, ArrowLeft, Trash2, Loader2, Mail } from "lucide-react";

import { useCart } from "@/store/cart.store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
// import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CheckoutStep = "email" | "otp" | "details";

const emailSchema = z.object({
  email: z.string().email("Valid email is required"),
});

const detailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

type EmailValues = z.infer<typeof emailSchema>;
type DetailsValues = z.infer<typeof detailsSchema>;

// ---------------------------------------------------------------------------
// Stable module-level formatter — created ONCE, never recreated on re-render
// ---------------------------------------------------------------------------

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmt = (n: number) => NGN.format(Math.round(n));

// ---------------------------------------------------------------------------
// API helper
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

async function apiCall<T = unknown>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "POST",
  body?: unknown,
  token?: string | null
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });

  const data = await res.json().catch(() => ({ message: "Request failed" }));
  if (!res.ok) throw new Error(data.message ?? res.statusText);
  return data as T;
}

// ---------------------------------------------------------------------------
// Google SVG — inline, zero network request, no <Image> lifecycle issues
// ---------------------------------------------------------------------------

function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Item thumbnail — plain <img> with explicit dimensions to avoid Next.js
// Image aspect-ratio warnings for external URLs of unknown dimensions.
// Falls back gracefully if the URL is broken.
// ---------------------------------------------------------------------------

function ItemThumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-slate-100 shrink-0 bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={64}
        height={64}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Hide broken image gracefully
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Checkout page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, getToken } = useAuth();
  const { items, removeItem, getTotal } = useCart();

  const [step, setStep] = useState<CheckoutStep>(() =>
    // Initialise from user state synchronously — avoids the useEffect
    // flash that was causing a re-render cycle on the "details" step.
    // This runs once at mount; subsequent user changes handled below.
    typeof window !== "undefined" && user ? "details" : "email"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Stable subtotal — only recomputes when items array changes
  const subtotal = useMemo(() => getTotal(), [getTotal, items]);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  });
  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
  });

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Only advance to "details" if we're still on "email" or "otp" —
  // never re-trigger once already there. Prevents re-render loops.
  useEffect(() => {
    if (user && step !== "details") setStep("details");
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // `step` intentionally omitted — adding it creates a circular dependency.
  // The guard `step !== "details"` makes this safe.

  // Redirect if cart is empty — but ONLY before checkout has been initiated.
  // Once isProcessing is true (Paystack redirect in progress), don't interrupt.
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.replace("/cart");
    }
  }, [items.length, isProcessing, router]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1_000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ---------------------------------------------------------------------------
  // Handlers — all stable via useCallback
  // ---------------------------------------------------------------------------

  const handleGoogleLogin = useCallback(async () => {
    setIsProcessing(true);
    try {
      // Integrate @react-oauth/google here — useGoogleLogin() gives you the idToken.
      // const idToken = await getGoogleIdToken();
      // await apiCall("/auth/google", "POST", { idToken });
      toast({ title: "Connect @react-oauth/google SDK to enable this." });
    } catch (err: unknown) {
      toast({
        title: "Google login failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleSendOtp = useCallback(
    async (email: string) => {
      setIsProcessing(true);
      try {
        await apiCall("/auth/guest-otp/send", "POST", { email });
        setGuestEmail(email);
        setStep("otp");
        setResendTimer(60);
        toast({ title: "OTP sent — check your inbox" });
      } catch (err: unknown) {
        toast({
          title: "Failed to send OTP",
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [toast]
  );

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length !== 6) return;
    setIsProcessing(true);
    try {
      await apiCall("/auth/guest-otp/verify", "POST", {
        email: guestEmail,
        code: otpCode,
      });
      sessionStorage.setItem("guestCheckoutEmail", guestEmail);
      setStep("details");
      toast({ title: "Email verified" });
    } catch (err: unknown) {
      toast({
        title: "Invalid OTP",
        description:
          err instanceof Error ? err.message : "Check the code and try again",
        variant: "destructive",
      });
      setOtpCode("");
    } finally {
      setIsProcessing(false);
    }
  }, [otpCode, guestEmail, toast]);

  const handleFinalCheckout = useCallback(
    async (values: DetailsValues) => {
      const email = user?.email ?? guestEmail;

      // Guard must happen BEFORE setIsProcessing to avoid stuck loading state
      if (!email) {
        toast({ title: "No verified email found", variant: "destructive" });
        setStep("email");
        return;
      }

      setIsProcessing(true);
      const token = getToken();

      try {
        const res = await apiCall<{ data: { paymentLink: string } }>(
          "/payments/paystack/initialize",
          "POST",
          {
            email,
            name: values.name,
            phone: values.phone,
            items: items.map((i) => ({
              pricingId: i.pricingId,
              quantity: i.quantity,
            })),
          },
          token
        );

        // Hard redirect — keep spinner alive while browser navigates to Paystack
        window.location.href = res.data.paymentLink;
      } catch (err: unknown) {
        toast({
          title: "Checkout failed",
          description: err instanceof Error ? err.message : "Please try again",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    },
    [user, guestEmail, getToken, items, toast]
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="font-inter min-h-screen bg-slate-50">
      {/* <Navbar /> */}

      {/* Sticky sub-nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/cart")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Cart
          </Button>
          <span className="font-poppins text-2xl font-bold tracking-tight">
            Secure Checkout
          </span>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Lock className="h-4 w-4" /> 256-bit SSL
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* ── LEFT: Auth / details ── */}
          <div className="flex-1">
            <Card className="p-10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-poppins text-3xl font-semibold">
                  Checkout
                </h2>
                <div className="flex items-center gap-2 text-emerald-600">
                  <Shield className="h-5 w-5" /> Bank-level security
                </div>
              </div>

              <AnimatePresence mode="wait">
                {/* STEP 1 — email capture */}
                {step === "email" && (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full h-14 mb-6 gap-3 cursor-pointer"
                      disabled={isProcessing}
                    >
                      <GoogleIcon />
                      Continue with Google (fastest)
                    </Button>

                    <div className="my-6 flex items-center gap-4">
                      <Separator className="flex-1" />
                      <span className="text-xs text-slate-400 tracking-widest">
                        OR CONTINUE AS GUEST
                      </span>
                      <Separator className="flex-1" />
                    </div>

                    <Form {...emailForm}>
                      <form
                        onSubmit={emailForm.handleSubmit((v) =>
                          handleSendOtp(v.email)
                        )}
                        className="space-y-6"
                      >
                        <FormField
                          control={emailForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="you@example.com"
                                  autoComplete="email"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="submit"
                          size="lg"
                          disabled={isProcessing}
                          className="w-full h-14"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            "Send 6-digit code"
                          )}
                        </Button>
                      </form>
                    </Form>
                  </motion.div>
                )}

                {/* STEP 2 — OTP verification */}
                {step === "otp" && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8 text-center"
                  >
                    <Mail className="mx-auto h-16 w-16 text-blue-500" />
                    <div>
                      <h3 className="text-2xl font-semibold mb-2">
                        Enter verification code
                      </h3>
                      <p className="text-slate-500">
                        Sent to <strong>{guestEmail}</strong>{" "}
                        <button
                          type="button"
                          className="text-blue-600 text-sm underline ml-1"
                          onClick={() => setStep("email")}
                        >
                          Change
                        </button>
                      </p>
                    </div>

                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) =>
                        setOtpCode(e.target.value.replace(/\D/g, ""))
                      }
                      className="text-center text-5xl tracking-[16px] font-mono h-20 max-w-xs mx-auto"
                      placeholder="000000"
                      autoFocus
                    />

                    <Button
                      onClick={handleVerifyOtp}
                      disabled={isProcessing || otpCode.length !== 6}
                      size="lg"
                      className="w-full h-14 cursor-pointer"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        "Verify code"
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={resendTimer > 0 || isProcessing}
                      onClick={() => handleSendOtp(guestEmail)}
                      className="cursor-pointer"
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend code"}
                    </Button>
                  </motion.div>
                )}

                {/* STEP 3 — details + pay */}
                {step === "details" && (
                  <motion.div
                    key="details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-6 flex items-center gap-3 rounded-lg bg-slate-50 border px-4 py-3 text-sm text-slate-600">
                      <Mail className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>
                        Paying as{" "}
                        <strong className="text-slate-900">
                          {user?.email ?? guestEmail}
                        </strong>
                      </span>
                    </div>

                    <Form {...detailsForm}>
                      <form
                        onSubmit={detailsForm.handleSubmit(handleFinalCheckout)}
                        className="space-y-6"
                      >
                        <FormField
                          control={detailsForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  autoComplete="name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={detailsForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone number (optional)</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="+234 801 234 5678"
                                  autoComplete="tel"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          size="lg"
                          disabled={isProcessing}
                          className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-3" />
                              Redirecting to Paystack...
                            </>
                          ) : (
                            `Pay ${fmt(subtotal)} with Paystack`
                          )}
                        </Button>

                        <p className="text-center text-xs text-slate-400">
                          Powered by Paystack · Instant access after payment ·
                          100% secure
                        </p>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* ── RIGHT: Order summary ── */}
          <div className="lg:w-[380px]">
            <Card className="p-8 sticky top-8 shadow-xl">
              <h3 className="font-poppins text-2xl font-semibold mb-8">
                Order summary
              </h3>

              <div className="space-y-6">
                {items.map((item) => (
                  <motion.div
                    key={item.pricingId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex gap-4"
                  >
                    {item.thumbnail && (
                      <ItemThumbnail src={item.thumbnail} alt={item.title} />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-snug line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {fmt(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex flex-col justify-between shrink-0">
                      <p className="font-semibold text-sm">
                        {fmt(item.price * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.pricingId)}
                        className="text-red-400 hover:text-red-600 h-auto p-0 cursor-pointer"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="text-xl">{fmt(subtotal)}</span>
                </div>
              </div>

              <div className="mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Your data is encrypted and
                protected
              </div>
            </Card>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
