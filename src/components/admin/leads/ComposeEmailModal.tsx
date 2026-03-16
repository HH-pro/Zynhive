// ─── src/components/admin/leads/ComposeEmailModal.tsx ────────────────────────
// Modal to compose & preview AI-generated emails for selected leads

import { useState, useEffect } from "react";
import type { Lead, FollowUpKey } from "../../../types/leads";
import { FOLLOW_UP_SEQUENCE } from "../../../lib/lead-constants";
import { generateEmail } from "../../../lib/lead-ai";

interface Props {
  leads: Lead[];
  onClose: () => void;
  onSend: (leads: Lead[], emailType: FollowUpKey) => Promise<void>;
}

export function ComposeEmailModal({ leads, onClose, onSend }: Props) {
  const [emailType, setEmailType] = useState<FollowUpKey>("initial");
  const [preview, setPreview]     = useState<string>("");
  const [subject, setSubject]     = useState<string>("");
  const [loading, setLoading]     = useState(false);
  const [sending, setSending]     = useState(false);

  // Auto-generate preview for first lead
  useEffect(() => {
    if (leads.length === 0) return;
    let cancelled = false;

    async function gen() {
      setLoading(true);
      try {
        const prev = leads[0].mailHistory
          .filter((m) => m.bodySnapshot)
          .map((m) => m.bodySnapshot!);
        const result = await generateEmail(leads[0], emailType, prev);
        if (!cancelled) {
          setPreview(result.body);
          setSubject(result.subject);
        }
      } catch {
        if (!cancelled) {
          setPreview("(Failed to generate preview — emails will still be personalized per lead)");
          setSubject(`Follow-up for ${leads[0].name}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    gen();
    return () => { cancelled = true; };
  }, [leads, emailType]);

  async function handleSend() {
    setSending(true);
    await onSend(leads, emailType);
    setSending(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[600px] max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border2)",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-[18px] font-bold" style={{ color: "var(--ink)" }}>
              📧 AI Email Composer
            </h2>
            <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>
              Sending to <strong style={{ color: "var(--ink)" }}>{leads.length}</strong> lead{leads.length !== 1 ? "s" : ""}
              {" · "}Each gets a personalized AI-generated email
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: "var(--ink4)", cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {/* Email Type Selector */}
        <div className="mb-5">
          <label className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-2"
            style={{ color: "var(--ink4)" }}>
            Email Type
          </label>
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UP_SEQUENCE.map((step) => (
              <button
                key={step.key}
                onClick={() => setEmailType(step.key)}
                className="px-3 py-2 rounded-xl font-mono text-[11px] font-semibold
                  transition-all duration-150"
                style={{
                  cursor: "pointer",
                  background: emailType === step.key
                    ? "linear-gradient(135deg, var(--accent), var(--cyan))"
                    : "var(--bg-alt)",
                  color: emailType === step.key ? "white" : "var(--ink4)",
                  border: `1px solid ${emailType === step.key ? "transparent" : "var(--border2)"}`,
                }}
              >
                {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipients list */}
        <div className="mb-5">
          <label className="font-mono text-[10px] font-semibold uppercase tracking-widest block mb-2"
            style={{ color: "var(--ink4)" }}>
            Recipients
          </label>
          <div
            className="flex flex-wrap gap-2 p-3 rounded-xl max-h-24 overflow-y-auto"
            style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}
          >
            {leads.map((l) => (
              <span
                key={l.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  font-mono text-[10px]"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border2)",
                  color: "var(--ink3)",
                }}
              >
                <span className="font-semibold" style={{ color: "var(--ink)" }}>{l.name}</span>
                <span style={{ color: "var(--ink4)" }}>{l.email}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-[10px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--ink4)" }}>
              AI Preview (for {leads[0]?.name || "first lead"})
            </label>
            {loading && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"
                  style={{ color: "var(--accent)" }} />
                <span className="font-mono text-[10px]" style={{ color: "var(--accent)" }}>
                  Generating...
                </span>
              </div>
            )}
          </div>

          {/* Subject */}
          <div
            className="px-3 py-2 rounded-t-xl font-mono text-[12px]"
            style={{
              background: "var(--bg-alt)",
              borderTop: "1px solid var(--border2)",
              borderLeft: "1px solid var(--border2)",
              borderRight: "1px solid var(--border2)",
              color: "var(--ink3)",
            }}
          >
            <span style={{ color: "var(--ink4)" }}>Subject:</span>{" "}
            <span style={{ color: "var(--ink)" }}>{loading ? "..." : subject}</span>
          </div>

          {/* Body */}
          <div
            className="p-4 rounded-b-xl font-body text-[12px] leading-relaxed
              whitespace-pre-wrap max-h-48 overflow-y-auto"
            style={{
              background: "var(--bg-alt)",
              border: "1px solid var(--border2)",
              borderTop: "none",
              color: loading ? "var(--ink4)" : "var(--ink3)",
            }}
          >
            {loading ? "✨ AI is crafting a personalized email..." : preview}
          </div>

          <p className="font-mono text-[9px] mt-1.5" style={{ color: "var(--ink4)" }}>
            Each lead gets a unique version personalized with their name, website, and audit data
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px]
              font-semibold text-white transition-all duration-150 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--cyan))",
              cursor: sending ? "wait" : "pointer",
              boxShadow: "0 4px 16px var(--accent-dim)",
            }}
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 6.5l4 2.5V12l2-2.5M1 6.5L12 1 8 12l-3-3" stroke="white" strokeWidth="1" fill="none" strokeLinejoin="round" />
                </svg>
                Send {leads.length} Email{leads.length !== 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
