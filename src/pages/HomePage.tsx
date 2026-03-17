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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Capture as non-null so inner functions don't lose narrowing
    const cv: HTMLCanvasElement       = canvas;
    const cx: CanvasRenderingContext2D = ctx;

    let animId: number;
    let running = true;

    type Particle = {
      x: number; y: number;
      vx: number; vy: number;
      size: number; alpha: number;
      color: string;
    };

    const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#7c3aed"];
    let particles: Particle[] = [];
    let W = 0;
    let H = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width  = W;
      cv.height = H;
    }

    function createParticle(): Particle {
      return {
        x:     Math.random() * W,
        y:     Math.random() * H,
        vx:    (Math.random() - 0.5) * 0.4,
        vy:    (Math.random() - 0.5) * 0.4,
        size:  Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.55 + 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      };
    }

    function toHex(n: number): string {
      return Math.round(Math.max(0, Math.min(255, n)))
        .toString(16)
        .padStart(2, "0");
    }

    function tick() {
      if (!running) return;
      cx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        if (!a) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (!b) continue;
          const dx   = a.x - b.x;
          const dy   = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const op = 0.08 * (1 - dist / 100);
            cx.beginPath();
            cx.strokeStyle = `rgba(139,92,246,${op.toFixed(3)})`;
            cx.lineWidth   = 0.5;
            cx.moveTo(a.x, a.y);
            cx.lineTo(b.x, b.y);
            cx.stroke();
          }
        }
      }

      for (const p of particles) {
        cx.beginPath();
        cx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        cx.fillStyle = p.color + toHex(p.alpha * 255);
        cx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)  p.x = W;
        if (p.x > W)  p.x = 0;
        if (p.y < 0)  p.y = H;
        if (p.y > H)  p.y = 0;
      }

      animId = requestAnimationFrame(tick);
    }

    resize();
    particles = Array.from({ length: 120 }, createParticle);
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

