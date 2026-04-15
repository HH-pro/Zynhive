// ─── src/pages/ServicesPage.tsx ──────────────────────────────────────────────
import { Helmet }                from "react-helmet-async";
import { useReveal }             from "../hooks/index";
import { SERVICES, SITE_CONFIG } from "../lib/data";
import { ServiceCard }           from "../components/ui/Cards";
import { SectionHead, LinkButton } from "../components/ui/index";
import { CTASection }            from "../sections/HomeSections";

const HIGHLIGHTS = [
  { label: "Avg. Project Delivery", value: "6–10 weeks" },
  { label: "Client Retention Rate", value: "94%"        },
  { label: "Projects Shipped",      value: "120+"       },
  { label: "Satisfaction Score",    value: "4.9 / 5"    },
];

void SITE_CONFIG;

export function ServicesPage() {
  useReveal();

  return (
    <main>

      {/* ✅ SEO META */}
      <Helmet>
        <title>Web Development & AI Services | ZynHive</title>

        <meta
          name="description"
          content="ZynHive offers web development, UI/UX design, AI solutions, and scalable software services to help your business grow fast."
        />

        <meta
          name="keywords"
          content="web development, UI UX design, AI development, SaaS development, React agency"
        />

        <link rel="canonical" href="https://yourdomain.com/services" />

        {/* Open Graph */}
        <meta property="og:title" content="ZynHive Services" />
        <meta property="og:description" content="Build & scale your business with ZynHive." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/services" />

        {/* Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "ZynHive",
            url: "https://yourdomain.com",
            description: "Web development and AI solutions agency",
          })}
        </script>
      </Helmet>

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
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-[var(--accent)]"/>
            <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">
              Our Services
            </span>
          </div>

          {/* ✅ H1 optimized */}
          <h1 className="font-syne text-[clamp(40px,6vw,80px)] font-extrabold leading-none tracking-tight mb-5">
            Web Development & AI Services <br/>
            <em className="not-italic text-[var(--accent)]">to build & grow.</em>
          </h1>

          <p className="text-[17px] font-light leading-relaxed max-w-xl">
            Professional web development, UI/UX design, and AI-powered solutions for modern businesses.
          </p>
        </div>
      </section>

      {/* ✅ SEO TEXT (Google ke liye hidden gold) */}
      <section className="max-w-4xl mx-auto px-8 py-10 text-sm text-[var(--ink3)]">
        <p>
          ZynHive provides web development, UI/UX design, and AI-powered software solutions.
          We help startups and businesses build scalable digital products using modern
          technologies like React, Node.js, and cloud infrastructure.
        </p>
      </section>

      {/* Stats */}
      <div className="bg-[var(--bg-panel)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-8 md:px-14 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {HIGHLIGHTS.map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="font-syne text-2xl font-extrabold text-[var(--accent)] mb-1">{value}</div>
              <div className="font-mono text-[10px] text-[var(--ink4)] uppercase">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <section className="px-8 md:px-14 py-28">
        {/* ✅ H2 */}
        <h2 className="sr-only">Our Web Development Services</h2>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden">
            {SERVICES.map((svc, i) => (
              <ServiceCard key={svc.id} service={svc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-alt)]">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="Why ZynHive"
            heading={<>The <em className="not-italic text-[var(--accent)]">difference</em> is in the details</>}
            sub="We focus on business results, not just code."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Outcome-First Mindset", desc: "Focused on real business growth." },
              { title: "Senior Teams", desc: "Only experienced professionals." },
              { title: "Transparency", desc: "Clear communication and updates." },
              { title: "AI Workflows", desc: "Faster and smarter delivery." },
              { title: "Support", desc: "Post-launch support included." },
              { title: "Fixed Pricing", desc: "No hidden costs." },
            ].map((item) => (
              <div key={item.title} className="p-7 rounded-2xl border">
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--ink3)]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ FAQ (SEO BOOST) */}
      <section className="max-w-4xl mx-auto px-8 py-20">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>

        <h3>What services does ZynHive offer?</h3>
        <p>We offer web development, UI/UX design, AI solutions, and SaaS development.</p>

        <h3>How long does a project take?</h3>
        <p>Most projects are completed within 6–10 weeks.</p>
      </section>

      {/* CTA */}
      <div className="text-center pb-20">
        <LinkButton href="/contact">
          Start Your Project
        </LinkButton>
      </div>

      <CTASection />
    </main>
  );
}