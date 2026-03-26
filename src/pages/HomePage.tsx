import { useEffect, useRef } from "react";
import { useReveal }    from "../hooks/index";
import { HeroSection }  from "../sections/HeroSection";
import {
  MarqueeSection,
  IntroSection,
  ServicesPreviewSection,
  ProcessSection,
  TechSection,
  TestimonialsSection,
  CTASection,
} from "../sections/HomeSections";

// ─── Ambient floating orbs (background atmosphere) ───────────────────────────
function FloatingOrbs() {
  const orbs = [
    { w: 480, h: 480, top: "8%",  left: "-8%",  color: "rgba(74,108,247,0.06)",  dur: "28s", delay: "0s"   },
    { w: 380, h: 380, top: "55%", right: "-6%", color: "rgba(0,212,255,0.05)",   dur: "34s", delay: "6s"   },
    { w: 320, h: 320, top: "30%", left: "42%",  color: "rgba(107,143,255,0.04)", dur: "22s", delay: "11s"  },
    { w: 260, h: 260, top: "75%", left: "15%",  color: "rgba(0,212,255,0.04)",   dur: "26s", delay: "3s"   },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {orbs.map((o, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:  o.w,
            height: o.h,
            top:    o.top,
            left:   (o as any).left,
            right:  (o as any).right,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: "blur(40px)",
            animation: `orbFloat ${o.dur} ${o.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Gradient separator between sections ─────────────────────────────────────
function SectionDivider() {
  const ref  = useRef<HTMLDivElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          el.style.animation = "lineGrow 0.9s cubic-bezier(0.16,1,0.3,1) forwards";
          obs.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative h-px w-full overflow-hidden" style={{ zIndex: 1 }}>
      <div
        ref={ref}
        className="absolute inset-0 origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--cyan) 70%, transparent 100%)",
          opacity: 0.3,
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  useReveal();

  return (
    <main className="relative">
      <FloatingOrbs />

      <div className="relative" style={{ zIndex: 1 }}>
        <HeroSection />
        <MarqueeSection />

        <SectionDivider />
        <IntroSection />

        <SectionDivider />
        <ServicesPreviewSection />

        <SectionDivider />
        <ProcessSection />

        <SectionDivider />
        <TechSection />

        <SectionDivider />
        <TestimonialsSection />

        <SectionDivider />
        <CTASection />
      </div>
    </main>
  );
}
