// ─── src/pages/admin/AdminDashboard.tsx ─────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminLogout, fetchProjects, deleteProject, type FirestoreProject,
} from "../../lib/firebase";
import { ProjectForm }        from "../../components/admin/ProjectForm";
import { TeamTab }            from "../../components/admin/TeamTab";
import { LeadTab }            from "../../components/admin/Leadtab";
import { getCloudinaryThumb } from "../../lib/cloudinary";
import type { User }          from "firebase/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props { user: User; }
type Tab = "projects" | "team" | "leads" | "analytics";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  accent:  "#3B82F6",
  cyan:    "#06B6D4",
  gold:    "#F59E0B",
  green:   "#10B981",
  red:     "#EF4444",
  purple:  "#8B5CF6",
  accent2: "#6366F1",
} as const;

const THEME_CSS = `
  :root {
    --bg:          #080C14;
    --bg-alt:      #0D1220;
    --bg-surface:  #111827;
    --bg-panel:    #0F1623;
    --bg-card:     #131D2E;
    --border:      rgba(255,255,255,0.05);
    --border2:     rgba(255,255,255,0.08);
    --ink:         #F0F4FF;
    --ink2:        #C8D3E8;
    --ink3:        #8A9BB8;
    --ink4:        #4A5878;
    --accent:      #3B82F6;
    --accent2:     #6366F1;
    --cyan:        #06B6D4;
    --gold:        #F59E0B;
    --green:       #10B981;
    --red:         #EF4444;
    --accent-pale:  rgba(59,130,246,0.08);
    --accent-pale2: rgba(59,130,246,0.18);
    --accent-dim:   rgba(59,130,246,0.25);
    --shadow-lg:    0 24px 64px rgba(0,0,0,0.6);
  }
  @keyframes fadeScaleIn {
    from { opacity:0; transform:scale(0.94); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes slideInRight {
    from { transform:translateX(100%); opacity:0; }
    to   { transform:translateX(0);    opacity:1; }
  }
  @keyframes toastIn {
    from { opacity:0; transform:translateY(16px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

// ─── Theme injector ───────────────────────────────────────────────────────────
function ThemeInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = THEME_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = {
  Projects: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
  Team: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1 12c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="11" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M13 10.5c0-1.5-.9-2.5-2.2-2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  Leads: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 3h11M1.5 7h7M1.5 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="11.5" cy="10" r="2" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 11L4 7.5l3 2.5 3-5 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Edit: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  ),
  Delete: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1.5 3h8M4 3V1.5h3V3M3.5 3l.5 6.5M7.5 3l-.5 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  Logout: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M8.5 4.5L11 6.5l-2.5 2M5 6.5h6M5 2H2.5A1 1 0 001.5 3v7a1 1 0 001 1H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Chevron: ({ dir }: { dir: "left" | "right" }) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d={dir === "right" ? "M4 2l4 4-4 4" : "M8 2L4 6l4 4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "projects",  label: "Projects",  icon: <Icon.Projects /> },
  { id: "team",      label: "Team",      icon: <Icon.Team /> },
  { id: "leads",     label: "Leads",     icon: <Icon.Leads />, badge: "3" },
  { id: "analytics", label: "Analytics", icon: <Icon.Analytics /> },
];

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { msg: string; type: "success" | "error"; onClose: () => void; }
function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background:   type === "success" ? "var(--bg-card)" : "rgba(30,8,8,0.95)",
        border:       `1px solid ${type === "success" ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.25)"}`,
        color:        type === "success" ? "var(--ink2)" : "#FCA5A5",
        boxShadow:    "0 8px 32px rgba(0,0,0,0.5)",
        animation:    "toastIn .3s cubic-bezier(0.16,1,0.3,1) both",
        fontFamily:   "'DM Sans', sans-serif",
        fontSize:     13,
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: type === "success" ? "linear-gradient(135deg,#3B82F6,#06B6D4)" : "rgba(239,68,68,0.15)",
          color:      type === "success" ? "white" : "#F87171",
          boxShadow:  type === "success" ? "0 0 10px rgba(59,130,246,0.4)" : "none",
        }}
      >
        {type === "success" ? "✓" : "✕"}
      </div>
      {msg}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps { label: string; value: string | number; sub: string; color: string; icon: React.ReactNode; }
