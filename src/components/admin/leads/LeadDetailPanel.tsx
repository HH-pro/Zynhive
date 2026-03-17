// ─── src/components/admin/leads/LeadDetailPanel.tsx ──────────────────────────
import type { FirestoreLead, FollowUpKey } from "../../../types/leads";
import { FOLLOW_UP_SEQUENCE } from "../../../lib/lead-constants";
import { StatusBadge, IssueTags, SourceBadge } from "./LeadAtoms";

interface Props {
  lead:        FirestoreLead;
  onClose:     () => void;
  onAudit:     (leadId: string) => void;
  onSendEmail: (leadId: string, type: FollowUpKey) => void;
  aiLoading:   boolean;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function LeadDetailPanel({ lead, onClose, onAudit, onSendEmail, aiLoading }: Props) {
  const nextEmailType = getNextEmailType(lead);
  // id is optional on FirestoreLead — fall back to empty string for callbacks
  const leadId = lead.id ?? "";

  return (
    <div className="rounded-2xl p-5 mb-5"
      style={{
        background: "var(--bg-surface)",
        border:     "1px solid var(--border2)",
        animation:  "fadeScaleIn .2s ease both",
      }}>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          {/* companyName replaces old lead.name */}
          <h3 className="font-display text-[18px] font-bold" style={{ color: "var(--ink)" }}>
            {lead.companyName}
          </h3>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <StatusBadge status={lead.status} />
            {/* leadSource replaces old lead.source */}
            <SourceBadge source={lead.leadSource} />
            {/* createdAt replaces old lead.dateAdded (optional → fallback) */}
            {lead.createdAt && (
              <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                Added {fmtDate(lead.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {nextEmailType && (
            <button onClick={() => onSendEmail(leadId, nextEmailType)} disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px]
                font-semibold text-white transition-all duration-150 disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                cursor:     aiLoading ? "wait" : "pointer",
                border:     "none",
              }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="2.5" width="10" height="7" rx="1" stroke="white" strokeWidth="1" fill="none" />
                <path d="M1 3.5l5 3 5-3" stroke="white" strokeWidth="1" fill="none" />
              </svg>
              Send {FOLLOW_UP_SEQUENCE.find((s) => s.key === nextEmailType)?.label}
            </button>
          )}
          {lead.website && (
            <button onClick={() => onAudit(leadId)} disabled={aiLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px]
                font-semibold transition-all duration-150 disabled:opacity-50"
              style={{
                border:     "1px solid var(--border2)",
                color:      "var(--ink3)",
                cursor:     aiLoading ? "wait" : "pointer",
                background: "transparent",
              }}>
              🤖 AI Audit
            </button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}>
            ✕
          </button>
        </div>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <ContactItem icon="✉️" label="Email"   value={lead.email}          />
        <ContactItem icon="📞" label="Phone"   value={lead.phone   || "—"} />
        <ContactItem icon="🌐" label="Website" value={lead.website  || "—"} />
        {/* socialLinks replaces old lead.instagram */}
        <ContactItem icon="🔗" label="Social"  value={lead.socialLinks || "—"} />
      </div>

      {/* Audit / Issues — all nested under auditData (optional) */}
      <div className="mb-5">
        <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-2"
          style={{ color: "var(--ink4)" }}>
          Website Audit
        </h4>
        {lead.auditData ? (
          <>
            <IssueTags
              hasChatbot={lead.auditData.hasChatbot}
              hasQuickResponse={lead.auditData.hasQuickResponse}
              hasLeadForm={lead.auditData.hasLeadForm}
              hasMobileOptimized={lead.auditData.hasMobileOptimized}
            />
            {/* auditData.summary replaces old lead.aiAuditSummary */}
            {lead.auditData.summary && (
              <p className="font-body text-[12px] mt-2 p-3 rounded-xl leading-relaxed"
                style={{ color: "var(--ink3)", background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                🤖 {lead.auditData.summary}
              </p>
            )}
          </>
        ) : (
          <>
            {/* No auditData yet — show stub tags and proposal as notes */}
            <IssueTags hasChatbot={false} hasQuickResponse={false} />
            {lead.proposal && (
              <p className="font-body text-[12px] mt-2" style={{ color: "var(--ink4)" }}>
                {lead.proposal}
              </p>
            )}
          </>
        )}
        {/* notes is an array on FirestoreLead — show most recent */}
        {lead.notes.length > 0 && (
          <p className="font-body text-[12px] mt-2 italic" style={{ color: "var(--ink4)" }}>
            {lead.notes[lead.notes.length - 1].text}
          </p>
        )}
      </div>

      {/* Email Timeline — mailHistory is optional */}
      <div>
        <h4 className="font-mono text-[10px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--ink4)" }}>
          Email Timeline ({(lead.mailHistory ?? []).length} sent)
        </h4>

        {(lead.mailHistory ?? []).length === 0 ? (
          <p className="font-mono text-[11px] py-4" style={{ color: "var(--ink4)" }}>
            No emails sent yet
          </p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px"
              style={{ background: "var(--border2)" }} />
            {(lead.mailHistory ?? []).map((mail, i) => (
              <div key={i} className="relative pb-4 last:pb-0">
                <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    borderColor: "var(--bg-surface)",
                    background:  mail.status === "sent" ? "var(--green)" : "var(--red)",
                  }} />
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-display text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                    {FOLLOW_UP_SEQUENCE.find((s) => s.key === mail.type)?.label ?? mail.type}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                    {fmtDate(mail.date)}
                  </span>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-md uppercase font-bold"
                    style={{
                      color:      mail.status === "sent" ? "var(--green)" : "var(--red)",
                      background: mail.status === "sent" ? "var(--green-pale)" : "var(--red-pale)",
                    }}>
                    {mail.status}
                  </span>
                </div>
                {mail.bodySnapshot && (
                  <details className="mt-1.5">
                    <summary className="font-mono text-[10px] cursor-pointer"
                      style={{ color: "var(--accent)" }}>
                      View email content
                    </summary>
                    <p className="font-body text-[11px] mt-1.5 p-3 rounded-lg leading-relaxed
                        whitespace-pre-wrap max-h-40 overflow-y-auto"
                      style={{ color: "var(--ink3)", background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                      {mail.bodySnapshot}
                    </p>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ContactItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl p-3"
      style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-xs">{icon}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
          {label}
        </span>
      </div>
      <p className="font-mono text-[11px] truncate" style={{ color: "var(--ink)" }}>{value}</p>
    </div>
  );
}

function getNextEmailType(lead: FirestoreLead): FollowUpKey | null {
  // FirestoreLead.status uses different values than the old Lead type
  // "new" / "contacted" → send initial outreach
  if (lead.status === "new" || lead.status === "contacted") return "initial";
  // "qualified" / "proposal" → find next in sequence
  const idx = FOLLOW_UP_SEQUENCE.findIndex((s) => s.key === lead.status);
  if (idx >= 0 && idx < FOLLOW_UP_SEQUENCE.length - 1) {
    return FOLLOW_UP_SEQUENCE[idx + 1].key;
  }
  // "closed" / "lost" → no more emails
  return null;
}