// ─── src/components/admin/TaskTab.tsx ─────────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchTasks, createTask, updateTask, deleteTask,
  fetchMembers, fetchClients, createReview,
  fetchIdeas, updateIdea, deleteIdea,
  type FirestoreTask, type FirestoreMember, type FirestoreClient, type FirestoreIdea, type ChecklistItem,
} from "../../lib/firebase";
import { RoutinesPanel } from "./RoutinesPanel";
import { sendTaskAssignedEmail } from "../../lib/email";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function isOverdue(task: FirestoreTask): boolean {
  if (task.status === "completed") return false;
  return !!task.dueDate && task.dueDate < todayStr();
}

function effectiveStatus(task: FirestoreTask): FirestoreTask["status"] {
  if (task.status === "completed") return "completed";
  if (isOverdue(task)) return "overdue";
  return task.status;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function daysLabel(task: FirestoreTask): string {
  if (!task.dueDate) return "";
  const eff = effectiveStatus(task);
  if (eff === "completed") return "Done";
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Tomorrow";
  return `${diff}d left`;
}

const PRIORITY_COLOR: Record<FirestoreTask["priority"], string> = {
  high:   "var(--red)",
  medium: "var(--gold)",
  low:    "var(--green)",
};
const PRIORITY_GRAD: Record<FirestoreTask["priority"], string> = {
  high:   "linear-gradient(180deg,#EF4444,#DC262650)",
  medium: "linear-gradient(180deg,#F59E0B,#D9770650)",
  low:    "linear-gradient(180deg,#10B981,#05966950)",
};
const PRIORITY_BG: Record<FirestoreTask["priority"], string> = {
  high:   "var(--red-pale)",
  medium: "var(--gold-pale)",
  low:    "var(--green-pale)",
};
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; glow: string }> = {
  pending:       { label: "Pending",     color: "var(--ink3)",  bg: "var(--bg-alt)",      glow: "none" },
  "in-progress": { label: "In Progress", color: "var(--gold)",  bg: "var(--gold-pale)",   glow: "0 0 8px rgba(245,158,11,0.35)" },
  completed:     { label: "Completed",   color: "var(--green)", bg: "var(--green-pale)",  glow: "0 0 8px rgba(34,197,94,0.35)" },
  overdue:       { label: "Overdue",     color: "var(--red)",   bg: "var(--red-pale)",    glow: "0 0 8px rgba(239,68,68,0.35)" },
};

function deadlinePct(task: FirestoreTask): number {
  if (!task.dueDate || task.status === "completed") return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  if (diff < 0) return 100;
  if (diff === 0) return 95;
  if (diff <= 2) return 82;
  if (diff <= 5) return 65;
  if (diff <= 10) return 42;
  if (diff <= 21) return 22;
  return 8;
}
function deadlineBarColor(pct: number): string {
  if (pct >= 90) return "var(--red)";
  if (pct >= 55) return "var(--gold)";
  return "var(--green)";
}

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

// ─── Filter chip ──────────────────────────────────────────────────────────────
function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
      style={{
        background: active ? "var(--accent-pale)" : "var(--bg-card)",
        border: `0.5px solid ${active ? "var(--accent)" : "var(--border2)"}`,
        color: active ? "var(--accent)" : "var(--ink3)",
        cursor: "pointer",
      }}>
      {children}
    </button>
  );
}

