// ─── src/pages/ClientPage.tsx ─────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchClientById, subscribeClientUpdates, updateClientUpdate,
  fetchUpdateFeedback, createUpdateFeedback,
  type FirestoreClient, type FirestoreClientUpdate, type FirestoreUpdateFeedback,
} from "../lib/firebase";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  FirestoreClientUpdate["status"],
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  "planning":    { label: "Planning",     color: "#818CF8", bg: "rgba(129,140,248,0.13)", border: "rgba(129,140,248,0.28)", emoji: "📋" },
  "in-progress": { label: "In Progress",  color: "#F59E0B", bg: "rgba(245,158,11,0.13)",  border: "rgba(245,158,11,0.32)",  emoji: "⚡" },
  "review":      { label: "Under Review", color: "#3B82F6", bg: "rgba(59,130,246,0.13)",  border: "rgba(59,130,246,0.28)",  emoji: "🔍" },
  "completed":   { label: "Completed",    color: "#10B981", bg: "rgba(16,185,129,0.13)",  border: "rgba(16,185,129,0.28)",  emoji: "✅" },
  "on-hold":     { label: "On Hold",      color: "#EF4444", bg: "rgba(239,68,68,0.13)",   border: "rgba(239,68,68,0.28)",   emoji: "⏸️" },
};

const SECTION_CONFIG = {
  seo: {
    label: "SEO & Search",
    subtitle: "Improving your visibility on Google and search engines",
    icon: "🔍", color: "#3B82F6",
    colorDim: "rgba(59,130,246,0.12)", colorBorder: "rgba(59,130,246,0.2)",
    grad: "linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 100%)",
  },
  "digital-marketing": {
    label: "Digital Marketing",
    subtitle: "Campaigns, ads, social media & brand growth",
    icon: "📣", color: "#8B5CF6",
    colorDim: "rgba(139,92,246,0.12)", colorBorder: "rgba(139,92,246,0.2)",
    grad: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 100%)",
  },
  general: {
    label: "Project Updates",
    subtitle: "Milestones and general progress updates",
    icon: "📋", color: "#6366F1",
    colorDim: "rgba(99,102,241,0.12)", colorBorder: "rgba(99,102,241,0.2)",
    grad: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 100%)",
  },
};

