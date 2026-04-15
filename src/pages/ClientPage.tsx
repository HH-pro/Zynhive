// ─── src/pages/ClientPage.tsx ─────────────────────────────────────────────────
import { useState, useEffect } from "react";
import {
  fetchClientById, fetchClientUpdates,
  type FirestoreClient, type FirestoreClientUpdate,
} from "../lib/firebase";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  FirestoreClientUpdate["status"],
  { label: string; color: string; bg: string; border: string }
> = {
  "planning":    { label: "Planning",    color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.25)"  },
  "in-progress": { label: "In Progress", color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"   },
  "review":      { label: "In Review",   color: "#3B82F6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.25)"  },
  "completed":   { label: "Completed",   color: "#10B981", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)"  },
  "on-hold":     { label: "On Hold",     color: "#EF4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.25)"   },
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

  /* ── Dark theme (default) ── */
  .cp-root[data-cp-theme="dark"] {
    --cp-bg:          #080B12;
    --cp-bg-nav:      rgba(8,11,18,.94);
    --cp-bg-glass:    rgba(15,20,35,.88);
    --cp-bg-card:     rgba(255,255,255,.025);
    --cp-bg-card-new: rgba(99,102,241,.055);
    --cp-bg-input:    rgba(255,255,255,.05);
    --cp-bg-badge:    rgba(255,255,255,.05);
    --cp-bg-stat:     rgba(255,255,255,.035);
    --cp-text-h:      #F1F5F9;
    --cp-text-body:   #CBD5E1;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #475569;
    --cp-text-dimmer: #334155;
    --cp-border:      rgba(255,255,255,.07);
    --cp-border-md:   rgba(255,255,255,.05);
    --cp-border-div:  rgba(255,255,255,.07);
    --cp-scrollbar:   #1E293B;
    --cp-dots:        rgba(99,102,241,.07);
    --cp-hero-grad:   rgba(99,102,241,.04);
    --cp-glow-color:  rgba(99,102,241,.14);
    --cp-shadow:      0 24px 80px rgba(0,0,0,.55);
    --cp-card-shadow: 0 0 0 1px rgba(99,102,241,.1), 0 4px 24px rgba(0,0,0,.35);
  }

  /* ── Light theme ── */
  .cp-root[data-cp-theme="light"] {
    --cp-bg:          #F0F4FF;
    --cp-bg-nav:      rgba(240,244,255,.97);
    --cp-bg-glass:    rgba(255,255,255,.92);
    --cp-bg-card:     rgba(255,255,255,.75);
    --cp-bg-card-new: rgba(99,102,241,.06);
    --cp-bg-input:    rgba(0,0,0,.04);
    --cp-bg-badge:    rgba(0,0,0,.05);
    --cp-bg-stat:     rgba(255,255,255,.9);
    --cp-text-h:      #0F172A;
    --cp-text-body:   #1E293B;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #94A3B8;
    --cp-text-dimmer: #CBD5E1;
    --cp-border:      rgba(0,0,0,.09);
    --cp-border-md:   rgba(0,0,0,.07);
    --cp-border-div:  rgba(0,0,0,.08);
    --cp-scrollbar:   #CBD5E1;
    --cp-dots:        rgba(99,102,241,.06);
    --cp-hero-grad:   rgba(99,102,241,.03);
    --cp-glow-color:  rgba(99,102,241,.1);
    --cp-shadow:      0 24px 80px rgba(99,102,241,.12);
    --cp-card-shadow: 0 0 0 1px rgba(99,102,241,.1), 0 4px 20px rgba(99,102,241,.08);
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
  @keyframes cp-fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes cp-spin     { to { transform:rotate(360deg); } }
  @keyframes cp-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.95)} }
  @keyframes cp-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes cp-progress { from{width:0} to{width:var(--w)} }
  @keyframes cp-glow     { 0%,100%{opacity:.5} 50%{opacity:1} }

  .cp-fade-up   { animation: cp-fadeUp  .5s cubic-bezier(.16,1,.3,1) both; }
  .cp-fade-in   { animation: cp-fadeIn  .4s ease both; }
  .cp-card-1    { animation-delay:.05s }
  .cp-card-2    { animation-delay:.10s }
  .cp-card-3    { animation-delay:.15s }
  .cp-card-4    { animation-delay:.20s }
  .cp-card-5    { animation-delay:.25s }
  .cp-card-6    { animation-delay:.30s }

  /* Grid background dots */
  .cp-dots-bg {
    background-image: radial-gradient(circle, var(--cp-dots) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Glass card */
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
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: background .3s, border-color .3s;
  }

  /* Hero section */
  .cp-hero {
    border-bottom: 1px solid var(--cp-border-md);
    background: linear-gradient(180deg, var(--cp-hero-grad) 0%, transparent 100%);
    transition: border-color .3s;
  }

  /* Stat card */
  .cp-stat-card {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; border-radius: 10px;
    background: var(--cp-bg-stat);
    border: 1px solid var(--cp-border);
    transition: background .3s, border-color .3s;
  }

  /* Update card */
  .cp-update-card {
    transition: border-color .2s, transform .2s, box-shadow .2s;
    cursor: default;
  }
  .cp-update-card:hover {
    border-color: rgba(99,102,241,.3) !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
  }

  /* Card base */
  .cp-card-base {
    border-radius: 16px; overflow: hidden;
    background: var(--cp-bg-card);
    border: 1px solid var(--cp-border-md);
    transition: background .3s, border-color .3s;
  }
  .cp-card-base.is-new {
    background: var(--cp-bg-card-new);
    border-color: rgba(99,102,241,.18);
    box-shadow: var(--cp-card-shadow);
  }

  /* Input */
  .cp-input {
    transition: border-color .2s, box-shadow .2s;
    background: var(--cp-bg-input) !important;
    color: var(--cp-text-h) !important;
  }
  .cp-input::placeholder { color: var(--cp-text-dim) !important; }
  .cp-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

  /* Button */
  .cp-btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
  .cp-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cp-btn-primary { transition: all .2s; }

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

  /* Footer */
  .cp-footer {
    border-top: 1px solid var(--cp-border-md);
    transition: border-color .3s;
  }

  /* Logo link */
  .cp-logo-link {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none;
    cursor: pointer;
    border-radius: 8px;
    padding: 3px 6px 3px 3px;
    transition: background .15s;
  }
  .cp-logo-link:hover {
    background: var(--cp-bg-badge);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 16px !important; }
    .cp-hero-inner  { padding: 20px 16px !important; }
    .cp-content     { padding: 0 16px 48px !important; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(ts: any): string {
  if (!ts) return "";
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  } catch { return ""; }
}

function formatDateShort(ts: any): string {
  if (!ts) return "";
  try {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch { return ""; }
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      className="cp-toggle"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {/* Icon row */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 6px", pointerEvents: "none",
        fontSize: 10, lineHeight: 1,
      }}>
        <span style={{ opacity: isDark ? 0.3 : 1, transition: "opacity .3s" }}>☀</span>
        <span style={{ opacity: isDark ? 1 : 0.3, transition: "opacity .3s" }}>☽</span>
      </div>
      {/* Thumb */}
      <div style={{
        position: "absolute", top: 3, left: 3,
        width: 16, height: 16, borderRadius: "50%",
        background: "linear-gradient(135deg, #6366F1, #818CF8)",
        transform: isDark ? "translateX(22px)" : "translateX(0)",
        transition: "transform 380ms cubic-bezier(0.16,1,0.3,1)",
        boxShadow: "0 1px 4px rgba(99,102,241,.4)",
      }} />
    </button>
  );
}