// ─── Quick-Add Bar ────────────────────────────────────────────────────────────
function QuickAddBar({ members, onAdded, showToast }: {
  members:   FirestoreMember[];
  onAdded:   () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [title,    setTitle]    = useState("");
  const [memberId, setMemberId] = useState("");
  const [dueDate,  setDueDate]  = useState(todayStr());
  const [priority, setPriority] = useState<FirestoreTask["priority"]>("medium");
  const [type,     setType]     = useState<FirestoreTask["type"]>("daily");
  const [saving,   setSaving]   = useState(false);
  const [expanded, setExpanded] = useState(false);

  const selectedMember = members.find((m) => m.id === memberId);

  async function submit() {
    if (!title.trim())  { showToast("Enter a task title", "error"); return; }
    if (!memberId)       { showToast("Select a team member", "error"); return; }
    setSaving(true);
    try {
      await createTask({
        title: title.trim(), description: "", type, priority,
        assignedToId: memberId,
        assignedToName:  selectedMember?.name  ?? "",
        assignedToColor: selectedMember?.color ?? "var(--accent)",
        dueDate, status: "pending", report: "", reportedBy: "", completedAt: "",
      });
      if (selectedMember?.email) {
        const portalUrl = `${window.location.origin}/member/${selectedMember.id}`;
        sendTaskAssignedEmail({
          toEmail: selectedMember.email, toName: selectedMember.name,
          taskTitle: title.trim(), taskDescription: "", priority, dueDate, portalUrl,
        }).catch(() => {});
      }
      setTitle(""); setDueDate(todayStr()); setPriority("medium"); setType("daily");
      onAdded();
      showToast("Task created!");
    } catch { showToast("Failed to create task", "error"); }
    finally { setSaving(false); }
  }

  return (
    <div style={{
      borderRadius: 14,
      border: "0.5px solid var(--border2)",
      background: "var(--bg-card)",
      overflow: "hidden",
      transition: "box-shadow .2s",
    }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: saving ? "var(--accent-pale)" : "var(--bg-alt)",
          border: "0.5px solid var(--border2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)", fontSize: 16,
          transition: "background .2s",
        }}>
          {saving
            ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--accent)", borderTopColor: "transparent", animation: "spinLoader .6s linear infinite" }}/>
            : <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          }
        </div>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); if (!expanded && e.target.value) setExpanded(true); }}
          onFocus={() => setExpanded(true)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setExpanded(false); setTitle(""); } }}
          placeholder="Quick add a task… (Enter to save)"
          style={{
            flex: 1, border: "none", background: "transparent",
            color: "var(--ink)", fontSize: 14, fontWeight: 500,
            outline: "none", fontFamily: "'DM Sans', sans-serif",
          }}
        />
        {title && (
          <button onClick={submit} disabled={saving}
            style={{
              padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "var(--accent)", color: "white", border: "none",
              cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
              transition: "opacity .15s", flexShrink: 0,
            }}>
            Add
          </button>
        )}
      </div>

      {/* Options row — visible when expanded */}
      {expanded && (
        <div style={{
          borderTop: "0.5px solid var(--border)",
          padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        }}>

          {/* Member select with colored dot */}
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {selectedMember && (
              <div style={{
                position: "absolute", left: 8, width: 8, height: 8, borderRadius: "50%",
                background: selectedMember.color, zIndex: 1, flexShrink: 0,
              }}/>
            )}
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              style={{
                ...inputBase, width: "auto", paddingLeft: selectedMember ? 22 : 10,
                paddingRight: 8, paddingTop: 5, paddingBottom: 5,
                fontSize: 12, cursor: "pointer", minWidth: 140,
              }}
              onFocus={focusBorder} onBlur={blurBorder}>
              <option value="">Assign to…</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          {/* Due date */}
          <input
            type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            style={{ ...inputBase, width: "auto", paddingTop: 5, paddingBottom: 5, fontSize: 12, cursor: "pointer" }}
            onFocus={focusBorder} onBlur={blurBorder}
          />

          {/* Priority pills */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["high", "medium", "low"] as const).map((p) => (
              <button key={p} onClick={() => setPriority(p)}
                style={{
                  padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 700,
                  background: priority === p ? PRIORITY_BG[p] : "var(--bg-alt)",
                  border: `0.5px solid ${priority === p ? PRIORITY_COLOR[p] : "var(--border2)"}`,
                  color: priority === p ? PRIORITY_COLOR[p] : "var(--ink4)",
                  cursor: "pointer", transition: "all .12s", textTransform: "capitalize",
                }}>
                {p[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Type toggle */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["daily", "weekly"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                style={{
                  padding: "4px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                  background: type === t ? "var(--accent-pale)" : "var(--bg-alt)",
                  border: `0.5px solid ${type === t ? "var(--accent)" : "var(--border2)"}`,
                  color: type === t ? "var(--accent)" : "var(--ink4)",
                  cursor: "pointer", transition: "all .12s", textTransform: "capitalize",
                }}>
                {t}
              </button>
            ))}
          </div>

          <button onClick={() => { setExpanded(false); setTitle(""); }}
            style={{
              marginLeft: "auto", padding: "4px 10px", borderRadius: 7, fontSize: 11,
              background: "transparent", border: "0.5px solid var(--border2)",
              color: "var(--ink4)", cursor: "pointer",
            }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Member filter row (avatar chips) ────────────────────────────────────────
function MemberFilterRow({ members, tasks, active, onChange }: {
  members:  FirestoreMember[];
  tasks:    import("../../lib/firebase").FirestoreTask[];
  active:   string;
  onChange: (id: string) => void;
}) {
  const countFor = (id: string) => tasks.filter((t) => t.assignedToId === id && effectiveStatus(t) !== "completed").length;
  const overdueFor = (id: string) => tasks.filter((t) => t.assignedToId === id && effectiveStatus(t) === "overdue").length;

  return (
    <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
      {/* All chip */}
      <button onClick={() => onChange("all")}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          padding: "8px 12px", borderRadius: 12, cursor: "pointer",
          background: active === "all" ? "var(--accent-pale)" : "var(--bg-card)",
          border: `0.5px solid ${active === "all" ? "var(--accent)" : "var(--border2)"}`,
          flexShrink: 0, transition: "all .15s",
        }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: active === "all" ? "var(--accent-pale)" : "var(--bg-alt)",
          border: `0.5px solid ${active === "all" ? "var(--accent)" : "var(--border2)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: active === "all" ? "var(--accent)" : "var(--ink4)",
        }}>
          ⊞
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: active === "all" ? "var(--accent)" : "var(--ink4)", whiteSpace: "nowrap" }}>
          All
        </span>
      </button>

      {members.map((m) => {
        const isActive  = active === m.id;
        const cnt       = countFor(m.id ?? "");
        const ovd       = overdueFor(m.id ?? "");
        return (
          <button key={m.id} onClick={() => onChange(m.id ?? "")}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
              padding: "8px 12px", borderRadius: 12, cursor: "pointer", position: "relative",
              background: isActive ? `${m.color}18` : "var(--bg-card)",
              border: `0.5px solid ${isActive ? m.color : "var(--border2)"}`,
              flexShrink: 0, transition: "all .15s",
            }}>
            {/* Avatar */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, overflow: "hidden",
                background: m.imageUrl ? "transparent" : `${m.color}22`,
                border: `1.5px solid ${isActive ? m.color : `${m.color}44`}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {m.imageUrl
                  ? <img src={m.imageUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : <span style={{ fontSize: 11, fontWeight: 800, color: m.color }}>{m.initials || m.name[0]}</span>
                }
              </div>
              {/* task count badge */}
              {cnt > 0 && (
                <div style={{
                  position: "absolute", top: -4, right: -4,
                  width: 15, height: 15, borderRadius: "50%",
                  background: ovd > 0 ? "var(--red)" : m.color,
                  color: "white", fontSize: 8, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1.5px solid var(--bg-card)",
                }}>
                  {cnt}
                </div>
              )}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 600, maxWidth: 56, overflow: "hidden",
              textOverflow: "ellipsis", whiteSpace: "nowrap",
              color: isActive ? m.color : "var(--ink4)",
            }}>
              {m.name.split(" ")[0]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Mini ring progress ───────────────────────────────────────────────────────
function RingProgress({ value, total, color, isTotal }: {
  value: number;
  total: number;
  color: string;
  isTotal?: boolean;
}) {
  const r = 9;
  const cx = 12;
  const cy = 12;
  const circumference = 2 * Math.PI * r;
  const ratio = total > 0 ? (isTotal ? 1 : Math.min(value / total, 1)) : 0;
  const offset = circumference * (1 - ratio);

  return (
    <div style={{ position: "relative", width: 24, height: 24, flexShrink: 0 }}>
      <svg width="24" height="24" viewBox="0 0 24 24" style={{ transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke="var(--border2)"
          strokeWidth="2.5"
        />
        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .5s ease" }}
        />
      </svg>
      {/* Center count */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 7, fontWeight: 700, color,
        lineHeight: 1,
      }}>
        {value}
      </div>
    </div>
  );
}

// ─── Add / Edit Task Modal ─────────────────────────────────────────────────────
function AddTaskModal({ task, members, onClose, onSaved }: {
  task: FirestoreTask | null;
  members: FirestoreMember[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [clients, setClients] = useState<FirestoreClient[]>([]);
  useEffect(() => { fetchClients().then(setClients).catch(() => {}); }, []);

  const [form, setForm] = useState({
    title:             task?.title             ?? "",
    description:       task?.description       ?? "",
    type:              task?.type              ?? "daily" as FirestoreTask["type"],
    priority:          task?.priority          ?? "medium" as FirestoreTask["priority"],
    assignedToId:      task?.assignedToId      ?? "",
    assignedToName:    task?.assignedToName    ?? "",
    assignedToColor:   task?.assignedToColor   ?? "",
    dueDate:           task?.dueDate           ?? todayStr(),
    status:            task?.status            ?? "pending" as FirestoreTask["status"],
    report:            task?.report            ?? "",
    reportedBy:        task?.reportedBy        ?? "",
    completedAt:       task?.completedAt       ?? "",
    linkedClientId:    task?.linkedClientId    ?? "",
    linkedClientName:  task?.linkedClientName  ?? "",
    estimatedHours:    task?.estimatedHours    ?? (undefined as number | undefined),
  });
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(task?.checklistItems ?? []);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  function clUid() { return Math.random().toString(36).slice(2, 10); }
  function addClItem() {
    setChecklistItems((p) => [...p, { id: clUid(), title: "", checked: false, checkedAt: "", impact: "medium" as const, estimatedMinutes: 0, category: "" }]);
  }
  function removeClItem(id: string) {
    setChecklistItems((p) => p.filter((i) => i.id !== id));
  }
  function updateClItem(id: string, patch: Partial<ChecklistItem>) {
    setChecklistItems((p) => p.map((i) => i.id === id ? { ...i, ...patch } : i));
  }

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    setErr("");
  }

  function pickMember(id: string) {
    const m = members.find((x) => x.id === id);
    setForm((f) => ({ ...f, assignedToId: id, assignedToName: m?.name ?? "", assignedToColor: m?.color ?? "var(--accent)" }));
    setErr("");
  }

  function pickClient(id: string) {
    const c = clients.find((x) => x.id === id);
    setForm((f) => ({ ...f, linkedClientId: id, linkedClientName: c ? `${c.name}${c.projectName ? ` — ${c.projectName}` : ""}` : "" }));
  }

  async function submit() {
    if (!form.title.trim())   { setErr("Task title is required."); return; }
    if (!form.assignedToId)   { setErr("Please assign to a team member."); return; }
    if (!form.dueDate)        { setErr("Please pick a due date."); return; }
    setSaving(true);
    const cleanChecklist = checklistItems.filter((i) => i.title.trim());
    try {
      if (task?.id) {
        await updateTask(task.id, { ...form, checklistItems: cleanChecklist });
      } else {
        await createTask({ ...form, checklistItems: cleanChecklist });
        // Send email notification if member has an email saved
        const assignedMember = members.find((m) => m.id === form.assignedToId);
        if (assignedMember?.email) {
          const portalUrl = `${window.location.origin}/member/${assignedMember.id}`;
          sendTaskAssignedEmail({
            toEmail:         assignedMember.email,
            toName:          assignedMember.name,
            taskTitle:       form.title,
            taskDescription: form.description,
            priority:        form.priority,
            dueDate:         form.dueDate,
            portalUrl,
          }).catch(() => { /* silent — don't block UI on email failure */ });
        }
      }
      onSaved(); onClose();
    } catch { setErr("Save failed. Try again."); }
    finally { setSaving(false); }
  }

  const STATUS_OPTIONS: { value: FirestoreTask["status"]; label: string }[] = [
    { value: "pending",     label: "Pending" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed",   label: "Completed" },
    { value: "overdue",     label: "Overdue" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[500px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          boxShadow: "var(--shadow-lg)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div>
            <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>
              {task ? "Edit Task" : "New Task"}
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
              {task ? "Update task details" : "Assign a task to a team member"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4" style={{ maxHeight: "62vh", overflowY: "auto" }}>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Task Title *</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Update LinkedIn posts" style={inputBase}
              onFocus={focusBorder} onBlur={blurBorder}/>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="What needs to be done? Include any specific instructions…"
              rows={3} style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
              onFocus={focusBorder} onBlur={blurBorder}/>
          </div>

          {/* Checklist / Routine Steps */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                Routine Steps
                {checklistItems.length > 0 && (
                  <span style={{ marginLeft: 6, color: "var(--accent)", fontWeight: 700 }}>{checklistItems.length} steps</span>
                )}
              </label>
              <button onClick={addClItem}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "none", cursor: "pointer" }}>
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M4.5 1v7M1 4.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Add Step
              </button>
            </div>

            {checklistItems.map((item, idx) => {
              const impactColor = item.impact === "high" ? "var(--red)" : item.impact === "low" ? "var(--green)" : "var(--gold)";
              const impactBg    = item.impact === "high" ? "var(--red-pale)" : item.impact === "low" ? "var(--green-pale)" : "var(--gold-pale)";
              return (
                <div key={item.id} className="flex flex-col gap-2 rounded-xl p-3"
                  style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)" }}>

                  {/* Row 1: number + title + delete */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--bg-card)", color: "var(--ink4)", border: "0.5px solid var(--border2)" }}>
                      {idx + 1}
                    </span>
                    <input value={item.title} onChange={(e) => updateClItem(item.id, { title: e.target.value })}
                      placeholder={`Step ${idx + 1} description…`}
                      style={{ ...inputBase, flex: 1, background: "var(--bg-card)" }}
                      onFocus={focusBorder} onBlur={blurBorder}/>
                    <button onClick={() => removeClItem(item.id)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>

                  {/* Row 2: impact + time + category */}
                  <div className="flex items-center gap-2 flex-wrap">

                    {/* Impact */}
                    <div className="flex items-center gap-1">
                      {(["high", "medium", "low"] as const).map((lvl) => (
                        <button key={lvl} onClick={() => updateClItem(item.id, { impact: lvl })}
                          className="px-2 py-0.5 rounded-md text-[9px] font-bold capitalize transition-all"
                          style={{
                            background: item.impact === lvl ? impactBg : "var(--bg-card)",
                            border: `0.5px solid ${item.impact === lvl ? impactColor : "var(--border2)"}`,
                            color: item.impact === lvl ? impactColor : "var(--ink4)",
                            cursor: "pointer",
                          }}>
                          {lvl}
                        </button>
                      ))}
                    </div>

                    {/* Estimated minutes */}
                    <div className="flex items-center gap-1">
                      <span style={{ fontSize: 10, color: "var(--ink4)" }}>⏱</span>
                      <input
                        type="number" min={0} max={480}
                        value={item.estimatedMinutes || ""}
                        onChange={(e) => updateClItem(item.id, { estimatedMinutes: parseInt(e.target.value) || 0 })}
                        placeholder="min"
                        style={{ ...inputBase, width: 52, padding: "3px 7px", fontSize: 11, background: "var(--bg-card)" }}
                        onFocus={focusBorder} onBlur={blurBorder}/>
                      <span style={{ fontSize: 10, color: "var(--ink4)" }}>min</span>
                    </div>

                    {/* Category */}
                    <input
                      value={item.category || ""}
                      onChange={(e) => updateClItem(item.id, { category: e.target.value })}
                      placeholder="Category…"
                      style={{ ...inputBase, flex: 1, minWidth: 80, padding: "3px 9px", fontSize: 11, background: "var(--bg-card)" }}
                      onFocus={focusBorder} onBlur={blurBorder}/>
                  </div>
                </div>
              );
            })}

            {checklistItems.length === 0 && (
              <p className="text-[11px]" style={{ color: "var(--ink4)" }}>
                Optional — add routine steps with impact level, estimated time, and category.
              </p>
            )}
          </div>

          {/* Type + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Task Type</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(["daily", "weekly"] as const).map((t) => (
                  <button key={t} onClick={() => set("type", t)}
                    className="py-2 rounded-lg text-[12px] font-medium capitalize transition-all"
                    style={{
                      background: form.type === t ? "var(--accent-pale)" : "var(--bg-alt)",
                      border: `0.5px solid ${form.type === t ? "var(--accent)" : "var(--border2)"}`,
                      color: form.type === t ? "var(--accent)" : "var(--ink3)",
                      cursor: "pointer",
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Priority</label>
              <div className="flex gap-1.5">
                {(["high", "medium", "low"] as const).map((p) => (
                  <button key={p} onClick={() => set("priority", p)}
                    className="flex-1 py-2 rounded-lg text-[10px] font-bold capitalize transition-all"
                    style={{
                      background: form.priority === p ? PRIORITY_BG[p] : "var(--bg-alt)",
                      border: `0.5px solid ${form.priority === p ? PRIORITY_COLOR[p] : "var(--border2)"}`,
                      color: form.priority === p ? PRIORITY_COLOR[p] : "var(--ink4)",
                      cursor: "pointer",
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Status (edit mode only) */}
          {task !== null && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Status</label>
              <div className="grid grid-cols-4 gap-1.5">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <button key={value} onClick={() => set("status", value)}
                    className="py-2 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      background: form.status === value ? "var(--accent-pale)" : "var(--bg-alt)",
                      border: `0.5px solid ${form.status === value ? "var(--accent)" : "var(--border2)"}`,
                      color: form.status === value ? "var(--accent)" : "var(--ink4)",
                      cursor: "pointer",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assign to */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Assign To *</label>
            <select value={form.assignedToId} onChange={(e) => pickMember(e.target.value)}
              style={{ ...inputBase, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
              <option value="">Select team member…</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
              ))}
            </select>
          </div>

          {/* Link to Client (optional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
              Link to Client <span style={{ color: "var(--ink4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <select value={form.linkedClientId} onChange={(e) => pickClient(e.target.value)}
              style={{ ...inputBase, cursor: "pointer" }} onFocus={focusBorder} onBlur={blurBorder}>
              <option value="">None — no client linked</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.projectName ? ` — ${c.projectName}` : ""}</option>
              ))}
            </select>
            {form.linkedClientId && (
              <p className="text-[11px]" style={{ color: "var(--green)", marginTop: 2 }}>
                ✓ When completed, a review will be sent to you for this client's portal.
              </p>
            )}
          </div>

          {/* Due Date + Estimated Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Due Date *</label>
              <input type="date" value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)}
                style={inputBase} onFocus={focusBorder} onBlur={blurBorder}/>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                Est. Hours <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="number" min={0} max={999} step={0.5}
                value={form.estimatedHours ?? ""}
                onChange={(e) => set("estimatedHours", e.target.value ? Number(e.target.value) : undefined)}
                placeholder="e.g. 4"
                style={inputBase} onFocus={focusBorder} onBlur={blurBorder}
              />
            </div>
          </div>

          {/* Error */}
          {err && (
            <p className="text-[12px] px-3 py-2.5 rounded-lg"
              style={{ background: "var(--red-pale)", color: "var(--red)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
              {err}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-2.5" style={{ borderTop: "0.5px solid var(--border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={submit} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white"
            style={{ background: "var(--accent)", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, transition: "opacity .15s" }}>
            {saving ? "Saving…" : task ? "Save Changes" : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({ task, onClose, onSaved }: {
  task: FirestoreTask;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [report, setReport] = useState(task.report ?? "");
  const [saving, setSaving]  = useState(false);
  const isView = task.status === "completed";
  const eff = effectiveStatus(task);

  async function submit() {
    if (!task.id) return;
    setSaving(true);
    try {
      await updateTask(task.id, {
        report, status: "completed",
        completedAt: new Date().toISOString(),
        reportedBy: task.assignedToName,
      });
      // Create a pending review for admin to approve
      await createReview({
        taskId:            task.id,
        taskTitle:         task.title,
        taskDescription:   task.description,
        report,
        memberId:          task.assignedToId,
        memberName:        task.assignedToName,
        memberColor:       task.assignedToColor || "#6366F1",
        linkedClientId:    task.linkedClientId  ?? "",
        linkedClientName:  task.linkedClientName ?? "",
        status:            "pending",
      });
      onSaved(); onClose();
    } catch { /* silent */ }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[460px] rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          boxShadow: "var(--shadow-lg)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>
              {isView ? "View Completion Report" : "Submit Completion Report"}
            </h2>
            <button onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Task info strip */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)" }}>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[13px] truncate" style={{ color: "var(--ink)" }}>{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: task.assignedToColor || "var(--accent)" }}/>
                <span className="text-[11px]" style={{ color: "var(--ink4)" }}>{task.assignedToName}</span>
                <span className="text-[11px]" style={{ color: "var(--ink4)" }}>· Due {formatDate(task.dueDate)}</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: STATUS_CFG[eff]?.bg, color: STATUS_CFG[eff]?.color }}>
              {STATUS_CFG[eff]?.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label className="text-[10px] font-semibold uppercase tracking-widest block mb-2.5" style={{ color: "var(--ink4)" }}>
            {isView ? "Submitted Report" : "Completion Notes"}
          </label>
          {isView ? (
            <div className="p-4 rounded-xl text-[13px] leading-relaxed"
              style={{ background: "var(--green-pale)", color: "var(--ink3)", border: "0.5px solid rgba(34,197,94,0.2)", minHeight: 80 }}>
              {task.report || <em style={{ color: "var(--ink4)" }}>No report submitted.</em>}
            </div>
          ) : (
            <textarea value={report} onChange={(e) => setReport(e.target.value)}
              placeholder="Describe what was accomplished, any blockers, or notes for the admin…"
              rows={5} style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
              onFocus={focusBorder} onBlur={blurBorder}/>
          )}

          {isView && task.completedAt && (
            <p className="text-[11px] mt-2" style={{ color: "var(--ink4)" }}>
              Completed {new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              {task.reportedBy ? ` by ${task.reportedBy}` : ""}
            </p>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div className="px-6 py-4 flex gap-2.5" style={{ borderTop: "0.5px solid var(--border)" }}>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-[13px]"
              style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer", transition: "background .15s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              Cancel
            </button>
            <button onClick={submit} disabled={saving}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white"
              style={{ background: "var(--green)", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, transition: "opacity .15s" }}>
              {saving ? "Marking…" : "✓  Mark as Completed"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteTaskConfirm({ title, onConfirm, onCancel }: {
  title: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[360px] rounded-2xl p-7 text-center"
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          boxShadow: "var(--shadow-lg)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--red-pale)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-semibold text-[16px] mb-1.5" style={{ color: "var(--ink)" }}>Delete task?</h3>
        <p className="text-[13px] mb-5" style={{ color: "var(--ink3)" }}>
          "<strong style={{ color: "var(--ink2)" }}>{title}</strong>" will be permanently removed.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-white"
            style={{ background: "var(--red)", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onReport, onReload, selected, onSelect }: {
  task: FirestoreTask;
  onEdit: (t: FirestoreTask) => void;
  onDelete: (t: FirestoreTask) => void;
  onReport: (t: FirestoreTask) => void;
  onReload: () => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}) {
  const [hov, setHov] = useState(false);
  const [toggling, setToggling] = useState(false);
  const eff = effectiveStatus(task);
  const sc  = STATUS_CFG[eff] ?? STATUS_CFG.pending;
  const pc  = PRIORITY_COLOR[task.priority];
  const pb  = PRIORITY_BG[task.priority];
  const due = daysLabel(task);

  const STATUS_CYCLE: Record<string, FirestoreTask["status"]> = {
    pending:       "in-progress",
    "in-progress": "completed",
    completed:     "pending",
  };

  async function cycleStatus() {
    if (!task.id || eff === "overdue" || toggling) return;
    const next = STATUS_CYCLE[eff];
    if (!next) return;
    // For completion, use the Report modal for proper report + review creation
    if (next === "completed") { onReport(task); return; }
    setToggling(true);
    try {
      await updateTask(task.id, { status: next });
      onReload();
    } catch { /* silent */ }
    finally { setToggling(false); }
  }

  async function handleStart() {
    if (!task.id) return;
    await updateTask(task.id, { status: "in-progress" });
    onReload();
  }

  return (
    <div className="relative rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: selected ? "rgba(124,58,237,0.05)" : "var(--bg-card)",
        border: `0.5px solid ${selected ? "rgba(124,58,237,0.3)" : hov ? "var(--border2)" : "var(--border)"}`,
        boxShadow: hov ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>

      {/* Bulk select checkbox */}
      {onSelect && (hov || selected) && (
        <div style={{ position: "absolute", top: 10, left: 8, zIndex: 2 }}>
          <input type="checkbox" checked={selected ?? false}
            onChange={(e) => task.id && onSelect(task.id, e.target.checked)}
            style={{ width: 14, height: 14, accentColor: "var(--accent)", cursor: "pointer" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Priority left bar — gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px]" style={{ background: PRIORITY_GRAD[task.priority], boxShadow: `2px 0 6px ${pc}40` }}/>

      <div style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 14, paddingBottom: 14 }}>

        {/* Top pill row */}
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{
              background: task.type === "daily" ? "var(--accent-pale)" : "var(--purple-pale)",
              color: task.type === "daily" ? "var(--accent)" : "var(--purple)",
            }}>
            {task.type}
          </span>

          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
            style={{ background: pb, color: pc }}>
            {task.priority}
          </span>

          {due && (
            <span className="text-[10px] font-medium"
              style={{ color: eff === "overdue" ? "var(--red)" : eff === "completed" ? "var(--green)" : "var(--ink4)" }}>
              {due}
            </span>
          )}

          {/* Estimated hours chip */}
          {task.estimatedHours != null && (
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: "var(--bg-alt)", color: "var(--ink3)", border: "0.5px solid var(--border2)" }}>
              ⏱ {task.estimatedHours}h
            </span>
          )}
          {/* Checklist progress */}
          {task.checklistItems && task.checklistItems.length > 0 && (() => {
            const done = task.checklistItems.filter((i) => i.checked).length;
            const total = task.checklistItems.length;
            const allDone = done === total;
            return (
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: allDone ? "var(--green-pale)" : "var(--bg-alt)", color: allDone ? "var(--green)" : "var(--ink3)", border: `0.5px solid ${allDone ? "rgba(34,197,94,.25)" : "var(--border2)"}` }}>
                ☑ {done}/{total}
              </span>
            );
          })()}

          {/* Clickable status badge — cycles status; no cycle for overdue */}
          <button
            className="ml-auto text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1"
            style={{
              background: sc.bg, color: sc.color,
              border: "none", cursor: eff === "overdue" ? "default" : "pointer",
              opacity: toggling ? 0.6 : 1, transition: "opacity .15s",
              boxShadow: sc.glow,
            }}
            onClick={eff !== "overdue" ? cycleStatus : undefined}
            title={eff !== "overdue" ? `Click to advance status` : undefined}
          >
            {toggling ? (
              <span style={{
                display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                border: `1.5px solid ${sc.color}`, borderTopColor: "transparent",
                animation: "spinLoader .6s linear infinite",
              }}/>
            ) : null}
            {sc.label}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[13.5px] leading-snug mb-1"
          style={{
            color: "var(--ink)",
            textDecoration: eff === "completed" ? "line-through" : "none",
            opacity: eff === "completed" ? 0.55 : 1,
          }}>
          {task.title}
        </h3>

        {/* Deadline progress bar */}
        {task.dueDate && eff !== "completed" && (() => {
          const pct = deadlinePct(task);
          const barColor = deadlineBarColor(pct);
          return (
            <div style={{ height: 3, borderRadius: 99, background: "var(--bg-alt)", overflow: "hidden", marginBottom: 8 }}
              title={due}>
              <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99, transition: "width .6s var(--ease)", boxShadow: pct > 70 ? `0 0 4px ${barColor}80` : "none" }}/>
            </div>
          );
        })()}

        {/* Description */}
        {task.description && (
          <p className="text-[12px] mb-3 leading-relaxed line-clamp-2" style={{ color: "var(--ink4)" }}>
            {task.description}
          </p>
        )}

        {/* Completion report preview */}
        {eff === "completed" && task.report && (
          <div className="mb-3 px-3 py-2.5 rounded-xl text-[11px] leading-relaxed"
            style={{ background: "var(--green-pale)", color: "var(--green)", border: "0.5px solid rgba(34,197,94,0.2)" }}>
            <span className="font-semibold">Report: </span>
            {task.report.slice(0, 120)}{task.report.length > 120 ? "…" : ""}
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center gap-3">
          {/* Assignee */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold flex-shrink-0"
              style={{
                background: `${task.assignedToColor || "var(--accent)"}22`,
                color: task.assignedToColor || "var(--accent)",
                border: `1px solid ${task.assignedToColor || "var(--accent)"}33`,
              }}>
              {task.assignedToName?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-[12px] font-medium" style={{ color: "var(--ink3)" }}>{task.assignedToName}</span>
          </div>

          <span className="text-[11px]" style={{ color: "var(--ink4)" }}>
            {formatDate(task.dueDate)}
          </span>

          {/* Actions */}
          <div className={`ml-auto flex items-center gap-1 transition-opacity duration-150 ${hov ? "opacity-100" : "opacity-0"}`}>

            {/* "Start" quick button for pending (non-overdue) tasks */}
            {eff === "pending" && (
              <button onClick={handleStart}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: "var(--accent-pale)", color: "var(--accent)",
                  border: "none", cursor: "pointer",
                }}
                title="Start task">
                ▷ Start
              </button>
            )}

            <button onClick={() => onReport(task)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: eff === "completed" ? "var(--green-pale)" : "var(--accent-pale)",
                color: eff === "completed" ? "var(--green)" : "var(--accent)",
                border: "none", cursor: "pointer",
              }}
              title={eff === "completed" ? "View Report" : "Submit Report"}>
              {eff === "completed" ? "View Report" : "+ Report"}
            </button>

            <button onClick={() => onEdit(task)} title="Edit"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
            </button>

            <button onClick={() => onDelete(task)} title="Delete"
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
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

// ─── Kanban Card ─────────────────────────────────────────────────────────────
function KanbanCard({ task, onEdit, onDelete, onReport }: {
  task: FirestoreTask;
  onEdit: (t: FirestoreTask) => void;
  onDelete: (t: FirestoreTask) => void;
  onReport: (t: FirestoreTask) => void;
}) {
  const [hov, setHov] = useState(false);
  const eff = effectiveStatus(task);
  const pc  = PRIORITY_COLOR[task.priority];
  const overdueDays = (() => {
    if (eff !== "overdue" || !task.dueDate) return 0;
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate + "T00:00:00");
    return Math.round((now.getTime() - due.getTime()) / 86400000);
  })();

  return (
    <div
      className="relative rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "var(--bg-card)",
        border: `0.5px solid ${hov ? "var(--border2)" : "var(--border)"}`,
        boxShadow: hov ? "0 2px 10px rgba(0,0,0,0.07)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>

      {/* Priority left bar — gradient */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px]"
        style={{ background: PRIORITY_GRAD[task.priority], boxShadow: `2px 0 5px ${pc}38` }}
        title={task.priority}
      />

      <div style={{ paddingLeft: 14, paddingRight: 12, paddingTop: 11, paddingBottom: 11 }}>

        {/* Title */}
        <h3 className="font-semibold leading-snug mb-1.5"
          style={{
            fontSize: 13,
            color: "var(--ink)",
            textDecoration: eff === "completed" ? "line-through" : "none",
            opacity: eff === "completed" ? 0.55 : 1,
            paddingRight: hov ? 44 : 0,
            transition: "padding-right .15s",
          }}>
          {task.title}
        </h3>

        {/* Deadline bar */}
        {task.dueDate && eff !== "completed" && (() => {
          const pct = deadlinePct(task);
          const barColor = deadlineBarColor(pct);
          return (
            <div style={{ height: 3, borderRadius: 99, background: "var(--bg-alt)", overflow: "hidden", marginBottom: 6 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 99, transition: "width .6s var(--ease)" }}/>
            </div>
          );
        })()}

        {/* Description excerpt */}
        {task.description && (
          <p style={{
            fontSize: 11, color: "var(--ink4)", lineHeight: 1.55,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden", marginBottom: 8,
          }}>
            {task.description}
          </p>
        )}

        {/* Overdue chip */}
        {eff === "overdue" && overdueDays > 0 && (
          <div style={{ marginBottom: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, color: "var(--red)",
              background: "var(--red-pale)", borderRadius: 6,
              padding: "2px 7px", border: "0.5px solid rgba(239,68,68,0.25)",
            }}>
              {overdueDays}d overdue
            </span>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center gap-2">
          {/* Assignee avatar */}
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              fontSize: 8, fontWeight: 700,
              background: `${task.assignedToColor || "var(--accent)"}22`,
              color: task.assignedToColor || "var(--accent)",
              border: `1px solid ${task.assignedToColor || "var(--accent)"}44`,
            }}>
            {task.assignedToName?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span style={{ fontSize: 11, color: "var(--ink3)", fontWeight: 500, flexShrink: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task.assignedToName}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            {task.estimatedHours != null && (
              <span style={{ fontSize: 9, color: "var(--ink4)", fontWeight: 600 }}>⏱{task.estimatedHours}h</span>
            )}
            {task.dueDate && (
              <span style={{
                fontSize: 10, color: "var(--ink4)",
                background: "var(--bg-alt)", border: "0.5px solid var(--border)",
                borderRadius: 6, padding: "2px 6px", whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>

        {/* "View Report" button for completed tasks */}
        {eff === "completed" && (
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => onReport(task)}
              style={{
                fontSize: 10, fontWeight: 600, color: "var(--green)",
                background: "var(--green-pale)", borderRadius: 6,
                padding: "3px 8px", border: "0.5px solid rgba(34,197,94,0.25)",
                cursor: "pointer",
              }}>
              View Report
            </button>
          </div>
        )}
      </div>

      {/* Hover action buttons */}
      <div style={{
        position: "absolute", top: 9, right: 8,
        display: "flex", gap: 2,
        opacity: hov ? 1 : 0, transition: "opacity .15s",
        pointerEvents: hov ? "auto" : "none",
      }}>
        <button onClick={() => onEdit(task)} title="Edit"
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
          style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = "var(--ink4)"; }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
          </svg>
        </button>
        <button onClick={() => onDelete(task)} title="Delete"
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all"
          style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--red-pale)"; el.style.color = "var(--red)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = "var(--ink4)"; }}>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────
const KANBAN_COLUMNS: { key: "pending" | "in-progress" | "completed" | "overdue"; label: string; color: string; bg: string }[] = [
  { key: "pending",     label: "Pending",     color: "var(--ink4)",  bg: "var(--bg-alt)"   },
  { key: "in-progress", label: "In Progress", color: "var(--gold)",  bg: "var(--gold-pale)" },
  { key: "completed",   label: "Completed",   color: "var(--green)", bg: "var(--green-pale)" },
  { key: "overdue",     label: "Overdue",     color: "var(--red)",   bg: "var(--red-pale)"  },
];

function KanbanBoard({ tasks, onEdit, onDelete, onReport }: {
  tasks: FirestoreTask[];
  onEdit: (t: FirestoreTask) => void;
  onDelete: (t: FirestoreTask) => void;
  onReport: (t: FirestoreTask) => void;
}) {
  return (
    <div style={{ overflowX: "auto", display: "flex", gap: 16, paddingBottom: 8, alignItems: "flex-start" }}>
      {KANBAN_COLUMNS.map(({ key, label, color, bg }) => {
        const columnTasks = tasks.filter((t) => effectiveStatus(t) === key);
        return (
          <div key={key} style={{ minWidth: 240, flex: "0 0 240px", display: "flex", flexDirection: "column", gap: 0 }}>
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-t-xl"
              style={{ background: bg, border: `0.5px solid ${color}33`, borderBottom: "none" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {label}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 700, color,
                background: `${color}22`, border: `0.5px solid ${color}44`,
                borderRadius: 999, padding: "1px 8px", minWidth: 20, textAlign: "center",
              }}>
                {columnTasks.length}
              </span>
            </div>

            {/* Column body */}
            <div style={{
              flex: 1, minHeight: 80,
              background: "var(--bg-alt)",
              border: `0.5px solid ${color}22`,
              borderTop: `0.5px solid ${color}33`,
              borderRadius: "0 0 12px 12px",
              padding: "10px 8px",
              display: "flex", flexDirection: "column", gap: 8,
              maxHeight: "calc(100vh - 320px)",
              overflowY: "auto",
            }}>
              {columnTasks.length === 0 ? (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 60, border: "1.5px dashed var(--border2)", borderRadius: 10,
                  color: "var(--ink4)", fontSize: 11,
                }}>
                  No tasks
                </div>
              ) : (
                columnTasks.map((t) => (
                  <KanbanCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} onReport={onReport}/>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Ideas Panel (admin view) ─────────────────────────────────────────────────
const IDEA_STATUS_CFG = {
  new:         { label: "New",         color: "var(--accent)",  bg: "var(--accent-pale)"  },
  reviewed:    { label: "Reviewed",    color: "var(--gold)",    bg: "var(--gold-pale)"    },
  implemented: { label: "Implemented", color: "var(--green)",   bg: "var(--green-pale)"   },
};

function IdeaCommentModal({ idea, onClose, onSaved, showToast }: {
  idea: FirestoreIdea;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [comment, setComment] = useState(idea.adminComment ?? "");
  const [status,  setStatus]  = useState<FirestoreIdea["status"]>(idea.status);
  const [saving,  setSaving]  = useState(false);

  async function save() {
    if (!idea.id) return;
    setSaving(true);
    try {
      await updateIdea(idea.id, { adminComment: comment.trim(), status });
      onSaved(); onClose();
    } catch { showToast("Save failed", "error"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[460px] rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", boxShadow: "var(--shadow-lg)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: idea.memberColor || "var(--accent)" }}/>
              <span className="text-[11px]" style={{ color: "var(--ink4)" }}>{idea.memberName}</span>
            </div>
            <h2 className="font-semibold text-[15px] leading-snug" style={{ color: "var(--ink)" }}>{idea.title}</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Idea description */}
          {idea.description && (
            <div className="p-3 rounded-xl text-[12px] leading-relaxed"
              style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)", color: "var(--ink3)" }}>
              {idea.description}
            </div>
          )}

          {/* Status toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Status</label>
            <div className="flex gap-2">
              {(["new", "reviewed", "implemented"] as const).map((s) => {
                const cfg = IDEA_STATUS_CFG[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className="flex-1 py-2 rounded-lg text-[11px] font-bold transition-all"
                    style={{
                      background: status === s ? cfg.bg : "var(--bg-alt)",
                      border: `0.5px solid ${status === s ? cfg.color : "var(--border2)"}`,
                      color: status === s ? cfg.color : "var(--ink4)",
                      cursor: "pointer",
                    }}>
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin comment */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Admin Comment</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="Leave feedback or notes for the team member…"
              rows={4} style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
              onFocus={focusBorder} onBlur={blurBorder}/>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex gap-2.5" style={{ borderTop: "0.5px solid var(--border)" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-[13px]"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white"
            style={{ background: "var(--accent)", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function IdeasPanel({ showToast }: { showToast: (msg: string, type?: "success" | "error") => void }) {
  const [ideas,        setIdeas]        = useState<FirestoreIdea[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filterStatus, setFilterStatus] = useState<"all" | FirestoreIdea["status"]>("all");
  const [filterMember, setFilterMember] = useState("all");
  const [editIdea,     setEditIdea]     = useState<FirestoreIdea | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreIdea | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setIdeas(await fetchIdeas()); }
    catch { showToast("Failed to load ideas", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const members = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; color: string }>();
    ideas.forEach((i) => { if (!seen.has(i.memberId)) seen.set(i.memberId, { id: i.memberId, name: i.memberName, color: i.memberColor }); });
    return [...seen.values()];
  }, [ideas]);

  const filtered = useMemo(() => ideas.filter((i) => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterMember !== "all" && i.memberId !== filterMember) return false;
    return true;
  }), [ideas, filterStatus, filterMember]);

  const counts = useMemo(() => ({
    new:         ideas.filter((i) => i.status === "new").length,
    reviewed:    ideas.filter((i) => i.status === "reviewed").length,
    implemented: ideas.filter((i) => i.status === "implemented").length,
  }), [ideas]);

  async function handleDelete(idea: FirestoreIdea) {
    if (!idea.id) return;
    try {
      await deleteIdea(idea.id);
      setDeleteTarget(null);
      await load();
      showToast("Idea deleted");
    } catch { showToast("Delete failed", "error"); }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Team Ideas</h2>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
            {ideas.length} idea{ideas.length !== 1 ? "s" : ""} submitted
            {counts.new > 0 && <span style={{ color: "var(--accent)" }}> · {counts.new} new</span>}
          </p>
        </div>
        <button onClick={load} className="px-3 py-1.5 rounded-lg text-[12px]"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", color: "var(--ink4)", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stat chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["new", "reviewed", "implemented"] as const).map((s) => {
          const cfg = IDEA_STATUS_CFG[s];
          return (
            <div key={s} className="px-3 py-2 rounded-xl flex items-center gap-2"
              style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: cfg.color }}>{counts[s]}</span>
              <span style={{ fontSize: 11, color: "var(--ink4)" }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <div className="flex items-center gap-1">
          <FilterChip active={filterStatus === "all"} onClick={() => setFilterStatus("all")}>All Status</FilterChip>
          {(["new", "reviewed", "implemented"] as const).map((s) => (
            <FilterChip key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
              {IDEA_STATUS_CFG[s].label}
            </FilterChip>
          ))}
        </div>
        {members.length > 1 && (
          <div className="flex items-center gap-1">
            <FilterChip active={filterMember === "all"} onClick={() => setFilterMember("all")}>All Members</FilterChip>
            {members.map((m) => (
              <FilterChip key={m.id} active={filterMember === m.id} onClick={() => setFilterMember(m.id)}>
                <span className="flex items-center gap-1.5">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.color, display: "inline-block", flexShrink: 0 }}/>
                  {m.name.split(" ")[0]}
                </span>
              </FilterChip>
            ))}
          </div>
        )}
      </div>

      {/* Ideas list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 rounded-full border-2"
            style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)", animation: "spinLoader .7s linear infinite" }}/>
          <span className="text-[12px]" style={{ color: "var(--ink4)" }}>Loading ideas…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ border: "1.5px dashed var(--border2)", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>💡</div>
          <p className="font-semibold text-[14px]" style={{ color: "var(--ink2)" }}>
            {ideas.length === 0 ? "No ideas yet" : "No ideas match this filter"}
          </p>
          <p className="text-[12px]" style={{ color: "var(--ink4)" }}>
            {ideas.length === 0 ? "Team members can submit ideas from their task portal" : "Try adjusting the filters above"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((idea) => {
            const cfg = IDEA_STATUS_CFG[idea.status];
            return (
              <div key={idea.id} className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>

                {/* Color accent bar */}
                <div style={{ height: 3, background: idea.memberColor || "var(--accent)" }}/>

                <div style={{ padding: "14px 16px" }}>
                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
                      style={{ background: `${idea.memberColor || "var(--accent)"}22`, color: idea.memberColor || "var(--accent)", border: `1px solid ${idea.memberColor || "var(--accent)"}33` }}>
                      {idea.memberName?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-medium" style={{ color: "var(--ink3)" }}>{idea.memberName}</span>
                        {idea.createdAt && (
                          <span className="text-[10px]" style={{ color: "var(--ink4)" }}>
                            · {new Date((idea.createdAt as { toMillis(): number }).toMillis()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-[13.5px] leading-snug" style={{ color: "var(--ink)" }}>{idea.title}</h3>
                    </div>
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Description */}
                  {idea.description && (
                    <p className="text-[12px] leading-relaxed mb-2 line-clamp-3" style={{ color: "var(--ink4)", paddingLeft: 36 }}>
                      {idea.description}
                    </p>
                  )}

                  {/* Admin comment preview */}
                  {idea.adminComment && (
                    <div className="mb-2 px-3 py-2 rounded-lg text-[11px] leading-relaxed"
                      style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "0.5px solid rgba(99,102,241,.2)", marginLeft: 36 }}>
                      <span className="font-semibold">Note: </span>{idea.adminComment.slice(0, 120)}{idea.adminComment.length > 120 ? "…" : ""}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setEditIdea(idea)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                      style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
                      Review
                    </button>
                    <button onClick={() => setDeleteTarget(idea)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
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
            );
          })}
        </div>
      )}

      {/* Modals */}
      {editIdea && (
        <IdeaCommentModal
          idea={editIdea}
          onClose={() => setEditIdea(null)}
          onSaved={() => { load(); showToast("Idea updated!"); }}
          showToast={showToast}
        />
      )}
      {deleteTarget && (
        <DeleteTaskConfirm
          title={deleteTarget.title}
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// TASK TAB
// ═════════════════════════════════════════════════════════════════════════════

interface Props {
  showToast: (msg: string, type?: "success" | "error") => void;
  openAdd?: boolean;
  onOpenAddDone?: () => void;
}

export function TaskTab({ showToast, openAdd, onOpenAddDone }: Props) {
  const [activeTab,    setActiveTab]    = useState<"tasks" | "ideas">("tasks");
  const [tasks,        setTasks]        = useState<FirestoreTask[]>([]);
  const [members,      setMembers]      = useState<FirestoreMember[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [addOpen,      setAddOpen]      = useState(false);
  const [editTask,     setEditTask]     = useState<FirestoreTask | null>(null);
  const [reportTask,   setReportTask]   = useState<FirestoreTask | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreTask | null>(null);

  const [filterType,   setFilterType]   = useState<"all" | "daily" | "weekly">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "in-progress" | "completed" | "overdue">("all");
  const [filterMember, setFilterMember] = useState<"all" | string>("all");
  const [view,         setView]         = useState<"list" | "kanban">("list");
  const [selected,     setSelected]     = useState<Set<string>>(new Set());

  // Search state
  const [search, setSearch] = useState("");

  function toggleSelect(id: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id); else next.delete(id);
      return next;
    });
  }
  function clearSelection() { setSelected(new Set()); }

  useEffect(() => {
    if (openAdd) { setEditTask(null); setAddOpen(true); onOpenAddDone?.(); }
  }, [openAdd, onOpenAddDone]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, m] = await Promise.all([fetchTasks(), fetchMembers()]);
      setTasks(t); setMembers(m);
    } catch { showToast("Failed to load tasks", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      showToast(`"${deleteTarget.title}" deleted`);
    } catch { showToast("Delete failed", "error"); }
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    try {
      await Promise.all([...selected].map((id) => deleteTask(id)));
      clearSelection();
      await load();
      showToast(`${selected.size} task${selected.size !== 1 ? "s" : ""} deleted`);
    } catch { showToast("Bulk delete failed", "error"); }
  }

  async function bulkComplete() {
    if (selected.size === 0) return;
    try {
      await Promise.all([...selected].map((id) => updateTask(id, { status: "completed", completedAt: new Date().toISOString() })));
      clearSelection();
      await load();
      showToast(`${selected.size} task${selected.size !== 1 ? "s" : ""} marked complete`);
    } catch { showToast("Bulk update failed", "error"); }
  }

  const stats = useMemo(() => ({
    total:      tasks.length,
    completed:  tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in-progress" && !isOverdue(t)).length,
    pending:    tasks.filter((t) => t.status === "pending" && !isOverdue(t)).length,
    overdue:    tasks.filter((t) => isOverdue(t)).length,
  }), [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks
      .filter((t) => {
        const eff = effectiveStatus(t);
        if (filterType !== "all" && t.type !== filterType) return false;
        if (filterStatus !== "all" && eff !== filterStatus) return false;
        if (filterMember !== "all" && t.assignedToId !== filterMember) return false;
        if (q) {
          const inTitle = t.title.toLowerCase().includes(q);
          const inDesc  = (t.description ?? "").toLowerCase().includes(q);
          if (!inTitle && !inDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const ae = effectiveStatus(a); const be = effectiveStatus(b);
        if (ae === "overdue"   && be !== "overdue")   return -1;
        if (be === "overdue"   && ae !== "overdue")   return 1;
        if (ae === "completed" && be !== "completed") return 1;
        if (be === "completed" && ae !== "completed") return -1;
        const po = { high: 0, medium: 1, low: 2 };
        if (po[a.priority] !== po[b.priority]) return po[a.priority] - po[b.priority];
        return (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
      });
  }, [tasks, filterType, filterStatus, filterMember, search]);

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statCards: { label: string; value: number; color: string; isTotal?: boolean }[] = [
    { label: "Total Tasks",  value: stats.total,      color: "var(--accent)", isTotal: true },
    { label: "Completed",    value: stats.completed,   color: "var(--green)"  },
    { label: "In Progress",  value: stats.inProgress,  color: "var(--gold)"   },
    { label: "Overdue",      value: stats.overdue,     color: "var(--red)"    },
  ];

  return (
    <div className="p-5 flex flex-col gap-4">

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl self-start"
        style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)" }}>
        {(["tasks", "ideas"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
            style={{
              background: activeTab === tab ? "var(--bg-card)" : "transparent",
              border: activeTab === tab ? "0.5px solid var(--border2)" : "none",
              color: activeTab === tab ? "var(--ink)" : "var(--ink4)",
              cursor: "pointer",
              boxShadow: activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>
            {tab === "tasks" ? "Tasks" : "💡 Ideas"}
          </button>
        ))}
      </div>

      {activeTab === "ideas" ? (
        <IdeasPanel showToast={showToast}/>
      ) : (<>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Tasks</h2>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
            {stats.total} total · {stats.pending} pending
            {stats.overdue > 0 && <span style={{ color: "var(--red)" }}> · {stats.overdue} overdue</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-xl overflow-hidden"
            style={{ border: "0.5px solid var(--border2)", background: "var(--bg-card)" }}>
            <button onClick={() => setView("list")} title="List view"
              className="w-8 h-8 flex items-center justify-center transition-all"
              style={{ background: view === "list" ? "var(--accent-pale)" : "transparent", color: view === "list" ? "var(--accent)" : "var(--ink4)", border: "none", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="1" y="6" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="1" y="10" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <button onClick={() => setView("kanban")} title="Kanban view"
              className="w-8 h-8 flex items-center justify-center transition-all"
              style={{ background: view === "kanban" ? "var(--accent-pale)" : "transparent", color: view === "kanban" ? "var(--accent)" : "var(--ink4)", border: "none", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1"    y="1" width="3.5" height="12" rx="1" fill="currentColor"/>
                <rect x="5.25" y="1" width="3.5" height="8"  rx="1" fill="currentColor" opacity="0.6"/>
                <rect x="9.5"  y="1" width="3.5" height="10" rx="1" fill="currentColor" opacity="0.8"/>
              </svg>
            </button>
          </div>

          <button onClick={() => { setEditTask(null); setAddOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white active:scale-95"
            style={{ background: "var(--accent)", border: "none", cursor: "pointer", transition: "opacity .15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Full Form
          </button>
        </div>
      </div>

      {/* ── Quick-Add Bar ──────────────────────────────────────────────────────── */}
      {members.length > 0 && (
        <QuickAddBar members={members} onAdded={load} showToast={showToast}/>
      )}

      {/* ── Member filter avatar chips ─────────────────────────────────────────── */}
      {members.length > 0 && (
        <MemberFilterRow
          members={members}
          tasks={tasks}
          active={filterMember}
          onChange={setFilterMember}
        />
      )}

      {/* Stat cards — responsive grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
        {statCards.map(({ label, value, color, isTotal }) => (
          <div key={label} className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-medium" style={{ color: "var(--ink4)" }}>{label}</span>
              <RingProgress value={value} total={stats.total} color={color} isTotal={isTotal}/>
            </div>
            <div className="text-[24px] font-semibold leading-none" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Completion progress banner */}
      {stats.total > 0 && (
        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 14px" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px]" style={{ color: "var(--ink3)" }}>
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>{stats.completed}</span>
              {" of "}
              <span style={{ fontWeight: 600, color: "var(--ink)" }}>{stats.total}</span>
              {" completed"}
            </span>
            <span className="text-[13px] font-bold" style={{ color: "var(--green)" }}>{completionPct}%</span>
          </div>
          <div style={{ background: "var(--bg-alt)", borderRadius: 99, height: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, width: `${completionPct}%`, background: "var(--green)", transition: "width .6s ease" }}/>
          </div>
        </div>
      )}

      {/* Search + type/status filters */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 180px", maxWidth: 280 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink4)", display: "flex", alignItems: "center" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M8.5 8.5L11.5 11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </div>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            style={{ ...inputBase, paddingLeft: 30, paddingRight: search ? 28 : 10, background: "var(--bg-card)", fontSize: 12 }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { e.target.style.borderColor = "var(--border2)"; }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--ink4)", fontSize: 14, lineHeight: 1, display: "flex", alignItems: "center" }}>
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          {(["all", "daily", "weekly"] as const).map((t) => (
            <FilterChip key={t} active={filterType === t} onClick={() => setFilterType(t)}>
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </FilterChip>
          ))}
        </div>

        {view === "list" && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {(["all", "pending", "in-progress", "completed", "overdue"] as const).map((s) => (
              <FilterChip key={s} active={filterStatus === s} onClick={() => setFilterStatus(s)}>
                {s === "all" ? "All Status" : STATUS_CFG[s]?.label ?? s}
              </FilterChip>
            ))}
          </div>
        )}

        <div className="text-[11px] px-3 py-1.5 rounded-lg flex-shrink-0"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", color: "var(--ink4)", marginLeft: "auto" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{filtered.length}</span>
          {" / "}{tasks.length}
        </div>
      </div>

      {/* Task list / Kanban */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-7 h-7 rounded-full border-2"
            style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)", animation: "spinLoader .7s linear infinite" }}/>
          <span className="text-[12px]" style={{ color: "var(--ink4)" }}>Loading tasks…</span>
        </div>
      ) : view === "list" ? (
        filtered.length === 0 ? (
          tasks.length === 0 ? (
            /* ── Improved empty state for zero tasks ── */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "56px 24px",
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: 16, textAlign: "center",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%",
                background: "var(--bg-alt)", border: "0.5px solid var(--border2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 34, marginBottom: 16,
              }}>
                📋
              </div>
              <h3 className="font-semibold text-[16px] mb-2" style={{ color: "var(--ink)" }}>
                No tasks yet
              </h3>
              <p className="text-[13px] mb-6" style={{ color: "var(--ink4)", maxWidth: 280, lineHeight: 1.6 }}>
                Assign your first task to a team member to get started
              </p>
              <button onClick={() => { setEditTask(null); setAddOpen(true); }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                style={{ background: "var(--accent)", border: "none", cursor: "pointer" }}>
                Create First Task
              </button>
            </div>
          ) : (
            /* ── Empty state for filtered results ── */
            <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border-dashed"
              style={{ border: "1.5px dashed var(--border2)" }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)" }}>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                  <rect x="3" y="5.5" width="20" height="17" rx="2.5" stroke="var(--ink4)" strokeWidth="1.5"/>
                  <path d="M9 5.5V4a4 4 0 018 0v1.5" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M9.5 14l2.5 2.5 5-5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[14px]" style={{ color: "var(--ink2)" }}>
                  No tasks match filters
                </p>
                <p className="text-[12px] mt-1" style={{ color: "var(--ink4)" }}>
                  Try adjusting the filters or search above
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col gap-2.5">
            {filtered.map((t) => (
              <TaskCard key={t.id} task={t}
                onEdit={(task) => { setEditTask(task); setAddOpen(true); }}
                onDelete={setDeleteTarget}
                onReport={setReportTask}
                onReload={load}
                selected={selected.has(t.id ?? "")}
                onSelect={toggleSelect}
              />
            ))}
          </div>
        )
      ) : (
        /* ── Kanban board ───────────────────────────────────────────── */
        <KanbanBoard
          tasks={filtered}
          onEdit={(task) => { setEditTask(task); setAddOpen(true); }}
          onDelete={setDeleteTarget}
          onReport={setReportTask}
        />
      )}

      {/* Modals */}
      {addOpen && (
        <AddTaskModal task={editTask} members={members}
          onClose={() => { setAddOpen(false); setEditTask(null); }}
          onSaved={() => { load(); showToast(editTask ? "Task updated!" : "Task created!"); }}
        />
      )}
      {reportTask && (
        <ReportModal task={reportTask}
          onClose={() => setReportTask(null)}
          onSaved={() => { load(); showToast("Report submitted!"); }}
        />
      )}
      {deleteTarget && (
        <DeleteTaskConfirm title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Bulk actions toolbar */}
      {selected.size > 0 && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 50, display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px",
          background: "var(--bg-panel)",
          border: "1px solid var(--border2)",
          borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(124,58,237,0.2)",
          animation: "slideUpFade .22s cubic-bezier(0.16,1,0.3,1) both",
        }} >
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", paddingRight: 6, borderRight: "1px solid var(--border2)" }}>
            {selected.size} selected
          </span>
          <button onClick={bulkComplete}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "var(--green-pale)", color: "var(--green)",
              border: "0.5px solid rgba(34,197,94,0.3)", cursor: "pointer", transition: "all .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--green)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--green-pale)"; (e.currentTarget as HTMLElement).style.color = "var(--green)"; }}>
            ✓ Mark Complete
          </button>
          <button onClick={bulkDelete}
            style={{
              padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "var(--red-pale)", color: "var(--red)",
              border: "0.5px solid rgba(239,68,68,0.3)", cursor: "pointer", transition: "all .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--red)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--red-pale)"; (e.currentTarget as HTMLElement).style.color = "var(--red)"; }}>
            🗑 Delete
          </button>
          <button onClick={clearSelection}
            style={{
              padding: "6px 10px", borderRadius: 8, fontSize: 11,
              background: "transparent", color: "var(--ink4)",
              border: "0.5px solid var(--border2)", cursor: "pointer",
            }}>
            ✕
          </button>
        </div>
      )}
      {/* ── Routines Section (embedded) ──────────────────────────────────── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        paddingTop: 20, marginTop: 8,
      }}>
        <RoutinesPanel showToast={showToast}/>
      </div>

      </>)}
    </div>
  );
}
