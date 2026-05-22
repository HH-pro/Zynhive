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
    <div className="navy-hero-bg min-h-screen flex items-center justify-center px-4 relative">
      <div className="navy-orb navy-orb-a"/>
      <div className="navy-orb navy-orb-b"/>

      <div className="relative z-10 w-full max-w-[440px]"
        style={{ animation: "fadeScaleIn .55s var(--ease) both" }}>

        {/* Logo + tagline */}
        <div className="text-center mb-9">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="relative w-12 h-12 float-3d">
              <div className="absolute inset-0 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #4F7DFF 0%, #22B8D4 100%)",
                  boxShadow: "0 8px 28px rgba(79,125,255,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
                }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-extrabold text-[15px] tracking-tight"
                  style={{ color: "#fff", textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
                  ZH
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{
                  background: "#10B981",
                  border: "2px solid #060B22",
                  boxShadow: "0 0 8px rgba(16,185,129,0.6)",
                }}/>
            </div>
            <span className="font-display font-bold text-[22px] tracking-tight"
              style={{ color: "#EEF2FF" }}>
              ZynHive
            </span>
          </div>
          <p className="font-mono text-[10.5px] tracking-[0.22em] uppercase"
            style={{ color: "rgba(238,242,255,0.50)" }}>
            Admin Portal · Secure Access
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-9 relative"
          style={{
            background: "rgba(16, 25, 55, 0.78)",
            backdropFilter: "blur(20px) saturate(1.6)",
            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            border: "1px solid rgba(190,210,255,0.14)",
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 88px rgba(0,0,0,0.55), 0 0 80px rgba(79,125,255,0.10)",
          }}>

          <h1 className="font-display text-[26px] font-bold mb-1.5 tracking-tight"
            style={{ color: "#EEF2FF", letterSpacing: "-0.03em" }}>
            Welcome back
          </h1>
          <p className="text-[13.5px] mb-7"
            style={{ color: "rgba(238,242,255,0.55)", fontWeight: 300 }}>
            Sign in to your dashboard to manage projects, leads, and your team.
          </p>

          {/* Lockout Banner */}
          {isLocked && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-[13px] font-medium"
              style={{
                background: "rgba(248,113,113,0.10)",
                border: "1px solid rgba(248,113,113,0.30)",
                color: "#F87171",
              }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5.5 7V5.5a2.5 2.5 0 015 0V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span>Account locked · Retry in <strong>{countdown}s</strong></span>
            </div>
          )}

          {/* Warning Banner */}
          {showWarning && !isLocked && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5 text-[13px]"
              style={{
                background: "rgba(251,191,36,0.10)",
                border: "1px solid rgba(251,191,36,0.28)",
                color: "#FBBF24",
              }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M7.5 1L14 13H1L7.5 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                <path d="M7.5 6v3M7.5 11h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span><strong>{remaining}</strong> attempt{remaining !== 1 ? "s" : ""} remaining before lockout</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold"
                style={{ color: "rgba(238,242,255,0.62)" }}>
                Email
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1.5" y="3.5" width="13" height="10" rx="2" stroke="rgba(238,242,255,0.4)" strokeWidth="1.2"/>
                    <path d="M1.5 5.5l6.5 4.5 6.5-4.5" stroke="rgba(238,242,255,0.4)" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zynhive.com" required disabled={isLocked}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-[14.5px] outline-none transition-all duration-200 border"
                  style={{
                    background: "rgba(10,18,48,0.55)",
                    color: "#EEF2FF",
                    borderColor: "rgba(190,210,255,0.16)",
                    opacity: isLocked ? 0.5 : 1,
                    fontWeight: 400,
                  }}
                  onFocus={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.style.borderColor = "#4F7DFF";
                    el.style.boxShadow = "0 0 0 3px rgba(79,125,255,0.25)";
                    el.style.background = "rgba(10,18,48,0.85)";
                  }}
                  onBlur={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.style.borderColor = "rgba(190,210,255,0.16)";
                    el.style.boxShadow = "none";
                    el.style.background = "rgba(10,18,48,0.55)";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold"
                style={{ color: "rgba(238,242,255,0.62)" }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="7" width="10" height="7.5" rx="1.5" stroke="rgba(238,242,255,0.4)" strokeWidth="1.2"/>
                    <path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="rgba(238,242,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required disabled={isLocked}
                  className="w-full pl-11 pr-12 py-3 rounded-xl text-[14.5px] outline-none transition-all duration-200 border"
                  style={{
                    background: "rgba(10,18,48,0.55)",
                    color: "#EEF2FF",
                    borderColor: "rgba(190,210,255,0.16)",
                    opacity: isLocked ? 0.5 : 1,
                    fontWeight: 400,
                  }}
                  onFocus={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.style.borderColor = "#4F7DFF";
                    el.style.boxShadow = "0 0 0 3px rgba(79,125,255,0.25)";
                    el.style.background = "rgba(10,18,48,0.85)";
                  }}
                  onBlur={(e) => {
                    const el = e.target as HTMLInputElement;
                    el.style.borderColor = "rgba(190,210,255,0.16)";
                    el.style.boxShadow = "none";
                    el.style.background = "rgba(10,18,48,0.55)";
                  }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} disabled={isLocked}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{
                    color: "rgba(238,242,255,0.50)",
                    cursor: "pointer", background: "none", border: "none", padding: 0,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4F7DFF"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(238,242,255,0.50)"; }}>
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6 5a5.5 5.5 0 018 3 5.5 5.5 0 01-1.5 2.5M2 8a5.5 5.5 0 015-5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.7-5 7-5 7 5 7 5-2.7 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error (non-lockout) */}
            {error && !isLocked && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px]"
                style={{
                  background: "rgba(248,113,113,0.08)",
                  borderColor: "rgba(248,113,113,0.24)",
                  color: "#F87171",
                }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 4v3.5M7 9.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || isLocked}
              className="relative w-full py-3.5 rounded-xl text-[14.5px] font-semibold mt-2 disabled:cursor-not-allowed overflow-hidden"
              style={{
                background: isLocked
                  ? "rgba(190,210,255,0.10)"
                  : "linear-gradient(135deg, #2B4DAF 0%, #4F7DFF 100%)",
                color: isLocked ? "rgba(238,242,255,0.40)" : "#fff",
                border: "none",
                cursor: loading || isLocked ? "not-allowed" : "pointer",
                boxShadow: isLocked
                  ? "none"
                  : "0 10px 32px rgba(79,125,255,0.40), inset 0 1px 0 rgba(255,255,255,0.18)",
                opacity: loading ? 0.85 : 1,
                transition: "transform .18s var(--ease), box-shadow .22s var(--ease), filter .18s",
                letterSpacing: "-0.01em",
              }}
              onMouseEnter={(e) => {
                if (!loading && !isLocked) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translateY(-1.5px)";
                  el.style.boxShadow = "0 16px 40px rgba(79,125,255,0.55), inset 0 1px 0 rgba(255,255,255,0.22)";
                  el.style.filter = "brightness(1.08)";
                }
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = "translateY(0)";
                el.style.boxShadow = isLocked
                  ? "none"
                  : "0 10px 32px rgba(79,125,255,0.40), inset 0 1px 0 rgba(255,255,255,0.18)";
                el.style.filter = "brightness(1)";
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <span className="w-[15px] h-[15px] border-2 rounded-full inline-block"
                    style={{
                      borderColor: "rgba(255,255,255,0.30)",
                      borderTopColor: "#fff",
                      animation: "spinLoader .7s linear infinite",
                    }}/>
                  Signing in…
                </span>
              ) : isLocked ? (
                `Locked · ${countdown}s`
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Divider + helper */}
          <div className="mt-7 pt-6 border-t flex items-center justify-between gap-3"
            style={{ borderColor: "rgba(190,210,255,0.10)" }}>
            <p className="text-[11.5px]" style={{ color: "rgba(238,242,255,0.45)" }}>
              Forgot your password?
            </p>
            <span className="font-mono text-[10px] tracking-[0.10em]"
              style={{ color: "rgba(238,242,255,0.32)" }}>
              Contact your admin
            </span>
          </div>
        </div>

        <p className="text-center text-[11px] mt-6 font-mono tracking-[0.15em]"
          style={{ color: "rgba(238,242,255,0.32)" }}>
          ZynHive Admin · v2 · Restricted Access
        </p>
      </div>
    </div>
  );
}
