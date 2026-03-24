// app/cart/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart.store";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function CartPage() {
  const router = useRouter();
  // const { toast } = useToast();
  const { items, removeItem, clearCart, getTotal } = useCart();

  const subtotal = getTotal();

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  // Auto-redirect only if someone manually clears (optional UX)
  useEffect(() => {
    if (items.length === 0) return;
  }, [items.length]);

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        {/* <Navbar /> */}
        <div className="text-center max-w-md">
          <ShoppingBag className="mx-auto h-20 w-20 text-slate-300" />
          <h2 className="mt-8 text-4xl font-poppins font-bold">
            Your cart is empty
          </h2>
          <p className="mt-3 text-slate-500 text-lg">
            Ready to start learning?
          </p>
          <Button
            onClick={() => router.push("/courses")}
            size="lg"
            className="mt-10 h-14 text-lg"
          >
            Browse Courses
          </Button>
        </div>
        {/* <Footer /> */}
      </div>
    );
  }

  return (
    <div className="font-inter min-h-screen bg-slate-50">
      {/* <Navbar /> */}
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-5 w-5" /> Back
            </Button>
            <div className="font-poppins text-3xl font-bold tracking-tight">
              Cart
            </div>
          </div>
          <div className="text-sm text-slate-500">({items.length} items)</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-8">
            <h1 className="font-poppins text-4xl font-semibold">Your Orders</h1>

            {items.map((item, i) => (
              <motion.div
                key={item.pricingId}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-6 bg-white p-8 rounded-3xl shadow-sm border"
              >
                {item.thumbnail && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 ring-1 ring-slate-100">
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      width={128}
                      height={128}
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xl leading-tight">
                    {item.title}
                  </p>
                  <p className="text-slate-500 mt-2">
                    {fmt(item.price)} × {item.quantity}
                  </p>
                </div>

                <div className="text-right flex flex-col justify-between">
                  <p className="font-bold text-xl">
                    {fmt(item.price * item.quantity)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.pricingId)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-4">
            <Card className="p-8 sticky top-8">
              <h3 className="font-poppins text-2xl font-semibold mb-8">
                Order Summary
              </h3>

              <div className="space-y-6">
                <div className="flex justify-between text-lg">
                  <span className="text-slate-600">Subtotal</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-2xl font-semibold">
                  <span>Total</span>
                  <span>{fmt(subtotal)}</span>
                </div>
              </div>

              <Button
                onClick={handleProceedToCheckout}
                size="lg"
                className="w-full h-16 mt-10 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                Proceed to Secure Checkout
              </Button>

              <Button
                variant="link"
                onClick={clearCart}
                className="mt-4 w-full text-red-500 hover:text-red-600"
              >
                Clear entire cart
              </Button>
            </Card>
          </div>
        </div>
      </div>
      {/* <Footer /> */}
    </div>
  );
}