function StatCard({ label, value, sub, color, icon }: StatCardProps) {
  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 0% 0%, ${color}12, transparent 60%)` }}/>
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, ${color}60, transparent 50%)` }}/>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}20`, color }}>
          {icon}
        </div>
        <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 rounded-lg"
          style={{ color: "var(--ink4)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          {label}
        </span>
      </div>
      <div className="relative z-10">
        <div className="font-mono text-[30px] font-black leading-none tracking-tight mb-1.5"
          style={{ color, textShadow: `0 0 24px ${color}40` }}>
          {value}
        </div>
        <div className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{sub}</div>
      </div>
    </div>
  );
}

// ─── Action button ────────────────────────────────────────────────────────────
function ActionBtn({ icon, title, color, onClick }: { icon: React.ReactNode; title: string; color: string; onClick: () => void; }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
      style={{ color: "var(--ink4)", cursor: "pointer" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${color}12`; (e.currentTarget as HTMLElement).style.color = color; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}
    >
      {icon}
    </button>
  );
}

// ─── Project row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, onEdit, onDelete }: { project: FirestoreProject; onEdit: (p: FirestoreProject) => void; onDelete: (p: FirestoreProject) => void; }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 transition-all duration-200 cursor-default"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden transition-transform duration-300"
        style={{ background: `${project.color}12`, border: `1px solid ${project.color}25`, transform: hov ? "scale(1.05)" : "scale(1)" }}
      >
        {project.imageUrl
          ? <img src={getCloudinaryThumb(project.imageUrl, 80, 80)} alt={project.title} className="w-full h-full object-cover" loading="lazy"/>
          : <div className="w-full h-full flex items-center justify-center text-base">{project.emoji}</div>
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-[13px] truncate" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>{project.title}</span>
          {project.featured && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold tracking-widest uppercase"
              style={{ background: "linear-gradient(90deg,#3B82F6,#06B6D4)", color: "white" }}>
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[9px] px-2 py-0.5 rounded-md"
            style={{ color: project.color, background: `${project.color}10`, border: `1px solid ${project.color}20` }}>
            {project.category}
          </span>
          {project.tags.slice(0, 2).map((t) => (
            <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ color: "var(--ink4)", background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-1.5 max-w-[180px] flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.color }}/>
        <span className="text-[12px] line-clamp-1" style={{ color: "var(--ink3)", fontFamily: "'DM Sans',sans-serif" }}>{project.result}</span>
      </div>
      <div className={`flex items-center gap-1 flex-shrink-0 transition-all duration-200 ${hov ? "opacity-100" : "opacity-0"}`}>
        <ActionBtn icon={<Icon.Edit />}   title="Edit"   color={C.accent} onClick={() => onEdit(project)} />
        <ActionBtn icon={<Icon.Delete />} title="Delete" color={C.red}    onClick={() => onDelete(project)} />
      </div>
    </div>
  );
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────
function DeleteConfirm({ project, onConfirm, onCancel }: { project: FirestoreProject; onConfirm: () => void; onCancel: () => void; }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[380px] rounded-2xl p-7 text-center"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.2)", boxShadow: "0 0 60px rgba(239,68,68,0.08)", animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-bold text-[17px] mb-2" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>Delete Project?</h3>
        <p className="text-[13px] mb-6 leading-relaxed" style={{ color: "var(--ink4)", fontFamily: "'DM Sans',sans-serif" }}>
          "<strong style={{ color: "var(--ink3)" }}>{project.title}</strong>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] transition-all"
            style={{ border: "1px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#dc2626,#EF4444)", cursor: "pointer" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Loading / Empty states ───────────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--border2)", borderTopColor: C.accent }}/>
        <div className="absolute inset-0 rounded-full border-2 border-b-transparent animate-spin"
          style={{ borderColor: "transparent", borderBottomColor: C.cyan, animationDirection: "reverse", animationDuration: "1.5s" }}/>
      </div>
      <span className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>Loading from Firestore…</span>
    </div>
  );
}

function EmptyState({ hasSearch, onAdd, onClear }: { hasSearch: boolean; onAdd: () => void; onClear: () => void; }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--ink4)" strokeWidth="1.5"/>
          <path d="M8 11h6M11 8v6" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="text-center">
        <p className="font-semibold text-[14px] mb-1" style={{ color: "var(--ink3)" }}>{hasSearch ? "No results found" : "No projects yet"}</p>
        <p className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>{hasSearch ? "Try a different search term" : "Click 'New Project' to get started"}</p>
      </div>
      {hasSearch
        ? <button onClick={onClear} className="font-mono text-[11px] px-4 py-2 rounded-xl"
            style={{ color: "var(--ink4)", border: "1px solid var(--border2)", cursor: "pointer" }}>Clear search</button>
        : <button onClick={onAdd} className="font-mono text-[11px] px-4 py-2 rounded-xl text-white"
            style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)", cursor: "pointer" }}>Add first project →</button>
      }
    </div>
  );
}

