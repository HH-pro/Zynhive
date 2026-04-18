// ─── src/pages/ClientPage.tsx ─────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  fetchClientById, fetchClientUpdates,
  fetchUpdateFeedback, createUpdateFeedback,
  type FirestoreClient, type FirestoreClientUpdate, type FirestoreUpdateFeedback,
} from "../lib/firebase";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  FirestoreClientUpdate["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  "planning":    { label: "Planning",    color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.28)" },
  "in-progress": { label: "In Progress", color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.32)"  },
  "review":      { label: "In Review",   color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.28)"  },
  "completed":   { label: "Completed",   color: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.28)"  },
  "on-hold":     { label: "On Hold",     color: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.28)"   },
};

// ─── Section config ───────────────────────────────────────────────────────────
const SECTION_CONFIG = {
  seo: {
    label: "SEO",
    subtitle: "Search engine optimization",
    badge: "Search & Visibility",
    icon: "🔍",
    color: "#2563EB",
    colorLight: "#3B82F6",
    colorDim: "rgba(59,130,246,0.1)",
    colorBorder: "rgba(59,130,246,0.2)",
    gradHead: "linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)",
    gradBody: "linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)",
  },
  "digital-marketing": {
    label: "Digital Marketing",
    subtitle: "Campaigns & brand growth",
    badge: "Marketing & Social",
    icon: "📣",
    color: "#7C3AED",
    colorLight: "#8B5CF6",
    colorDim: "rgba(139,92,246,0.1)",
    colorBorder: "rgba(139,92,246,0.2)",
    gradHead: "linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)",
    gradBody: "linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%)",
  },
  general: {
    label: "General Updates",
    subtitle: "Project milestones & activities",
    badge: "Project Updates",
    icon: "📋",
    color: "#4F46E5",
    colorLight: "#6366F1",
    colorDim: "rgba(99,102,241,0.1)",
    colorBorder: "rgba(99,102,241,0.2)",
    gradHead: "linear-gradient(135deg, #4338CA 0%, #4F46E5 60%, #6366F1 100%)",
    gradBody: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
  },
};

