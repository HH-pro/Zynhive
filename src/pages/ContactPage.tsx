import { Helmet } from "react-helmet-async";
import { useReveal } from "../hooks/index";
import { ContactForm } from "../components/ui/ContactForm";
import { SITE_CONFIG } from "../lib/data";
import { SectionHead } from "../components/ui/index";
import { useState } from "react";

// ── Structured Data ───────────────────────────────────────────────────────────

const CONTACT_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact ZynHive | Start Your Project",
  "description": "Get in touch with ZynHive — AI-first digital agency based in Lahore. Start your web, mobile, or AI automation project. We reply within 4 hours.",
  "url": "https://www.zynhive.com/contact",
  "inLanguage": "en",
  "publisher": {
    "@type": "Organization",
    "name": "ZynHive",
    "url": "https://www.zynhive.com",
    "email": SITE_CONFIG.email,
    "telephone": SITE_CONFIG.phone,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lahore",
      "addressCountry": "PK",
    },
  },
};

// ── Data ──────────────────────────────────────────────────────────────────────

const CONTACT_INFO = [
  { label: "WhatsApp",  value: SITE_CONFIG.phone,    href: SITE_CONFIG.whatsapp,           emoji: "💬", external: true  },
  { label: "Email",     value: SITE_CONFIG.email,    href: `mailto:${SITE_CONFIG.email}`,  emoji: "📧", external: false },
  { label: "Location",  value: SITE_CONFIG.location, href: "#",                            emoji: "📍", external: false },
];

const FAQ = [
  { q: "How long does a typical project take?",          a: "Most web and mobile projects ship in 6–10 weeks. Larger builds or complex integrations vary — after scoping we'll give you a realistic timeline upfront." },
  { q: "Do you work with startups or enterprises?",      a: "Both. Startups get a lean, fast-moving approach focused on speed to market. Enterprises get structured delivery with proper documentation and governance." },
  { q: "What does your pricing look like?",              a: "We work on fixed-scope contracts so there are no surprise invoices. After a discovery call we send a detailed proposal within 48 hours." },
  { q: "Can we work together if we're not in Pakistan?", a: "Absolutely — 70% of our clients are international. We work across US, UK, EU, and GCC time zones without issue." },
];

// ══ CONTACT PAGE ══════════════════════════════════════════════════════════════