// ── Glitch text ───────────────────────────────────────────────────────────────
function GlitchText({ text }: { text: string }) {
  return (
    <span className="zyn-glitch" data-text={text}>
      {text}
    </span>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ target, label }: { target: number; label: string }) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let current = 0;
    const step  = target / 60;
    const id    = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(current));
    }, 24);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="zyn-counter-card">
      <span className="zyn-counter-num">{val}%</span>
      <span className="zyn-counter-lbl">{label}</span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, label, delay }: { pct: number; label: string; delay: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 500 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="zyn-prog-row">
      <div className="zyn-prog-meta">
        <span className="zyn-prog-lbl">{label}</span>
        <span className="zyn-prog-pct">{pct}%</span>
      </div>
      <div className="zyn-prog-track">
        <div
          className="zyn-prog-fill"
          style={{
            width: `${width}%`,
            transition: `width 1.2s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ── Typewriter ────────────────────────────────────────────────────────────────
const TW_LINES = [
  "> initializing core modules...",
  "> running stress tests...",
  "> calibrating AI pipelines...",
  "> optimizing lead engine...",
  "> almost ready for launch...",
];

function Typewriter() {
  const [lineIdx,   setLineIdx]   = useState(0);
  const [charIdx,   setCharIdx]   = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [blink,     setBlink]     = useState(true);

  useEffect(() => {
    const line = TW_LINES[lineIdx];
    if (!line) return;
    if (charIdx < line.length) {
      const t = setTimeout(() => {
        setDisplayed(line.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, 38);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setCharIdx(0);
      setDisplayed("");
      setLineIdx((i) => (i + 1) % TW_LINES.length);
    }, 2200);
    return () => clearTimeout(t);
  }, [charIdx, lineIdx]);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="zyn-typewriter">
      {displayed}
      <span style={{ opacity: blink ? 1 : 0, color: "#a78bfa" }}>|</span>
    </p>
  );
}

// ── Orbit rings ───────────────────────────────────────────────────────────────
function OrbitRings() {
  return (
    <div className="zyn-orbit-wrap">
      <div className="zyn-orbit zyn-orbit-1"><div className="zyn-dot zyn-dot-1" /></div>
      <div className="zyn-orbit zyn-orbit-2"><div className="zyn-dot zyn-dot-2" /></div>
      <div className="zyn-orbit zyn-orbit-3"><div className="zyn-dot zyn-dot-3" /></div>
      <div className="zyn-core" />
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
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        .zyn-root {
          min-height: 100svh;
          background: #050510;
          color: #e2e0ff;
          font-family: 'Syne', 'Segoe UI', sans-serif;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .zyn-root::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 55% at 50% 10%, rgba(99,102,241,0.18) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(124,58,237,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 30% 30% at 10% 70%, rgba(167,139,250,0.08) 0%, transparent 60%);
          pointer-events: none; z-index: 0;
        }
        .zyn-root::after {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none; z-index: 0;
        }
        .zyn-scan {
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.35), transparent);
          animation: zyn-scan-anim 7s linear infinite;
          pointer-events: none; z-index: 1;
        }
        @keyframes zyn-scan-anim {
          0%   { top:0%;   opacity:0; }
          3%   { opacity:1; }
          97%  { opacity:1; }
          100% { top:100%; opacity:0; }
        }
        .zyn-corner {
          position: absolute; width:28px; height:28px;
          border-color: rgba(99,102,241,0.28); border-style: solid; z-index: 1;
        }
        .zyn-corner.tl { top:24px;    left:24px;  border-width:1px 0 0 1px; }
        .zyn-corner.tr { top:24px;    right:24px; border-width:1px 1px 0 0; }
        .zyn-corner.bl { bottom:24px; left:24px;  border-width:0 0 1px 1px; }
        .zyn-corner.br { bottom:24px; right:24px; border-width:0 1px 1px 0; }
        .zyn-content {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          padding: 2rem 1.5rem; transition: opacity 0.5s ease;
        }
        .zyn-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px;
          border: 1px solid rgba(139,92,246,0.38);
          background: rgba(139,92,246,0.08);
          font-family: 'JetBrains Mono','Courier New',monospace;
          font-size: 11px; letter-spacing: 0.12em;
          color: #a78bfa; text-transform: uppercase;
          margin-bottom: 2rem; animation: zyn-up 0.7s 0.1s both;
        }
        .zyn-badge-dot {
          width:7px; height:7px; border-radius:50%; background:#7c3aed;
          box-shadow: 0 0 8px #7c3aed, 0 0 16px rgba(124,58,237,0.5);
          animation: zyn-pdot 1.6s ease-in-out infinite;
        }
        @keyframes zyn-pdot {
          0%,100% { box-shadow:0 0 8px #7c3aed,0 0 16px rgba(124,58,237,0.5); }
          50%     { box-shadow:0 0 14px #7c3aed,0 0 30px rgba(124,58,237,0.8); }
        }
        .zyn-h1 {
          font-size: clamp(2.6rem,6vw,5rem); font-weight:800;
          line-height:1.05; text-align:center; letter-spacing:-0.02em;
          margin-bottom:0.4rem; animation: zyn-up 0.7s 0.25s both;
        }
        .zyn-grad {
          background: linear-gradient(135deg,#a78bfa 0%,#6366f1 40%,#c4b5fd 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .zyn-sub {
          font-size:0.55em; font-weight:600; color:#6b63a8;
          display:block; margin-top:0.2em;
        }
        .zyn-glitch {
          position:relative; display:inline-block;
          background: linear-gradient(135deg,#a78bfa 0%,#6366f1 40%,#c4b5fd 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .zyn-glitch::before,.zyn-glitch::after {
          content: attr(data-text); position:absolute; inset:0;
          background: linear-gradient(135deg,#a78bfa 0%,#6366f1 40%,#c4b5fd 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .zyn-glitch::before { animation:zyn-g1 5s infinite; clip-path:polygon(0 15%,100% 15%,100% 35%,0 35%); }
        .zyn-glitch::after  { animation:zyn-g2 5s infinite; clip-path:polygon(0 60%,100% 60%,100% 78%,0 78%); }
        @keyframes zyn-g1 {
          0%,88%,100%{transform:translate(0);opacity:0;}
          89%{transform:translate(-3px,1px);opacity:0.7;}
          91%{transform:translate(3px,-1px);opacity:0.7;}
          93%{transform:translate(-2px,2px);opacity:0.7;}
          95%{transform:translate(0);opacity:0;}
        }
        @keyframes zyn-g2 {
          0%,86%,100%{transform:translate(0);opacity:0;}
          87%{transform:translate(4px,-2px);opacity:0.5;}
          90%{transform:translate(-4px,2px);opacity:0.5;}
          92%{transform:translate(0);opacity:0;}
        }
        .zyn-typewriter {
          font-family:'JetBrains Mono','Courier New',monospace;
          font-size:13px; color:#7c6fcd; text-align:center;
          height:22px; margin-bottom:2.2rem; animation:zyn-up 0.7s 0.45s both;
        }
        .zyn-orbit-wrap {
          position:relative; width:180px; height:180px;
          margin-bottom:1.8rem; animation:zyn-fade 1s 0.3s both;
        }
        .zyn-core {
          position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
          width:32px; height:32px; border-radius:50%;
          border:1.5px solid rgba(139,92,246,0.55);
          background:rgba(99,102,241,0.14);
          box-shadow:0 0 18px rgba(99,102,241,0.28),inset 0 0 10px rgba(99,102,241,0.14);
        }
        .zyn-orbit {
          position:absolute; top:50%; left:50%; border-radius:50%;
          border:1px solid rgba(99,102,241,0.14);
          animation:zyn-spin linear infinite;
        }
        .zyn-orbit-1 { width:72px;  height:72px;  margin-top:-36px; margin-left:-36px; animation-duration:5s; }
        .zyn-orbit-2 { width:116px; height:116px; margin-top:-58px; margin-left:-58px; animation-duration:9s;  animation-direction:reverse; }
        .zyn-orbit-3 { width:162px; height:162px; margin-top:-81px; margin-left:-81px; animation-duration:14s; }
        .zyn-dot { position:absolute; top:-4px; left:50%; transform:translateX(-50%); border-radius:50%; }
        .zyn-dot-1 { width:7px; height:7px; background:#7c3aed; box-shadow:0 0 10px #7c3aed; }
        .zyn-dot-2 { width:5px; height:5px; background:#6366f1; box-shadow:0 0 8px  #6366f1; }
        .zyn-dot-3 { width:4px; height:4px; background:#a78bfa; box-shadow:0 0 6px  #a78bfa; }
        @keyframes zyn-spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .zyn-counters {
          display:flex; gap:0.9rem; margin-bottom:2.2rem; animation:zyn-up 0.7s 0.6s both;
        }
        .zyn-counter-card {
          display:flex; flex-direction:column; align-items:center; gap:4px;
          padding:12px 20px; border-radius:14px;
          border:1px solid rgba(99,102,241,0.18); background:rgba(99,102,241,0.06);
        }
        .zyn-counter-num { font-size:22px; font-weight:700; color:#a78bfa; font-family:'JetBrains Mono','Courier New',monospace; }
        .zyn-counter-lbl { font-size:10px; color:#6b63a8; letter-spacing:0.09em; text-transform:uppercase; font-family:'JetBrains Mono','Courier New',monospace; }
        .zyn-progress { width:100%; max-width:400px; display:flex; flex-direction:column; gap:13px; margin-bottom:2.4rem; animation:zyn-up 0.7s 0.75s both; }
        .zyn-prog-row  { display:flex; flex-direction:column; gap:5px; }
        .zyn-prog-meta { display:flex; justify-content:space-between; }
        .zyn-prog-lbl  { font-family:'JetBrains Mono','Courier New',monospace; font-size:11px; color:#7c6fcd; }
        .zyn-prog-pct  { font-family:'JetBrains Mono','Courier New',monospace; font-size:11px; color:#a78bfa; }
        .zyn-prog-track { height:4px; border-radius:100px; background:rgba(99,102,241,0.1); overflow:hidden; }
        .zyn-prog-fill  { height:100%; border-radius:100px; background:linear-gradient(90deg,#6366f1,#a78bfa); width:0%; box-shadow:0 0 6px rgba(99,102,241,0.5); }
        .zyn-btn {
          position:relative; padding:13px 36px; border-radius:12px;
          border:1px solid rgba(139,92,246,0.45); background:rgba(99,102,241,0.09);
          color:#c4b5fd; font-family:'Syne','Segoe UI',sans-serif;
          font-size:14px; font-weight:600; letter-spacing:0.06em;
          cursor:default; overflow:hidden; transition:border-color 0.3s,transform 0.2s;
          animation:zyn-up 0.7s 0.9s both;
        }
        .zyn-btn:hover { border-color:rgba(167,139,250,0.65); transform:translateY(-2px); }
        .zyn-btn::after {
          content:''; position:absolute; top:0; left:-100%; width:60%; height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);
          animation:zyn-shimmer 3.5s infinite 2s;
        }
        @keyframes zyn-shimmer { 0%{left:-100%;} 100%{left:220%;} }
        @keyframes zyn-up   { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
        @keyframes zyn-fade { from{opacity:0;} to{opacity:1;} }
      `}</style>

      <main className="zyn-root">
        <ParticleCanvas />
        <div className="zyn-scan" />
        <div className="zyn-corner tl" />
        <div className="zyn-corner tr" />
        <div className="zyn-corner bl" />
        <div className="zyn-corner br" />

        <div className="zyn-content" style={{ opacity: mounted ? 1 : 0 }}>
          <div className="zyn-badge">
            <span className="zyn-badge-dot" />
            Testing Phase
          </div>

          <OrbitRings />

          <h1 className="zyn-h1">
            <GlitchText text="ZynHive" />
            <span className="zyn-sub">is being forged</span>
          </h1>

          <Typewriter />

          <div className="zyn-counters">
            <Counter target={78} label="Complete" />
            <Counter target={14} label="Modules"  />
            <Counter target={99} label="Uptime"   />
          </div>

          <div className="zyn-progress">
            <ProgressBar pct={92} label="Backend Infrastructure" delay={0}   />
            <ProgressBar pct={85} label="AI Lead Engine"         delay={120} />
            <ProgressBar pct={70} label="UI Polish"              delay={240} />
            <ProgressBar pct={55} label="QA & Testing"           delay={360} />
          </div>

          <button className="zyn-btn">◆ &nbsp; Launching Soon</button>
        </div>
      </main>
    </>
  );
}