// ─── Theme helpers ────────────────────────────────────────────────────────────
function getStoredTheme(): boolean {
  try { return localStorage.getItem("cp-theme") !== "light"; }
  catch { return true; }
}
function saveTheme(dark: boolean) {
  try { localStorage.setItem("cp-theme", dark ? "dark" : "light"); } catch { /* noop */ }
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PORTAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Dark theme ── */
  .cp-root[data-cp-theme="dark"] {
    --cp-bg:            #080C14;
    --cp-bg-nav:        rgba(8,12,20,.96);
    --cp-bg-glass:      rgba(12,18,32,.9);
    --cp-bg-card:       rgba(255,255,255,.028);
    --cp-bg-card-hover: rgba(255,255,255,.045);
    --cp-bg-card-new:   rgba(99,102,241,.06);
    --cp-bg-input:      rgba(255,255,255,.06);
    --cp-bg-badge:      rgba(255,255,255,.06);
    --cp-bg-stat:       rgba(255,255,255,.038);
    --cp-bg-hero:       rgba(10,14,26,.6);
    --cp-text-h:        #F1F5F9;
    --cp-text-body:     #CBD5E1;
    --cp-text-muted:    #64748B;
    --cp-text-dim:      #475569;
    --cp-text-dimmer:   #334155;
    --cp-border:        rgba(255,255,255,.07);
    --cp-border-md:     rgba(255,255,255,.055);
    --cp-border-div:    rgba(255,255,255,.07);
    --cp-scrollbar:     #1E293B;
    --cp-dots:          rgba(99,102,241,.065);
    --cp-glow:          rgba(99,102,241,.12);
    --cp-shadow-card:   0 2px 16px rgba(0,0,0,.4);
    --cp-shadow-lg:     0 24px 80px rgba(0,0,0,.55);
  }

  /* ── Light theme ── */
  .cp-root[data-cp-theme="light"] {
    --cp-bg:            #F1F5FB;
    --cp-bg-nav:        rgba(241,245,251,.97);
    --cp-bg-glass:      rgba(255,255,255,.94);
    --cp-bg-card:       rgba(255,255,255,.82);
    --cp-bg-card-hover: rgba(255,255,255,1);
    --cp-bg-card-new:   rgba(99,102,241,.055);
    --cp-bg-input:      rgba(0,0,0,.04);
    --cp-bg-badge:      rgba(0,0,0,.05);
    --cp-bg-stat:       rgba(255,255,255,.95);
    --cp-bg-hero:       rgba(255,255,255,.6);
    --cp-text-h:        #0F172A;
    --cp-text-body:     #1E293B;
    --cp-text-muted:    #64748B;
    --cp-text-dim:      #94A3B8;
    --cp-text-dimmer:   #CBD5E1;
    --cp-border:        rgba(0,0,0,.08);
    --cp-border-md:     rgba(0,0,0,.06);
    --cp-border-div:    rgba(0,0,0,.07);
    --cp-scrollbar:     #CBD5E1;
    --cp-dots:          rgba(99,102,241,.055);
    --cp-glow:          rgba(99,102,241,.08);
    --cp-shadow-card:   0 2px 12px rgba(99,102,241,.08);
    --cp-shadow-lg:     0 24px 80px rgba(99,102,241,.12);
  }

  .cp-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    background: var(--cp-bg);
    color: var(--cp-text-body);
    -webkit-font-smoothing: antialiased;
    transition: background .3s, color .3s;
  }

  /* Scrollbar */
  .cp-root ::-webkit-scrollbar { width: 4px; }
  .cp-root ::-webkit-scrollbar-track { background: transparent; }
  .cp-root ::-webkit-scrollbar-thumb { background: var(--cp-scrollbar); border-radius: 99px; }

  /* Animations */
  @keyframes cp-fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes cp-spin     { to { transform:rotate(360deg); } }
  @keyframes cp-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.88)} }
  @keyframes cp-glow     { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes cp-ring     { from{stroke-dashoffset:var(--ring-full)} to{stroke-dashoffset:var(--ring-val)} }
  @keyframes cp-progress { from{width:0} to{width:var(--w)} }
  @keyframes cp-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .cp-fade-up { animation: cp-fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
  .cp-fade-in { animation: cp-fadeIn .4s ease both; }
  .cp-d1 { animation-delay:.06s }
  .cp-d2 { animation-delay:.12s }
  .cp-d3 { animation-delay:.18s }
  .cp-d4 { animation-delay:.24s }
  .cp-d5 { animation-delay:.30s }
  .cp-d6 { animation-delay:.36s }

  /* Dot grid bg */
  .cp-dots-bg {
    background-image: radial-gradient(circle, var(--cp-dots) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Glass */
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

  /* Metric card */
  .cp-metric {
    background: var(--cp-bg-stat);
    border: 1px solid var(--cp-border);
    border-radius: 14px;
    padding: 18px 20px;
    flex: 1;
    min-width: 120px;
    transition: background .3s, border-color .3s, transform .2s, box-shadow .2s;
  }
  .cp-metric:hover {
    background: var(--cp-bg-card-hover);
    border-color: rgba(99,102,241,.2);
    transform: translateY(-2px);
    box-shadow: var(--cp-shadow-card);
  }

  /* ── Section container ── */
  .cp-section-wrap {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--cp-border-md);
    box-shadow: var(--cp-shadow-card);
    transition: box-shadow .3s, border-color .3s;
  }
  .cp-section-wrap:hover { box-shadow: 0 8px 40px rgba(0,0,0,.18); }

  .cp-section-head {
    padding: 22px 24px 20px;
    position: relative;
    overflow: hidden;
  }
  .cp-section-head::after {
    content: "";
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,.06);
    pointer-events: none;
  }

  .cp-section-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Update card */
  .cp-update-card {
    background: var(--cp-bg-card);
    border: 1px solid var(--cp-border-md);
    border-radius: 14px;
    overflow: hidden;
    transition: background .2s, border-color .2s, transform .2s, box-shadow .2s;
  }
  .cp-update-card:hover {
    background: var(--cp-bg-card-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0,0,0,.15);
  }
  .cp-update-card.is-latest {
    border-color: rgba(99,102,241,.28);
    background: var(--cp-bg-card-new);
  }

  /* Sections grid — 2 col on desktop */
  .cp-sections-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  .cp-sections-grid.single { grid-template-columns: 1fr; }
  @media (max-width: 720px) { .cp-sections-grid { grid-template-columns: 1fr !important; } }

  /* Input */
  .cp-input {
    transition: border-color .2s, box-shadow .2s;
    background: var(--cp-bg-input) !important;
    color: var(--cp-text-h) !important;
  }
  .cp-input::placeholder { color: var(--cp-text-dim) !important; }
  .cp-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

  /* Button primary */
  .cp-btn { transition: all .2s; }
  .cp-btn:hover:not(:disabled) { opacity: .87; transform: translateY(-1px); }
  .cp-btn:active:not(:disabled) { transform: translateY(0); }

  /* Theme toggle */
  .cp-toggle {
    position: relative;
    width: 48px; height: 26px;
    border-radius: 99px;
    border: 1.5px solid var(--cp-border);
    background: var(--cp-bg-stat);
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    transition: border-color .2s, box-shadow .2s, background .3s;
  }
  .cp-toggle:hover {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.15);
  }

  /* Logo link */
  .cp-logo-link {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none; cursor: pointer;
    border-radius: 8px; padding: 3px 6px 3px 3px;
    transition: background .15s;
  }
  .cp-logo-link:hover { background: var(--cp-bg-badge); }

  /* Footer */
  .cp-footer {
    border-top: 1px solid var(--cp-border-md);
    transition: border-color .3s;
  }

  /* Update card — clickable */
  .cp-update-card { cursor: pointer; }

  /* Modal backdrop */
  .cp-modal-backdrop {
    position: fixed; inset: 0; z-index: 900;
    background: rgba(0,0,0,.62);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: cp-fadeIn .22s ease both;
  }

  /* Modal box */
  .cp-modal {
    position: relative;
    background: var(--cp-bg-glass);
    border: 1px solid var(--cp-border);
    border-radius: 20px;
    box-shadow: var(--cp-shadow-lg);
    width: 100%; max-width: 680px;
    max-height: 90vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: cp-fadeUp .3s cubic-bezier(.16,1,.3,1) both;
    transition: border-radius .2s, max-width .2s, max-height .2s, border-radius .2s;
  }
  .cp-modal.is-fullscreen {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: 100vw;
    height: 100vh;
    border-radius: 0 !important;
    margin: 0 !important;
  }

  /* Modal header */
  .cp-modal-header {
    display: flex; align-items: flex-start; gap: 12;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--cp-border-md);
    flex-shrink: 0;
  }

  /* Modal body (scrollable) */
  .cp-modal-body {
    overflow-y: auto;
    padding: 20px;
    flex: 1;
  }

  /* Modal image */
  .cp-modal-img {
    width: 100%; border-radius: 12px; display: block;
    border: 1px solid var(--cp-border-md);
    object-fit: contain;
  }
  .cp-modal.is-fullscreen .cp-modal-img {
    max-height: calc(100vh - 260px);
    object-fit: contain;
  }

  /* Feedback thread */
  .cp-feedback-msg { display: flex; flex-direction: column; gap: 3; max-width: 88%; }
  .cp-feedback-msg.from-client { align-self: flex-start; }
  .cp-feedback-msg.from-team   { align-self: flex-end; }

  /* Responsive */
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 16px !important; }
    .cp-hero-inner  { padding: 24px 16px 20px !important; }
    .cp-content     { padding: 0 16px 60px !important; }
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; }
    .cp-hero-cols { flex-direction: column !important; }
    .cp-ring-col  { display: none !important; }
    .cp-modal-backdrop { padding: 0; align-items: flex-end; }
    .cp-modal { border-radius: 20px 20px 0 0; max-height: 92vh; max-width: 100%; }
  }
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button className="cp-toggle" onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 6px", pointerEvents: "none", fontSize: 10, lineHeight: 1 }}>
        <span style={{ opacity: isDark ? 0.3 : 1, transition: "opacity .3s" }}>☀</span>
        <span style={{ opacity: isDark ? 1 : 0.3, transition: "opacity .3s" }}>☽</span>
      </div>
      <div style={{ position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#818CF8)", transform: isDark ? "translateX(22px)" : "translateX(0)", transition: "transform 380ms cubic-bezier(0.16,1,0.3,1)", boxShadow: "0 1px 4px rgba(99,102,241,.4)" }} />
    </button>
  );
}

