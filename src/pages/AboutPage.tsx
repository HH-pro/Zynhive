import { useReveal } from "../hooks/index";
import { SITE_CONFIG, HERO_STATS } from "../lib/data";
import { SectionHead, LinkButton } from "../components/ui/index";
import { CTASection } from "../sections/HomeSections";

// ── Values ───────────────────────────────────────────────────────────────────

const VALUES = [
  {
    title: "Craft over commodity",
    desc: "We sweat every detail because the sum of small decisions is what separates great products from forgettable ones.",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 16l2-6 8-8 4 4-8 8-6 2z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M14 2l4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M6 10l4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Radical honesty",
    desc: "We tell clients what they need to hear, not what they want to hear. Trust is our most valuable deliverable.",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke={color} strokeWidth="1.4" />
        <line x1="10" y1="6" x2="10" y2="10.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="13.5" r="0.9" fill={color} />
      </svg>
    ),
  },
  {
    title: "Perpetual learning",
    desc: "The field moves fast. We dedicate 10% of every week to R&D so our clients benefit from what's next.",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 5.5l7-3 7 3v6c0 3-7 6-7 6S3 14.5 3 11.5v-6z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M10 9v3M8.5 10.5h3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Shared ownership",
    desc: "We treat every project like it's our own product. If you win, we win — that's how we structure every engagement.",
    icon: (color: string) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M6.5 10.5 C6.5 10.5 7 13 10 13 C13 13 13.5 10.5 13.5 10.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <circle cx="7" cy="7.5" r="1.2" fill={color} />
        <circle cx="13" cy="7.5" r="1.2" fill={color} />
        <circle cx="10" cy="17" r="1.5" stroke={color} strokeWidth="1.2" />
        <circle cx="4"  cy="17" r="1.5" stroke={color} strokeWidth="1.2" />
        <circle cx="16" cy="17" r="1.5" stroke={color} strokeWidth="1.2" />
        <line x1="5.5"  y1="17" x2="8.5"  y2="17" stroke={color} strokeWidth="1.1" />
        <line x1="11.5" y1="17" x2="14.5" y2="17" stroke={color} strokeWidth="1.1" />
      </svg>
    ),
  },
];

// ── Milestones — updated to 2025 ─────────────────────────────────────────────

const MILESTONES = [
  {
    year: "2025 — Q1",
    title: "Founded",
    desc: "ZynHive launched with a clear mission: make AI-first digital products accessible to ambitious companies of every size.",
  },
  {
    year: "2025 — Q2",
    title: "First 10 clients",
    desc: "Rapid early traction across e-commerce, fintech, and SaaS verticals — with a 100% client retention rate in year one.",
  },
  {
    year: "2025 — Q3",
    title: "30+ projects delivered",
    desc: "Expanded service offering to include AI automations, n8n/Zapier workflows, and full-stack mobile apps.",
  },
  {
    year: "2025 — Q4",
    title: "$2M+ client revenue generated",
    desc: "Products and campaigns we shipped drove over $2M in attributable revenue for our clients in our first year.",
  },
  {
    year: "2026",
    title: "Scaling globally",
    desc: "Growing team of specialists across AI, web, and digital marketing — serving clients in 8+ countries.",
  },
];

// ── Founders ─────────────────────────────────────────────────────────────────

const FOUNDERS = [
  {
    role: "Founder & CEO",
    name: "Your Name",
    initials: "YN",
    bio: "A builder at heart with a background spanning software engineering and growth strategy. Founded ZynHive to bridge the gap between beautiful design and real business outcomes. Previously led product at [Company].",
    color: "var(--accent)",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    role: "Co-Founder & CTO",
    name: "Co-Founder Name",
    initials: "CN",
    bio: "Full-stack engineer turned AI practitioner. Obsessed with automation, developer experience, and systems that scale. Previously built products used by 500K+ users at [Company].",
    color: "var(--cyan)",
    socials: {
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
];

// ── Founder avatar ────────────────────────────────────────────────────────────

function FounderAvatar({
  initials,
  color,
  size = 96,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="relative flex-shrink-0 rounded-2xl flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${color}22, ${color}10)`,
        border: `1px solid ${color}30`,
      }}
    >
      {/* Shine */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)",
        }}
      />
      {/* Image placeholder — replace src with real photo */}
      {/* <img src="/founders/name.jpg" alt={initials} className="w-full h-full object-cover" /> */}

      {/* Initials fallback */}
      <span
        className="relative z-10 font-display font-bold select-none"
        style={{
          fontSize: size * 0.3,
          color,
          letterSpacing: "-0.02em",
        }}
      >
        {initials}
      </span>

      {/* Decorative corner dot */}
      <div
        className="absolute bottom-2.5 right-2.5 w-2 h-2 rounded-full"
        style={{ background: color, opacity: 0.6 }}
      />
    </div>
  );
}

