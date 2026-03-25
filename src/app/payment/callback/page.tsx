"use client";
import { Suspense } from "react";
import PaymentCallbackClient from "./PaymentCallbackClient";

export default function PaymentCallbackPage() {
  // const router = useRouter();
  // const searchParams = useSearchParams();
  // const orderId = searchParams.get("orderId");
  // const { clearCart } = useCart();

  // const [status, setStatus] = useState<"processing" | "success" | "error">(
  //   "processing"
  // );

  // useEffect(() => {
  //   if (!orderId) {
  //     router.push("/courses");
  //     return;
  //   }

  // Optional: poll order status (modern UX)
  // const checkOrder = async () => {
  //   try {
  //     // You can call GET /api/orders/:id to verify status === "PAID"
  //     // For instant UX we just wait 3s (webhook is fast)
  //     await new Promise((resolve) => setTimeout(resolve, 5000));
  //     setStatus("success");
  //     clearCart(); // clear only after success
  //   } catch {
  //     setStatus("error");
  //   }
  // };

  // checkOrder();
  // }, [orderId, router, clearCart]);

  // if (status === "success") {
  //   return (
  //     <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
  //       <motion.div
  //         initial={{ scale: 0.9, opacity: 0 }}
  //         animate={{ scale: 1, opacity: 1 }}
  //         className="max-w-md text-center"
  //       >
  //         <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
  //           <CheckCircle2 className="w-12 h-12 text-emerald-600" />
  //         </div>
  //         <h1 className="font-poppins text-4xl font-bold text-slate-900 mb-3">
  //           Payment Successful!
  //         </h1>
  //         <p className="text-slate-600 mb-8">
  //           You are now enrolled. Check your email and dashboard for instant
  //           access.
  //         </p>
  //         <Button
  //           onClick={() => router.push("/dashboard/courses")}
  //           size="lg"
  //           className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
  //         >
  //           Go to My Courses
  //         </Button>
  //       </motion.div>
  //     </div>
  //   );
  // }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentCallbackClient />
    </Suspense>
  );
}