// ─── ZynHive Logo ─────────────────────────────────────────────────────────────
function ZynLogo({ height = 36, isDark = true }: { height?: number; isDark?: boolean }) {
  return (
    <a href="/" className="cp-logo-link" aria-label="ZynHive — go to homepage"
      style={!isDark ? { background: "rgba(8,11,20,.82)", borderRadius: 10, padding: "4px 10px 4px 6px", backdropFilter: "blur(8px)" } : {}}>
      <img src="/logo.png" alt="ZynHive" style={{ height, width: "auto", objectFit: "contain", display: "block" }} />
    </a>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 16 }}>
      <div style={{ position: "relative", width: 44, height: 44 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid rgba(99,102,241,.15)" }}/>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: "#6366F1", animation: "cp-spin .9s linear infinite" }}/>
        <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: "rgba(99,102,241,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: "#6366F1" }}>ZH</span>
        </div>
      </div>
    </div>
  );
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function StatusDot({ status, color }: { status: FirestoreClientUpdate["status"]; color: string }) {
  return (
    <span style={{
      display: "inline-block", width: 8, height: 8, borderRadius: "50%",
      background: color, flexShrink: 0,
      ...(status === "in-progress" ? { animation: "cp-pulse 1.8s ease infinite" } : {}),
    }} />
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12, padding: 24, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🔍</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--cp-text-h)" }}>Portal not found</p>
        <p style={{ fontSize: 14, color: "var(--cp-text-muted)", maxWidth: 280, lineHeight: 1.6 }}>This link is invalid or has been removed. Please contact your project manager.</p>
      </div>
    );
  }

  return (
    <div className="cp-dots-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px 16px", position: "relative" }}>
      <div style={{ position: "fixed", top: 16, right: 20, zIndex: 100 }}>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, var(--cp-glow) 0%, transparent 70%)`, pointerEvents: "none", animation: "cp-glow 4s ease infinite" }}/>

      <div className="cp-fade-up" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <ZynLogo height={52} isDark={isDark} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--cp-text-h)", letterSpacing: "-0.5px", marginBottom: 8 }}>Welcome Back</h1>
          <p style={{ fontSize: 14, color: "var(--cp-text-muted)", lineHeight: 1.65 }}>Sign in to your client portal to view<br/>your project progress and updates.</p>
        </div>

        <div className="cp-glass" style={{ borderRadius: 20, padding: 32, boxShadow: "var(--cp-shadow-lg)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
            {[{ icon: "📊", text: "Live Updates" }, { icon: "📈", text: "Progress Tracking" }, { icon: "🔒", text: "Secure Access" }].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "var(--cp-bg-badge)", border: "1px solid var(--cp-border)", fontSize: 11, color: "var(--cp-text-muted)" }}>
                <span style={{ fontSize: 11 }}>{icon}</span>{text}
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Portal Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={show ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password" autoFocus className="cp-input"
                  style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: 12, fontSize: 14, fontFamily: "inherit", border: `1.5px solid ${error ? "rgba(239,68,68,.5)" : "var(--cp-border)"}` }}
                />
                <button type="button" onClick={() => setShow((v) => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--cp-text-dim)", padding: 4 }}>
                  {show
                    ? <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/><path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/><circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                  }
                </button>
              </div>
              {error && (
                <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#EF4444" }}>
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M7 4.5v3M7 9v.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                  {error}
                </div>
              )}
            </div>
            <button type="submit" disabled={loading || !password.trim()} className="cp-btn"
              style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: loading || !password.trim() ? "rgba(99,102,241,.2)" : "linear-gradient(135deg,#6366F1 0%,#818CF8 100%)", color: loading || !password.trim() ? "#4C5580" : "white", fontSize: 14, fontWeight: 600, cursor: loading || !password.trim() ? "default" : "pointer", letterSpacing: "0.01em" }}>
              {loading
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", borderTopColor: "white", animation: "cp-spin .8s linear infinite", display: "inline-block" }}/>Verifying…</span>
                : "Access My Portal →"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--cp-text-dimmer)", marginTop: 20 }}>
          🔒 Secured by ZynHive · Need help? Contact your project manager
        </p>
      </div>
    </div>
  );
}

// ─── Portal Navbar ────────────────────────────────────────────────────────────
function PortalNav({ client, isDark, onToggleTheme, onLogout, onOpenEmailSettings }: {
  client: FirestoreClient; isDark: boolean; onToggleTheme: () => void;
  onLogout: () => void; onOpenEmailSettings: () => void;
}) {
  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner" style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <ZynLogo isDark={isDark} />
        <div style={{ width: 1, height: 18, background: "var(--cp-border-div)" }} className="cp-hide-mobile"/>
        <span className="cp-hide-mobile" style={{ fontSize: 12, color: "var(--cp-text-dim)", fontWeight: 500 }}>Client Portal</span>
        <div style={{ flex: 1 }}/>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        {/* Email notification setup */}
        <button
          onClick={onOpenEmailSettings}
          title="Email notification settings"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--cp-border)", background: client.notificationEmail ? "rgba(16,185,129,.08)" : "transparent", color: client.notificationEmail ? "#10B981" : "var(--cp-text-dim)", cursor: "pointer", fontSize: 11, transition: "all .15s" }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="3" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1 4l6 4 6-4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
          <span className="cp-hide-mobile">{client.notificationEmail ? "Alerts On" : "Setup Alerts"}</span>
        </button>
        <div style={{ width: 1, height: 18, background: "var(--cp-border-div)" }}/>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }} className="cp-hide-mobile">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-body)", lineHeight: 1.3 }}>{client.name}</div>
            {client.company && <div style={{ fontSize: 10, color: "var(--cp-text-dim)" }}>{client.company}</div>}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,rgba(99,102,241,.28),rgba(129,140,248,.12))", border: "1px solid rgba(99,102,241,.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#818CF8", flexShrink: 0 }}>
            {initials(client.name)}
          </div>
        </div>
        <button onClick={onLogout} title="Sign out"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--cp-border)", background: "transparent", color: "var(--cp-text-dim)", cursor: "pointer", fontSize: 11, transition: "all .15s" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor="rgba(239,68,68,.35)"; el.style.color="#EF4444"; el.style.background="rgba(239,68,68,.07)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor="var(--cp-border)"; el.style.color="var(--cp-text-dim)"; el.style.background="transparent"; }}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span className="cp-hide-mobile">Sign out</span>
        </button>
      </div>
    </nav>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, color = "#6366F1", size = 100 }: { pct: number; color?: string; size?: number }) {
  const r    = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display: "block", transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cp-border)" strokeWidth={6}/>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dash}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)" }}/>
    </svg>
  );
}

// ─── Update Detail Modal ──────────────────────────────────────────────────────
function UpdateDetailModal({ u, client, onClose }: {
  u: FirestoreClientUpdate;
  client: FirestoreClient;
  onClose: () => void;
}) {
  const cfg = STATUS_CONFIG[u.status];
  const [fullscreen, setFullscreen] = useState(false);
  const [feedback,   setFeedback]   = useState<FirestoreUpdateFeedback[]>([]);
  const [fbLoading,  setFbLoading]  = useState(true);
  const [fbText,     setFbText]     = useState("");
  const [fbSending,  setFbSending]  = useState(false);
  const fbBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!u.id) return;
    fetchUpdateFeedback(u.id)
      .then(setFeedback)
      .catch(() => {})
      .finally(() => setFbLoading(false));
  }, [u.id]);

  useEffect(() => {
    fbBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feedback]);

  async function handleSendFeedback() {
    const msg = fbText.trim();
    if (!msg || !u.id) return;
    setFbSending(true);
    try {
      await createUpdateFeedback({
        updateId: u.id, clientId: client.id!, message: msg,
        fromClient: true, senderName: client.name,
      });
      setFbText("");
      setFeedback(await fetchUpdateFeedback(u.id));
    } catch (err) { console.error("[Feedback] send error:", err); }
    finally { setFbSending(false); }
  }

  function formatFbTime(ts: unknown): string {
    if (!ts) return "";
    try {
      const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
      return d.toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  }

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className="cp-modal-backdrop" onClick={onClose}>
      <div
        className={`cp-modal${fullscreen ? " is-fullscreen" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="cp-modal-header" style={{ gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{ width: 4, height: 36, borderRadius: 99, background: cfg.color, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 4 }}>
                <StatusDot status={u.status} color={cfg.color} />
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--cp-text-h)", lineHeight: 1.3 }}>{u.title}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                  {cfg.label}
                </span>
                {u.phase && (
                  <span style={{ fontSize: 11, color: "var(--cp-text-dim)", display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {u.phase}
                  </span>
                )}
                {u.createdAt && (
                  <span style={{ fontSize: 11, color: "var(--cp-text-dim)" }}>{formatDate(u.createdAt)}</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => setFullscreen((v) => !v)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--cp-border)", background: "var(--cp-bg-badge)", color: "var(--cp-text-dim)", cursor: "pointer" }}
            >
              {fullscreen
                ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2H2v3M9 2h3v3M5 12H2V9M9 12h3V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5V2h3M9 2h3v3M2 9v3h3M12 9v3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              }
            </button>
            <button
              onClick={onClose}
              title="Close"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--cp-border)", background: "var(--cp-bg-badge)", color: "var(--cp-text-dim)", cursor: "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="cp-modal-body">
          {/* Images */}
          {(() => {
            const allImages = u.images && u.images.length > 0
              ? u.images
              : u.imageUrl ? [u.imageUrl] : [];
            if (allImages.length === 0) return null;
            return (
              <div style={{ marginBottom: 20 }}>
                {allImages.length === 1 ? (
                  <img src={allImages[0]} alt="update attachment" className="cp-modal-img" />
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                    {allImages.map((src, idx) => (
                      <img key={idx} src={src} alt={`attachment-${idx + 1}`} style={{ width: "100%", borderRadius: 10, objectFit: "cover", aspectRatio: "4/3", display: "block", border: "1px solid var(--cp-border-md)" }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Description */}
          {u.description && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: "var(--cp-text-body)", lineHeight: 1.78 }}>{u.description}</p>
            </div>
          )}

          {/* Progress */}
          <div style={{ padding: "16px", borderRadius: 12, background: "var(--cp-bg-stat)", border: "1px solid var(--cp-border)", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: "var(--cp-text-muted)", fontWeight: 600 }}>Task Progress</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: cfg.color, fontFamily: "monospace" }}>{u.completionPercent}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: "var(--cp-border)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${u.completionPercent}%`, borderRadius: 99, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`, transition: "width .9s cubic-bezier(.16,1,.3,1)" }}/>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 11, color: "var(--cp-text-dim)" }}>Started</span>
              <span style={{ fontSize: 11, color: cfg.color, fontWeight: 600 }}>{u.completionPercent}% complete</span>
            </div>
          </div>

          {/* ── Feedback Thread ── */}
          <div style={{ borderTop: "1px solid var(--cp-border-md)", paddingTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 2h12v9H9l-3 3v-3H2V2z" stroke="var(--cp-text-muted)" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--cp-text-h)" }}>Feedback</span>
              {feedback.length > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 99, background: "rgba(99,102,241,.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,.22)" }}>
                  {feedback.length}
                </span>
              )}
            </div>

            {/* Messages */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
              {fbLoading ? (
                <div style={{ fontSize: 12, color: "var(--cp-text-dim)", padding: "8px 0" }}>Loading…</div>
              ) : feedback.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--cp-text-dim)", padding: "6px 0", fontStyle: "italic" }}>
                  No feedback yet. Share your thoughts below.
                </div>
              ) : (
                feedback.map((fb) => (
                  <div key={fb.id} className={`cp-feedback-msg ${fb.fromClient ? "from-client" : "from-team"}`}>
                    <div style={{
                      padding: "9px 13px",
                      borderRadius: fb.fromClient ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                      background: fb.fromClient ? "var(--cp-bg-stat)" : "rgba(99,102,241,.12)",
                      border: `1px solid ${fb.fromClient ? "var(--cp-border)" : "rgba(99,102,241,.22)"}`,
                      fontSize: 13, color: "var(--cp-text-body)", lineHeight: 1.6,
                    }}>
                      {fb.message}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 4px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: fb.fromClient ? "var(--cp-text-dim)" : "#818CF8" }}>
                        {fb.fromClient ? (fb.senderName || "You") : (fb.senderName || "ZynHive Team")}
                      </span>
                      <span style={{ fontSize: 10, color: "var(--cp-text-dimmer)" }}>{formatFbTime(fb.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
              <div ref={fbBottomRef} />
            </div>

            {/* Input */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={fbText}
                onChange={(e) => setFbText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendFeedback(); } }}
                placeholder="Leave your feedback or ask a question…"
                rows={2}
                className="cp-input"
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12, fontSize: 13,
                  fontFamily: "inherit", border: "1.5px solid var(--cp-border)",
                  resize: "none", lineHeight: 1.55,
                }}
              />
              <button
                onClick={handleSendFeedback}
                disabled={fbSending || !fbText.trim()}
                className="cp-btn"
                style={{
                  padding: "10px 16px", borderRadius: 12, border: "none", flexShrink: 0,
                  background: fbSending || !fbText.trim() ? "rgba(99,102,241,.2)" : "linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",
                  color: fbSending || !fbText.trim() ? "#4C5580" : "white",
                  fontSize: 13, fontWeight: 600, cursor: fbSending || !fbText.trim() ? "default" : "pointer",
                }}
              >
                {fbSending
                  ? <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", borderTopColor: "white", animation: "cp-spin .8s linear infinite", display: "inline-block" }} />
                  : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 2L2 7l5 2 2 5L14 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                }
              </button>
            </div>
            <p style={{ fontSize: 10, color: "var(--cp-text-dimmer)", marginTop: 6 }}>Enter to send · Shift+Enter for new line</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Update Card ──────────────────────────────────────────────────────────────
function UpdateCard({ u, isLatest, sectionColor, onClick }: {
  u: FirestoreClientUpdate; isLatest: boolean; sectionColor: string; onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[u.status];
  return (
    <div
      className={`cp-update-card${isLatest ? " is-latest" : ""}`}
      style={{ position: "relative", cursor: "pointer" }}
      onClick={onClick}
    >
      {/* Top accent line */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}55)`, borderRadius: "14px 14px 0 0" }}/>

      <div style={{ padding: "14px 16px 15px" }}>
        {/* Row 1: title + date + latest badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
              <StatusDot status={u.status} color={cfg.color} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--cp-text-h)", lineHeight: 1.35, flex: 1 }}>{u.title}</span>
            </div>
            {/* Tags row */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
              {isLatest && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(99,102,241,.12)", color: "#818CF8", border: "1px solid rgba(99,102,241,.22)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Latest
                </span>
              )}
              {u.phase && (
                <span style={{ fontSize: 10, color: "var(--cp-text-dim)", fontStyle: "italic" }}>{u.phase}</span>
              )}
            </div>
          </div>
          {u.createdAt && (
            <span style={{ fontSize: 10, color: "var(--cp-text-dim)", flexShrink: 0, marginTop: 2, whiteSpace: "nowrap" }}>
              {formatDateShort(u.createdAt)}
            </span>
          )}
        </div>

        {/* Image thumbnail */}
        {(() => {
          const allImages = u.images && u.images.length > 0 ? u.images : u.imageUrl ? [u.imageUrl] : [];
          if (allImages.length === 0) return null;
          return (
            <div style={{ position: "relative", marginBottom: 10, borderRadius: 8, overflow: "hidden", maxHeight: 100 }}>
              <img src={allImages[0]} alt="thumbnail" style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
              {allImages.length > 1 && (
                <span style={{ position: "absolute", bottom: 6, right: 6, fontSize: 10, fontWeight: 700, background: "rgba(0,0,0,.6)", color: "white", borderRadius: 6, padding: "2px 7px" }}>
                  +{allImages.length - 1} more
                </span>
              )}
            </div>
          );
        })()}

        {/* Description — 2 lines max */}
        {u.description && (
          <p style={{ fontSize: 12.5, color: "var(--cp-text-muted)", lineHeight: 1.65, marginBottom: 12, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
            {u.description}
          </p>
        )}

        {/* Progress bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 99, background: "var(--cp-border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${u.completionPercent}%`, borderRadius: 99, background: `linear-gradient(90deg, ${sectionColor}, ${sectionColor}88)`, transition: "width 1s cubic-bezier(.16,1,.3,1)" }}/>
          </div>
          <span style={{ fontSize: 11, fontWeight: 800, color: sectionColor, fontFamily: "monospace", flexShrink: 0 }}>{u.completionPercent}%</span>
        </div>

        {/* Click hint */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 4, color: "var(--cp-text-dimmer)" }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{ fontSize: 10 }}>Click to view details &amp; leave feedback</span>
        </div>
      </div>
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────────────
function SectionBlock({ sectionKey, items, latestId, onCardClick }: {
  sectionKey: "seo" | "digital-marketing" | "general";
  items: FirestoreClientUpdate[];
  latestId: string | undefined;
  onCardClick: (u: FirestoreClientUpdate) => void;
}) {
  const cfg           = SECTION_CONFIG[sectionKey];
  const completedCount = items.filter((u) => u.status === "completed").length;
  const activeCount    = items.filter((u) => u.status === "in-progress").length;
  const pct            = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="cp-section-wrap" style={{ background: "var(--cp-bg-card)" }}>

      {/* ── Colored header ── */}
      <div className="cp-section-head" style={{ background: cfg.gradHead }}>
        {/* Top row: icon + title + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16, position: "relative", zIndex: 1 }}>
          {/* Icon circle */}
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, backdropFilter: "blur(8px)" }}>
            {cfg.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", margin: 0 }}>{cfg.label}</h2>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.95)", border: "1px solid rgba(255,255,255,0.25)", letterSpacing: "0.04em" }}>
                {cfg.badge}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.5 }}>{cfg.subtitle}</p>
          </div>
          {/* Pct badge */}
          <div style={{ textAlign: "center", background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "monospace", lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>Done</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, position: "relative", zIndex: 1 }}>
          {[
            { label: "Total", value: items.length, icon: "📋" },
            { label: "Completed", value: completedCount, icon: "✅" },
            { label: "Active", value: activeCount, icon: "⚡" },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "8px 10px", border: "1px solid rgba(255,255,255,0.15)", textAlign: "center" }}>
              <div style={{ fontSize: 10, marginBottom: 2 }}>{icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", fontFamily: "monospace", lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", marginTop: 2, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.2)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: "rgba(255,255,255,0.9)", transition: "width 1.2s cubic-bezier(.16,1,.3,1)" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.65)" }}>{completedCount} of {items.length} completed</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{items.length - completedCount} remaining</span>
          </div>
        </div>
      </div>

      {/* ── Cards body ── */}
      <div className="cp-section-body" style={{ background: cfg.gradBody }}>
        {items.map((u) => (
          <UpdateCard key={u.id} u={u} isLatest={u.id === latestId} sectionColor={cfg.colorLight} onClick={() => onCardClick(u)} />
        ))}
      </div>
    </div>
  );
}

