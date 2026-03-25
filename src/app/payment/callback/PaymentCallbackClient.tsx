"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaymentCallbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const reference = searchParams.get("reference");
    const status = searchParams.get("status");

    if (!reference) {
      router.replace("/payment/error");
      return;
    }

    // Call backend to verify payment
    const verifyPayment = async () => {
      try {
        await fetch(`/api/payment/verify?reference=${reference}`);
        router.replace("/checkout/success");
      } catch (err) {
        router.replace("/payment/error");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return <p>Verifying payment...</p>;
}
