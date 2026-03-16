import { useReveal } from "../hooks/index";
import { ContactForm } from "../components/ui/ContactForm";
import { SITE_CONFIG } from "../lib/data";
import { SectionHead } from "../components/ui/index";
import { useState } from "react"; // Added missing import

const CONTACT_INFO = [
  { label: "WhatsApp",  value: SITE_CONFIG.phone,    href: SITE_CONFIG.whatsapp, emoji: "💬", external: true },
  { label: "Email",     value: SITE_CONFIG.email,    href: `mailto:${SITE_CONFIG.email}`, emoji: "📧", external: false },
  { label: "Location",  value: SITE_CONFIG.location, href: "#", emoji: "📍", external: false },
];

const FAQ = [
  { q: "How long does a typical project take?",    a: "Most web and mobile projects ship in 6–10 weeks. AI integrations vary by complexity — typically 4–12 weeks." },
  { q: "Do you work with startups or enterprises?", a: "Both. We calibrate our process to your stage. Startups get a lean, fast-moving approach. Enterprises get structured governance." },
  { q: "What does your pricing look like?",         a: "We work on fixed-scope contracts so there are no surprises. After a discovery call we provide a detailed proposal within 48 hours." },
  { q: "Can we work together if we're not in Pakistan?", a: "Absolutely — 70% of our clients are international. We operate across US, UK, EU, and GCC time zones." },
];

export function ContactPage() {
  useReveal();
  return (
    <main>
      {/* Hero */}
      <section
        className="relative min-h-[48vh] flex items-end px-8 md:px-14 pb-16 pt-40 overflow-hidden"
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
        <div className="relative z-10 max-w-3xl" style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-[var(--accent)]" />
            <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">Get In Touch</span>
          </div>
          <h1 className="font-syne text-[clamp(40px,6vw,80px)] font-extrabold leading-none tracking-tight mb-5"
            style={{ color: "var(--hero-text)" }}>
            Let's build<br />
            <em className="not-italic text-[var(--accent)]">something great.</em>
          </h1>
          <p className="text-[17px] font-light leading-relaxed max-w-xl"
            style={{ color: "var(--hero-muted)" }}>
            One conversation is all it takes to get your project moving. Tell us what you're building.
          </p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-base)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-16 items-start">
          {/* Form */}
          <div className="reveal">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-px bg-[var(--accent)]" />
                <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">Send a Message</span>
              </div>
              <h2 className="font-syne text-3xl font-extrabold text-[var(--ink)] tracking-tight mb-2">
                Start a conversation
              </h2>
              <p className="text-sm font-light text-[var(--ink3)] leading-relaxed">
                Fill in the form and we'll reply within 24 hours with a detailed response.
              </p>
            </div>
            <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-8 transition-colors duration-500">
              <ContactForm />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-6 reveal reveal-d2 lg:sticky lg:top-28">
            {/* Contact cards */}
            {CONTACT_INFO.map(({ label, value, href, emoji, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                className="flex items-center gap-4 p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl no-underline transition-all duration-300 hover:border-[var(--accent-pale2)] hover:shadow-[var(--shadow-md)] group"
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--accent-pale)] border border-[var(--accent-pale2)] flex items-center justify-center text-xl flex-shrink-0 transition-colors duration-300">
                  {emoji}
                </div>
                <div>
                  <div className="font-mono text-[10px] text-[var(--ink4)] tracking-wider uppercase mb-0.5">{label}</div>
                  <div className="text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors duration-200">
                    {value}
                  </div>
                </div>
              </a>
            ))}

            {/* Response time badge */}
            <div className="p-5 bg-[var(--bg-panel)] border border-[var(--border)] rounded-2xl transition-colors duration-500">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[var(--cyan)]" style={{ animation: "bPulse 2s infinite" }} />
                <span className="font-mono text-[11px] text-[var(--cyan)] tracking-wider uppercase">Avg. Response Time</span>
              </div>
              <div className="font-syne text-2xl font-extrabold text-[var(--ink)] mb-1">Under 4 hours</div>
              <p className="text-xs font-light text-[var(--ink3)]">
                Mon–Fri, 9am–8pm PKT. Urgent? Message on WhatsApp for instant response.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-alt)] transition-colors duration-500">
        <div className="max-w-3xl mx-auto">
          <SectionHead
            tag="FAQ"
            heading={<>Common <em className="not-italic text-[var(--accent)]">questions.</em></>} {/* Fixed: added closing bracket */}
          />
          <div className="flex flex-col gap-4">
            {FAQ.map(({ q, a }, i) => (
              <FAQItem key={i} question={q} answer={a} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`reveal reveal-d${(index % 3) + 1} border border-[var(--border)] rounded-xl overflow-hidden transition-colors duration-300 ${open ? "border-[var(--accent-pale2)]" : ""}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-[var(--bg-surface)] hover:bg-[var(--bg-panel)] transition-colors duration-200 cursor-none"
      >
        <span className="font-syne text-[15px] font-semibold text-[var(--ink)] tracking-tight">{question}</span>
        <span className={`text-[var(--accent)] text-xl font-light flex-shrink-0 transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40" : "max-h-0"}`}>
        <p className="px-6 py-4 text-sm font-light text-[var(--ink3)] leading-relaxed bg-[var(--bg-surface)] border-t border-[var(--border)]">
          {answer}
        </p>
      </div>
    </div>
  );
}