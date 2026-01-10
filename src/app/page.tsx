// import { HeroSection } from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
// import CTASection from "@/components/landing/CTASection";
import Navbar  from "@/components/layout/Navbar";
import Footer  from "@/components/layout/Footer";
// import Testimonials from "@/components/landing/Testimonials";
import Partners from "@/components/landing/Partnership";
import HeroSection from "@/components/landing/HeroSection";
// import CoursePreview from "@/components/landing/CoursePreview";
// import HeroSection from "@/components/landing/HeroSection";

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
};