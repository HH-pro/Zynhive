// ─── src/components/admin/RoutinesPanel.tsx ──────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchRoutines, createRoutine, updateRoutine, deleteRoutine,
  fetchMembers,
  type FirestoreRoutine, type RoutineItem, type FirestoreMember,
} from "../../lib/firebase";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split("T")[0]; }
function uid() { return Math.random().toString(36).slice(2, 10); }
function fmtDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function totalMin(items: RoutineItem[]) {
  return items.reduce((sum, i) => sum + (i.estimatedMinutes || 0), 0);
}
function fmtMin(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

const IMPACT_CFG = {
  high:   { label: "High",   color: "var(--red)",   bg: "var(--red-pale)"   },
  medium: { label: "Medium", color: "var(--gold)",  bg: "var(--gold-pale)"  },
  low:    { label: "Low",    color: "var(--green)", bg: "var(--green-pale)" },
};

const STATUS_CFG = {
  pending:       { label: "Pending",     color: "var(--ink3)",  bg: "var(--bg-alt)"     },
  "in-progress": { label: "In Progress", color: "var(--gold)",  bg: "var(--gold-pale)"  },
  completed:     { label: "Completed",   color: "var(--green)", bg: "var(--green-pale)" },
};

const inputBase: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: "0.5px solid var(--border2)", background: "var(--bg-alt)",
  color: "var(--ink)", fontSize: 13, outline: "none",
  fontFamily: "'DM Sans', sans-serif", transition: "border-color .2s",
};
function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  (e.target as HTMLElement).style.borderColor = "var(--accent)";
}
function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  (e.target as HTMLElement).style.borderColor = "var(--border2)";
}

