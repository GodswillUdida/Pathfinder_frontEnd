// import { HeroSection } from "@/components/landing/HeroSection";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
import Partners from "@/components/landing/Partnership";
import Footer from "@/components/layout/Footer";
// const NoSSR = dynamic(() => import("@/components/landing/Partners"), { ssr: false });

export default function HomePage() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Features />
      {/* <CoursePreview /> */}
      <Partners />
      {/* <Testimonials /> */}
      {/* <CTASection /> */}
      <Footer />
    </div>
  );
}
