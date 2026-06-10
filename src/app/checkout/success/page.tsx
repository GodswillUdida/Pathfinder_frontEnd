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

// const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
const REDIRECT_DELAY_MS = 4000;
// const VERIFY_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerifyStatus = "verifying" | "success" | "error";

interface VerifyResponse {
  success: boolean;
  status: "success" | "pending" | "failed";
  message?: string;
}

// ---------------------------------------------------------------------------
// Inner component — must be inside Suspense (useSearchParams requirement)
// ---------------------------------------------------------------------------

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const { clearCart } = useCart();
  const { toast } = useToast();

  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prevents double-invocation in React Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    if (!reference) {
      router.replace("/cart");
      return;
    }

    if (hasRun.current) return;
    hasRun.current = true;

    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const verify = async () => {
      try {
        const res = await apiClient.get(
          `/payments/verify?reference=${encodeURIComponent(reference)}`,
        );

        console.log("Verify Payment: ", res)

        

        // const data: VerifyResponse = await res
        // if (!res.ok || !data.success || data.status !== "success") {
        //   throw new Error(data.message ?? `Payment not confirmed (${data.status})`);
        // }

        // ── Success path ──────────────────────────────────────────────────

        clearCart();
        confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 } });
        setStatus("success");

        redirectTimer = setTimeout(
          () => router.replace("/dashboard/courses"),
          REDIRECT_DELAY_MS
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        const message = err instanceof Error ? err.message : "Unexpected error";
        setErrorMsg(message);
        setStatus("error");

        toast({
          title: "Payment verification failed",
          description: `Contact support with reference: ${reference}`,
          variant: "destructive",
        });
      }
    };

    verify();

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);
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
            Verifying your payment…
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
          <p className="text-xs text-slate-400 font-mono bg-slate-100 rounded px-3 py-2">
            ref: {reference}
          </p>
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
            Payment Successful!
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

          <p className="mt-4 text-xs text-slate-400 font-mono">
            ref: {reference}
          </p>
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