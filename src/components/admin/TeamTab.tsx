// ─── src/components/admin/TeamTab.tsx ───────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  fetchMembers, deleteMember, updateMember, createMemberMessage,
  type FirestoreMember,
} from "../../lib/firebase";
import { sendMemberMessageEmail } from "../../lib/email";
import { TeamMemberForm } from "./TeamMemberForm";

// ─── Send Message Modal ───────────────────────────────────────────────────────
function SendMessageModal({
  member, onClose, onSent,
}: { member: FirestoreMember; onClose: () => void; onSent: (emailed: boolean) => void }) {
  const [title,  setTitle]  = useState("");
  const [body,   setBody]   = useState("");
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");
  const [alsoEmail, setAlsoEmail] = useState(true);

  const canEmail = !!member.email;

  async function submit() {
    if (!body.trim()) { setErr("Please write a message."); return; }
    if (!member.id)   { setErr("Member id missing.");      return; }
    setSaving(true);
    try {
      await createMemberMessage({
        memberId: member.id,
        title:    title.trim(),
        body:     body.trim(),
        read:     false,
      });

      // Best-effort email — don't block the modal or surface failures since
      // the in-portal message has already been delivered to Firestore.
      let emailed = false;
      if (canEmail && alsoEmail && member.email) {
        try {
          const portalUrl = `${window.location.origin}/member/${member.id}`;
          await sendMemberMessageEmail({
            toEmail:  member.email,
            toName:   member.name,
            title:    title.trim(),
            body:     body.trim(),
            portalUrl,
          });
          emailed = true;
        } catch (mailErr) {
          console.warn("[SendMessageModal] email failed:", mailErr);
        }
      }

      onSent(emailed);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[SendMessageModal] create failed:", e);
      // Firestore's permission-denied error is the most common cause —
      // surface it explicitly so the admin knows to deploy updated rules.
      if (/permission|insufficient|missing/i.test(msg)) {
        setErr("Permission denied. Deploy the updated firestore.rules (member_messages collection).");
      } else {
        setErr(`Failed to send: ${msg}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[460px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-panel)",
          border: "0.5px solid var(--border2)",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2"
              style={{
                borderColor: `${member.color}40`,
                background:  member.imageUrl ? "transparent" : `${member.color}18`,
              }}
            >
              {member.imageUrl ? (
                <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover"/>
              ) : (
                <span className="font-display text-[12px] font-bold" style={{ color: member.color }}>
                  {member.initials}
                </span>
              )}
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>
                Message {member.name.split(" ")[0]}
              </h2>
              <p className="text-[11px] truncate" style={{ color: "var(--ink4)" }}>
                Delivered to their member portal
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--bg-surface)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
              Title <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErr(""); }}
              placeholder="e.g. Heads up — schedule change"
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 10,
                border: "0.5px solid var(--border2)", background: "var(--bg-surface)",
                color: "var(--ink)", fontSize: 13, outline: "none",
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Message *</label>
            <textarea
              value={body}
              onChange={(e) => { setBody(e.target.value); setErr(""); }}
              placeholder="Write your message…"
              rows={5}
              style={{
                width: "100%", padding: "9px 12px", borderRadius: 10,
                border: "0.5px solid var(--border2)", background: "var(--bg-surface)",
                color: "var(--ink)", fontSize: 13, outline: "none",
                resize: "vertical", lineHeight: 1.6,
              }}
            />
          </div>

          {/* Email toggle */}
          <label
            className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer"
            style={{
              background: canEmail
                ? (alsoEmail ? "var(--accent-pale)" : "var(--bg-surface)")
                : "var(--bg-surface)",
              border: `0.5px solid ${canEmail && alsoEmail ? "rgba(99,102,241,0.35)" : "var(--border2)"}`,
              opacity: canEmail ? 1 : 0.7,
            }}
            title={canEmail ? "" : "This member doesn't have an email saved on their portal."}
          >
            <input
              type="checkbox"
              checked={canEmail && alsoEmail}
              disabled={!canEmail}
              onChange={(e) => setAlsoEmail(e.target.checked)}
              style={{ accentColor: "var(--accent)", marginTop: 2, cursor: canEmail ? "pointer" : "not-allowed" }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="text-[12px] font-semibold" style={{ color: "var(--ink2)", margin: 0 }}>
                Also send via email
              </p>
              <p className="text-[11px]" style={{ color: "var(--ink4)", margin: "2px 0 0 0" }}>
                {canEmail
                  ? <>Will email <strong style={{ color: "var(--ink3)" }}>{member.email}</strong></>
                  : "No email on file — they only see this in the portal."}
              </p>
            </div>
          </label>

          {err && (
            <p className="text-[12px] px-3 py-2 rounded-lg"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "0.5px solid rgba(239,68,68,0.25)" }}>
              {err}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-2.5" style={{ borderTop: "0.5px solid var(--border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px]"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{
              background: saving ? "rgba(99,102,241,.5)" : "linear-gradient(135deg, var(--accent), var(--cyan))",
              border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.8 : 1,
            }}>
            {saving ? "Sending…" : "Send Message →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({
  member, onConfirm, onCancel,
}: { member: FirestoreMember; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl border border-[var(--border)] p-7 text-center"
        style={{
          background: "var(--bg-panel)",
          animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11"
              stroke="#FF6B6B" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-display text-[17px] font-bold text-[var(--ink)] mb-2">Remove Member?</h3>
        <p className="text-[13px] text-[var(--ink4)] mb-7 font-body leading-relaxed">
          "<strong className="text-[var(--ink3)]">{member.name}</strong>" will be permanently
          removed. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] border border-[var(--border2)]
              text-[var(--ink3)] hover:border-[var(--ink3)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #FF4444, #FF6B6B)" }}
          >
            Remove →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Member card (grid view) ──────────────────────────────────────────────────
function MemberCard({
  member, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onCopyLink, onSendMessage,
}: {
  member:        FirestoreMember;
  onEdit:        (m: FirestoreMember) => void;
  onDelete:      (m: FirestoreMember) => void;
  onMoveUp:      (m: FirestoreMember) => void;
  onMoveDown:    (m: FirestoreMember) => void;
  isFirst:       boolean;
  isLast:        boolean;
  onCopyLink:    (m: FirestoreMember) => void;
  onSendMessage: (m: FirestoreMember) => void;
}) {
  return (
    <div
      className="group relative rounded-2xl border border-[var(--border)] overflow-hidden
        transition-all duration-300 hover:border-[var(--border2)]"
      style={{ background: "var(--bg-panel)" }}
    >
      {/* Top color band */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${member.color}, ${member.color}66)` }}
      />

      <div className="p-5">
        {/* Avatar + actions row */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden
                border-2 flex-shrink-0"
              style={{
                borderColor: `${member.color}40`,
                background: member.imageUrl ? "transparent" : `${member.color}18`,
              }}
            >
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="font-display text-lg font-bold"
                  style={{ color: member.color }}
                >
                  {member.initials}
                </span>
              )}
            </div>
            {/* Order badge */}
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center
                justify-center font-mono text-[9px] font-bold text-white"
              style={{ background: member.color }}
            >
              {member.order + 1}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => onEdit(member)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink4)]
                hover:text-[var(--accent)] hover:bg-[var(--accent-pale)] transition-all"
              title="Edit"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z"
                  stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => onSendMessage(member)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink4)]
                hover:text-[var(--accent)] hover:bg-[var(--accent-pale)] transition-all"
              title="Send Message"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1 2h9v6H3.5L1 10V2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => onCopyLink(member)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink4)]
                hover:text-[var(--cyan)] hover:bg-[var(--cyan)]/10 transition-all"
              title="Copy Portal Link"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <rect x="1" y="3.5" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                <path d="M4 1h6v6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => onDelete(member)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--ink4)]
                hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="Remove"
            >
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 3h8M4 3V1.5h3V3M3.5 3l.5 6.5M7.5 3l-.5 6.5"
                  stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <h3 className="font-display text-[15px] font-bold text-[var(--ink)] leading-snug tracking-tight">
            {member.name}
          </h3>
          {/* Score badge — green positive, red negative, gray zero */}
          {(() => {
            const score = member.score ?? 0;
            const isPos = score > 0;
            const isNeg = score < 0;
            const color = isPos ? "var(--green)" : isNeg ? "var(--red)" : "var(--ink4)";
            const bg    = isPos ? "var(--green-pale)" : isNeg ? "var(--red-pale)" : "var(--bg-surface)";
            return (
              <div
                title={`Score: ${score} (accept +10 / overdue −10)`}
                className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 flex items-center gap-1"
                style={{ color, background: bg, border: `0.5px solid ${color}33` }}
              >
                <span>★</span>
                <span>{isPos ? `+${score}` : score}</span>
              </div>
            );
          })()}
        </div>
        <p className="font-mono text-[10px] mb-3" style={{ color: member.color }}>
          {member.role}
        </p>
        <p className="text-[12px] text-[var(--ink4)] leading-relaxed font-body line-clamp-2 mb-4">
          {member.bio}
        </p>

        {/* Socials */}
        <div className="flex items-center gap-2">
          {Object.entries(member.socials).filter(([, v]) => v).map(([k]) => (
            <div
              key={k}
              className="w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[8px]
                border border-[var(--border2)]"
              style={{ background: "var(--bg-surface)", color: "var(--ink4)" }}
            >
              {k === "linkedin" ? "in" : k === "github" ? "gh" : k === "twitter" ? "𝕏" : "ig"}
            </div>
          ))}
          {Object.values(member.socials).every((v) => !v) && (
            <span className="font-mono text-[9px] text-[var(--ink4)]">No socials</span>
          )}
        </div>

        {/* Order controls + portal link */}
        <div className="flex gap-1.5 mt-4 pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => onMoveUp(member)}
            disabled={isFirst}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border2)]
              text-[var(--ink4)] hover:text-[var(--ink)] hover:border-[var(--ink3)]
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ↑ Up
          </button>
          <button
            onClick={() => onMoveDown(member)}
            disabled={isLast}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border2)]
              text-[var(--ink4)] hover:text-[var(--ink)] hover:border-[var(--ink3)]
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ↓ Down
          </button>
          <button
            onClick={() => onCopyLink(member)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border2)]
              text-[var(--cyan)] hover:bg-[var(--cyan)]/10 hover:border-[var(--cyan)]
              transition-all"
            title="Copy member portal link"
          >
            🔗 Portal
          </button>
          <button
            onClick={() => onSendMessage(member)}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border2)]
              text-[var(--accent)] hover:bg-[var(--accent-pale)] hover:border-[var(--accent)]
              transition-all"
            title="Send a message to this member's portal"
          >
            ✉ Message
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TeamTab (main) ───────────────────────────────────────────────────────────
interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
}