// ── SocialLink atom ───────────────────────────────────────────────────────────

function SocialLink({
  href,
  label,
  color,
  children,
}: {
  href: string;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-xl flex items-center justify-center no-underline
        border border-[var(--border2)] text-[var(--ink4)] bg-[var(--bg-panel)]
        hover:border-[var(--border)] transition-all duration-200"
      style={
        {
          "--hover-color": color,
        } as React.CSSProperties
      }
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = color;
        el.style.borderColor = color + "50";
        el.style.background = color + "10";
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.color = "";
        el.style.borderColor = "";
        el.style.background = "";
        el.style.transform = "";
      }}
    >
      {children}
    </a>
  );
}

// ─── LinkedInIcon / TwitterIcon inline (avoids import dependency) ─────────────

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 2A1.5 1.5 0 1 0 3.5 5 1.5 1.5 0 0 0 3.5 2zM2 6h3v8H2V6zm5 0h2.8v1.1h.04C10.36 6.4 11.4 6 12.5 6 15 6 15.5 7.7 15.5 9.8V14h-3v-3.7c0-1 0-2.2-1.4-2.2-1.4 0-1.6 1-1.6 2.1V14H7V6z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.6 1h2.4L9.8 6.8 16 15h-4.5l-3.7-4.8L3.5 15H1l5.5-6.3L0 1h4.6l3.3 4.3L12.6 1zm-.8 12.6h1.3L4.3 2.4H2.9l8.9 11.2z" />
    </svg>
  );
}

// ══ ABOUT PAGE ═══════════════════════════════════════════════════════════════