// ─── Updates View ─────────────────────────────────────────────────────────────
function UpdatesView({ client: initialClient, isDark, onToggleTheme, onLogout }: {
  client: FirestoreClient; isDark: boolean; onToggleTheme: () => void; onLogout: () => void;
}) {
  const [client,         setClient]         = useState(initialClient);
  const [updates,        setUpdates]        = useState<FirestoreClientUpdate[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<FirestoreClientUpdate | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [notifEmail,     setNotifEmail]     = useState(initialClient.notificationEmail ?? "");
  const [emailSaving,    setEmailSaving]    = useState(false);
  const [search,         setSearch]         = useState("");
  const [dateFrom,       setDateFrom]       = useState("");
  const [dateTo,         setDateTo]         = useState("");

  useEffect(() => {
    fetchClientUpdates(client.id!).then(setUpdates).catch(() => {}).finally(() => setLoading(false));
  }, [client.id]);

  async function handleSaveEmailSettings() {
    if (!client.id) return;
    setEmailSaving(true);
    try {
      const { updateClient } = await import("../lib/firebase");
      await updateClient(client.id, { notificationEmail: notifEmail.trim() });
      setClient((c) => ({ ...c, notificationEmail: notifEmail.trim() }));
      setEmailModalOpen(false);
    } catch { /* ignore */ }
    finally { setEmailSaving(false); }
  }

  const latest    = updates[0];
  const completed = updates.filter((u) => u.status === "completed").length;
  const active    = updates.filter((u) => u.status === "in-progress").length;
  const onHold    = updates.filter((u) => u.status === "on-hold").length;
  const overallPct = latest?.completionPercent ?? 0;

  const hasFilters = search.trim() !== "" || dateFrom !== "" || dateTo !== "";

  const filteredUpdates = updates.filter((u) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        u.title.toLowerCase().includes(q) ||
        (u.description ?? "").toLowerCase().includes(q) ||
        (u.phase ?? "").toLowerCase().includes(q);
      if (!match) return false;
    }
    if (dateFrom || dateTo) {
      const ts = (u.createdAt as { toDate?: () => Date } | null)?.toDate
        ? (u.createdAt as { toDate: () => Date }).toDate()
        : u.createdAt ? new Date(u.createdAt as unknown as string) : null;
      if (!ts) return false;
      const d = ts.toISOString().slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo   && d > dateTo)   return false;
    }
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

  const latestStatusCfg = latest ? STATUS_CONFIG[latest.status] : null;

  return (
    <div className="cp-fade-in" style={{ minHeight: "100vh" }}>
      {selectedUpdate && (
        <UpdateDetailModal u={selectedUpdate} client={client} onClose={() => setSelectedUpdate(null)} />
      )}

      {/* Email notification modal */}
      {emailModalOpen && (
        <div className="cp-modal-backdrop" onClick={() => setEmailModalOpen(false)}>
          <div className="cp-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header" style={{ gap: 10 }}>
              <span style={{ fontSize: 20 }}>📧</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--cp-text-h)" }}>Email Notifications</div>
                <div style={{ fontSize: 11, color: "var(--cp-text-dim)", marginTop: 2 }}>Get notified when a project update is added</div>
              </div>
              <button onClick={() => setEmailModalOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--cp-border)", background: "var(--cp-bg-badge)", color: "var(--cp-text-dim)", cursor: "pointer" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="cp-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 12, color: "var(--cp-text-muted)", lineHeight: 1.7, margin: 0 }}>
                Enter the email address where you'd like to receive notifications whenever a new update is posted to your project.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Notification Email</label>
                <input
                  type="email"
                  value={notifEmail} onChange={(e) => setNotifEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="cp-input"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid var(--cp-border)" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setEmailModalOpen(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--cp-border)", background: "transparent", color: "var(--cp-text-muted)", cursor: "pointer", fontSize: 13 }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveEmailSettings} disabled={emailSaving}
                  className="cp-btn"
                  style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: emailSaving ? "rgba(99,102,241,.2)" : "linear-gradient(135deg,#6366F1,#818CF8)", color: emailSaving ? "#4C5580" : "white", cursor: emailSaving ? "default" : "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  {emailSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PortalNav client={client} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} onOpenEmailSettings={() => setEmailModalOpen(true)} />

      {/* ── Hero ── */}
      <div style={{ background: "var(--cp-bg-hero)", borderBottom: "1px solid var(--cp-border-md)", transition: "background .3s, border-color .3s" }}>
        <div className="cp-hero-inner" style={{ maxWidth: 940, margin: "0 auto", padding: "32px 24px 28px" }}>
          <div className="cp-hero-cols cp-fade-up" style={{ display: "flex", alignItems: "center", gap: 28 }}>

            {/* Left — welcome + project info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Greeting + project name */}
              <div style={{ marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: "var(--cp-text-dim)", fontWeight: 500, marginBottom: 4 }}>
                  {greeting()}, {client.name.split(" ")[0]}! 👋
                </p>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--cp-text-h)", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 6 }}>
                  {client.projectName || "Your Project Dashboard"}
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {client.company && (
                    <span style={{ fontSize: 12, color: "var(--cp-text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><rect x="2" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M5 5V4a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2"/></svg>
                      {client.company}
                    </span>
                  )}
                  {latest?.createdAt && (
                    <span style={{ fontSize: 11, color: "var(--cp-text-dim)", display: "flex", alignItems: "center", gap: 4 }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.1"/><path d="M6 3.5V6l1.5 1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg>
                      Last updated {formatDate(latest.createdAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Latest update quick info */}
              {latest && latestStatusCfg && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 10, background: "var(--cp-bg-badge)", border: "1px solid var(--cp-border)", fontSize: 12 }}>
                  <StatusDot status={latest.status} color={latestStatusCfg.color} />
                  <span style={{ color: "var(--cp-text-muted)" }}>Latest: </span>
                  <span style={{ color: "var(--cp-text-h)", fontWeight: 600 }}>{latest.title}</span>
                  <span style={{ padding: "1px 7px", borderRadius: 99, background: latestStatusCfg.bg, color: latestStatusCfg.color, border: `1px solid ${latestStatusCfg.border}`, fontSize: 10, fontWeight: 700 }}>
                    {latestStatusCfg.label}
                  </span>
                </div>
              )}
            </div>

            {/* Right — progress ring */}
            {updates.length > 0 && (
              <div className="cp-ring-col" style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ position: "relative", width: 100, height: 100 }}>
                  <ProgressRing pct={overallPct} size={100} color="#6366F1" />
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#818CF8", fontFamily: "monospace", lineHeight: 1 }}>{overallPct}%</span>
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "var(--cp-text-dim)", fontWeight: 500, textAlign: "center" }}>Overall<br/>Progress</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Metrics ── */}
      {updates.length > 0 && (
        <div style={{ borderBottom: "1px solid var(--cp-border-md)", transition: "border-color .3s" }}>
          <div style={{ maxWidth: 940, margin: "0 auto", padding: "20px 24px" }}>
            <div className="cp-metrics-grid cp-fade-up cp-d1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Total Tasks",  value: updates.length,  color: "#6366F1", icon: "📋", sub: "all activities" },
                { label: "Completed",    value: completed,        color: "#10B981", icon: "✅", sub: "tasks done" },
                { label: "In Progress",  value: active,           color: "#F59E0B", icon: "⚡", sub: "active now" },
                { label: "On Hold",      value: onHold,           color: "#EF4444", icon: "⏸", sub: "paused" },
              ].map(({ label, value, color, icon, sub }) => (
                <div key={label} className="cp-metric">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "monospace", lineHeight: 1 }}>{value}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-body)" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "var(--cp-text-dim)", marginTop: 2 }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="cp-content" style={{ maxWidth: 940, margin: "0 auto", padding: "28px 24px 72px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 72, gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid rgba(99,102,241,.15)", borderTopColor: "#6366F1", animation: "cp-spin .9s linear infinite" }}/>
            <span style={{ fontSize: 13, color: "var(--cp-text-dim)", fontWeight: 500 }}>Loading your updates…</span>
          </div>
        ) : updates.length === 0 ? (
          <div className="cp-fade-up" style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 80, height: 80, borderRadius: 22, background: "rgba(99,102,241,.07)", border: "1px solid rgba(99,102,241,.14)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, margin: "0 auto 20px" }}>🚀</div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--cp-text-h)", marginBottom: 10 }}>Work in progress!</p>
            <p style={{ fontSize: 14, color: "var(--cp-text-muted)", lineHeight: 1.7, maxWidth: 320, margin: "0 auto" }}>
              Your project has been kicked off. Updates will appear here as work is completed.
            </p>
          </div>
        ) : (() => {
          const seoSection  = sections.find((s) => s.key === "seo");
          const dmSection   = sections.find((s) => s.key === "digital-marketing");
          const genSection  = sections.find((s) => s.key === "general");
          const hasBothMain = !!(seoSection && dmSection);
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ── Search & Date filter bar ── */}
              <div className="cp-fade-up" style={{
                display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
                background: "var(--cp-bg-stat)", border: "1px solid var(--cp-border)",
                borderRadius: 14, padding: "12px 14px",
              }}>
                {/* Search */}
                <div style={{ position: "relative", flex: "1 1 180px", minWidth: 160 }}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
                    style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--cp-text-dim)", pointerEvents: "none" }}>
                    <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M9 9l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <input
                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search updates…"
                    className="cp-input"
                    style={{ width: "100%", paddingLeft: 30, paddingRight: 10, paddingTop: 8, paddingBottom: 8, borderRadius: 9, fontSize: 13, fontFamily: "inherit", border: "1.5px solid var(--cp-border)" }}
                  />
                </div>

                {/* Divider */}
                <div style={{ width: 1, height: 28, background: "var(--cp-border-div)", flexShrink: 0 }} className="cp-hide-mobile"/>

                {/* Date from */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", whiteSpace: "nowrap" }}>From</label>
                  <input
                    type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="cp-input"
                    style={{ padding: "7px 10px", borderRadius: 9, fontSize: 12, fontFamily: "inherit", border: "1.5px solid var(--cp-border)", color: dateFrom ? "var(--cp-text-h)" : "var(--cp-text-dim)", minWidth: 130 }}
                  />
                </div>

                {/* Date to */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "0 0 auto" }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", whiteSpace: "nowrap" }}>To</label>
                  <input
                    type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="cp-input"
                    style={{ padding: "7px 10px", borderRadius: 9, fontSize: 12, fontFamily: "inherit", border: "1.5px solid var(--cp-border)", color: dateTo ? "var(--cp-text-h)" : "var(--cp-text-dim)", minWidth: 130 }}
                  />
                </div>

                {/* Clear button */}
                {hasFilters && (
                  <button
                    onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", borderRadius: 9, border: "1px solid rgba(239,68,68,.28)", background: "rgba(239,68,68,.07)", color: "#EF4444", cursor: "pointer", fontSize: 11, fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M1.5 1.5l8 8M9.5 1.5l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    Clear
                  </button>
                )}

                {/* Result count when filtered */}
                {hasFilters && (
                  <span style={{ fontSize: 11, color: "var(--cp-text-dim)", marginLeft: "auto", whiteSpace: "nowrap" }}>
                    <strong style={{ color: "var(--cp-text-h)" }}>{filteredUpdates.length}</strong> of {updates.length} updates
                  </span>
                )}
              </div>

              {/* No results */}
              {hasFilters && filteredUpdates.length === 0 && (
                <div className="cp-fade-up" style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--cp-text-h)", marginBottom: 8 }}>No updates found</p>
                  <p style={{ fontSize: 13, color: "var(--cp-text-dim)", lineHeight: 1.65 }}>Try adjusting your search or date range.</p>
                </div>
              )}

              {/* SEO + DM side by side */}
              {(seoSection || dmSection) && (
                <div className={`cp-sections-grid cp-fade-up cp-d1${hasBothMain ? "" : " single"}`}>
                  {seoSection && (
                    <SectionBlock sectionKey="seo" items={seoSection.items} latestId={latest?.id} onCardClick={setSelectedUpdate} />
                  )}
                  {dmSection && (
                    <SectionBlock sectionKey="digital-marketing" items={dmSection.items} latestId={latest?.id} onCardClick={setSelectedUpdate} />
                  )}
                </div>
              )}
              {/* General — full width below */}
              {genSection && (
                <div className="cp-fade-up cp-d2">
                  <SectionBlock sectionKey="general" items={genSection.items} latestId={latest?.id} onCardClick={setSelectedUpdate} />
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── Footer ── */}
      <footer className="cp-footer" style={{ padding: "22px 24px" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: 7, background: "linear-gradient(135deg,#6366F1,#818CF8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: "white" }}>ZH</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--cp-text-dim)" }}>Powered by <strong style={{ color: "var(--cp-text-muted)" }}>ZynHive</strong> · Your Digital Growth Partner</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--cp-text-dimmer)" }}>🔒 Secure Client Portal</span>
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

  function toggleTheme() {
    setIsDark((d) => { saveTheme(!d); return !d; });
  }

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

  if (!clientId) {
    return (
      <>
        <style>{PORTAL_CSS}</style>
        <div className="cp-root" data-cp-theme={isDark ? "dark" : "light"} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <p style={{ color: "var(--cp-text-muted)", fontSize: 14 }}>Invalid portal link.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{PORTAL_CSS}</style>
      <div className="cp-root" data-cp-theme={isDark ? "dark" : "light"}>
        {checking ? (
          <Loader />
        ) : authedClient ? (
          <UpdatesView client={authedClient} isDark={isDark} onToggleTheme={toggleTheme} onLogout={handleLogout} />
        ) : (
          <LoginScreen clientId={clientId} onAuth={setAuthedClient} isDark={isDark} onToggleTheme={toggleTheme} />
        )}
      </div>
    </>
  );
}