// ─── Theme helpers ────────────────────────────────────────────────────────────
function getStoredTheme(): boolean {
  try { return localStorage.getItem("cp-theme") !== "light"; }
  catch { return true; }
}
function saveTheme(dark: boolean) {
  try { localStorage.setItem("cp-theme", dark ? "dark" : "light"); } catch { /**/ }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PORTAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Dark ── */
  .cp-root[data-cp-theme="dark"] {
    --cp-bg:          #07090F;
    --cp-bg-nav:      rgba(7,9,15,.97);
    --cp-bg-glass:    rgba(11,15,28,.92);
    --cp-bg-card:     rgba(255,255,255,.026);
    --cp-bg-hover:    rgba(255,255,255,.042);
    --cp-bg-new:      rgba(99,102,241,.06);
    --cp-bg-input:    rgba(255,255,255,.06);
    --cp-bg-badge:    rgba(255,255,255,.06);
    --cp-bg-stat:     rgba(255,255,255,.034);
    --cp-bg-hero:     rgba(9,12,24,.55);
    --cp-text-h:      #F1F5F9;
    --cp-text-body:   #CBD5E1;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #475569;
    --cp-text-dimmer: #334155;
    --cp-border:      rgba(255,255,255,.068);
    --cp-border-md:   rgba(255,255,255,.052);
    --cp-scrollbar:   #1E293B;
    --cp-dots:        rgba(99,102,241,.06);
    --cp-glow:        rgba(99,102,241,.11);
    --cp-shadow-card: 0 2px 20px rgba(0,0,0,.38);
    --cp-shadow-lg:   0 24px 80px rgba(0,0,0,.52);
    --cp-approved-bg: rgba(16,185,129,.08);
    --cp-approved-border: rgba(16,185,129,.22);
  }

  /* ── Light ── */
  .cp-root[data-cp-theme="light"] {
    --cp-bg:          #F0F4FA;
    --cp-bg-nav:      rgba(240,244,250,.97);
    --cp-bg-glass:    rgba(255,255,255,.95);
    --cp-bg-card:     rgba(255,255,255,.85);
    --cp-bg-hover:    #fff;
    --cp-bg-new:      rgba(99,102,241,.052);
    --cp-bg-input:    rgba(0,0,0,.04);
    --cp-bg-badge:    rgba(0,0,0,.05);
    --cp-bg-stat:     rgba(255,255,255,.96);
    --cp-bg-hero:     rgba(255,255,255,.58);
    --cp-text-h:      #0F172A;
    --cp-text-body:   #1E293B;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #94A3B8;
    --cp-text-dimmer: #CBD5E1;
    --cp-border:      rgba(0,0,0,.08);
    --cp-border-md:   rgba(0,0,0,.058);
    --cp-scrollbar:   #CBD5E1;
    --cp-dots:        rgba(99,102,241,.05);
    --cp-glow:        rgba(99,102,241,.07);
    --cp-shadow-card: 0 2px 14px rgba(99,102,241,.07);
    --cp-shadow-lg:   0 24px 80px rgba(99,102,241,.11);
    --cp-approved-bg: rgba(16,185,129,.07);
    --cp-approved-border: rgba(16,185,129,.2);
  }

  .cp-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    background: var(--cp-bg);
    color: var(--cp-text-body);
    -webkit-font-smoothing: antialiased;
    transition: background .3s, color .3s;
  }

  .cp-root ::-webkit-scrollbar { width: 4px; }
  .cp-root ::-webkit-scrollbar-track { background: transparent; }
  .cp-root ::-webkit-scrollbar-thumb { background: var(--cp-scrollbar); border-radius: 99px; }

  @keyframes cp-fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes cp-slideUp  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-spin     { to { transform:rotate(360deg); } }
  @keyframes cp-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.86)} }
  @keyframes cp-glow-an  { 0%,100%{opacity:.45} 50%{opacity:1} }
  @keyframes cp-checkpop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes cp-slideRight { from{opacity:0;transform:translateX(28px) scale(.96)} to{opacity:1;transform:translateX(0) scale(1)} }

  .cp-fade-up  { animation: cp-fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
  .cp-fade-in  { animation: cp-fadeIn .35s ease both; }
  .cp-d1{animation-delay:.06s} .cp-d2{animation-delay:.12s}
  .cp-d3{animation-delay:.18s} .cp-d4{animation-delay:.24s}
  .cp-d5{animation-delay:.30s} .cp-d6{animation-delay:.36s}

  .cp-dots-bg {
    background-image: radial-gradient(circle, var(--cp-dots) 1px, transparent 1px);
    background-size: 28px 28px;
  }
  .cp-glass {
    background: var(--cp-bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--cp-border);
  }

  /* Nav */
  .cp-nav {
    position: sticky; top: 0; z-index: 50;
    border-bottom: 1px solid var(--cp-border-md);
    background: var(--cp-bg-nav);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transition: background .3s, border-color .3s;
  }

  /* Cards */
  .cp-card {
    background: var(--cp-bg-card);
    border: 1px solid var(--cp-border-md);
    border-radius: 16px;
    overflow: hidden;
    transition: background .2s, border-color .2s, transform .18s, box-shadow .18s;
    cursor: pointer;
  }
  .cp-card:hover { background: var(--cp-bg-hover); transform: translateY(-2px); box-shadow: var(--cp-shadow-card); }
  .cp-card.is-latest { border-color: rgba(99,102,241,.24); background: var(--cp-bg-new); }
  .cp-card.is-approved { border-color: var(--cp-approved-border); background: var(--cp-approved-bg); }

  /* Stat metric */
  .cp-metric {
    background: var(--cp-bg-stat); border: 1px solid var(--cp-border);
    border-radius: 14px; padding: 16px 18px;
    transition: background .3s, border-color .3s, transform .18s;
  }
  .cp-metric:hover { transform: translateY(-1px); }

  /* Input */
  .cp-input {
    transition: border-color .2s, box-shadow .2s;
    background: var(--cp-bg-input) !important;
    color: var(--cp-text-h) !important;
  }
  .cp-input::placeholder { color: var(--cp-text-dim) !important; }
  .cp-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.14); }

  /* Primary button */
  .cp-btn { transition: all .18s; }
  .cp-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
  .cp-btn:active:not(:disabled) { transform:translateY(0); }

  /* Mark Done button */
  .cp-done-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 18px; border-radius: 10px; border: 1.5px solid rgba(16,185,129,.35);
    background: rgba(16,185,129,.08); color: #10B981;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all .18s; font-family: inherit;
  }
  .cp-done-btn:hover { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.5); transform: translateY(-1px); }
  .cp-done-btn.done  { background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.3); color: #10B981; cursor: default; }

  /* Theme toggle */
  .cp-toggle {
    position: relative; width: 46px; height: 25px;
    border-radius: 99px; border: 1.5px solid var(--cp-border);
    background: var(--cp-bg-stat); cursor: pointer; overflow: hidden;
    flex-shrink: 0; transition: border-color .2s, box-shadow .2s, background .3s;
  }
  .cp-toggle:hover { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.14); }

  .cp-logo-link {
    display: flex; align-items: center;
    text-decoration: none; cursor: pointer;
    border-radius: 8px; padding: 2px 6px 2px 2px;
    transition: background .15s;
  }
  .cp-logo-link:hover { background: var(--cp-bg-badge); }

  /* Section banner */
  .cp-section-banner {
    border-radius: 14px; border: 1px solid var(--cp-border-md);
    padding: 18px 20px; margin-bottom: 14px;
    transition: background .3s, border-color .3s;
  }

  /* Modal backdrop */
  .cp-modal-backdrop {
    position: fixed; inset: 0; z-index: 900;
    background: rgba(0,0,0,.62); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: cp-fadeIn .2s ease both;
  }
  .cp-modal {
    position: relative; background: var(--cp-bg-glass);
    border: 1px solid var(--cp-border); border-radius: 22px;
    box-shadow: var(--cp-shadow-lg); width: 100%; max-width: 700px;
    max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
    animation: cp-fadeUp .3s cubic-bezier(.16,1,.3,1) both;
  }
  .cp-modal-header {
    display: flex; align-items: flex-start; gap: 12;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--cp-border-md); flex-shrink: 0;
  }
  .cp-modal-body { overflow-y: auto; padding: 20px; flex: 1; }
  .cp-modal-img  { width:100%; border-radius:12px; display:block; border:1px solid var(--cp-border-md); object-fit:contain; }

  /* Chat bubbles */
  .cp-chat-wrap { display:flex; flex-direction:column; gap:10; }
  .cp-bubble-row { display:flex; align-items:flex-end; gap:8; }
  .cp-bubble-row.from-team { flex-direction: row-reverse; }
  .cp-bubble {
    padding: 10px 14px; border-radius: 16px; font-size: 13.5px;
    line-height: 1.62; max-width: 80%;
    color: var(--cp-text-body);
  }
  .cp-bubble.from-client {
    background: var(--cp-bg-stat); border: 1px solid var(--cp-border);
    border-bottom-left-radius: 4px;
  }
  .cp-bubble.from-team {
    background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.22); color: var(--cp-text-h);
    border-bottom-right-radius: 4px;
  }
  .cp-bubble-avatar {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800;
  }
  .cp-bubble-meta { font-size: 10px; color: var(--cp-text-dim); margin-top: 3px; padding: 0 4px; }

  /* Notification popup */
  .cp-notif-popup {
    display: flex; align-items: flex-start; gap: 12;
    padding: 14px 16px; background: var(--cp-bg-glass);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(99,102,241,.28); border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,.35), 0 0 0 1px rgba(99,102,241,.09);
    max-width: 320px; width: 100%;
    animation: cp-slideRight .32s cubic-bezier(.16,1,.3,1) both;
  }
  .cp-notif-dismiss {
    background: transparent; border: none; cursor: pointer;
    width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--cp-text-dim); font-size: 16px; line-height: 1;
    transition: background .15s, color .15s;
  }
  .cp-notif-dismiss:hover { background: rgba(239,68,68,.1); color: #EF4444; }

  /* Footer */
  .cp-footer { border-top: 1px solid var(--cp-border-md); transition: border-color .3s; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .cp-hide-tab { display: none !important; }
  }
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 14px !important; height: 54px !important; }
    .cp-hero-inner  { padding: 20px 16px 18px !important; }
    .cp-content     { padding: 0 14px 80px !important; }
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .cp-hero-cols   { flex-direction: column !important; gap: 16px !important; }
    .cp-section-banner { padding: 14px 16px !important; }
    .cp-card-inner  { padding: 14px 16px 14px 18px !important; }
    .cp-notif-popup { max-width: calc(100vw - 28px); }
    .cp-modal-backdrop { padding: 0; align-items: flex-end; }
    .cp-modal {
      border-radius: 22px 22px 0 0 !important; max-height: 93vh !important;
      max-width: 100% !important; animation: cp-slideUp .32s cubic-bezier(.16,1,.3,1) both !important;
    }
    .cp-modal-header { padding: 16px 16px 14px !important; }
    .cp-modal-body  { padding: 16px !important; }
    .cp-bubble      { max-width: 90% !important; }
    .cp-done-btn    { width: 100%; }
    .cp-metric      { padding: 13px 14px !important; }
  }
  @media (max-width: 420px) {
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; }
  }

  /* ── Filter bar ── */
  .cp-filter-bar {
    display: flex; align-items: center; gap: 6px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 2px;
  }
  .cp-filter-bar::-webkit-scrollbar { display: none; }
  .cp-filter-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 99px;
    border: 1px solid var(--cp-border);
    background: transparent; color: var(--cp-text-muted);
    font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
    transition: all .15s; font-family: inherit; flex-shrink: 0;
  }
  .cp-filter-tab:hover { border-color: rgba(99,102,241,.3); color: var(--cp-text-body); }
  .cp-filter-tab.cp-tab-active {
    background: rgba(99,102,241,.12); border-color: rgba(99,102,241,.3); color: #818CF8;
  }

  /* View mode toggle */
  .cp-view-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 12px; border-radius: 8px;
    border: 1px solid var(--cp-border); background: transparent;
    color: var(--cp-text-muted); font-size: 12px; font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: all .15s; font-family: inherit;
  }
  .cp-view-btn:hover { border-color: rgba(99,102,241,.3); color: var(--cp-text-body); }
  .cp-view-btn.cp-tab-active {
    background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.28); color: #818CF8;
  }

  /* ── Alert banner ── */
  .cp-alert-banner {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 12px;
    background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.24);
    margin-bottom: 20px; animation: cp-fadeUp .4s cubic-bezier(.16,1,.3,1) both;
  }

  /* ── Timeline ── */
  .cp-timeline-wrap { display: flex; flex-direction: column; gap: 10px; }
  .cp-timeline-item {
    display: flex; gap: 14px; cursor: pointer;
    padding: 14px 16px; border-radius: 14px;
    border: 1px solid var(--cp-border-md);
    background: var(--cp-bg-card);
    transition: background .2s, transform .18s, box-shadow .18s;
  }
  .cp-timeline-item:hover {
    background: var(--cp-bg-hover); transform: translateX(3px);
    box-shadow: var(--cp-shadow-card);
  }

  /* ── Section collapse ── */
  .cp-section-hdr {
    cursor: pointer; user-select: none; transition: opacity .15s;
  }
  .cp-section-hdr:hover { opacity: .88; }
  .cp-chevron {
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 7px;
    border: 1px solid var(--cp-border); flex-shrink: 0;
    color: var(--cp-text-dim); transition: transform .22s cubic-bezier(.16,1,.3,1), background .15s;
  }
  .cp-chevron.open { transform: rotate(0deg); }
  .cp-chevron.closed { transform: rotate(-90deg); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function formatDate(ts: unknown): string {
  if (!ts) return "";
  try {
    const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
  } catch { return ""; }
}
function formatDateShort(ts: unknown): string {
  if (!ts) return "";
  try {
    const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch { return ""; }
}
function formatTime(ts: unknown): string {
  if (!ts) return "";
  try {
    const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
    return d.toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button className="cp-toggle" onClick={onToggle} aria-label={isDark ? "Switch to light" : "Switch to dark"}>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5px",pointerEvents:"none",fontSize:10 }}>
        <span style={{ opacity: isDark ? 0.3 : 1, transition:"opacity .3s" }}>☀</span>
        <span style={{ opacity: isDark ? 1 : 0.3, transition:"opacity .3s" }}>☽</span>
      </div>
      <div style={{ position:"absolute",top:3,left:3,width:15,height:15,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#818CF8)",transform:isDark?"translateX(21px)":"translateX(0)",transition:"transform 360ms cubic-bezier(.16,1,.3,1)",boxShadow:"0 1px 4px rgba(99,102,241,.4)" }}/>
    </button>
  );
}

// ─── ZynHive Logo ─────────────────────────────────────────────────────────────
function ZynLogo({ height = 34, isDark = true }: { height?: number; isDark?: boolean }) {
  return (
    <a href="/" className="cp-logo-link" aria-label="ZynHive">
      <img src="/logo.png" alt="ZynHive" style={{ height, width:"auto", objectFit:"contain", display:"block",
        ...(isDark ? {} : { filter:"brightness(0) invert(1)", background:"rgba(8,11,20,.8)", borderRadius:8, padding:"3px 8px" }) }}/>
    </a>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16 }}>
      <div style={{ position:"relative",width:44,height:44 }}>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)" }}/>
        <div style={{ position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite" }}/>
        <div style={{ position:"absolute",inset:6,borderRadius:"50%",background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <span style={{ fontSize:10,fontWeight:800,color:"#6366F1" }}>ZH</span>
        </div>
      </div>
      <span style={{ fontSize:13,color:"var(--cp-text-dim)",fontWeight:500 }}>Loading your portal…</span>
    </div>
  );
}

// ─── Status Dot ───────────────────────────────────────────────────────────────
function StatusDot({ status, color }: { status: FirestoreClientUpdate["status"]; color: string }) {
  return (
    <span style={{
      display:"inline-block",width:8,height:8,borderRadius:"50%",background:color,flexShrink:0,
      ...(status === "in-progress" ? { animation:"cp-pulse 1.8s ease infinite" } : {}),
    }}/>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
function ProgressRing({ pct, color = "#6366F1", size = 96 }: { pct: number; color?: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display:"block",transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--cp-border)" strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
        style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" }}/>
    </svg>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ clientId, onAuth, isDark, onToggleTheme }: {
  clientId: string; onAuth: (c: FirestoreClient) => void; isDark: boolean; onToggleTheme: () => void;
}) {
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [checking, setChecking] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchClientById(clientId).then((c) => { if (!c) setNotFound(true); }).catch(() => setNotFound(true)).finally(() => setChecking(false));
  }, [clientId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true); setError("");
    try {
      const client = await fetchClientById(clientId);
      if (!client) { setError("Portal not found."); return; }
      if (client.password !== password.trim()) { setError("Incorrect password. Please try again."); return; }
      sessionStorage.setItem(`client-auth-${clientId}`, "1");
      onAuth(client);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  if (checking) return <Loader />;
  if (notFound) {
    return (
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,padding:24,textAlign:"center" }}>
        <div style={{ width:56,height:56,borderRadius:16,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24 }}>🔍</div>
        <p style={{ fontSize:18,fontWeight:700,color:"var(--cp-text-h)" }}>Portal not found</p>
        <p style={{ fontSize:14,color:"var(--cp-text-muted)",maxWidth:280,lineHeight:1.6 }}>This link is invalid or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="cp-dots-bg" style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 16px",position:"relative" }}>
      <div style={{ position:"fixed",top:16,right:20,zIndex:100 }}><ThemeToggle isDark={isDark} onToggle={onToggleTheme}/></div>
      <div style={{ position:"fixed",top:"18%",left:"50%",transform:"translateX(-50%)",width:480,height:480,borderRadius:"50%",background:`radial-gradient(circle, var(--cp-glow) 0%, transparent 70%)`,pointerEvents:"none",animation:"cp-glow-an 4s ease infinite" }}/>

      <div className="cp-fade-up" style={{ width:"100%",maxWidth:400,position:"relative",zIndex:1 }}>
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ display:"flex",justifyContent:"center",marginBottom:20 }}><ZynLogo height={48} isDark={isDark}/></div>
          <h1 style={{ fontSize:24,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",marginBottom:8 }}>Welcome Back</h1>
          <p style={{ fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.65 }}>Sign in to view your project progress and updates.</p>
        </div>

        <div className="cp-glass" style={{ borderRadius:20,padding:"28px 28px 24px",boxShadow:"var(--cp-shadow-lg)" }}>
          <form onSubmit={handleLogin} style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              <label style={{ fontSize:11,fontWeight:700,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.07em" }}>Password</label>
              <div style={{ position:"relative" }}>
                <input
                  type={show ? "text" : "password"}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your portal password"
                  className="cp-input"
                  style={{ width:"100%",padding:"11px 42px 11px 14px",borderRadius:11,fontSize:14,fontFamily:"inherit",border:"1.5px solid var(--cp-border)" }}
                  autoFocus
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  style={{ position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",display:"flex",alignItems:"center",justifyContent:"center",padding:4 }}>
                  {show
                    ? <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M2 10c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6z" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/><path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M2 10c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6z" stroke="currentColor" strokeWidth="1.4"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/></svg>
                  }
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:9,background:"rgba(239,68,68,.09)",border:"1px solid rgba(239,68,68,.22)" }}>
                <span style={{ fontSize:14 }}>⚠️</span>
                <span style={{ fontSize:12,color:"#EF4444" }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || !password.trim()} className="cp-btn"
              style={{ padding:"12px 0",borderRadius:11,border:"none",background:loading||!password.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1,#818CF8)",color:loading||!password.trim()?"#4C5580":"white",fontSize:14,fontWeight:700,cursor:loading||!password.trim()?"default":"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {loading
                ? <><span style={{ width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.25)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block" }}/> Signing in…</>
                : "Sign in to Portal →"
              }
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center",fontSize:11,color:"var(--cp-text-dimmer)",marginTop:20 }}>🔒 Secure · Encrypted · Private</p>
      </div>
    </div>
  );
}

// ─── Portal Navbar ────────────────────────────────────────────────────────────
function PortalNav({ client, isDark, onToggleTheme, onLogout, onOpenEmailSettings }: {
  client: FirestoreClient; isDark: boolean; onToggleTheme: () => void;
  onLogout: () => void; onOpenEmailSettings: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner" style={{ maxWidth:960,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",gap:10 }}>
        <ZynLogo isDark={isDark}/>
        <div style={{ width:1,height:16,background:"var(--cp-border)" }} className="cp-hide-mobile"/>
        <span className="cp-hide-mobile" style={{ fontSize:11,color:"var(--cp-text-dim)",fontWeight:500 }}>Client Portal</span>

        <div style={{ flex:1 }}/>

        <ThemeToggle isDark={isDark} onToggle={onToggleTheme}/>

        {/* Email alerts button */}
        <button onClick={onOpenEmailSettings} title="Email notification settings" className="cp-hide-tab"
          style={{ display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:client.notificationEmail?"rgba(16,185,129,.08)":"transparent",color:client.notificationEmail?"#10B981":"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s",fontFamily:"inherit" }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          {client.notificationEmail ? "Alerts On" : "Email Alerts"}
        </button>

        {/* Desktop user + logout */}
        <div className="cp-hide-mobile" style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:12,fontWeight:600,color:"var(--cp-text-body)",lineHeight:1.3 }}>{client.name}</div>
            {client.company && <div style={{ fontSize:10,color:"var(--cp-text-dim)" }}>{client.company}</div>}
          </div>
          <div style={{ width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,rgba(99,102,241,.28),rgba(129,140,248,.12))",border:"1px solid rgba(99,102,241,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#818CF8",flexShrink:0 }}>
            {initials(client.name)}
          </div>
          <button onClick={onLogout}
            style={{ display:"flex",alignItems:"center",gap:4,padding:"5px 9px",borderRadius:7,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s",fontFamily:"inherit" }}
            onMouseEnter={(e)=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="rgba(239,68,68,.35)";el.style.color="#EF4444";el.style.background="rgba(239,68,68,.07)";}}
            onMouseLeave={(e)=>{const el=e.currentTarget as HTMLElement;el.style.borderColor="var(--cp-border)";el.style.color="var(--cp-text-dim)";el.style.background="transparent";}}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Sign out
          </button>
        </div>

        {/* Mobile menu button */}
        <div style={{ position:"relative" }} className="cp-show-mobile">
          <button onClick={() => setMenuOpen(v => !v)}
            style={{ display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:9,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",cursor:"pointer",color:"var(--cp-text-dim)" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4h10M2 7h10M2 10h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
          {menuOpen && (
            <div style={{ position:"absolute",right:0,top:"calc(100% + 8px)",zIndex:999,background:"var(--cp-bg-glass)",border:"1px solid var(--cp-border)",borderRadius:12,padding:8,minWidth:200,boxShadow:"var(--cp-shadow-lg)",backdropFilter:"blur(16px)" }} onClick={()=>setMenuOpen(false)}>
              <div style={{ padding:"8px 12px",borderBottom:"1px solid var(--cp-border)",marginBottom:4 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"var(--cp-text-h)" }}>{client.name}</div>
                {client.company && <div style={{ fontSize:11,color:"var(--cp-text-dim)" }}>{client.company}</div>}
              </div>
              <button onClick={onOpenEmailSettings}
                style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",borderRadius:8,border:"none",background:"transparent",color:"var(--cp-text-body)",cursor:"pointer",fontSize:13,textAlign:"left",fontFamily:"inherit" }}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                {client.notificationEmail ? "Email Alerts ✓" : "Setup Email Alerts"}
              </button>
              <button onClick={onLogout}
                style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",borderRadius:8,border:"none",background:"transparent",color:"#EF4444",cursor:"pointer",fontSize:13,textAlign:"left",fontFamily:"inherit" }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── Update Detail Modal ──────────────────────────────────────────────────────
function UpdateDetailModal({ u: initialU, client, onClose, onApprove }: {
  u: FirestoreClientUpdate;
  client: FirestoreClient;
  onClose: () => void;
  onApprove: (id: string) => void;
}) {
  const [u, setU]           = useState(initialU);
  const cfg                  = STATUS_CONFIG[u.status];
  const [feedback,  setFb]  = useState<FirestoreUpdateFeedback[]>([]);
  const [fbLoading, setFbL] = useState(true);
  const [fbText,    setFbT] = useState("");
  const [fbSending, setFbS] = useState(false);
  const [approving, setApp] = useState(false);
  const fbBottomRef          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!u.id) return;
    fetchUpdateFeedback(u.id).then(setFb).catch(()=>{}).finally(()=>setFbL(false));
  }, [u.id]);

  useEffect(() => { fbBottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [feedback]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  async function handleSendFeedback() {
    const msg = fbText.trim();
    if (!msg || !u.id) return;
    setFbS(true);
    try {
      await createUpdateFeedback({ updateId:u.id, clientId:client.id!, message:msg, fromClient:true, senderName:client.name });
      setFbT("");
      setFb(await fetchUpdateFeedback(u.id));
    } catch (err) { console.error("[Feedback]", err); }
    finally { setFbS(false); }
  }

  async function handleMarkDone() {
    if (!u.id || u.clientApproved || approving) return;
    setApp(true);
    try {
      await updateClientUpdate(u.id, { clientApproved: true });
      setU((prev) => ({ ...prev, clientApproved: true }));
      onApprove(u.id);
    } catch { /* ignore */ }
    finally { setApp(false); }
  }

  return (
    <div className="cp-modal-backdrop" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="cp-modal-header" style={{ gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0 }}>
            <div style={{ width:40,height:40,borderRadius:11,background:cfg.bg,border:`1px solid ${cfg.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
              {cfg.emoji}
            </div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ fontSize:16,fontWeight:800,color:"var(--cp-text-h)",lineHeight:1.3,marginBottom:4,wordBreak:"break-word" }}>{u.title}</h2>
              <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap" }}>
                <span style={{ fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
                {u.phase && <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>· {u.phase}</span>}
                {u.createdAt && <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>· {formatDate(u.createdAt)}</span>}
                {u.clientApproved && (
                  <span style={{ fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(16,185,129,.12)",color:"#10B981",border:"1px solid rgba(16,185,129,.25)",display:"flex",alignItems:"center",gap:4 }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Reviewed
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:9,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer",flexShrink:0 }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="cp-modal-body" style={{ display:"flex",flexDirection:"column",gap:20 }}>

          {/* Image */}
          {u.imageUrl && (
            <div>
              <img src={u.imageUrl} alt="update" className="cp-modal-img" style={{ maxHeight:260 }}/>
            </div>
          )}

          {/* Description */}
          {u.description && (
            <div style={{ padding:"14px 16px",borderRadius:12,background:"var(--cp-bg-stat)",border:"1px solid var(--cp-border)" }}>
              <p style={{ fontSize:14,color:"var(--cp-text-body)",lineHeight:1.75 }}>{u.description}</p>
            </div>
          )}

          {/* Progress */}
          <div style={{ padding:"16px",borderRadius:12,background:"var(--cp-bg-stat)",border:"1px solid var(--cp-border)" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
              <span style={{ fontSize:13,color:"var(--cp-text-muted)",fontWeight:600 }}>Task Progress</span>
              <span style={{ fontSize:22,fontWeight:800,color:cfg.color,fontFamily:"monospace",lineHeight:1 }}>{u.completionPercent}%</span>
            </div>
            <div style={{ height:10,borderRadius:99,background:"var(--cp-border)",overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${u.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:8 }}>
              <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>0%</span>
              <span style={{ fontSize:11,color:cfg.color,fontWeight:600 }}>{u.completionPercent}% complete</span>
              <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>100%</span>
            </div>
          </div>

          {/* Mark as Done */}
          {!u.clientApproved ? (
            <button onClick={handleMarkDone} disabled={approving} className="cp-done-btn" style={{ alignSelf:"flex-start" }}>
              {approving
                ? <><span style={{ width:14,height:14,borderRadius:"50%",border:"2px solid rgba(16,185,129,.3)",borderTopColor:"#10B981",animation:"cp-spin .8s linear infinite",display:"inline-block" }}/> Marking…</>
                : <><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Mark as Reviewed</>
              }
            </button>
          ) : (
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(16,185,129,.09)",border:"1px solid rgba(16,185,129,.22)",alignSelf:"flex-start" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ animation:"cp-checkpop .4s cubic-bezier(.16,1,.3,1)" }}><path d="M3 8l3.5 3.5L13 4" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span style={{ fontSize:13,fontWeight:600,color:"#10B981" }}>You reviewed this update</span>
            </div>
          )}

          {/* ── Feedback Thread ── */}
          <div style={{ borderTop:"1px solid var(--cp-border-md)",paddingTop:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:16 }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="var(--cp-text-muted)" strokeWidth="1.3" strokeLinejoin="round"/></svg>
              <span style={{ fontSize:14,fontWeight:700,color:"var(--cp-text-h)" }}>Conversation</span>
              {feedback.length > 0 && (
                <span style={{ fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,background:"rgba(99,102,241,.12)",color:"#818CF8",border:"1px solid rgba(99,102,241,.22)" }}>
                  {feedback.length}
                </span>
              )}
            </div>

            <div className="cp-chat-wrap" style={{ maxHeight:240,overflowY:"auto",paddingRight:2,marginBottom:14 }}>
              {fbLoading ? (
                <div style={{ fontSize:13,color:"var(--cp-text-dim)",padding:"8px 0",textAlign:"center" }}>Loading messages…</div>
              ) : feedback.length === 0 ? (
                <div style={{ textAlign:"center",padding:"20px 0" }}>
                  <div style={{ fontSize:24,marginBottom:8 }}>💬</div>
                  <p style={{ fontSize:13,color:"var(--cp-text-dim)",lineHeight:1.6 }}>No messages yet. Ask a question or share your thoughts!</p>
                </div>
              ) : (
                feedback.map((fb) => (
                  <div key={fb.id} className={`cp-bubble-row ${fb.fromClient ? "" : "from-team"}`}>
                    <div className="cp-bubble-avatar" style={{ background:fb.fromClient?"var(--cp-bg-stat)":"rgba(99,102,241,.15)",color:fb.fromClient?"var(--cp-text-dim)":"#818CF8",border:`1px solid ${fb.fromClient?"var(--cp-border)":"rgba(99,102,241,.22)"}` }}>
                      {fb.fromClient ? initials(fb.senderName || client.name) : "ZH"}
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:2,alignItems:fb.fromClient?"flex-start":"flex-end" }}>
                      <div className={`cp-bubble ${fb.fromClient ? "from-client" : "from-team"}`}>{fb.message}</div>
                      <div className="cp-bubble-meta">{fb.fromClient ? (fb.senderName || "You") : (fb.senderName || "ZynHive Team")} · {formatTime(fb.createdAt)}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={fbBottomRef}/>
            </div>

            {/* Input */}
            <div style={{ display:"flex",gap:8,alignItems:"flex-end" }}>
              <textarea
                value={fbText} onChange={(e) => setFbT(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendFeedback(); } }}
                placeholder="Ask a question or share your feedback…"
                rows={2} className="cp-input"
                style={{ flex:1,padding:"10px 14px",borderRadius:12,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)",resize:"none",lineHeight:1.5 }}
              />
              <button onClick={handleSendFeedback} disabled={fbSending || !fbText.trim()} className="cp-btn"
                style={{ padding:"11px 16px",borderRadius:12,border:"none",flexShrink:0,background:fbSending||!fbText.trim()?"rgba(99,102,241,.18)":"linear-gradient(135deg,#6366F1,#818CF8)",color:fbSending||!fbText.trim()?"#4C5580":"white",fontSize:13,fontWeight:600,cursor:fbSending||!fbText.trim()?"default":"pointer",fontFamily:"inherit" }}>
                {fbSending
                  ? <span style={{ width:15,height:15,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block" }}/>
                  : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 2 2 5L14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            <p style={{ fontSize:10,color:"var(--cp-text-dimmer)",marginTop:6 }}>Press Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Update Card ──────────────────────────────────────────────────────────────
function UpdateCard({ u, isLatest, onClick, onApprove }: {
  u: FirestoreClientUpdate; isLatest: boolean; onClick: () => void; onApprove: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[u.status];
  const [approving, setApp] = useState(false);

  async function handleMarkDone(e: React.MouseEvent) {
    e.stopPropagation();
    if (!u.id || u.clientApproved || approving) return;
    setApp(true);
    try {
      await updateClientUpdate(u.id, { clientApproved: true });
      onApprove(u.id);
    } catch { /* ignore */ }
    finally { setApp(false); }
  }

  return (
    <div
      className={`cp-card${isLatest && !u.clientApproved ? " is-latest" : ""}${u.clientApproved ? " is-approved" : ""}`}
      style={{ position:"relative" }}
      onClick={onClick}
    >
      {/* Left accent */}
      <div style={{ position:"absolute",top:0,left:0,width:4,height:"100%",background:u.clientApproved?"#10B981":cfg.color,borderRadius:"16px 0 0 16px",opacity: u.clientApproved ? 0.7 : 1 }}/>

      <div className="cp-card-inner" style={{ padding:"16px 18px 16px 22px" }}>
        {/* Header row */}
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10 }}>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6 }}>
              {u.clientApproved
                ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}><circle cx="8" cy="8" r="7" fill="rgba(16,185,129,.15)" stroke="#10B981" strokeWidth="1.2"/><path d="M5 8l2.5 2.5L11 5.5" stroke="#10B981" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <StatusDot status={u.status} color={cfg.color}/>
              }
              <span style={{ fontSize:15,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3 }}>{u.title}</span>
              {isLatest && !u.clientApproved && (
                <span style={{ fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,.15)",color:"#818CF8",border:"1px solid rgba(99,102,241,.25)",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0 }}>New</span>
              )}
              {u.clientApproved && (
                <span style={{ fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(16,185,129,.12)",color:"#10B981",border:"1px solid rgba(16,185,129,.22)",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0 }}>Reviewed</span>
              )}
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
              <span style={{ fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}` }}>
                {cfg.emoji} {cfg.label}
              </span>
              {u.phase && <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>· {u.phase}</span>}
            </div>
          </div>
          {u.createdAt && (
            <span style={{ fontSize:11,color:"var(--cp-text-dim)",flexShrink:0,marginTop:2 }}>{formatDateShort(u.createdAt)}</span>
          )}
        </div>

        {/* Description */}
        {u.description && (
          <p style={{ fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.7,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const,overflow:"hidden" }}>
            {u.description}
          </p>
        )}

        {/* Image thumbnail */}
        {u.imageUrl && (
          <div style={{ marginBottom:12 }}>
            <img src={u.imageUrl} alt="attachment" style={{ width:"100%",borderRadius:9,display:"block",border:"1px solid var(--cp-border-md)",maxHeight:180,objectFit:"cover" }}/>
          </div>
        )}

        {/* Progress */}
        <div style={{ marginBottom:14 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
            <span style={{ fontSize:11,color:"var(--cp-text-dim)",fontWeight:500 }}>Progress</span>
            <span style={{ fontSize:12,fontWeight:800,color:u.clientApproved?"#10B981":cfg.color,fontFamily:"monospace" }}>{u.completionPercent}%</span>
          </div>
          <div style={{ height:6,borderRadius:99,background:"var(--cp-border)",overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${u.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${u.clientApproved?"#10B981":cfg.color}, ${u.clientApproved?"#10B981":cfg.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)" }}/>
          </div>
        </div>

        {/* Footer row */}
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:10 }}>
          <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>Click to view details & give feedback</span>
          {!u.clientApproved ? (
            <button onClick={handleMarkDone} disabled={approving} className="cp-done-btn"
              style={{ padding:"7px 13px",fontSize:12,flexShrink:0,alignSelf:"flex-end" }}>
              {approving
                ? <span style={{ width:12,height:12,borderRadius:"50%",border:"2px solid rgba(16,185,129,.3)",borderTopColor:"#10B981",animation:"cp-spin .8s linear infinite",display:"inline-block" }}/>
                : <><svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg> Mark Reviewed</>
              }
            </button>
          ) : (
            <span style={{ fontSize:11,color:"#10B981",fontWeight:600,display:"flex",alignItems:"center",gap:4,flexShrink:0 }}>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────
function SectionBlock({ sectionKey, items, latestId, onCardClick, onApprove, collapsed, onToggle }: {
  sectionKey: "seo" | "digital-marketing" | "general";
  items: FirestoreClientUpdate[];
  latestId: string | undefined;
  onCardClick: (u: FirestoreClientUpdate) => void;
  onApprove: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const cfg          = SECTION_CONFIG[sectionKey];
  const completedCnt = items.filter((u) => u.status === "completed").length;
  const reviewedCnt  = items.filter((u) => u.clientApproved).length;
  const pct          = items.length > 0 ? Math.round((completedCnt / items.length) * 100) : 0;

  return (
    <div>
      <div className="cp-section-banner cp-section-hdr" style={{ background: cfg.grad }} onClick={onToggle}>
        <div style={{ display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:42,height:42,borderRadius:11,background:cfg.colorDim,border:`1px solid ${cfg.colorBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
            {cfg.icon}
          </div>
          <div style={{ flex:1,minWidth:0 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap" }}>
              <h2 style={{ fontSize:15,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.2px" }}>{cfg.label}</h2>
              <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:cfg.colorDim,color:cfg.color,border:`1px solid ${cfg.colorBorder}` }}>
                {items.length} {items.length === 1 ? "task" : "tasks"}
              </span>
              {reviewedCnt > 0 && (
                <span style={{ fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.2)" }}>
                  {reviewedCnt} reviewed
                </span>
              )}
            </div>
            <p style={{ fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.5 }}>{cfg.subtitle}</p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
            <div style={{ textAlign:"center" }} className="cp-hide-mobile">
              <div style={{ fontSize:18,fontWeight:800,color:cfg.color,fontFamily:"monospace",lineHeight:1 }}>{pct}%</div>
              <div style={{ fontSize:10,color:"var(--cp-text-dim)",marginTop:2 }}>done</div>
            </div>
            <div className={`cp-chevron ${collapsed ? "closed" : "open"}`}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {!collapsed && (
          <div style={{ marginTop:14 }}>
            <div style={{ height:4,borderRadius:99,background:"var(--cp-border)",overflow:"hidden" }}>
              <div style={{ height:"100%",width:`${pct}%`,borderRadius:99,background:`linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`,transition:"width 1s cubic-bezier(.16,1,.3,1)" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"space-between",marginTop:5 }}>
              <span style={{ fontSize:10,color:"var(--cp-text-dim)" }}>{completedCnt} of {items.length} completed</span>
              <span style={{ fontSize:10,color:cfg.color,fontWeight:600 }}>{items.length - completedCnt} remaining</span>
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          {items.map((u) => (
            <UpdateCard key={u.id} u={u} isLatest={u.id === latestId} onClick={() => onCardClick(u)} onApprove={onApprove}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notification Toast ───────────────────────────────────────────────────────
type ClientNotif = { id: string; title: string; message: string };

function ClientNotifToast({ notif, onDismiss }: { notif: ClientNotif; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 6000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className="cp-notif-popup">
      <div style={{ width:36,height:36,borderRadius:10,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🔔</div>
      <div style={{ flex:1,minWidth:0 }}>
        <div style={{ fontSize:10,fontWeight:700,color:"#818CF8",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3 }}>New Update</div>
        <div style={{ fontSize:13,fontWeight:700,color:"var(--cp-text-h)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{notif.title}</div>
        {notif.message && <div style={{ fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as const }}>{notif.message}</div>}
      </div>
      <button className="cp-notif-dismiss" onClick={onDismiss}>×</button>
    </div>
  );
}

// ─── Updates View ─────────────────────────────────────────────────────────────
function UpdatesView({ client: initialClient, isDark, onToggleTheme, onLogout }: {
  client: FirestoreClient; isDark: boolean; onToggleTheme: () => void; onLogout: () => void;
}) {
  const [client,            setClient]    = useState(initialClient);
  const [updates,           setUpdates]   = useState<FirestoreClientUpdate[]>([]);
  const [loading,           setLoading]   = useState(true);
  const [selectedUpdate,    setSelected]  = useState<FirestoreClientUpdate | null>(null);
  const [emailModal,        setEmailM]    = useState(false);
  const [notifEmail,        setNEmail]    = useState(initialClient.notificationEmail ?? "");
  const [emailSaving,       setEmailS]    = useState(false);
  const [notifications,     setNotifs]    = useState<ClientNotif[]>([]);
  const [activeFilter,      setFilter]    = useState<"all"|"needs-review"|"in-progress"|"completed">("all");
  const [viewMode,          setViewMode]  = useState<"sections"|"timeline">("sections");
  const [alertDismissed,    setAlertDism] = useState(false);
  const [collapsedSections, setCollapsed] = useState<Set<string>>(new Set());

  const dismissNotif = useCallback((id: string) => setNotifs((p) => p.filter((n) => n.id !== id)), []);

  function toggleSection(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  // Optimistically mark approved in local state
  const handleApprove = useCallback((updateId: string) => {
    setUpdates((prev) => prev.map((u) => u.id === updateId ? { ...u, clientApproved: true } : u));
    if (selectedUpdate?.id === updateId) setSelected((prev) => prev ? { ...prev, clientApproved: true } : prev);
  }, [selectedUpdate?.id]);

  useEffect(() => {
    const unsub = subscribeClientUpdates(
      client.id!,
      (data) => { setUpdates(data); setLoading(false); },
      (newUpdate) => {
        const id = newUpdate.id ?? Date.now().toString();
        setNotifs((p) => [...p, { id, title: newUpdate.title, message: newUpdate.description }]);
      }
    );
    return unsub;
  }, [client.id]);

  async function handleSaveEmailSettings() {
    if (!client.id) return;
    setEmailS(true);
    try {
      const { updateClient } = await import("../lib/firebase");
      await updateClient(client.id, { notificationEmail: notifEmail.trim() });
      setClient((c) => ({ ...c, notificationEmail: notifEmail.trim() }));
      setEmailM(false);
    } catch { /**/ }
    finally { setEmailS(false); }
  }

  const latest        = updates[0];
  const completed     = updates.filter((u) => u.status === "completed").length;
  const active        = updates.filter((u) => u.status === "in-progress").length;
  const reviewed      = updates.filter((u) => u.clientApproved).length;
  const overallPct    = latest?.completionPercent ?? 0;
  const unreviewedCnt = updates.filter((u) => !u.clientApproved).length;

  // Apply active filter
  const filteredUpdates = updates.filter((u) => {
    if (activeFilter === "needs-review")  return !u.clientApproved;
    if (activeFilter === "in-progress")   return u.status === "in-progress";
    if (activeFilter === "completed")     return u.status === "completed";
    return true;
  });

  const seoItems = filteredUpdates.filter((u) => u.category === "seo");
  const dmItems  = filteredUpdates.filter((u) => u.category === "digital-marketing");
  const genItems = filteredUpdates.filter((u) => !u.category || u.category === "general");
  const sections = ([
    { key: "seo"               as const, items: seoItems },
    { key: "digital-marketing" as const, items: dmItems  },
    { key: "general"           as const, items: genItems },
  ] as const).filter((s) => s.items.length > 0);

  const latestCfg = latest ? STATUS_CONFIG[latest.status] : null;

  const FILTERS: { key: typeof activeFilter; label: string; icon: string }[] = [
    { key: "all",          label: "All Updates",   icon: "📋" },
    { key: "needs-review", label: "Needs Review",  icon: "👀" },
    { key: "in-progress",  label: "In Progress",   icon: "⚡" },
    { key: "completed",    label: "Completed",      icon: "✅" },
  ];

  return (
    <div className="cp-fade-in" style={{ minHeight:"100vh" }}>
      {/* Modals */}
      {selectedUpdate && (
        <UpdateDetailModal u={selectedUpdate} client={client} onClose={() => setSelected(null)} onApprove={handleApprove}/>
      )}

      {/* Notification popups */}
      {notifications.length > 0 && (
        <div style={{ position:"fixed",bottom:24,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end" }}>
          {notifications.map((n) => <ClientNotifToast key={n.id} notif={n} onDismiss={() => dismissNotif(n.id)}/>)}
        </div>
      )}

      {/* Email alert modal */}
      {emailModal && (
        <div className="cp-modal-backdrop" onClick={() => setEmailM(false)}>
          <div className="cp-modal" style={{ maxWidth:420 }} onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header" style={{ gap:10 }}>
              <span style={{ fontSize:22 }}>📧</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15,fontWeight:800,color:"var(--cp-text-h)" }}>Email Notifications</div>
                <div style={{ fontSize:11,color:"var(--cp-text-dim)",marginTop:2 }}>Get emailed when your project has a new update</div>
              </div>
              <button onClick={() => setEmailM(false)} style={{ display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer" }}>
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="cp-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
              <p style={{ fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.7,margin:0 }}>
                Enter your email and we'll send you a notification whenever a new update is posted to your project.
              </p>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                <label style={{ fontSize:11,fontWeight:700,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.07em" }}>Your Email</label>
                <input type="email" value={notifEmail} onChange={(e) => setNEmail(e.target.value)}
                  placeholder="you@example.com" className="cp-input"
                  style={{ width:"100%",padding:"11px 14px",borderRadius:10,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)" }}/>
              </div>
              <div style={{ display:"flex",gap:10,marginTop:4 }}>
                <button onClick={() => setEmailM(false)} style={{ flex:1,padding:"11px 0",borderRadius:10,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-muted)",cursor:"pointer",fontSize:13,fontFamily:"inherit" }}>Cancel</button>
                <button onClick={handleSaveEmailSettings} disabled={emailSaving} className="cp-btn"
                  style={{ flex:1,padding:"11px 0",borderRadius:10,border:"none",background:emailSaving?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1,#818CF8)",color:emailSaving?"#4C5580":"white",cursor:emailSaving?"default":"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit" }}>
                  {emailSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PortalNav client={client} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} onOpenEmailSettings={() => setEmailM(true)}/>

      {/* ── Hero ── */}
      <div style={{ background:"var(--cp-bg-hero)",borderBottom:"1px solid var(--cp-border-md)",transition:"background .3s,border-color .3s" }}>
        <div className="cp-hero-inner" style={{ maxWidth:960,margin:"0 auto",padding:"28px 24px 24px" }}>
          <div className="cp-hero-cols cp-fade-up" style={{ display:"flex",alignItems:"center",gap:24 }}>

            <div style={{ flex:1,minWidth:0 }}>
              <p style={{ fontSize:13,color:"var(--cp-text-dim)",fontWeight:500,marginBottom:5 }}>
                {greeting()}, {client.name.split(" ")[0]}! 👋
              </p>
              <h1 style={{ fontSize:22,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.4px",lineHeight:1.25,marginBottom:8 }}>
                {client.projectName || "Your Project Dashboard"}
              </h1>
              <div style={{ display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:14 }}>
                {client.company && (
                  <span style={{ fontSize:12,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4 }}>
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V4a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2"/></svg>
                    {client.company}
                  </span>
                )}
                {latest?.createdAt && (
                  <span style={{ fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4 }}>
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                    Last updated {formatDate(latest.createdAt)}
                  </span>
                )}
              </div>
              {latest && latestCfg && (
                <div style={{ display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:12 }}>
                  <StatusDot status={latest.status} color={latestCfg.color}/>
                  <span style={{ color:"var(--cp-text-muted)" }}>Latest: </span>
                  <span style={{ color:"var(--cp-text-h)",fontWeight:600 }}>{latest.title}</span>
                  <span style={{ padding:"1px 7px",borderRadius:99,background:latestCfg.bg,color:latestCfg.color,border:`1px solid ${latestCfg.border}`,fontSize:10,fontWeight:700 }}>{latestCfg.label}</span>
                </div>
              )}
            </div>

            {updates.length > 0 && (
              <div className="cp-ring-col" style={{ flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                <div style={{ position:"relative",width:96,height:96 }}>
                  <ProgressRing pct={overallPct} size={96} color="#6366F1"/>
                  <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                    <span style={{ fontSize:18,fontWeight:800,color:"#818CF8",fontFamily:"monospace",lineHeight:1 }}>{overallPct}%</span>
                  </div>
                </div>
                <span style={{ fontSize:10,color:"var(--cp-text-dim)",fontWeight:500,textAlign:"center",lineHeight:1.4 }}>Overall<br/>Progress</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics ── */}
      {updates.length > 0 && (
        <div style={{ borderBottom:"1px solid var(--cp-border-md)",transition:"border-color .3s" }}>
          <div style={{ maxWidth:960,margin:"0 auto",padding:"18px 20px" }}>
            <div className="cp-metrics-grid cp-fade-up cp-d1" style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
              {[
                { label:"Total",       value:updates.length, color:"#6366F1", icon:"📋", sub:"updates" },
                { label:"Completed",   value:completed,       color:"#10B981", icon:"✅", sub:"tasks done" },
                { label:"In Progress", value:active,          color:"#F59E0B", icon:"⚡", sub:"active" },
                { label:"You Reviewed",value:reviewed,        color:"#3B82F6", icon:"👍", sub:"approved" },
              ].map(({ label, value, color, icon, sub }) => (
                <div key={label} className="cp-metric">
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                    <span style={{ fontSize:18 }}>{icon}</span>
                    <span style={{ fontSize:22,fontWeight:800,color,fontFamily:"monospace",lineHeight:1 }}>{value}</span>
                  </div>
                  <div style={{ fontSize:12,fontWeight:600,color:"var(--cp-text-body)" }}>{label}</div>
                  <div style={{ fontSize:10,color:"var(--cp-text-dim)",marginTop:2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="cp-content" style={{ maxWidth:960,margin:"0 auto",padding:"24px 20px 80px" }}>
        {loading ? (
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",paddingTop:72,gap:14 }}>
            <div style={{ width:34,height:34,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite" }}/>
            <span style={{ fontSize:13,color:"var(--cp-text-dim)",fontWeight:500 }}>Loading your updates…</span>
          </div>
        ) : updates.length === 0 ? (
          <div className="cp-fade-up" style={{ textAlign:"center",paddingTop:80 }}>
            <div style={{ width:76,height:76,borderRadius:20,background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px" }}>🚀</div>
            <p style={{ fontSize:18,fontWeight:700,color:"var(--cp-text-h)",marginBottom:10 }}>Your project has kicked off!</p>
            <p style={{ fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.7,maxWidth:300,margin:"0 auto" }}>
              Updates will appear here as the team completes work on your project.
            </p>
          </div>
        ) : (
          <>
            {/* ── Unreviewed alert banner ── */}
            {unreviewedCnt > 0 && !alertDismissed && (
              <div className="cp-alert-banner">
                <span style={{ fontSize:20,flexShrink:0 }}>👀</span>
                <div style={{ flex:1,minWidth:0 }}>
                  <span style={{ fontSize:13,fontWeight:700,color:"#D97706" }}>
                    {unreviewedCnt} {unreviewedCnt === 1 ? "update needs" : "updates need"} your review
                  </span>
                  <p style={{ fontSize:12,color:"var(--cp-text-muted)",marginTop:2,lineHeight:1.5 }}>
                    Open each update, read through it, and click "Mark as Reviewed" to let the team know you've seen it.
                  </p>
                </div>
                <button onClick={() => setAlertDism(true)}
                  style={{ background:"transparent",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",fontSize:18,lineHeight:1,flexShrink:0,padding:4,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center" }}>
                  ×
                </button>
              </div>
            )}

            {/* ── Filter bar + view toggle ── */}
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:24,flexWrap:"wrap" }}>
              <div className="cp-filter-bar" style={{ flex:1 }}>
                {FILTERS.map((f) => (
                  <button key={f.key} className={`cp-filter-tab${activeFilter === f.key ? " cp-tab-active" : ""}`}
                    onClick={() => setFilter(f.key)}>
                    <span>{f.icon}</span>
                    {f.label}
                    {f.key !== "all" && (
                      <span style={{ padding:"0 5px",borderRadius:99,background:"rgba(99,102,241,.1)",fontSize:10,fontWeight:700,color:activeFilter===f.key?"#818CF8":"var(--cp-text-dim)" }}>
                        {f.key === "needs-review" ? updates.filter(u => !u.clientApproved).length
                          : f.key === "in-progress" ? updates.filter(u => u.status==="in-progress").length
                          : updates.filter(u => u.status==="completed").length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                <button className={`cp-view-btn${viewMode==="sections"?" cp-tab-active":""}`} onClick={() => setViewMode("sections")}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="3" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="1" y="5.5" width="10" height="3" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
                  Sections
                </button>
                <button className={`cp-view-btn${viewMode==="timeline"?" cp-tab-active":""}`} onClick={() => setViewMode("timeline")}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="2" cy="2.5" r="1" fill="currentColor"/><line x1="4" y1="2.5" x2="11" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="2" cy="6" r="1" fill="currentColor"/><line x1="4" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="2" cy="9.5" r="1" fill="currentColor"/><line x1="4" y1="9.5" x2="11" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Timeline
                </button>
              </div>
            </div>

            {/* No results from filter */}
            {filteredUpdates.length === 0 && (
              <div className="cp-fade-up" style={{ textAlign:"center",paddingTop:48 }}>
                <div style={{ fontSize:36,marginBottom:12 }}>🔍</div>
                <p style={{ fontSize:16,fontWeight:700,color:"var(--cp-text-h)",marginBottom:8 }}>No updates match this filter</p>
                <button onClick={() => setFilter("all")}
                  style={{ padding:"8px 18px",borderRadius:99,border:"1px solid rgba(99,102,241,.3)",background:"rgba(99,102,241,.08)",color:"#818CF8",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit" }}>
                  View all updates
                </button>
              </div>
            )}

            {/* ── Timeline view ── */}
            {viewMode === "timeline" && filteredUpdates.length > 0 && (
              <div className="cp-timeline-wrap cp-fade-in">
                {filteredUpdates.map((u) => {
                  const cfg = STATUS_CONFIG[u.status];
                  return (
                    <div key={u.id} className="cp-timeline-item" onClick={() => setSelected(u)}>
                      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,paddingTop:2,flexShrink:0 }}>
                        <div style={{ width:10,height:10,borderRadius:"50%",background:u.clientApproved?"#10B981":cfg.color,
                          ...(u.status==="in-progress"?{animation:"cp-pulse 1.8s ease infinite"}:{}) }}/>
                        <div style={{ flex:1,width:1,background:"var(--cp-border)",minHeight:24 }}/>
                      </div>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:6 }}>
                          <div style={{ flex:1,minWidth:0 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4 }}>
                              <span style={{ fontSize:14,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3 }}>{u.title}</span>
                              {u.clientApproved && (
                                <span style={{ fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:99,background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.2)",flexShrink:0 }}>Reviewed</span>
                              )}
                            </div>
                            <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                              <span style={{ fontSize:11,fontWeight:600,padding:"1px 8px",borderRadius:99,background:cfg.bg,color:cfg.color,border:`1px solid ${cfg.border}` }}>
                                {cfg.emoji} {cfg.label}
                              </span>
                              {u.phase && <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>· {u.phase}</span>}
                              {(() => {
                                const scfg = u.category && u.category !== "general" ? SECTION_CONFIG[u.category as keyof typeof SECTION_CONFIG] : SECTION_CONFIG.general;
                                return <span style={{ fontSize:11,color:"var(--cp-text-dim)" }}>· {scfg.icon} {scfg.label}</span>;
                              })()}
                            </div>
                          </div>
                          <div style={{ textAlign:"right",flexShrink:0 }}>
                            <div style={{ fontSize:13,fontWeight:800,color:u.clientApproved?"#10B981":cfg.color,fontFamily:"monospace" }}>{u.completionPercent}%</div>
                            {u.createdAt && <div style={{ fontSize:10,color:"var(--cp-text-dim)",marginTop:2 }}>{formatDateShort(u.createdAt)}</div>}
                          </div>
                        </div>
                        {u.description && (
                          <p style={{ fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.65,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical" as const }}>
                            {u.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Section view ── */}
            {viewMode === "sections" && filteredUpdates.length > 0 && (
              <div style={{ display:"flex",flexDirection:"column",gap:36 }}>
                {sections.map(({ key, items }, i) => (
                  <div key={key} className={`cp-fade-up cp-d${Math.min(i+2,6)}`}>
                    <SectionBlock
                      sectionKey={key} items={items} latestId={latest?.id}
                      onCardClick={setSelected} onApprove={handleApprove}
                      collapsed={collapsedSections.has(key)} onToggle={() => toggleSection(key)}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="cp-footer" style={{ padding:"20px 24px" }}>
        <div style={{ maxWidth:960,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ width:20,height:20,borderRadius:6,background:"linear-gradient(135deg,#6366F1,#818CF8)",display:"flex",alignItems:"center",justifyContent:"center" }}>
              <span style={{ fontSize:7,fontWeight:800,color:"white" }}>ZH</span>
            </div>
            <span style={{ fontSize:12,color:"var(--cp-text-dim)" }}>Powered by <strong style={{ color:"var(--cp-text-muted)" }}>ZynHive</strong></span>
          </div>
          <span style={{ fontSize:11,color:"var(--cp-text-dimmer)" }}>🔒 Secure Client Portal</span>
        </div>
      </footer>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CLIENT PAGE
// ═════════════════════════════════════════════════════════════════════════════

export function ClientPage() {
  const clientId = window.location.pathname.split("/")[2] ?? "";

  const [authedClient, setAuthedClient] = useState<FirestoreClient | null>(null);
  const [checking,     setChecking]     = useState(true);
  const [isDark,       setIsDark]       = useState(getStoredTheme);

  function toggleTheme() { setIsDark((d) => { saveTheme(!d); return !d; }); }

  useEffect(() => {
    const stored = sessionStorage.getItem(`client-auth-${clientId}`);
    if (stored === "1" && clientId) {
      fetchClientById(clientId).then((c) => { if (c) setAuthedClient(c); }).catch(() => {}).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [clientId]);

  function handleLogout() {
    sessionStorage.removeItem(`client-auth-${clientId}`);
    setAuthedClient(null);
  }

  // Mobile: inject show-mobile helper
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = ".cp-show-mobile { display: none; } @media (max-width: 640px) { .cp-show-mobile { display: flex !important; } }";
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (!clientId) {
    return (
      <>
        <style>{PORTAL_CSS}</style>
        <div className="cp-root" data-cp-theme={isDark ? "dark" : "light"} style={{ display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh" }}>
          <p style={{ color:"var(--cp-text-muted)",fontSize:14 }}>Invalid portal link.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{PORTAL_CSS}</style>
      <div className="cp-root" data-cp-theme={isDark ? "dark" : "light"}>
        {checking ? (
          <Loader/>
        ) : authedClient ? (
          <UpdatesView client={authedClient} isDark={isDark} onToggleTheme={toggleTheme} onLogout={handleLogout}/>
        ) : (
          <LoginScreen clientId={clientId} onAuth={setAuthedClient} isDark={isDark} onToggleTheme={toggleTheme}/>
        )}
      </div>
    </>
  );
}
