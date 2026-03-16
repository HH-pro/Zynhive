import { useReveal } from "../hooks/index";
import { HeroSection } from "../sections/HeroSection";
import {
  MarqueeSection,
  IntroSection,
  ServicesPreviewSection,
  ProcessSection,
  TechSection,
  TestimonialsSection,
  CTASection,
} from "../sections/HomeSections";

export function HomePage() {
  useReveal();
  return (
    <main>
      <HeroSection />
      <MarqueeSection />
      <IntroSection />
      <ServicesPreviewSection />
      <ProcessSection />
      <TechSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
}
