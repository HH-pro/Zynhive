// ─── src/pages/admin/AdminPage.tsx ──────────────────────────────────────────
import { useAuth }        from "../../hooks/useAuth";
import { AdminLogin }     from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div
              className="absolute inset-0 rounded-full border-2 animate-ping"
              style={{ borderColor: "rgba(59,130,246,0.2)" }}
            />
            <div
              className="absolute inset-1 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "rgba(59,130,246,0.5)", animationDuration: "1.2s" }}
            />
          </div>
          <p className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "var(--ink4)" }}>
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