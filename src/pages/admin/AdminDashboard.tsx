// ─── src/pages/admin/AdminDashboard.tsx ─────────────────────────────────────
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
type Tab = "projects" | "leads" | "team" | "analytics";

// ─── Light theme CSS ──────────────────────────────────────────────────────────
// Page bg: grey (#F2F4F8)  |  Sidebar/Header/Cards: white (#FFFFFF)
const THEME_CSS = `
  :root {
    --bg:           #F2F4F8;
    --bg-alt:       #E8EBF2;
    --bg-surface:   #F2F4F8;
    --bg-panel:     #FFFFFF;
    --bg-card:      #FFFFFF;
    --border:       rgba(0,0,0,0.07);
    --border2:      rgba(0,0,0,0.12);
    --ink:          #111827;
    --ink2:         #374151;
    --ink3:         #6B7280;
    --ink4:         #9CA3AF;
    --accent:       #4F6EF7;
    --accent2:      #6366F1;
    --cyan:         #06B6D4;
    --gold:         #F59E0B;
    --green:        #10B981;
    --red:          #EF4444;
    --purple:       #8B5CF6;
    --accent-pale:  rgba(79,110,247,0.08);
    --accent-pale2: rgba(79,110,247,0.15);
    --accent-dim:   rgba(79,110,247,0.22);
  }
  @keyframes fadeScaleIn {
    from { opacity: 0; transform: scale(0.94); }
    to   { opacity: 1; transform: scale(1); }
  }
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

function ThemeInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = THEME_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  accent:  "#4F6EF7",
  cyan:    "#06B6D4",
  gold:    "#F59E0B",
  green:   "#10B981",
  red:     "#EF4444",
  purple:  "#8B5CF6",
  accent2: "#6366F1",
} as const;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Ic = {
  Projects: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
  Leads: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="6" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M12 1v5M14.5 3.5h-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Team: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="5" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1 12c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <circle cx="11" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M13 10.5c0-1.5-.9-2.5-2.2-2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  Analytics: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1 12l3.5-4 3 2.5 3-5.5 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="1" y="1" width="13" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
  Search: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  Bell: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M7.5 1.5a5 5 0 015 5v3l1.5 2H1l1.5-2v-3a5 5 0 015-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M6 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M2 4l3.5 3.5L9 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M8 2L4 6.5l4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M5 2l4 4.5-4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Breadcrumb: () => (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Plus: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Edit: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  ),
  Trash: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  Star: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1l1.5 3.5 3.5.5-2.5 2.5.7 3.5L7 9.5l-3.2 1.5.7-3.5L2 5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  Img: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 10l3-3.5 2.5 2.5 2-2.5L12 10H2z" stroke="currentColor" strokeWidth="1"/>
      <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  Ai: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1"/>
      <circle cx="9" cy="5" r="2" stroke="currentColor" strokeWidth="1"/>
      <circle cx="7" cy="9" r="2" stroke="currentColor" strokeWidth="1"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 9V3M3 5.5l2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  TrendDown: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 3v6M3 6l2.5 2.5L8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "projects",  label: "Projects",  icon: <Ic.Projects /> },
  { id: "leads",     label: "Leads",     icon: <Ic.Leads />,    badge: "3" },
  { id: "team",      label: "Team",      icon: <Ic.Team /> },
  { id: "analytics", label: "Analytics", icon: <Ic.Analytics /> },
];

const CTA_LABELS: Record<Tab, string> = {
  projects:  "New Project",
  leads:     "Add Lead",
  team:      "Add Member",
  analytics: "",
};

// ═════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ═════════════════════════════════════════════════════════════════════════════

/** Icon button — neutral hover, accent/danger variants */
function IconBtn({
  children, title, onClick, danger = false, accent = false, size = 30,
}: {
  children: React.ReactNode; title?: string; onClick?: () => void;
  danger?: boolean; accent?: boolean; size?: number;
}) {
  const hBg  = danger ? "#FCEBEB"           : accent ? "var(--accent-pale)"  : "var(--bg-alt)";
  const hClr = danger ? "#A32D2D"           : accent ? "var(--accent)"       : "var(--ink2)";
  return (
    <button title={title} onClick={onClick}
      className="flex items-center justify-center rounded-lg transition-all duration-150 flex-shrink-0"
      style={{ width: size, height: size, background: "transparent", border: "none", color: "var(--ink4)", cursor: "pointer" }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = hBg; el.style.color = hClr; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
      {children}
    </button>
  );
}

/** Solid blue CTA button */
function PrimaryBtn({ children, onClick, small = false }: { children: React.ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 font-semibold text-white rounded-lg transition-opacity duration-150 active:scale-95"
      style={{
        background: "var(--accent)",
        padding:    small ? "6px 14px" : "7px 16px",
        fontSize:   small ? 12 : 13,
        border:     "none", cursor: "pointer",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
      {children}
    </button>
  );
}

/** White card with grey border */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl ${className}`}
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      {children}
    </div>
  );
}

