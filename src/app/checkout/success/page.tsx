"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REDIRECT_DELAY_MS = 4000;
const POLL_INTERVAL_MS = 2000;
// FIXED: this existed only as a dead comment (`// const VERIFY_TIMEOUT_MS
// = 15_000;`) — restored as a real constant, since the polling loop below
// needs it. A single verify() call returning "pending" does not mean the
// payment failed — fulfillment is driven by a webhook that may simply not
// have arrived yet by the time Paystack redirects the browser back here.
const VERIFY_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerifyStatus = "verifying" | "success" | "error";

interface VerifyResponse {
  success: boolean;
  status: "success" | "pending" | "failed";
  message?: string;
}

/** Same helper as checkout/page.tsx — recommend moving this to a shared
 *  lib/api/errors.ts once it's duplicated a third time. Axios errors carry
 *  the backend's real message at err.response.data.message, never at
 *  err.message (which is a generic transport-level string). */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ---------------------------------------------------------------------------
// Inner component — must be inside Suspense (useSearchParams requirement)
// ---------------------------------------------------------------------------

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");
  // FIXED: the free-checkout redirect (checkout/page.tsx) sends
  // `?orderId=...&free=true` — this page previously only ever looked at
  // `reference`, so a free order's success redirect had no reference,
  // failed the `if (!reference)` guard, and bounced the user straight
  // back to /cart without ever showing success or clearing their cart.
  const isFree = searchParams.get("free") === "true";

  const { clearCart } = useCart();
  const { toast } = useToast();

  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const hasRun = useRef(false);

  useEffect(() => {
    const hasValidParams = reference || (isFree && orderId);
    if (!hasValidParams) {
      router.replace("/cart");
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const goToSuccess = () => {
      if (cancelled) return;
      clearCart();
      confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 } });
      setStatus("success");
      redirectTimer = setTimeout(() => router.replace("/dashboard/courses"), REDIRECT_DELAY_MS);
    };

    // ── FREE ORDER — already fulfilled synchronously on the backend by
    // the time this redirect happens. Nothing to verify, no Paystack
    // reference exists to check. ─────────────────────────────────────────
    if (isFree && orderId) {
      goToSuccess();
      return () => {
        cancelled = true;
        if (redirectTimer) clearTimeout(redirectTimer);
      };
    }

    // ── PAID / MIXED ORDER — poll verify until success, a real failure,
    // or the timeout. A single "pending" result is NOT a failure. ──────────
    const deadline = Date.now() + VERIFY_TIMEOUT_MS;

    const verify = async () => {
      while (!cancelled) {
        try {
          const res = await apiClient.get<VerifyResponse>(
            `/payments/verify?reference=${encodeURIComponent(reference!)}`,
          );
          const data = res as unknown as VerifyResponse;

          console.log("verify() response:", data);

          // FIXED: this check was entirely commented out — the page
          // unconditionally showed success with confetti regardless of
          // what verify actually returned, including for a failed
          // payment. A declined card would still show "Payment
          // Successful!" and redirect to the dashboard, where the course
          // simply wouldn't be there.
          if (data?.success && data?.status === "success") {
            goToSuccess();
            return;
          }

          if (data?.status === "pending") {
            if (Date.now() >= deadline) {
              if (cancelled) return;
              // Not necessarily broken — most likely a webhook delay.
              // Framed distinctly from a hard failure so the user isn't
              // told to contact support for something that may resolve
              // on its own within a couple of minutes.
              setErrorMsg(
                "Your payment is taking longer than usual to confirm. This can happen with brief delays on our end — check your dashboard in a few minutes, or contact support with the reference below if your course still isn't there.",
              );
              setStatus("error");
              return;
            }
            await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
            continue;
          }

          // status === "failed"
          throw new Error(data?.message ?? "Payment was not successful");
        } catch (err) {
          if (cancelled) return;
          const message = extractErrorMessage(err, "Unexpected error while verifying payment");
          setErrorMsg(message);
          setStatus("error");
          toast({
            title: "Payment verification failed",
            description: `Contact support with reference: ${reference}`,
            variant: "destructive",
          });
          return;
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, orderId, isFree]);
  // Intentionally minimal deps — all referenced functions are stable refs
  // captured at call-time. Including clearCart/toast/router would cause
  // re-runs on every render cycle without changing behaviour.

  // ---------------------------------------------------------------------------
  // Verifying
  // ---------------------------------------------------------------------------

  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-6 text-xl font-medium text-slate-700">
            {isFree ? "Finalizing your enrollment…" : "Verifying your payment…"}
          </p>
          <p className="text-sm text-slate-400">This usually takes a moment.</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------

  if (status === "error") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <Card className="max-w-md w-full p-12 text-center space-y-6">
          <XCircle className="mx-auto h-20 w-20 text-red-500" />
          <h1 className="font-poppins text-3xl font-bold text-slate-900">
            Verification Failed
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            {errorMsg ?? "We could not confirm your payment."}
          </p>
          {reference && (
            <p className="text-xs text-slate-400 font-mono bg-slate-100 rounded px-3 py-2">
              ref: {reference}
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.replace("/cart")} variant="outline">
              Return to Cart
            </Button>
            <Button
              onClick={() => router.push("/support")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Contact Support
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Success
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-6">
      <Card className="max-w-md w-full p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="mx-auto h-24 w-24 text-emerald-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="mt-8 font-poppins text-4xl font-bold text-slate-900">
            {isFree ? "Enrollment Complete!" : "Payment Successful!"}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Your courses are now unlocked and ready.
          </p>
          <p className="mt-8 text-emerald-600 font-medium text-sm">
            Redirecting you to your dashboard…
          </p>

          <Button
            onClick={() => router.replace("/dashboard/courses")}
            className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Go to Dashboard now
          </Button>

          {/* No reference exists for a free order — nothing to show here
              in that case rather than rendering "ref: null". */}
          {reference && (
            <p className="mt-4 text-xs text-slate-400 font-mono">
              ref: {reference}
            </p>
          )}
        </motion.div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — Suspense boundary required by Next.js App Router for useSearchParams
// ---------------------------------------------------------------------------

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}