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

    // Nodes
    const nodeCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 18000));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.5 + 0.8,
      pulse: Math.random() * Math.PI * 2,
    }));

    const CONNECT_DIST = 160;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.02;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x;
          const dy   = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.18;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(59,110,248,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59,110,248,${0.4 + glow * 0.4})`;
        ctx.fill();

        // Outer ring for some nodes
        if (n.r > 1.5) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r + 4 + glow * 3, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0,212,255,${0.08 + glow * 0.08})`;
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
      style={{ opacity: 0.7 }}
    />
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const [ref, inView] = useInView(0.5);
  const count = useCounter(target, 2000, inView);
  return (
    <div ref={ref} className="text-right">
      <div className="font-display text-[28px] font-bold text-[var(--ink)] leading-none tracking-tight">
        {count}
        <em className="not-italic text-gradient-blue text-xl">{suffix}</em>
      </div>
      <div className="font-mono text-[10px] text-[var(--ink4)] mt-1 tracking-[0.08em] uppercase">
        {label}
      </div>
    </div>
  );
}

// ─── HeroSection ─────────────────────────────────────────────────────────────
export function HeroSection() {
  const typed = useTypewriter(HERO_WORDS, 75, 2200);

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden px-6 md:px-14 pt-[120px] pb-24"
      style={{ background: "var(--hero-bg)" }}
    >
      {/* Neural network bg */}
      <NeuralCanvas />

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(59,110,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,110,248,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          animation: "gridPulse 4s ease-in-out infinite",
        }}
      />

      {/* Radial glow — top right */}
      <div
        className="absolute top-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,110,248,0.12) 0%, transparent 65%)" }}
      />
      {/* Cyan glow — bottom left */}
      <div
        className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 65%)" }}
      />

      {/* Available badge */}
      <div
        className="absolute top-28 right-6 md:right-14 z-10 hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-sm"
        style={{
          animation: "heroUp 1s 0.7s var(--ease) both",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: "#4ade80", animation: "bPulse 2s infinite", boxShadow: "0 0 6px #4ade80" }}
        />
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase" style={{ color: "rgba(244,246,255,0.7)" }}>
          Available for projects
        </span>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl w-full">

        {/* Eyebrow */}
        <div
          className="flex items-center gap-3 mb-7"
          style={{ animation: "heroUp .8s var(--ease) both" }}
        >
          <div className="w-8 h-px" style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }} />
          <span className="font-mono text-[11px] font-medium text-[var(--accent)] tracking-[0.16em] uppercase">
            {SITE_CONFIG.name} · AI-First Digital Agency · Est. {SITE_CONFIG.established}
          </span>
        </div>

        {/* Main headline */}
        <h1
          className="font-display font-bold leading-[0.95] tracking-[-0.04em] mb-6 text-[var(--hero-text)]"
          style={{
            fontSize: "clamp(48px,8vw,104px)",
            animation: "heroUp .9s .1s var(--ease) both",
          }}
        >
          <span className="block">We Build</span>

          {/* Animated gradient word */}
          <span
            className="block text-gradient-blue"
            style={{ minHeight: "1.1em" }}
          >
            {typed}
            <span
              className="text-[var(--cyan)]"
              style={{ animation: "blink 1s step-end infinite" }}
            >
              |
            </span>
          </span>

          {/* Outline ghost word */}
          <span
            className="block"
            style={{
              WebkitTextStroke: "1px rgba(232,240,255,0.12)",
              color: "transparent",
            }}
          >
            That Scale.
          </span>
        </h1>

        {/* Sub */}
        <p
          className="text-[16px] md:text-[18px] font-light leading-relaxed max-w-2xl mb-10 text-[var(--hero-muted)] font-body"
          style={{ animation: "heroUp .9s .2s var(--ease) both" }}
        >
          From <span className="text-[var(--cyan)] font-medium">LLM fine-tuning</span> to pixel-perfect interfaces —
          we engineer AI products that automate workflows, delight users, and generate revenue.
          Lahore-based. <span className="text-[var(--ink2)]">Global delivery.</span>
        </p>

        {/* CTAs */}
        <div
          className="flex items-center gap-3 flex-wrap mb-16"
          style={{ animation: "heroUp .9s .3s var(--ease) both" }}
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

        {/* AI capability pills */}
        <div
          className="flex flex-wrap gap-2"
          style={{ animation: "heroUp .9s .4s var(--ease) both" }}
        >
          {["GPT-4o", "Claude 3.5", "LangChain", "RAG Pipelines", "AI Agents", "Fine-Tuning"].map((cap) => (
            <span
              key={cap}
              className="font-mono text-[10px] px-3 py-1.5 rounded-full border border-[var(--border)]
                text-[var(--ink4)] bg-[var(--bg-surface)] hover:border-[var(--accent-pale2)]
                hover:text-[var(--accent)] transition-all duration-200 tracking-wide cursor-default"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-10 left-6 md:left-14 z-10 items-center gap-3 hidden md:flex"
        style={{ animation: "heroUp .9s .6s var(--ease) both" }}
      >
        <div className="relative w-px h-14 overflow-hidden bg-[var(--border)]">
          <div
            className="absolute top-0 w-px h-1/2 bg-gradient-to-b from-transparent to-[var(--accent)]"
            style={{ animation: "scrollDown 1.8s ease-in-out infinite" }}
          />
        </div>
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--ink4)]"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
      </div>

      {/* Stats — bottom right */}
      <div
        className="absolute bottom-10 right-6 md:right-14 z-10 hidden md:flex gap-10"
        style={{ animation: "heroUp .9s .5s var(--ease) both" }}
      >
        {HERO_STATS.map((s) => (
          <StatCounter key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}