/** Stat card — icon top-right, big number, sub-label, optional trend */
function StatCard({
  label, value, sub, iconBg, iconColor, icon, trend,
}: {
  label: string; value: string | number; sub: string;
  iconBg: string; iconColor: string; icon: React.ReactNode;
  trend?: { text: string; up: boolean };
}) {
  return (
    <Card>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[11px]" style={{ color: "var(--ink4)" }}>{label}</span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: iconBg, color: iconColor }}>
            {icon}
          </div>
        </div>
        <div className="text-[22px] font-medium leading-none mb-1.5" style={{ color: "var(--ink)" }}>
          {value}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px]"
            style={{ color: trend.up ? "#0F6E56" : "#A32D2D" }}>
            {trend.up ? <Ic.TrendUp /> : <Ic.TrendDown />}
            {trend.text}
          </span>
        )}
        {!trend && <span className="text-[11px]" style={{ color: "var(--ink4)" }}>{sub}</span>}
      </div>
    </Card>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  const isOk = type === "success";
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl"
      style={{
        background: "var(--bg-card)",
        border:     `0.5px solid ${isOk ? "var(--border2)" : "#F7C1C1"}`,
        color:      isOk ? "var(--ink2)" : "#A32D2D",
        boxShadow:  "0 4px 24px rgba(0,0,0,0.12)",
        animation:  "toastIn .3s cubic-bezier(0.16,1,0.3,1) both",
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
      }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{ background: isOk ? "#E1F5EE" : "#FCEBEB", color: isOk ? "#0F6E56" : "#A32D2D" }}>
        {isOk ? "✓" : "✕"}
      </div>
      {msg}
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[360px] rounded-2xl p-7 text-center"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", boxShadow: "0 16px 48px rgba(0,0,0,0.14)", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "#FCEBEB", border: "0.5px solid #F7C1C1" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="#A32D2D" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-medium text-[16px] mb-1.5" style={{ color: "var(--ink)" }}>Delete project?</h3>
        <p className="text-[13px] mb-5" style={{ color: "var(--ink3)" }}>
          "<strong style={{ color: "var(--ink2)" }}>{title}</strong>" will be permanently removed.
        </p>
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
            style={{ border: "0.5px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-white"
            style={{ background: "#E24B4A", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors duration-150"
        style={{ background: open ? "var(--bg-alt)" : "transparent", border: "0.5px solid var(--border2)", cursor: "pointer" }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        {/* Avatar circle */}
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0"
          style={{ background: "var(--accent-pale)", color: "var(--accent)" }}>
          {email?.[0]?.toUpperCase() ?? "A"}
        </div>
        <span className="hidden sm:block text-[12px] font-medium" style={{ color: "var(--ink)" }}>
          {email?.split("@")[0] ?? "Admin"}
        </span>
        <span style={{ color: "var(--ink4)" }}><Ic.ChevronDown /></span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 rounded-xl overflow-hidden z-50"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", minWidth: 162, boxShadow: "0 8px 28px rgba(0,0,0,0.1)", animation: "fadeScaleIn .16s cubic-bezier(0.16,1,0.3,1) both" }}>
          {["View profile", "Account settings"].map((label) => (
            <button key={label} onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-[12px] block transition-colors"
              style={{ color: "var(--ink3)", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; }}>
              {label}
            </button>
          ))}
          <div style={{ height: "0.5px", background: "var(--border)", margin: "3px 0" }}/>
          <button onClick={onLogout}
            className="w-full text-left px-4 py-2.5 text-[12px] block transition-colors"
            style={{ color: "#A32D2D", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FCEBEB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PROJECTS TAB
// ═════════════════════════════════════════════════════════════════════════════

function ProjectRow({ project, onEdit, onDelete }: {
  project: FirestoreProject; onEdit: () => void; onDelete: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 transition-colors duration-150 cursor-default"
      style={{ borderColor: "var(--border)", background: hov ? "var(--bg-alt)" : "transparent" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>

      {/* Logo */}
      <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden"
        style={{ background: `${project.color}12`, border: `1px solid ${project.color}25`, transition: "transform .2s", transform: hov ? "scale(1.06)" : "scale(1)" }}>
        {project.imageUrl
          ? <img src={getCloudinaryThumb(project.imageUrl, 72, 72)} alt={project.title} className="w-full h-full object-cover" loading="lazy"/>
          : <div className="w-full h-full flex items-center justify-center text-base">{project.emoji}</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-[13px] truncate" style={{ color: "var(--ink)" }}>{project.title}</span>
          {project.featured && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-medium"
              style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "0.5px solid var(--accent-pale2)" }}>
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] px-2 py-0.5 rounded-md font-medium"
            style={{ color: project.color, background: `${project.color}10`, border: `1px solid ${project.color}20` }}>
            {project.category}
          </span>
          {project.tags.slice(0, 2).map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ color: "var(--ink4)", background: "var(--bg-alt)", border: "0.5px solid var(--border)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="hidden lg:flex items-center gap-1.5 max-w-[190px] flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.color }}/>
        <span className="text-[12px] truncate" style={{ color: "var(--ink3)" }}>{project.result}</span>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity duration-150 ${hov ? "opacity-100" : "opacity-0"}`}>
        <IconBtn title="Edit"   accent onClick={onEdit}><Ic.Edit /></IconBtn>
        <IconBtn title="Delete" danger  onClick={onDelete}><Ic.Trash /></IconBtn>
      </div>
    </div>
  );
}

function ProjectsTab({
  projects, loading, search, setSearch, onAdd, onEdit, onDelete,
}: {
  projects: FirestoreProject[]; loading: boolean;
  search: string; setSearch: (v: string) => void;
  onAdd: () => void; onEdit: (p: FirestoreProject) => void; onDelete: (p: FirestoreProject) => void;
}) {
  const filtered = useMemo(
    () => projects.filter((p) => !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())),
    [projects, search],
  );

  const stats = useMemo(() => ({
    total:      projects.length,
    featured:   projects.filter((p) => p.featured).length,
    withImages: projects.filter((p) => p.imageUrl).length,
    aiProjects: projects.filter((p) => p.category === "AI Development").length,
  }), [projects]);

  return (
    <div className="p-5 flex flex-col gap-5">

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total projects" value={stats.total}      sub="all categories"  iconBg="#E6F1FB" iconColor="#185FA5" icon={<Ic.Projects />}/>
        <StatCard label="Featured"       value={stats.featured}   sub="on homepage"     iconBg="#EEEDFE" iconColor="#3C3489" icon={<Ic.Star />}/>
        <StatCard label="With images"    value={stats.withImages} sub="on Cloudinary"   iconBg="#EAF3DE" iconColor="#3B6D11" icon={<Ic.Img />}/>
        <StatCard label="AI projects"    value={stats.aiProjects} sub="ML & LLM builds" iconBg="#FAEEDA" iconColor="#854F0B" icon={<Ic.Ai />}/>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
            <Ic.Search />
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
            className="w-full pl-9 pr-4 py-2 rounded-lg text-[13px] transition-colors"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", color: "var(--ink)", outline: "none", cursor: "text" }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="text-[12px] px-3 py-2 rounded-lg transition-colors"
            style={{ color: "var(--ink3)", border: "0.5px solid var(--border2)", cursor: "pointer", background: "var(--bg-card)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}>
            ✕ Clear
          </button>
        )}
        <div className="ml-auto text-[11px] px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", color: "var(--ink4)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 500 }}>{filtered.length}</span>
          {" / "}{projects.length}
        </div>
      </div>

      {/* Table */}
      <Card>
        {/* Column headers */}
        <div className="flex items-center gap-4 px-5 py-3"
          style={{ background: "var(--bg-alt)", borderBottom: "0.5px solid var(--border)", borderRadius: "12px 12px 0 0" }}>
          <span className="text-[10px] font-medium uppercase tracking-widest ml-13 flex-1" style={{ color: "var(--ink4)" }}>Project</span>
          <span className="hidden lg:block text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--ink4)", minWidth: 180 }}>Result</span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-right" style={{ color: "var(--ink4)", width: 72 }}>Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "var(--border2)", borderTopColor: C.accent }}/>
            <span className="text-[12px]" style={{ color: "var(--ink4)" }}>Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-pale)", color: "var(--accent)" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-medium text-[14px] mb-1" style={{ color: "var(--ink2)" }}>
                {search ? "No results found" : "No projects yet"}
              </p>
              <p className="text-[12px]" style={{ color: "var(--ink4)" }}>
                {search ? "Try a different search term" : "Click 'New Project' to get started"}
              </p>
            </div>
            {search
              ? <button onClick={() => setSearch("")} className="text-[12px] px-4 py-2 rounded-lg transition-colors"
                  style={{ color: "var(--ink3)", border: "0.5px solid var(--border2)", cursor: "pointer", background: "var(--bg-card)" }}>
                  Clear search
                </button>
              : <PrimaryBtn small onClick={onAdd}>Add first project →</PrimaryBtn>
            }
          </div>
        ) : (
          filtered.map((p) => (
            <ProjectRow key={p.id} project={p} onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
          ))
        )}
      </Card>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═════════════════════════════════════════════════════════════════════════════

function AnalyticsTab({ projects }: { projects: FirestoreProject[] }) {
  const byCategory = useMemo(
    () => projects.reduce<Record<string, number>>((a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a; }, {}),
    [projects],
  );
  const maxCount = Math.max(...Object.values(byCategory), 1);

  const catColors: Record<string, string> = {
    "AI Development": "#378ADD", "Web Application": "#7F77DD",
    "Mobile App": C.purple, "UI/UX Design": "#BA7517",
    "Digital Marketing": "#639922", "Software Consulting": C.accent2,
  };

  const summaryStats = useMemo(() => [
    { label: "Featured",   value: projects.filter((p) => p.featured).length,        iconBg: "#E6F1FB", iconColor: "#185FA5" },
    { label: "With image", value: projects.filter((p) => p.imageUrl).length,         iconBg: "#EEEDFE", iconColor: "#3C3489" },
    { label: "Categories", value: Object.keys(byCategory).length,                    iconBg: "#EAF3DE", iconColor: "#3B6D11" },
    { label: "Total tags", value: projects.reduce((a, p) => a + p.tags.length, 0),  iconBg: "#FAEEDA", iconColor: "#854F0B" },
  ], [projects, byCategory]);

  return (
    <div className="p-5 flex flex-col gap-5">
      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {summaryStats.map(({ label, value, iconBg, iconColor }) => (
          <Card key={label}>
            <div className="p-4 text-center">
              <div className="text-[28px] font-medium leading-none mb-1.5" style={{ color: iconColor }}>{value}</div>
              <div className="text-[11px]" style={{ color: "var(--ink4)" }}>{label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Category bars */}
      <Card>
        <div className="p-5">
          <h3 className="font-medium text-[14px] mb-5" style={{ color: "var(--ink)" }}>Projects by category</h3>
          {Object.keys(byCategory).length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                const color = catColors[cat] || C.accent;
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }}/>
                        <span className="text-[12px]" style={{ color: "var(--ink3)" }}>{cat}</span>
                      </div>
                      <span className="text-[12px] font-medium" style={{ color }}>{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: color }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)" }}>No data yet</p>
          )}
        </div>
      </Card>

      {/* Top projects */}
      <Card>
        <div className="p-5">
          <h3 className="font-medium text-[14px] mb-4" style={{ color: "var(--ink)" }}>Top performing projects</h3>
          {projects.filter((p) => p.result).length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {projects.filter((p) => p.result).slice(0, 5).map((p, i) => (
                <div key={p.id}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-150 cursor-default"
                  style={{ background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <span className="text-[11px] w-5 text-center flex-shrink-0"
                    style={{ color: i === 0 ? "#BA7517" : i === 1 ? "var(--ink3)" : i === 2 ? "#378ADD" : "var(--ink4)" }}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${p.color}12`, border: `1px solid ${p.color}25` }}>
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] truncate" style={{ color: "var(--ink)" }}>{p.title}</div>
                    <div className="text-[11px]" style={{ color: "var(--ink4)" }}>{p.category}</div>
                  </div>
                  <span className="text-[12px] font-medium flex-shrink-0" style={{ color: p.color }}>{p.result}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)" }}>No projects yet</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

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

  function switchTab(next: Tab) { setTab(next); setSearch(""); }

  const ctaLabel      = CTA_LABELS[tab];
  const activeNavItem = NAV_ITEMS.find((n) => n.id === tab);

  function handleCta() {
    if (tab === "projects") { setEditProject(null); setFormOpen(true); }
  }

  return (
    <>
      <ThemeInjector />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex" style={{ background: "var(--bg)", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside
          className="flex flex-col flex-shrink-0 transition-all duration-300"
          style={{
            width:       sidebarOpen ? 210 : 52,
            background:  "var(--bg-panel)",
            borderRight: "0.5px solid var(--border)",
            overflow:    "hidden",
          }}>

          {/* ── Logo row ── */}
          <div className="flex items-center flex-shrink-0"
            style={{ height: 52, borderBottom: "0.5px solid var(--border)", padding: sidebarOpen ? "0 12px" : "0", justifyContent: sidebarOpen ? "flex-start" : "center", gap: sidebarOpen ? 9 : 0 }}>

            {/* Logo mark — always visible, clickable to toggle */}
            <div className="w-[28px] h-[28px] rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: "var(--accent)" }}
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Collapse" : "Expand"}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Brand name */}
            {sidebarOpen && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="font-medium text-[14px] leading-tight whitespace-nowrap" style={{ color: "var(--ink)" }}>
                  ZynHive
                </div>
                <div className="text-[10px]" style={{ color: "var(--ink4)" }}>Admin panel</div>
              </div>
            )}

            {/* Toggle button */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="flex items-center justify-center rounded-lg transition-all duration-150 flex-shrink-0"
              style={{
                width: 26, height: 26,
                background: "transparent",
                border: "0.5px solid var(--border2)",
                color: "var(--ink4)", cursor: "pointer",
                marginLeft: sidebarOpen ? 0 : 8,
                display: sidebarOpen ? "flex" : "none",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.borderColor = "var(--accent-pale2)"; el.style.color = "var(--accent)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.borderColor = "var(--border2)"; el.style.color = "var(--ink4)"; }}>
              <Ic.ChevronLeft />
            </button>

            {/* Expand button — only shown when collapsed */}
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                title="Expand sidebar"
                className="flex items-center justify-center rounded-lg transition-all duration-150 flex-shrink-0"
                style={{ width: 26, height: 26, background: "transparent", border: "0.5px solid var(--border2)", color: "var(--ink4)", cursor: "pointer", marginLeft: 6 }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.borderColor = "var(--accent-pale2)"; el.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.borderColor = "var(--border2)"; el.style.color = "var(--ink4)"; }}>
                <Ic.ChevronRight />
              </button>
            )}
          </div>

          {/* Section label */}
          {sidebarOpen && (
            <div className="px-4 pt-3.5 pb-1">
              <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Main menu</span>
            </div>
          )}

          {/* ── Nav items ── */}
          <nav className="flex flex-col flex-1 overflow-hidden"
            style={{ gap: 1, padding: sidebarOpen ? "4px 8px" : "8px 6px" }}>
            {NAV_ITEMS.map((item) => {
              const active = tab === item.id;
              return (
                <button key={item.id}
                  onClick={() => switchTab(item.id)}
                  title={item.label}
                  className="flex items-center transition-all duration-150 w-full relative rounded-lg"
                  style={{
                    gap:            sidebarOpen ? 9 : 0,
                    padding:        sidebarOpen ? "8px 10px" : "10px 0",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    background:     active ? "var(--accent-pale)" : "transparent",
                    color:          active ? "var(--accent)"      : "var(--ink3)",
                    border:         active ? "0.5px solid var(--accent-pale2)" : "0.5px solid transparent",
                    cursor: "pointer", textAlign: "left",
                    fontWeight: active ? 500 : 400,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "var(--bg-alt)";
                      el.style.color      = "var(--ink2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "transparent";
                      el.style.color      = "var(--ink3)";
                    }
                  }}>

                  <span className="flex-shrink-0">{item.icon}</span>

                  {sidebarOpen && (
                    <>
                      <span className="text-[13px] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--accent)", color: "white" }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Collapsed: small badge dot */}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent)" }}/>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div style={{ height: "0.5px", background: "var(--border)", margin: "6px 10px" }}/>

          {/* ── User row ── */}
          <div className="flex-shrink-0 flex items-center gap-2.5 overflow-hidden"
            style={{ padding: sidebarOpen ? "10px 14px" : "10px 0", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-[11px]"
              style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "0.5px solid var(--accent-pale2)" }}>
              {user.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--ink2)" }}>{user.email}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--ink4)" }}>Administrator</p>
              </div>
            )}
          </div>
        </aside>

        {/* ══════════ MAIN ══════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── Header ── */}
          <header className="flex items-center justify-between px-5 flex-shrink-0"
            style={{ height: 52, background: "var(--bg-panel)", borderBottom: "0.5px solid var(--border)" }}>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] hidden sm:block" style={{ color: "var(--ink4)" }}>ZynHive</span>
              <span className="hidden sm:flex items-center" style={{ color: "var(--ink4)" }}><Ic.Breadcrumb /></span>
              <span className="font-medium text-[14px]" style={{ color: "var(--ink)" }}>
                {activeNavItem?.label}
              </span>
            </div>

            {/* Inline search — projects tab only */}
            {tab === "projects" && (
              <div className="relative flex-1 max-w-[240px] mx-4 hidden md:block">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
                  <Ic.Search />
                </div>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="w-full rounded-lg text-[12px] transition-colors"
                  style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", padding: "6px 12px 6px 28px", fontFamily: "inherit" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                />
              </div>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Live pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg"
                style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)" }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }}/>
                <span className="text-[11px]" style={{ color: "var(--ink4)" }}>
                  <span style={{ color: "var(--accent)", fontWeight: 500 }}>{projects.length}</span> projects
                </span>
              </div>

              {/* Bell */}
              <div className="relative">
                <IconBtn title="Notifications" size={30}><Ic.Bell /></IconBtn>
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{ background: "#E24B4A", border: "1.5px solid var(--bg-panel)" }}/>
              </div>

              {/* Profile dropdown */}
              <ProfileDropdown email={user.email ?? ""} onLogout={() => adminLogout()} />

              {/* CTA */}
              {ctaLabel && (
                <PrimaryBtn onClick={handleCta}>
                  <Ic.Plus />
                  {ctaLabel}
                </PrimaryBtn>
              )}
            </div>
          </header>

          {/* ── Page content ── */}
          <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
            {tab === "projects"  && (
              <ProjectsTab
                projects={projects} loading={loading}
                search={search} setSearch={setSearch}
                onAdd={() => { setEditProject(null); setFormOpen(true); }}
                onEdit={(p) => { setEditProject(p); setFormOpen(true); }}
                onDelete={setDeleteTarget}
              />
            )}
            {tab === "leads"     && <LeadTab showToast={showToast} />}
            {tab === "team"      && <TeamTab showToast={showToast} />}
            {tab === "analytics" && <AnalyticsTab projects={projects} />}
          </main>
        </div>

        {/* ── Overlays ── */}
        {formOpen && (
          <ProjectForm project={editProject} onClose={() => setFormOpen(false)}
            onSaved={() => { loadProjects(); showToast(editProject ? "Project updated!" : "Project created!"); }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm title={deleteTarget.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        )}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}