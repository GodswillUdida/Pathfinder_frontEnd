// app/auth/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AuthCallback() {
  const router = useRouter();
  // const {  } = useAuth(); // ← you will add this below
  const [status, setStatus] = useState<"loading" | "error">("loading");

  // const token = window.location.hash.split("=")[1];

  // if (token) {
  //   localStorage.setItem("access_token", token);
  // }

  useEffect(() => {
    const completeAuth = async () => {
      try {
        // await loadProfile(); // fetches /auth/me using httpOnly cookie
        toast.success("Welcome! Signed in with Google 🎉");
        router.push("/dashboard"); // or /courses, wherever your home is
      } catch (err) {
        console.error(err);
        toast.error("Failed to complete Google sign-in. Please try again.");
        router.push("/auth/login");
      }
    };

    completeAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0d1117]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-12 h-12 mx-auto mb-6 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Completing Google sign-in...
        </p>
        <p className="text-slate-400 text-sm mt-2">
          You will be redirected automatically
        </p>
      </motion.div>
    </div>
  );
}