// ─── Status icon SVGs ─────────────────────────────────────────────────────────
function StatusIcon({ status, color }: { status: FirestoreClientUpdate["status"]; color: string }) {
  if (status === "completed")
    return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={color} fillOpacity=".15"/><path d="M4 7l2.2 2.2L10 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (status === "in-progress")
    return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={color} fillOpacity=".15"/><circle cx="7" cy="7" r="2.5" fill={color} style={{ animation: "cp-pulse 1.8s ease infinite" }}/></svg>;
  if (status === "review")
    return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={color} fillOpacity=".15"/><circle cx="7" cy="7" r="3" stroke={color} strokeWidth="1.3" fill="none"/><path d="M7 5.5V7l1 1" stroke={color} strokeWidth="1.3" strokeLinecap="round"/></svg>;
  if (status === "on-hold")
    return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={color} fillOpacity=".15"/><path d="M5.5 4.5v5M8.5 4.5v5" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></svg>;
  return <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" fill={color} fillOpacity=".15"/><circle cx="7" cy="7" r="2" fill={color} fillOpacity=".5"/></svg>;
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

// ─── ZynHive Logo (links to home) ─────────────────────────────────────────────
// Logo has white text — on light theme we wrap it in a dark pill so it stays readable.
function ZynLogo({ height = 36, isDark = true }: { height?: number; isDark?: boolean }) {
  return (
    <a
      href="/"
      className="cp-logo-link"
      aria-label="ZynHive — go to homepage"
      style={!isDark ? {
        background: "rgba(8,11,20,.82)",
        borderRadius: 10,
        padding: "4px 10px 4px 6px",
        backdropFilter: "blur(8px)",
      } : {}}
    >
      <img
        src="/logo.png"
        alt="ZynHive"
        style={{ height, width: "auto", objectFit: "contain", display: "block" }}
      />
    </a>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({
  clientId, onAuth, isDark, onToggleTheme,
}: {
  clientId: string;
  onAuth: (c: FirestoreClient) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}) {
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [checking, setChecking] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchClientById(clientId)
      .then((c) => { if (!c) setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setChecking(false));
  }, [clientId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError("");
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
        <p style={{ fontSize: 14, color: "var(--cp-text-muted)", maxWidth: 280, lineHeight: 1.6 }}>This client portal link is invalid or has been removed. Please contact your project manager.</p>
      </div>
    );
  }

  return (
    <div className="cp-dots-bg" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: "24px 16px", position: "relative" }}>

      {/* Theme toggle — top right */}
      <div style={{ position: "fixed", top: 16, right: 20, zIndex: 100 }}>
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
      </div>

      {/* Glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, var(--cp-glow-color) 0%, transparent 70%)`, pointerEvents: "none", animation: "cp-glow 4s ease infinite" }}/>

      <div className="cp-fade-up" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

        {/* Logo — links to home */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <ZynLogo height={52} isDark={isDark} />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--cp-text-h)", letterSpacing: "-0.5px", marginBottom: 8 }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: 14, color: "var(--cp-text-muted)", lineHeight: 1.6 }}>
            Sign in to your client portal to view<br/>your project updates and progress.
          </p>
        </div>

        {/* Card */}
        <div className="cp-glass" style={{ borderRadius: 20, padding: 32, boxShadow: "var(--cp-shadow)" }}>

          {/* Features */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { icon: "📊", text: "Live Updates" },
              { icon: "📈", text: "Progress Tracking" },
              { icon: "🔒", text: "Secure Access" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "var(--cp-bg-badge)", border: "1px solid var(--cp-border)", fontSize: 11, color: "var(--cp-text-muted)" }}>
                <span style={{ fontSize: 11 }}>{icon}</span>{text}
              </div>
            ))}
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--cp-text-dim)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                Portal Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  autoFocus
                  className="cp-input"
                  style={{
                    width: "100%", padding: "12px 44px 12px 16px",
                    borderRadius: 12, fontSize: 14, fontFamily: "inherit",
                    border: `1.5px solid ${error ? "rgba(239,68,68,.5)" : "var(--cp-border)"}`,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--cp-text-dim)", padding: 4 }}
                >
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

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="cp-btn-primary"
              style={{
                width: "100%", padding: "13px 0", borderRadius: 12, border: "none",
                background: loading || !password.trim()
                  ? "rgba(99,102,241,.2)"
                  : "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",
                color: loading || !password.trim() ? "#4C5580" : "white",
                fontSize: 14, fontWeight: 600,
                cursor: loading || !password.trim() ? "default" : "pointer",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,.2)", borderTopColor: "white", animation: "cp-spin .8s linear infinite", display: "inline-block" }}/>
                  Verifying…
                </span>
              ) : "Access My Portal →"}
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
function PortalNav({
  client, isDark, onToggleTheme, onLogout,
}: {
  client: FirestoreClient;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  return (
    <nav className="cp-nav">
      <div className="cp-nav-inner" style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", gap: 12 }}>

        {/* Logo — links to home */}
        <ZynLogo isDark={isDark} />

        <div style={{ width: 1, height: 18, background: "var(--cp-border-div)" }} className="cp-hide-mobile"/>
        <span className="cp-hide-mobile" style={{ fontSize: 12, color: "var(--cp-text-dim)" }}>Client Portal</span>

        {/* Spacer */}
        <div style={{ flex: 1 }}/>

        {/* Theme toggle */}
        <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

        <div style={{ width: 1, height: 18, background: "var(--cp-border-div)" }}/>

        {/* Client info */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ textAlign: "right" }} className="cp-hide-mobile">
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cp-text-body)" }}>{client.name}</div>
            {client.company && <div style={{ fontSize: 10, color: "var(--cp-text-dim)" }}>{client.company}</div>}
          </div>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, rgba(99,102,241,.3), rgba(129,140,248,.15))", border: "1px solid rgba(99,102,241,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#818CF8", flexShrink: 0 }}>
            {initials(client.name)}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          title="Sign out"
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--cp-border)", background: "transparent", color: "var(--cp-text-dim)", cursor: "pointer", fontSize: 11, transition: "all .15s" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "rgba(239,68,68,.35)"; el.style.color = "#EF4444"; el.style.background = "rgba(239,68,68,.07)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--cp-border)"; el.style.color = "var(--cp-text-dim)"; el.style.background = "transparent"; }}
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9.5 4.5L12 7l-2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          <span className="cp-hide-mobile">Sign out</span>
        </button>
      </div>
    </nav>
  );
}