export function ContactPage() {
  useReveal();

  return (
    <>
      {/* ── SEO Head ── */}
      <Helmet>
        {/* Primary Meta */}
        <title>Contact ZynHive | Start Your AI, Web & Mobile Project Today</title>
        <meta
          name="description"
          content="Get in touch with ZynHive — AI-first digital agency based in Lahore. Start your web app, mobile app, or AI automation project. We reply within 4 hours."
        />
        <meta name="keywords" content="contact ZynHive, hire AI agency, web development Lahore, mobile app agency Pakistan, AI automation agency, start a project ZynHive" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="ZynHive" />

        {/* Canonical */}
        <link rel="canonical" href="https://www.zynhive.com/contact" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.zynhive.com/contact" />
        <meta property="og:title" content="Contact ZynHive | Start Your Project Today" />
        <meta
          property="og:description"
          content="One conversation is all it takes. Reach out to ZynHive and get a detailed proposal within 48 hours. AI, web, mobile & marketing solutions."
        />
        <meta property="og:image" content="/Images/Contact Us.jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Contact ZynHive" />
        <meta property="og:site_name" content="ZynHive" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://www.zynhive.com/contact" />
        <meta name="twitter:title" content="Contact ZynHive | Start Your Project Today" />
        <meta
          name="twitter:description"
          content="Reach out to ZynHive — AI, web & mobile agency. Response under 4 hours. Based in Lahore, serving clients worldwide."
        />
        <meta name="twitter:image" content="/Images/Contact Us.jpeg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(CONTACT_SCHEMA)}
        </script>
      </Helmet>

      <main>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          aria-label="Contact ZynHive"
          className="relative min-h-[52vh] flex items-end px-8 md:px-14 pb-16 pt-40 overflow-hidden"
          style={{ background: "var(--hero-bg)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(201,125,10,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,125,10,.05) 1px,transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 55% 60% at 15% 80%, var(--accent-dim) 0%, transparent 70%)" }}
          />
          <div
            className="relative z-10 max-w-3xl"
            style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-5 h-px bg-[var(--accent)]" />
              <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">
                Get In Touch
              </span>
            </div>
            <h1
              className="font-syne text-[clamp(38px,6vw,78px)] font-extrabold leading-none tracking-tight mb-5"
              style={{ color: "var(--hero-text)" }}
            >
              Let's build
              <br />
              <em className="not-italic" style={{ color: "var(--accent)" }}>something great.</em>
            </h1>
            <p
              className="text-[16px] md:text-[17px] font-light leading-relaxed max-w-xl"
              style={{ color: "var(--hero-muted)" }}
            >
              One conversation is all it takes to get your project moving. Tell us what you're building.
            </p>
          </div>
        </section>

        {/* ── Form + Sidebar ────────────────────────────────────────────────── */}
        <section
          aria-label="Contact Form"
          className="px-6 md:px-14 py-20 md:py-28 bg-[var(--bg-base)] transition-colors duration-500"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">

            {/* Form column */}
            <div className="reveal">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-px bg-[var(--accent)]" />
                  <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">
                    Send a Message
                  </span>
                </div>
                <h2 className="font-syne text-2xl md:text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-2">
                  Start a conversation
                </h2>
                <p className="text-sm font-light text-[var(--ink3)] leading-relaxed">
                  Fill in the form and we'll reply within 24 hours with a detailed response.
                </p>
              </div>
              <div
                className="rounded-2xl p-6 md:p-8 transition-colors duration-500"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
              >
                <ContactForm />
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4 reveal reveal-d2 lg:sticky lg:top-28">

              {CONTACT_INFO.map(({ label, value, href, emoji, external }) => (
                <ContactCard key={label} label={label} value={value} href={href} emoji={emoji} external={external} />
              ))}

              {/* Response time */}
              <div
                className="p-5 rounded-2xl transition-colors duration-500"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--cyan)] flex-shrink-0" style={{ animation: "bPulse 2s infinite" }} />
                  <span className="font-mono text-[10px] text-[var(--cyan)] tracking-wider uppercase">Avg. Response Time</span>
                </div>
                <div className="font-syne text-2xl font-extrabold text-[var(--ink)] mb-1">Under 4 hours</div>
                <p className="text-xs font-light text-[var(--ink3)] leading-relaxed">
                  Mon–Fri, 9am–8pm PKT. Urgent? Message us on WhatsApp for a faster reply.
                </p>
              </div>

              {/* Trust note */}
              <div
                className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                style={{ background: "var(--accent-pale)", border: "1px solid var(--accent-pale2)" }}
              >
                <span className="text-[var(--accent)] text-base flex-shrink-0 mt-0.5">🔒</span>
                <p className="text-[12px] text-[var(--ink3)] leading-relaxed font-light">
                  Your information is kept strictly private and never shared with third parties.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <section
          aria-label="Frequently Asked Questions"
          className="px-6 md:px-14 py-20 md:py-28 bg-[var(--bg-alt)] transition-colors duration-500"
        >
          <div className="max-w-3xl mx-auto">
            <SectionHead
              tag="FAQ"
              heading={<>Common{" "}<em className="not-italic" style={{ color: "var(--accent)" }}>questions.</em></>}
              sub="Everything you need to know before we get started."
            />
            <div className="flex flex-col gap-3">
              {FAQ.map(({ q, a }, i) => (
                <FAQItem key={i} question={q} answer={a} index={i} />
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

// ─── ContactCard ──────────────────────────────────────────────────────────────
function ContactCard({
  label, value, href, emoji, external,
}: {
  label: string; value: string; href: string; emoji: string; external: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="flex items-center gap-4 p-5 rounded-2xl no-underline transition-all duration-300"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--accent-pale2)" : "var(--border)"}`,
        boxShadow: hovered ? "var(--shadow-md)" : "none",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: href === "#" ? "default" : "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={href === "#" ? (e) => e.preventDefault() : undefined}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300"
        style={{
          background: hovered ? "var(--accent-pale)" : "var(--bg-panel)",
          border: `1px solid ${hovered ? "var(--accent-pale2)" : "var(--border2)"}`,
        }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] text-[var(--ink4)] tracking-wider uppercase mb-0.5">{label}</div>
        <div
          className="text-[14px] font-medium truncate transition-colors duration-200"
          style={{ color: hovered ? "var(--accent)" : "var(--ink)" }}
        >
          {value}
        </div>
      </div>
      {href !== "#" && (
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className="flex-shrink-0 transition-all duration-300"
          style={{ color: hovered ? "var(--accent)" : "var(--ink4)", transform: hovered ? "translate(2px, -2px)" : "none" }}
        >
          <path d="M2 12L12 2M12 2H5M12 2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </a>
  );
}

// ─── FAQItem ──────────────────────────────────────────────────────────────────
function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`reveal reveal-d${(index % 3) + 1} rounded-xl overflow-hidden transition-all duration-300`}
      style={{ border: `1px solid ${open ? "var(--accent-pale2)" : "var(--border)"}`, background: "var(--bg-surface)" }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200"
        style={{ background: open ? "var(--accent-pale)" : "var(--bg-surface)", cursor: "pointer" }}
      >
        <span className="font-syne text-[15px] font-semibold text-[var(--ink)] tracking-tight leading-snug">
          {question}
        </span>
        <span
          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 text-sm font-semibold"
          style={{
            background: open ? "var(--accent)" : "var(--bg-panel)",
            border: `1px solid ${open ? "var(--accent)" : "var(--border2)"}`,
            color: open ? "white" : "var(--ink3)",
            transform: open ? "rotate(45deg)" : "none",
          }}
        >
          +
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-48" : "max-h-0"}`}>
        <p
          className="px-6 py-4 text-[13px] font-light text-[var(--ink3)] leading-relaxed"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {answer}
        </p>
      </div>
    </div>
  );
}