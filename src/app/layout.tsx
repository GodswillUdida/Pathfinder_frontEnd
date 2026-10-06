import "./globals.css";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import type { Metadata, Viewport } from "next";
import { Syne, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";

// ─── Premium Font Engine Configurations ──────────────────────────────────────
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// ─── Meta & Search Engine Optimization Anchors ──────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Accountant Pathfinder | Premier Accounting LMS Platform",
    template: "%s | Accountant Pathfinder"
  },
  description: "Nigeria’s elite accounting workspace. Master ICAN, ACCA, and corporate fiscal skills with expert-led digital learning tracks.",
  icons: {
    icon: "/AP-Logo-5-1.svg",
    apple: "/AP-Logo-5-1.svg",
    shortcut: "/AP-Logo-5-1.svg",
  },
};

// Hardware Adaptive Viewport Engine Config
export function generateViewport(): Viewport {
  return {
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "oklch(99% 0.005 254)" },
      { media: "(prefers-color-scheme: dark)", color: "oklch(13% 0.03 254)" }
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${jakarta.variable} antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="min-h-screen bg-background text-foreground selection:bg-brand-blue/30 selection:text-white"
        style={{
          fontFamily: "var(--font-sans), system-ui, sans-serif"
        }}
      >
        <ReactQueryProvider>
          <AuthProvider>
            {/* Smooth client transitions block */}
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
          </AuthProvider>
        </ReactQueryProvider>

        {/* Premium Notification UI */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          theme="system"
          // toastOptions={{
          //   style: {
          //     background: "oklch(16% 0.04 254)",
          //     border: "1px solid oklch(24% 0.05 254)",
          //     color: "oklch(98% 0.008 254)",
          //     borderRadius: "0.75rem"
          //   }
          // }}
        />
      </body>
    </html>
  );
}
