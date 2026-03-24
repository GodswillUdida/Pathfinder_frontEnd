"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/store/cart.store";

export default function PaymentCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const { clearCart } = useCart();

  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );

  useEffect(() => {
    if (!orderId) {
      router.replace("/courses");
      return;
    }

    const checkOrder = async () => {
      try {
        // ⚠️ Replace this fake delay with real verification
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (data.status === "PAID") {
          setStatus("success");
          clearCart();
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    checkOrder();
  }, [orderId, router, clearCart]);

  if (status === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>

          <h1 className="text-4xl font-bold mb-3">Payment Successful!</h1>

          <p className="text-slate-600 mb-8">
            You are now enrolled. Check your email and dashboard.
          </p>

          <Button
            onClick={() => router.push("/dashboard/courses")}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          >
            Go to My Courses
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
        <p className="mt-6 text-xl font-medium">Verifying your payment...</p>
      </div>
    </div>
  );
}
