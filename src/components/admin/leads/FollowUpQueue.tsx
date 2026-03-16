// ─── src/components/admin/leads/FollowUpQueue.tsx ────────────────────────────
// Shows leads that are due for follow-up with batch actions

import type { FollowUpKey } from "../../../types/leads";
import type { DueFollowUp } from "../../../hooks/useLeads";
import { FOLLOW_UP_SEQUENCE, STATUS_COLORS } from "../../../lib/lead-constants";
import { StatusBadge, EmptyState } from "./LeadAtoms";

interface Props {
  dueFollowUps: DueFollowUp[];
  onSendSingle: (leadId: string, type: FollowUpKey) => void;
  onSendAll: () => void;
  aiLoading: boolean;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function FollowUpQueue({ dueFollowUps, onSendSingle, onSendAll, aiLoading }: Props) {
  if (dueFollowUps.length === 0) {
    return <EmptyState title="All caught up!" subtitle="No follow-ups due right now" />;
  }

  return (
    <div>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="#f59e0b" strokeWidth="1.2" />
              <path d="M7 4v3.5l2 1.5" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-[15px] font-bold" style={{ color: "var(--ink)" }}>
              Due Follow-ups
            </h3>
            <p className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
              {dueFollowUps.length} lead{dueFollowUps.length !== 1 ? "s" : ""} waiting for follow-up
            </p>
          </div>
        </div>

        <button
          onClick={onSendAll}
          disabled={aiLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px]
            font-semibold text-white transition-all duration-150 disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--cyan))",
            cursor: aiLoading ? "wait" : "pointer",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 6l4 2.5V11l2-2.5M1 6L11 1 7.5 11l-2.5-3" stroke="white" strokeWidth="1" fill="none" />
          </svg>
          Send All Follow-ups
        </button>
      </div>

      {/* List */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
      >
        {/* Table header */}
        <div
          className="grid items-center px-5 py-3"
          style={{
            gridTemplateColumns: "1fr 120px 80px 140px 100px",
            background: "var(--bg-alt)",
            borderBottom: "1px solid var(--border2)",
          }}
        >
          {["Lead", "Last Email", "Days Ago", "Next Action", ""].map((h) => (
            <span
              key={h}
              className="font-mono text-[9px] tracking-[0.16em] uppercase"
              style={{ color: "var(--ink4)" }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {dueFollowUps.map(({ lead, nextStep, daysSinceLastEmail }) => {
          const lastMail = lead.mailHistory[lead.mailHistory.length - 1];
          const lastLabel = FOLLOW_UP_SEQUENCE.find((s) => s.key === lastMail.type)?.label || lastMail.type;
          const sc = STATUS_COLORS[nextStep.key] || STATUS_COLORS.new;

          return (
            <div
              key={lead.id}
              className="grid items-center px-5 py-3.5 border-b last:border-0
                transition-colors duration-150"
              style={{
                gridTemplateColumns: "1fr 120px 80px 140px 100px",
                borderColor: "var(--border)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {/* Lead info */}
              <div>
                <div className="font-display text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                  {lead.name}
                </div>
                <div className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                  {lead.email}
                </div>
              </div>

              {/* Last email */}
              <div>
                <div className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>
                  {lastLabel}
                </div>
                <div className="font-mono text-[9px]" style={{ color: "var(--ink4)" }}>
                  {fmtDate(lastMail.date)}
                </div>
              </div>

              {/* Days ago */}
              <span
                className="font-mono text-[12px] font-bold"
                style={{
                  color: daysSinceLastEmail >= 10 ? "#ef4444" : "#f59e0b",
                }}
              >
                {daysSinceLastEmail}d
              </span>

              {/* Next action */}
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
                  font-mono text-[10px] font-bold w-fit"
                style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
              >
                {nextStep.label}
              </span>

              {/* Send button */}
              <button
                onClick={() => onSendSingle(lead.id, nextStep.key)}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px]
                  font-semibold text-white transition-all duration-150 disabled:opacity-50 w-fit ml-auto"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                  cursor: aiLoading ? "wait" : "pointer",
                }}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="1" y="2" width="8" height="6" rx="1" stroke="white" strokeWidth="0.8" fill="none" />
                  <path d="M1 3l4 2.5L9 3" stroke="white" strokeWidth="0.8" fill="none" />
                </svg>
                Send
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
