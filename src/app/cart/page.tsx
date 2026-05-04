// app/cart/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, XIcon } from "lucide-react";
import { useCart } from "@/store/cart.store";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
// import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, clearCart, getTotal } = useCart();

  const subtotal = getTotal();

  const fmt = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF7F0]">
        <Navbar />
        {/* <EmptyState
          icon={<ShoppingBag className="h-20 w-20 text-[#C8973A]/30" />}
          title="Your cart is empty"
          subtitle="The next chapter of your professional journey awaits."
          cta="Browse the collection"
          onCtaClick={() => router.push("/courses")}
        /> */}  
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#] font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Items list */}
          <div className="lg:col-span-8">
            <h1 className="font-[Inter] text-4xl tracking-[-2px] text-[#0B1628] mb-10">
              Your Cart
            </h1>

            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.pricingId}
                  className="flex gap-6 items-center p-6 border border-[#EDE6D9] rounded-2xl hover:border-[#C8973A]/30 hover:shadow-[0_10px_30px_-10px_rgb(200,151,58,0.15)] transition-all duration-300 bg-white"
                >
                  {/* Thumbnail */}
                  {item.thumbnail && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden ring-1 ring-[#EDE6D9]">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="font-semibold text-xl leading-tight text-[#0B1628]">
                      {item.title}
                    </p>
                    {/* Example meta — replace with real item fields if added to store */}
                    <p className="mt-3 text-[#6B6655]">
                      {fmt(item.price)} × {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-xl text-[#0B1628]">
                      {fmt(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.pricingId)}
                      className="mt-4 text-red-400 hover:text-red-600 transition-colors text-sm cursor-pointer bg-[#EDE6D9]/70 px-2 py-1 rounded-md"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#EDE6D9] rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgb(11,22,40,0.1)] sticky top-8">
              <h2 className="font-[Inter] text-3xl tracking-[-1px] text-[#0B1628] mb-8">
                Order Summary
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="text-[#6B6655]">
                    {items.length} {items.length === 1 ? "course" : "courses"}
                  </span>
                  <span className="tabular-nums font-medium text-[#0B1628]">
                    {fmt(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#6B6655]">Discount</span>
                  <span className="text-[#6B6655]">—</span>
                </div>

                <div className="h-px bg-[#EDE6D9]" />

                <div className="flex justify-between items-baseline">
                  <span className="font-display text-2xl tracking-[-1.5px] text-[#0B1628]">
                    Total
                  </span>
                  <span className="font-display text-2xl tracking-[-1.5px] text-[#0B1628] tabular-nums">
                    {fmt(subtotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="mt-10 w-full px-6 py-4 bg-blue-500 text-white rounded-2xl text-md font-semibold hover:bg-blue-600 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout
                <span className="text-2xl leading-none">→</span>
              </button>

              <button
                onClick={clearCart}
                className="mt-6 w-full text-red-400 hover:text-red-600 font-medium text-sm transition-colors cursor-pointer bg-[#EDE6D9]/70 px-4 py-2 rounded-md flex items-center justify-center gap-2"
              >
                Clear entire cart
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-8 text-xs text-[#6B6655]">
                <span>Secure checkout</span>
                <span className="w-px h-3 bg-[#EDE6D9]" />
                <span>SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}