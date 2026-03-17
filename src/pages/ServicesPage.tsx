// ─── src/pages/ServicesPage.tsx ──────────────────────────────────────────────
import { useReveal }              from "../hooks/index";
import { SERVICES, SITE_CONFIG }  from "../lib/data";
import { ServiceCard }            from "../components/ui/Cards";
import { SectionHead, LinkButton } from "../components/ui/index";
import { CTASection }             from "../sections/HomeSections";

const HIGHLIGHTS = [
  { label: "Avg. Project Delivery", value: "6–10 weeks" },
  { label: "Client Retention Rate", value: "94%"        },
  { label: "Projects Shipped",      value: "120+"       },
  { label: "Satisfaction Score",    value: "4.9 / 5"    },
];

// Suppress unused-variable warning — SITE_CONFIG may be used in CTASection or meta
void SITE_CONFIG;

export function ServicesPage() {
  useReveal();

  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[50vh] flex items-end px-8 md:px-14 pb-16 pt-40 overflow-hidden transition-colors duration-500"
        style={{ background: "var(--hero-bg)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,125,10,.05) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(201,125,10,.05) 1px,transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%,black 30%,transparent 100%)",
          }}
        />
        <div
          className="relative z-10 max-w-3xl"
          style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-[var(--accent)]"/>
            <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">
              Our Services
            </span>
          </div>
          <h1
            className="font-syne text-[clamp(40px,6vw,80px)] font-extrabold leading-none tracking-tight mb-5 transition-colors duration-300"
            style={{ color: "var(--hero-text)" }}
          >
            Everything you need<br/>
            <em className="not-italic text-[var(--accent)]">to build &amp; grow.</em>
          </h1>
          <p
            className="text-[17px] font-light leading-relaxed max-w-xl transition-colors duration-300"
            style={{ color: "var(--hero-muted)" }}
          >
            Six core service pillars — each designed to compound. Invest in one, amplify all others.
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-[var(--bg-panel)] border-y border-[var(--border)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 md:px-14 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-syne text-2xl font-extrabold text-[var(--accent)] mb-1">{value}</div>
              <div className="font-mono text-[10px] text-[var(--ink4)] tracking-wider uppercase">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-base)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden reveal transition-colors duration-500"
            style={{ background: "var(--border)", border: "1px solid var(--border)" }}
          >
            {SERVICES.map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-alt)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="Why ZynHive"
            heading={<>The <em className="not-italic text-[var(--accent)]">difference</em> is in the details</>}
            sub="We're not just a dev shop. We think in business outcomes, design for users, and engineer for scale."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Outcome-First Mindset", desc: "Every decision maps back to your business goal. We measure success in revenue, not just deliverables.", emoji: "🎯" },
              { title: "Senior-Only Teams",     desc: "No juniors on client work. Every project is handled by experienced engineers and designers.",           emoji: "🏆" },
              { title: "Radical Transparency",  desc: "Weekly demos, clear milestones, and a Slack channel where you see progress in real time.",              emoji: "👁️" },
              { title: "AI-Native Workflows",   desc: "We've embedded AI into our own dev pipeline — which means faster, sharper delivery for you.",           emoji: "🤖" },
              { title: "Post-Launch Support",   desc: "90-day warranty on all builds. We don't vanish after go-live. Your success is our reputation.",         emoji: "🛡️" },
              { title: "Fixed-Price Contracts", desc: "No surprise invoices. Scope it, price it, build it. Budget certainty for your CFO's peace of mind.",   emoji: "📋" },
            ].map(({ title, desc, emoji }, i) => {
              const delayClass = (["reveal-d1", "reveal-d2", "reveal-d3"] as const)[i % 3];
              return (
                <div
                  key={title}
                  className={`reveal ${delayClass} p-7 rounded-2xl transition-all duration-300`}
                  style={{
                    background: "var(--bg-surface)",
                    border:     "1px solid var(--border)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--accent-pale2)";
                    el.style.boxShadow   = "var(--shadow-md)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = "var(--border)";
                    el.style.boxShadow   = "none";
                  }}
                >
                  <span className="text-3xl mb-4 block">{emoji}</span>
                  <h3 className="font-syne text-base font-bold mb-2 tracking-tight" style={{ color: "var(--ink)" }}>
                    {title}
                  </h3>
                  <p className="text-[13px] font-light leading-relaxed" style={{ color: "var(--ink3)" }}>
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}