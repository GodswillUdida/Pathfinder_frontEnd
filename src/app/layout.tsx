import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Poppins, Manrope } from "next/font/google";
import { Toaster } from "sonner";

// import localFont from "next/font/local";

// Google Fonts
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

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

// Local Font – Agency FB
// const agency = localFont({
//   src: [
//     {
//       path: "../fonts/agency/AgencyFB-Regular.woff2",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../fonts/agency/AgencyFB-Bold.woff2",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-agency",
//   display: "swap",
// });

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
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
