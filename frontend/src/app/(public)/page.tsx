import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Gallery } from "@/components/landing/Gallery";
import { About } from "@/components/landing/About";
import { CTA } from "@/components/landing/CTA";
import { ReviewSection } from "@/components/reviews/ReviewSection";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Services />
      <Gallery />
      <About />
      <ReviewSection />
      <CTA />
    </>
  );
}
