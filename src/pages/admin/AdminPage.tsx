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
        style={{ background: "var(--bg)" }}
      >
        <div className="flex flex-col items-center gap-4">
          {/* Layered spinner */}
          <div className="relative w-12 h-12">
            <div
              className="absolute inset-0 rounded-full border-2 animate-ping"
              style={{ borderColor: "rgba(59,130,246,0.2)" }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: "var(--border2)",
                borderTopColor: "#3B82F6",
                animationDuration: "1s",
              }}
            />
            <div
              className="absolute inset-2 rounded-full border-2 border-b-transparent animate-spin"
              style={{
                borderColor: "transparent",
                borderBottomColor: "#06B6D4",
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
          </div>
          <p
            className="font-mono text-[11px] tracking-[0.2em] uppercase"
            style={{ color: "var(--ink4)" }}
          >
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