// app/checkout/success/page.tsx
"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
const REDIRECT_DELAY_MS = 2500;
const VERIFY_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerifyStatus = "idle" | "verifying" | "success" | "error";

interface VerifyResponse {
  success: boolean;
  status: "success" | "failed" | "pending";
  message?: string;
  magicToken?: string; // add these
  email?: string;
}

interface MagicLoginResponse {
  success: boolean;
  tokens: { accessToken: string; refreshToken: string };
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

// ---------------------------------------------------------------------------
// Inner component — uses useSearchParams (must be inside Suspense)
// ---------------------------------------------------------------------------

function SuccessInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const { clearCart } = useCart();
  const { user, loadProfile } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Guards against double-invocation (React Strict Mode, re-renders)
  const hasRun = useRef(false);

  useEffect(() => {
    // ── Guard: no reference → bail immediately
    if (!reference) {
      router.replace("/cart");
      return;
    }

    // ── Idempotency: only run once per mount
    if (hasRun.current) return;
    hasRun.current = true;

    const controller = new AbortController();
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const verifyPayment = async () => {
      try {
        const encodedRef = encodeURIComponent(reference);
        console.log("Verifying payment with reference:", encodedRef);

        const res = await fetch(
          `${API_BASE}/payments/verify?reference=${encodeURIComponent(
            reference
          )}`,
          {
            // headers: {
            //   ...(user ? {} : {}), // token injected by your auth interceptor if present
            // },
            credentials: "include",

            signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
          }
        );

        // if (!res.ok) throw new Error("Verification failed");

        if (!res.ok) {
          // 404 → order not found; 402 → payment not completed, etc.
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            (errData as { message?: string }).message ??
              `Verification returned ${res.status}`
          );
        }

        const data: VerifyResponse = await res.json();

        if (!data.success || data.status !== "success") {
          throw new Error(data.message ?? "Payment not confirmed by provider");
        }

        // ── SUCCESS PATH ──────────────────────────────────────────────────

        // 1. Clear cart ONLY after confirmed success
        clearCart();

        // 2. Confetti 🎉
        confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 } });

        // 3. Auto-login guest (OTP flow stored in sessionStorage, not localStorage)
        //    sessionStorage is tab-scoped and wiped on tab close — safer for
        //    transient auth hints than localStorage.
        //  const guestEmail = sessionStorage.getItem("guestCheckoutEmail");
        //  if (guestEmail && !user) {
        // try {
        //     //  await loginWithEmail(guestEmail);
        //    } catch {
        //       // Non-fatal: user can log in manually from dashboard
        //    } finally {
        //      sessionStorage.removeItem("guestCheckoutEmail");
        //    }
        //  }

        // if (!user && data.magicToken && data.email) {
        //   try {
        //     const loginRes = await fetch(
        //       `${API_BASE}/auth/magic-login/verify`,
        //       {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({
        //           email: data.email,
        //           token: data.magicToken,
        //         }),
        //       }
        //     );
        //     if (loginRes.ok) {
        //       // const session = await loginRes.json();
        //       const session: MagicLoginResponse = await loginRes.json();
        //       // loginWithTokens(
        //       //   session.tokens.accessToken,
        //       //   session.tokens.refreshToken
        //       // );
        //     }
        //   } catch {
        //     /* non-fatal */
        //   }
        // }

        if (!user && data.magicToken && data.email) {
          try {
            const loginRes = await fetch(
              `${API_BASE}/auth/magic-login/verify`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: data.email,
                  token: data.magicToken,
                }),
                credentials: "include", // ← CRITICAL
              }
            );

            if (loginRes.ok) {
              // Backend already set cookies. Now hydrate React context.
              await loadProfile(); // ← THIS WAS THE FIX
            }
          } catch (e) {
            console.warn("Magic login failed but payment succeeded", e);
            // Non-fatal – user can still click "Go to Dashboard"
          }
        }

        sessionStorage.removeItem("guestCheckoutEmail");
        setStatus("success");

        // 4. Redirect after giving the user time to read the success state
        redirectTimer = setTimeout(
          () => router.replace("/dashboard/courses"),
          REDIRECT_DELAY_MS
        );
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Component unmounted — do nothing
          return;
        }

        const message =
          err instanceof Error ? err.message : "Unexpected error occurred";

        setErrorMsg(message);
        setStatus("error");

        toast({
          title: "Payment verification failed",
          description: `Please contact support with reference: ${reference}`,
          variant: "destructive",
        });
      }
    };

    verifyPayment();

    // return () => {};

    // verifyPayment();

    // Cleanup: cancel in-flight request + pending redirect on unmount
    return () => {
      controller.abort();
      if (redirectTimer) clearTimeout(redirectTimer);
    };
    // Intentionally minimal deps — `reference` is stable from URL params.
    // Including unstable callbacks (clearCart, toast, etc.) would cause
    // re-runs. All referenced functions are captured at call-time safely.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, clearCart, toast, user, router]);

  // ---------------------------------------------------------------------------
  // Render: verifying
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
  // Render: error
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
  // Render: success
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

          {/* Manual escape hatch in case redirect fires too fast / fails */}
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
// Page export — wraps inner component in Suspense (required by Next.js
// App Router when using useSearchParams inside a Client Component)
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