export function AboutPage() {
  useReveal();

  return (
    <main>
      {/* ── Hero ── */}
      <section
        className="relative min-h-[55vh] flex items-end px-8 md:px-14 pb-16 pt-40 overflow-hidden"
        style={{ background: "var(--hero-bg)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(201,125,10,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(201,125,10,.05) 1px,transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage:
              "radial-gradient(ellipse 90% 90% at 50% 50%,black 30%,transparent 100%)",
          }}
        />
        <div
          className="absolute pointer-events-none w-[600px] h-[600px] rounded-full top-[-200px] right-[-100px]"
          style={{
            background:
              "radial-gradient(circle, rgba(201,125,10,.08) 0%, transparent 70%)",
            animation: "floatGlow 8s ease-in-out infinite",
          }}
        />
        <div
          className="relative z-10 max-w-3xl"
          style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-5 h-px bg-[var(--accent)]" />
            <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">
              About Us
            </span>
          </div>
          <h1
            className="font-syne text-[clamp(40px,6vw,80px)] font-extrabold leading-none tracking-tight mb-5"
            style={{ color: "var(--hero-text)" }}
          >
            We exist to make
            <br />
            <em className="not-italic text-[var(--accent)]">great products.</em>
          </h1>
          <p
            className="text-[17px] font-light leading-relaxed max-w-xl"
            style={{ color: "var(--hero-muted)" }}
          >
            {SITE_CONFIG.description}
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="bg-[var(--bg-panel)] border-y border-[var(--border)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-8 md:px-14 py-8 grid grid-cols-3 gap-6 text-center">
          {HERO_STATS.map(({ target, suffix, label }) => (
            <div key={label}>
              <div className="font-syne text-3xl font-extrabold text-[var(--accent)]">
                {target}
                {suffix}
              </div>
              <div className="font-mono text-[10px] text-[var(--ink4)] tracking-wider uppercase mt-1">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-base)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="reveal">
            <SectionHead
              tag="Our Mission"
              heading={
                <>
                  Intelligence &amp;{" "}
                  <em className="not-italic text-[var(--accent)]">craft,</em>{" "}
                  combined.
                </>
              }
            />
            <p className="text-base font-light text-[var(--ink3)] leading-relaxed mb-5">
              We started ZynHive because we saw a gap: companies need digital
              products that actually move business metrics, not just look good in
              a Figma file. Most agencies deliver one or the other. We deliver
              both.
            </p>
            <p className="text-base font-light text-[var(--ink3)] leading-relaxed mb-8">
              Our team is deliberately small and senior. We work with a limited
              number of clients at a time so that every project gets the
              strategic attention it deserves. Quality compounds.
            </p>
            <LinkButton href="/contact" variant="accent" size="md">
              Start a Project →
            </LinkButton>
          </div>

          {/* Values grid */}
          <div className="reveal reveal-d2">
            <div className="grid grid-cols-2 gap-4">
              {VALUES.map(({ title, desc, icon }, i) => (
                <div
                  key={title}
                  className={`p-5 bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl
                    hover:border-[var(--accent-pale2)] transition-all duration-300 reveal reveal-d${i + 1}`}
                >
                  {/* SVG icon */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 border border-[var(--border2)]"
                    style={{ background: "var(--bg-panel)" }}
                  >
                    {icon("var(--accent)")}
                  </div>
                  <h4 className="font-syne text-sm font-bold text-[var(--ink)] mb-2">
                    {title}
                  </h4>
                  <p className="text-xs font-light text-[var(--ink3)] leading-relaxed">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Founders ── */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-alt)] transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="The Team"
            heading={
              <>
                Built by{" "}
                <em className="not-italic text-[var(--accent)]">builders.</em>
              </>
            }
            sub="Two practitioners who've shipped real products — now helping others do the same."
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {FOUNDERS.map((f, i) => (
              <div
                key={f.name}
                className={`group relative overflow-hidden rounded-2xl border border-[var(--border2)]
                  bg-[var(--bg-surface)] p-7 transition-all duration-500 reveal reveal-d${i + 1}
                  hover:border-[var(--border)]`}
                style={
                  {
                    "--founder-color": f.color,
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = `0 20px 50px ${f.color}14`;
                  el.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "";
                  el.style.transform = "";
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden"
                >
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* Subtle bg glow */}
                <div
                  className="absolute top-0 right-0 pointer-events-none w-48 h-48 rounded-full"
                  style={{
                    background: `radial-gradient(circle, ${f.color}0a, transparent 70%)`,
                    transform: "translate(30%, -30%)",
                  }}
                />

                <div className="relative z-10">
                  {/* Avatar + name row */}
                  <div className="flex items-start gap-5 mb-6">
                    {/* Avatar — swap the <img> comment below for a real photo */}
                    <FounderAvatar initials={f.initials} color={f.color} size={80} />

                    <div className="flex-1 min-w-0 pt-1">
                      {/* Role badge */}
                      <span
                        className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em]
                          uppercase font-semibold px-2.5 py-1 rounded-lg mb-2"
                        style={{
                          color: f.color,
                          background: `${f.color}12`,
                          border: `1px solid ${f.color}25`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: f.color }}
                        />
                        {f.role}
                      </span>

                      <h3
                        className="font-syne text-[20px] font-extrabold tracking-tight leading-tight"
                        style={{ color: "var(--ink)" }}
                      >
                        {f.name}
                      </h3>
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    className="h-px mb-5"
                    style={{
                      background: `linear-gradient(90deg, ${f.color}30, transparent)`,
                    }}
                  />

                  {/* Bio */}
                  <p
                    className="text-[13.5px] font-light leading-relaxed mb-6"
                    style={{ color: "var(--ink3)", lineHeight: "1.8" }}
                  >
                    {f.bio}
                  </p>

                  {/* Socials */}
                  <div className="flex gap-2">
                    {f.socials.linkedin && (
                      <SocialLink
                        href={f.socials.linkedin}
                        label="LinkedIn"
                        color={f.color}
                      >
                        <LinkedInIcon className="w-3.5 h-3.5" />
                      </SocialLink>
                    )}
                    {f.socials.twitter && (
                      <SocialLink
                        href={f.socials.twitter}
                        label="Twitter / X"
                        color={f.color}
                      >
                        <TwitterIcon className="w-3.5 h-3.5" />
                      </SocialLink>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="px-8 md:px-14 py-28 bg-[var(--bg-base)] transition-colors duration-500">
        <div className="max-w-4xl mx-auto">
          <SectionHead
            tag="Our Journey"
            heading={
              <>
                From{" "}
                <em className="not-italic text-[var(--accent)]">zero</em> to
                impact.
              </>
            }
          />
          <div className="relative pl-6 border-l border-[var(--accent-pale2)]">
            {MILESTONES.map(({ year, title, desc }, i) => (
              <div
                key={i}
                className={`relative mb-12 last:mb-0 reveal reveal-d${(i % 3) + 1}`}
              >
                {/* Timeline dot */}
                <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--accent)]" />
                <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.1em] uppercase mb-1 block">
                  {year}
                </span>
                <h3 className="font-syne text-lg font-bold text-[var(--ink)] mb-1.5 tracking-tight">
                  {title}
                </h3>
                <p className="text-sm font-light text-[var(--ink3)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}