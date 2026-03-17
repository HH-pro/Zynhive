// import { useReveal } from "../hooks/index";
// import { HeroSection } from "../sections/HeroSection";
// import {
//   MarqueeSection,
//   IntroSection,
//   ServicesPreviewSection,
//   ProcessSection,
//   TechSection,
//   TestimonialsSection,
//   CTASection,
// } from "../sections/HomeSections";

// export function HomePage() {
//   useReveal();
//   return (
//     <main>
//       <HeroSection />
//       <MarqueeSection />
//       <IntroSection />
//       <ServicesPreviewSection />
//       <ProcessSection />
//       <TechSection />
//       <TestimonialsSection />
//       <CTASection />
//     </main>
//   );
// }
import { useEffect, useRef, useState } from "react";

// ── Particle canvas ───────────────────────────────────────────────────────────
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      size: number; alpha: number; color: string;
    }[] = [];

    const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#7c3aed"];

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function spawn() {
      particles.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    (Math.random() - 0.5) * 0.4,
        size:  Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.6 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }

    resize();
    for (let i = 0; i < 120; i++) spawn();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139,92,246,${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth   = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ── Glitch text ───────────────────────────────────────────────────────────────
function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch-wrap" data-text={text}>
      {text}
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, label }: { target: number; label: string }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(start));
    }, 24);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="counter-card">
      <span className="counter-num">{val}%</span>
      <span className="counter-label">{label}</span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, label, delay }: { pct: number; label: string; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 400 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="prog-row">
      <div className="prog-meta">
        <span className="prog-label">{label}</span>
        <span className="prog-pct">{pct}%</span>
      </div>
      <div className="prog-track">
        <div className="prog-fill" style={{ width: `${width}%`, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ lines }: { lines: string[] }) {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const line = lines[lineIdx];
    if (!line) return;
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setDisplayed(line.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 38);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCharIdx(0);
        setDisplayed("");
        setLineIdx((i) => (i + 1) % lines.length);
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [charIdx, lineIdx, lines]);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(t);
  }, []);

  return (
    <p className="typewriter">
      {displayed}
      <span className="cursor" style={{ opacity: blink ? 1 : 0 }}>|</span>
    </p>
  );
}

