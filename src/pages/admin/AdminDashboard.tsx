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

// ─── Theme CSS ────────────────────────────────────────────────────────────────
const THEME_CSS = `
  :root {
    --bg:           #080C14;
    --bg-alt:       #0D1220;
    --bg-surface:   #111827;
    --bg-panel:     #0F1623;
    --bg-card:      #131D2E;
    --border:       rgba(255,255,255,0.05);
    --border2:      rgba(255,255,255,0.08);
    --ink:          #F0F4FF;
    --ink2:         #C8D3E8;
    --ink3:         #8A9BB8;
    --ink4:         #4A5878;
    --accent:       #3B82F6;
    --accent2:      #6366F1;
    --cyan:         #06B6D4;
    --gold:         #F59E0B;
    --green:        #10B981;
    --red:          #EF4444;
    --purple:       #8B5CF6;
    --accent-pale:  rgba(59,130,246,0.08);
    --accent-pale2: rgba(59,130,246,0.18);
    --accent-dim:   rgba(59,130,246,0.25);
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
  accent: "#3B82F6", cyan: "#06B6D4", gold: "#F59E0B",
  green: "#10B981", red: "#EF4444", purple: "#8B5CF6", accent2: "#6366F1",
} as const;

// ─── Icon library (only what we need) ────────────────────────────────────────
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
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  Plus: () => (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
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
  Breadcrumb: () => (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// ─── Nav config — ONLY the 4 real tabs ───────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "projects",  label: "Projects",  icon: <Ic.Projects /> },
  { id: "leads",     label: "Leads",     icon: <Ic.Leads />,    badge: "3" },
  { id: "team",      label: "Team",      icon: <Ic.Team /> },
  { id: "analytics", label: "Analytics", icon: <Ic.Analytics /> },
];

// CTA button label per tab (empty string = no button shown)
const CTA: Record<Tab, string> = {
  projects:  "New Project",
  leads:     "Add Lead",
  team:      "Add Member",
  analytics: "",
};

// ═════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ═════════════════════════════════════════════════════════════════════════════

function IconBtn({
  children, title, onClick, danger = false, accent = false,
}: {
  children: React.ReactNode; title?: string; onClick?: () => void;
  danger?: boolean; accent?: boolean;
}) {
  const hBg  = danger ? "rgba(239,68,68,0.1)" : accent ? "var(--accent-pale)" : "rgba(255,255,255,0.06)";
  const hClr = danger ? "#F87171"              : accent ? "var(--accent)"      : "var(--ink2)";
  return (
    <button title={title} onClick={onClick}
      className="flex items-center justify-center rounded-lg transition-all duration-150 flex-shrink-0"
      style={{ width: 30, height: 30, background: "transparent", border: "none", color: "var(--ink4)", cursor: "pointer" }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = hBg; el.style.color = hClr; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
      {children}
    </button>
  );
}

function PrimaryBtn({ children, onClick, small = false }: { children: React.ReactNode; onClick?: () => void; small?: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 font-semibold text-white rounded-xl transition-all duration-200 active:scale-95"
      style={{
        background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
        padding: small ? "6px 14px" : "8px 18px",
        fontSize: small ? 12 : 13,
        border: "none", cursor: "pointer",
        boxShadow: "0 4px 14px rgba(59,130,246,0.28)",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
      {children}
    </button>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}>
      {children}
    </div>
  );
}

function StatCard({
  label, value, sub, color, icon, trend,
}: {
  label: string; value: string | number; sub: string; color: string;
  icon: React.ReactNode; trend?: { value: string; up: boolean };
}) {
  return (
    <Panel>
      <div className="p-5 relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5">
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg,${color}70,transparent 55%)` }}/>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{ background: `radial-gradient(circle at 0% 0%,${color}10,transparent 60%)` }}/>

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}14`, border: `1px solid ${color}22`, color }}>
            {icon}
          </div>
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 rounded-lg"
            style={{ color: "var(--ink4)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
            {label}
          </span>
        </div>

        <div className="font-mono text-[28px] font-black leading-none tracking-tight mb-1.5 relative z-10"
          style={{ color, textShadow: `0 0 20px ${color}30` }}>
          {value}
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{sub}</span>
          {trend && (
            <span className="flex items-center gap-1 font-mono text-[10px]"
              style={{ color: trend.up ? C.green : C.red }}>
              {trend.up ? <Ic.TrendUp /> : <Ic.TrendDown />}
              {trend.value}
            </span>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────
interface ToastProps { msg: string; type: "success" | "error"; onClose: () => void; }
function Toast({ msg, type, onClose }: ToastProps) {
  useEffect(() => { const t = setTimeout(onClose, 3200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl"
      style={{
        background: type === "success" ? "var(--bg-card)" : "rgba(30,8,8,0.95)",
        border:     `1px solid ${type === "success" ? "rgba(59,130,246,0.25)" : "rgba(239,68,68,0.3)"}`,
        color:      type === "success" ? "var(--ink2)" : "#FCA5A5",
        boxShadow:  "0 8px 32px rgba(0,0,0,0.5)",
        animation:  "toastIn .3s cubic-bezier(0.16,1,0.3,1) both",
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
      }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: type === "success" ? "linear-gradient(135deg,#3B82F6,#06B6D4)" : "rgba(239,68,68,0.15)",
          color:      type === "success" ? "white" : "#F87171",
        }}>
        {type === "success" ? "✓" : "✕"}
      </div>
      {msg}
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ title, onConfirm, onCancel }: { title: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[380px] rounded-2xl p-7 text-center"
        style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.25)", animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-bold text-[17px] mb-2" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>Delete Project?</h3>
        <p className="text-[13px] mb-6" style={{ color: "var(--ink4)", fontFamily: "'DM Sans',sans-serif" }}>
          "<strong style={{ color: "var(--ink3)" }}>{title}</strong>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-[13px]"
            style={{ border: "1px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#dc2626,#EF4444)", cursor: "pointer" }}>
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
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150"
        style={{ background: open ? "rgba(255,255,255,0.05)" : "transparent", border: "1px solid var(--border2)", cursor: "pointer" }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)" }}>
          {email?.[0]?.toUpperCase() ?? "A"}
        </div>
        <span className="hidden sm:block font-medium text-[12px]" style={{ color: "var(--ink)" }}>
          {email?.split("@")[0] ?? "Admin"}
        </span>
        <span style={{ color: "var(--ink4)" }}><Ic.ChevronDown /></span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 rounded-2xl overflow-hidden z-50"
          style={{
            background: "var(--bg-card)", border: "1px solid var(--border2)",
            minWidth: 168, boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            animation: "fadeScaleIn .18s cubic-bezier(0.16,1,0.3,1) both",
          }}>
          {["View profile", "Account settings"].map((label) => (
            <button key={label} onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-[12px] block transition-colors duration-100"
              style={{ color: "var(--ink3)", background: "transparent", border: "none", cursor: "pointer" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; }}>
              {label}
            </button>
          ))}
          <div style={{ height: "0.5px", background: "var(--border2)", margin: "4px 0" }}/>
          <button onClick={onLogout}
            className="w-full text-left px-4 py-2.5 text-[12px] block transition-colors duration-100"
            style={{ color: "#F87171", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"; }}
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
      style={{ borderColor: "var(--border)", background: hov ? "rgba(255,255,255,0.02)" : "transparent" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>

      {/* Logo */}
      <div className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden"
        style={{
          background: `${project.color}12`,
          border: `1px solid ${project.color}25`,
          transform: hov ? "scale(1.05)" : "scale(1)",
          transition: "transform .25s",
        }}>
        {project.imageUrl
          ? <img src={getCloudinaryThumb(project.imageUrl, 80, 80)} alt={project.title}
              className="w-full h-full object-cover" loading="lazy"/>
          : <div className="w-full h-full flex items-center justify-center text-base">{project.emoji}</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-[13px] truncate" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>
            {project.title}
          </span>
          {project.featured && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold tracking-widest uppercase"
              style={{ background: "linear-gradient(90deg,#3B82F6,#06B6D4)", color: "white" }}>
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
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

      {/* Result */}
      <div className="hidden lg:flex items-center gap-1.5 max-w-[190px] flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.color }}/>
        <span className="text-[12px] truncate" style={{ color: "var(--ink3)", fontFamily: "'DM Sans',sans-serif" }}>
          {project.result}
        </span>
      </div>

      {/* Actions */}
      <div className={`flex items-center gap-1 flex-shrink-0 transition-opacity duration-200 ${hov ? "opacity-100" : "opacity-0"}`}>
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
    () => projects.filter((p) =>
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    ),
    [projects, search],
  );

  const stats = useMemo(() => ({
    total:      projects.length,
    featured:   projects.filter((p) => p.featured).length,
    withImages: projects.filter((p) => p.imageUrl).length,
    aiProjects: projects.filter((p) => p.category === "AI Development").length,
  }), [projects]);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total"       value={stats.total}      sub="all categories"  color={C.accent} icon={<Ic.Projects />}/>
        <StatCard label="Featured"    value={stats.featured}   sub="on homepage"     color={C.cyan}   icon={<Ic.Star />}/>
        <StatCard label="With Images" value={stats.withImages} sub="on Cloudinary"   color={C.purple} icon={<Ic.Img />}/>
        <StatCard label="AI Projects" value={stats.aiProjects} sub="ML & LLM builds" color={C.gold}   icon={<Ic.Ai />}/>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
            <Ic.Search />
          </div>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-[13px] transition-all"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border2)", color: "var(--ink)", outline: "none", cursor: "text" }}
            onFocus={(e) => { const el = e.target as HTMLInputElement; el.style.borderColor = "rgba(59,130,246,0.4)"; el.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
            onBlur={(e)  => { const el = e.target as HTMLInputElement; el.style.borderColor = "var(--border2)"; el.style.boxShadow = "none"; }}
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="font-mono text-[11px] px-3 py-2 rounded-xl transition-all"
            style={{ color: "var(--ink4)", border: "1px solid var(--border2)", cursor: "pointer", background: "transparent" }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--ink4)"; el.style.color = "var(--ink2)"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border2)"; el.style.color = "var(--ink4)"; }}>
            ✕ Clear
          </button>
        )}
        <div className="ml-auto px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)" }}>
          <span className="font-mono text-[10px]">
            <span style={{ color: "#60A5FA", fontWeight: 700 }}>{filtered.length}</span>
            <span style={{ color: "var(--ink4)" }}> / {projects.length}</span>
          </span>
        </div>
      </div>

      {/* Table */}
      <Panel>
        {/* Header row */}
        <div className="flex items-center gap-4 px-5 py-3"
          style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase ml-14 flex-1" style={{ color: "var(--ink4)" }}>Project</span>
          <span className="hidden lg:block font-mono text-[9px] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)", minWidth: 180 }}>Result</span>
          <span className="font-mono text-[9px] tracking-[0.18em] uppercase text-right" style={{ color: "var(--ink4)", width: 72 }}>Actions</span>
        </div>

        {/* Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "var(--border2)", borderTopColor: C.accent }}/>
              <div className="absolute inset-0 rounded-full border-2 border-b-transparent animate-spin"
                style={{ borderColor: "transparent", borderBottomColor: C.cyan, animationDirection: "reverse", animationDuration: "1.5s" }}/>
            </div>
            <span className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>Loading from Firestore…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="3" stroke="var(--ink4)" strokeWidth="1.5"/>
                <path d="M8 11h6M11 8v6" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="font-semibold text-[14px] mb-1" style={{ color: "var(--ink3)", fontFamily: "'DM Sans',sans-serif" }}>
                {search ? "No results found" : "No projects yet"}
              </p>
              <p className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>
                {search ? "Try a different search term" : "Click 'New Project' to get started"}
              </p>
            </div>
            {search
              ? <button onClick={() => setSearch("")} className="font-mono text-[11px] px-4 py-2 rounded-xl"
                  style={{ color: "var(--ink4)", border: "1px solid var(--border2)", cursor: "pointer" }}>Clear search</button>
              : <PrimaryBtn small onClick={onAdd}>Add first project →</PrimaryBtn>
            }
          </div>
        ) : (
          filtered.map((p) => (
            <ProjectRow key={p.id} project={p}
              onEdit={() => onEdit(p)}
              onDelete={() => onDelete(p)}
            />
          ))
        )}
      </Panel>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// ANALYTICS TAB
// ═════════════════════════════════════════════════════════════════════════════

function AnalyticsTab({ projects }: { projects: FirestoreProject[] }) {
  const byCategory = useMemo(
    () => projects.reduce<Record<string, number>>((a, p) => {
      a[p.category] = (a[p.category] || 0) + 1; return a;
    }, {}),
    [projects],
  );
  const maxCount = Math.max(...Object.values(byCategory), 1);
  const catColors: Record<string, string> = {
    "AI Development": C.accent, "Web Application": C.cyan, "Mobile App": C.purple,
    "UI/UX Design": C.gold, "Digital Marketing": C.green, "Software Consulting": C.accent2,
  };
  const summaryStats = useMemo(() => [
    { label: "Featured",   value: projects.filter((p) => p.featured).length,        color: C.accent },
    { label: "With Image", value: projects.filter((p) => p.imageUrl).length,         color: C.cyan   },
    { label: "Categories", value: Object.keys(byCategory).length,                    color: C.purple },
    { label: "Total Tags", value: projects.reduce((a, p) => a + p.tags.length, 0),  color: C.gold   },
  ], [projects, byCategory]);

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map(({ label, value, color }) => (
          <Panel key={label}>
            <div className="p-5 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg,${color}70,transparent 60%)` }}/>
              <div className="font-mono text-[30px] font-black leading-none mb-2"
                style={{ color, textShadow: `0 0 20px ${color}30` }}>{value}</div>
              <div className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: "var(--ink4)" }}>{label}</div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Category bars */}
      <Panel>
        <div className="p-6">
          <h3 className="font-bold text-[15px] mb-5" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>
            Projects by category
          </h3>
          {Object.keys(byCategory).length > 0 ? (
            <div className="flex flex-col gap-4">
              {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                const color = catColors[cat] || C.accent;
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
                        style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: `linear-gradient(90deg,${color},${color}66)` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)" }}>No project data yet</p>
          )}
        </div>
      </Panel>

      {/* Top projects */}
      <Panel>
        <div className="p-6">
          <h3 className="font-bold text-[15px] mb-5" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>
            Top performing projects
          </h3>
          {projects.filter((p) => p.result).length > 0 ? (
            <div className="flex flex-col gap-2">
              {projects.filter((p) => p.result).slice(0, 5).map((p, i) => (
                <div key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-150 cursor-default"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}>
                  <span className="font-mono text-[10px] w-5 text-center flex-shrink-0"
                    style={{ color: i === 0 ? C.gold : i === 1 ? "var(--ink3)" : i === 2 ? C.accent : "var(--ink4)" }}>
                    {i === 0 ? "①" : i === 1 ? "②" : i === 2 ? "③" : `${i + 1}`}
                  </span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                    {p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] truncate" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>{p.title}</div>
                    <div className="font-mono text-[9px]" style={{ color: "var(--ink4)" }}>{p.category}</div>
                  </div>
                  <span className="font-mono text-[11px] font-bold flex-shrink-0" style={{ color: p.color }}>{p.result}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)" }}>No projects yet</p>
          )}
        </div>
      </Panel>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD
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

  const ctaLabel       = CTA[tab];
  const activeNavItem  = NAV_ITEMS.find((n) => n.id === tab);

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
          className="flex flex-col flex-shrink-0 transition-all duration-300 relative"
          style={{ width: sidebarOpen ? 220 : 52, background: "var(--bg-panel)", borderRight: "1px solid var(--border)" }}>

          {/* Right-edge accent glow */}
          <div className="absolute top-0 right-0 bottom-0 w-px pointer-events-none"
            style={{ background: "linear-gradient(180deg,transparent,rgba(59,130,246,0.22) 40%,rgba(6,182,212,0.12) 60%,transparent)" }}/>

          {/* ── LOGO ROW ── */}
          <div className="flex items-center h-14 flex-shrink-0 overflow-hidden"
            style={{ borderBottom: "1px solid var(--border)", padding: sidebarOpen ? "0 14px" : "0 10px" }}>

            {/* Logo mark — always visible */}
            <div className="relative w-7 h-7 flex-shrink-0 cursor-pointer"
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
              <div className="absolute inset-0 rounded-lg"
                style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)", boxShadow: "0 0 14px rgba(59,130,246,0.4)" }}/>
              <div className="absolute inset-[2px] rounded-md" style={{ background: "var(--bg-panel)" }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono font-black text-[9px]" style={{ color: "#60A5FA" }}>ZH</span>
              </div>
            </div>

            {/* Brand name — only when expanded */}
            {sidebarOpen && (
              <div className="min-w-0 flex-1 overflow-hidden ml-2.5">
                <div className="font-black text-[14px] tracking-tight leading-none whitespace-nowrap" style={{ color: "var(--ink)" }}>
                  ZynHive<span style={{ color: C.accent }}>.</span>
                </div>
                <div className="font-mono text-[8px] tracking-[0.15em] uppercase mt-0.5" style={{ color: "var(--ink4)" }}>Admin</div>
              </div>
            )}

            {/* Toggle button — always visible, floats to the right when expanded */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{
                width: 28, height: 28, marginLeft: sidebarOpen ? "auto" : 6,
                background: "transparent", border: "1px solid var(--border2)",
                color: "var(--ink4)", cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(59,130,246,0.1)";
                el.style.borderColor = "rgba(59,130,246,0.3)";
                el.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "transparent";
                el.style.borderColor = "var(--border2)";
                el.style.color = "var(--ink4)";
              }}>
              {sidebarOpen ? <Ic.ChevronLeft /> : <Ic.ChevronRight />}
            </button>
          </div>

          {/* Section label — only when expanded */}
          {sidebarOpen && (
            <div className="px-4 pt-4 pb-1">
              <span className="font-mono text-[8px] tracking-[0.22em] uppercase" style={{ color: "var(--ink4)" }}>Navigation</span>
            </div>
          )}

          {/* ── NAV ITEMS ── */}
          <nav className="flex flex-col flex-1 overflow-hidden"
            style={{ gap: 2, padding: sidebarOpen ? "4px 8px" : "8px 6px" }}>
            {NAV_ITEMS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  title={item.label}
                  className="flex items-center transition-all duration-200 w-full relative overflow-hidden rounded-xl"
                  style={{
                    gap:        sidebarOpen ? 10 : 0,
                    padding:    sidebarOpen ? "9px 10px 9px 12px" : "10px 0",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    background: active ? "rgba(59,130,246,0.12)" : "transparent",
                    color:      active ? "#60A5FA"                : "var(--ink4)",
                    border:     active ? "1px solid rgba(59,130,246,0.2)" : "1px solid transparent",
                    cursor:     "pointer", textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "rgba(255,255,255,0.04)";
                      el.style.color      = "var(--ink2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = "transparent";
                      el.style.color      = "var(--ink4)";
                    }
                  }}>

                  {/* Active left-bar indicator */}
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                      style={{ background: C.accent, boxShadow: `0 0 8px ${C.accent}` }}/>
                  )}

                  {/* Icon — always visible, centred when collapsed */}
                  <span className="flex-shrink-0" style={{ marginLeft: active ? 2 : 0 }}>
                    {item.icon}
                  </span>

                  {/* Label + badge — only when expanded */}
                  {sidebarOpen && (
                    <>
                      <span className="font-medium text-[13px] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                          style={{ background: C.accent, color: "white" }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Collapsed badge dot */}
                  {!sidebarOpen && item.badge && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: C.accent }}/>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div style={{ height: "0.5px", background: "var(--border)", margin: "6px 10px" }}/>

          {/* ── USER ROW ── */}
          <div className="flex-shrink-0 flex items-center gap-2.5 overflow-hidden"
            style={{ padding: sidebarOpen ? "10px 14px" : "10px 8px", justifyContent: sidebarOpen ? "flex-start" : "center" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[10px] text-white"
              style={{ background: "linear-gradient(135deg,#3B82F6,#06B6D4)", flexShrink: 0 }}>
              {user.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[10px] truncate" style={{ color: "var(--ink2)" }}>{user.email}</p>
                <p className="font-mono text-[8px] tracking-[0.12em] uppercase mt-0.5" style={{ color: "var(--ink4)" }}>Administrator</p>
              </div>
            )}
          </div>
        </aside>

        {/* ══════════ MAIN ══════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="h-14 flex items-center justify-between px-5 flex-shrink-0"
            style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border)" }}>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.12em] uppercase hidden sm:block" style={{ color: "var(--ink4)" }}>ZynHive</span>
              <span className="hidden sm:flex items-center" style={{ color: "var(--ink4)" }}><Ic.Breadcrumb /></span>
              <span className="font-semibold text-[14px]" style={{ color: "var(--ink)", fontFamily: "'DM Sans',sans-serif" }}>
                {activeNavItem?.label}
              </span>
            </div>

            {/* Inline search — only on projects tab, medium+ screens */}
            {tab === "projects" && (
              <div className="relative flex-1 max-w-xs mx-5 hidden md:block">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
                  <Ic.Search />
                </div>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search projects…"
                  className="w-full rounded-xl text-[12px] transition-colors"
                  style={{
                    background: "var(--bg-surface)", border: "0.5px solid var(--border2)",
                    color: "var(--ink)", outline: "none", padding: "6px 12px 6px 28px", fontFamily: "inherit",
                  }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(59,130,246,0.35)"; }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
                />
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Live pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border2)" }}>
                <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                  <span style={{ color: "#60A5FA", fontWeight: 700 }}>{projects.length}</span> projects
                </span>
                <div style={{ width: 1, height: 12, background: "var(--border2)" }}/>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }}/>
                <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>Live</span>
              </div>

              {/* Notification bell */}
              <div className="relative">
                <IconBtn title="Notifications"><Ic.Bell /></IconBtn>
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{ background: C.red, border: "1.5px solid var(--bg-panel)" }}/>
              </div>

              {/* Profile */}
              <ProfileDropdown email={user.email ?? ""} onLogout={() => adminLogout()} />

              {/* Context CTA */}
              {ctaLabel && (
                <PrimaryBtn onClick={handleCta}>
                  <Ic.Plus />
                  {ctaLabel}
                </PrimaryBtn>
              )}
            </div>
          </header>

          {/* Page content */}
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

        {/* Overlays */}
        {formOpen && (
          <ProjectForm
            project={editProject}
            onClose={() => setFormOpen(false)}
            onSaved={() => {
              loadProjects();
              showToast(editProject ? "Project updated!" : "Project created!");
            }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            title={deleteTarget.title}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}