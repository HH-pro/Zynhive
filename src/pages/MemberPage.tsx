// ─── src/pages/MemberPage.tsx ─────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchMemberById, fetchTasksByMemberId, updateTask, updateMember, createReview, fetchAdminSettings,
  fetchIdeasByMemberId, createIdea,
  fetchRoutinesByMemberId, updateRoutine,
  fetchMessagesByMemberId, updateMemberMessage,
  adjustMemberScore, TASK_SCORE_PENALTY,
  type FirestoreMember, type FirestoreTask, type FirestoreIdea, type FirestoreRoutine, type ChecklistItem,
  type FirestoreMemberMessage,
} from "../lib/firebase";
import { sendAdminReviewEmail } from "../lib/email";
import { Timestamp } from "firebase/firestore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split("T")[0]; }

function isOverdue(t: FirestoreTask) {
  if (t.status === "completed") return false;
  if (t.deadline) return new Date(t.deadline).getTime() < Date.now();
  return !!t.dueDate && t.dueDate < todayStr();
}

function effectiveStatus(t: FirestoreTask): "pending" | "in-progress" | "completed" | "overdue" {
  if (t.status === "completed") return "completed";
  if (isOverdue(t)) return "overdue";
  return t.status as "pending" | "in-progress";
}

function daysLabel(t: FirestoreTask): { text: string; color: string } {
  const eff = effectiveStatus(t);
  if (eff === "completed") return { text: "Done", color: "#10B981" };

  // Deadline (24h cutoff) — hour-grained countdown.
  if (t.deadline) {
    const diffMs = new Date(t.deadline).getTime() - Date.now();
    if (diffMs < 0) {
      const overH = Math.floor(Math.abs(diffMs) / 3600000);
      return { text: overH >= 1 ? `${overH}h overdue` : `${Math.max(1, Math.floor(Math.abs(diffMs)/60000))}m overdue`, color: "#EF4444" };
    }
    const hours = Math.floor(diffMs / 3600000);
    if (hours >= 24) return { text: `${Math.floor(hours/24)}d ${hours%24}h left`, color: "#10B981" };
    if (hours >= 6)  return { text: `${hours}h left`, color: "#F59E0B" };
    if (hours >= 1)  return { text: `${hours}h ${Math.floor((diffMs%3600000)/60000)}m left`, color: "#EF4444" };
    return { text: `${Math.max(1, Math.floor(diffMs/60000))}m left`, color: "#EF4444" };
  }

  if (!t.dueDate) return { text: "", color: "#94a3b8" };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(t.dueDate + "T00:00:00");
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, color: "#EF4444" };
  if (diff === 0) return { text: "Due today",  color: "#F59E0B" };
  if (diff === 1) return { text: "Tomorrow",   color: "#F59E0B" };
  return { text: `${diff}d left`, color: "#10B981" };
}

function fmtDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Pakistan-time deadline display, e.g. "May 20, 4:30 PM PKT"
function fmtDeadlinePKT(iso: string | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  }) + " PKT";
}

