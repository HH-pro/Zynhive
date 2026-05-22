import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
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

// ─── SEO Meta Tags ────────────────────────────────────────────────────────────
function HomePageSEO() {
  const title       = "Zynhive – AI-First Digital Agency";
  const description = "Zynhive builds AI-powered products, automations and high-conversion web experiences for industry-scale teams.";
  const canonical   = "https://www.zynhive.com/";
  const ogImage     = "https://www.zynhive.com/og-home.jpg";

  return (
    <Helmet>
      {/* ── Primary ── */}
      <title>{title}</title>
      <meta name="description"        content={description} />
      <meta name="robots"             content="index, follow" />
      <link rel="canonical"           href={canonical} />

      {/* ── Open Graph ── */}
      <meta property="og:type"        content="website" />
      <meta property="og:url"         content={canonical} />
      <meta property="og:title"       content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={ogImage} />

      {/* ── Twitter Card ── */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* ── JSON-LD Structured Data ── */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type":    "WebSite",
          name:       "Zynhive",
          url:        canonical,
          description,
          potentialAction: {
            "@type":       "SearchAction",
            target:        `${canonical}search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        })}
      </script>
    </Helmet>
  );
}

// ─── Ambient floating orbs ────────────────────────────────────────────────────
function FloatingOrbs() {
  const orbs = [
    { w: 520, h: 520, top: "6%",  left: "-10%", color: "rgba(74,108,247,0.07)",  dur: "32s", delay: "0s"  },
    { w: 400, h: 400, top: "52%", right: "-8%", color: "rgba(0,212,255,0.055)",  dur: "38s", delay: "6s"  },
    { w: 340, h: 340, top: "28%", left: "44%",  color: "rgba(107,143,255,0.045)", dur: "26s", delay: "11s" },
    { w: 280, h: 280, top: "78%", left: "14%",  color: "rgba(0,212,255,0.045)",  dur: "30s", delay: "3s"  },
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
            filter: "blur(48px)",
            willChange: "transform",
            animation: `orbFloat ${o.dur} ${o.delay} ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Section divider — animated gradient line + center node ───────────────────
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
          el.classList.add("section-divider--in");
          obs.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="section-divider relative w-full flex items-center justify-center"
      style={{ height: 1, zIndex: 1 }}
      aria-hidden
    >
      <div
        className="section-divider__line absolute inset-0 origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--border) 28%, var(--accent) 50%, var(--cyan) 62%, var(--border) 78%, transparent 100%)",
          opacity: 0.55,
          transform: "scaleX(0)",
        }}
      />
      <span
        className="section-divider__dot relative rounded-full"
        style={{
          width: 4,
          height: 4,
          background:
            "radial-gradient(circle, var(--cyan) 0%, var(--accent) 60%, transparent 100%)",
          boxShadow: "0 0 8px var(--accent-dim), 0 0 14px rgba(0,212,255,0.25)",
          opacity: 0,
          transform: "scale(0.3)",
        }}
      />
      <style>{`
        .section-divider__line {
          transition:
            transform 1.05s cubic-bezier(0.16,1,0.3,1),
            opacity   0.6s ease;
        }
        .section-divider__dot {
          transition:
            transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.35s,
            opacity   0.5s ease 0.35s;
        }
        .section-divider--in .section-divider__line { transform: scaleX(1); }
        .section-divider--in .section-divider__dot  {
          transform: scale(1);
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  useReveal();

  return (
    <>
      <HomePageSEO />

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
    </>
  );
}
