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
  const title       = "Your Agency Name – Web Design & Development";
  const description = "We build fast, modern, and scalable web experiences. Explore our services, process, and tech stack.";
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
          name:       "Your Agency Name",
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
    { w: 480, h: 480, top: "8%",  left: "-8%",  color: "rgba(74,108,247,0.06)",  dur: "28s", delay: "0s"  },
    { w: 380, h: 380, top: "55%", right: "-6%", color: "rgba(0,212,255,0.05)",   dur: "34s", delay: "6s"  },
    { w: 320, h: 320, top: "30%", left: "42%",  color: "rgba(107,143,255,0.04)", dur: "22s", delay: "11s" },
    { w: 260, h: 260, top: "75%", left: "15%",  color: "rgba(0,212,255,0.04)",   dur: "26s", delay: "3s"  },
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

// ─── Gradient separator ───────────────────────────────────────────────────────
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