// app/cart/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LockIcon, ShieldCheckIcon, ShoppingBag, Trash2, XIcon } from "lucide-react";
import { useCart } from "@/store/cart.store";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

const EmptyState = ({
  icon,
  title,
  subtitle,
  cta,
  onCtaClick, 
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta: string;
  onCtaClick: () => void;
}) => ( 
  <div className="flex flex-col items-center justify-center gap-6 py-20">
    {icon}
    <h2 className="text-2xl font-[Poppins] text-[#0B1628]">{title}</h2>
    <p className="font-medium text-[#6B6655]">{subtitle}</p>
    <button
      onClick={onCtaClick}
      className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-colors cursor-pointer font-[Poppins]"
    >
      {cta}
    </button>
  </div>
);


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
         <EmptyState
          icon={<ShoppingBag className="h-20 w-20" />}
          title="Your cart is empty"
          subtitle="The next chapter of your professional journey awaits."
          cta="Browse the collection"
          onCtaClick={() => router.push("/courses")}
        /> 
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] font-[Inter]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Items list */}
          <div className="lg:col-span-8">
            <h1 className="font-[Poppins] text-4xl tracking-[-2px] mb-5">
              Your
              <span className="text-blue-500 tracking-wide"> Cart</span>
            </h1>


            <div className="space-y-6">
              {items.map((item) => (
                <div
                  key={item.pricingId}
                  className="flex gap-6 items-center p-2 border border-gray-500 rounded-2xl hover:shadow-[0_10px_30px_-10px_rgb(200,151,58,0.15)] transition-all duration-300 bg-white"
                >
                  {/* Thumbnail */}
                  {item.thumbnail && (
                    <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden ring-1 ring-[#EDE6D9]">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        width={150}
                        height={150}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="font-semibold text-md leading-tight text-[#0B1628]">
                      {item.title}
                    </p>
                    {/* Example meta — replace with real item fields if added to store */}
                    {/* <p className="mt-3 font-medium text-sm">
                      {fmt(item.price)} × {item.quantity}
                    </p> */}
                    
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-md text-[#0B1628]">
                      {fmt(item.price * item.quantity)}
                    </p>
                    {/* <p className="font-semibold text-md text-[#0B1628]">
                     Save for later
                    </p> */}
                    <button
                      onClick={() => removeItem(item.pricingId)}
                      className="mt-4 text-red-600 hover:text-red-500 transition-colors text-sm cursor-pointer border hover:border-red-500 px-2 py-1 rounded-md"
                    >
                      Remove
                      {/* <XIcon className="h-5 w-5" /> */}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#EDE6D9] rounded-3xl p-8 shadow-[0_10px_40px_-15px_rgb(11,22,40,0.1)] sticky top-8">
              <h2 className="font-[Inter] text-2xl tracking-[-1px] text-[#0B1628] mb-8">
                Order Summary
              </h2>

              <div className="space-y-6">
                <div className="flex justify-between items-baseline text-sm">
                  <span className="font-medium">
                    {items.length} {items.length === 1 ? "course" : "courses"}
                  </span>
                  <span className="tabular-nums font-medium text-[#0B1628]">
                    {fmt(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="font-medium">Discount</span>
                  <span className="text-[#6B6655]">—</span>
                </div>

                <div className="h-px bg-[#EDE6D9]" />

                <div className="flex justify-between items-baseline">
                  <span className="font-[Poppins] text-xl tracking-[-1.5px] text-[#0B1628]">
                    Total
                  </span>
                  <span className="font-display text-2xl tracking-[-1.5px] text-[#0B1628] tabular-nums">
                    {fmt(subtotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToCheckout}
                className="mt-10 w-full px-4 py-3 rounded-2xl text-md font-semibold bg-white hover:bg-blue-500 hover:text-white border border-2 border-blue-500 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout
                <span className="text-2xl leading-none hover:translate-x-1 transition-transform">→</span>
              </button>

              <p className="text-xs mt-2 font-medium text-[#6B6655]">
                You won't be charged yet
              </p>

             <div className="h-px bg-gray-400 my-4" />

              <button
                onClick={clearCart}
                className="mt-6 w-full text-blue-600 font-medium text-sm transition-colors cursor-pointer px-4 py-2 rounded-md flex items-center justify-center gap-2 border border-2 border-blue-500 bg-blue-500 text-white hover:bg-white hover:text-blue-500"
              >
                Apply Coupon
              </button>
              {/* <button
                onClick={clearCart}
                className="mt-6 w-full text-red-600 hover:text-red-600 font-medium text-sm transition-colors cursor-pointer bg-[#EDE6D9]/70 px-4 py-2 rounded-md flex items-center justify-center gap-2"
              >
                Clear entire cart
              </button> */}

              <div className="flex items-center justify-center gap-1.5 mt-8 text-xs text-[#6B6655]">
                <span className="flex items-center gap-1 text-blue-500">
                 <LockIcon className="h-4 w-4" />  
                  Secure checkout</span>
                <span className="w-px h-3 bg-[#EDE6D9]" />
                <span className="flex items-center gap-1 text-blue-500">
                  <ShieldCheckIcon className="h-4 w-4" />
                  SSL encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}