// ─── Analytics tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ projects }: { projects: FirestoreProject[] }) {
  const byCategory = useMemo(() =>
    projects.reduce<Record<string, number>>((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {}),
    [projects]
  );
  const maxCount = Math.max(...Object.values(byCategory), 1);
  const catColors: Record<string, string> = {
    "AI Development": C.accent, "Web Application": C.cyan, "Mobile App": C.purple,
    "UI/UX Design": C.gold, "Digital Marketing": C.green, "Software Consulting": C.accent2,
  };
  const summaryStats = useMemo(() => [
    { label: "Featured",   value: projects.filter((p) => p.featured).length,               color: C.accent },
    { label: "With Image", value: projects.filter((p) => p.imageUrl).length,                color: C.cyan   },
    { label: "Categories", value: Object.keys(byCategory).length,                           color: C.purple },
    { label: "Total Tags", value: projects.reduce((a, p) => a + p.tags.length, 0),          color: C.gold   },
  ], [projects, byCategory]);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-5 text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,${color}60,transparent 60%)` }}/>
            <div className="font-mono text-[32px] font-black leading-none mb-2 relative z-10"
              style={{ color, textShadow: `0 0 24px ${color}40` }}>{value}</div>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase relative z-10" style={{ color: "var(--ink4)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Category bars */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}>
        <h3 className="font-bold text-[15px] mb-6" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>Projects by category</h3>
        <div className="flex flex-col gap-4">
          {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
            const color = catColors[cat] || C.accent;
            const pct = Math.round((count / maxCount) * 100);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }}/>
                    <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>{cat}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold" style={{ color }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}66)`, boxShadow: `0 0 8px ${color}40` }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top projects */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}>
        <h3 className="font-bold text-[15px] mb-5" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>Top performing projects</h3>
        {projects.filter((p) => p.result).length > 0 ? (
          <div className="flex flex-col gap-2">
            {projects.filter((p) => p.result).slice(0, 5).map((p, i) => (
              <div key={p.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
                style={{ background: "rgba(255,255,255,0.02)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}>
                <span className="font-mono text-[10px] w-5 text-center flex-shrink-0"
                  style={{ color: i === 0 ? C.gold : i === 1 ? "var(--ink3)" : i === 2 ? C.accent : "var(--ink4)" }}>
                  {i === 0 ? "①" : i === 1 ? "②" : i === 2 ? "③" : `${i + 1}`}
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] truncate" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>{p.title}</div>
                  <div className="font-mono text-[9px]" style={{ color: "var(--ink4)" }}>{p.category}</div>
                </div>
                <span className="font-mono text-[11px] font-bold flex-shrink-0" style={{ color: p.color }}>{p.result}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)", fontFamily: "'DM Sans',sans-serif" }}>No projects yet</p>
        )}
      </div>
    </div>
  );
}

// ─── Main AdminDashboard ──────────────────────────────────────────────────────
export function AdminDashboard({ user }: Props) {
  const [projects,     setProjects]     = useState<FirestoreProject[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState<Tab>("projects");
  const [search,       setSearch]       = useState("");
  const [formOpen,     setFormOpen]     = useState(false);
  const [editProject,  setEditProject]  = useState<FirestoreProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreProject | null>(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(true);
  const [toast,        setToast]        = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try   { setProjects(await fetchProjects()); }
    catch { showToast("Failed to load projects", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadProjects();
      showToast(`"${deleteTarget.title}" deleted`);
    } catch { showToast("Delete failed", "error"); }
  }

  const filtered = useMemo(() =>
    projects.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  );

  const stats = useMemo(() => ({
    total:      projects.length,
    featured:   projects.filter((p) => p.featured).length,
    withImages: projects.filter((p) => p.imageUrl).length,
    aiProjects: projects.filter((p) => p.category === "AI Development").length,
  }), [projects]);

  const currentTabMeta = TABS.find((t) => t.id === tab);

  return (
    <>
      <ThemeInjector/>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet"/>

      <div className="min-h-screen flex" style={{ background: "var(--bg)", fontFamily: "'DM Sans',sans-serif", cursor: "default" }}>

        {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
        <aside
          className="flex flex-col flex-shrink-0 transition-all duration-300 relative"
          style={{ width: sidebarOpen ? 220 : 60, background: "var(--bg-panel)", borderRight: "1px solid var(--border)" }}
        >
          {/* Edge glow */}
          <div className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
            style={{ background: "linear-gradient(180deg,transparent,rgba(59,130,246,0.3) 40%,rgba(6,182,212,0.2) 60%,transparent)" }}/>

          {/* Logo */}
          <div className="flex items-center h-16 px-4 gap-3 overflow-hidden flex-shrink-0"
            style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="relative w-8 h-8 flex-shrink-0">
              <div className="absolute inset-0 rounded-lg" style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}/>
              <div className="absolute inset-[2px] rounded-md" style={{ background: "var(--bg-panel)" }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-black text-[9px]" style={{ color: "#60A5FA" }}>ZH</span>
              </div>
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1">
                <div className="font-black text-[15px] tracking-tight leading-none" style={{ color: "var(--ink)" }}>
                  ZynHive<span style={{ color: C.accent }}>.</span>
                </div>
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase mt-0.5" style={{ color: "var(--ink4)" }}>Admin</div>
              </div>
            )}
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all"
              style={{ color: "var(--ink4)", cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              <Icon.Chevron dir={sidebarOpen ? "left" : "right"} />
            </button>
          </div>

          {/* Section label */}
          {sidebarOpen && (
            <div className="px-4 pt-5 pb-2">
              <span className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: "var(--ink4)" }}>Navigation</span>
            </div>
          )}

          {/* Nav */}
          <nav className="flex flex-col gap-1 px-2 flex-1">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} title={!sidebarOpen ? t.label : undefined}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left w-full relative overflow-hidden group"
                  style={{
                    cursor:     "pointer",
                    background: isActive ? "rgba(59,130,246,0.12)" : "transparent",
                    color:      isActive ? "#60A5FA"                : "var(--ink4)",
                    border:     isActive ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "var(--ink2)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; } }}
                >
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full" style={{ background: C.accent, boxShadow: `0 0 8px ${C.accent}` }}/>}
                  <span className="flex-shrink-0 ml-0.5">{t.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="font-medium text-[13px] whitespace-nowrap flex-1">{t.label}</span>
                      {t.badge && (
                        <span className="px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold" style={{ background: C.accent, color: "white" }}>
                          {t.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="mx-3 my-2" style={{ height: "1px", background: "var(--border)" }}/>

          {/* User */}
          <div className="p-3 flex items-center gap-2.5 overflow-hidden flex-shrink-0">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[11px] text-white"
              style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)", boxShadow: "0 0 12px rgba(59,130,246,0.3)" }}>
              {user.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-[10px] truncate" style={{ color: "var(--ink2)" }}>{user.email}</p>
                  <p className="font-mono text-[8px] tracking-[0.12em] uppercase mt-0.5" style={{ color: "var(--ink4)" }}>Administrator</p>
                </div>
                <button onClick={() => adminLogout()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ color: "var(--ink4)", cursor: "pointer" }} title="Sign out"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "#F87171"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
                  <Icon.Logout />
                </button>
              </>
            )}
          </div>
        </aside>

        {/* ── MAIN ─────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="h-16 flex items-center justify-between px-6 flex-shrink-0"
            style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--ink4)" }}>ZynHive</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M3 2l4 3-4 3" stroke="var(--ink4)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>{currentTabMeta?.label}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border2)" }}>
                <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                  <span style={{ color: "#60A5FA", fontWeight: 700 }}>{projects.length}</span> projects
                </span>
                <div className="w-px h-3" style={{ background: "var(--border2)" }}/>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green, boxShadow: `0 0 6px ${C.green}` }}/>
                <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>Live</span>
              </div>
              {tab === "projects" && (
                <button
                  onClick={() => { setEditProject(null); setFormOpen(true); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)", boxShadow: "0 4px 16px rgba(59,130,246,0.25)", cursor: "pointer" }}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  New Project
                </button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>

            {/* Projects tab */}
            {tab === "projects" && (
              <div className="p-6 flex flex-col gap-5">

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard label="Total"       value={stats.total}      sub="all categories" color={C.accent}  icon={<Icon.Projects />} />
                  <StatCard label="Featured"    value={stats.featured}   sub="on homepage"    color={C.cyan}    icon={
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 3.5 3.5.5-2.5 2.5.7 3.5L7 9.5l-3.2 1.5.7-3.5L2 5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1"/></svg>
                  }/>
                  <StatCard label="With Images" value={stats.withImages} sub="on Cloudinary"  color={C.purple}  icon={
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 10l3-3.5 2.5 2.5 2-2.5L12 10H2z" stroke="currentColor" strokeWidth="1"/><rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1"/></svg>
                  }/>
                  <StatCard label="AI Projects" value={stats.aiProjects} sub="ML & LLM builds" color={C.gold}   icon={
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1"/><circle cx="9" cy="5" r="2" stroke="currentColor" strokeWidth="1"/><circle cx="7" cy="9" r="2" stroke="currentColor" strokeWidth="1"/></svg>
                  }/>
                </div>

                {/* Search */}
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="relative flex-1 min-w-[220px] max-w-sm">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.1"/><path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </div>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
                      className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] transition-all"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border2)", color: "var(--ink)", outline: "none", cursor: "text" }}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(59,130,246,0.4)"; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
                      onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; (e.target as HTMLInputElement).style.boxShadow = "none"; }}
                    />
                  </div>
                  {search && (
                    <button onClick={() => setSearch("")}
                      className="font-mono text-[11px] px-3 py-2 rounded-xl transition-all"
                      style={{ color: "var(--ink4)", border: "1px solid var(--border2)", cursor: "pointer", background: "transparent" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--ink4)"; (e.currentTarget as HTMLElement).style.color = "var(--ink2)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)"; (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
                      ✕ Clear
                    </button>
                  )}
                  <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
                    <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                      <span style={{ color: "#60A5FA", fontWeight: 700 }}>{filtered.length}</span>
                      <span style={{ color: "var(--ink4)" }}> / {projects.length}</span>
                    </span>
                  </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-4 px-5 py-3"
                    style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                    <span className="font-mono text-[9px] tracking-[0.18em] uppercase ml-14 flex-1" style={{ color: "var(--ink4)" }}>Project</span>
                    <span className="hidden lg:block font-mono text-[9px] tracking-[0.18em] uppercase max-w-[180px] w-full" style={{ color: "var(--ink4)" }}>Result</span>
                    <span className="w-20 font-mono text-[9px] tracking-[0.18em] uppercase text-right" style={{ color: "var(--ink4)" }}>Actions</span>
                  </div>
                  {loading ? <LoadingSpinner/> : filtered.length === 0
                    ? <EmptyState hasSearch={!!search} onAdd={() => { setEditProject(null); setFormOpen(true); }} onClear={() => setSearch("")}/>
                    : filtered.map((p) => (
                        <ProjectRow key={p.id} project={p}
                          onEdit={(proj) => { setEditProject(proj); setFormOpen(true); }}
                          onDelete={setDeleteTarget}/>
                      ))
                  }
                </div>
              </div>
            )}

            {tab === "team"      && <TeamTab showToast={showToast}/>}
            {tab === "leads"     && <LeadTab showToast={showToast}/>}
            {tab === "analytics" && <AnalyticsTab projects={projects}/>}
          </main>
        </div>

        {/* Overlays */}
        {formOpen && (
          <ProjectForm project={editProject} onClose={() => setFormOpen(false)}
            onSaved={() => { loadProjects(); showToast(editProject ? "Project updated!" : "Project created!"); }}/>
        )}
        {deleteTarget && (
          <DeleteConfirm project={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}/>
        )}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)}/>}
      </div>
    </>
  );
}