// ─── Updates View ─────────────────────────────────────────────────────────────
function UpdatesView({
  client, isDark, onToggleTheme, onLogout,
}: {
  client: FirestoreClient;
  isDark: boolean;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  const [updates, setUpdates] = useState<FirestoreClientUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientUpdates(client.id!).then(setUpdates).catch(() => {}).finally(() => setLoading(false));
  }, [client.id]);

  const latest    = updates[0];
  const pct       = latest?.completionPercent ?? 0;
  const completed = updates.filter((u) => u.status === "completed").length;
  const active    = updates.filter((u) => u.status === "in-progress" || u.status === "review").length;

  const statCfg = latest ? STATUS_CONFIG[latest.status] : null;

  return (
    <div className="cp-fade-in" style={{ minHeight: "100vh" }}>
      <PortalNav client={client} isDark={isDark} onToggleTheme={onToggleTheme} onLogout={onLogout} />

      {/* Hero */}
      <div className="cp-hero cp-hero-inner" style={{ padding: "32px 24px 28px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>

          <div className="cp-fade-up" style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
            {/* Avatar */}
            <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, rgba(99,102,241,.25), rgba(129,140,248,.1))", border: "1px solid rgba(99,102,241,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#818CF8", flexShrink: 0 }}>
              {initials(client.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--cp-text-h)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>
                  {client.projectName || "Your Project"}
                </h1>
                {statCfg && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: statCfg.bg, color: statCfg.color, border: `1px solid ${statCfg.border}`, letterSpacing: "0.03em" }}>
                    {statCfg.label}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: "var(--cp-text-muted)", lineHeight: 1.5 }}>
                Hi {client.name.split(" ")[0]}! 👋 &nbsp;Here's a real-time view of your project progress.
                {client.company && <span style={{ color: "var(--cp-text-dim)" }}> · {client.company}</span>}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="cp-fade-up cp-card-1" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            {[
              { label: "Total Updates",  value: updates.length,  color: "#818CF8", icon: "📋" },
              { label: "Completed",      value: completed,        color: "#10B981", icon: "✅" },
              { label: "In Progress",    value: active,           color: "#F59E0B", icon: "⚡" },
            ].map(({ label, value, color, icon }) => (
              <div key={label} className="cp-stat-card">
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{value}</span>
                <span style={{ fontSize: 11, color: "var(--cp-text-muted)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {updates.length > 0 && (
            <div className="cp-fade-up cp-card-2">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--cp-text-muted)", fontWeight: 500 }}>Overall Project Progress</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#818CF8", fontFamily: "monospace" }}>{pct}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: "var(--cp-border)", overflow: "hidden", position: "relative" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: "linear-gradient(90deg, #6366F1, #818CF8, #A5B4FC)", transition: "width 1s cubic-bezier(.16,1,.3,1)", boxShadow: "0 0 12px rgba(99,102,241,.4)" }}/>
              </div>
              {latest && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <StatusIcon status={latest.status} color={statCfg!.color} />
                  <span style={{ fontSize: 11, color: "var(--cp-text-muted)" }}>Latest: <strong style={{ color: "var(--cp-text-body)", fontWeight: 600 }}>{latest.title}</strong></span>
                  {latest.createdAt && <span style={{ fontSize: 10, color: "var(--cp-text-dim)", marginLeft: "auto" }}>{formatDate(latest.createdAt)}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Updates list */}
      <div className="cp-content" style={{ maxWidth: 800, margin: "0 auto", padding: "24px 24px 64px" }}>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, gap: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "2px solid rgba(99,102,241,.15)", borderTopColor: "#6366F1", animation: "cp-spin .9s linear infinite" }}/>
            <span style={{ fontSize: 12, color: "var(--cp-text-dim)", fontWeight: 500 }}>Loading your updates…</span>
          </div>
        ) : updates.length === 0 ? (
          <div className="cp-fade-up" style={{ textAlign: "center", paddingTop: 64 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(99,102,241,.08)", border: "1px solid rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px" }}>🚀</div>
            <p style={{ fontSize: 17, fontWeight: 700, color: "var(--cp-text-h)", marginBottom: 8 }}>Work in progress!</p>
            <p style={{ fontSize: 13, color: "var(--cp-text-muted)", lineHeight: 1.65, maxWidth: 300, margin: "0 auto" }}>
              Your project has been kicked off. Updates will appear here as milestones are completed.
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 13, fontWeight: 600, color: "var(--cp-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Project Updates
              </h2>
              <span style={{ fontSize: 11, color: "var(--cp-text-dim)" }}>{updates.length} total</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {updates.map((u, i) => {
                const cfg   = STATUS_CONFIG[u.status];
                const isNew = i === 0;
                return (
                  <div
                    key={u.id}
                    className={`cp-update-card cp-card-base cp-fade-up cp-card-${Math.min(i + 1, 6)}${isNew ? " is-new" : ""}`}
                  >
                    {/* Top color strip */}
                    <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}55)` }}/>

                    <div style={{ padding: "16px 20px" }}>
                      {/* Header row */}
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: u.description ? 10 : 0 }}>
                        {/* Status icon */}
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                          <StatusIcon status={u.status} color={cfg.color} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          {/* Title + badges */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cp-text-h)", lineHeight: 1.3 }}>{u.title}</span>
                            {isNew && (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: "rgba(99,102,241,.15)", color: "#818CF8", border: "1px solid rgba(99,102,241,.25)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                Latest
                              </span>
                            )}
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                              {cfg.label}
                            </span>
                          </div>

                          {/* Phase + date */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            {u.phase && (
                              <span style={{ fontSize: 11, color: "var(--cp-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                                <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                {u.phase}
                              </span>
                            )}
                            {u.createdAt && (
                              <span style={{ fontSize: 10, color: "var(--cp-text-dim)", marginLeft: "auto" }}>
                                {formatDateShort(u.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {u.description && (
                        <p style={{ fontSize: 13, color: "var(--cp-text-muted)", lineHeight: 1.7, marginBottom: 12, paddingLeft: 44 }}>
                          {u.description}
                        </p>
                      )}

                      {/* Attachment image */}
                      {u.imageUrl && (
                        <div style={{ paddingLeft: 44, marginBottom: 12 }}>
                          <img
                            src={u.imageUrl}
                            alt="update attachment"
                            style={{
                              width: "100%", borderRadius: 10, display: "block",
                              border: `1px solid ${cfg.border}`,
                              maxHeight: 320, objectFit: "cover",
                            }}
                          />
                        </div>
                      )}

                      {/* Progress bar */}
                      <div style={{ paddingLeft: 44, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 99, background: "var(--cp-border)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${u.completionPercent}%`, borderRadius: 99, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`, transition: "width .8s ease" }}/>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, fontFamily: "monospace", minWidth: 34, textAlign: "right" }}>
                          {u.completionPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="cp-footer" style={{ padding: "20px 24px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg, #6366F1, #818CF8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 8, fontWeight: 800, color: "white" }}>ZH</span>
          </div>
          <span style={{ fontSize: 11, color: "var(--cp-text-dim)" }}>Powered by <strong style={{ color: "var(--cp-text-muted)" }}>ZynHive</strong> · Your Digital Growth Partner</span>
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
    setIsDark((d) => {
      saveTheme(!d);
      return !d;
    });
  }

  useEffect(() => {
    const stored = sessionStorage.getItem(`client-auth-${clientId}`);
    if (stored === "1" && clientId) {
      fetchClientById(clientId)
        .then((c) => { if (c) setAuthedClient(c); })
        .catch(() => {})
        .finally(() => setChecking(false));
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
          <UpdatesView
            client={authedClient}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
          />
        ) : (
          <LoginScreen
            clientId={clientId}
            onAuth={setAuthedClient}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        )}
      </div>
    </>
  );
}
