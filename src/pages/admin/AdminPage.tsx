// ─── src/pages/admin/AdminPage.tsx ──────────────────────────────────────────
import { useAuth }          from "../../hooks/useAuth";
import { AdminLogin }       from "./AdminLogin";
import { AdminDashboard }   from "./AdminDashboard";

export function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[var(--accent)]/20 animate-ping" />
            <div className="absolute inset-1 rounded-full border-2 border-[var(--accent)]/50 animate-spin"
              style={{ animationDuration: "1.2s" }} />
          </div>
          <p className="font-mono text-[11px] text-[var(--ink4)] tracking-[0.2em] uppercase">
            Authenticating…
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin onSuccess={() => {}} />;
  }

  return <AdminDashboard user={user} />;
}