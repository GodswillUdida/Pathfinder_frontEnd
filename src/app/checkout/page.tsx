"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { ArrowLeft, Lock, ShieldCheck, Loader2, Mail } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

const detailsSchema = z.object({
  phone: z.string().optional(),
});

type DetailsValues = z.infer<typeof detailsSchema>;

interface OrderResponse {
  id: string;
}

/**
 * Matches payment.service.ts's InitiatePaymentResult exactly.
 * requiresPayment is the branch signal — a fully-free order is already
 * fulfilled by the time this response arrives; there is no paymentLink
 * to redirect to, and trying to do so unconditionally (as this page
 * previously did) sends the browser to `window.location.href = undefined`.
 */
interface InitializePaymentResponse {
  requiresPayment: boolean;
  orderId: string;
  paymentLink?: string;
  reference?: string;
}

type CheckoutStage = "idle" | "creating-order" | "finalizing";

// ---------------------------------------------------------------------------
// Formatter
// ---------------------------------------------------------------------------

const NGN = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fmt = (n: number) => NGN.format(Math.round(n));

/**
 * Axios error responses carry the backend's actual error envelope at
 * err.response.data (`{ success: false, message, code?, details? }`) —
 * `err.message` on an AxiosError is a generic transport-level string
 * ("Request failed with status code 400"), never the backend's real
 * message. Reading only `err.message` (as this page previously did)
 * meant every validation error — "Order expired", "A course with this
 * code already exists", "Order is not payable" — was invisible to the
 * user; they only ever saw a generic HTTP status message.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CheckoutPage() {
  const router = useRouter();
  const { user, hydrated, isAuthenticated } = useAuth();
  const { items, getTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState<CheckoutStage>("idle");

  const subtotal = useMemo(() => getTotal(), [getTotal]);

  const form = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { phone: "" },
  });

  // ---------------------------------------------------------------------------
  // Guards
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/auth/login?redirect=/checkout`);
      toast.success("Please log in to proceed to checkout");
    }
  }, [hydrated, isAuthenticated, router]);

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
      setIsProcessing(true);
      setStage("creating-order");

      try {
        const orderRes = await apiClient.post<OrderResponse>("/orders", {
          items: items.map((i) => ({
            pricingId: i.pricingId,
            quantity: i.quantity,
          })),
          phone: values.phone || undefined,
        });

        const orderId = orderRes.data?.id;
        if (!orderId) {
          throw new Error("Unable to create order. Please try again.");
        }

        setStage("finalizing");

        const paymentRes = await apiClient.post<InitializePaymentResponse>(
          "/payments/paystack/initialize",
          { orderId },
        );

        const result = paymentRes.data;
        if (!result) {
          throw new Error("Unable to start checkout. Please try again.");
        }

        // FIXED: previously always did `window.location.href = res.data!.paymentLink`
        // unconditionally. A free order has no paymentLink at all —
        // fulfillment already happened synchronously on the backend by the
        // time this response arrives. Redirecting externally to Paystack
        // for a ₦0 order doesn't just fail, it's the wrong flow entirely:
        // there's nothing left to pay for.
        if (!result.requiresPayment) {
          clearCart();
          toast.success("Enrollment complete — you're all set!");
          router.push(`/checkout/success?orderId=${result.orderId}&free=true`);
          return;
        }

        if (!result.paymentLink) {
          throw new Error("Payment session could not be created. Please try again.");
        }

        window.location.href = result.paymentLink;
      } catch (err: unknown) {
        toast.error(extractErrorMessage(err, "Something went wrong. Please try again."));
        setIsProcessing(false);
        setStage("idle");
      }
    },
    [items, router],
  );

  // ---------------------------------------------------------------------------
  // Loading state while auth hydrates
  // ---------------------------------------------------------------------------

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf9]">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const buttonLabel =
    stage === "creating-order"
      ? "Creating your order…"
      : stage === "finalizing"
        ? "Finalizing…"
        : `Pay ${fmt(subtotal)}`;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#fafaf9] text-slate-900">
      {/* Minimal top bar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => router.push("/cart")}
            disabled={isProcessing}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 opacity-50 cursor-pointer *:disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </button>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Secure checkout
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-14">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Review your order and complete payment
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          {/* Left — details + pay */}
          <div className="min-w-0 flex-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              {/* Identity */}
              <div className="mb-8">
                <h2 className="text-sm font-medium text-slate-900">Account</h2>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
                  <Mail
                    className="h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {user?.email}
                    </p>
                    {user?.name && (
                      <p className="truncate text-xs text-slate-500">
                        {user.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleCheckout)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-slate-900">
                          Phone number{" "}
                          <span className="font-normal text-slate-400">
                            (optional)
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+234 801 234 5678"
                            autoComplete="tel"
                            className="h-11"
                            disabled={isProcessing}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-slate-500">
                          Used only for order updates and receipts.
                        </p>
                      </FormItem>
                    )}
                  />

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3.5 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {buttonLabel}
                      </>
                    ) : (
                      <>{subtotal > 0 ? `Pay ${fmt(subtotal)}` : "Enroll for free"}</>
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500">
                    {subtotal > 0
                      ? "You will be redirected to Paystack to complete payment securely. Access is granted immediately after successful payment."
                      : "This order is free — access is granted immediately, no payment required."}
                  </p>
                </form>
              </Form>
            </div>
          </div>

          {/* Right — order summary */}
          <aside
            className="w-full shrink-0 lg:sticky lg:top-8 lg:w-[340px]"
            aria-label="Order summary"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">
                Order summary
              </h2>

              <ul className="mt-5 space-y-4">
                {items.map((item) => (
                  <li key={item.pricingId} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-snug text-slate-900 line-clamp-2">
                        {item.title}
                      </p>
                      {/* NOTE: the backend now hard-rejects any order item
                          with quantity !== 1 (Enrollment can only ever be
                          one-per-course — no multi-seat model exists). If
                          your cart page lets someone increment a course's
                          quantity above 1, checkout will fail with a 400
                          the moment they do. Worth removing that control
                          for course items if it exists. */}
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.price > 0 ? fmt(item.price) : "Free"}
                        {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium tabular-nums text-slate-900">
                      {item.price > 0 ? fmt(item.price * item.quantity) : "Free"}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="my-5 h-px bg-slate-100" />

              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-900">
                  Total
                </span>
                <span className="text-xl font-semibold tabular-nums text-slate-900">
                  {subtotal > 0 ? fmt(subtotal) : "Free"}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                {subtotal > 0 ? "Encrypted payment via Paystack" : "No payment required"}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}