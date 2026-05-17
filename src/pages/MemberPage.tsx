// ─── src/pages/MemberPage.tsx ─────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  fetchMemberById, fetchTasksByMemberId, updateTask, updateMember,
  type FirestoreMember, type FirestoreTask,
} from "../lib/firebase";
import { Timestamp } from "firebase/firestore";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().split("T")[0]; }

function isOverdue(t: FirestoreTask) {
  return t.status !== "completed" && !!t.dueDate && t.dueDate < todayStr();
}

function effectiveStatus(t: FirestoreTask): "pending" | "in-progress" | "completed" | "overdue" {
  if (t.status === "completed") return "completed";
  if (isOverdue(t)) return "overdue";
  return t.status as "pending" | "in-progress";
}

function daysLabel(t: FirestoreTask): { text: string; color: string } {
  if (!t.dueDate) return { text: "", color: "#94a3b8" };
  const eff = effectiveStatus(t);
  if (eff === "completed") return { text: "Done", color: "#10B981" };
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(t.dueDate + "T00:00:00");
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0)  return { text: `${Math.abs(diff)}d overdue`, color: "#EF4444" };
  if (diff === 0) return { text: "Due today",  color: "#F59E0B" };
  if (diff === 1) return { text: "Tomorrow",   color: "#F59E0B" };
  return { text: `${diff}d left`, color: "#10B981" };
}

