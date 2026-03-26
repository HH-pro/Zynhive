import { useState, useEffect, useCallback } from "react";

interface Props { onDone: () => void; }

export function SplashScreen({ onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [label,    setLabel]    = useState("Initializing");
  const [exiting,  setExiting]  = useState(false);
  const [gone,     setGone]     = useState(false);

  const exit = useCallback(() => {
    setLabel("Ready");
    setExiting(true);
    setTimeout(() => { setGone(true); onDone(); }, 900);
  }, [onDone]);

  useEffect(() => {
    let raf: number;
    let startTime: number;

    // Labels that change as progress advances
    const milestones: [number, string][] = [
      [0,  "Initializing"],
      [30, "Loading Assets"],
      [60, "Building Interface"],
      [85, "Almost Ready"],
      [99, "Launching"],
    ];

    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;

      // Custom easing curve: fast → slow → burst to 100
      let target: number;
      if      (elapsed < 700)  target = (elapsed / 700)  * 55;
      else if (elapsed < 1400) target = 55 + ((elapsed - 700)  / 700)  * 28;
      else if (elapsed < 1900) target = 83 + ((elapsed - 1400) / 500)  * 8;
      else                     target = 91 + ((elapsed - 1900) / 250)  * 9;

      const p = Math.min(target, 100);
      setProgress(p);

      // Update milestone label
      for (let i = milestones.length - 1; i >= 0; i--) {
        if (p >= milestones[i][0]) { setLabel(milestones[i][1]); break; }
      }

      if (p < 100) {
        raf = requestAnimationFrame(animate);
      } else {
        setTimeout(exit, 350);
      }
    };

    const t = setTimeout(() => { raf = requestAnimationFrame(animate); }, 400);
    return () => { clearTimeout(t); cancelAnimationFrame(raf); };
  }, [exit]);

  if (gone) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        animation: exiting ? "splashOut 0.9s cubic-bezier(0.76,0,0.24,1) forwards" : "none",
      }}
    >
      {/* ── Background ─────────────────────────────────────────────────── */}
      <div className="absolute inset-0" style={{ background: "#020842" }} />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,110,248,0.06) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(59,110,248,0.06) 1px,transparent 1px)",
          backgroundSize: "72px 72px",
          animation: "gridPulse 4s ease-in-out infinite",
        }}
      />

      {/* Central radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "50%",
          width: 700, height: 500,
          transform: "translate(-50%,-50%)",
          background: "radial-gradient(ellipse, rgba(59,110,248,0.22) 0%, transparent 65%)",
          animation: "rPulse 5s ease-in-out infinite",
        }}
      />

      {/* Ambient edge particles */}
      {[
        { top: "14%", left:  "10%", s: 3,   color: "#4A6CF7", d: "0s"   },
        { top: "18%", right: "9%",  s: 2,   color: "#00D4FF", d: "0.6s" },
        { top: "80%", left:  "7%",  s: 2.5, color: "#00D4FF", d: "1.1s" },
        { top: "76%", right: "10%", s: 3,   color: "#4A6CF7", d: "0.3s" },
        { top: "47%", left:  "4%",  s: 1.5, color: "#4A6CF7", d: "0.9s" },
        { top: "52%", right: "5%",  s: 1.5, color: "#00D4FF", d: "1.4s" },
        { top: "35%", left:  "22%", s: 1,   color: "#4A6CF7", d: "0.5s" },
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
            boxShadow: `0 0 ${p.s * 5}px ${p.color}`,
            animation: `bPulse ${2.5 + i * 0.3}s ${p.d} ease-in-out infinite`,
          }}
        />
      ))}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-0">

        {/* Diamond logo */}
        <div
          className="relative mb-8"
          style={{ animation: "splashLogoIn 0.75s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}
        >
          {/* Orbit rings */}
          {[96, 72, 52].map((sz, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width:  sz,
                height: sz,
                top:    "50%",
                left:   "50%",
                transform: "translate(-50%,-50%)",
                border: `1px solid rgba(74,108,247,${0.18 - i * 0.05})`,
                animation: `rPulse ${3.5 + i * 0.8}s ${i * 0.7}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* Diamond body */}
          <div className="relative w-[60px] h-[60px]">
            {/* Gradient shell */}
            <div
              className="absolute inset-0 rounded-[13px]"
              style={{
                background: "linear-gradient(135deg, #4A6CF7, #00D4FF, #7B5CFA, #4A6CF7)",
                backgroundSize: "300% 300%",
                transform: "rotate(45deg)",
                animation: "gradientShift 3s linear infinite",
                boxShadow:
                  "0 0 32px rgba(74,108,247,0.55)," +
                  "0 0 64px rgba(74,108,247,0.2)," +
                  "0 0 96px rgba(0,212,255,0.12)",
              }}
            />
            {/* Inner dark */}
            <div
              className="absolute inset-[3px] rounded-[10px]"
              style={{ background: "#020842", transform: "rotate(45deg)" }}
            />
            {/* ZH */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-mono font-bold"
                style={{ fontSize: 13, color: "#4A6CF7", letterSpacing: 1 }}
              >
                ZH
              </span>
            </div>
          </div>
        </div>

        {/* Brand text */}
        <div
          className="text-center mb-10"
          style={{ animation: "splashTextIn 0.65s cubic-bezier(0.16,1,0.3,1) 0.55s both" }}
        >
          <div
            className="font-display font-bold tracking-tight"
            style={{ fontSize: 30, letterSpacing: "-0.025em", color: "#F4F6FF" }}
          >
            Zyn
            <span style={{ color: "#4A6CF7" }}>H</span>
            ive
            <span style={{ color: "#00D4FF" }}>.</span>
          </div>
          <div
            className="font-mono text-[9px] tracking-[0.26em] uppercase mt-2"
            style={{ color: "rgba(244,246,255,0.28)" }}
          >
            AI · First · Digital · Agency
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-52"
          style={{ animation: "splashTextIn 0.5s cubic-bezier(0.16,1,0.3,1) 0.8s both" }}
        >
          {/* Track */}
          <div
            className="relative h-[2px] w-full rounded-full overflow-hidden mb-3"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            {/* Fill */}
            <div
              className="absolute inset-y-0 left-0 h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #4A6CF7, #00D4FF)",
                boxShadow: "0 0 10px rgba(74,108,247,0.9), 0 0 20px rgba(74,108,247,0.4)",
                transition: "width 0.08s linear",
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
                boxShadow: "0 0 8px #00D4FF, 0 0 16px rgba(0,212,255,0.6)",
                transition: "left 0.08s linear",
                opacity: progress < 99.5 ? 1 : 0,
              }}
            />
          </div>

          {/* Meta row */}
          <div className="flex items-center justify-between">
            <span
              className="font-mono text-[9px] tracking-[0.14em] uppercase"
              style={{
                color: "rgba(244,246,255,0.22)",
                transition: "color 0.3s",
              }}
            >
              {label}
            </span>
            <span
              className="font-mono text-[11px] font-semibold tabular-nums"
              style={{
                color: progress >= 100 ? "#00D4FF" : "rgba(74,108,247,0.75)",
                transition: "color 0.3s",
              }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Bottom tagline */}
        <div
          className="mt-10 font-mono text-[8px] tracking-[0.18em] uppercase"
          style={{
            color: "rgba(244,246,255,0.14)",
            animation: "splashTextIn 0.5s cubic-bezier(0.16,1,0.3,1) 1.1s both",
          }}
        >
          Lahore, Pakistan · Est. 2024
        </div>
      </div>
    </div>
  );
}
