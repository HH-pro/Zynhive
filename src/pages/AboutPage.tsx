import { useReveal } from "../hooks/index";
import { SITE_CONFIG, HERO_STATS } from "../lib/data";
import { SectionHead, LinkButton } from "../components/ui/index";
import { CTASection } from "../sections/HomeSections";

const VALUES = [
  { title: "Craft over commodity",  desc: "We sweat every detail because the sum of small decisions is what separates great products from forgettable ones.", emoji: "🔨" },
  { title: "Radical honesty",        desc: "We tell clients what they need to hear, not what they want to hear. Trust is our most valuable deliverable.", emoji: "🔍" },
  { title: "Perpetual learning",     desc: "The field moves fast. We dedicate 10% of every week to R&D so our clients benefit from what's next.", emoji: "📚" },
  { title: "Shared ownership",       desc: "We treat every project like it's our own product. If you win, we win — that's how we structure every engagement.", emoji: "🤝" },
];

const MILESTONES = [
  { year: "2024", title: "Founded", desc: "ZynHive was founded with a mission to make AI-first software accessible to ambitious companies of all sizes." },
  { year: "2024", title: "First 10 clients", desc: "Rapid early traction across e-commerce, fintech, and health-tech verticals." },
  { year: "2025", title: "50+ projects", desc: "Expanded service offering to include dedicated AI/ML engineering and data pipeline consulting." },
  { year: "2025", title: "$10M+ client revenue", desc: "Products we've shipped generated over $10M in attributable revenue for clients." },
  { year: "2026", title: "120+ projects", desc: "Team of 20+ across engineering, design, and growth. Clients in 12 countries." },
];

export function AboutPage() {
  useReveal();
  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[55vh] flex items-end px-8 md:px-14 pb-16 pt-40 overflow-hidden"
        style={{ background: "var(--hero-bg)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(201,125,10,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,125,10,.05) 1px,transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%,black 30%,transparent 100%)",
          }}
        />
        <div
          className="absolute pointer-events-none w-[600px] h-[600px] rounded-full top-[-200px] right-[-100px]"
          style={{ background: "radial-gradient(circle, rgba(201,125,10,.08) 0%, transparent 70%)", animation: "floatGlow 8s ease-in-out infinite" }}
        />
        <div className="relative z-10 max-w-3xl" style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-[var(--accent)]" />
            <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">About Us</span>
          </div>
          <h1 className="font-syne text-[clamp(40px,6vw,80px)] font-extrabold leading-none tracking-tight mb-5"
            style={{ color: "var(--hero-text)" }}>
            We exist to make<br />
            <em className="not-italic text-[var(--accent)]">great products.</em>
          </h1>
          <p className="text-[17px] font-light leading-relaxed max-w-xl"
            style={{ color: "var(--hero-muted)" }}>
            {SITE_CONFIG.description}
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="bg-[var(--bg-panel)] border-y border-[var(--border)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 md:px-14 py-8 grid grid-cols-3 gap-6 text-center">
          {HERO_STATS.map(({ target, suffix, label }) => (
            <div key={label}>
              <div className="font-syne text-3xl font-extrabold text-[var(--accent)]">{target}{suffix}</div>
              <div className="font-mono text-[10px] text-[var(--ink4)] tracking-wider uppercase mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-base)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal">
            <SectionHead
              tag="Our Mission"
              heading={<>Intelligence &amp; <em className="not-italic text-[var(--accent)]">craft,</em> combined.</>}
            />
            <p className="text-base font-light text-[var(--ink3)] leading-relaxed mb-5">
              We started ZynHive because we saw a gap: companies need digital products that actually move business metrics, not just look good in a Figma file. Most agencies deliver one or the other. We deliver both.
            </p>
            <p className="text-base font-light text-[var(--ink3)] leading-relaxed mb-8">
              Our team is deliberately small and senior. We work with a limited number of clients at a time so that every project gets the strategic attention it deserves. Quality compounds.
            </p>
            <LinkButton href="/contact" variant="accent" size="md">
              Start a Project →
            </LinkButton>
          </div>
          <div className="reveal reveal-d2">
            <div className="grid grid-cols-2 gap-4">
              {VALUES.map(({ title, desc, emoji }, i) => (
                <div key={title} className={`p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl hover:border-[var(--accent-pale2)] transition-all duration-300 reveal reveal-d${i + 1}`}>
                  <span className="text-2xl mb-3 block">{emoji}</span>
                  <h4 className="font-syne text-sm font-bold text-[var(--ink)] mb-2">{title}</h4>
                  <p className="text-xs font-light text-[var(--ink3)] leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-alt)] transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <SectionHead
            tag="Our Journey"
            heading={<>From <em className="not-italic text-[var(--accent)]">zero</em> to impact.</>}
          />
          <div className="relative pl-6 border-l border-[var(--accent-pale2)]">
            {MILESTONES.map(({ year, title, desc }, i) => (
              <div key={i} className={`relative mb-12 last:mb-0 reveal reveal-d${(i % 3) + 1}`}>
                <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--accent)]" />
                <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.1em] uppercase mb-1 block">{year}</span>
                <h3 className="font-syne text-lg font-bold text-[var(--ink)] mb-1.5 tracking-tight">{title}</h3>
                <p className="text-sm font-light text-[var(--ink3)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
