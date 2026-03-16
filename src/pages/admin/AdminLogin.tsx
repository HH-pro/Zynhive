// ─── src/pages/admin/AdminLogin.tsx ─────────────────────────────────────────
import { useState, type FormEvent } from "react";
import { adminLogin }               from "../../lib/firebase";

interface Props { onSuccess: () => void; }

export function AdminLogin({ onSuccess }: Props) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await adminLogin(email, password);
      onSuccess();
    } catch {
      setError("Invalid credentials. Check email & password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(59,110,248,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,110,248,0.04) 1px,transparent 1px)",
          backgroundSize: "56px 56px",
        }} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(59,110,248,0.09) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full max-w-[400px]">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-xl rotate-45"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }} />
              <div className="absolute inset-[3px] rounded-lg rotate-45"
                style={{ background: "var(--bg-base)" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-bold text-[11px]" style={{ color: "var(--accent)" }}>ZH</span>
              </div>
            </div>
            <span className="font-display font-bold text-xl text-[var(--ink)] tracking-tight">
              ZynHive<span style={{ color: "var(--accent)" }}>.</span>
            </span>
          </div>
          <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-[var(--ink4)]">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border border-[var(--border)] p-8"
          style={{
            background: "var(--bg-panel)",
            boxShadow: "0 0 0 1px var(--border), 0 24px 80px rgba(0,0,0,0.2)",
          }}
        >
          <h1 className="font-display text-[22px] font-bold text-[var(--ink)] mb-1 tracking-tight">
            Welcome back
          </h1>
          <p className="text-[13px] text-[var(--ink4)] mb-8 font-body">
            Sign in to manage your portfolio
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink3)]">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="var(--ink4)" strokeWidth="1"/>
                    <path d="M1 5l6 4 6-4" stroke="var(--ink4)" strokeWidth="1" strokeLinejoin="round"/>
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@zynhive.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[14px] text-[var(--ink)]
                    placeholder:text-[var(--ink4)] outline-none transition-all duration-200
                    border border-[var(--border2)] focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-surface)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink3)]">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="3" y="6" width="8" height="7" rx="1" stroke="var(--ink4)" strokeWidth="1"/>
                    <path d="M5 6V4.5a2 2 0 014 0V6" stroke="var(--ink4)" strokeWidth="1" strokeLinecap="round"/>
                  </svg>
                </div>
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl text-[14px] text-[var(--ink)]
                    placeholder:text-[var(--ink4)] outline-none transition-all duration-200
                    border border-[var(--border2)] focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-surface)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink4)] hover:text-[var(--ink3)] transition-colors"
                >
                  {showPw ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M5.5 4.5A5 5 0 0112 7a5.5 5.5 0 01-1 1.4M2 7a5 5 0 014.5-4.9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M1 7s2.5-4.5 6-4.5S13 7 13 7s-2.5 4.5-6 4.5S1 7 1 7z" stroke="currentColor" strokeWidth="1"/>
                      <circle cx="7" cy="7" r="1.5" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px]"
                style={{
                  background: "rgba(255,80,80,0.08)",
                  border: "1px solid rgba(255,80,80,0.2)",
                  color: "#FF6B6B",
                }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
                  <path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-3 rounded-xl text-sm font-semibold text-white
                transition-all duration-300 overflow-hidden mt-2
                disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </div>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-[var(--ink4)] mt-6 font-mono">
          ZynHive Admin · Restricted Access
        </p>
      </div>
    </div>
  );
}