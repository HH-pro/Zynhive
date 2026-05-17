// ─── src/components/admin/OverviewTab.tsx ────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import {
  fetchProjects, fetchLeads, fetchMembers, fetchTasks, fetchClients,
  type FirestoreProject, type FirestoreLead, type FirestoreMember,
  type FirestoreTask, type FirestoreClient,
} from "../../lib/firebase";
import { Timestamp } from "firebase/firestore";

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  showToast:           (msg: string, type?: "success" | "error") => void;
  onNavigate:          (tab: string) => void;
  onOpenReviews?:      () => void;
  pendingReviewsCount?: number;
  user:                { email: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function isOverdue(task: FirestoreTask): boolean {
  if (task.status === "completed") return false;
  return !!task.dueDate && task.dueDate < todayStr();
}

function timeAgo(ts: Timestamp | undefined): string {
  if (!ts) return "";
  const ms = ts.toMillis?.() ?? 0;
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(diff / 3600000);
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  const d = new Date(ms);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function greeting(email: string): string {
  const hour = new Date().getHours();
  const name = email.split("@")[0];
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function formatFullDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

function daysOverdue(task: FirestoreTask): number {
  if (!task.dueDate) return 0;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const due = new Date(task.dueDate + "T00:00:00");
  return Math.round((now.getTime() - due.getTime()) / 86400000);
}

function toMillis(ts: Timestamp | undefined): number {
  return ts?.toMillis?.() ?? 0;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 16, w = "100%", r = 8 }: { h?: number; w?: string | number; r?: number }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        borderRadius: r,
        background: "var(--bg-alt)",
        animation: "pulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border)",
        borderRadius: 14,
        padding: "20px 22px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────
function CardHeader({
  title,
  action,
  count,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
  count?: number | string;
}) {
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
      <div className="flex items-center gap-2">
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{title}</span>
        {count !== undefined && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--ink3)",
              background: "var(--bg-alt)",
              padding: "1px 7px",
              borderRadius: 99,
            }}
          >
            {count}
          </span>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            fontSize: 11,
            color: "var(--accent)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            padding: 0,
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.7")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
        >
          {action.label} →
        </button>
      )}
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  sub,
  subColor,
  icon,
  iconBg,
  color,
  onClick,
}: {
  label:     string;
  value:     number | string;
  sub:       string;
  subColor?: string;
  icon:      React.ReactNode;
  iconBg:    string;
  color?:    string;
  onClick?:  () => void;
}) {
  const accentColor = color ?? "#6366F1";
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { onClick, type: "button" as const } : {})}
      style={{
        background: "var(--bg-card)",
        border: "0.5px solid var(--border)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "box-shadow .25s, transform .2s",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        width: "100%",
        fontFamily: "'DM Sans', sans-serif",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `0 0 0 1px ${accentColor}30, 0 8px 24px ${accentColor}18`;
        el.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "none";
        el.style.transform = "translateY(0)";
      }}
    >
      {/* Gradient top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accentColor}, ${accentColor}80)` }} />
      <div style={{ padding: "14px 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink4)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}
          </span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: subColor ?? "var(--ink4)", fontWeight: 400 }}>
          {sub}{onClick && (value as number) > 0 && <span style={{ marginLeft: 4, color: accentColor }}>→</span>}
        </div>
      </div>
    </Tag>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  new:        { bg: "#EEF2FF", color: "#6366F1" },
  contacted:  { bg: "#EFF6FF", color: "#378ADD" },
  qualified:  { bg: "#FFFBEB", color: "#F59E0B" },
  proposal:   { bg: "#F5F3FF", color: "#8B5CF6" },
  closed:     { bg: "#ECFDF5", color: "#10B981" },
  lost:       { bg: "#FEF2F2", color: "#EF4444" },
};

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLORS[status] ?? { bg: "var(--bg-alt)", color: "var(--ink3)" };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        padding: "3px 8px",
        borderRadius: 99,
        background: c.bg,
        color: c.color,
        letterSpacing: "0.03em",
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

// ─── Priority dot ─────────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  high:   "var(--red)",
  medium: "var(--gold)",
  low:    "var(--green)",
};

function PriorityDot({ priority }: { priority: string }) {
  return (
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: PRIORITY_COLORS[priority] ?? "var(--ink4)",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, color, size = 32 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const bg = color ?? "#6366F1";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.35,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "0.02em",
      }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const Icons = {
  leads: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  projects: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  tasks: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  team: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
    </svg>
  ),
  clients: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
    </svg>
  ),
  followup: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  ),
  arrow: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  analytics: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  warning: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  reviews: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3z"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
};

// ─── Quick Action Button ───────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px 10px",
        background: hovered ? color : "var(--bg-alt)",
        border: `0.5px solid ${hovered ? "transparent" : "var(--border)"}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all .2s var(--ease)",
        fontFamily: "'DM Sans', sans-serif",
        color: hovered ? "#fff" : "var(--ink2)",
      }}
    >
      <div style={{ color: hovered ? "#fff" : color, transition: "color .2s" }}>{icon}</div>
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.02em" }}>{label}</span>
    </button>
  );
}

// ─── Loading Skeleton Layout ───────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {/* header */}
      <div className="flex items-center justify-between">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton h={22} w={220} />
          <Skeleton h={14} w={160} />
        </div>
        <Skeleton h={36} w={90} r={10} />
      </div>

      {/* kpi row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 14, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="flex items-center justify-between">
              <Skeleton h={12} w={80} />
              <Skeleton h={34} w={34} r={9} />
            </div>
            <Skeleton h={28} w={50} />
            <Skeleton h={12} w={100} />
          </div>
        ))}
      </div>

      {/* main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <Skeleton h={14} w={120} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={20} />)}
            </div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
            <Skeleton h={14} w={140} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h={20} />)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 14, padding: "20px 22px" }}>
              <Skeleton h={14} w={100} />
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from({ length: 3 }).map((_, j) => <Skeleton key={j} h={16} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function OverviewTab({ showToast, onNavigate, onOpenReviews, pendingReviewsCount = 0, user }: Props) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [leads, setLeads] = useState<FirestoreLead[]>([]);
  const [members, setMembers] = useState<FirestoreMember[]>([]);
  const [tasks, setTasks] = useState<FirestoreTask[]>([]);
  const [clients, setClients] = useState<FirestoreClient[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, l, m, t, c] = await Promise.all([
        fetchProjects(),
        fetchLeads(),
        fetchMembers(),
        fetchTasks(),
        fetchClients(),
      ]);
      setProjects(p);
      setLeads(l);
      setMembers(m);
      setTasks(t);
      setClients(c);
    } catch {
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived data ────────────────────────────────────────────────────────────
  const today = todayStr();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  const newThisWeek = leads.filter((l) => {
    const ms = toMillis(l.createdAt as Timestamp | undefined);
    return ms > new Date(weekAgo + "T00:00:00").getTime();
  }).length;

  const featuredCount = projects.filter((p) => p.featured).length;

  const openTasks = tasks.filter((t) => t.status === "pending" || t.status === "in-progress");
  const overdueTasks = tasks.filter((t) => isOverdue(t));

  const followupsDue = leads.filter(
    (l) =>
      l.followUpDate &&
      l.followUpDate <= today &&
      l.status !== "closed" &&
      l.status !== "lost"
  );

  // pipeline
  const PIPELINE_STATUSES = [
    { key: "new",       label: "New",       color: "#6366F1" },
    { key: "contacted", label: "Contacted", color: "#378ADD" },
    { key: "qualified", label: "Qualified", color: "#F59E0B" },
    { key: "proposal",  label: "Proposal",  color: "#8B5CF6" },
    { key: "closed",    label: "Closed",    color: "#10B981" },
    { key: "lost",      label: "Lost",      color: "#EF4444" },
  ] as const;
  const pipelineCounts: Record<string, number> = {};
  PIPELINE_STATUSES.forEach(({ key }) => {
    pipelineCounts[key] = leads.filter((l) => l.status === key).length;
  });

  // attention tasks: overdue first, then high priority pending (max 5)
  const attentionTasks = [
    ...overdueTasks.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")),
    ...tasks.filter((t) => t.priority === "high" && t.status === "pending" && !isOverdue(t)),
  ].filter((v, i, self) => self.findIndex((x) => x.id === v.id) === i).slice(0, 5);

  // recent leads
  const recentLeads = [...leads]
    .sort((a, b) => toMillis(b.createdAt as Timestamp | undefined) - toMillis(a.createdAt as Timestamp | undefined))
    .slice(0, 5);

  // team workload
  const tasksByMember: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.assignedToId && t.status !== "completed") {
      tasksByMember[t.assignedToId] = (tasksByMember[t.assignedToId] ?? 0) + 1;
    }
  });
  const maxTaskCount = Math.max(...Object.values(tasksByMember), 1);

  // project overview
  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))];
  const projectsWithImages = projects.filter((p) => p.imageUrl).length;
  const recentProjects = projects.slice(0, 4);

  if (loading) return (
    <div style={{ padding: "2px 0" }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
      <LoadingSkeleton />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, fontFamily: "'DM Sans', sans-serif", padding: "20px 20px 32px" }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @media (max-width: 1024px) {
          .overview-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 860px) {
          .overview-kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 560px) {
          .overview-kpi-grid  { grid-template-columns: repeat(2, 1fr) !important; }
          .overview-qa-grid   { grid-template-columns: repeat(2, 1fr) !important; }
          .overview-proj-grid { grid-template-columns: 1fr !important; }
          .overview-proj-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between" style={{ flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", margin: 0, lineHeight: 1.2 }}>
            {greeting(user.email)}
          </h1>
          <p style={{ fontSize: 13, color: "var(--ink3)", margin: "5px 0 0", fontWeight: 400 }}>
            {formatFullDate()}
          </p>
        </div>
        <button
          onClick={loadAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 16px",
            background: "var(--bg-card)",
            border: "0.5px solid var(--border)",
            borderRadius: 10,
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--ink2)",
            fontFamily: "'DM Sans', sans-serif",
            transition: "all .2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--accent-pale)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--ink2)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
        >
          <span style={{ color: "inherit" }}>{Icons.refresh}</span>
          Refresh
        </button>
      </div>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div
        className="overview-kpi-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}
      >
        <KpiCard
          label="Total Leads"
          value={leads.length}
          sub={`+${newThisWeek} new this week`}
          icon={<span style={{ color: "#6366F1" }}>{Icons.leads}</span>}
          iconBg="rgba(99,102,241,0.12)"
          color="#6366F1"
        />
        <KpiCard
          label="Active Projects"
          value={projects.length}
          sub={`${featuredCount} featured`}
          icon={<span style={{ color: "#378ADD" }}>{Icons.projects}</span>}
          iconBg="rgba(55,138,221,0.12)"
          color="#378ADD"
        />
        <KpiCard
          label="Open Tasks"
          value={openTasks.length}
          sub={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : "All on track"}
          subColor={overdueTasks.length > 0 ? "var(--red)" : "var(--green)"}
          icon={<span style={{ color: "#10B981" }}>{Icons.tasks}</span>}
          iconBg="rgba(16,185,129,0.12)"
          color={overdueTasks.length > 0 ? "#EF4444" : "#10B981"}
        />
        <KpiCard
          label="Team Members"
          value={members.length}
          sub="Active contributors"
          icon={<span style={{ color: "#8B5CF6" }}>{Icons.team}</span>}
          iconBg="rgba(139,92,246,0.12)"
          color="#8B5CF6"
        />
        <KpiCard
          label="Active Clients"
          value={clients.length}
          sub="With portal access"
          icon={<span style={{ color: "#F59E0B" }}>{Icons.clients}</span>}
          iconBg="rgba(245,158,11,0.12)"
          color="#F59E0B"
        />
        <KpiCard
          label="Follow-ups Due"
          value={followupsDue.length}
          sub={followupsDue.length > 0 ? "Requires attention" : "All clear"}
          subColor={followupsDue.length > 0 ? "var(--red)" : "var(--green)"}
          icon={<span style={{ color: followupsDue.length > 0 ? "#EF4444" : "#F59E0B" }}>{Icons.followup}</span>}
          iconBg={followupsDue.length > 0 ? "rgba(239,68,68,0.12)" : "rgba(245,158,11,0.12)"}
          color={followupsDue.length > 0 ? "#EF4444" : "#F59E0B"}
        />
        <KpiCard
          label="Pending Reviews"
          value={pendingReviewsCount}
          sub={pendingReviewsCount > 0 ? "Tap to review" : "All approved"}
          subColor={pendingReviewsCount > 0 ? "var(--gold)" : "var(--green)"}
          icon={<span style={{ color: pendingReviewsCount > 0 ? "#F59E0B" : "#10B981" }}>{Icons.reviews}</span>}
          iconBg={pendingReviewsCount > 0 ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)"}
          color={pendingReviewsCount > 0 ? "#F59E0B" : "#10B981"}
          onClick={onOpenReviews}
        />
      </div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div
        className="overview-main-grid"
        style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, alignItems: "start" }}
      >
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Lead Pipeline */}
          <Card>
            <CardHeader
              title="Lead Pipeline"
              count={leads.length}
              action={{ label: "View all", onClick: () => onNavigate("leads") }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {PIPELINE_STATUSES.map(({ key, label, color }) => {
                const count = pipelineCounts[key] ?? 0;
                const pct = leads.length > 0 ? (count / leads.length) * 100 : 0;
                return (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: color,
                        flexShrink: 0,
                        boxShadow: `0 0 6px ${color}80`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "var(--ink2)",
                        width: 68,
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 8,
                        background: "var(--bg-alt)",
                        borderRadius: 99,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}99)`,
                          borderRadius: 99,
                          transition: "width .7s var(--ease)",
                          boxShadow: pct > 0 ? `0 0 6px ${color}60` : "none",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color,
                        width: 22,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {count}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--ink4)",
                        width: 36,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Needs Attention */}
          <Card>
            <CardHeader
              title="Needs Attention"
              action={{ label: "View Tasks", onClick: () => onNavigate("tasks") }}
            />
            {attentionTasks.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px 0",
                  color: "var(--ink3)",
                  fontSize: 13,
                }}
              >
                <div style={{ marginBottom: 6, fontSize: 22 }}>✓</div>
                No urgent tasks — all caught up!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {attentionTasks.map((task) => {
                  const overdue = isOverdue(task);
                  const days = overdue ? daysOverdue(task) : 0;
                  return (
                    <div
                      key={task.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "9px 10px",
                        borderRadius: 9,
                        background: "transparent",
                        transition: "background .15s",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-alt)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                      }
                    >
                      <PriorityDot priority={task.priority} />
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: "var(--ink)",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.title}
                      </span>
                      {task.assignedToName && (
                        <Avatar
                          name={task.assignedToName}
                          color={task.assignedToColor}
                          size={24}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: overdue ? "var(--red)" : "var(--gold)",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                        }}
                      >
                        {overdue ? (
                          <>
                            <span style={{ color: "var(--red)" }}>{Icons.warning}</span>
                            {days}d overdue
                          </>
                        ) : (
                          "High priority"
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Recent Leads */}
          <Card>
            <CardHeader
              title="Recent Leads"
              action={{ label: "View all", onClick: () => onNavigate("leads") }}
            />
            {recentLeads.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink3)", fontSize: 13 }}>
                No leads yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 9,
                      transition: "background .15s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-alt)")
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                    }
                  >
                    <Avatar
                      name={lead.companyName || lead.email || "?"}
                      color={
                        lead.priority === "high"
                          ? "#EF4444"
                          : lead.priority === "low"
                          ? "#10B981"
                          : "#6366F1"
                      }
                      size={32}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: "var(--ink)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lead.companyName || lead.email}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 1 }}>
                        {timeAgo(lead.createdAt as Timestamp | undefined)}
                      </div>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <div
              className="overview-qa-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}
            >
              <QuickAction
                icon={Icons.plus}
                label="Add Lead"
                onClick={() => onNavigate("leads")}
                color="#6366F1"
              />
              <QuickAction
                icon={Icons.tasks}
                label="New Task"
                onClick={() => onNavigate("tasks")}
                color="#10B981"
              />
              <QuickAction
                icon={Icons.projects}
                label="Add Project"
                onClick={() => onNavigate("projects")}
                color="#378ADD"
              />
              <QuickAction
                icon={Icons.clients}
                label="Add Client"
                onClick={() => onNavigate("clients")}
                color="#F59E0B"
              />
              <QuickAction
                icon={Icons.team}
                label="Add Member"
                onClick={() => onNavigate("team")}
                color="#8B5CF6"
              />
              <QuickAction
                icon={Icons.analytics}
                label="Analytics"
                onClick={() => onNavigate("analytics")}
                color="#EF4444"
              />
            </div>
          </Card>

          {/* Team Workload */}
          <Card>
            <CardHeader title="Team Workload" action={{ label: "Manage", onClick: () => onNavigate("team") }} />
            {members.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--ink3)", fontSize: 13 }}>
                No team members yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {members.map((member) => {
                  const count = tasksByMember[member.id ?? ""] ?? 0;
                  const pct = (count / maxTaskCount) * 100;
                  return (
                    <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        />
                      ) : (
                        <Avatar name={member.name} color={member.color} size={30} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "var(--ink)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "60%",
                            }}
                          >
                            {member.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: count === 0 ? "var(--ink4)" : "var(--accent)",
                            }}
                          >
                            {count === 0 ? "No tasks" : `${count} task${count !== 1 ? "s" : ""}`}
                          </span>
                        </div>
                        <div
                          style={{
                            height: 4,
                            background: "var(--bg-alt)",
                            borderRadius: 99,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct}%`,
                              background: count === 0 ? "var(--bg-alt)" : "var(--accent)",
                              borderRadius: 99,
                              transition: "width .6s var(--ease)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Project Overview ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader
          title="Project Overview"
          count={projects.length}
          action={{ label: "Manage projects", onClick: () => onNavigate("projects") }}
        />

        {/* Stats row */}
        <div
          className="overview-proj-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: "Total Projects", value: projects.length, color: "var(--accent)" },
            { label: "Featured", value: featuredCount, color: "var(--gold)" },
            { label: "With Images", value: projectsWithImages, color: "var(--green)" },
            { label: "Categories", value: categories.length, color: "var(--purple)" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "var(--bg-alt)",
                borderRadius: 10,
                padding: "12px 14px",
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2, fontWeight: 500 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Project list */}
        {recentProjects.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink3)", fontSize: 13 }}>
            No projects yet
          </div>
        ) : (
          <div
            className="overview-proj-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 10,
            }}
          >
            {recentProjects.map((project) => (
              <div
                key={project.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  background: "var(--bg-alt)",
                  borderRadius: 10,
                  transition: "background .15s",
                  cursor: "default",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-panel)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "var(--bg-alt)")
                }
              >
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: project.color || "var(--accent-pale)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {project.emoji || "📁"}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--ink)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {project.title}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}>
                    {project.category}
                  </div>
                </div>
                {project.featured && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "3px 7px",
                      borderRadius: 99,
                      background: "var(--gold-pale)",
                      color: "var(--gold)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    Featured
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Footer spacer ────────────────────────────────────────────────────── */}
      <div style={{ height: 8 }} />
    </div>
  );
}