export function TeamTab({ showToast }: Props) {
  const [members,        setMembers]        = useState<FirestoreMember[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [formOpen,       setFormOpen]       = useState(false);
  const [editMember,     setEditMember]     = useState<FirestoreMember | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<FirestoreMember | null>(null);
  const [messageTarget,  setMessageTarget]  = useState<FirestoreMember | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMembers(await fetchMembers());
    } catch {
      showToast("Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // ── reorder helpers ────────────────────────────────────────────────────
  async function swapOrder(a: FirestoreMember, b: FirestoreMember) {
    if (!a.id || !b.id) return;
    try {
      await Promise.all([
        updateMember(a.id, { order: b.order }),
        updateMember(b.id, { order: a.order }),
      ]);
      await load();
    } catch {
      showToast("Reorder failed", "error");
    }
  }

  function handleMoveUp(m: FirestoreMember) {
    const idx = members.findIndex((x) => x.id === m.id);
    if (idx > 0) swapOrder(members[idx], members[idx - 1]);
  }
  function handleMoveDown(m: FirestoreMember) {
    const idx = members.findIndex((x) => x.id === m.id);
    if (idx < members.length - 1) swapOrder(members[idx], members[idx + 1]);
  }

  function handleCopyLink(m: FirestoreMember) {
    if (!m.id) return;
    const url = `${window.location.origin}/member/${m.id}`;
    navigator.clipboard.writeText(url)
      .then(() => showToast(`Portal link copied for ${m.name}`))
      .catch(() => showToast("Failed to copy link", "error"));
  }

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    try {
      await deleteMember(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      showToast(`"${deleteTarget.name}" removed`);
    } catch {
      showToast("Delete failed", "error");
    }
  }

  const nextOrder = members.length > 0
    ? Math.max(...members.map((m) => m.order)) + 1
    : 0;

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Top row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[15px] font-bold text-[var(--ink)] tracking-tight">
            Team Members
          </h2>
          <p className="font-mono text-[10px] text-[var(--ink4)] mt-0.5">
            {members.length} member{members.length !== 1 ? "s" : ""} · drag to reorder
          </p>
        </div>
        <button
          onClick={() => { setEditMember(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
            text-white transition-all duration-300 hover:opacity-90 active:scale-95"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Add Member
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Members",   val: members.length },
          { label: "With Photos",     val: members.filter((m) => m.imageUrl).length },
          { label: "Top Score",       val: members.length ? Math.max(...members.map((m) => m.score ?? 0)) : 0 },
          { label: "Roles Covered",   val: new Set(members.map((m) => m.role)).size },
        ].map(({ label, val }) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] p-4 text-center"
            style={{ background: "var(--bg-panel)" }}
          >
            <div className="font-display text-2xl font-bold text-gradient-blue leading-none mb-1">{val}</div>
            <div className="font-mono text-[9px] text-[var(--ink4)] tracking-[0.1em] uppercase">{label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 rounded-2xl border border-[var(--border)] animate-pulse"
              style={{ background: "var(--bg-panel)" }}
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 gap-4 rounded-2xl
            border border-dashed border-[var(--border2)]"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--bg-surface)" }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="9" cy="8" r="4" stroke="var(--ink4)" strokeWidth="1.5"/>
              <path d="M2 19c0-4 3-6 7-6s7 2 7 6" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M17 5v6M20 8h-6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="font-display text-[15px] font-bold text-[var(--ink3)] mb-1">
              No team members yet
            </p>
            <p className="text-[12px] text-[var(--ink4)] font-body">
              Add your first team member to get started
            </p>
          </div>
          <button
            onClick={() => { setEditMember(null); setFormOpen(true); }}
            className="px-5 py-2 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
          >
            Add First Member →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m, i) => (
            <MemberCard
              key={m.id}
              member={m}
              onEdit={(mem) => { setEditMember(mem); setFormOpen(true); }}
              onDelete={setDeleteTarget}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={i === 0}
              isLast={i === members.length - 1}
              onCopyLink={handleCopyLink}
              onSendMessage={setMessageTarget}
            />
          ))}
        </div>
      )}

      {/* Tip */}
      {members.length > 0 && (
        <div
          className="flex items-start gap-3 px-4 py-3 rounded-xl border border-[var(--border)]"
          style={{ background: "var(--bg-surface)" }}
        >
          <span className="text-sm mt-0.5">💡</span>
          <p className="text-[12px] text-[var(--ink4)] font-body leading-relaxed">
            Use <strong className="text-[var(--ink3)]">↑ Move Up / ↓ Move Down</strong> to control the
            display order on the public Team page.
            Members with a photo will show their image; others show their initials avatar.
          </p>
        </div>
      )}

      {/* Overlays */}
      {formOpen && (
        <TeamMemberForm
          member={editMember}
          nextOrder={nextOrder}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            load();
            showToast(editMember ? "Member updated!" : "Member added!");
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirm
          member={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {messageTarget && (
        <SendMessageModal
          member={messageTarget}
          onClose={() => setMessageTarget(null)}
          onSent={(emailed) => showToast(
            emailed
              ? `Message sent to ${messageTarget.name} (portal + email)`
              : `Message sent to ${messageTarget.name}`
          )}
        />
      )}
    </div>
  );
}