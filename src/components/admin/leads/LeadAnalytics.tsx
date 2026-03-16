// ─── src/components/admin/leads/LeadAnalytics.tsx ────────────────────────────
// Analytics view: pipeline, status breakdown, source breakdown

import type { Lead } from "../../../types/leads";
import { FOLLOW_UP_SEQUENCE, STATUS_COLORS } from "../../../lib/lead-constants";

interface Props {
  leads: Lead[];
  stats: {
    total: number;
    totalEmailsSent: number;
    dueFollowUps: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  };
}

export function LeadAnalytics({ leads, stats }: Props) {
  const allStatuses = [
    { key: "new", label: "New" },
    ...FOLLOW_UP_SEQUENCE.map((s) => ({ key: s.key, label: s.label })),
    { key: "completed", label: "Completed" },
    { key: "not-interested", label: "Not Interested" },
  ];

  const maxSource = Math.max(...Object.values(stats.bySource), 1);

  // Calculate email velocity (emails per day over last 7 days)
  const last7 = leads.flatMap((l) =>
    l.mailHistory.filter((m) => {
      const d = new Date(m.date);
      const now = new Date();
      return (now.getTime() - d.getTime()) < 7 * 86_400_000;
    }),
  ).length;
  const velocity = (last7 / 7).toFixed(1);

  // No chatbot percentage
  const noChatbot = leads.filter((l) => !l.hasChatbot).length;
  const noChatbotPct = leads.length > 0 ? Math.round((noChatbot / leads.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat label="Total Leads" value={stats.total} color="var(--accent)" icon="👥" />
        <MiniStat label="Emails Sent" value={stats.totalEmailsSent} color="var(--cyan)" icon="📧" />
        <MiniStat label="Due Follow-ups" value={stats.dueFollowUps} color="#f59e0b" icon="⏰" />
        <MiniStat label="Emails/Day (7d)" value={velocity} color="#7B5CFA" icon="📈" />
      </div>

      {/* Pipeline */}
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
      >
        <h3 className="font-display text-[15px] font-bold mb-5" style={{ color: "var(--ink)" }}>
          Email Pipeline
        </h3>

        {/* Bar visualization */}
        <div className="flex gap-1 h-10 rounded-xl overflow-hidden mb-4">
          {allStatuses.map(({ key, label }) => {
            const count = stats.byStatus[key] || 0;
            if (count === 0) return null;
            const pct = Math.max((count / stats.total) * 100, 5);
            const sc = STATUS_COLORS[key as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.new;
            return (
              <div
                key={key}
                className="flex items-center justify-center rounded-lg transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: sc.bg,
                  border: `1px solid ${sc.border}`,
                  color: sc.text,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
                title={`${label}: ${count}`}
              >
                {count}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {allStatuses.map(({ key, label }) => {
            const count = stats.byStatus[key] || 0;
            if (count === 0) return null;
            const sc = STATUS_COLORS[key as keyof typeof STATUS_COLORS] ?? STATUS_COLORS.new;
            return (
              <div key={key} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded" style={{ background: sc.text }} />
                <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                  {label}
                </span>
                <span className="font-mono text-[10px] font-bold" style={{ color: sc.text }}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Source breakdown */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
        >
          <h3 className="font-display text-[15px] font-bold mb-5" style={{ color: "var(--ink)" }}>
            Lead Sources
          </h3>
          <div className="flex flex-col gap-4">
            {Object.entries(stats.bySource)
              .sort(([, a], [, b]) => b - a)
              .map(([src, cnt]) => {
                const pct = Math.round((cnt / maxSource) * 100);
                return (
                  <div key={src}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>
                        {src}
                      </span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: "var(--accent)" }}>
                        {cnt}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, var(--accent), var(--cyan))",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Issue breakdown */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
        >
          <h3 className="font-display text-[15px] font-bold mb-5" style={{ color: "var(--ink)" }}>
            Website Issues Found
          </h3>
          <div className="flex flex-col gap-4">
            <IssueBar
              label="No Chatbot"
              count={noChatbot}
              total={leads.length}
              color="#ef4444"
            />
            <IssueBar
              label="No Quick Response"
              count={leads.filter((l) => !l.hasQuickResponse).length}
              total={leads.length}
              color="#f59e0b"
            />
            <IssueBar
              label="No Lead Form"
              count={leads.filter((l) => !l.hasLeadForm).length}
              total={leads.length}
              color="#7B5CFA"
            />
            <IssueBar
              label="Not Mobile Optimized"
              count={leads.filter((l) => !l.hasMobileOptimized).length}
              total={leads.length}
              color="#3B6EF8"
            />
          </div>

          <div
            className="mt-5 p-3 rounded-xl"
            style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}
          >
            <p className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
              🤖 <strong style={{ color: "var(--ink3)" }}>{noChatbotPct}%</strong> of leads have no chatbot — 
              this is your biggest selling point for outreach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function MiniStat({ label, value, color, icon }: {
  label: string; value: string | number; color: string; icon: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}10, transparent 55%)` }}
      />
      <div className="flex items-center justify-between relative z-10 mb-2">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold"
          style={{ color: "var(--ink4)" }}>
          {label}
        </span>
        <span className="text-base">{icon}</span>
      </div>
      <div
        className="font-display text-[28px] font-bold leading-none tracking-tight relative z-10"
        style={{
          background: `linear-gradient(135deg, ${color}, ${color}aa)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function IssueBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>{label}</span>
        <span className="font-mono text-[11px] font-bold" style={{ color }}>
          {count}/{total} ({pct}%)
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        />
      </div>
    </div>
  );
}
