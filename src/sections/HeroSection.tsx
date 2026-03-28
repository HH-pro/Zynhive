import { useEffect, useRef } from "react";
import { HERO_WORDS, HERO_STATS, SITE_CONFIG } from "../lib/data";
import { useTypewriter, useCounter, useInView } from "../hooks/index";
import { LinkButton, ArrowRightIcon } from "../components/ui/index";
import { WhatsAppIcon } from "../components/ui/Icons";

// ─── Neural Network Canvas ────────────────────────────────────────────────────
function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const nodeCount = Math.min(55, Math.floor((canvas.width * canvas.height) / 16000));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      r:     Math.random() * 1.6 + 0.7,
      pulse: Math.random() * Math.PI * 2,
    }));

    const CONNECT_DIST = 158;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.018;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.17;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(99,129,255,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,129,255,${0.35 + glow * 0.45})`;
        ctx.fill();

        if (n.r > 1.4) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 3 + glow * 3.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(6,182,212,${0.07 + glow * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.65 }}
    />
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({
  target,
  suffix,
  label,
}: {
  target: number;
  suffix: string;
  label: string;
}) {
  const [ref, inView] = useInView(0.4);
  const count = useCounter(target, 2000, inView);
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div
        className="font-display leading-none tracking-tight"
        style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 800, color: "#fff" }}
      >
        {count}
        <em
          className="not-italic"
          style={{
            fontSize: "0.7em",
            fontWeight: 700,
            background: "linear-gradient(110deg,var(--accent2),var(--cyan))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {suffix}
        </em>
      </div>
      <div
        className="font-mono uppercase tracking-widest"
        style={{ fontSize: "9px", color: "rgba(244,246,255,0.3)", letterSpacing: "0.1em" }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── Performance Card (floating right) ───────────────────────────────────────
function PerfCard() {
  const metrics = [
    { label: "Model Accuracy", val: 94, color: "linear-gradient(90deg,var(--accent),var(--accent2))" },
    { label: "Latency Reduction", val: 78, color: "linear-gradient(90deg,var(--cyan),#22d3ee)" },
    { label: "Uptime SLA", val: 99, color: "linear-gradient(90deg,#10b981,#34d399)" },
  ];

  return (
    <div
      className="absolute right-6 md:right-14 top-1/2 -translate-y-1/2 z-10 hidden xl:flex flex-col gap-5"
      style={{
        width: 272,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: 20,
        padding: "24px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "heroUp 1s 0.55s var(--ease) both",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg,rgba(74,108,247,0.45),rgba(6,182,212,0.3))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(165,180,252,.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(244,246,255,.88)", lineHeight: 1.3 }}>
            Live Metrics
          </div>
          <div style={{ fontSize: 11, color: "rgba(244,246,255,.35)", marginTop: 1 }}>
            AI pipeline · production
          </div>
        </div>
      </div>

      {/* Bars */}
      {metrics.map((m) => (
        <div key={m.label} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span
              className="font-mono uppercase"
              style={{ fontSize: 9, letterSpacing: "0.08em", color: "rgba(244,246,255,.32)" }}
            >
              {m.label}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(244,246,255,.75)" }}>
              {m.val}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 4,
              background: "rgba(255,255,255,0.07)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${m.val}%`,
                borderRadius: 4,
                background: m.color,
              }}
            />
          </div>
        </div>
      ))}

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4 }}>
        {[
          { label: "Production live", dot: true },
          { label: "Lahore HQ" },
          { label: "24 / 7 support" },
        ].map((t) => (
          <span
            key={t.label}
            className="font-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 10px",
              borderRadius: 8,
              background: "rgba(74,108,247,0.10)",
              border: "1px solid rgba(74,108,247,0.18)",
              fontSize: 9,
              letterSpacing: "0.04em",
              color: "rgba(165,180,252,.75)",
            }}
          >
            {t.dot && (
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 6px #4ade80",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
            )}
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const typed = useTypewriter(HERO_WORDS, 72, 2300);

  const CAPS = ["GPT-4o", "Claude 3.5", "LangChain", "RAG Pipelines", "AI Agents", "Fine-Tuning", "Next.js", "FastAPI"];

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-14 pt-[120px] pb-24"
      style={{ background: "var(--hero-bg)" }}
    >
      {/* Neural network bg */}
      <NeuralCanvas />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,110,248,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,110,248,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 10%, transparent 100%)",
          animation: "gridPulse 5s ease-in-out infinite",
        }}
      />

      {/* Orb — top right */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "-15%", right: "-8%",
          width: 700, height: 700,
          background: "radial-gradient(circle, rgba(74,108,247,0.14) 0%, rgba(74,108,247,0.04) 45%, transparent 70%)",
          animation: "floatGlow 9s ease-in-out infinite",
        }}
      />
      {/* Orb — bottom left */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          bottom: "-12%", left: "0%",
          width: 560, height: 560,
          background: "radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)",
          animation: "floatGlow 12s ease-in-out infinite reverse",
        }}
      />
      {/* Orb — mid accent */}
      <div
        className="absolute pointer-events-none rounded-full"
        style={{
          top: "40%", left: "55%",
          width: 320, height: 320,
          background: "radial-gradient(circle, rgba(99,129,255,0.07) 0%, transparent 70%)",
          animation: "floatGlow 7s ease-in-out infinite",
        }}
      />

      {/* Available badge */}
      <div
        className="absolute top-28 right-6 md:right-14 z-10 hidden sm:flex items-center gap-2 px-3 py-2 rounded-full"
        style={{
          animation: "heroUp 1s 0.65s var(--ease) both",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.11)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px #4ade80, 0 0 20px rgba(74,222,128,0.4)",
            animation: "bPulse 2s ease-in-out infinite",
          }}
        />
        <span
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(244,246,255,0.65)" }}
        >
          Available for projects
        </span>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-4xl w-full">

        {/* Eyebrow */}
        <div
          className="flex items-center gap-3 mb-7"
          style={{ animation: "heroUp .8s var(--ease) both" }}
        >
          <div
            className="flex-shrink-0"
            style={{
              width: 32, height: 1,
              background: "linear-gradient(90deg, var(--accent), var(--cyan))",
            }}
          />
          <span
            className="font-mono uppercase"
            style={{
              fontSize: 11, fontWeight: 500,
              color: "var(--accent)",
              letterSpacing: "0.18em",
            }}
          >
            {SITE_CONFIG.name} · AI-First Digital Agency · Est. {SITE_CONFIG.established}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display font-bold leading-[0.93] tracking-[-0.04em] mb-7"
          style={{
            fontSize: "clamp(50px,8.5vw,108px)",
            color: "var(--hero-text)",
            animation: "heroUp .9s .08s var(--ease) both",
          }}
        >
          <span className="block">We Build</span>

          {/* Animated gradient line */}
          <span
            className="block"
            style={{
              minHeight: "1.05em",
              paddingBottom: "0.02em",
              background: "linear-gradient(110deg,#ffffff 0%,#a5b4fc 40%,var(--cyan) 80%,#38bdf8 100%)",
              backgroundSize: "200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "gradientShift 5s ease-in-out infinite",
            }}
          >
            {typed}
            <span
              style={{
                fontWeight: 300,
                WebkitTextFillColor: "var(--cyan)",
                animation: "blink 1s step-end infinite",
              }}
            >
              |
            </span>
          </span>

          {/* Ghost outline */}
          <span
            className="block"
            style={{
              WebkitTextStroke: "1px rgba(232,240,255,0.10)",
              color: "transparent",
            }}
          >
            That Scale.
          </span>
        </h1>

        {/* Sub */}
        <p
          className="font-body leading-relaxed max-w-2xl mb-10"
          style={{
            fontSize: "clamp(15px,1.4vw,18px)",
            color: "var(--hero-muted)",
            animation: "heroUp .9s .16s var(--ease) both",
          }}
        >
          From{" "}
          <span style={{ color: "var(--cyan)", fontWeight: 500 }}>LLM fine-tuning</span>
          {" "}to pixel-perfect interfaces — we engineer AI products that automate workflows,
          delight users, and generate revenue. Lahore-based.{" "}
          <span style={{ color: "rgba(244,246,255,0.72)", fontWeight: 400 }}>Global delivery.</span>
        </p>

        {/* CTAs */}
        <div
          className="flex items-center gap-3 flex-wrap mb-10"
          style={{ animation: "heroUp .9s .24s var(--ease) both" }}
        >
          <LinkButton href="#services" variant="accent" size="lg">
            Explore Services
            <ArrowRightIcon />
          </LinkButton>
          <LinkButton href={SITE_CONFIG.whatsapp} variant="outline" size="lg" external>
            <WhatsAppIcon className="w-4 h-4" />
            Let's Talk
          </LinkButton>
        </div>

        {/* Capability pills */}
        <div
          className="flex flex-wrap gap-2 mb-14"
          style={{ animation: "heroUp .9s .32s var(--ease) both" }}
        >
          {CAPS.map((cap) => (
            <span
              key={cap}
              className="font-mono uppercase cursor-default"
              style={{
                fontSize: 10,
                padding: "6px 14px",
                borderRadius: 100,
                border: "1px solid rgba(255,255,255,0.09)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(244,246,255,0.42)",
                letterSpacing: "0.06em",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(74,108,247,0.4)";
                (e.currentTarget as HTMLElement).style.background  = "rgba(74,108,247,0.08)";
                (e.currentTarget as HTMLElement).style.color       = "rgba(165,180,252,.9)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
                (e.currentTarget as HTMLElement).style.background  = "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.color       = "rgba(244,246,255,0.42)";
              }}
            >
              {cap}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div
          className="flex items-center gap-8 flex-wrap"
          style={{
            paddingTop: 32,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            animation: "heroUp .9s .4s var(--ease) both",
          }}
        >
          {HERO_STATS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-8">
              <StatCounter {...s} />
              {i < HERO_STATS.length - 1 && (
                <div
                  style={{
                    width: 1,
                    height: 36,
                    background: "rgba(255,255,255,0.08)",
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Floating performance card */}
      <PerfCard />

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-6 md:left-14 z-10 items-center gap-3 hidden md:flex"
        style={{ animation: "heroUp .9s .55s var(--ease) both" }}
      >
        <div
          className="relative overflow-hidden"
          style={{ width: 1, height: 52, background: "rgba(255,255,255,0.08)" }}
        >
          <div
            className="absolute top-0 w-px"
            style={{
              height: "55%",
              background: "linear-gradient(to bottom, transparent, var(--accent))",
              animation: "scrollDown 1.9s ease-in-out infinite",
            }}
          />
        </div>
        <span
          className="font-mono uppercase"
          style={{
            fontSize: 9,
            letterSpacing: "0.14em",
            color: "rgba(244,246,255,0.25)",
            writingMode: "vertical-rl",
          }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}