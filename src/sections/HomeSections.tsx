import { useState, useEffect, useRef } from "react";
import {
  MARQUEE_ITEMS, SERVICES, PROCESS_STEPS,
  TECH_STACK_AI, TECH_STACK_WEB, TECH_STACK_INFRA,
  TESTIMONIALS, SITE_CONFIG, INTRO_BULLETS,
} from "../lib/data";
import { SectionHead, LinkButton } from "../components/ui/index";
import {  WhatsAppIcon } from "../components/ui/Icons";
import { ServiceCard } from "../components/ui/Cards";

// ─── Animated Counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return count;
}

// ══ MARQUEE ══════════════════════════════════════════════════════════════════
export function MarqueeSection() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div
      className="overflow-hidden border-t border-b border-[var(--border)] py-4 relative"
      style={{ background: "var(--marquee-bg)" }}
    >
      <div
        className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(90deg, var(--marquee-bg), transparent)" }}
      />
      <div
        className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
        style={{ background: "linear-gradient(-90deg, var(--marquee-bg), transparent)" }}
      />
      <div
        className="flex"
        style={{ width: "max-content", animation: "marquee 34s linear infinite" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-7 whitespace-nowrap"
            style={{ color: "rgba(232,237,255,0.35)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: "var(--accent)" }}
            />
            <span className="font-mono text-[10px] font-medium tracking-[0.18em] uppercase">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ INTRO / ABOUT ═════════════════════════════════════════════════════════════
export function IntroSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const c1 = useCounter(120, 1600, visible);
  const c2 = useCounter(98,  1800, visible);
  const c3 = useCounter(5,   1400, visible);

  const stats = [
    { value: c1, suffix: "+",  label: "Projects" },
    { value: c2, suffix: "%",  label: "Satisfaction" },
    { value: c3, suffix: "yr", label: "Experience" },
  ];

  return (
    <section ref={ref} className="px-6 md:px-14 py-32 bg-[var(--bg-alt)]" id="about">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

        {/* ── Left ──────────────────────────────────────────────────────── */}
        <div className="reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-7 rounded-full
            border border-[var(--accent-pale2)] bg-[var(--accent-pale)]">
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
              style={{ animation: "bPulse 2s infinite" }}
            />
            <span className="font-mono text-[10px] text-[var(--accent)] tracking-[0.16em] uppercase">
              Who We Are
            </span>
          </div>

          <h2
            className="font-display font-bold text-[var(--ink)] leading-[1.08] tracking-tight mb-5"
            style={{ fontSize: "clamp(26px,3.2vw,48px)" }}
          >
            Where{" "}
            <span className="text-gradient-blue">Intelligence</span>
            <br />Meets Design Excellence
          </h2>

          <p className="text-[15px] text-[var(--ink3)] leading-[1.9] mb-9 font-body max-w-[460px]">
            ZynHive is an AI-first digital agency built for the intelligence era.
            We combine deep LLM expertise with sharp creative vision to build products
            that don't just work — they{" "}
            <span className="text-[var(--accent)] font-semibold">think</span>,
            adapt, and grow with your business.
          </p>

          <ul className="flex flex-col gap-3 mb-10">
            {INTRO_BULLETS.map((b, i) => (
              <li
                key={i}
                className={`flex items-center gap-3 text-[14px] text-[var(--ink2)] font-body reveal reveal-d${i + 1}`}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0
                    border border-[var(--accent-pale2)] bg-[var(--accent-pale)]"
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l2 2 3-3" stroke="var(--accent)" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {b}
              </li>
            ))}
          </ul>

          {/* Stats row */}
          <div
            className="grid grid-cols-3 divide-x divide-[var(--border)] rounded-2xl
              overflow-hidden border border-[var(--border2)]"
            style={{ background: "var(--bg-surface)" }}
          >
            {stats.map(({ value, suffix, label }, i) => (
              <div key={i} className="flex flex-col items-center py-5 px-3 text-center">
                <span className="font-display text-[26px] font-bold leading-none mb-1 text-gradient-blue">
                  {value}{suffix}
                </span>
                <span className="font-mono text-[9px] text-[var(--ink4)] tracking-[0.12em] uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right — Orbit visual ───────────────────────────────────────── */}
        <div className="reveal reveal-d2 relative h-[420px] hidden lg:block">

          {/* Glow core */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, var(--accent-pale) 0%, transparent 70%)",
              animation: "rPulse 4s ease-in-out infinite",
            }}
          />

          {/* Ring 1 */}
          <div
            className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full border border-[var(--border2)]"
            style={{ transform: "translate(-50%,-50%)", animation: "orbitSpin 18s linear infinite" }}
          >
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--accent)]"
              style={{ boxShadow: "0 0 16px var(--accent-dim)" }}
            />
          </div>

          {/* Ring 2 */}
          <div
            className="absolute top-1/2 left-1/2 w-[360px] h-[360px] rounded-full border border-[var(--border)]"
            style={{ transform: "translate(-50%,-50%)", animation: "orbitSpin 26s linear infinite reverse" }}
          >
            <div
              className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--cyan)]"
              style={{ boxShadow: "0 0 12px var(--cyan)" }}
            />
            <div
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--accent2)]"
              style={{ boxShadow: "0 0 8px var(--accent2)" }}
            />
          </div>

          {/* Center card */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10
              w-44 h-44 rounded-2xl border border-[var(--border2)]
              flex flex-col items-center justify-center gap-2"
            style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-lg)" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-1"
              style={{ background: "var(--accent-pale)", border: "1px solid var(--accent-pale2)" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="8"  cy="9"  r="2.5" stroke="var(--accent)"  strokeWidth="1.2"/>
                <circle cx="16" cy="9"  r="2.5" stroke="var(--cyan)"   strokeWidth="1.2"/>
                <circle cx="12" cy="17" r="2.5" stroke="var(--accent2)" strokeWidth="1.2"/>
                <path d="M10.5 9h3M9.5 11L12 14.5M14.5 11L12 14.5"
                  stroke="var(--ink4)" strokeWidth="0.9" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-mono text-[9px] text-[var(--accent)] tracking-[0.14em] uppercase">AI Core</span>
            <span className="font-display text-[11px] font-semibold text-[var(--ink3)] text-center leading-tight px-4">
              Always Learning
            </span>
          </div>

          {/* Floating chips */}
          {[
            { top: "4%",  left: "62%", label: "LLM Ready", val: "GPT-4o",  color: "var(--accent)",  delay: "0s"   },
            { top: "70%", left: "58%", label: "Accuracy",   val: "97.3%",   color: "var(--cyan)",    delay: "1s"   },
            { top: "12%", left: "0%",  label: "Response",   val: "< 1ms",   color: "var(--accent2)", delay: "0.5s" },
            { top: "66%", left: "-4%", label: "Uptime",     val: "99.9%",   color: "var(--accent)",  delay: "1.5s" },
          ].map((c, i) => (
            <div
              key={i}
              className="absolute z-20 rounded-xl border border-[var(--border2)] px-3.5 py-2.5"
              style={{
                top: c.top, left: c.left,
                background: "var(--bg-surface)",
                boxShadow: "var(--shadow-md)",
                animation: `float${i % 2 === 0 ? "A" : "B"} ${3.8 + i * 0.5}s ${c.delay} ease-in-out infinite`,
              }}
            >
              <div className="font-mono text-[9px] text-[var(--ink4)] mb-0.5">{c.label}</div>
              <div className="font-display text-[13px] font-bold" style={{ color: c.color }}>{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes orbitSpin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}`}</style>
    </section>
  );
}

// ══ SERVICES PREVIEW ══════════════════════════════════════════════════════════
export function ServicesPreviewSection() {
  return (
    <section className="px-6 md:px-14 py-32 bg-[var(--bg-base)] relative overflow-hidden" id="services">

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-pale) 0%, transparent 65%)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHead
          tag="What We Build"
          heading={<>Services Powered by{" "}<span className="text-gradient-blue">Artificial Intelligence</span></>}
          sub="Every service we offer is enhanced by AI — from design research to deployment monitoring. One investment that compounds."
        />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden reveal"
          style={{ background: "var(--border)", border: "1px solid var(--border2)" }}
        >
          {SERVICES.map((svc, i) => (
            <ServiceCard key={svc.id} service={svc} index={i} />
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 reveal">
          {["GPT-4o Powered", "LangChain", "RAG Pipelines", "Real-time AI", "Custom LLMs"].map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                font-mono text-[10px] text-[var(--ink4)] tracking-[0.1em]
                border border-[var(--border2)] bg-[var(--bg-surface)]"
            >
              <span className="w-1 h-1 rounded-full bg-[var(--accent)]" />
              {badge}
            </span>
          ))}
        </div>

        <div className="mt-10 text-center reveal">
          <a
            href="/services"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl
              font-display text-[14px] font-semibold tracking-tight
              transition-all duration-200 group"
            style={{
              color: "var(--accent)",
              border: "1.5px solid var(--accent)",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "var(--accent)";
              el.style.color      = "white";
              el.style.boxShadow  = "0 8px 24px var(--accent-dim)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = "transparent";
              el.style.color      = "var(--accent)";
              el.style.boxShadow  = "none";
            }}
          >
            View All Services
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              <path d="M3 7h8M8 4l3 3-3 3"
                stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// ══ PROCESS ═══════════════════════════════════════════════════════════════════
export function ProcessSection() {
  const [active, setActive] = useState(0);
  const step = PROCESS_STEPS[active];

  const aiInsights: Record<string, string> = {
    "Discovery & Strategy":  "AI auto-generates a competitive landscape and gap analysis for your market.",
    "Design & Prototyping":  "Generative AI creates 50+ design variants — our team curates the best.",
    "Development & Build":   "AI code review catches 80% of bugs before they reach production.",
    "Testing & QA":          "ML simulates 10,000+ user flows, covering every edge case instantly.",
    "Deployment & Launch":   "AI monitors health, auto-scales resources, and alerts on anomalies 24/7.",
  };

  return (
    <section className="px-6 md:px-14 py-32 bg-[var(--bg-alt)]" id="process">
      <div className="max-w-7xl mx-auto">
        <SectionHead
          tag="How We Work"
          heading={<>AI-Augmented{" "}<span className="text-gradient-blue">5-Step Process</span></>}
          sub="Every stage is supercharged by AI. Faster delivery, fewer errors, better outcomes."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">

          {/* Step list */}
          <div className="flex flex-col reveal">
            {PROCESS_STEPS.map((p, i) => (
              <button
                key={p.step}
                onClick={() => setActive(i)}
                className={`text-left flex gap-4 py-5 border-b border-[var(--border)] last:border-0
                  transition-all duration-300 ${active === i ? "pl-3" : "pl-0 hover:pl-2"}`}
              >
                <div
                  className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
                    font-mono text-[11px] font-bold transition-all duration-300 mt-0.5 ${
                    active === i
                      ? "text-white"
                      : "text-[var(--ink4)] border border-[var(--border2)] bg-[var(--bg-surface)]"
                  }`}
                  style={active === i ? {
                    background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                  } : {}}
                >
                  {p.step}
                </div>

                <div className="flex-1 min-w-0">
                  <div className={`font-display text-[15px] font-semibold leading-snug transition-colors duration-300 ${
                    active === i ? "text-[var(--ink)]" : "text-[var(--ink3)]"
                  }`}>
                    {p.title}
                  </div>

                  <div className={`overflow-hidden transition-all duration-[400ms] ${
                    active === i ? "max-h-32 mt-3 opacity-100" : "max-h-0 opacity-0"
                  }`}>
                    <p className="text-[13px] text-[var(--ink3)] leading-relaxed font-body mb-3">{p.desc}</p>
                    <div
                      className="inline-flex items-start gap-2 px-3 py-2 rounded-xl text-[11px]
                        border border-[var(--accent-pale2)] bg-[var(--accent-pale)]"
                    >
                      <span className="text-[var(--accent)] font-bold mt-0.5 flex-shrink-0">⚡</span>
                      <span className="font-body text-[var(--ink3)] leading-relaxed">
                        <span className="font-semibold text-[var(--accent)]">AI: </span>
                        {aiInsights[p.title]}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`h-px mt-3 transition-all duration-500 ${active === i ? "w-full" : "w-0"}`}
                    style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Visual panel */}
          <div
            className="relative rounded-2xl border border-[var(--border2)] min-h-[460px] hidden lg:flex
              items-center justify-center overflow-hidden sticky top-24 reveal reveal-d2"
            style={{ background: "var(--bg-surface)" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, var(--accent-pale) 0%, transparent 70%)" }}
            />

            {[180, 260, 340].map((size, i) => (
              <div
                key={i}
                className="absolute rounded-full border border-[var(--border2)] top-1/2 left-1/2"
                style={{
                  width: size, height: size,
                  transform: "translate(-50%,-50%)",
                  animation: `rPulse 3s ${i * 0.9}s ease-in-out infinite`,
                }}
              />
            ))}

            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10
                w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                boxShadow: "0 0 48px var(--accent-dim)",
              }}
            >
              <span className="font-mono text-white text-xl font-bold">{step.step}</span>
            </div>

            <div className="absolute bottom-8 left-0 right-0 px-8 z-10 text-center">
              <p className="font-display text-[20px] font-bold text-[var(--ink)] tracking-tight mb-4">
                {step.title}
              </p>
              <div className="flex items-center justify-center gap-2">
                {PROCESS_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: i === active ? 24 : 8,
                      height: 8,
                      background: i === active
                        ? "linear-gradient(90deg, var(--accent), var(--cyan))"
                        : "var(--border2)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="absolute top-6 left-0 right-0 text-center z-10">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono
                  text-[9px] tracking-[0.14em] uppercase border border-[var(--accent-pale2)]
                  text-[var(--accent)] bg-[var(--accent-pale)]"
              >
                <span className="w-1 h-1 rounded-full bg-[var(--accent)]" style={{ animation: "bPulse 2s infinite" }} />
                AI Augmented
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ TECH STACK ════════════════════════════════════════════════════════════════
export function TechSection() {
  const [tab, setTab] = useState(0);

  const categories = [
    { label: "AI & Machine Learning", short: "AI",    items: TECH_STACK_AI,    color: "var(--accent)"  },
    { label: "Web & Mobile",          short: "Web",   items: TECH_STACK_WEB,   color: "var(--cyan)"    },
    { label: "Infrastructure",        short: "Infra", items: TECH_STACK_INFRA, color: "var(--accent2)" },
  ];

  const cur = categories[tab];

  return (
    <section className="px-6 md:px-14 py-32 bg-[var(--bg-base)] relative overflow-hidden" id="tech">
      <div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--accent-pale) 0%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHead
          tag="Our Stack"
          heading={<>Technologies That{" "}<span className="text-gradient-cyan">Power Results</span></>}
          sub="Industry-leading tools selected for performance, reliability, and AI compatibility."
        />

        <div
          className="flex gap-1 p-1.5 rounded-2xl mb-8 w-fit mx-auto reveal border border-[var(--border2)]"
          style={{ background: "var(--bg-surface)" }}
        >
          {categories.map((c, i) => (
            <button
              key={c.short}
              onClick={() => setTab(i)}
              className={`px-6 py-2.5 rounded-xl font-display text-[12px] font-semibold
                transition-all duration-300 ${
                tab === i ? "text-white" : "text-[var(--ink4)] hover:text-[var(--ink3)]"
              }`}
              style={tab === i ? {
                background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                boxShadow: "0 4px 16px var(--accent-dim)",
              } : {}}
            >
              {c.short}
            </button>
          ))}
        </div>

        <div
          className="rounded-2xl border border-[var(--border2)] p-8 reveal"
          style={{ background: "var(--bg-surface)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: cur.color, boxShadow: `0 0 8px ${cur.color}` }}
            />
            <span
              className="font-mono text-[10px] tracking-[0.14em] uppercase font-bold"
              style={{ color: cur.color }}
            >
              {cur.label}
            </span>
            <span className="font-mono text-[10px] text-[var(--ink4)]">
              — {cur.items.length} technologies
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {cur.items.map((tech) => (
              <span
                key={tech}
                className="group relative font-mono text-[11px] px-4 py-2 rounded-xl
                  border border-[var(--border2)] text-[var(--ink3)] bg-[var(--bg-panel)]
                  hover:text-[var(--ink)] hover:border-[var(--border)] transition-all duration-200
                  overflow-hidden cursor-default"
              >
                <span
                  className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${cur.color}, transparent)` }}
                />
                <span className="relative z-10">{tech}</span>
              </span>
            ))}
          </div>

          <div
            className="mt-8 pt-6 border-t border-[var(--border)] flex items-center gap-3
              px-4 py-3 rounded-xl bg-[var(--accent-pale)]"
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0
                border border-[var(--accent-pale2)]"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M5.5 1l1.2 2.8H9L7 5.4l.7 2.9L5.5 7l-2.2 1.3.7-2.9L2 3.8h2.3L5.5 1z"
                  stroke="var(--accent)" strokeWidth="0.8" strokeLinejoin="round" fill="var(--accent-pale2)"/>
              </svg>
            </div>
            <p className="text-[12px] font-body text-[var(--ink3)] leading-relaxed">
              <span className="font-semibold text-[var(--accent)]">AI-first by design.</span>{" "}
              Every tool is evaluated for AI compatibility, automation potential, and long-term scalability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ══ TESTIMONIALS ══════════════════════════════════════════════════════════════
export function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((p) => (p + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(id);
  }, [paused]);

  const t = TESTIMONIALS[active];

  return (
    <section className="px-6 md:px-14 py-32 bg-[var(--bg-alt)] relative overflow-hidden" id="testimonials">
      <div
        className="absolute top-8 right-8 font-display text-[220px] leading-none
          pointer-events-none select-none font-bold"
        style={{ color: "var(--accent)", opacity: 0.04 }}
      >
        "
      </div>

      <div className="max-w-7xl mx-auto">
        <SectionHead
          tag="Client Stories"
          heading={<>Trusted by{" "}<span className="text-gradient-blue">Industry Leaders</span></>}
          sub="Real outcomes. Real companies. Real AI impact."
        />

        {/* Featured card */}
        <div
          className="rounded-2xl border border-[var(--border2)] p-8 md:p-12 mb-5 reveal
            relative overflow-hidden cursor-pointer"
          style={{ background: "var(--bg-surface)" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="absolute top-0 left-0 w-[300px] h-[300px] pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--accent-pale) 0%, transparent 65%)" }}
          />
          <div
            className="absolute top-0 left-8 right-8 h-px"
            style={{ background: "linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)" }}
          />

          <div className="relative z-10 max-w-3xl">
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="var(--accent)">
                  <path d="M7 1l1.6 3.4 3.7.5-2.7 2.6.6 3.7L7 9.3l-3.2 1.9.6-3.7L1.7 4.9l3.7-.5L7 1z"/>
                </svg>
              ))}
            </div>

            <blockquote
              className="font-display font-semibold text-[var(--ink)] leading-[1.55] mb-7
                transition-all duration-500"
              style={{ fontSize: "clamp(16px,2vw,22px)" }}
            >
              "{t.text}"
            </blockquote>

            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center
                  text-sm font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
              >
                {t.initials}
              </div>
              <div>
                <div className="font-display text-[14px] font-bold text-[var(--ink)]">{t.name}</div>
                <div className="font-mono text-[10px] text-[var(--ink4)] tracking-[0.08em]">
                  {t.role} · {t.company}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 reveal">
          {TESTIMONIALS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => { setActive(i); setPaused(true); }}
              className={`rounded-xl border p-3 text-left transition-all duration-300 ${
                active === i ? "border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--border2)]"
              }`}
              style={{ background: active === i ? "var(--accent-pale)" : "var(--bg-surface)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{
                    background: active === i ? "linear-gradient(135deg, var(--accent), var(--cyan))" : "var(--bg-panel)",
                    color: active === i ? "white" : "var(--ink4)",
                    border: active === i ? "none" : "1px solid var(--border2)",
                  }}
                >
                  {item.initials}
                </div>
                <div>
                  <div className="font-display text-[11px] font-semibold text-[var(--ink)] leading-none truncate">
                    {item.name.split(" ")[0]}
                  </div>
                  <div className="font-mono text-[9px] text-[var(--ink4)] truncate">{item.company}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══ AI CAPABILITIES ═══════════════════════════════════════════════════════════
export function AICapabilitiesSection() {
  const caps = [
    {
      title: "LLM Integration",
      desc:  "Connect GPT-4o, Claude, Gemini, or custom fine-tuned models to your product in days, not months.",
      color: "#3B6EF8",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="2" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M6 10h8M10 6v8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      title: "AI Automation",
      desc:  "End-to-end workflow automation that learns, adapts, and executes without human intervention.",
      color: "#00AACC",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.3 4.3l1.8 1.8M13.9 13.9l1.8 1.8M4.3 15.7l1.8-1.8M13.9 6.1l1.8-1.8"
            stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      title: "Predictive Analytics",
      desc:  "ML models that forecast trends, user behavior, and business outcomes with measurable accuracy.",
      color: "#7B5CFA",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2 15l4-5 4 3 4-5 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="14" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      ),
    },
    {
      title: "RAG & Knowledge Base",
      desc:  "AI systems with long-term memory — document retrieval, vector search, grounded responses.",
      color: "#0DBFA8",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 2C6.7 2 4 4.7 4 8c0 3.7 3.5 6.5 6 9 2.5-2.5 6-5.3 6-9 0-3.3-2.7-6-6-6z"
            stroke="currentColor" strokeWidth="1.2"/>
          <circle cx="10" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      ),
    },
    {
      title: "Autonomous AI Agents",
      desc:  "Agents that browse, write, execute code, and complete complex multi-step tasks independently.",
      color: "#4D5BFF",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 3.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M7 11l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      title: "Model Fine-tuning",
      desc:  "Custom-trained models on your proprietary data for domain-specific intelligence and precision.",
      color: "#1A66FF",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="px-6 md:px-14 py-32 bg-[var(--bg-base)] relative overflow-hidden" id="ai">
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.4 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="0.8" fill="var(--accent-dim)"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)"/>
        </svg>
      </div>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)" }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <SectionHead
          tag="AI Capabilities"
          heading={<>The Full Spectrum of{" "}<span className="text-gradient-blue">AI Services</span></>}
          sub="From simple integrations to fully autonomous AI systems — we build what tomorrow demands."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {caps.map((cap, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl border border-[var(--border2)] p-6
                transition-all duration-500 overflow-hidden cursor-default
                hover:-translate-y-0.5 hover:border-[var(--border)] reveal reveal-d${(i % 3) + 1}`}
              style={{ background: "var(--bg-surface)" }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 20% 20%, ${cap.color}0d, transparent 60%)` }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background: `${cap.color}14`,
                  color: cap.color,
                  border: `1px solid ${cap.color}22`,
                }}
              >
                {cap.icon}
              </div>
              <h3 className="font-display text-[15px] font-bold text-[var(--ink)] mb-2">
                {cap.title}
              </h3>
              <p className="text-[13px] text-[var(--ink3)] leading-relaxed font-body">{cap.desc}</p>
              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${cap.color}80, transparent)` }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ══ CTA ═══════════════════════════════════════════════════════════════════════
export function CTASection() {
  return (
    <section
      className="relative px-6 md:px-14 py-32 grid place-items-center text-center overflow-hidden"
      style={{ background: "var(--navy)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(59,110,248,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(59,110,248,0.06) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 700, height: 450,
          background: "radial-gradient(ellipse, rgba(59,110,248,0.2) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)" }}
      />

      {/* Ambient dots */}
      {[
        { t: "12%", l: "7%",  s: 5, c: "rgba(91,139,255,0.8)",  d: "0s"   },
        { t: "78%", l: "4%",  s: 3, c: "rgba(0,212,255,0.7)",   d: "0.8s" },
        { t: "18%", r: "7%",  s: 4, c: "rgba(91,139,255,0.6)",  d: "0.4s" },
        { t: "72%", r: "5%",  s: 3, c: "rgba(0,212,255,0.6)",   d: "1.2s" },
        { t: "45%", l: "2%",  s: 2, c: "rgba(91,139,255,0.5)",  d: "1.6s" },
        { t: "38%", r: "2%",  s: 2, c: "rgba(0,212,255,0.5)",   d: "0.6s" },
      ].map((n, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: n.t, left: (n as any).l, right: (n as any).r,
            width: n.s, height: n.s,
            background: n.c,
            boxShadow: `0 0 ${n.s * 4}px ${n.c}`,
            animation: `bPulse 3s ${n.d} ease-in-out infinite`,
          }}
        />
      ))}

      <div className="relative z-10 max-w-2xl reveal">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border"
          style={{ background: "rgba(91,139,255,0.08)", borderColor: "rgba(91,139,255,0.2)" }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ background: "#00D4FF" }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ background: "#00D4FF" }}
            />
          </span>
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold"
            style={{ color: "#00D4FF" }}>
            AI Systems Ready · Let's Build
          </span>
        </div>

        {/* Heading */}
        <h2
          className="font-display font-bold leading-[1.05] tracking-tight mb-5"
          style={{ fontSize: "clamp(30px,5vw,64px)", color: "#F4F6FF" }}
        >
          Ready to{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #5B8BFF, #00D4FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Transform
          </span>
          <br />Your Business with AI?
        </h2>

        <p
          className="text-[15px] leading-[1.85] mb-10 font-body max-w-md mx-auto"
          style={{ color: "rgba(232,237,255,0.58)" }}
        >
          One conversation. We'll map where AI creates the most leverage in your business
          and hand you a concrete plan — no fluff, no jargon, no sales pitch.
        </p>

        <div className="flex gap-3 justify-center flex-wrap mb-12">
          <LinkButton href={SITE_CONFIG.whatsapp} variant="whatsapp" size="lg" external>
            <WhatsAppIcon className="w-4 h-4" />
            Chat on WhatsApp
          </LinkButton>
          <LinkButton href="/contact" variant="outline" size="lg">
            Send a Message →
          </LinkButton>
        </div>

        {/* Trust strip */}
        <div
          className="flex flex-wrap justify-center gap-5 pt-7 border-t"
          style={{ borderColor: "rgba(59,110,248,0.2)" }}
        >
          {[
            { icon: "🔒", text: "No lock-in contracts" },
            { icon: "⚡", text: "48hr response time"   },
            { icon: "🤖", text: "Free AI audit call"   },
            { icon: "📄", text: "NDA on request"       },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 text-[12px] font-body"
              style={{ color: "rgba(232,237,255,0.42)" }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}