function fmtTs(ts: Timestamp | undefined) {
  if (!ts) return "";
  return new Date(ts.toMillis?.() ?? 0).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function getTheme(): boolean {
  try { return localStorage.getItem("mp-theme") !== "light"; } catch { return true; }
}
function saveTheme(dark: boolean) {
  try { localStorage.setItem("mp-theme", dark ? "dark" : "light"); } catch { /**/ }
}

// ─── Status config ────────────────────────────────────────────────────────────
const SC = {
  pending:       { label: "Pending",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  "in-progress": { label: "In Progress", color: "#F59E0B", bg: "rgba(245,158,11,0.13)"  },
  completed:     { label: "Completed",   color: "#10B981", bg: "rgba(16,185,129,0.13)"  },
  overdue:       { label: "Overdue",     color: "#EF4444", bg: "rgba(239,68,68,0.13)"   },
};

const PC = {
  high:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "High"   },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label: "Medium" },
  low:    { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Low"    },
};

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mp-root[data-mp-dark="true"] {
    --mp-bg:        #06080E;
    --mp-bg-deep:   #03050B;
    --mp-panel:     rgba(255,255,255,.025);
    --mp-card:      rgba(255,255,255,.032);
    --mp-hover:     rgba(255,255,255,.048);
    --mp-border:    rgba(255,255,255,.07);
    --mp-border2:   rgba(255,255,255,.12);
    --mp-h:         #F1F5F9;
    --mp-body:      #CBD5E1;
    --mp-muted:     #64748B;
    --mp-input:     rgba(255,255,255,.06);
    --mp-scrollbar: #1E293B;
    --mp-accent:    #4F7DFF;
    --mp-accent2:   #22B8D4;
    --mp-violet:    #8B5CF6;
    --mp-glow:      rgba(79,125,255,0.45);
    --mp-aurora1:   rgba(79,125,255,0.22);
    --mp-aurora2:   rgba(34,184,212,0.18);
    --mp-aurora3:   rgba(139,92,246,0.20);
    --mp-grid:      rgba(140,170,255,0.05);
    --mp-shine:     rgba(255,255,255,0.16);
  }
  .mp-root[data-mp-dark="false"] {
    --mp-bg:        #F1F5F9;
    --mp-bg-deep:   #E2E8F0;
    --mp-panel:     #FFFFFF;
    --mp-card:      #FFFFFF;
    --mp-hover:     #F8FAFC;
    --mp-border:    rgba(0,0,0,.08);
    --mp-border2:   rgba(0,0,0,.15);
    --mp-h:         #0F172A;
    --mp-body:      #475569;
    --mp-muted:     #94A3B8;
    --mp-input:     #F8FAFC;
    --mp-scrollbar: #CBD5E1;
    --mp-accent:    #1E3A8A;
    --mp-accent2:   #0891B2;
    --mp-violet:    #6D28D9;
    --mp-glow:      rgba(30,58,138,0.30);
    --mp-aurora1:   rgba(30,58,138,0.11);
    --mp-aurora2:   rgba(8,145,178,0.10);
    --mp-aurora3:   rgba(124,58,237,0.09);
    --mp-grid:      rgba(30,58,138,0.05);
    --mp-shine:     rgba(255,255,255,0.55);
  }

  .mp-root {
    min-height: 100vh;
    background: var(--mp-bg);
    font-family: 'Inter', sans-serif;
    color: var(--mp-body);
    transition: background .3s, color .3s;
    position: relative;
    overflow-x: hidden;
    --ease:        cubic-bezier(0.16, 1, 0.3, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .mp-root * { box-sizing: border-box; }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--mp-accent), var(--mp-accent2));
    border-radius: 99px;
  }

  /* ════════ KEYFRAMES ════════ */
  @keyframes mp-spin { to { transform: rotate(360deg); } }
  @keyframes mp-fade   { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes mp-scale  { from { opacity:0; transform:scale(.95) translateY(6px); } to { opacity:1; transform:none; } }
  @keyframes mp-rise   { from { opacity:0; transform:translateY(18px) scale(.97); } to { opacity:1; transform:none; } }

  @keyframes mp-aurora-a {
    0%   { transform: translate(-12%,-10%) scale(1)    rotate(0deg);   }
    33%  { transform: translate( 12%,  8%) scale(1.15) rotate(40deg);  }
    66%  { transform: translate( -8%, 14%) scale(.92)  rotate(-30deg); }
    100% { transform: translate(-12%,-10%) scale(1)    rotate(0deg);   }
  }
  @keyframes mp-aurora-b {
    0%   { transform: translate( 18%, 30%) scale(1.1) rotate(0deg);  }
    50%  { transform: translate(-12%,-12%) scale(.85) rotate(70deg); }
    100% { transform: translate( 18%, 30%) scale(1.1) rotate(0deg);  }
  }
  @keyframes mp-aurora-c {
    0%   { transform: translate( 40%,-20%) scale(.9)  rotate(0deg);   }
    50%  { transform: translate(-22%, 24%) scale(1.2) rotate(-80deg); }
    100% { transform: translate( 40%,-20%) scale(.9)  rotate(0deg);   }
  }

  @keyframes mp-pulse-dot {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.35); opacity: .65; }
  }
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,.6); }
    50%      { box-shadow: 0 0 0 6px rgba(239,68,68,0); }
  }
  @keyframes mp-shine {
    0%   { transform: translateX(-120%) skewX(-22deg); }
    100% { transform: translateX( 240%) skewX(-22deg); }
  }
  @keyframes mp-holo-rotate { to { transform: rotate(360deg); } }
  @keyframes mp-gradient-flow {
    0%, 100% { background-position:   0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes mp-breathe {
    0%, 100% { opacity: .78; }
    50%      { opacity: 1; }
  }
  @keyframes mp-orb-float {
    0%, 100% { transform: translate(0,0) scale(1);     }
    50%      { transform: translate(22px,-30px) scale(1.06); }
  }
  @keyframes mp-scan {
    0%   { transform: translateY(-110%); opacity: 0; }
    35%  { opacity: 1; }
    100% { transform: translateY( 210%); opacity: 0; }
  }
  @keyframes mp-progress-stripes {
    from { background-position: 0 0; }
    to   { background-position: 24px 0; }
  }

  /* ════════ UTILITIES ════════ */
  .mp-card      { animation: mp-rise  .55s var(--ease) both; }
  .mp-modal-box { animation: mp-scale .22s cubic-bezier(0.16,1,0.3,1) both; }

  /* —— Aurora gradient mesh background —— */
  .mp-aurora {
    position: fixed; inset: 0; z-index: 0;
    pointer-events: none; overflow: hidden;
  }
  .mp-aurora i {
    position: absolute;
    width: 65vw; height: 65vw; border-radius: 50%;
    filter: blur(110px); will-change: transform;
  }
  .mp-aurora i.a { background: radial-gradient(circle, var(--mp-aurora1) 0%, transparent 70%); top: -22vw; left: -12vw; animation: mp-aurora-a 22s ease-in-out infinite; }
  .mp-aurora i.b { background: radial-gradient(circle, var(--mp-aurora2) 0%, transparent 70%); top:  20vh; right:-18vw; animation: mp-aurora-b 28s ease-in-out infinite; }
  .mp-aurora i.c { background: radial-gradient(circle, var(--mp-aurora3) 0%, transparent 70%); bottom:-18vw; left: 22vw; animation: mp-aurora-c 32s ease-in-out infinite; }

  /* —— Subtle global grid (fades out vertically) —— */
  .mp-grid-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--mp-grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--mp-grid) 1px, transparent 1px);
    background-size: 56px 56px;
    -webkit-mask-image: radial-gradient(ellipse 70% 65% at 50% 0%, black 10%, transparent 75%);
            mask-image: radial-gradient(ellipse 70% 65% at 50% 0%, black 10%, transparent 75%);
    opacity: .85;
  }

  .mp-content { position: relative; z-index: 1; }

  /* —— 3D tilt —— */
  .mp-tilt {
    transform: perspective(1100px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
    transform-style: preserve-3d;
    transition: transform .35s var(--ease), box-shadow .25s var(--ease);
    will-change: transform;
  }
  .mp-tilt[data-active="true"] { transition: transform .08s linear; }
  .mp-tilt-pop {
    transform: translateZ(28px);
    transform-style: preserve-3d;
  }

  /* —— Holo glow border (cards) — gentle —— */
  .mp-glow-card {
    position: relative;
    isolation: isolate;
    transition: transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s;
  }
  .mp-glow-card::before {
    content: ""; position: absolute; inset: -1px;
    border-radius: inherit;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      var(--mp-accent) 90deg,
      transparent 180deg,
      var(--mp-accent2) 270deg,
      transparent 360deg
    );
    opacity: 0; z-index: -1;
    transition: opacity .4s var(--ease);
    animation: mp-holo-rotate 9s linear infinite;
    filter: blur(14px);
  }
  .mp-glow-card:hover::before { opacity: .32; }

  /* —— Cyber chip / button with sweep —— */
  .mp-chip {
    position: relative;
    overflow: hidden;
    transition: transform .18s var(--ease-spring), border-color .18s, color .18s, background .18s;
  }
  .mp-chip::after {
    content: "";
    position: absolute; top: 0; bottom: 0;
    left: -120%; width: 55%;
    background: linear-gradient(90deg, transparent, var(--mp-shine), transparent);
    transform: skewX(-22deg);
    pointer-events: none;
  }
  .mp-chip:hover::after,
  .mp-chip[data-active="true"]::after {
    animation: mp-shine 1.2s var(--ease) forwards;
  }
  .mp-chip:hover { transform: translateY(-1px); }

  /* —— Holographic rotating ring (avatar) —— */
  .mp-holo-ring-soft {
    position: absolute; inset: -10px;
    border-radius: 30px;
    background: conic-gradient(from 0deg,
      var(--mp-accent), var(--mp-accent2), var(--mp-violet), var(--mp-accent2), var(--mp-accent));
    filter: blur(14px); opacity: .55;
    animation: mp-holo-rotate 7s linear infinite;
    z-index: -1;
    pointer-events: none;
  }
  .mp-holo-ring-sharp {
    position: absolute; inset: -3px;
    border-radius: 25px;
    background: conic-gradient(from 0deg,
      var(--mp-accent) 0deg, transparent 100deg,
      var(--mp-accent2) 180deg, transparent 270deg, var(--mp-accent) 360deg);
    animation: mp-holo-rotate 5s linear infinite;
    z-index: -1;
    pointer-events: none;
    -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
            mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px));
  }

  /* —— Floating orbital satellites around avatar —— */
  .mp-orbit {
    position: absolute; inset: -22px;
    border-radius: 50%;
    animation: mp-holo-rotate 16s linear infinite;
    pointer-events: none;
    z-index: -1;
  }
  .mp-orbit::before, .mp-orbit::after {
    content: ""; position: absolute;
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--mp-accent2);
    box-shadow: 0 0 12px var(--mp-accent2);
  }
  .mp-orbit::before { top: -3px; left: 50%; transform: translateX(-50%); }
  .mp-orbit::after  { bottom: -3px; left: 50%; transform: translateX(-50%); background: var(--mp-accent); box-shadow: 0 0 12px var(--mp-accent); }

  /* —— Stat pill shine —— */
  .mp-stat {
    position: relative;
    overflow: hidden;
    transition: transform .22s var(--ease-spring), box-shadow .25s var(--ease), border-color .22s;
  }
  .mp-stat::after {
    content: "";
    position: absolute; top: 0; left: -150%;
    width: 65%; height: 100%;
    background: linear-gradient(90deg, transparent, var(--mp-shine), transparent);
    transform: skewX(-22deg);
    transition: left 1.1s var(--ease);
    pointer-events: none;
  }
  .mp-stat:hover::after { left: 220%; }

  /* —— Magnetic / spring hover —— */
  .mp-magnetic { transition: transform .22s var(--ease-spring), box-shadow .22s var(--ease), filter .22s; }
  .mp-magnetic:hover  { transform: translateY(-2px) scale(1.025); filter: brightness(1.08); }
  .mp-magnetic:active { transform: translateY(0)    scale(.97); }

  /* —— Holo text gradient —— */
  .mp-holo-text {
    background: linear-gradient(120deg,
      var(--mp-accent), var(--mp-accent2), var(--mp-violet),
      var(--mp-accent2), var(--mp-accent));
    background-size: 300% 100%;
    -webkit-background-clip: text; background-clip: text;
    color: transparent;
    animation: mp-gradient-flow 6s ease-in-out infinite;
  }

  .mp-dot-pulse { animation: mp-pulse-dot 2.2s ease-in-out infinite; }

  /* —— Progress bars with animated sheen —— */
  .mp-progress-fill {
    position: relative;
    overflow: hidden;
    background-image: linear-gradient(135deg,
      rgba(255,255,255,.18) 25%, transparent 25%,
      transparent 50%, rgba(255,255,255,.18) 50%,
      rgba(255,255,255,.18) 75%, transparent 75%);
    background-size: 24px 24px;
    animation: mp-progress-stripes 1.4s linear infinite;
  }
  .mp-progress-fill::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent);
    transform: translateX(-100%);
    animation: mp-shine 2.4s ease-in-out infinite;
  }

  /* —— Scan-line for unread / highlighted —— */
  .mp-scan { position: relative; overflow: hidden; }
  .mp-scan::after {
    content: ""; position: absolute; left: 0; right: 0; top: 0;
    height: 24%;
    background: linear-gradient(180deg, rgba(99,102,241,0.28) 0%, transparent 100%);
    pointer-events: none;
    animation: mp-scan 4.2s ease-in-out infinite;
  }

  /* —— Hero animated wordmark sheen —— */
  .mp-sheen {
    position: relative;
    overflow: hidden;
  }
  .mp-sheen::after {
    content: ""; position: absolute; top: 0; bottom: 0;
    left: -150%; width: 60%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
    transform: skewX(-22deg);
    animation: mp-shine 4.5s ease-in-out infinite;
    pointer-events: none;
  }

  /* —— Floating tag —— */
  .mp-breathe { animation: mp-breathe 3s ease-in-out infinite; }

  /* —— Slide-in stagger —— */
  .mp-stagger { opacity: 0; animation: mp-rise .55s var(--ease) both; }

  /* —— Navbar center hides on small screens —— */
  @media (max-width: 720px) {
    .mp-nav-center { display: none !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: .01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: .05ms !important;
    }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner({ size = 18, color = "#6366F1" }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}30`,
      borderTopColor: color,
      animation: "mp-spin .7s linear infinite",
      flexShrink: 0,
    }}/>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
      color, background: bg, borderRadius: 99, padding: "3px 9px",
      border: `1px solid ${color}30`, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── Tilt3D ───────────────────────────────────────────────────────────────────
// Mouse-tracking 3D tilt wrapper. Lightweight — no library, no per-frame React state.
function Tilt3D({
  children, intensity = 5, className = "", style,
}: { children: React.ReactNode; intensity?: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current; if (!el) return;
    const r  = el.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width;
    const y  = (e.clientY - r.top)  / r.height;
    const ry = (x - 0.5) *  intensity * 2;
    const rx = (0.5 - y) *  intensity * 2;
    el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
    el.dataset.active = "true";
  }
  function onLeave() {
    const el = ref.current; if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.dataset.active = "false";
  }

  return (
    <div
      ref={ref}
      className={`mp-tilt ${className}`}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

// ─── CountUp ──────────────────────────────────────────────────────────────────
function CountUp({ value, duration = 850 }: { value: number; duration?: number }) {
  const [n, setN]  = useState(0);
  const lastRef    = useRef(0);

  useEffect(() => {
    const from = lastRef.current;
    const to   = value;
    if (from === to) { setN(to); return; }
    const t0 = performance.now();
    let raf = 0;
    function step(now: number) {
      const t = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setN(Math.round(from + (to - from) * e));
      if (t < 1) raf = requestAnimationFrame(step);
      else lastRef.current = to;
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{n}</>;
}

// ─── AuroraBackground ─────────────────────────────────────────────────────────
function AuroraBackground() {
  return (
    <>
      <div className="mp-aurora" aria-hidden="true">
        <i className="a"/><i className="b"/><i className="c"/>
      </div>
      <div className="mp-grid-bg" aria-hidden="true"/>
    </>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({
  task, isDark, onClose, onDone,
}: {
  task: FirestoreTask; isDark: boolean; onClose: () => void; onDone: () => void;
}) {
  const isView = task.status === "completed";
  const [report, setReport] = useState(task.report ?? "");
  const [saving, setSaving] = useState(false);
  const eff = effectiveStatus(task);
  const sc  = SC[eff];

  const checklist  = task.checklistItems ?? [];
  const doneCount  = checklist.filter((i) => i.checked).length;
  const totalCount = checklist.length;
  const allChecked = totalCount > 0 && doneCount === totalCount;
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  async function submit() {
    if (!report.trim() || !task.id) return;
    setSaving(true);
    try {
      await updateTask(task.id, {
        report, status: "completed",
        completedAt: new Date().toISOString(),
        reportedBy: task.assignedToName,
      });
      await createReview({
        taskId:           task.id,
        taskTitle:        task.title,
        taskDescription:  task.description,
        report,
        memberId:         task.assignedToId,
        memberName:       task.assignedToName,
        memberColor:      task.assignedToColor || "#6366F1",
        linkedClientId:   task.linkedClientId  ?? "",
        linkedClientName: task.linkedClientName ?? "",
        status:           "pending",
      });

      const settings = await fetchAdminSettings();
      if (settings.notificationEmail) {
        sendAdminReviewEmail({
          toEmail:          settings.notificationEmail,
          memberName:       task.assignedToName,
          taskTitle:        task.title,
          taskDescription:  task.description ?? "",
          report,
          linkedClientName: task.linkedClientName ?? "",
          dashboardUrl:     `${window.location.origin}/admin`,
        }).catch(() => {});
      }

      onDone(); onClose();
    } finally { setSaving(false); }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}>
      <div
        className="mp-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 520, borderRadius: 20, overflow: "hidden",
          background: isDark ? "#13161E" : "#FFFFFF",
          border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
          boxShadow: "0 24px 80px rgba(0,0,0,.45)",
          maxHeight: "92vh", display: "flex", flexDirection: "column",
        }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px 16px", flexShrink: 0,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 2 }}>
                {isView ? "Completion Report" : "Submit Report"}
              </h3>
              <p style={{ fontSize: 12, color: isDark ? "#64748B" : "#94A3B8" }}>
                {isView ? "Report submitted by team member" : "Check off all steps, then describe what was accomplished"}
              </p>
            </div>
            <button onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                background: "transparent", color: isDark ? "#64748B" : "#94A3B8",
                cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
          </div>

          {/* Task strip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: isDark ? "rgba(255,255,255,.04)" : "#F8FAFC",
            borderRadius: 10, border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"}`,
          }}>
            <div style={{
              width: 4, height: 36, borderRadius: 99, flexShrink: 0,
              background: PC[task.priority]?.color || "#6366F1",
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {task.title}
              </p>
              <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>
                Due {task.deadline ? fmtDeadlinePKT(task.deadline) : fmtDate(task.dueDate)}
                {totalCount > 0 && (
                  <span style={{ marginLeft: 8, color: allChecked ? "#10B981" : "#F59E0B", fontWeight: 600 }}>
                    · {doneCount}/{totalCount} steps done
                  </span>
                )}
              </p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: sc.bg, color: sc.color, flexShrink: 0 }}>
              {sc.label}
            </span>
          </div>

          {/* Checklist progress bar */}
          {totalCount > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ height: 5, background: isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${pct}%`,
                  background: allChecked ? "#10B981" : "#6366F1",
                  borderRadius: 99, transition: "width .4s ease",
                }}/>
              </div>
            </div>
          )}
        </div>

        {/* Body (scrollable) */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Checklist steps */}
          {checklist.length > 0 && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: isDark ? "#64748B" : "#94A3B8", display: "block", marginBottom: 8 }}>
                Steps {isView ? `— ${doneCount}/${totalCount} completed` : "— tick off as you go"}
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {checklist.map((item, idx) => (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                    borderRadius: 10,
                    background: item.checked
                      ? (isDark ? "rgba(16,185,129,.08)" : "rgba(16,185,129,.06)")
                      : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"),
                    border: `1px solid ${item.checked ? "rgba(16,185,129,.2)" : (isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)")}`,
                    opacity: item.checked ? 0.8 : 1,
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${item.checked ? "#10B981" : (isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)")}`,
                      background: item.checked ? "#10B981" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {item.checked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {(item.impact || item.estimatedMinutes || item.category) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 3 }}>
                          {item.impact && (() => {
                            const ic = item.impact === "high" ? "#EF4444" : item.impact === "low" ? "#10B981" : "#F59E0B";
                            return <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: `${ic}18`, color: ic }}>{item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact</span>;
                          })()}
                          {!!item.estimatedMinutes && (
                            <span style={{ fontSize: 10, color: isDark ? "#64748B" : "#94A3B8" }}>
                              ⏱ {item.estimatedMinutes >= 60 ? `${Math.floor(item.estimatedMinutes / 60)}h${item.estimatedMinutes % 60 > 0 ? ` ${item.estimatedMinutes % 60}m` : ""}` : `${item.estimatedMinutes}m`}
                            </span>
                          )}
                          {item.category && (
                            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color: isDark ? "#94A3B8" : "#64748B" }}>
                              {item.category}
                            </span>
                          )}
                        </div>
                      )}
                      <span style={{
                        fontSize: 13, fontWeight: 500,
                        color: item.checked ? (isDark ? "#6EE7B7" : "#065F46") : (isDark ? "#E2E8F0" : "#1E293B"),
                        textDecoration: item.checked ? "line-through" : "none",
                      }}>
                        {idx + 1}. {item.title}
                      </span>
                    </div>
                    {item.checked && item.checkedAt && (
                      <span style={{ fontSize: 10, color: "#10B981", flexShrink: 0 }}>
                        {new Date(item.checkedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {!isView && !allChecked && (
                <p style={{ fontSize: 11, color: "#F59E0B", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
                  ⚠ {totalCount - doneCount} step{totalCount - doneCount !== 1 ? "s" : ""} remaining — check them off from the task card before submitting.
                </p>
              )}
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: isDark ? "#64748B" : "#94A3B8", display: "block", marginBottom: 8 }}>
              {isView ? "Submitted Report" : "Completion Report *"}
            </label>

          {isView ? (
            <div style={{
              padding: "14px 16px", borderRadius: 12, fontSize: 13, lineHeight: 1.7,
              background: "rgba(16,185,129,.08)", color: isDark ? "#6EE7B7" : "#065F46",
              border: "1px solid rgba(16,185,129,.2)", minHeight: 80,
            }}>
              {task.report || <em style={{ opacity: 0.6 }}>No report submitted.</em>}
            </div>
          ) : (
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="What did you accomplish? Any blockers or notes for the manager…"
              rows={5}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                background: isDark ? "rgba(255,255,255,.05)" : "#F8FAFC",
                border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                color: isDark ? "#F1F5F9" : "#0F172A", fontSize: 13, lineHeight: 1.7,
                resize: "vertical", outline: "none", fontFamily: "inherit",
                transition: "border-color .2s",
              }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#6366F1"; }}
              onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"; }}
            />
          )}

          {isView && task.completedAt && (
            <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginTop: 8 }}>
              Completed on {new Date(task.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div style={{
            padding: "14px 24px 20px", display: "flex", gap: 10,
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
          }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 500,
              border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
              background: "transparent", color: isDark ? "#64748B" : "#94A3B8", cursor: "pointer",
            }}>Cancel</button>
            <button onClick={submit} disabled={saving || !report.trim()} style={{
              flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: saving || !report.trim() ? "rgba(16,185,129,.4)" : "#10B981",
              border: "none", color: "white", cursor: saving || !report.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity .15s",
            }}>
              {saving ? <><Spinner size={14} color="white"/> Submitting…</> : "✓ Mark as Completed"}
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task, isDark, onStart, onReport, starting, onToggleItem,
}: {
  task: FirestoreTask; isDark: boolean;
  onStart: () => void; onReport: () => void;
  starting: boolean;
  onToggleItem: (itemId: string, checked: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const eff  = effectiveStatus(task);
  const sc   = SC[eff];
  const pc   = PC[task.priority];
  const due  = daysLabel(task);

  const checklist  = task.checklistItems ?? [];
  const doneCount  = checklist.filter((i) => i.checked).length;
  const totalCount = checklist.length;
  const allChecked = totalCount > 0 && doneCount === totalCount;
  const pct        = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
  const hasChecklist = totalCount > 0;

  return (
    <div className="mp-card mp-glow-card" style={{
      background: isDark
        ? "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)"
        : "#FFFFFF",
      border: `1px solid ${eff === "overdue" ? "rgba(239,68,68,.32)" : "var(--mp-border)"}`,
      borderRadius: 18, overflow: "hidden", position: "relative",
      backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
      transition: "box-shadow .25s, border-color .25s",
      boxShadow: isDark
        ? "0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)"
        : "0 2px 12px rgba(10,19,48,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
      ? `0 8px 24px rgba(0,0,0,.35), 0 0 16px ${pc.color}1f, inset 0 1px 0 rgba(255,255,255,0.04)`
      : `0 8px 22px rgba(10,19,48,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = isDark
      ? "0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)"
      : "0 2px 12px rgba(10,19,48,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"; }}>

      {/* Priority accent bar */}
      <div style={{
        height: 3, width: "100%",
        background: `linear-gradient(90deg, ${pc.color}, ${pc.color}55)`,
      }}/>

      <div style={{ padding: "16px 18px" }}>

        {/* Top row: badges + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Badge label={task.type} color="#6366F1" bg="rgba(99,102,241,.12)"/>
          <Badge label={pc.label} color={pc.color} bg={pc.bg}/>
          {due.text && (
            <span style={{ fontSize: 11, fontWeight: 600, color: due.color }}>{due.text}</span>
          )}
          {hasChecklist && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
              background: allChecked ? "rgba(16,185,129,.13)" : (isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"),
              color: allChecked ? "#10B981" : (isDark ? "#94A3B8" : "#64748B"),
              border: `1px solid ${allChecked ? "rgba(16,185,129,.25)" : "transparent"}`,
            }}>
              ☑ {doneCount}/{totalCount}
            </span>
          )}
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "3px 10px",
            borderRadius: 99, background: sc.bg, color: sc.color, flexShrink: 0,
          }}>
            {sc.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 14, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A",
          marginBottom: 6, lineHeight: 1.4,
          textDecoration: eff === "completed" ? "line-through" : "none",
          opacity: eff === "completed" ? 0.6 : 1,
        }}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p style={{
            fontSize: 12, color: isDark ? "#64748B" : "#94A3B8",
            lineHeight: 1.6, marginBottom: 12,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {task.description}
          </p>
        )}

        {/* Completed report preview */}
        {eff === "completed" && task.report && (
          <div style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 12,
            background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)",
            fontSize: 12, color: "#10B981", lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 700 }}>Report: </span>
            {task.report.slice(0, 140)}{task.report.length > 140 ? "…" : ""}
          </div>
        )}

        {/* Checklist expand toggle */}
        {hasChecklist && eff !== "completed" && (
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              width: "100%", padding: "8px 12px", borderRadius: 10, marginBottom: 12,
              background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)",
              border: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.07)"}`,
              display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"; }}
          >
            <div style={{ flex: 1, height: 6, background: isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)", borderRadius: 99, overflow: "hidden" }}>
              <div className="mp-progress-fill" style={{
                height: "100%", width: `${pct}%`,
                background: allChecked
                  ? "linear-gradient(90deg, #10B981, #34D399, #10B981)"
                  : "linear-gradient(90deg, #6366F1, #818CF8, #6366F1)",
                backgroundSize: "200% 100%",
                borderRadius: 99, transition: "width .5s var(--ease)",
                boxShadow: allChecked ? "0 0 12px rgba(16,185,129,.55)" : "0 0 10px rgba(99,102,241,.5)",
              }}/>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: allChecked ? "#10B981" : (isDark ? "#94A3B8" : "#64748B"), flexShrink: 0 }}>
              {doneCount}/{totalCount} steps
            </span>
            <span style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0 }}>▾</span>
          </button>
        )}

        {/* Expanded checklist */}
        {expanded && hasChecklist && eff !== "completed" && (
          <div style={{
            marginBottom: 12, padding: "10px 12px", borderRadius: 12,
            background: isDark ? "rgba(255,255,255,.025)" : "rgba(0,0,0,.02)",
            border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"}`,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {checklist.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onToggleItem(item.id, !item.checked)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 9, cursor: "pointer",
                  background: item.checked
                    ? (isDark ? "rgba(16,185,129,.08)" : "rgba(16,185,129,.06)")
                    : "transparent",
                  border: `1px solid ${item.checked ? "rgba(16,185,129,.2)" : "transparent"}`,
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => { if (!item.checked) (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.03)"; }}
                onMouseLeave={(e) => { if (!item.checked) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: item.impact ? 2 : 0,
                  border: `2px solid ${item.checked ? "#10B981" : (isDark ? "rgba(255,255,255,.25)" : "rgba(0,0,0,.25)")}`,
                  background: item.checked ? "#10B981" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}>
                  {item.checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* badges row */}
                  {(item.impact || item.estimatedMinutes || item.category) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginBottom: 3 }}>
                      {item.impact && (() => {
                        const ic = item.impact === "high" ? "#EF4444" : item.impact === "low" ? "#10B981" : "#F59E0B";
                        return (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: `${ic}18`, color: ic }}>
                            {item.impact.charAt(0).toUpperCase() + item.impact.slice(1)} Impact
                          </span>
                        );
                      })()}
                      {!!item.estimatedMinutes && (
                        <span style={{ fontSize: 10, color: isDark ? "#64748B" : "#94A3B8" }}>
                          ⏱ {item.estimatedMinutes >= 60
                            ? `${Math.floor(item.estimatedMinutes / 60)}h${item.estimatedMinutes % 60 > 0 ? ` ${item.estimatedMinutes % 60}m` : ""}`
                            : `${item.estimatedMinutes}m`}
                        </span>
                      )}
                      {item.category && (
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color: isDark ? "#94A3B8" : "#64748B" }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                  )}
                  <span style={{
                    fontSize: 13, fontWeight: 500,
                    color: item.checked ? (isDark ? "#6EE7B7" : "#065F46") : (isDark ? "#E2E8F0" : "#1E293B"),
                    textDecoration: item.checked ? "line-through" : "none",
                    opacity: item.checked ? 0.75 : 1,
                  }}>
                    {idx + 1}. {item.title}
                  </span>
                </div>
                {item.checked && item.checkedAt && (
                  <span style={{ fontSize: 10, color: "#10B981", flexShrink: 0 }}>
                    {new Date(item.checkedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            ))}
            {allChecked && (
              <p style={{ fontSize: 11, color: "#10B981", fontWeight: 600, textAlign: "center", marginTop: 4, padding: "6px", background: "rgba(16,185,129,.07)", borderRadius: 8 }}>
                ✓ All steps done — ready to submit your report!
              </p>
            )}
          </div>
        )}

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            title={task.deadline ? `Deadline: ${fmtDeadlinePKT(task.deadline)}` : undefined}
            style={{ fontSize: 12, color: isDark ? "#64748B" : "#94A3B8" }}>
            📅 {task.deadline ? fmtDeadlinePKT(task.deadline) : fmtDate(task.dueDate)}
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {eff === "pending" && (
              <button onClick={onStart} disabled={starting}
                className="mp-magnetic"
                style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                background: "#6366F1",
                color: "white",
                border: "none",
                boxShadow: "0 2px 8px rgba(99,102,241,.25)",
                cursor: starting ? "default" : "pointer",
                opacity: starting ? 0.7 : 1,
                lineHeight: 1,
              }}>
                {starting ? <Spinner size={12} color="white"/> : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 1.5v7L8 5 2 1.5z" fill="white"/>
                  </svg>
                )}
                Start Task
              </button>
            )}

            {(eff === "in-progress" || eff === "overdue") && (
              <button onClick={onReport}
                className="mp-magnetic"
                style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                background: hasChecklist && !allChecked ? "rgba(16,185,129,.85)" : "#10B981",
                color: "white", border: "none", cursor: "pointer",
                boxShadow: "0 2px 10px rgba(16,185,129,.28)",
                lineHeight: 1,
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M2 5.5l2.4 2.4L9 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Submit Report
              </button>
            )}

            {eff === "completed" && (
              <button onClick={onReport}
                className="mp-magnetic"
                style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
                background: isDark ? "rgba(16,185,129,.14)" : "rgba(16,185,129,.10)",
                color: "#10B981",
                border: "1px solid rgba(16,185,129,.30)",
                cursor: "pointer",
                lineHeight: 1,
              }}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 5.5s1.7-3.5 4.5-3.5S10 5.5 10 5.5s-1.7 3.5-4.5 3.5S1 5.5 1 5.5z" stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="5.5" cy="5.5" r="1.5" fill="currentColor"/>
                </svg>
                View Report
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFound({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 32 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A" }}>Member not found</h2>
      <p style={{ fontSize: 14, color: isDark ? "#64748B" : "#94A3B8", textAlign: "center", maxWidth: 320 }}>
        This link may be invalid or the member has been removed. Contact your admin.
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MEMBER PAGE
// ═════════════════════════════════════════════════════════════════════════════

export function MemberPage() {
  const memberId = window.location.pathname.split("/")[2] ?? "";

  const [member,      setMember]      = useState<FirestoreMember | null>(null);
  const [tasks,       setTasks]       = useState<FirestoreTask[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [isDark,      setIsDark]      = useState(() => getTheme());
  const [filter,      setFilter]      = useState<"all" | "pending" | "in-progress" | "completed" | "overdue">("all");
  const [dateFilter,  setDateFilter]  = useState<"all" | "today" | "week" | "older">("all");
  const [clock,       setClock]       = useState<Date>(() => new Date());
  const [reportTask,  setReportTask]  = useState<FirestoreTask | null>(null);
  const [startingId,  setStartingId]  = useState<string | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);
  const [emailInput,  setEmailInput]  = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [ideas,        setIdeas]        = useState<FirestoreIdea[]>([]);
  const [ideaTitle,    setIdeaTitle]    = useState("");
  const [ideaDesc,     setIdeaDesc]     = useState("");
  const [ideaSaving,   setIdeaSaving]   = useState(false);
  const [routines,     setRoutines]     = useState<FirestoreRoutine[]>([]);
  const [routineReport,setRoutineReport]= useState<{ id: string; text: string } | null>(null);
  const [reportSaving, setReportSaving] = useState(false);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  const [messages,          setMessages]          = useState<FirestoreMemberMessage[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [justPenalized,     setJustPenalized]     = useState(0);

  const toggleTheme = () => { const d = !isDark; setIsDark(d); saveTheme(d); };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    if (!memberId) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    try {
      const [m, t] = await Promise.all([
        fetchMemberById(memberId),
        fetchTasksByMemberId(memberId),
      ]);
      if (!m) { setNotFound(true); } else {
        setMember(m); setTasks(t); setEmailInput(m.email ?? "");
        fetchIdeasByMemberId(memberId).then(setIdeas).catch(() => {});
        fetchRoutinesByMemberId(memberId).then(setRoutines).catch(() => {});
        fetchMessagesByMemberId(memberId).then(setMessages).catch(() => {});

        // Apply overdue penalty (once per task) for tasks whose deadline has
        // passed without completion. `penaltyApplied: true` guards against
        // double-deduction whether the admin tab or this portal runs first.
        const toPenalize = t.filter((x) => x.id && isOverdue(x) && !x.penaltyApplied);
        if (toPenalize.length > 0) {
          await Promise.all(toPenalize.map(async (x) => {
            try {
              await adjustMemberScore(memberId, -TASK_SCORE_PENALTY);
              await updateTask(x.id!, { penaltyApplied: true });
            } catch { /* best-effort */ }
          }));
          setJustPenalized(toPenalize.length);
          const refreshed = await Promise.all([
            fetchMemberById(memberId),
            fetchTasksByMemberId(memberId),
          ]);
          if (refreshed[0]) setMember(refreshed[0]);
          setTasks(refreshed[1]);
        }
      }
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [memberId]);

  useEffect(() => { load(); }, [load]);

  // Live clock for navbar — tick every 30s (cheap, no per-second re-renders).
  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  async function saveEmail() {
    if (!memberId) return;
    const trimmed = emailInput.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast("Please enter a valid email address.");
      return;
    }
    setEmailSaving(true);
    try {
      await updateMember(memberId, { email: trimmed });
      setMember((prev) => prev ? { ...prev, email: trimmed } : prev);
      showToast(trimmed ? "Email saved! You'll be notified on new tasks ✉️" : "Email removed.");
    } catch { showToast("Failed to save email."); }
    finally { setEmailSaving(false); }
  }

  async function submitIdea() {
    if (!ideaTitle.trim() || !memberId || !member) return;
    setIdeaSaving(true);
    try {
      await createIdea({
        title:       ideaTitle.trim(),
        description: ideaDesc.trim(),
        memberId,
        memberName:  member.name,
        memberColor: member.color || "#6366F1",
        category:    "",
        status:      "new",
        adminComment: "",
      });
      setIdeaTitle(""); setIdeaDesc("");
      const updated = await fetchIdeasByMemberId(memberId);
      setIdeas(updated);
      showToast("Idea submitted! Your team will review it 💡");
    } catch { showToast("Failed to submit idea."); }
    finally { setIdeaSaving(false); }
  }

  async function toggleChecklistItem(taskId: string, itemId: string, checked: boolean) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const updatedItems: ChecklistItem[] = (task.checklistItems ?? []).map((item) =>
      item.id === itemId ? { ...item, checked, checkedAt: checked ? new Date().toISOString() : "" } : item
    );
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, checklistItems: updatedItems } : t));
    setReportTask((prev) => prev?.id === taskId ? { ...prev, checklistItems: updatedItems } : prev);
    try {
      await updateTask(taskId, { checklistItems: updatedItems });
    } catch {
      setTasks((prev) => prev.map((t) => t.id === taskId ? task : t));
      setReportTask((prev) => prev?.id === taskId ? task : prev);
      showToast("Failed to save. Try again.");
    }
  }

  async function toggleRoutineItem(routineId: string, itemId: string, checked: boolean) {
    const routine = routines.find((r) => r.id === routineId);
    if (!routine || !routineId) return;
    const updatedItems = routine.items.map((item) =>
      item.id === itemId
        ? { ...item, checked, checkedAt: checked ? new Date().toISOString() : "" }
        : item
    );
    const allDone = updatedItems.every((i) => i.checked);
    const anyDone = updatedItems.some((i) => i.checked);
    const newStatus = allDone ? "completed" : anyDone ? "in-progress" : "pending";
    const optimistic: FirestoreRoutine = { ...routine, items: updatedItems, status: newStatus };
    setRoutines((prev) => prev.map((r) => r.id === routineId ? optimistic : r));
    try {
      await updateRoutine(routineId, { items: updatedItems, status: newStatus });
    } catch {
      setRoutines((prev) => prev.map((r) => r.id === routineId ? routine : r));
      showToast("Failed to save. Try again.");
    }
  }

  async function submitRoutineReport(routineId: string, report: string) {
    if (!report.trim()) return;
    setReportSaving(true);
    try {
      await updateRoutine(routineId, {
        report: report.trim(),
        reportedAt: new Date().toISOString(),
        status: "completed",
      });
      setRoutines((prev) => prev.map((r) =>
        r.id === routineId ? { ...r, report: report.trim(), status: "completed" } : r
      ));
      setRoutineReport(null);
      showToast("Report submitted! Great work ✅");
    } catch { showToast("Failed to submit report."); }
    finally { setReportSaving(false); }
  }

  async function toggleMessageExpand(msg: FirestoreMemberMessage) {
    if (!msg.id) return;
    const nextId = expandedMessageId === msg.id ? null : msg.id;
    setExpandedMessageId(nextId);
    if (nextId && !msg.read) {
      setMessages((prev) => prev.map((m) =>
        m.id === msg.id ? { ...m, read: true, readAt: new Date().toISOString() } : m
      ));
      try {
        await updateMemberMessage(msg.id, { read: true, readAt: new Date().toISOString() });
      } catch { /* best-effort */ }
    }
  }

  const unreadMessageCount = messages.filter((m) => !m.read).length;

  async function handleStart(task: FirestoreTask) {
    if (!task.id) return;
    setStartingId(task.id);
    try {
      await updateTask(task.id, { status: "in-progress" });
      await load();
      showToast("Task started! Good luck 🚀");
    } finally { setStartingId(null); }
  }

  const stats = {
    total:      tasks.length,
    pending:    tasks.filter((t) => effectiveStatus(t) === "pending").length,
    inProgress: tasks.filter((t) => effectiveStatus(t) === "in-progress").length,
    completed:  tasks.filter((t) => effectiveStatus(t) === "completed").length,
    overdue:    tasks.filter((t) => isOverdue(t)).length,
  };

  // —— Date scope helpers — uses deadline date if present, else dueDate.
  const todayKey = todayStr();
  function taskDateKey(t: FirestoreTask): string {
    if (t.deadline) {
      const d = new Date(t.deadline);
      if (!isNaN(d.getTime())) {
        const y   = d.getFullYear();
        const m   = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
      }
    }
    return t.dueDate ?? "";
  }
  function dayOffset(t: FirestoreTask): number {
    const k = taskDateKey(t);
    if (!k) return NaN;
    const t0 = new Date(todayKey + "T00:00:00").getTime();
    const tk = new Date(k        + "T00:00:00").getTime();
    return Math.round((tk - t0) / 86400000);
  }

  const dateCounts = {
    today: tasks.filter((t) => dayOffset(t) === 0).length,
    week:  tasks.filter((t) => { const d = dayOffset(t); return !isNaN(d) && d >= 0 && d <= 7; }).length,
    older: tasks.filter((t) => { const d = dayOffset(t); return !isNaN(d) && d < 0; }).length,
  };

  const filtered = tasks.filter((t) => {
    if (filter !== "all" && effectiveStatus(t) !== filter) return false;
    if (dateFilter === "all") return true;
    const d = dayOffset(t);
    if (dateFilter === "today") return d === 0;
    if (dateFilter === "week")  return !isNaN(d) && d >= 0 && d <= 7;
    if (dateFilter === "older") return !isNaN(d) && d < 0;
    return true;
  });

  // Sort: overdue first, then pending, in-progress, completed last
  const sorted = [...filtered].sort((a, b) => {
    const order = { overdue: 0, pending: 1, "in-progress": 2, completed: 3 };
    return (order[effectiveStatus(a)] ?? 4) - (order[effectiveStatus(b)] ?? 4);
  });

  const dark = isDark ? "true" : "false";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="mp-root" data-mp-dark={dark}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <Spinner size={28} color="#6366F1"/>
          <span style={{ color: isDark ? "#64748B" : "#94A3B8", fontSize: 14 }}>Loading your tasks…</span>
        </div>
      </>
    );
  }

  if (notFound || !member) {
    return (
      <>
        <style>{CSS}</style>
        <div className="mp-root" data-mp-dark={dark}>
          <NotFound isDark={isDark}/>
        </div>
      </>
    );
  }

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="mp-root" data-mp-dark={dark} style={{ minHeight: "100vh" }}>

        <AuroraBackground/>

        <div className="mp-content">

        {/* ── Navbar ──────────────────────────────────────────────────────────── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: isDark ? "rgba(6,11,34,.78)" : "rgba(242,245,252,.85)",
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderBottom: `1px solid ${isDark ? "rgba(190,210,255,.07)" : "rgba(15,30,80,.07)"}`,
          padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          boxShadow: isDark ? "0 1px 0 rgba(0,0,0,0.4)" : "0 1px 4px rgba(10,19,48,0.04)",
        }}>
          {/* —— Left: brand —— */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div className="mp-sheen" style={{ position: "relative", width: 36, height: 36, flexShrink: 0, borderRadius: 11 }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: 11,
                background: "linear-gradient(135deg, #4F7DFF 0%, #22B8D4 60%, #8B5CF6 120%)",
                backgroundSize: "200% 200%",
                animation: "mp-gradient-flow 6s ease-in-out infinite",
                boxShadow: "0 6px 20px rgba(79,125,255,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset",
              }}/>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 900, color: "white",
                letterSpacing: "0.02em",
                textShadow: "0 1px 3px rgba(0,0,0,0.35)",
              }}>
                ZH
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span className="mp-holo-text" style={{
                fontSize: 15, fontWeight: 800,
                letterSpacing: "-0.02em",
              }}>
                ZynHive
              </span>
              <span style={{
                fontSize: 9.5, fontWeight: 700, marginTop: 1,
                color: isDark ? "#8C99C2" : "#6B7AA0",
                letterSpacing: "0.16em", textTransform: "uppercase",
                fontFamily: "'JetBrains Mono', monospace",
                display: "inline-flex", alignItems: "center", gap: 5,
              }}>
                <span className="mp-dot-pulse" style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }}/>
                Member Portal
              </span>
            </div>
          </div>

          {/* —— Center: live clock + today scope chip (hidden on small) —— */}
          <div className="mp-nav-center" style={{
            display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", minWidth: 0,
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "6px 14px", borderRadius: 99,
              background: isDark ? "rgba(16,25,55,0.5)" : "rgba(255,255,255,0.7)",
              border: `1px solid ${isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)"}`,
              backdropFilter: "blur(8px)",
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "#10B981",
                boxShadow: "0 0 8px #10B981",
                animation: "mp-pulse-dot 2.2s ease-in-out infinite",
                flexShrink: 0,
              }}/>
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: isDark ? "#EEF2FF" : "#0A1330",
                letterSpacing: "0.02em",
                fontVariantNumeric: "tabular-nums",
              }}>
                {clock.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
              </span>
              <span style={{
                width: 1, height: 12, background: isDark ? "rgba(190,210,255,.18)" : "rgba(15,30,80,.15)",
              }}/>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: isDark ? "#8C99C2" : "#6B7AA0",
                letterSpacing: "0.04em",
              }}>
                {clock.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>

            {dateCounts.today > 0 && (
              <button onClick={() => { setDateFilter("today"); setFilter("all"); }}
                className="mp-chip"
                title="Filter to today's tasks"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                  background: isDark ? "rgba(79,125,255,0.14)" : "rgba(30,58,138,0.08)",
                  border: `1px solid ${isDark ? "rgba(79,125,255,0.30)" : "rgba(30,58,138,0.18)"}`,
                  color: isDark ? "#7099FF" : "#1E3A8A",
                  cursor: "pointer", whiteSpace: "nowrap",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                📅 {dateCounts.today} today
              </button>
            )}
          </div>

          {/* —— Right: alerts + bell + theme —— */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {stats.overdue > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 99,
                background: "rgba(239,68,68,.14)", color: "#EF4444",
                border: "1px solid rgba(239,68,68,.30)",
                display: "inline-flex", alignItems: "center", gap: 6,
                animation: "glowPulse 2.4s ease-in-out infinite",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }}/>
                {stats.overdue} overdue
              </span>
            )}

            {/* Unread message bell */}
            <button
              onClick={() => {
                const el = document.getElementById("mp-messages");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              aria-label="Messages"
              title={unreadMessageCount > 0 ? `${unreadMessageCount} unread message${unreadMessageCount !== 1 ? "s" : ""}` : "No new messages"}
              style={{
                position: "relative",
                width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                background: isDark ? "rgba(190,210,255,.06)" : "rgba(15,30,80,.05)",
                border: `1px solid ${isDark ? "rgba(190,210,255,.12)" : "rgba(15,30,80,.10)"}`,
                color: isDark ? "#C5CFF1" : "#4B567B",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .18s, border-color .18s, transform .15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? "rgba(99,102,241,0.14)" : "rgba(99,102,241,0.10)";
                el.style.borderColor = "rgba(99,102,241,0.35)";
                el.style.color = "#6366F1";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? "rgba(190,210,255,.06)" : "rgba(15,30,80,.05)";
                el.style.borderColor = isDark ? "rgba(190,210,255,.12)" : "rgba(15,30,80,.10)";
                el.style.color = isDark ? "#C5CFF1" : "#4B567B";
              }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M3.5 12V7c0-2.2 1.8-4 4-4s4 1.8 4 4v5M2.5 12h10M6 13.5c.3.6.9 1 1.5 1s1.2-.4 1.5-1"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {unreadMessageCount > 0 && (
                <span style={{
                  position: "absolute", top: -3, right: -3,
                  minWidth: 16, height: 16, padding: "0 4px",
                  borderRadius: 99, background: "#EF4444", color: "white",
                  fontSize: 9.5, fontWeight: 800, lineHeight: "16px",
                  border: `2px solid ${isDark ? "#06080E" : "#F1F5F9"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "mp-pulse-dot 2s ease-in-out infinite",
                }}>
                  {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                </span>
              )}
            </button>

            <button onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                background: isDark ? "rgba(190,210,255,.06)" : "rgba(15,30,80,.05)",
                border: `1px solid ${isDark ? "rgba(190,210,255,.12)" : "rgba(15,30,80,.10)"}`,
                color: isDark ? "#C5CFF1" : "#4B567B",
                fontSize: 15,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "background .18s, border-color .18s, transform .15s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? "rgba(79,125,255,0.12)" : "rgba(30,58,138,0.08)";
                el.style.borderColor = isDark ? "rgba(79,125,255,0.30)" : "rgba(30,58,138,0.20)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = isDark ? "rgba(190,210,255,.06)" : "rgba(15,30,80,.05)";
                el.style.borderColor = isDark ? "rgba(190,210,255,.12)" : "rgba(15,30,80,.10)";
                el.style.transform = "translateY(0)";
              }}>
              {isDark ? "☀" : "☽"}
            </button>
          </div>
        </nav>

        {/* ── Hero / Profile ───────────────────────────────────────────────────── */}
        {(() => {
          const hour = new Date().getHours();
          const greeting = hour < 5 ? "Working late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Welcome back";
          const firstName = member.name.split(" ")[0];
          const score = member.score ?? 0;
          return (
            <div style={{
              position: "relative",
              padding: "40px 24px 32px",
              background: isDark
                ? `linear-gradient(135deg, rgba(79,125,255,0.10) 0%, rgba(34,184,212,0.05) 40%, transparent 100%), radial-gradient(ellipse 80% 60% at 10% 0%, rgba(79,125,255,0.12) 0%, transparent 60%)`
                : `linear-gradient(135deg, rgba(30,58,138,0.07) 0%, rgba(8,145,178,0.04) 40%, transparent 100%), radial-gradient(ellipse 80% 60% at 10% 0%, rgba(30,58,138,0.08) 0%, transparent 60%)`,
              borderBottom: `1px solid ${isDark ? "rgba(190,210,255,.07)" : "rgba(15,30,80,.07)"}`,
              overflow: "hidden",
            }}>
              {/* Subtle grid */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4,
                backgroundImage: isDark
                  ? "linear-gradient(rgba(140,170,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(140,170,255,0.05) 1px, transparent 1px)"
                  : "linear-gradient(rgba(30,58,138,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,0.05) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
                maskImage: "radial-gradient(ellipse 60% 60% at 50% 0%, black 30%, transparent 100%)",
              }}/>

              <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 1 }}>

                {/* Greeting chip */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "5px 11px", borderRadius: 99, marginBottom: 14,
                  background: isDark ? "rgba(79,125,255,0.12)" : "rgba(30,58,138,0.07)",
                  border: `1px solid ${isDark ? "rgba(79,125,255,0.25)" : "rgba(30,58,138,0.15)"}`,
                  fontSize: 10.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                  color: isDark ? "#7099FF" : "#1E3A8A",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981" }}/>
                  Member Portal
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>

                  {/* Avatar — holographic rotating ring + orbiting satellites */}
                  <div style={{ position: "relative", flexShrink: 0, width: 80, height: 80 }}>
                    <div className="mp-holo-ring-soft"/>
                    <div className="mp-holo-ring-sharp"/>
                    <div className="mp-orbit"/>
                    <div style={{
                      position: "relative",
                      width: 80, height: 80, borderRadius: 22,
                      background: member.imageUrl
                        ? "transparent"
                        : `linear-gradient(135deg, ${member.color}, ${member.color}99)`,
                      padding: 3,
                      overflow: "hidden",
                      boxShadow: `0 16px 40px ${member.color}55, 0 0 0 1px ${member.color}30`,
                    }}>
                      <div style={{
                        width: "100%", height: "100%", borderRadius: 19,
                        background: isDark ? "#0A1130" : "#fff",
                        overflow: "hidden",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                        ) : (
                          <span style={{ fontSize: 28, fontWeight: 900, color: member.color, letterSpacing: "-0.02em" }}>
                            {member.initials}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Live status dot */}
                    <div className="mp-dot-pulse" style={{
                      position: "absolute", bottom: 2, right: 2,
                      width: 16, height: 16, borderRadius: "50%", background: "#10B981",
                      border: `3px solid ${isDark ? "#070A1C" : "#F2F5FC"}`,
                      boxShadow: "0 0 14px rgba(16,185,129,0.85)",
                    }}/>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 11.5, fontWeight: 700, marginBottom: 4,
                      color: isDark ? "#8C99C2" : "#6B7AA0",
                      letterSpacing: "0.10em", textTransform: "uppercase",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}>
                      {greeting} ·
                    </p>
                    <h1 style={{
                      fontSize: 30, fontWeight: 900, marginBottom: 8,
                      letterSpacing: "-0.03em", lineHeight: 1.1,
                      display: "inline-flex", alignItems: "center", gap: 8,
                    }}>
                      <span className="mp-holo-text">{firstName}</span>
                      <span style={{
                        display: "inline-block",
                        animation: "mp-pulse-dot 2.4s ease-in-out infinite",
                        transformOrigin: "70% 70%",
                      }}>👋</span>
                    </h1>
                    <p style={{
                      fontSize: 12.5, color: isDark ? "#8C99C2" : "#6B7AA0",
                      fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8,
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.02em",
                    }}>
                      <span style={{
                        width: 18, height: 1.5, background: `linear-gradient(90deg, ${member.color}, transparent)`,
                      }}/>
                      {member.role}
                    </p>
                  </div>

                  {/* Score + Ring stack */}
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>

                    {/* Performance score */}
                    <div style={{
                      padding: "10px 14px", borderRadius: 14,
                      background: score > 0
                        ? (isDark ? "rgba(52,211,153,0.10)" : "rgba(15,157,111,0.07)")
                        : score < 0
                        ? (isDark ? "rgba(248,113,113,0.10)" : "rgba(220,41,68,0.07)")
                        : (isDark ? "rgba(255,255,255,0.04)" : "rgba(15,30,80,0.04)"),
                      border: `1px solid ${score > 0 ? "rgba(16,185,129,0.30)" : score < 0 ? "rgba(220,41,68,0.30)" : (isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.10)")}`,
                      textAlign: "center", minWidth: 76,
                    }}>
                      <div style={{
                        fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
                        color: isDark ? "#8C99C2" : "#6B7AA0", marginBottom: 2,
                      }}>
                        ★ Score
                      </div>
                      <div style={{
                        fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em",
                        color: score > 0 ? "#10B981" : score < 0 ? "#EF4444" : (isDark ? "#8C99C2" : "#6B7AA0"),
                      }}>
                        {score > 0 ? `+${score}` : score}
                      </div>
                    </div>

                    {/* Completion ring */}
                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                      <svg width="72" height="72" viewBox="0 0 72 72">
                        <defs>
                          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={member.color || "#4F7DFF"}/>
                            <stop offset="100%" stopColor={member.color ? `${member.color}99` : "#22B8D4"}/>
                          </linearGradient>
                        </defs>
                        <circle cx="36" cy="36" r="30" fill="none"
                          stroke={isDark ? "rgba(190,210,255,.07)" : "rgba(15,30,80,.07)"} strokeWidth="6"/>
                        <circle cx="36" cy="36" r="30" fill="none"
                          stroke="url(#ringGrad)" strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 30}`}
                          strokeDashoffset={`${2 * Math.PI * 30 * (1 - completionPct / 100)}`}
                          transform="rotate(-90 36 36)"
                          style={{ transition: "stroke-dashoffset .6s ease", filter: `drop-shadow(0 0 6px ${member.color || "#4F7DFF"}80)` }}
                        />
                        <text x="36" y="41" textAnchor="middle" fontSize="14" fontWeight="800"
                          fill={isDark ? "#EEF2FF" : "#0A1330"}>
                          {completionPct}%
                        </text>
                      </svg>
                      <p style={{
                        fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                        color: isDark ? "#8C99C2" : "#6B7AA0", marginTop: 2,
                      }}>
                        Done
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stat pills — holo-tilt cards with count-up + shine sweep */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(126px, 1fr))", gap: 10, marginTop: 26 }}>
                  {[
                    { label: "Total",       value: stats.total,      color: "#4F7DFF", icon: "▦" },
                    { label: "Pending",     value: stats.pending,    color: "#8C99C2", icon: "◯" },
                    { label: "In Progress", value: stats.inProgress, color: "#F59E0B", icon: "◐" },
                    { label: "Completed",   value: stats.completed,  color: "#10B981", icon: "✓" },
                    { label: "Overdue",     value: stats.overdue,    color: "#EF4444", icon: "!" },
                  ].map(({ label, value, color, icon }, idx) => (
                    <Tilt3D key={label} intensity={4}
                      style={{ animation: `mp-rise .55s var(--ease) ${idx * 80}ms both` }}>
                      <div
                        className="mp-stat"
                        style={{
                          padding: "14px 16px", borderRadius: 14,
                          background: isDark
                            ? "linear-gradient(180deg, rgba(16,25,55,0.7) 0%, rgba(10,17,40,0.55) 100%)"
                            : "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.85) 100%)",
                          border: `1px solid ${isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)"}`,
                          backdropFilter: "blur(14px)",
                          WebkitBackdropFilter: "blur(14px)",
                          boxShadow: isDark
                            ? `0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)`
                            : `0 4px 16px rgba(10,19,48,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
                          cursor: "default",
                          transition: "border-color .25s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = `${color}66`;
                          (e.currentTarget as HTMLElement).style.boxShadow = isDark
                            ? `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${color}33, inset 0 1px 0 rgba(255,255,255,0.06)`
                            : `0 12px 30px ${color}25, inset 0 1px 0 rgba(255,255,255,0.9)`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)";
                          (e.currentTarget as HTMLElement).style.boxShadow = isDark
                            ? "0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)"
                            : "0 4px 16px rgba(10,19,48,0.06), inset 0 1px 0 rgba(255,255,255,0.8)";
                        }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{
                            width: 24, height: 24, borderRadius: 8, fontSize: 12, fontWeight: 900,
                            background: `linear-gradient(135deg, ${color}28, ${color}10)`,
                            color,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid ${color}40`,
                            boxShadow: `0 0 12px ${color}33`,
                          }}>
                            {icon}
                          </span>
                          <span style={{
                            fontSize: 9.5, fontWeight: 700, letterSpacing: "0.10em", textTransform: "uppercase",
                            color: isDark ? "#8C99C2" : "#6B7AA0",
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 26, fontWeight: 900,
                          color: isDark ? "#EEF2FF" : "#0A1330",
                          letterSpacing: "-0.025em", lineHeight: 1,
                          fontFamily: "'Inter', sans-serif",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          <CountUp value={value}/>
                        </div>
                      </div>
                    </Tilt3D>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Main Content ─────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 48px" }}>

          {/* ── Overdue Banner ────────────────────────────────────────────────── */}
          {stats.overdue > 0 && (
            <div style={{
              marginBottom: 20, padding: "14px 18px", borderRadius: 14,
              background: isDark ? "rgba(239,68,68,0.10)" : "rgba(239,68,68,0.07)",
              border: `1px solid ${isDark ? "rgba(239,68,68,0.32)" : "rgba(239,68,68,0.25)"}`,
              display: "flex", alignItems: "center", gap: 14,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                background: "rgba(239,68,68,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>⚠️</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 13.5, fontWeight: 700, margin: 0,
                  color: isDark ? "#FCA5A5" : "#B91C1C",
                }}>
                  {stats.overdue} overdue task{stats.overdue !== 1 ? "s" : ""}
                  {justPenalized > 0 && (
                    <span style={{ fontWeight: 600, marginLeft: 8 }}>
                      · −{justPenalized * TASK_SCORE_PENALTY} just applied
                    </span>
                  )}
                </p>
                <p style={{
                  fontSize: 11.5, margin: "2px 0 0 0",
                  color: isDark ? "#FCA5A5cc" : "#B91C1Ccc",
                }}>
                  Each overdue task deducts <strong>−{TASK_SCORE_PENALTY}</strong> from your score. Wrap them up to stop the bleeding.
                </p>
              </div>
              <button
                onClick={() => { setFilter("overdue"); setDateFilter("all"); }}
                style={{
                  padding: "8px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                  background: "#EF4444", color: "white", border: "none", cursor: "pointer",
                  flexShrink: 0, whiteSpace: "nowrap",
                }}>
                View Overdue →
              </button>
            </div>
          )}

          {/* ── Admin Messages ────────────────────────────────────────────────── */}
          {messages.length > 0 && (
            <div id="mp-messages" style={{ marginBottom: 24, scrollMarginTop: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: isDark ? "#64748B" : "#94A3B8", margin: 0 }}>
                  Messages from Admin
                </p>
                {unreadMessageCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99,
                    background: "#EF4444", color: "white", lineHeight: 1.4,
                  }}>
                    {unreadMessageCount} new
                  </span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map((msg) => {
                  const isExpanded = expandedMessageId === msg.id;
                  const unread     = !msg.read;
                  const ts         = msg.createdAt
                    ? new Date((msg.createdAt as unknown as { toMillis(): number }).toMillis()).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
                      })
                    : "";
                  return (
                    <div key={msg.id} className="mp-card"
                      onClick={() => toggleMessageExpand(msg)}
                      style={{
                        borderRadius: 14, overflow: "hidden", cursor: "pointer",
                        background: unread
                          ? (isDark ? "rgba(99,102,241,0.10)" : "rgba(99,102,241,0.06)")
                          : (isDark ? "rgba(255,255,255,.03)" : "#FFFFFF"),
                        border: `1px solid ${unread ? "rgba(99,102,241,0.35)" : (isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)")}`,
                        transition: "background .2s, border-color .2s",
                      }}>
                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                            background: unread ? "#6366F1" : (isDark ? "rgba(255,255,255,.08)" : "rgba(99,102,241,.12)"),
                            color: unread ? "white" : "#6366F1",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
                          }}>
                            ✉
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <p style={{
                                fontSize: 13, fontWeight: unread ? 700 : 600,
                                color: isDark ? "#F1F5F9" : "#0F172A",
                                margin: 0, overflow: "hidden", textOverflow: "ellipsis",
                                whiteSpace: isExpanded ? "normal" : "nowrap",
                              }}>
                                {msg.title || "Message from Admin"}
                              </p>
                              {unread && (
                                <span style={{
                                  width: 6, height: 6, borderRadius: "50%", background: "#EF4444", flexShrink: 0,
                                }}/>
                              )}
                            </div>
                            {!isExpanded && (
                              <p style={{
                                fontSize: 12, color: isDark ? "#94A3B8" : "#64748B",
                                margin: "2px 0 0 0", overflow: "hidden", textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}>
                                {msg.body}
                              </p>
                            )}
                          </div>
                          <span style={{
                            fontSize: 11, color: isDark ? "#64748B" : "#94A3B8",
                            flexShrink: 0, whiteSpace: "nowrap",
                          }}>
                            {ts}
                          </span>
                          <span style={{
                            fontSize: 12, color: isDark ? "#64748B" : "#94A3B8",
                            transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s", flexShrink: 0,
                          }}>▾</span>
                        </div>

                        {isExpanded && (
                          <div style={{
                            marginTop: 10, paddingTop: 10,
                            borderTop: `1px solid ${isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)"}`,
                          }}>
                            <p style={{
                              fontSize: 13, lineHeight: 1.65,
                              color: isDark ? "#CBD5E1" : "#334155",
                              margin: 0, whiteSpace: "pre-wrap",
                            }}>
                              {msg.body}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Date scope */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              color: isDark ? "#64748B" : "#94A3B8",
              fontFamily: "'JetBrains Mono', monospace",
              marginRight: 4,
            }}>
              Date
            </span>
            {([
              { key: "all",   label: "All Time", count: stats.total,         color: "#4F7DFF" },
              { key: "today", label: "Today",    count: dateCounts.today,    color: "#10B981" },
              { key: "week",  label: "This Week",count: dateCounts.week,     color: "#22B8D4" },
              { key: "older", label: "Older",    count: dateCounts.older,    color: "#94A3B8" },
            ] as const).map(({ key, label, count, color }) => {
              const active = dateFilter === key;
              return (
                <button key={key} onClick={() => setDateFilter(key)}
                  className="mp-chip"
                  data-active={active ? "true" : "false"}
                  style={{
                    padding: "6px 12px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, cursor: "pointer",
                    background: active
                      ? `linear-gradient(135deg, ${color}28, ${color}10)`
                      : (isDark ? "rgba(16,25,55,0.5)" : "rgba(255,255,255,0.7)"),
                    border: `1px solid ${active ? color : (isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)")}`,
                    color: active ? color : (isDark ? "#8C99C2" : "#6B7AA0"),
                    letterSpacing: "-0.005em",
                    backdropFilter: "blur(8px)",
                    boxShadow: active ? `0 4px 14px ${color}28` : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = `${color}55`;
                      el.style.color = color;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)";
                      el.style.color = isDark ? "#8C99C2" : "#6B7AA0";
                    }
                  }}>
                  {label} <span style={{ opacity: .65, fontFamily: "'JetBrains Mono', monospace" }}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
              color: isDark ? "#64748B" : "#94A3B8",
              fontFamily: "'JetBrains Mono', monospace",
              marginRight: 4,
            }}>
              Status
            </span>
            {(["all", "pending", "in-progress", "completed", "overdue"] as const).map((f) => {
              const labels: Record<string, string> = {
                all: `All (${stats.total})`,
                pending: `Pending (${stats.pending})`,
                "in-progress": `In Progress (${stats.inProgress})`,
                completed: `Completed (${stats.completed})`,
                overdue: `Overdue (${stats.overdue})`,
              };
              const active = filter === f;
              const accentColor = f === "overdue" ? "#EF4444" : f === "completed" ? "#10B981" : f === "in-progress" ? "#F59E0B" : "#4F7DFF";
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className="mp-chip"
                  data-active={active ? "true" : "false"}
                  style={{
                  padding: "8px 16px", borderRadius: 99, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                  background: active
                    ? `linear-gradient(135deg, ${accentColor}28, ${accentColor}10)`
                    : (isDark ? "rgba(16,25,55,0.5)" : "rgba(255,255,255,0.7)"),
                  border: `1px solid ${active ? accentColor : (isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)")}`,
                  color: active ? accentColor : (isDark ? "#8C99C2" : "#6B7AA0"),
                  letterSpacing: "-0.005em",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  boxShadow: active ? `0 4px 16px ${accentColor}33` : "none",
                  fontFamily: "'Inter', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = `${accentColor}55`;
                    el.style.color = accentColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)";
                    el.style.color = isDark ? "#8C99C2" : "#6B7AA0";
                  }
                }}>
                  {labels[f]}
                </button>
              );
            })}

            <button onClick={load}
              className="mp-chip"
              style={{
              marginLeft: "auto", padding: "8px 16px", borderRadius: 99, fontSize: 12.5, fontWeight: 700,
              background: isDark ? "rgba(16,25,55,0.5)" : "rgba(255,255,255,0.7)", cursor: "pointer",
              border: `1px solid ${isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)"}`,
              color: isDark ? "#8C99C2" : "#6B7AA0",
              display: "inline-flex", alignItems: "center", gap: 6,
              backdropFilter: "blur(8px)",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = "rgba(79,125,255,0.5)";
              el.style.color = "#4F7DFF";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = isDark ? "rgba(190,210,255,.10)" : "rgba(15,30,80,.08)";
              el.style.color = isDark ? "#8C99C2" : "#6B7AA0";
            }}>
              ↻ Refresh
            </button>
          </div>

          {/* Task list */}
          {sorted.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "64px 32px",
              border: `2px dashed ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
              borderRadius: 20, color: isDark ? "#475569" : "#CBD5E1",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: isDark ? "#64748B" : "#94A3B8", marginBottom: 6 }}>
                {tasks.length === 0 ? "No tasks assigned yet" : "No tasks match these filters"}
              </p>
              <p style={{ fontSize: 13, marginBottom: tasks.length === 0 ? 0 : 14 }}>
                {tasks.length === 0 ? "Your manager will assign tasks here soon." : "Try a different Date or Status filter — or clear them."}
              </p>
              {tasks.length > 0 && (filter !== "all" || dateFilter !== "all") && (
                <button
                  onClick={() => { setFilter("all"); setDateFilter("all"); }}
                  className="mp-magnetic"
                  style={{
                    padding: "8px 16px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                    background: "#6366F1", color: "white", border: "none", cursor: "pointer",
                    boxShadow: "0 2px 10px rgba(99,102,241,.3)",
                  }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sorted.map((t, idx) => (
                <Tilt3D key={t.id} intensity={3}
                  style={{ animation: `mp-rise .5s var(--ease) ${Math.min(idx, 8) * 60}ms both` }}>
                  <TaskCard
                    task={t} isDark={isDark}
                    starting={startingId === t.id}
                    onStart={() => handleStart(t)}
                    onReport={() => setReportTask(t)}
                    onToggleItem={(itemId, checked) => toggleChecklistItem(t.id!, itemId, checked)}
                  />
                </Tilt3D>
              ))}
            </div>
          )}

          {/* Email notification settings */}
          <div style={{
            marginTop: 36, padding: "20px 22px", borderRadius: 16,
            background: isDark ? "rgba(99,102,241,.07)" : "rgba(99,102,241,.05)",
            border: `1px solid ${isDark ? "rgba(99,102,241,.2)" : "rgba(99,102,241,.18)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: "rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15,
              }}>✉️</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#C7D2FE" : "#4338CA", margin: 0 }}>
                  Task Notifications
                </p>
                <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", margin: 0, marginTop: 1 }}>
                  Get an email whenever a new task is assigned to you
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveEmail(); }}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: "9px 13px", borderRadius: 10, fontSize: 13,
                  background: isDark ? "rgba(255,255,255,.06)" : "#FFFFFF",
                  border: `1px solid ${isDark ? "rgba(255,255,255,.12)" : "rgba(99,102,241,.3)"}`,
                  color: isDark ? "#F1F5F9" : "#0F172A", outline: "none", fontFamily: "inherit",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#6366F1"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = isDark ? "rgba(255,255,255,.12)" : "rgba(99,102,241,.3)"; }}
              />
              <button onClick={saveEmail} disabled={emailSaving} style={{
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: emailSaving ? "rgba(99,102,241,.4)" : "#6366F1",
                border: "none", color: "white", cursor: emailSaving ? "default" : "pointer",
                transition: "opacity .15s", flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
              }}>
                {emailSaving
                  ? <><Spinner size={13} color="white"/> Saving…</>
                  : (member?.email && emailInput === member.email ? "✓ Saved" : "Save")}
              </button>
            </div>
            {member?.email && (
              <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginTop: 8, marginBottom: 0 }}>
                Currently notifying: <strong style={{ color: isDark ? "#A5B4FC" : "#4F46E5" }}>{member.email}</strong>
              </p>
            )}
          </div>

          {/* ── Daily Routines Section ───────────────────────────────────────── */}
          {routines.length > 0 && (
            <div style={{ marginTop: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: isDark ? "#64748B" : "#94A3B8", marginBottom: 12 }}>
                Daily Routines ({routines.length})
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {routines.map((routine) => {
                  const checkedCount = routine.items.filter((i) => i.checked).length;
                  const total        = routine.items.length;
                  const pct          = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
                  const isExpanded   = expandedRoutineId === routine.id;
                  const statusColor  = routine.status === "completed" ? "#10B981" : routine.status === "in-progress" ? "#F59E0B" : "#94A3B8";
                  const statusLabel  = routine.status === "completed" ? "Completed" : routine.status === "in-progress" ? "In Progress" : "Pending";

                  return (
                    <div key={routine.id} className="mp-card" style={{
                      borderRadius: 16, overflow: "hidden",
                      background: isDark ? "rgba(255,255,255,.025)" : "#FFFFFF",
                      border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`,
                    }}>
                      {/* Color bar */}
                      <div style={{ height: 3, background: member?.color || "#6366F1" }}/>

                      {/* Header — clickable to expand */}
                      <div
                        onClick={() => setExpandedRoutineId(isExpanded ? null : (routine.id ?? null))}
                        style={{ padding: "14px 16px", cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 2 }}>
                              {routine.title}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              {routine.timeRange && (
                                <span style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>🕐 {routine.timeRange}</span>
                              )}
                              <span style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>
                                📅 {new Date(routine.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99,
                              background: `${statusColor}18`, color: statusColor,
                              border: `1px solid ${statusColor}30`,
                            }}>
                              {statusLabel}
                            </span>
                            <span style={{ fontSize: 12, color: isDark ? "#64748B" : "#94A3B8", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}>▾</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 7, background: isDark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.06)", borderRadius: 99, overflow: "hidden" }}>
                            <div className="mp-progress-fill" style={{
                              height: "100%", width: `${pct}%`,
                              background: pct === 100
                                ? "linear-gradient(90deg, #10B981, #34D399, #10B981)"
                                : `linear-gradient(90deg, ${member?.color || "#6366F1"}, ${member?.color || "#6366F1"}cc, ${member?.color || "#6366F1"})`,
                              backgroundSize: "200% 100%",
                              borderRadius: 99, transition: "width .5s var(--ease)",
                              boxShadow: pct === 100 ? "0 0 12px rgba(16,185,129,.55)" : `0 0 10px ${(member?.color || "#6366F1")}55`,
                            }}/>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? "#10B981" : (isDark ? "#94A3B8" : "#64748B"), flexShrink: 0 }}>
                            {checkedCount}/{total}
                          </span>
                        </div>
                      </div>

                      {/* Expanded checklist */}
                      {isExpanded && (
                        <div style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}`, padding: "12px 16px 16px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                            {routine.items.map((item) => {
                              const impactColor = item.impact === "high" ? "#EF4444" : item.impact === "medium" ? "#F59E0B" : "#10B981";
                              const impactLabel = item.impact === "high" ? "High" : item.impact === "medium" ? "Medium" : "Low";
                              return (
                                <div key={item.id}
                                  onClick={() => routine.id && routine.status !== "completed" && toggleRoutineItem(routine.id, item.id, !item.checked)}
                                  style={{
                                    display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 12px",
                                    borderRadius: 10, cursor: routine.status !== "completed" ? "pointer" : "default",
                                    background: item.checked
                                      ? (isDark ? "rgba(16,185,129,.08)" : "rgba(16,185,129,.06)")
                                      : (isDark ? "rgba(255,255,255,.03)" : "rgba(0,0,0,.02)"),
                                    border: `1px solid ${item.checked ? "rgba(16,185,129,.2)" : (isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)")}`,
                                    transition: "all .15s",
                                  }}>
                                  {/* Checkbox */}
                                  <div style={{
                                    width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1,
                                    border: `2px solid ${item.checked ? "#10B981" : (isDark ? "rgba(255,255,255,.2)" : "rgba(0,0,0,.2)")}`,
                                    background: item.checked ? "#10B981" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    transition: "all .15s",
                                  }}>
                                    {item.checked && (
                                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                  </div>

                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    {/* Badges row */}
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                                      <span style={{
                                        fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                                        background: `${impactColor}18`, color: impactColor,
                                      }}>
                                        {impactLabel} Impact
                                      </span>
                                      {item.estimatedMinutes > 0 && (
                                        <span style={{ fontSize: 10, color: isDark ? "#64748B" : "#94A3B8" }}>
                                          ⏱ {item.estimatedMinutes >= 60
                                            ? `${Math.floor(item.estimatedMinutes / 60)}h${item.estimatedMinutes % 60 > 0 ? ` ${item.estimatedMinutes % 60}m` : ""}`
                                            : `${item.estimatedMinutes}m`}
                                        </span>
                                      )}
                                      {item.category && (
                                        <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 99, background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)", color: isDark ? "#94A3B8" : "#64748B" }}>
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                    <p style={{
                                      fontSize: 13, fontWeight: 500,
                                      color: item.checked ? (isDark ? "#6EE7B7" : "#065F46") : (isDark ? "#E2E8F0" : "#1E293B"),
                                      textDecoration: item.checked ? "line-through" : "none",
                                      opacity: item.checked ? 0.7 : 1,
                                    }}>
                                      {item.title}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Report section */}
                          {(() => {
                            const activeReport = routineReport?.id === routine.id ? routineReport : null;
                            return routine.report ? (
                            <div style={{
                              padding: "12px 14px", borderRadius: 10,
                              background: isDark ? "rgba(16,185,129,.08)" : "rgba(16,185,129,.06)",
                              border: "1px solid rgba(16,185,129,.2)",
                            }}>
                              <p style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 4 }}>Submitted Report</p>
                              <p style={{ fontSize: 12, color: isDark ? "#6EE7B7" : "#065F46", lineHeight: 1.6 }}>{routine.report}</p>
                            </div>
                          ) : routine.status !== "completed" && (
                            activeReport ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                <textarea
                                  value={activeReport.text}
                                  onChange={(e) => setRoutineReport({ id: routine.id!, text: e.target.value })}
                                  placeholder="Summarize what you accomplished today…"
                                  rows={3}
                                  style={{
                                    width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 13,
                                    background: isDark ? "rgba(255,255,255,.06)" : "#F8FAFC",
                                    border: `1px solid ${isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"}`,
                                    color: isDark ? "#F1F5F9" : "#0F172A", outline: "none",
                                    fontFamily: "inherit", resize: "vertical", lineHeight: 1.6,
                                  }}
                                  onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#10B981"; }}
                                  onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"; }}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={() => setRoutineReport(null)}
                                    style={{
                                      flex: 1, padding: "8px", borderRadius: 8, fontSize: 12,
                                      background: "transparent", color: isDark ? "#64748B" : "#94A3B8",
                                      border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                                      cursor: "pointer",
                                    }}>
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => routine.id && submitRoutineReport(routine.id, activeReport.text)}
                                    disabled={reportSaving || !activeReport.text.trim()}
                                    style={{
                                      flex: 2, padding: "8px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                      background: reportSaving || !activeReport.text.trim() ? "rgba(16,185,129,.4)" : "#10B981",
                                      border: "none", color: "white",
                                      cursor: reportSaving || !activeReport.text.trim() ? "default" : "pointer",
                                    }}>
                                    {reportSaving ? "Submitting…" : "✓ Submit Report"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setRoutineReport({ id: routine.id!, text: "" })}
                                style={{
                                  width: "100%", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                                  background: pct >= 50
                                    ? "#10B981"
                                    : (isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)"),
                                  color: pct >= 50 ? "white" : (isDark ? "#64748B" : "#94A3B8"),
                                  border: pct >= 50
                                    ? "none"
                                    : `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                                  cursor: "pointer", transition: "all .15s",
                                }}>
                                {pct >= 50 ? "✓ Submit Report" : "Submit Report"}
                              </button>
                            )
                          );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Ideas Section ─────────────────────────────────────────────────── */}
          <div style={{ marginTop: 28 }}>

            {/* Submit form */}
            <div style={{
              padding: "20px 22px", borderRadius: 16,
              background: isDark ? "rgba(255,255,255,.025)" : "#FFFFFF",
              border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                  background: "rgba(245,158,11,.15)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                }}>💡</div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#E2E8F0" : "#1E293B", margin: 0 }}>
                    Share an Idea
                  </p>
                  <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", margin: 0, marginTop: 1 }}>
                    Got a suggestion? Share it with your team
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={ideaTitle}
                  onChange={(e) => setIdeaTitle(e.target.value)}
                  placeholder="Idea title…"
                  style={{
                    width: "100%", padding: "9px 13px", borderRadius: 10, fontSize: 13,
                    background: isDark ? "rgba(255,255,255,.06)" : "#F8FAFC",
                    border: `1px solid ${isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"}`,
                    color: isDark ? "#F1F5F9" : "#0F172A", outline: "none", fontFamily: "inherit",
                    transition: "border-color .2s",
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#F59E0B"; }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"; }}
                />
                <textarea
                  value={ideaDesc}
                  onChange={(e) => setIdeaDesc(e.target.value)}
                  placeholder="Describe your idea in detail…"
                  rows={3}
                  style={{
                    width: "100%", padding: "9px 13px", borderRadius: 10, fontSize: 13,
                    background: isDark ? "rgba(255,255,255,.06)" : "#F8FAFC",
                    border: `1px solid ${isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"}`,
                    color: isDark ? "#F1F5F9" : "#0F172A", outline: "none", fontFamily: "inherit",
                    resize: "vertical", lineHeight: 1.6, transition: "border-color .2s",
                  }}
                  onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#F59E0B"; }}
                  onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = isDark ? "rgba(255,255,255,.12)" : "rgba(0,0,0,.1)"; }}
                />
                <button
                  onClick={submitIdea}
                  disabled={ideaSaving || !ideaTitle.trim()}
                  style={{
                    alignSelf: "flex-end", padding: "9px 20px", borderRadius: 10,
                    fontSize: 13, fontWeight: 700,
                    background: ideaSaving || !ideaTitle.trim() ? "rgba(245,158,11,.4)" : "#F59E0B",
                    border: "none", color: "white",
                    cursor: ideaSaving || !ideaTitle.trim() ? "default" : "pointer",
                    transition: "opacity .15s", display: "flex", alignItems: "center", gap: 6,
                  }}>
                  {ideaSaving ? "Submitting…" : "💡 Submit Idea"}
                </button>
              </div>
            </div>

            {/* Previously submitted ideas */}
            {ideas.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: isDark ? "#64748B" : "#94A3B8", marginBottom: 10 }}>
                  Your Ideas ({ideas.length})
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {ideas.map((idea) => {
                    const statusCfg = {
                      new:         { label: "New",         color: "#6366F1", bg: "rgba(99,102,241,.12)"  },
                      reviewed:    { label: "Reviewed",    color: "#F59E0B", bg: "rgba(245,158,11,.12)"  },
                      implemented: { label: "Implemented", color: "#10B981", bg: "rgba(16,185,129,.12)"  },
                    }[idea.status];
                    return (
                      <div key={idea.id} className="mp-card" style={{
                        padding: "14px 16px", borderRadius: 12,
                        background: isDark ? "rgba(255,255,255,.03)" : "#FFFFFF",
                        border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#F1F5F9" : "#0F172A", margin: 0, flex: 1 }}>
                            {idea.title}
                          </p>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: "3px 9px",
                            borderRadius: 99, flexShrink: 0,
                            background: statusCfg.bg, color: statusCfg.color,
                            border: `1px solid ${statusCfg.color}30`,
                          }}>
                            {statusCfg.label}
                          </span>
                        </div>
                        {idea.description && (
                          <p style={{ fontSize: 12, color: isDark ? "#64748B" : "#94A3B8", marginTop: 6, lineHeight: 1.6 }}>
                            {idea.description}
                          </p>
                        )}
                        {idea.adminComment && (
                          <div style={{
                            marginTop: 10, padding: "9px 12px", borderRadius: 9,
                            background: isDark ? "rgba(99,102,241,.08)" : "rgba(99,102,241,.06)",
                            border: `1px solid rgba(99,102,241,.18)`,
                          }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366F1", marginBottom: 3 }}>Admin Comment</p>
                            <p style={{ fontSize: 12, color: isDark ? "#A5B4FC" : "#4338CA", lineHeight: 1.6, margin: 0 }}>
                              {idea.adminComment}
                            </p>
                          </div>
                        )}
                        <p style={{ fontSize: 10, color: isDark ? "#475569" : "#CBD5E1", marginTop: 8, marginBottom: 0 }}>
                          {idea.createdAt
                            ? new Date((idea.createdAt as { toMillis(): number }).toMillis()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Last refreshed */}
          <p style={{ fontSize: 11, color: isDark ? "#334155" : "#CBD5E1", textAlign: "center", marginTop: 24 }}>
            Last updated · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* ── Report Modal ─────────────────────────────────────────────────────── */}
        {reportTask && (
          <ReportModal
            task={reportTask} isDark={isDark}
            onClose={() => setReportTask(null)}
            onDone={() => { load(); setReportTask(null); showToast("Report submitted! Great work ✅"); }}
          />
        )}

        {/* ── Toast ────────────────────────────────────────────────────────────── */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 200, padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: isDark ? "#1E293B" : "#0F172A", color: "#F1F5F9",
            boxShadow: "0 8px 32px rgba(0,0,0,.4)",
            animation: "mp-fade .25s ease both", whiteSpace: "nowrap",
          }}>
            {toast}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
