// ─── src/components/admin/TeamTab.tsx ───────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  fetchMembers, deleteMember, updateMember, type FirestoreMember,
} from "../../lib/firebase";
import { TeamMemberForm } from "./TeamMemberForm";

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
  member, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  member:     FirestoreMember;
  onEdit:     (m: FirestoreMember) => void;
  onDelete:   (m: FirestoreMember) => void;
  onMoveUp:   (m: FirestoreMember) => void;
  onMoveDown: (m: FirestoreMember) => void;
  isFirst:    boolean;
  isLast:     boolean;
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
        <h3 className="font-display text-[15px] font-bold text-[var(--ink)] leading-snug tracking-tight mb-0.5">
          {member.name}
        </h3>
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

        {/* Order controls */}
        <div className="flex gap-1.5 mt-4 pt-4 border-t border-[var(--border)]">
          <button
            onClick={() => onMoveUp(member)}
            disabled={isFirst}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border2)]
              text-[var(--ink4)] hover:text-[var(--ink)] hover:border-[var(--ink3)]
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ↑ Move Up
          </button>
          <button
            onClick={() => onMoveDown(member)}
            disabled={isLast}
            className="flex-1 py-1.5 rounded-lg text-[10px] font-mono border border-[var(--border2)]
              text-[var(--ink4)] hover:text-[var(--ink)] hover:border-[var(--ink3)]
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ↓ Move Down
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
  const [members,      setMembers]      = useState<FirestoreMember[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [formOpen,     setFormOpen]     = useState(false);
  const [editMember,   setEditMember]   = useState<FirestoreMember | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreMember | null>(null);

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
          { label: "With Socials",    val: members.filter((m) => Object.values(m.socials).some(Boolean)).length },
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
    </div>
  );
}