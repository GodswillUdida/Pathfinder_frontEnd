// app/checkout/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const { clearCart } = useCart();
  const { user, loginWithEmail } = useAuth();
  const { toast } = useToast();

  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!reference) {
      router.replace("/cart");
      return;
    }

    const verifyAndLogin = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/payments/verify?reference=${reference}`
        );
        if (!res.ok) throw new Error("Verification failed");

        const data = await res.json();

        if (!data.success || data.status !== "success") {
          throw new Error("Payment not confirmed");
        }

        // Success!
        clearCart();
        confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 } });

        // Auto-login guest (from OTP flow)
        const guestEmail = localStorage.getItem("guestCheckoutEmail");
        if (guestEmail && !user) {
          await loginWithEmail(guestEmail).catch(() => {});
          localStorage.removeItem("guestCheckoutEmail");
        }

        setVerifying(false);

        // Beautiful auto-redirect
        setTimeout(() => router.replace("/dashboard"), 2400);
      } catch (err: any) {
        toast({
          title: "Payment verification failed",
          description: "Please contact support with reference: " + reference,
          variant: "destructive",
        });
        router.replace("/cart");
      }
    };

    verifyAndLogin();
  }, [reference, router, clearCart, loginWithEmail, user, toast]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-6 text-xl">
            Verifying payment &amp; creating your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center px-6">
      <Card className="max-w-md w-full p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <CheckCircle2 className="mx-auto h-24 w-24 text-emerald-600" />
        </motion.div>

        <h1 className="mt-8 font-poppins text-5xl font-bold">
          Payment Successful!
        </h1>
        <p className="mt-4 text-xl text-slate-600">
          Your courses are now unlocked.
        </p>

        <p className="mt-10 text-emerald-600 font-medium">
          Redirecting to your dashboard...
        </p>
      </Card>
    </div>
  );
}
