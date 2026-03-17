"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import Navbar from "@/components/layout/Navbar";
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
// Checkout page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, getToken } = useAuth();
  const { items, removeItem, getTotal } = useCart();

  const [step, setStep] = useState<CheckoutStep>("email");
  const [isProcessing, setIsProcessing] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Pricing
  const subtotal = getTotal();
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(n);

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
  });
  const detailsForm = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
  });

  // If authenticated user lands here, skip straight to details
  useEffect(() => {
    if (user) setStep("details");
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) router.replace("/cart");
  }, [items.length, router]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    try {
      // Integrate @react-oauth/google here — useGoogleLogin() gives you the idToken.
      // const idToken = await getGoogleIdToken();
      // await apiCall("/auth/google", "POST", { idToken });
      // After success your auth store should pick up the session on next render.
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
  };

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

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setIsProcessing(true);
    try {
      await apiCall("/auth/guest-otp/verify", "POST", {
        email: guestEmail,
        code: otpCode,
      });
      // Persist for success page auto-login
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
  };

  const handleFinalCheckout = async (values: DetailsValues) => {
    setIsProcessing(true);
    const token = getToken();

    try {
      // Prefer authenticated user's email; fall back to verified guest email
      const email = user?.email ?? guestEmail;

      if (!email) {
        toast({ title: "No verified email found", variant: "destructive" });
        setStep("email");
        return;
      }

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

      // Hard redirect — Paystack takes over from here.
      // Paystack will redirect back to /checkout/success?reference=xxx on completion.
      window.location.href = res.data.paymentLink;
    } catch (err: unknown) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
    // NOTE: don't set isProcessing(false) on success — we want the spinner
    // to persist while the browser navigates away to Paystack.
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="font-inter min-h-screen bg-slate-50">
      <Navbar />
      {/* Nav */}
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
                    {/* Google */}
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full h-14 mb-6 gap-3 cursor-pointer"
                      disabled={isProcessing}
                    >
                      <Image
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png"
                        alt="Google"
                        width={22}
                        height={22}
                        unoptimized
                      />
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
                    {/* Show which email we're paying with */}
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
                      <div className="w-16 h-16 rounded-xl overflow-hidden ring-1 ring-slate-100 shrink-0">
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
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
      <Footer />
    </div>
  );
}
