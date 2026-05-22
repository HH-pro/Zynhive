import { useState, useEffect, useCallback, useRef } from "react";

interface Props { onDone: () => void; }

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ─── Ambient particle field (canvas) ──────────────────────────────────────────
function AmbientCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (REDUCED_MOTION) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Lightweight node graph for the AI-network feel
    const count = Math.min(38, Math.floor((W() * H()) / 22000));
    const nodes = Array.from({ length: count }, () => ({
      x:  Math.random() * W(),
      y:  Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r:  Math.random() * 1.4 + 0.55,
      ph: Math.random() * Math.PI * 2,
    }));

    const LINK = 165;

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.ph += 0.02;
        if (n.x < 0 || n.x > W()) n.vx *= -1;
        if (n.y < 0 || n.y > H()) n.vy *= -1;
      }

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            const t = 1 - d / LINK;
            ctx.strokeStyle = `rgba(99,129,255,${t * 0.18})`;
            ctx.lineWidth   = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        const g = Math.sin(n.ph) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(140,170,255,${0.45 + g * 0.35})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

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
      style={{ opacity: 0.55 }}
    />
  );
}

export function SplashScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [label,    setLabel]    = useState("Booting Neural Core");
  const [exiting,  setExiting]  = useState(false);
  const [gone,     setGone]     = useState(false);

  const exit = useCallback(() => {
    setLabel("Ready");
    setExiting(true);
    setTimeout(() => { setGone(true); onDone(); }, REDUCED_MOTION ? 350 : 1000);
  }, [onDone]);

  useEffect(() => {
    let raf = 0;
    let t0  = 0;

    // Status messages mapped to progress milestones — AI-pipeline framing
    const milestones: [number, string][] = [
      [0,  "Booting Neural Core"],
      [22, "Loading Models"],
      [44, "Compiling Interface"],
      [66, "Warming Inference"],
      [85, "Synchronizing"],
      [97, "Launching"],
    ];

    const animate = (ts: number) => {
      if (!t0) t0 = ts;
      const elapsed = ts - t0;

      // Faster, smoother curve — no jarring pauses
      let target: number;
      if      (elapsed < 600)  target = (elapsed / 600)  * 48;
      else if (elapsed < 1300) target = 48 + ((elapsed - 600)  / 700) * 36;
      else if (elapsed < 1800) target = 84 + ((elapsed - 1300) / 500) * 12;
      else                     target = 96 + ((elapsed - 1800) / 220) * 4;

      const p = Math.min(target, 100);
      setProgress(p);

      for (let i = milestones.length - 1; i >= 0; i--) {
        if (p >= milestones[i][0]) { setLabel(milestones[i][1]); break; }
      }

      if (p < 100) raf = requestAnimationFrame(animate);
      else setTimeout(exit, 280);
    };

    // Skip the long curve under reduced-motion — flash to 100 then exit
    if (REDUCED_MOTION) {
      setProgress(100);
      setLabel("Ready");
      const id = setTimeout(exit, 220);
      return () => clearTimeout(id);
    }

    const t = setTimeout(() => { raf = requestAnimationFrame(animate); }, 280);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [exit]);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        animation: exiting
          ? "splashOut 1s cubic-bezier(0.65,0,0.35,1) forwards"
          : "none",
        willChange: "opacity, transform, filter",
      }}
    >
      {/* ── Background ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 40%, #0A1A5C 0%, #060F3A 45%, #02061F 100%)",
        }}
      />

      {/* Ambient neural canvas */}
      <AmbientCanvas />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,129,255,0.07) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(99,129,255,0.07) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 90%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 90%)",
          animation: REDUCED_MOTION ? "none" : "gridPulse 6s ease-in-out infinite",
        }}
      />

      {/* Aurora layer */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "50%",
          width: 900, height: 600,
          transform: "translate(-50%,-50%)",
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(91,139,255,0.28) 0%, transparent 65%)," +
            "radial-gradient(ellipse 30% 40% at 30% 60%, rgba(0,212,255,0.10) 0%, transparent 70%)",
          filter: "blur(2px)",
          animation: REDUCED_MOTION ? "none" : "rPulse 6s ease-in-out infinite",
        }}
      />

      {/* Edge particles */}
      {!REDUCED_MOTION && [
        { top: "14%", left:  "10%", s: 3,   color: "#5B8BFF", d: "0s"   },
        { top: "18%", right: "9%",  s: 2,   color: "#00D4FF", d: "0.6s" },
        { top: "80%", left:  "7%",  s: 2.5, color: "#00D4FF", d: "1.1s" },
        { top: "76%", right: "10%", s: 3,   color: "#5B8BFF", d: "0.3s" },
        { top: "47%", left:  "4%",  s: 1.5, color: "#5B8BFF", d: "0.9s" },
        { top: "52%", right: "5%",  s: 1.5, color: "#00D4FF", d: "1.4s" },
        { top: "35%", left:  "22%", s: 1,   color: "#5B8BFF", d: "0.5s" },
        { top: "65%", right: "20%", s: 1,   color: "#00D4FF", d: "1.8s" },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: p.top,
            left:  (p as any).left,
            right: (p as any).right,
            width:  p.s,
            height: p.s,
            background: p.color,
            boxShadow: `0 0 ${p.s * 6}px ${p.color}`,
            animation: `bPulse ${2.6 + i * 0.3}s ${p.d} ease-in-out infinite`,
          }}
        />
      ))}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(2,6,31,0.55) 100%)",
        }}
      />

      {/* Top + bottom scan corners — agency polish */}
      <div className="absolute top-7 left-7 pointer-events-none" style={{ animation: "splashTextIn 0.6s 0.4s var(--ease) both" }}>
        <div className="flex items-center gap-2.5 font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(244,246,255,0.32)" }}>
          <span
            className="inline-block rounded-full"
            style={{ width: 6, height: 6, background: "#5B8BFF", boxShadow: "0 0 8px #5B8BFF" }}
          />
          ZH · SYSTEM
        </div>
      </div>
      <div className="absolute top-7 right-7 pointer-events-none" style={{ animation: "splashTextIn 0.6s 0.4s var(--ease) both" }}>
        <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.22em", color: "rgba(244,246,255,0.28)" }}>
          v · 2026.05
        </span>
      </div>
      <div className="absolute bottom-7 left-7 pointer-events-none hidden sm:block" style={{ animation: "splashTextIn 0.6s 0.9s var(--ease) both" }}>
        <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(244,246,255,0.22)" }}>
          Lahore · Pakistan
        </span>
      </div>
      <div className="absolute bottom-7 right-7 pointer-events-none hidden sm:block" style={{ animation: "splashTextIn 0.6s 0.9s var(--ease) both" }}>
        <span className="font-mono uppercase" style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(244,246,255,0.22)" }}>
          AI · First · Agency
        </span>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-0">

        {/* Diamond logo */}
        <div
          className="relative mb-8"
          style={{
            animation: REDUCED_MOTION
              ? "fadeIn 0.4s ease both"
              : "splashLogoIn 0.85s cubic-bezier(0.22,1.2,0.36,1) 0.1s both",
          }}
        >
          {/* Orbit rings */}
          {!REDUCED_MOTION && [110, 84, 60].map((sz, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width:  sz,
                height: sz,
                top:    "50%",
                left:   "50%",
                transform: "translate(-50%,-50%)",
                border: `1px solid rgba(91,139,255,${0.22 - i * 0.06})`,
                animation: `rPulse ${4 + i * 0.8}s ${i * 0.7}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Sweeping arc */}
          {!REDUCED_MOTION && (
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width:  130,
                height: 130,
                top:    "50%",
                left:   "50%",
                transform: "translate(-50%,-50%)",
                border: "1px solid transparent",
                borderTopColor: "rgba(0,212,255,0.85)",
                borderRightColor: "rgba(91,139,255,0.6)",
                animation: "spinLoader 2.4s linear infinite",
                filter: "drop-shadow(0 0 6px rgba(0,212,255,0.5))",
              }}
            />
          )}

          {/* Diamond body */}
          <div className="relative w-[64px] h-[64px]">
            {/* Gradient shell */}
            <div
              className="absolute inset-0 rounded-[14px]"
              style={{
                background:
                  "linear-gradient(135deg, #5B8BFF, #00D4FF, #7B5CFA, #5B8BFF)",
                backgroundSize: "300% 300%",
                transform: "rotate(45deg)",
                animation: REDUCED_MOTION ? "none" : "gradientShift 4s linear infinite",
                boxShadow:
                  "0 0 32px rgba(91,139,255,0.65)," +
                  "0 0 72px rgba(91,139,255,0.28)," +
                  "0 0 110px rgba(0,212,255,0.18)",
              }}
            />
            {/* Inner dark */}
            <div
              className="absolute inset-[3px] rounded-[11px]"
              style={{ background: "#02061F", transform: "rotate(45deg)" }}
            />
            {/* ZH */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-mono font-bold"
                style={{
                  fontSize: 14,
                  background: "linear-gradient(135deg,#A5B4FC,#00D4FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: 1,
                }}
              >
                ZH
              </span>
            </div>
          </div>
        </div>

        {/* Brand text */}
        <div
          className="text-center mb-12"
          style={{
            animation: REDUCED_MOTION
              ? "fadeIn 0.4s ease both"
              : "splashTextIn 0.75s cubic-bezier(0.16,1,0.3,1) 0.55s both",
          }}
        >
          <div
            className="font-display font-bold tracking-tight"
            style={{
              fontSize: 34,
              letterSpacing: "-0.03em",
              color: "#F4F6FF",
              lineHeight: 1.05,
            }}
          >
            Zyn
            <span
              style={{
                background: "linear-gradient(135deg, #5B8BFF, #00D4FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              H
            </span>
            ive
            <span style={{ color: "#00D4FF" }}>.</span>
          </div>
          <div
            className="font-mono tracking-[0.32em] uppercase mt-3"
            style={{ fontSize: 9, color: "rgba(244,246,255,0.34)" }}
          >
            AI · First · Digital · Agency
          </div>
        </div>

        {/* Progress block */}
        <div
          className="w-64"
          style={{
            animation: REDUCED_MOTION
              ? "fadeIn 0.4s ease both"
              : "splashTextIn 0.6s cubic-bezier(0.16,1,0.3,1) 0.85s both",
          }}
        >
          {/* Track */}
          <div
            className="relative h-[2px] w-full rounded-full overflow-hidden mb-4"
            style={{
              background: "rgba(255,255,255,0.06)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
            }}
          >
            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #5B8BFF, #00D4FF, #5B8BFF)",
                backgroundSize: "200% 100%",
                animation: REDUCED_MOTION ? "none" : "gradientShift 2.4s linear infinite",
                boxShadow:
                  "0 0 10px rgba(91,139,255,0.85)," +
                  "0 0 22px rgba(0,212,255,0.4)",
                transition: "width 0.18s cubic-bezier(0.16,1,0.3,1)",
              }}
            />
            {/* Leading glow dot */}
            <div
              className="absolute top-1/2 rounded-full"
              style={{
                width: 6, height: 6,
                marginTop: -3,
                left: `calc(${progress}% - 3px)`,
                background: "#00D4FF",
                boxShadow: "0 0 8px #00D4FF, 0 0 18px rgba(0,212,255,0.7)",
                transition: "left 0.18s cubic-bezier(0.16,1,0.3,1), opacity 0.3s",
                opacity: progress < 99.5 ? 1 : 0,
              }}
            />
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <span
              className="font-mono tracking-[0.16em] uppercase"
              style={{
                fontSize: 9,
                color: "rgba(244,246,255,0.42)",
                transition: "color 0.4s",
              }}
            >
              {label}
            </span>
            <span
              className="font-mono font-semibold tabular-nums"
              style={{
                fontSize: 11,
                color: progress >= 100 ? "#00D4FF" : "rgba(165,180,252,0.9)",
                textShadow: progress >= 100 ? "0 0 12px rgba(0,212,255,0.6)" : "none",
                transition: "color 0.3s, text-shadow 0.3s",
              }}
            >
              {String(Math.round(progress)).padStart(3, "0")}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