function fmtDate(s: string) {
  if (!s) return "—";
  return new Date(s + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTs(ts: Timestamp | undefined) {
  if (!ts) return "";
  return new Date(ts.toMillis?.() ?? 0).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Theme ────────────────────────────────────────────────────────────────────
function getTheme(): boolean {
  try { return localStorage.getItem("mp-theme") !== "light"; } catch { return true; }
}
function saveTheme(dark: boolean) {
  try { localStorage.setItem("mp-theme", dark ? "dark" : "light"); } catch { /**/ }
}

// ─── Status config ────────────────────────────────────────────────────────────
const SC = {
  pending:       { label: "Pending",     color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  "in-progress": { label: "In Progress", color: "#F59E0B", bg: "rgba(245,158,11,0.13)"  },
  completed:     { label: "Completed",   color: "#10B981", bg: "rgba(16,185,129,0.13)"  },
  overdue:       { label: "Overdue",     color: "#EF4444", bg: "rgba(239,68,68,0.13)"   },
};

const PC = {
  high:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",   label: "High"   },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  label: "Medium" },
  low:    { color: "#10B981", bg: "rgba(16,185,129,0.12)",  label: "Low"    },
};

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .mp-root[data-mp-dark="true"] {
    --mp-bg:       #07090F;
    --mp-panel:    rgba(255,255,255,.025);
    --mp-card:     rgba(255,255,255,.032);
    --mp-hover:    rgba(255,255,255,.048);
    --mp-border:   rgba(255,255,255,.07);
    --mp-border2:  rgba(255,255,255,.12);
    --mp-h:        #F1F5F9;
    --mp-body:     #CBD5E1;
    --mp-muted:    #64748B;
    --mp-input:    rgba(255,255,255,.06);
    --mp-scrollbar:#1E293B;
  }
  .mp-root[data-mp-dark="false"] {
    --mp-bg:       #F1F5F9;
    --mp-panel:    #FFFFFF;
    --mp-card:     #FFFFFF;
    --mp-hover:    #F8FAFC;
    --mp-border:   rgba(0,0,0,.08);
    --mp-border2:  rgba(0,0,0,.15);
    --mp-h:        #0F172A;
    --mp-body:     #475569;
    --mp-muted:    #94A3B8;
    --mp-input:    #F8FAFC;
    --mp-scrollbar:#CBD5E1;
  }

  .mp-root {
    min-height: 100vh;
    background: var(--mp-bg);
    font-family: 'Inter', sans-serif;
    color: var(--mp-body);
    transition: background .3s, color .3s;
  }

  .mp-root * { box-sizing: border-box; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--mp-scrollbar); border-radius: 99px; }

  @keyframes mp-spin { to { transform: rotate(360deg); } }
  @keyframes mp-fade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
  @keyframes mp-scale { from { opacity:0; transform:scale(.95) translateY(6px); } to { opacity:1; transform:none; } }

  .mp-card { animation: mp-fade .3s ease both; }
  .mp-modal-box { animation: mp-scale .22s cubic-bezier(0.16,1,0.3,1) both; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Spinner({ size = 18, color = "#6366F1" }: { size?: number; color?: string }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      border: `2px solid ${color}30`,
      borderTopColor: color,
      animation: "mp-spin .7s linear infinite",
      flexShrink: 0,
    }}/>
  );
}

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
      color, background: bg, borderRadius: 99, padding: "3px 9px",
      border: `1px solid ${color}30`, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────
function ReportModal({
  task, isDark, onClose, onDone,
}: {
  task: FirestoreTask; isDark: boolean; onClose: () => void; onDone: () => void;
}) {
  const isView = task.status === "completed";
  const [report, setReport] = useState(task.report ?? "");
  const [saving, setSaving] = useState(false);
  const eff = effectiveStatus(task);
  const sc  = SC[eff];

  async function submit() {
    if (!report.trim() || !task.id) return;
    setSaving(true);
    try {
      await updateTask(task.id, {
        report, status: "completed",
        completedAt: new Date().toISOString(),
        reportedBy: task.assignedToName,
      });
      onDone(); onClose();
    } finally { setSaving(false); }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(0,0,0,.6)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}>
      <div
        className="mp-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480, borderRadius: 20, overflow: "hidden",
          background: isDark ? "#13161E" : "#FFFFFF",
          border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
          boxShadow: "0 24px 80px rgba(0,0,0,.45)",
        }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 2 }}>
                {isView ? "Completion Report" : "Submit Report"}
              </h3>
              <p style={{ fontSize: 12, color: isDark ? "#64748B" : "#94A3B8" }}>
                {isView ? "Report submitted by team member" : "Describe what was accomplished"}
              </p>
            </div>
            <button onClick={onClose}
              style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                background: "transparent", color: isDark ? "#64748B" : "#94A3B8",
                cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              }}>✕</button>
          </div>

          {/* Task strip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
            background: isDark ? "rgba(255,255,255,.04)" : "#F8FAFC",
            borderRadius: 10, border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.06)"}`,
          }}>
            <div style={{
              width: 4, height: 36, borderRadius: 99, flexShrink: 0,
              background: PC[task.priority]?.color || "#6366F1",
            }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {task.title}
              </p>
              <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>
                Due {fmtDate(task.dueDate)}
              </p>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: sc.bg, color: sc.color, flexShrink: 0 }}>
              {sc.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: isDark ? "#64748B" : "#94A3B8", display: "block", marginBottom: 8 }}>
            {isView ? "Submitted Report" : "Completion Notes *"}
          </label>

          {isView ? (
            <div style={{
              padding: "14px 16px", borderRadius: 12, fontSize: 13, lineHeight: 1.7,
              background: "rgba(16,185,129,.08)", color: isDark ? "#6EE7B7" : "#065F46",
              border: "1px solid rgba(16,185,129,.2)", minHeight: 80,
            }}>
              {task.report || <em style={{ opacity: 0.6 }}>No report submitted.</em>}
            </div>
          ) : (
            <textarea
              value={report}
              onChange={(e) => setReport(e.target.value)}
              placeholder="What did you accomplish? Any blockers or notes for the manager…"
              rows={5}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 10,
                background: isDark ? "rgba(255,255,255,.05)" : "#F8FAFC",
                border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
                color: isDark ? "#F1F5F9" : "#0F172A", fontSize: 13, lineHeight: 1.7,
                resize: "vertical", outline: "none", fontFamily: "inherit",
                transition: "border-color .2s",
              }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#6366F1"; }}
              onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"; }}
            />
          )}

          {isView && task.completedAt && (
            <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginTop: 8 }}>
              Completed on {new Date(task.completedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        {/* Footer */}
        {!isView && (
          <div style={{
            padding: "14px 24px 20px", display: "flex", gap: 10,
            borderTop: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
          }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 500,
              border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
              background: "transparent", color: isDark ? "#64748B" : "#94A3B8", cursor: "pointer",
            }}>Cancel</button>
            <button onClick={submit} disabled={saving || !report.trim()} style={{
              flex: 1, padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: saving || !report.trim() ? "rgba(16,185,129,.4)" : "#10B981",
              border: "none", color: "white", cursor: saving || !report.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity .15s",
            }}>
              {saving ? <><Spinner size={14} color="white"/> Submitting…</> : "✓ Mark as Completed"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({
  task, isDark, onStart, onReport, starting,
}: {
  task: FirestoreTask; isDark: boolean;
  onStart: () => void; onReport: () => void;
  starting: boolean;
}) {
  const eff  = effectiveStatus(task);
  const sc   = SC[eff];
  const pc   = PC[task.priority];
  const due  = daysLabel(task);

  return (
    <div className="mp-card" style={{
      background: isDark ? "var(--mp-card)" : "#FFFFFF",
      border: `1px solid ${eff === "overdue" ? "rgba(239,68,68,.25)" : "var(--mp-border)"}`,
      borderRadius: 16, overflow: "hidden", position: "relative",
      transition: "box-shadow .2s, border-color .2s",
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = isDark ? "0 4px 24px rgba(0,0,0,.3)" : "0 4px 24px rgba(0,0,0,.08)"; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}>

      {/* Priority accent bar */}
      <div style={{ height: 3, background: pc.color, width: "100%" }}/>

      <div style={{ padding: "16px 18px" }}>

        {/* Top row: badges + status */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <Badge label={task.type} color="#6366F1" bg="rgba(99,102,241,.12)"/>
          <Badge label={pc.label} color={pc.color} bg={pc.bg}/>
          {due.text && (
            <span style={{ fontSize: 11, fontWeight: 600, color: due.color }}>{due.text}</span>
          )}
          <span style={{
            marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "3px 10px",
            borderRadius: 99, background: sc.bg, color: sc.color, flexShrink: 0,
          }}>
            {sc.label}
          </span>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 14, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A",
          marginBottom: 6, lineHeight: 1.4,
          textDecoration: eff === "completed" ? "line-through" : "none",
          opacity: eff === "completed" ? 0.6 : 1,
        }}>
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p style={{
            fontSize: 12, color: isDark ? "#64748B" : "#94A3B8",
            lineHeight: 1.6, marginBottom: 12,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {task.description}
          </p>
        )}

        {/* Completed report preview */}
        {eff === "completed" && task.report && (
          <div style={{
            padding: "10px 12px", borderRadius: 10, marginBottom: 12,
            background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)",
            fontSize: 12, color: "#10B981", lineHeight: 1.5,
          }}>
            <span style={{ fontWeight: 700 }}>Report: </span>
            {task.report.slice(0, 140)}{task.report.length > 140 ? "…" : ""}
          </div>
        )}

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: isDark ? "#64748B" : "#94A3B8" }}>
            📅 {fmtDate(task.dueDate)}
          </span>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {eff === "pending" && (
              <button onClick={onStart} disabled={starting} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "rgba(99,102,241,.12)", color: "#6366F1",
                border: "1px solid rgba(99,102,241,.25)", cursor: starting ? "default" : "pointer",
                opacity: starting ? 0.7 : 1, transition: "all .15s",
              }}
              onMouseEnter={(e) => { if (!starting) (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,.22)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,.12)"; }}>
                {starting ? <Spinner size={12} color="#6366F1"/> : "▷"} Start Task
              </button>
            )}

            {(eff === "in-progress" || eff === "overdue") && (
              <button onClick={onReport} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "#10B981", color: "white",
                border: "none", cursor: "pointer", transition: "opacity .15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
                ✓ Submit Report
              </button>
            )}

            {eff === "completed" && (
              <button onClick={onReport} style={{
                padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "rgba(16,185,129,.12)", color: "#10B981",
                border: "1px solid rgba(16,185,129,.25)", cursor: "pointer",
              }}>
                View Report
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Not Found ────────────────────────────────────────────────────────────────
function NotFound({ isDark }: { isDark: boolean }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 32 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A" }}>Member not found</h2>
      <p style={{ fontSize: 14, color: isDark ? "#64748B" : "#94A3B8", textAlign: "center", maxWidth: 320 }}>
        This link may be invalid or the member has been removed. Contact your admin.
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MEMBER PAGE
// ═════════════════════════════════════════════════════════════════════════════

export function MemberPage() {
  const memberId = window.location.pathname.split("/")[2] ?? "";

  const [member,      setMember]      = useState<FirestoreMember | null>(null);
  const [tasks,       setTasks]       = useState<FirestoreTask[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [notFound,    setNotFound]    = useState(false);
  const [isDark,      setIsDark]      = useState(() => getTheme());
  const [filter,      setFilter]      = useState<"all" | "pending" | "in-progress" | "completed" | "overdue">("all");
  const [reportTask,  setReportTask]  = useState<FirestoreTask | null>(null);
  const [startingId,  setStartingId]  = useState<string | null>(null);
  const [toast,       setToast]       = useState<string | null>(null);
  const [emailInput,  setEmailInput]  = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

  const toggleTheme = () => { const d = !isDark; setIsDark(d); saveTheme(d); };

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    if (!memberId) { setNotFound(true); setLoading(false); return; }
    setLoading(true);
    try {
      const [m, t] = await Promise.all([fetchMemberById(memberId), fetchTasksByMemberId(memberId)]);
      if (!m) { setNotFound(true); } else { setMember(m); setTasks(t); setEmailInput(m.email ?? ""); }
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  }, [memberId]);

  useEffect(() => { load(); }, [load]);

  async function saveEmail() {
    if (!memberId) return;
    const trimmed = emailInput.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      showToast("Please enter a valid email address.");
      return;
    }
    setEmailSaving(true);
    try {
      await updateMember(memberId, { email: trimmed });
      setMember((prev) => prev ? { ...prev, email: trimmed } : prev);
      showToast(trimmed ? "Email saved! You'll be notified on new tasks ✉️" : "Email removed.");
    } catch { showToast("Failed to save email."); }
    finally { setEmailSaving(false); }
  }

  async function handleStart(task: FirestoreTask) {
    if (!task.id) return;
    setStartingId(task.id);
    try {
      await updateTask(task.id, { status: "in-progress" });
      await load();
      showToast("Task started! Good luck 🚀");
    } finally { setStartingId(null); }
  }

  const stats = {
    total:      tasks.length,
    pending:    tasks.filter((t) => effectiveStatus(t) === "pending").length,
    inProgress: tasks.filter((t) => effectiveStatus(t) === "in-progress").length,
    completed:  tasks.filter((t) => effectiveStatus(t) === "completed").length,
    overdue:    tasks.filter((t) => isOverdue(t)).length,
  };

  const filtered = tasks.filter((t) => {
    if (filter === "all") return true;
    return effectiveStatus(t) === filter;
  });

  // Sort: overdue first, then pending, in-progress, completed last
  const sorted = [...filtered].sort((a, b) => {
    const order = { overdue: 0, pending: 1, "in-progress": 2, completed: 3 };
    return (order[effectiveStatus(a)] ?? 4) - (order[effectiveStatus(b)] ?? 4);
  });

  const dark = isDark ? "true" : "false";

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="mp-root" data-mp-dark={dark}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 12 }}>
          <Spinner size={28} color="#6366F1"/>
          <span style={{ color: isDark ? "#64748B" : "#94A3B8", fontSize: 14 }}>Loading your tasks…</span>
        </div>
      </>
    );
  }

  if (notFound || !member) {
    return (
      <>
        <style>{CSS}</style>
        <div className="mp-root" data-mp-dark={dark}>
          <NotFound isDark={isDark}/>
        </div>
      </>
    );
  }

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <>
      <style>{CSS}</style>
      <div className="mp-root" data-mp-dark={dark} style={{ minHeight: "100vh" }}>

        {/* ── Navbar ──────────────────────────────────────────────────────────── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: isDark ? "rgba(7,9,15,.95)" : "rgba(241,245,249,.95)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.08)"}`,
          padding: "0 24px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: member.color || "#6366F1",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0,
            }}>
              {member.initials || member.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A" }}>
                {member.name}
              </span>
              <span style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginLeft: 6 }}>
                · Task Portal
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {stats.overdue > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                background: "rgba(239,68,68,.12)", color: "#EF4444",
                border: "1px solid rgba(239,68,68,.25)",
              }}>
                {stats.overdue} overdue
              </span>
            )}
            <button onClick={toggleTheme} style={{
              width: 32, height: 32, borderRadius: 8, cursor: "pointer",
              background: isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)",
              border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
              color: isDark ? "#94A3B8" : "#64748B", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {isDark ? "☀" : "☽"}
            </button>
          </div>
        </nav>

        {/* ── Hero / Profile ───────────────────────────────────────────────────── */}
        <div style={{
          padding: "32px 24px 24px",
          background: isDark
            ? `linear-gradient(160deg, ${member.color}18 0%, transparent 60%)`
            : `linear-gradient(160deg, ${member.color}12 0%, transparent 60%)`,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.07)"}`,
        }}>
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>

              {/* Avatar */}
              <div style={{
                width: 68, height: 68, borderRadius: 20, flexShrink: 0,
                border: `3px solid ${member.color}40`,
                background: member.imageUrl ? "transparent" : `${member.color}20`,
                overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {member.imageUrl
                  ? <img src={member.imageUrl} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
                  : <span style={{ fontSize: 24, fontWeight: 800, color: member.color }}>{member.initials}</span>
                }
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: isDark ? "#F1F5F9" : "#0F172A", marginBottom: 4 }}>
                  {member.name}
                </h1>
                <p style={{ fontSize: 13, color: isDark ? "#64748B" : "#94A3B8" }}>{member.role}</p>
              </div>

              {/* Completion ring */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="26" fill="none" stroke={isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"} strokeWidth="6"/>
                  <circle cx="32" cy="32" r="26" fill="none"
                    stroke={member.color || "#6366F1"} strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - completionPct / 100)}`}
                    transform="rotate(-90 32 32)"
                    style={{ transition: "stroke-dashoffset .6s ease" }}
                  />
                  <text x="32" y="37" textAnchor="middle" fontSize="13" fontWeight="800" fill={member.color || "#6366F1"}>
                    {completionPct}%
                  </text>
                </svg>
                <p style={{ fontSize: 10, color: isDark ? "#64748B" : "#94A3B8", marginTop: 2 }}>Done</p>
              </div>
            </div>

            {/* Stat pills */}
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {[
                { label: "Total",       value: stats.total,      color: "#6366F1" },
                { label: "Pending",     value: stats.pending,    color: "#94A3B8" },
                { label: "In Progress", value: stats.inProgress, color: "#F59E0B" },
                { label: "Completed",   value: stats.completed,  color: "#10B981" },
                { label: "Overdue",     value: stats.overdue,    color: "#EF4444" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  padding: "8px 14px", borderRadius: 10,
                  background: isDark ? "rgba(255,255,255,.04)" : "rgba(0,0,0,.04)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,.07)" : "rgba(0,0,0,.07)"}`,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color }}>{value}</span>
                  <span style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 48px" }}>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {(["all", "pending", "in-progress", "completed", "overdue"] as const).map((f) => {
              const labels: Record<string, string> = {
                all: `All (${stats.total})`,
                pending: `Pending (${stats.pending})`,
                "in-progress": `In Progress (${stats.inProgress})`,
                completed: `Completed (${stats.completed})`,
                overdue: `Overdue (${stats.overdue})`,
              };
              const active = filter === f;
              const accentColor = f === "overdue" ? "#EF4444" : f === "completed" ? "#10B981" : f === "in-progress" ? "#F59E0B" : "#6366F1";
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: active ? `${accentColor}18` : "transparent",
                  border: `1px solid ${active ? accentColor : (isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)")}`,
                  color: active ? accentColor : (isDark ? "#64748B" : "#94A3B8"),
                  transition: "all .15s",
                }}>
                  {labels[f]}
                </button>
              );
            })}

            <button onClick={load} style={{
              marginLeft: "auto", padding: "7px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600,
              background: "transparent", cursor: "pointer",
              border: `1px solid ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
              color: isDark ? "#64748B" : "#94A3B8", transition: "all .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#6366F1"; (e.currentTarget as HTMLElement).style.color = "#6366F1"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"; (e.currentTarget as HTMLElement).style.color = isDark ? "#64748B" : "#94A3B8"; }}>
              ↻ Refresh
            </button>
          </div>

          {/* Task list */}
          {sorted.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "64px 32px",
              border: `2px dashed ${isDark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.1)"}`,
              borderRadius: 20, color: isDark ? "#475569" : "#CBD5E1",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: isDark ? "#64748B" : "#94A3B8", marginBottom: 6 }}>
                {tasks.length === 0 ? "No tasks assigned yet" : "No tasks match this filter"}
              </p>
              <p style={{ fontSize: 13 }}>
                {tasks.length === 0 ? "Your manager will assign tasks here soon." : "Try selecting a different filter above."}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sorted.map((t) => (
                <TaskCard
                  key={t.id} task={t} isDark={isDark}
                  starting={startingId === t.id}
                  onStart={() => handleStart(t)}
                  onReport={() => setReportTask(t)}
                />
              ))}
            </div>
          )}

          {/* Email notification settings */}
          <div style={{
            marginTop: 36, padding: "20px 22px", borderRadius: 16,
            background: isDark ? "rgba(99,102,241,.07)" : "rgba(99,102,241,.05)",
            border: `1px solid ${isDark ? "rgba(99,102,241,.2)" : "rgba(99,102,241,.18)"}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                background: "rgba(99,102,241,.15)", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15,
              }}>✉️</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#C7D2FE" : "#4338CA", margin: 0 }}>
                  Task Notifications
                </p>
                <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", margin: 0, marginTop: 1 }}>
                  Get an email whenever a new task is assigned to you
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveEmail(); }}
                placeholder="your@email.com"
                style={{
                  flex: 1, padding: "9px 13px", borderRadius: 10, fontSize: 13,
                  background: isDark ? "rgba(255,255,255,.06)" : "#FFFFFF",
                  border: `1px solid ${isDark ? "rgba(255,255,255,.12)" : "rgba(99,102,241,.3)"}`,
                  color: isDark ? "#F1F5F9" : "#0F172A", outline: "none", fontFamily: "inherit",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#6366F1"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = isDark ? "rgba(255,255,255,.12)" : "rgba(99,102,241,.3)"; }}
              />
              <button onClick={saveEmail} disabled={emailSaving} style={{
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: emailSaving ? "rgba(99,102,241,.4)" : "#6366F1",
                border: "none", color: "white", cursor: emailSaving ? "default" : "pointer",
                transition: "opacity .15s", flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
              }}>
                {emailSaving
                  ? <><Spinner size={13} color="white"/> Saving…</>
                  : (member?.email && emailInput === member.email ? "✓ Saved" : "Save")}
              </button>
            </div>
            {member?.email && (
              <p style={{ fontSize: 11, color: isDark ? "#64748B" : "#94A3B8", marginTop: 8, marginBottom: 0 }}>
                Currently notifying: <strong style={{ color: isDark ? "#A5B4FC" : "#4F46E5" }}>{member.email}</strong>
              </p>
            )}
          </div>

          {/* Last refreshed */}
          <p style={{ fontSize: 11, color: isDark ? "#334155" : "#CBD5E1", textAlign: "center", marginTop: 24 }}>
            Last updated · {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* ── Report Modal ─────────────────────────────────────────────────────── */}
        {reportTask && (
          <ReportModal
            task={reportTask} isDark={isDark}
            onClose={() => setReportTask(null)}
            onDone={() => { load(); setReportTask(null); showToast("Report submitted! Great work ✅"); }}
          />
        )}

        {/* ── Toast ────────────────────────────────────────────────────────────── */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
            zIndex: 200, padding: "12px 20px", borderRadius: 12, fontSize: 13, fontWeight: 600,
            background: isDark ? "#1E293B" : "#0F172A", color: "#F1F5F9",
            boxShadow: "0 8px 32px rgba(0,0,0,.4)",
            animation: "mp-fade .25s ease both", whiteSpace: "nowrap",
          }}>
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
