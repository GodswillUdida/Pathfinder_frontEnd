// import { HeroSection } from "@/components/landing/HeroSection";
import Features from "@/components/landing/Features";
import Footer from "@/components/layout/Footer";
import Partners from "@/components/landing/Partnership";
import HeroSection from "@/components/landing/HeroSection";
import Header from "@/components/layout/Header";
// const NoSSR = dynamic(() => import("@/components/landing/Partners"), { ssr: false });

export default function HomePage() {
  return (
    <div>
      <Header />
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
