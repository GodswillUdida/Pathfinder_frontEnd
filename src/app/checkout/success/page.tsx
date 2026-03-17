// app/checkout/success/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

// ---------------------------------------------------------------------------
// Types — must match what GET /payments/verify returns
// ---------------------------------------------------------------------------

type VerifyResponse = {
  success: boolean;
  status: "success" | "pending" | "failed";
  magicToken?: string;
  email?: string;
};

type MagicLoginResponse = {
  tokens: { accessToken: string; refreshToken: string };
  user: { id: string; name: string; email: string; role: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const { clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  type PageState = "verifying" | "logging-in" | "success" | "failed";
  const [state, setState] = useState<PageState>("verifying");

  // FIX: useRef guard prevents the effect from firing more than once.
  // Without this, any referential change in clearCart/toast (new object
  // every render) causes infinite re-execution of the effect.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!reference) {
      router.replace("/cart");
      return;
    }

    // Strict double-fire guard (also covers React 18 StrictMode in dev)
    if (hasRun.current) return;
    hasRun.current = true;

    const run = async () => {
      try {
        // ── Step 1: verify payment status (called exactly once) ────────────
        const res = await fetch(
          `${API_BASE}/payments/verify?reference=${encodeURIComponent(
            reference
          )}`,
          { method: "GET" }
        );

        // FIX: treat any non-2xx as a hard failure rather than trying to
        // parse a success out of an error response body.
        if (!res.ok) {
          throw new Error(`Verify request failed: ${res.status}`);
        }

        const data: VerifyResponse = await res.json();

        if (!data.success || data.status !== "success") {
          throw new Error("Payment not confirmed");
        }

        // Payment is confirmed — clear cart and fire confetti immediately
        clearCart();
        confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });

        // ── Step 2: auto-login guest users ─────────────────────────────────
        // Backend returns a one-time magicToken + email when the payer had
        // no account. Exchange it for a full session token.
        if (!user && data.magicToken && data.email) {
          setState("logging-in");

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
              }
            );

            if (loginRes.ok) {
              const session: MagicLoginResponse = await loginRes.json();
              // loginWithTokens should store access + refresh tokens and
              // hydrate the user state in your auth store.
              // loginWithTokens(
              //   session.tokens.accessToken,
              //   session.tokens.refreshToken
              // );
            }
            // Non-fatal if login fails — payment still succeeded
          } catch {
            // Swallow — user can log in manually from the success screen
          }
        }

        setState("success");

        // Auto-redirect after confetti has a moment to breathe
        setTimeout(() => router.replace("/dashboard"), 3000);
      } catch (err: unknown) {
        setState("failed");
        toast({
          title: "Verification failed",
          description:
            err instanceof Error ? err.message : "Please contact support",
          variant: "destructive",
        });
      }
    };

    run();
    // FIX: empty dependency array — this effect must run exactly once.
    // reference is captured via the ref guard, not as a reactive dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (state === "verifying" || state === "logging-in") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center space-y-4">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="text-xl font-medium text-slate-700">
            {state === "verifying"
              ? "Verifying your payment…"
              : "Signing you in…"}
          </p>
          <p className="text-sm text-slate-400">This only takes a moment.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <Navbar />
        <Card className="max-w-md w-full p-12 text-center space-y-6">
          <XCircle className="mx-auto h-20 w-20 text-red-500" />
          <h1 className="font-poppins text-3xl font-bold">
            Something went wrong
          </h1>
          <p className="text-slate-500 text-sm">
            Your payment may have gone through. Please{" "}
            <a
              href="mailto:support@pathfinderofficialteam@gmail.com"
              className="text-blue-600 underline"
            >
              contact support
            </a>{" "}
            with your reference:{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
              {reference}
            </code>
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </Card>
        <Footer />
      </div>
    );
  }

  // state === "success"
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-6">
      <Navbar />
      <Card className="max-w-md w-full p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle2 className="mx-auto h-24 w-24 text-emerald-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h1 className="mt-8 font-poppins text-4xl font-bold">
            Payment Successful!
          </h1>
          <p className="text-lg text-slate-600">
            Your courses are now unlocked.
          </p>

          {user ? (
            <p className="mt-6 text-emerald-600 font-medium">
              Redirecting to your dashboard…
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              <p className="text-sm text-slate-500">
                Taking you to your dashboard…
              </p>
              <Button
                onClick={() => router.push("/dashboard")}
                size="lg"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">
            Reference:{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded">
              {reference}
            </code>
          </p>
        </motion.div>
      </Card>
      <Navbar />
    </div>
  );
}