// ─── Create / Edit Routine Modal ───────────────────────────────────────────────
function RoutineModal({ routine, members, onClose, onSaved, showToast }: {
  routine: FirestoreRoutine | null;
  members: FirestoreMember[];
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [title,      setTitle]      = useState(routine?.title      ?? "");
  const [timeRange,  setTimeRange]  = useState(routine?.timeRange  ?? "");
  const [date,       setDate]       = useState(routine?.date       ?? todayStr());
  const [memberId,   setMemberId]   = useState(routine?.assignedToId ?? "");
  const [items,      setItems]      = useState<RoutineItem[]>(
    routine?.items ?? [{ id: uid(), title: "", impact: "high", estimatedMinutes: 30, category: "", checked: false, checkedAt: "" }]
  );
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const selectedMember = members.find((m) => m.id === memberId);

  function addItem() {
    setItems((prev) => [...prev, { id: uid(), title: "", impact: "medium", estimatedMinutes: 30, category: "", checked: false, checkedAt: "" }]);
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function updateItem<K extends keyof RoutineItem>(id: string, key: K, val: RoutineItem[K]) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [key]: val } : i));
  }

  async function save() {
    if (!title.trim())   { setErr("Title is required."); return; }
    if (!memberId)       { setErr("Please assign to a team member."); return; }
    if (!date)           { setErr("Please pick a date."); return; }
    if (items.some((i) => !i.title.trim())) { setErr("All items need a title."); return; }
    setSaving(true);
    try {
      const data: Omit<FirestoreRoutine, "id" | "createdAt" | "updatedAt"> = {
        title: title.trim(),
        timeRange: timeRange.trim(),
        date,
        assignedToId:    memberId,
        assignedToName:  selectedMember?.name  ?? "",
        assignedToColor: selectedMember?.color ?? "var(--accent)",
        items,
        status: routine?.status ?? "pending",
        report: routine?.report ?? "",
      };
      if (routine?.id) await updateRoutine(routine.id, data);
      else             await createRoutine(data);
      onSaved(); onClose();
    } catch { setErr("Save failed. Try again."); }
    finally { setSaving(false); }
  }

  const CATEGORIES = ["Content", "Analytics", "On-Page", "Technical SEO", "Social Media", "Outreach", "Design", "Other"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[580px] rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          boxShadow: "0 24px 80px rgba(0,0,0,.45)",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div>
            <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>
              {routine ? "Edit Routine" : "New Daily Routine"}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
              Create a checklist and assign it to a team member
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto" style={{ flex: 1 }}>

          {/* Title + time range row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                Routine Title *
              </label>
              <input value={title} onChange={(e) => { setTitle(e.target.value); setErr(""); }}
                placeholder="e.g. Morning — Content & On-Page"
                style={inputBase} onFocus={focusBorder} onBlur={blurBorder}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                Time Range
              </label>
              <input value={timeRange} onChange={(e) => setTimeRange(e.target.value)}
                placeholder="e.g. 9am–12pm"
                style={inputBase} onFocus={focusBorder} onBlur={blurBorder}/>
            </div>
          </div>

          {/* Date + Member row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Date *</label>
              <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }}
                style={{ ...inputBase, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Assign To *</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                {selectedMember && (
                  <div style={{
                    position: "absolute", left: 10, width: 8, height: 8, borderRadius: "50%",
                    background: selectedMember.color, zIndex: 1, flexShrink: 0,
                  }}/>
                )}
                <select value={memberId} onChange={(e) => { setMemberId(e.target.value); setErr(""); }}
                  style={{ ...inputBase, paddingLeft: selectedMember ? 24 : 12, cursor: "pointer" }}
                  onFocus={focusBorder} onBlur={blurBorder}>
                  <option value="">Select member…</option>
                  {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                Checklist Items ({items.length})
              </label>
              <span className="text-[11px]" style={{ color: "var(--ink4)" }}>
                Total: {fmtMin(totalMin(items))}
              </span>
            </div>

            {items.map((item, idx) => (
              <div key={item.id} className="rounded-xl p-3 flex flex-col gap-2"
                style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)" }}>

                {/* Row 1: number + title + delete */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--bg-card)", color: "var(--ink4)", border: "0.5px solid var(--border2)" }}>
                    {idx + 1}
                  </span>
                  <input value={item.title}
                    onChange={(e) => updateItem(item.id, "title", e.target.value)}
                    placeholder="Task title…"
                    style={{ ...inputBase, flex: 1, background: "var(--bg-card)" }}
                    onFocus={focusBorder} onBlur={blurBorder}/>
                  <button onClick={() => removeItem(item.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "transparent", border: "none", cursor: items.length > 1 ? "pointer" : "default", color: "var(--ink4)", opacity: items.length > 1 ? 1 : 0.3 }}
                    disabled={items.length <= 1}
                    onMouseEnter={(e) => { if (items.length > 1) (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>

                {/* Row 2: impact + time + category */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Impact */}
                  <div className="flex gap-1">
                    {(["high", "medium", "low"] as const).map((imp) => {
                      const cfg = IMPACT_CFG[imp];
                      return (
                        <button key={imp} onClick={() => updateItem(item.id, "impact", imp)}
                          className="px-2 py-1 rounded-md text-[10px] font-bold transition-all"
                          style={{
                            background: item.impact === imp ? cfg.bg : "var(--bg-card)",
                            border: `0.5px solid ${item.impact === imp ? cfg.color : "var(--border2)"}`,
                            color: item.impact === imp ? cfg.color : "var(--ink4)",
                            cursor: "pointer",
                          }}>
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Estimated minutes */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]" style={{ color: "var(--ink4)" }}>⏱</span>
                    <input type="number" min={5} max={480} step={5}
                      value={item.estimatedMinutes}
                      onChange={(e) => updateItem(item.id, "estimatedMinutes", Number(e.target.value))}
                      style={{ ...inputBase, width: 60, textAlign: "center", background: "var(--bg-card)", padding: "5px 6px" }}
                      onFocus={focusBorder} onBlur={blurBorder}/>
                    <span className="text-[10px]" style={{ color: "var(--ink4)" }}>min</span>
                  </div>

                  {/* Category */}
                  <select value={item.category}
                    onChange={(e) => updateItem(item.id, "category", e.target.value)}
                    style={{ ...inputBase, width: "auto", flex: 1, minWidth: 100, padding: "5px 8px", fontSize: 11, cursor: "pointer", background: "var(--bg-card)" }}
                    onFocus={focusBorder} onBlur={blurBorder}>
                    <option value="">Category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            ))}

            <button onClick={addItem}
              className="py-2.5 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                border: "1.5px dashed var(--border2)", background: "transparent",
                color: "var(--ink4)", cursor: "pointer",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--accent)"; el.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border2)"; el.style.color = "var(--ink4)"; }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Add Item
            </button>
          </div>

          {err && (
            <p className="text-[12px] px-3 py-2 rounded-lg"
              style={{ background: "var(--red-pale)", color: "var(--red)", border: "0.5px solid rgba(239,68,68,.2)" }}>
              {err}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-2.5 flex-shrink-0" style={{ borderTop: "0.5px solid var(--border)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white"
            style={{ background: "var(--accent)", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : routine ? "Save Changes" : "Create Routine"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────
function DeleteConfirm({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[360px] rounded-2xl p-7 text-center"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", boxShadow: "var(--shadow-lg)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--red-pale)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-semibold text-[16px] mb-1.5" style={{ color: "var(--ink)" }}>Delete routine?</h3>
        <p className="text-[13px] mb-5" style={{ color: "var(--ink3)" }}>
          "<strong style={{ color: "var(--ink2)" }}>{title}</strong>" will be permanently removed.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-white"
            style={{ background: "var(--red)", border: "none", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Routine Detail / Report Modal (admin view) ────────────────────────────────
function RoutineDetailModal({ routine, onClose }: {
  routine: FirestoreRoutine;
  onClose: () => void;
}) {
  const checkedCount = routine.items.filter((i) => i.checked).length;
  const total        = routine.items.length;
  const pct          = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const sc           = STATUS_CFG[routine.status];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[520px] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", boxShadow: "0 24px 80px rgba(0,0,0,.45)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: routine.assignedToColor || "var(--accent)" }}/>
                <span className="text-[11px]" style={{ color: "var(--ink4)" }}>{routine.assignedToName}</span>
                <span className="text-[11px]" style={{ color: "var(--ink4)" }}>· {fmtDate(routine.date)}</span>
                {routine.timeRange && <span className="text-[11px]" style={{ color: "var(--ink4)" }}>· {routine.timeRange}</span>}
              </div>
              <h2 className="font-semibold text-[15px] leading-snug" style={{ color: "var(--ink)" }}>{routine.title}</h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
              <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: 6, background: "var(--bg-alt)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--accent)", borderRadius: 99, transition: "width .4s ease" }}/>
            </div>
            <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: pct === 100 ? "var(--green)" : "var(--ink3)" }}>
              {checkedCount}/{total}
            </span>
          </div>
        </div>

        {/* Checklist */}
        <div className="px-6 py-4 flex flex-col gap-2 overflow-y-auto" style={{ flex: 1 }}>
          {routine.items.map((item, idx) => {
            const imp = IMPACT_CFG[item.impact];
            return (
              <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: item.checked ? "var(--green-pale)" : "var(--bg-alt)", border: `0.5px solid ${item.checked ? "rgba(34,197,94,.2)" : "var(--border)"}`, opacity: item.checked ? 0.75 : 1 }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: item.checked ? "var(--green)" : "var(--bg-card)", border: `1.5px solid ${item.checked ? "var(--green)" : "var(--border2)"}` }}>
                  {item.checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-semibold" style={{ color: "var(--ink4)" }}>#{idx + 1}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: imp.bg, color: imp.color }}>{imp.label} Impact</span>
                    <span className="text-[10px]" style={{ color: "var(--ink4)" }}>⏱ {fmtMin(item.estimatedMinutes)}</span>
                    {item.category && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full"
                        style={{ background: "var(--bg-card)", color: "var(--ink4)", border: "0.5px solid var(--border2)" }}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px]" style={{ color: "var(--ink)", textDecoration: item.checked ? "line-through" : "none" }}>
                    {item.title}
                  </p>
                  {item.checked && item.checkedAt && (
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--green)" }}>
                      Done at {new Date(item.checkedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Report section */}
        {routine.report && (
          <div className="px-6 pb-5 flex-shrink-0">
            <div className="p-4 rounded-xl"
              style={{ background: "var(--green-pale)", border: "0.5px solid rgba(34,197,94,.2)" }}>
              <p className="text-[11px] font-bold mb-1.5" style={{ color: "var(--green)" }}>Member Report</p>
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--ink3)" }}>{routine.report}</p>
              {routine.reportedAt && (
                <p className="text-[10px] mt-2" style={{ color: "var(--ink4)" }}>
                  Submitted {new Date(routine.reportedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Routine Card ──────────────────────────────────────────────────────────────
function RoutineCard({ routine, onEdit, onDelete, onView }: {
  routine:  FirestoreRoutine;
  onEdit:   (r: FirestoreRoutine) => void;
  onDelete: (r: FirestoreRoutine) => void;
  onView:   (r: FirestoreRoutine) => void;
}) {
  const [hov, setHov] = useState(false);
  const checkedCount = routine.items.filter((i) => i.checked).length;
  const total        = routine.items.length;
  const pct          = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  const sc           = STATUS_CFG[routine.status];
  const mins         = totalMin(routine.items);

  return (
    <div className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--bg-card)", border: `0.5px solid ${hov ? "var(--border2)" : "var(--border)"}`,
        boxShadow: hov ? "0 2px 12px rgba(0,0,0,.06)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>

      {/* Assignee color bar */}
      <div style={{ height: 3, background: routine.assignedToColor || "var(--accent)" }}/>

      <div style={{ padding: "14px 16px" }}>

        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
                style={{ background: `${routine.assignedToColor || "var(--accent)"}22`, color: routine.assignedToColor || "var(--accent)", border: `1px solid ${routine.assignedToColor || "var(--accent)"}33` }}>
                {routine.assignedToName?.[0]?.toUpperCase()}
              </div>
              <span className="text-[11px] font-medium" style={{ color: "var(--ink3)" }}>{routine.assignedToName}</span>
              <span className="text-[10px]" style={{ color: "var(--ink4)" }}>· {fmtDate(routine.date)}</span>
              {routine.timeRange && (
                <span className="text-[10px] px-2 py-0.5 rounded-md"
                  style={{ background: "var(--bg-alt)", color: "var(--ink4)", border: "0.5px solid var(--border)" }}>
                  {routine.timeRange}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-[13.5px] leading-snug" style={{ color: "var(--ink)" }}>
              {routine.title}
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-3">
          <div style={{ flex: 1, height: 5, background: "var(--bg-alt)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "var(--green)" : "var(--accent)", borderRadius: 99, transition: "width .4s ease" }}/>
          </div>
          <span className="text-[11px] font-semibold flex-shrink-0"
            style={{ color: pct === 100 ? "var(--green)" : "var(--ink4)", minWidth: 40, textAlign: "right" }}>
            {checkedCount}/{total}
          </span>
        </div>

        {/* Meta chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-md"
            style={{ background: "var(--bg-alt)", color: "var(--ink4)", border: "0.5px solid var(--border)" }}>
            {total} item{total !== 1 ? "s" : ""}
          </span>
          {mins > 0 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: "var(--bg-alt)", color: "var(--ink4)", border: "0.5px solid var(--border)" }}>
              ⏱ {fmtMin(mins)}
            </span>
          )}
          {routine.report && (
            <span className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: "var(--green-pale)", color: "var(--green)", border: "0.5px solid rgba(34,197,94,.2)" }}>
              ✓ Report submitted
            </span>
          )}

          {/* Actions */}
          <div className={`ml-auto flex items-center gap-1 transition-opacity duration-150 ${hov ? "opacity-100" : "opacity-0"}`}>
            <button onClick={() => onView(routine)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold"
              style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "none", cursor: "pointer" }}>
              View
            </button>
            <button onClick={() => onEdit(routine)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </button>
            <button onClick={() => onDelete(routine)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--red-pale)"; el.style.color = "var(--red)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Routines Panel (main export) ─────────────────────────────────────────────
export function RoutinesPanel({ showToast }: {
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [routines,      setRoutines]      = useState<FirestoreRoutine[]>([]);
  const [members,       setMembers]       = useState<FirestoreMember[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [createOpen,    setCreateOpen]    = useState(false);
  const [editRoutine,   setEditRoutine]   = useState<FirestoreRoutine | null>(null);
  const [viewRoutine,   setViewRoutine]   = useState<FirestoreRoutine | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<FirestoreRoutine | null>(null);
  const [filterMember,  setFilterMember]  = useState("all");
  const [filterStatus,  setFilterStatus]  = useState<"all" | FirestoreRoutine["status"]>("all");
  const [filterDate,    setFilterDate]    = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([fetchRoutines(), fetchMembers()]);
      setRoutines(r); setMembers(m);
    } catch { showToast("Failed to load routines", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => routines.filter((r) => {
    if (filterMember !== "all" && r.assignedToId !== filterMember) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterDate && r.date !== filterDate) return false;
    return true;
  }), [routines, filterMember, filterStatus, filterDate]);

  const stats = useMemo(() => ({
    total:       routines.length,
    pending:     routines.filter((r) => r.status === "pending").length,
    inProgress:  routines.filter((r) => r.status === "in-progress").length,
    completed:   routines.filter((r) => r.status === "completed").length,
    withReports: routines.filter((r) => !!r.report).length,
  }), [routines]);

  async function handleDelete(r: FirestoreRoutine) {
    if (!r.id) return;
    try {
      await deleteRoutine(r.id);
      setDeleteTarget(null);
      await load();
      showToast(`"${r.title}" deleted`);
    } catch { showToast("Delete failed", "error"); }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Daily Routines</h2>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
            {stats.total} routine{stats.total !== 1 ? "s" : ""}
            {stats.inProgress > 0 && <span style={{ color: "var(--gold)" }}> · {stats.inProgress} in progress</span>}
            {stats.withReports > 0 && <span style={{ color: "var(--green)" }}> · {stats.withReports} reported</span>}
          </p>
        </div>
        <button onClick={() => { setEditRoutine(null); setCreateOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
          style={{ background: "var(--accent)", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          New Routine
        </button>
      </div>

      {/* Stat chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { label: "Total",       value: stats.total,      color: "var(--accent)" },
          { label: "Pending",     value: stats.pending,    color: "var(--ink3)"   },
          { label: "In Progress", value: stats.inProgress, color: "var(--gold)"   },
          { label: "Completed",   value: stats.completed,  color: "var(--green)"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-3 py-2 rounded-xl flex items-center gap-2"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
            <span style={{ fontSize: 17, fontWeight: 700, color }}>{value}</span>
            <span style={{ fontSize: 11, color: "var(--ink4)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Member filter */}
        {members.length > 0 && (
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <select value={filterMember} onChange={(e) => setFilterMember(e.target.value)}
              style={{ ...inputBase, width: "auto", minWidth: 150, padding: "7px 10px", fontSize: 12, cursor: "pointer" }}
              onFocus={focusBorder} onBlur={blurBorder}>
              <option value="all">All Members</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        )}

        {/* Status filter */}
        <div className="flex items-center gap-1">
          {(["all", "pending", "in-progress", "completed"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
              style={{
                background: filterStatus === s ? "var(--accent-pale)" : "var(--bg-card)",
                border: `0.5px solid ${filterStatus === s ? "var(--accent)" : "var(--border2)"}`,
                color: filterStatus === s ? "var(--accent)" : "var(--ink3)",
                cursor: "pointer",
              }}>
              {s === "all" ? "All" : s === "in-progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
          style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 12, cursor: "pointer" }}
          onFocus={focusBorder} onBlur={blurBorder}/>
        {filterDate && (
          <button onClick={() => setFilterDate("")}
            className="text-[11px] px-2.5 py-1.5 rounded-lg"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink4)", background: "transparent", cursor: "pointer" }}>
            Clear date
          </button>
        )}

        <span className="ml-auto text-[11px] px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", color: "var(--ink4)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{filtered.length}</span> / {routines.length}
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 rounded-full border-2"
            style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)", animation: "spinLoader .7s linear infinite" }}/>
          <span className="text-[12px]" style={{ color: "var(--ink4)" }}>Loading routines…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ border: "1.5px dashed var(--border2)", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>📋</div>
          <p className="font-semibold text-[14px]" style={{ color: "var(--ink2)" }}>
            {routines.length === 0 ? "No routines yet" : "No routines match this filter"}
          </p>
          <p className="text-[12px]" style={{ color: "var(--ink4)" }}>
            {routines.length === 0 ? "Create a daily checklist and assign it to a team member" : "Try adjusting the filters above"}
          </p>
          {routines.length === 0 && (
            <button onClick={() => { setEditRoutine(null); setCreateOpen(true); }}
              className="mt-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: "var(--accent)", border: "none", cursor: "pointer" }}>
              Create First Routine
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((r) => (
            <RoutineCard key={r.id} routine={r}
              onEdit={(rt) => { setEditRoutine(rt); setCreateOpen(true); }}
              onDelete={setDeleteTarget}
              onView={setViewRoutine}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <RoutineModal
          routine={editRoutine}
          members={members}
          onClose={() => { setCreateOpen(false); setEditRoutine(null); }}
          onSaved={() => { load(); showToast(editRoutine ? "Routine updated!" : "Routine created!"); }}
          showToast={showToast}
        />
      )}
      {viewRoutine && (
        <RoutineDetailModal routine={viewRoutine} onClose={() => setViewRoutine(null)}/>
      )}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
