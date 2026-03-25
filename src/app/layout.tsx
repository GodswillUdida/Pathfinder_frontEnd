// src/app/layout.tsx  — no "use client", stays a Server Component
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
// import { AuthHydration } from "@/components/providers/AuthHydration";
import { AuthProvider } from "@/components/providers/AuthProvider";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import AuthHydration from "@/components/providers/AuthHydration";
// import { useEffect } from "react";
// import { apiFetch, useAuthStore } from "@/store/authStore";

const inter = Inter({ subsets: ["latin"], display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Accountant's Pathfinder",
  description: "Your Journey to Accounting Excellence Starts Here",
  icons: {
    icon: "/AP-Logo-5-1.svg",
    apple: "/AP-Logo-5-1.svg",
    shortcut: "/AP-Logo-5-1.svg",
  },
};

export function generateViewport(): Viewport {
  return {
    themeColor: "#ffffff",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={[
        inter.className,
        poppins.variable,
        manrope.variable,
        "antialiased",
      ].join(" ")}
    >
      <body>
        <ReactQueryProvider>
          {/* <AuthProvider> */}
          <AuthHydration />
          {children}
          {/* </AuthHydration> */}
          {/* </AuthProvider> */}
        </ReactQueryProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
