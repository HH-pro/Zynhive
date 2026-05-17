// ─── src/pages/admin/AdminLogin.tsx ─────────────────────────────────────────
import { useState, useEffect, useRef, type FormEvent } from "react";
import { adminLogin } from "../../lib/firebase";

interface Props { onSuccess: () => void; }

const MAX_ATTEMPTS  = 5;
const WARN_AT       = 3;
const LOCKOUT_SECS  = 30;

export function AdminLogin({ onSuccess }: Props) {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [showPw,       setShowPw]       = useState(false);
  const [failedCount,  setFailedCount]  = useState(0);
  const [lockedUntil,  setLockedUntil]  = useState<number | null>(null);
  const [countdown,    setCountdown]    = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // countdown ticker
  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        setError("");
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setCountdown(remaining);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockedUntil]);

  const isLocked    = !!lockedUntil && Date.now() < lockedUntil;
  const remaining   = MAX_ATTEMPTS - failedCount;
  const showWarning = failedCount >= WARN_AT && !isLocked;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLocked) return;
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      setFailedCount(0);
      setLockedUntil(null);
      onSuccess();
    } catch {
      const next = failedCount + 1;
      setFailedCount(next);
      if (next >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECS * 1000;
        setLockedUntil(until);
        setError(`Too many failed attempts. Try again in ${LOCKOUT_SECS}s.`);
      } else {
        setError(`Invalid credentials. ${MAX_ATTEMPTS - next} attempt${MAX_ATTEMPTS - next !== 1 ? "s" : ""} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}>

      {/* Grid bg */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(124,58,237,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,0.05) 1px,transparent 1px)",
        backgroundSize: "56px 56px",
      }}/>

      {/* Ambient glow orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(124,58,237,0.12) 0%,transparent 65%)" }}/>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(79,70,229,0.08) 0%,transparent 65%)" }}/>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11">
              <div className="absolute inset-0 rounded-xl"
                style={{ background: "var(--grad-accent)", boxShadow: "var(--glow-accent)" }}/>
              <div className="absolute inset-[2px] rounded-[10px]" style={{ background: "var(--bg-base)" }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-[11px]" style={{ background: "var(--grad-accent)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ZH</span>
              </div>
            </div>
            <span className="font-display font-bold text-xl tracking-tight" style={{ color: "var(--ink)" }}>
              ZynHive<span className="grad-text">.</span>
            </span>
          </div>
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase" style={{ color: "var(--ink4)" }}>Admin Portal · Restricted</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 glass-card" style={{
          boxShadow: "0 0 0 1px var(--border),0 32px 80px rgba(0,0,0,0.4),0 0 80px rgba(124,58,237,0.05)",
        }}>
          <h1 className="font-display text-[22px] font-bold mb-1 tracking-tight" style={{ color: "var(--ink)" }}>Welcome back</h1>
          <p className="text-[13px] mb-6 font-body" style={{ color: "var(--ink4)" }}>Sign in to manage your portfolio</p>

          {/* Lockout Banner */}
          {isLocked && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-[13px] font-medium" style={{
              background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", color: "var(--red)",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span>Account locked · Retry in <strong>{countdown}s</strong></span>
            </div>
          )}

          {/* Warning Banner */}
          {showWarning && !isLocked && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-[13px]" style={{
              background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.25)", color: "var(--gold)",
            }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1L14 13H1L7.5 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M7.5 6v3M7.5 11h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span><strong>{remaining}</strong> attempt{remaining !== 1 ? "s" : ""} remaining before lockout</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--ink3)" }}>Email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="var(--ink4)" strokeWidth="1"/>
                    <path d="M1 5l6 4 6-4" stroke="var(--ink4)" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zynhive.com" required disabled={isLocked}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[14px] outline-none transition-all duration-200 border"
                  style={{ background: "var(--bg-alt)", color: "var(--ink)", borderColor: "var(--border2)", opacity: isLocked ? 0.5 : 1 }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px var(--accent-pale)"; }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--ink3)" }}>Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="3" y="6" width="8" height="7" rx="1" stroke="var(--ink4)" strokeWidth="1"/>
                    <path d="M5 6V4.5a2 2 0 014 0V6" stroke="var(--ink4)" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required disabled={isLocked}
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-[14px] outline-none transition-all duration-200 border"
                  style={{ background: "var(--bg-alt)", color: "var(--ink)", borderColor: "var(--border2)", opacity: isLocked ? 0.5 : 1 }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px var(--accent-pale)"; }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} disabled={isLocked}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--ink4)", cursor: "pointer", background: "none", border: "none", padding: 0 }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
                  {showPw ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M5.5 4.5A5 5 0 0112 7a5.5 5.5 0 01-1 1.4M2 7a5 5 0 014.5-4.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" strokeWidth="1"/><circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error (non-lockout) */}
            {error && !isLocked && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px]"
                style={{ background: "rgba(248,113,113,0.07)", borderColor: "rgba(248,113,113,0.2)", color: "var(--red)" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || isLocked}
              className="relative w-full py-3 rounded-xl text-sm font-semibold text-white mt-2 disabled:cursor-not-allowed"
              style={{
                background: isLocked ? "var(--bg-alt)" : "var(--grad-accent)",
                color: isLocked ? "var(--ink4)" : "white",
                border: "none", cursor: loading || isLocked ? "not-allowed" : "pointer",
                boxShadow: isLocked ? "none" : "var(--glow-accent)",
                opacity: loading ? 0.8 : 1,
                transition: "opacity .15s, box-shadow .2s",
              }}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 rounded-full" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spinLoader .7s linear infinite" }}/>
                  Signing in…
                </div>
              ) : isLocked ? (
                `Locked · ${countdown}s`
              ) : "Sign In →"}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] mt-6 font-mono" style={{ color: "var(--ink4)" }}>
          ZynHive Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}
