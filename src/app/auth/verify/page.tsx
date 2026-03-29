// app/auth/verify/page.tsx
import { Suspense } from "react";
import { VerifyClient } from "./VerifyClient";

// This is now a **Server Component** (no "use client")
export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoadingFallback />}>
      <VerifyClient />
    </Suspense>
  );
}

// Simple loading fallback (matches your UI style)
function VerifyLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0d1117]">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400">
          Loading verification...
        </p>
      </div>
    </div>
  );
}
