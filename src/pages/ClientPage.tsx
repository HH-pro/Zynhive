// ─── src/pages/ClientPage.tsx ─────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import {
  fetchClientById, fetchClientUpdates,
  fetchUpdateFeedback, createUpdateFeedback,
  fetchNotificationSettings,
  type FirestoreClient, type FirestoreClientUpdate, type FirestoreUpdateFeedback,
} from "../lib/firebase";
import { sendWhatsAppToAll } from "../lib/whatsapp";

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
    subtitle: "Search engine optimization — improving your visibility on Google",
    icon: "🔍",
    color: "#3B82F6",
    colorDim: "rgba(59,130,246,0.14)",
    colorBorder: "rgba(59,130,246,0.22)",
    grad: "linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)",
  },
  "digital-marketing": {
    label: "Digital Marketing",
    subtitle: "Campaigns, social media, ads & brand growth activities",
    icon: "📣",
    color: "#8B5CF6",
    colorDim: "rgba(139,92,246,0.14)",
    colorBorder: "rgba(139,92,246,0.22)",
    grad: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 100%)",
  },
  general: {
    label: "General Updates",
    subtitle: "Project milestones and other activities",
    icon: "📋",
    color: "#6366F1",
    colorDim: "rgba(99,102,241,0.14)",
    colorBorder: "rgba(99,102,241,0.22)",
    grad: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 100%)",
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

  /* Section banner */
  .cp-section-banner {
    border-radius: 16px;
    border: 1px solid var(--cp-border-md);
    padding: 20px 24px;
    margin-bottom: 16px;
    transition: background .3s, border-color .3s;
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
    transform: translateY(-1px);
    box-shadow: var(--cp-shadow-card);
  }
  .cp-update-card.is-latest {
    border-color: rgba(99,102,241,.22);
    background: var(--cp-bg-card-new);
  }

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
function PortalNav({ client, isDark, onToggleTheme, onLogout, onOpenWaSettings }: {
  client: FirestoreClient; isDark: boolean; onToggleTheme: () => void;
  onLogout: () => void; onOpenWaSettings: () => void;
}) {
  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner" style={{ maxWidth: 940, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12 }}>
        <ZynLogo isDark={isDark} />
        <div style={{ width: 1, height: 18, background: "var(--cp-border-div)" }} className="cp-hide-mobile"/>
        <span className="cp-hide-mobile" style={{ fontSize: 12, color: "var(--cp-text-dim)", fontWeight: 500 }}>Client Portal</span>
        <div style={{ flex: 1 }}/>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        {/* WhatsApp notification setup */}
        <button
          onClick={onOpenWaSettings}
          title="WhatsApp notification settings"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--cp-border)", background: client.whatsappNumber ? "rgba(16,185,129,.08)" : "transparent", color: client.whatsappNumber ? "#10B981" : "var(--cp-text-dim)", cursor: "pointer", fontSize: 11, transition: "all .15s" }}
        >
          <span style={{ fontSize: 13 }}>📱</span>
          <span className="cp-hide-mobile">{client.whatsappNumber ? "Notifications On" : "Setup Alerts"}</span>
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
      // Notify all team members via WhatsApp
      fetchNotificationSettings().then((settings) => {
        if (settings?.teamMembers?.length) {
          const text = `💬 New feedback from *${client.name}*${client.company ? ` (${client.company})` : ""} on update *${u.title}*:\n"${msg}"`;
          sendWhatsAppToAll(settings.teamMembers, text);
        }
      }).catch(() => {});
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
          {/* Image */}
          {u.imageUrl && (
            <div style={{ marginBottom: 20 }}>
              <img src={u.imageUrl} alt="update attachment" className="cp-modal-img" />
            </div>
          )}

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
    <div className={`cp-update-card${isLatest ? " is-latest" : ""}`} style={{ position: "relative" }} onClick={onClick}>
      {/* Left accent border */}
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: cfg.color, borderRadius: "14px 0 0 14px" }}/>

      <div style={{ padding: "18px 20px 18px 22px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              <StatusDot status={u.status} color={cfg.color} />
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--cp-text-h)", lineHeight: 1.3 }}>{u.title}</span>
              {isLatest && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(99,102,241,.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,.25)", textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>
                  Latest
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                {cfg.label}
              </span>
              {u.phase && (
                <span style={{ fontSize: 11, color: "var(--cp-text-dim)", display: "flex", alignItems: "center", gap: 3 }}>
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {u.phase}
                </span>
              )}
            </div>
          </div>
          {u.createdAt && (
            <span style={{ fontSize: 11, color: "var(--cp-text-dim)", flexShrink: 0, marginTop: 2 }}>
              {formatDateShort(u.createdAt)}
            </span>
          )}
        </div>

        {/* Description */}
        {u.description && (
          <p style={{ fontSize: 13.5, color: "var(--cp-text-muted)", lineHeight: 1.72, marginBottom: 14 }}>
            {u.description}
          </p>
        )}

        {/* Image */}
        {u.imageUrl && (
          <div style={{ marginBottom: 14 }}>
            <img src={u.imageUrl} alt="update attachment"
              style={{ width: "100%", borderRadius: 10, display: "block", border: "1px solid var(--cp-border-md)", maxHeight: 300, objectFit: "cover" }}/>
          </div>
        )}

        {/* Progress bar */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: "var(--cp-text-dim)", fontWeight: 500 }}>Task Progress</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: cfg.color, fontFamily: "monospace" }}>{u.completionPercent}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "var(--cp-border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${u.completionPercent}%`, borderRadius: 99, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`, transition: "width .9s cubic-bezier(.16,1,.3,1)" }}/>
          </div>
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
  const cfg = SECTION_CONFIG[sectionKey];
  const completedCount = items.filter((u) => u.status === "completed").length;
  const pct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div>
      {/* Section banner */}
      <div className="cp-section-banner" style={{ background: cfg.grad }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.colorDim, border: `1px solid ${cfg.colorBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 3, flexWrap: "wrap" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--cp-text-h)", letterSpacing: "-0.2px" }}>{cfg.label}</h2>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 99, background: cfg.colorDim, color: cfg.color, border: `1px solid ${cfg.colorBorder}` }}>
                {items.length} {items.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "var(--cp-text-muted)", lineHeight: 1.5 }}>{cfg.subtitle}</p>
          </div>
          {/* Mini progress */}
          <div style={{ textAlign: "center", flexShrink: 0 }} className="cp-hide-mobile">
            <div style={{ fontSize: 18, fontWeight: 800, color: cfg.color, fontFamily: "monospace", lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: 10, color: "var(--cp-text-dim)", marginTop: 2 }}>done</div>
          </div>
        </div>

        {/* Section progress bar */}
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 4, borderRadius: 99, background: "var(--cp-border)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}99)`, transition: "width 1s cubic-bezier(.16,1,.3,1)" }}/>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "var(--cp-text-dim)" }}>{completedCount} of {items.length} completed</span>
            <span style={{ fontSize: 10, color: cfg.color, fontWeight: 600 }}>{items.length - completedCount} remaining</span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((u) => (
          <UpdateCard key={u.id} u={u} isLatest={u.id === latestId} sectionColor={cfg.color} onClick={() => onCardClick(u)} />
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
  const [waModalOpen,    setWaModalOpen]    = useState(false);
  const [waNumber,       setWaNumber]       = useState(initialClient.whatsappNumber ?? "");
  const [waApiKey,       setWaApiKey]       = useState(initialClient.whatsappApiKey ?? "");
  const [waSaving,       setWaSaving]       = useState(false);

  useEffect(() => {
    fetchClientUpdates(client.id!).then(setUpdates).catch(() => {}).finally(() => setLoading(false));
  }, [client.id]);

  async function handleSaveWaSettings() {
    if (!client.id) return;
    setWaSaving(true);
    try {
      const { updateClient } = await import("../lib/firebase");
      await updateClient(client.id, { whatsappNumber: waNumber.trim(), whatsappApiKey: waApiKey.trim() });
      setClient((c) => ({ ...c, whatsappNumber: waNumber.trim(), whatsappApiKey: waApiKey.trim() }));
      setWaModalOpen(false);
    } catch { /* ignore */ }
    finally { setWaSaving(false); }
  }

  const latest    = updates[0];
  const completed = updates.filter((u) => u.status === "completed").length;
  const active    = updates.filter((u) => u.status === "in-progress").length;
  const onHold    = updates.filter((u) => u.status === "on-hold").length;
  const overallPct = latest?.completionPercent ?? 0;

  const seoItems = updates.filter((u) => u.category === "seo");
  const dmItems  = updates.filter((u) => u.category === "digital-marketing");
  const genItems = updates.filter((u) => !u.category || u.category === "general");

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

      {/* WhatsApp self-service modal */}
      {waModalOpen && (
        <div className="cp-modal-backdrop" onClick={() => setWaModalOpen(false)}>
          <div className="cp-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="cp-modal-header" style={{ gap: 10 }}>
              <span style={{ fontSize: 20 }}>📱</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "var(--cp-text-h)" }}>WhatsApp Alerts</div>
                <div style={{ fontSize: 11, color: "var(--cp-text-dim)", marginTop: 2 }}>Get notified when team replies to your feedback</div>
              </div>
              <button onClick={() => setWaModalOpen(false)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, border: "1px solid var(--cp-border)", background: "var(--cp-bg-badge)", color: "var(--cp-text-dim)", cursor: "pointer" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="cp-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 12, color: "var(--cp-text-muted)", lineHeight: 1.7, margin: 0 }}>
                To activate, send <strong style={{ color: "var(--cp-text-h)" }}>"I allow callmebot to send me messages"</strong> to <strong style={{ color: "var(--cp-text-h)" }}>+34 644 59 78 74</strong> on WhatsApp. You'll receive your API key instantly.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Your WhatsApp Number</label>
                <input
                  value={waNumber} onChange={(e) => setWaNumber(e.target.value)}
                  placeholder="+923001234567 (with country code)"
                  className="cp-input"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid var(--cp-border)" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", textTransform: "uppercase", letterSpacing: "0.07em" }}>CallMeBot API Key</label>
                <input
                  value={waApiKey} onChange={(e) => setWaApiKey(e.target.value)}
                  placeholder="API key received from CallMeBot"
                  className="cp-input"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid var(--cp-border)" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => setWaModalOpen(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "1px solid var(--cp-border)", background: "transparent", color: "var(--cp-text-muted)", cursor: "pointer", fontSize: 13 }}>
                  Cancel
                </button>
                <button
                  onClick={handleSaveWaSettings} disabled={waSaving}
                  className="cp-btn"
                  style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: waSaving ? "rgba(99,102,241,.2)" : "linear-gradient(135deg,#6366F1,#818CF8)", color: waSaving ? "#4C5580" : "white", cursor: waSaving ? "default" : "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  {waSaving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PortalNav client={client} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} onOpenWaSettings={() => setWaModalOpen(true)} />

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
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {sections.map(({ key, items }, sIdx) => (
              <div key={key} className={`cp-fade-up cp-d${Math.min(sIdx + 2, 6)}`}>
                <SectionBlock sectionKey={key} items={items} latestId={latest?.id} onCardClick={setSelectedUpdate} />
              </div>
            ))}
          </div>
        )}
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
