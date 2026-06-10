"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Shield, Lock, ArrowLeft, Trash2, Loader2, Mail, PhoneOffIcon } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const detailsSchema = z.object({
  phone: z.string().optional(),
});

type DetailsValues = z.infer<typeof detailsSchema>;

// ---------------------------------------------------------------------------
// Formatter — module-level, never recreated
// ---------------------------------------------------------------------------

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const fmt = (n: number) => NGN.format(Math.round(n));

// ---------------------------------------------------------------------------
// API client
// ---------------------------------------------------------------------------

// const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

// async function apiPost<T = unknown>(endpoint: string, body: unknown): Promise<T> {
//   const res = await fetch(`${API_BASE}${endpoint}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(body),
//     credentials: "include",
//     signal: AbortSignal.timeout(30_000),
//   });
//   const data = await res.json().catch(() => ({ message: "Request failed" }));
//   if (!res.ok) throw new Error((data as { message?: string }).message ?? res.statusText);
//   return data as T;
// }

// ---------------------------------------------------------------------------
// Sub-components
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
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const { user, hydrated, isAuthenticated } = useAuth();
  const { items, removeItem, getTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = useMemo(() => getTotal(), [getTotal, items]);

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { phone: "" },
  });

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------

  // Wait for auth hydration, then redirect unauthenticated users to magic link
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      // Preserve the intended destination so the auth page can redirect back
      router.replace(`/auth/login?redirect=/checkout`);
      toast.success("Please log in to proceed to checkout");
    }
  }, [hydrated, isAuthenticated, router]);

  // Redirect on empty cart (but not mid-payment redirect)
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      toast.info("Your cart is empty.");
      router.replace("/cart");
    }
  }, [items.length, isProcessing, router]);

  // ---------------------------------------------------------------------------
  // Checkout handler
  // ---------------------------------------------------------------------------

  const handleCheckout = useCallback(
    async (values: DetailsValues) => {
      // Should never be null here — auth guard above ensures user is set
      // if (!user?.email) {
      //   toast.error("Session expired. Please log in again.")
      //   router.replace("/auth/login?redirect=/checkout");
      //   return;
      // }

      setIsProcessing(true);
      try {
        // ✅ 1. Create order first
        const orderRes = await apiClient.post<{ data: { id: string } }>("/orders", {
          items: items.map((i) => ({
            pricingId: i.pricingId,
            quantity: i.quantity,
          })),
          phone: values.phone ?? undefined,
        });

        const orderId = orderRes.data.id;

        const res = await apiClient.post<{ data: { paymentLink: string } }>(
          "/payments/paystack/initialize",
          {
            orderId,
          }
        );

        console.log("Checkout Response: ", res.data.paymentLink)
        const paymentLink = res.data.paymentLink
        // Keep spinner alive during Paystack redirect
        window.location.href  = paymentLink
      } catch (err: any) {
        toast.error(err.message)
        console.log("Checkout Error: ", err)
        setIsProcessing(false);
      }
    },
    [user, items, toast, router]
  );

  // ---------------------------------------------------------------------------
  // Loading — block render until auth state is resolved
  // ---------------------------------------------------------------------------

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="font-inter min-h-screen bg-slate-50">
      {/* Sticky sub-nav */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/cart")}
            className="gap-2"
            disabled={isProcessing}
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
          {/* ── LEFT: Payment details ── */}
          <div className="flex-1">
            <Card className="p-10 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-poppins text-3xl font-semibold">Checkout</h2>
                <div className="flex items-center gap-2 text-emerald-600">
                  <Shield className="h-5 w-5" /> Bank-level security
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Identity banner — always shown, never editable */}
                <div className="mb-6 flex items-center gap-3 rounded-lg bg-slate-50 border px-4 py-3 text-sm text-slate-600">
                  <Mail className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>
                    Paying as{" "}
                    <strong className="text-slate-900">{user?.email}</strong>
                  </span>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleCheckout)}
                    className="space-y-6"
                  >
                    {/* Name — read-only, sourced from profile */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        Full name
                      </label>
                      <div className="h-10 px-3 py-2 rounded-md border bg-slate-50 text-slate-700 text-sm flex items-center">
                        {user?.name}
                      </div>
                    </div>

                    {/* Phone — optional, editable */}
                    <FormField
                      control={form.control}
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
                      className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-3" />
                          Redirecting to Paystack…
                        </>
                      ) : (
                        `Pay ${fmt(subtotal)} with Paystack`
                      )}
                    </Button>

                    <p className="text-center text-xs text-slate-400">
                      Powered by Paystack · Instant access after payment · 100% secure
                    </p>
                  </form>
                </Form>
              </motion.div>
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
                        disabled={isProcessing}
                        className="text-red-400 hover:text-red-600 h-auto p-0"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-xl">{fmt(subtotal)}</span>
              </div>

              <div className="mt-6 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" /> Your data is encrypted and protected
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}