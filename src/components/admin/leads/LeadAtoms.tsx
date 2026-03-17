// ─── src/components/admin/leads/LeadAtoms.tsx ───────────────────────────────
// LeadStatus and LeadSource are not exported from types/leads.ts.
// We derive them directly from FirestoreLead fields.
import type { FirestoreLead } from "../../../types/leads";
import { STATUS_COLORS, FOLLOW_UP_SEQUENCE } from "../../../lib/lead-constants";

// Derived types — no phantom imports needed
type LeadStatus = FirestoreLead["status"];

// ── Status Badge ──────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: LeadStatus }) {
  const sc = STATUS_COLORS[status] ?? STATUS_COLORS["new"];
  const label =
    FOLLOW_UP_SEQUENCE.find((s) => s.key === status)?.label
    ?? (status.charAt(0).toUpperCase() + status.slice(1));

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
        font-mono text-[10px] font-bold tracking-wide whitespace-nowrap"
      style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.text }} />
      {label}
    </span>
  );
}

// ── Source Badge ──────────────────────────────────────────────────────────────
// LeadSource is just a string in FirestoreLead — no union type exported.

const SOURCE_ICON_MAP: Record<string, string> = {
  "Google Maps": "📍",
  Instagram:     "📸",
  LinkedIn:      "💼",
  Website:       "🌐",
  Manual:        "✏️",
  "AI Search":   "🤖",
};

export function SourceBadge({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px]" style={{ color: "var(--ink3)" }}>
      <span className="text-xs">{SOURCE_ICON_MAP[source] ?? "📌"}</span>
      {source}
    </span>
  );
}

// ── Issue Tags ────────────────────────────────────────────────────────────────

export function IssueTags({
  hasChatbot,
  hasQuickResponse,
  hasLeadForm,
  hasMobileOptimized,
  compact = false,
}: {
  hasChatbot:          boolean;
  hasQuickResponse:    boolean;
  hasLeadForm?:        boolean;
  hasMobileOptimized?: boolean;
  compact?:            boolean;
}) {
  const issues: string[] = [];
  if (!hasChatbot)                                        issues.push("No Chatbot");
  if (!hasQuickResponse)                                  issues.push("Slow Response");
  if (hasLeadForm      !== undefined && !hasLeadForm)     issues.push("No Lead Form");
  if (hasMobileOptimized !== undefined && !hasMobileOptimized) issues.push("Not Mobile Opt.");

  if (issues.length === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold"
        style={{ background: "var(--green-pale)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.2)" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        All Good
      </span>
    );
  }

  if (compact && issues.length > 2) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <IssueTag label={issues[0]} />
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
          style={{ color: "var(--ink4)", background: "var(--bg-alt)" }}>
          +{issues.length - 1}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {issues.map((issue) => <IssueTag key={issue} label={issue} />)}
    </div>
  );
}

function IssueTag({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold whitespace-nowrap"
      style={{ background: "var(--red-pale)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.2)" }}
    >
      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
        <circle cx="4" cy="4" r="3" stroke="currentColor" strokeWidth="0.8" />
        <path d="M4 2.5v2M4 5.5h.005" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}

// ── AI Loading Overlay ────────────────────────────────────────────────────────

export function AiLoadingOverlay({ message }: { message: string }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="flex flex-col items-center gap-4 p-8 rounded-2xl"
        style={{
          background: "var(--bg-surface)",
          border:     "1px solid var(--border2)",
          boxShadow:  "var(--shadow-lg)",
          animation:  "fadeScaleIn .3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)" }} />
          <div className="absolute inset-2 rounded-full flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-[14px] font-semibold" style={{ color: "var(--ink)" }}>AI Processing</p>
          <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>{message}</p>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

export function EmptyState({ title, subtitle, action }: {
  title:    string;
  subtitle: string;
  action?:  { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--ink4)" strokeWidth="1.5" />
          <path d="M8 11h6M11 8v6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="font-display text-[14px] font-semibold" style={{ color: "var(--ink3)" }}>{title}</p>
        <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>{subtitle}</p>
      </div>
      {action && (
        <button onClick={action.onClick}
          className="font-mono text-[11px] px-4 py-2 rounded-xl text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: "pointer", border: "none" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}