// ── Orbiting ring ─────────────────────────────────────────────────────────────
function OrbitRing() {
  return (
    <div className="orbit-container">
      <div className="orbit orbit-1">
        <div className="orbit-dot dot-1" />
      </div>
      <div className="orbit orbit-2">
        <div className="orbit-dot dot-2" />
      </div>
      <div className="orbit orbit-3">
        <div className="orbit-dot dot-3" />
      </div>
      <div className="core-ring" />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════

export function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    document.title = "Testing Phase — ZynHive";
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── Global styles ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hp-root {
          min-height: 100svh;
          background: #050510;
          color: #e2e0ff;
          font-family: 'Syne', sans-serif;
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* ── Radial spotlight ── */
        .hp-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 55% at 50% 10%, rgba(99,102,241,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(124,58,237,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 10% 70%, rgba(167,139,250,0.08) 0%, transparent 60%);
          pointer-events: none;
        }

        /* ── Grid overlay ── */
        .hp-root::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        /* ── Top badge ── */
        .phase-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 100px;
          border: 1px solid rgba(139,92,246,0.4);
          background: rgba(139,92,246,0.08);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #a78bfa;
          text-transform: uppercase;
          margin-bottom: 2rem;
          animation: fadeUp 0.7s 0.1s both;
        }
        .phase-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #7c3aed;
          box-shadow: 0 0 8px #7c3aed, 0 0 16px rgba(124,58,237,0.5);
          animation: pulseDot 1.6s ease-in-out infinite;
        }

        /* ── Heading ── */
        .hp-h1 {
          font-size: clamp(2.8rem, 6vw, 5.2rem);
          font-weight: 800;
          line-height: 1.05;
          text-align: center;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          animation: fadeUp 0.7s 0.25s both;
        }
        .grad-text {
          background: linear-gradient(135deg, #a78bfa 0%, #6366f1 40%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Glitch ── */
        .glitch-wrap {
          position: relative;
          display: inline-block;
        }
        .glitch-wrap::before,
        .glitch-wrap::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #a78bfa 0%, #6366f1 40%, #c4b5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .glitch-wrap::before {
          animation: glitch1 4s infinite;
          clip-path: polygon(0 20%, 100% 20%, 100% 40%, 0 40%);
        }
        .glitch-wrap::after {
          animation: glitch2 4s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%);
        }
        @keyframes glitch1 {
          0%,90%,100% { transform: translate(0); opacity: 0; }
          91%         { transform: translate(-3px,1px); opacity: 0.7; }
          93%         { transform: translate(3px,-1px); opacity: 0.7; }
          95%         { transform: translate(-2px,2px); opacity: 0.7; }
          97%         { transform: translate(0); opacity: 0; }
        }
        @keyframes glitch2 {
          0%,88%,100% { transform: translate(0); opacity: 0; }
          89%         { transform: translate(4px,-2px); opacity: 0.5; }
          92%         { transform: translate(-4px,2px); opacity: 0.5; }
          94%         { transform: translate(0); opacity: 0; }
        }

        /* ── Typewriter ── */
        .typewriter {
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          color: #7c6fcd;
          text-align: center;
          height: 22px;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.5s both;
        }
        .cursor { color: #a78bfa; font-weight: 400; }

        /* ── Counters ── */
        .counters-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.6s both;
        }
        .counter-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 14px 22px;
          border-radius: 14px;
          border: 1px solid rgba(99,102,241,0.2);
          background: rgba(99,102,241,0.06);
          backdrop-filter: blur(8px);
        }
        .counter-num {
          font-size: 22px;
          font-weight: 700;
          color: #a78bfa;
          font-family: 'JetBrains Mono', monospace;
        }
        .counter-label {
          font-size: 11px;
          color: #6b63a8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }

        /* ── Progress bars ── */
        .progress-block {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 2.5rem;
          animation: fadeUp 0.7s 0.75s both;
        }
        .prog-row { display: flex; flex-direction: column; gap: 6px; }
        .prog-meta { display: flex; justify-content: space-between; }
        .prog-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #7c6fcd;
          letter-spacing: 0.06em;
        }
        .prog-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #a78bfa;
        }
        .prog-track {
          height: 4px;
          border-radius: 100px;
          background: rgba(99,102,241,0.12);
          overflow: hidden;
        }
        .prog-fill {
          height: 100%;
          border-radius: 100px;
          background: linear-gradient(90deg, #6366f1, #a78bfa);
          width: 0%;
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
          box-shadow: 0 0 8px rgba(99,102,241,0.5);
        }

        /* ── CTA button ── */
        .cta-btn {
          position: relative;
          padding: 13px 36px;
          border-radius: 12px;
          border: 1px solid rgba(139,92,246,0.5);
          background: rgba(99,102,241,0.1);
          color: #c4b5fd;
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: default;
          overflow: hidden;
          transition: border-color 0.3s, background 0.3s, transform 0.2s;
          animation: fadeUp 0.7s 0.9s both;
        }
        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15));
          opacity: 0;
          transition: opacity 0.3s;
        }
        .cta-btn:hover { border-color: rgba(167,139,250,0.7); transform: translateY(-2px); }
        .cta-btn:hover::before { opacity: 1; }
        /* Shimmer */
        .cta-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          animation: shimmer 3s infinite 1.5s;
        }
        @keyframes shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }

        /* ── Orbit ── */
        .orbit-container {
          position: relative;
          width: 200px; height: 200px;
          margin-bottom: 2rem;
          animation: fadeIn 1s 0.3s both;
        }
        .core-ring {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1.5px solid rgba(139,92,246,0.6);
          background: rgba(99,102,241,0.15);
          box-shadow: 0 0 20px rgba(99,102,241,0.3), inset 0 0 12px rgba(99,102,241,0.15);
        }
        .orbit {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          border: 1px solid rgba(99,102,241,0.15);
          animation: spin linear infinite;
        }
        .orbit-1 { width: 80px;  height: 80px;  animation-duration: 5s; }
        .orbit-2 { width: 128px; height: 128px; animation-duration: 9s; animation-direction: reverse; }
        .orbit-3 { width: 178px; height: 178px; animation-duration: 14s; }
        .orbit-dot {
          position: absolute;
          top: -4px; left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
        }
        .dot-1 { width: 7px;  height: 7px;  background: #7c3aed; box-shadow: 0 0 10px #7c3aed; }
        .dot-2 { width: 5px;  height: 5px;  background: #6366f1; box-shadow: 0 0 8px #6366f1; }
        .dot-3 { width: 4px;  height: 4px;  background: #a78bfa; box-shadow: 0 0 6px #a78bfa; }

        /* ── Animations ── */
        @keyframes spin    { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes fadeUp  { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulseDot {
          0%,100% { box-shadow: 0 0 8px #7c3aed, 0 0 16px rgba(124,58,237,0.5); }
          50%     { box-shadow: 0 0 14px #7c3aed, 0 0 28px rgba(124,58,237,0.8); }
        }

        /* ── Scan line ── */
        .scan-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent);
          animation: scanDown 6s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes scanDown {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* ── Corner decorations ── */
        .corner {
          position: absolute;
          width: 32px; height: 32px;
          border-color: rgba(99,102,241,0.3);
          border-style: solid;
        }
        .corner-tl { top: 24px; left: 24px; border-width: 1px 0 0 1px; }
        .corner-tr { top: 24px; right: 24px; border-width: 1px 1px 0 0; }
        .corner-bl { bottom: 24px; left: 24px; border-width: 0 0 1px 1px; }
        .corner-br { bottom: 24px; right: 24px; border-width: 0 1px 1px 0; }

        /* ── Content wrapper ── */
        .hp-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem 1.5rem;
          opacity: ${mounted ? 1 : 0};
          transition: opacity 0.5s;
        }
      `}</style>

      <main className="hp-root">
        <ParticleCanvas />
        <div className="scan-line" />

        {/* Corner accents */}
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        <div className="hp-content">
          {/* Badge */}
          <div className="phase-badge">
            <span className="phase-dot" />
            Testing Phase
          </div>

          {/* Orbit */}
          <OrbitRing />

          {/* Heading */}
          <h1 className="hp-h1">
            <GlitchText text="ZynHive" />
            <br />
            <span style={{ fontSize: "0.6em", fontWeight: 600, color: "#6b63a8" }}>
              is being forged
            </span>
          </h1>

          {/* Typewriter */}
          <Typewriter
            lines={[
              "> initializing core modules...",
              "> running stress tests...",
              "> calibrating AI pipelines...",
              "> optimizing lead engine...",
              "> almost ready for launch...",
            ]}
          />

          {/* Counters */}
          <div className="counters-row">
            <Counter target={78} label="Complete" />
            <Counter target={14} label="Modules" />
            <Counter target={99} label="Uptime" />
          </div>

          {/* Progress bars */}
          <div className="progress-block">
            <ProgressBar pct={92} label="Backend Infrastructure" delay={0} />
            <ProgressBar pct={85} label="AI Lead Engine"         delay={120} />
            <ProgressBar pct={70} label="UI Polish"              delay={240} />
            <ProgressBar pct={55} label="QA & Testing"           delay={360} />
          </div>

          {/* CTA */}
          <button className="cta-btn">
            ◆ &nbsp; Launching Soon
          </button>
        </div>
      </main>
    </>
  );
}