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

// ─── Theme helpers ────────────────────────────────────────────────────────────
function getStoredTheme(): boolean {
  try { return localStorage.getItem("admin-theme") === "dark"; } catch { return false; }
}
function applyTheme(dark: boolean) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  try { localStorage.setItem("admin-theme", dark ? "dark" : "light"); } catch { /* noop */ }
}

// ─── ThemeToggle ─────────────────────────────────────────────────────────────
export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "relative",
        width: 52, height: 28,
        borderRadius: 99,
        border: "1.5px solid var(--border2)",
        background: "var(--bg-alt)",
        cursor: "pointer",
        overflow: "hidden",
        flexShrink: 0,
        transition: "border-color .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--accent)";
        el.style.boxShadow = "0 0 0 3px var(--accent-pale)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border2)";
        el.style.boxShadow = "none";
      }}
    >
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 6px", pointerEvents: "none",
        fontSize: 11, lineHeight: 1,
      }}>
        <span style={{ opacity: dark ? 0.35 : 1, transition: "opacity .3s" }}>☀</span>
        <span style={{ opacity: dark ? 1 : 0.35, transition: "opacity .3s" }}>☽</span>
      </div>
      <div style={{
        position: "absolute", top: 3, left: 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "var(--accent)",
        transform: dark ? "translateX(24px)" : "translateX(0)",
        transition: "transform 380ms cubic-bezier(0.16,1,0.3,1)",
      }} />
    </button>
  );
}

// ─── Keyframe injector ────────────────────────────────────────────────────────
const ADMIN_KF = `
  @keyframes spinLoader { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
`;
function KFInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = ADMIN_KF;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

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
  Menu: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M2 4h11M2 7.5h11M2 11h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
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

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const handler = () => setW(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARED ATOMS
// ═════════════════════════════════════════════════════════════════════════════

function IconBtn({
  children, title, onClick, danger = false, accent = false, size = 30,
}: {
  children: React.ReactNode; title?: string; onClick?: () => void;
  danger?: boolean; accent?: boolean; size?: number;
}) {
  return (
    <button title={title} onClick={onClick}
      className="flex items-center justify-center rounded-lg transition-all duration-150 flex-shrink-0"
      style={{ width: size, height: size, background: "transparent", border: "none", color: "var(--ink4)", cursor: "pointer" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = danger ? "var(--red-pale)" : accent ? "var(--accent-pale)" : "var(--bg-alt)";
        el.style.color = danger ? "var(--red)" : accent ? "var(--accent)" : "var(--ink2)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = "transparent";
        el.style.color = "var(--ink4)";
      }}>
      {children}
    </button>
  );
}

function PrimaryBtn({ children, onClick, small = false }: {
  children: React.ReactNode; onClick?: () => void; small?: boolean;
}) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 font-semibold text-white rounded-lg active:scale-95"
      style={{
        background: "var(--accent)",
        padding:    small ? "6px 14px" : "7px 16px",
        fontSize:   small ? 12 : 13,
        border:     "none", cursor: "pointer",
        transition: "opacity .15s",
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl ${className}`}
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
      {children}
    </div>
  );
}

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
        <div className="text-[22px] font-semibold leading-none mb-1.5" style={{ color: "var(--ink)" }}>
          {value}
        </div>
        {trend ? (
          <span className="flex items-center gap-1 text-[11px]"
            style={{ color: trend.up ? "var(--green)" : "var(--red)" }}>
            {trend.up ? <Ic.TrendUp /> : <Ic.TrendDown />}
            {trend.text}
          </span>
        ) : (
          <span className="text-[11px]" style={{ color: "var(--ink4)" }}>{sub}</span>
        )}
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
        border:     `0.5px solid ${isOk ? "var(--border2)" : "rgba(239,68,68,0.3)"}`,
        color:      isOk ? "var(--ink2)" : "var(--red)",
        boxShadow:  "var(--shadow-md)",
        animation:  "toastIn .3s cubic-bezier(0.16,1,0.3,1) both",
        fontFamily: "'DM Sans',sans-serif", fontSize: 13,
      }}>
      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{
          background: isOk ? "var(--green-pale)" : "var(--red-pale)",
          color:      isOk ? "var(--green)"      : "var(--red)",
        }}>
        {isOk ? "✓" : "✕"}
      </div>
      {msg}
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ title, onConfirm, onCancel }: {
  title: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[360px] rounded-2xl p-7 text-center"
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border2)",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "var(--red-pale)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-semibold text-[16px] mb-1.5" style={{ color: "var(--ink)" }}>Delete project?</h3>
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
      <button onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
        style={{ background: open ? "var(--bg-alt)" : "transparent", border: "0.5px solid var(--border2)", cursor: "pointer", transition: "background .15s" }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
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
          style={{
            background: "var(--bg-card)",
            border: "0.5px solid var(--border2)",
            minWidth: 162,
            boxShadow: "var(--shadow-md)",
            animation: "fadeScaleIn .16s cubic-bezier(0.16,1,0.3,1) both",
          }}>
          {["View profile", "Account settings"].map((label) => (
            <button key={label} onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-[12px] block"
              style={{ color: "var(--ink3)", background: "transparent", border: "none", cursor: "pointer", transition: "background .1s, color .1s" }}
              onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = "var(--ink)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; }}>
              {label}
            </button>
          ))}
          <div style={{ height: "0.5px", background: "var(--border)", margin: "3px 0" }}/>
          <button onClick={onLogout}
            className="w-full text-left px-4 py-2.5 text-[12px] block"
            style={{ color: "var(--red)", background: "transparent", border: "none", cursor: "pointer", transition: "background .1s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--red-pale)"; }}
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

function ProjectRow({ project, onEdit, onDelete, compact }: {
  project: FirestoreProject; onEdit: () => void; onDelete: () => void;
  compact?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b last:border-0 cursor-default"
      style={{ borderColor: "var(--border)", background: hov ? "var(--bg-alt)" : "transparent", transition: "background .15s" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}>

      <div className="w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden"
        style={{
          background: `${project.color}15`,
          border: `1px solid ${project.color}28`,
          transform: hov ? "scale(1.06)" : "scale(1)",
          transition: "transform .2s",
        }}>
        {project.imageUrl
          ? <img src={getCloudinaryThumb(project.imageUrl, 72, 72)} alt={project.title} className="w-full h-full object-cover" loading="lazy"/>
          : <div className="w-full h-full flex items-center justify-center text-base">{project.emoji}</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-[13px] truncate" style={{ color: "var(--ink)" }}>{project.title}</span>
          {project.featured && (
            <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-semibold"
              style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "0.5px solid var(--accent-pale2)" }}>
              Live
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="admin-table-cat text-[10px] px-2 py-0.5 rounded-md font-medium"
            style={{ color: project.color, background: `${project.color}12`, border: `1px solid ${project.color}22` }}>
            {project.category}
          </span>
          {project.tags.slice(0, compact ? 1 : 2).map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ color: "var(--ink4)", background: "var(--bg-alt)", border: "0.5px solid var(--border)" }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {!compact && (
        <div className="admin-table-res hidden lg:flex items-center gap-1.5 max-w-[190px] flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.color }}/>
          <span className="text-[12px] truncate" style={{ color: "var(--ink3)" }}>{project.result}</span>
        </div>
      )}

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
  const w = useWindowWidth();
  const compact = w < 768;

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
    <div className="admin-content-pad flex flex-col gap-4" style={{ padding: compact ? 12 : 20 }}>

      <div className="admin-stat-grid grid gap-3"
        style={{ gridTemplateColumns: compact ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))" }}>
        <StatCard label="Total projects" value={stats.total}      sub="all categories"  iconBg="var(--accent-pale)"  iconColor="var(--accent)"  icon={<Ic.Projects />}/>
        <StatCard label="Featured"       value={stats.featured}   sub="on homepage"     iconBg="var(--purple-pale)"  iconColor="var(--purple)"  icon={<Ic.Star />}/>
        <StatCard label="With images"    value={stats.withImages} sub="on Cloudinary"   iconBg="var(--green-pale)"   iconColor="var(--green)"   icon={<Ic.Img />}/>
        <StatCard label="AI projects"    value={stats.aiProjects} sub="ML & LLM builds" iconBg="var(--gold-pale)"    iconColor="var(--gold)"    icon={<Ic.Ai />}/>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
            <Ic.Search />
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
            className="w-full pl-9 pr-4 py-2 rounded-lg text-[13px]"
            style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", color: "var(--ink)", outline: "none", transition: "border-color .2s" }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
            onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="text-[12px] px-3 py-2 rounded-lg"
            style={{ color: "var(--ink3)", border: "0.5px solid var(--border2)", cursor: "pointer", background: "var(--bg-card)", transition: "background .15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-card)"; }}>
            ✕ Clear
          </button>
        )}
        <div className="ml-auto text-[11px] px-3 py-1.5 rounded-lg"
          style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", color: "var(--ink4)" }}>
          <span style={{ color: "var(--accent)", fontWeight: 600 }}>{filtered.length}</span>
          {" / "}{projects.length}
        </div>
      </div>

      <Card>
        <div className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: "var(--bg-alt)", borderBottom: "0.5px solid var(--border)", borderRadius: "12px 12px 0 0" }}>
          <span className="text-[10px] font-semibold uppercase tracking-widest flex-1 pl-12" style={{ color: "var(--ink4)" }}>Project</span>
          {!compact && (
            <span className="admin-table-res hidden lg:block text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)", minWidth: 180 }}>Result</span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)", width: 72, textAlign: "right" }}>Actions</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-7 h-7 rounded-full border-2"
              style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)", animation: "spinLoader .7s linear infinite" }}/>
            <span className="text-[12px]" style={{ color: "var(--ink4)" }}>Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent-pale)", color: "var(--accent)" }}>
              <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M8 11h6M11 8v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-medium text-[14px]" style={{ color: "var(--ink2)" }}>
              {search ? "No results found" : "No projects yet"}
            </p>
            <p className="text-[12px]" style={{ color: "var(--ink4)" }}>
              {search ? "Try a different search term" : "Click 'New Project' to get started"}
            </p>
            {search
              ? <button onClick={() => setSearch("")} className="text-[12px] px-4 py-2 rounded-lg"
                  style={{ color: "var(--ink3)", border: "0.5px solid var(--border2)", cursor: "pointer", background: "var(--bg-card)" }}>
                  Clear search
                </button>
              : <PrimaryBtn small onClick={onAdd}>Add first project →</PrimaryBtn>
            }
          </div>
        ) : (
          filtered.map((p) => (
            <ProjectRow key={p.id} project={p} compact={compact}
              onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
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
  const w = useWindowWidth();
  const compact = w < 640;

  const byCategory = useMemo(
    () => projects.reduce<Record<string, number>>(
      (a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a; }, {}),
    [projects],
  );
  const maxCount = Math.max(...Object.values(byCategory), 1);

  const catColors: Record<string, string> = {
    "AI Development":      "#378ADD",
    "Web Application":     "#7F77DD",
    "Mobile App":          "#8B5CF6",
    "UI/UX Design":        "#BA7517",
    "Digital Marketing":   "#639922",
    "Software Consulting": "#6366F1",
  };

  const summaryStats = useMemo(() => [
    { label: "Featured",   value: projects.filter((p) => p.featured).length,       ic: "var(--accent)",  ib: "var(--accent-pale)" },
    { label: "With image", value: projects.filter((p) => p.imageUrl).length,        ic: "var(--purple)",  ib: "var(--purple-pale)" },
    { label: "Categories", value: Object.keys(byCategory).length,                   ic: "var(--green)",   ib: "var(--green-pale)"  },
    { label: "Total tags", value: projects.reduce((a, p) => a + p.tags.length, 0), ic: "var(--gold)",    ib: "var(--gold-pale)"   },
  ], [projects, byCategory]);

  return (
    <div style={{ padding: compact ? 12 : 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: compact ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))", gap: 12 }}>
        {summaryStats.map(({ label, value, ic, ib }) => (
          <Card key={label}>
            <div className="p-4 text-center">
              <div className="text-[26px] font-semibold leading-none mb-1" style={{ color: ic }}>{value}</div>
              <div className="text-[11px]" style={{ color: "var(--ink4)" }}>{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="admin-analytics-grid" style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 16 }}>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>Projects by category</h3>
            {Object.keys(byCategory).length > 0 ? (
              <div className="flex flex-col gap-4">
                {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                  const color = catColors[cat] || "var(--accent)";
                  return (
                    <div key={cat}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: color }}/>
                          <span className="text-[12px]" style={{ color: "var(--ink3)" }}>{cat}</span>
                        </div>
                        <span className="text-[12px] font-semibold" style={{ color }}>{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${Math.round((count / maxCount) * 100)}%`, background: color, transition: "width .7s var(--ease)" }}/>
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

        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-[14px] mb-4" style={{ color: "var(--ink)" }}>Top performing</h3>
            {projects.filter((p) => p.result).length > 0 ? (
              <div className="flex flex-col gap-1">
                {projects.filter((p) => p.result).slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg cursor-default"
                    style={{ background: "transparent", transition: "background .15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <span className="text-[11px] w-5 text-center flex-shrink-0 font-semibold"
                      style={{ color: i === 0 ? "var(--gold)" : i === 1 ? "var(--ink3)" : i === 2 ? "var(--cyan)" : "var(--ink4)" }}>
                      {i + 1}
                    </span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${p.color}14`, border: `1px solid ${p.color}25` }}>
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[13px] truncate" style={{ color: "var(--ink)" }}>{p.title}</div>
                      <div className="text-[11px]" style={{ color: "var(--ink4)" }}>{p.category}</div>
                    </div>
                    <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: p.color }}>{p.result}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)" }}>No projects yet</p>
            )}
          </div>
        </Card>
      </div>
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
  const [dark,         setDark]         = useState<boolean>(() => getStoredTheme());

  const w        = useWindowWidth();
  const isMobile = w < 768;

  const effectiveSidebarOpen = isMobile ? false : sidebarOpen;

  useEffect(() => { applyTheme(dark); }, [dark]);

  const handleThemeToggle = useCallback(() => {
    setDark((prev) => { const next = !prev; applyTheme(next); return next; });
  }, []);

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

  const activeNavItem = NAV_ITEMS.find((n) => n.id === tab);

  const sidebarW = effectiveSidebarOpen ? 210 : 52;

  return (
    <>
      <KFInjector />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex"
        style={{ background: "var(--bg)", fontFamily: "'DM Sans',sans-serif" }}>

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="flex flex-col flex-shrink-0"
          style={{
            width:       sidebarW,
            background:  "var(--bg-panel)",
            borderRight: "0.5px solid var(--border)",
            overflow:    "hidden",
            transition:  "width .3s var(--ease), background .3s",
            ...(isMobile ? {
              position: "absolute",
              top: 0, left: 0, bottom: 0,
              zIndex: 40,
            } : {}),
          }}>

          <div className="flex items-center flex-shrink-0"
            style={{
              height: 52,
              borderBottom: "0.5px solid var(--border)",
              padding: effectiveSidebarOpen ? "0 12px" : "0",
              justifyContent: effectiveSidebarOpen ? "flex-start" : "center",
              gap: effectiveSidebarOpen ? 9 : 0,
            }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{ background: "var(--accent)" }}
              onClick={() => setSidebarOpen((o) => !o)}
              title={effectiveSidebarOpen ? "Collapse" : "Expand"}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {effectiveSidebarOpen && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="font-semibold text-[14px] leading-tight whitespace-nowrap" style={{ color: "var(--ink)" }}>ZynHive</div>
                <div className="text-[10px]" style={{ color: "var(--ink4)" }}>Admin panel</div>
              </div>
            )}

            {effectiveSidebarOpen && (
              <button onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{ width: 24, height: 24, background: "transparent", border: "0.5px solid var(--border2)", color: "var(--ink4)", cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
                <Ic.ChevronLeft />
              </button>
            )}
          </div>

          {effectiveSidebarOpen && (
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--ink4)" }}>Menu</span>
            </div>
          )}

          <nav className="flex flex-col flex-1 overflow-hidden"
            style={{ gap: 2, padding: effectiveSidebarOpen ? "4px 8px" : "8px 6px" }}>
            {NAV_ITEMS.map((item) => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => switchTab(item.id)} title={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    position: "relative",
                    borderRadius: 9,
                    gap:            effectiveSidebarOpen ? 10 : 0,
                    padding:        effectiveSidebarOpen ? "9px 10px" : "10px 0",
                    justifyContent: effectiveSidebarOpen ? "flex-start" : "center",
                    background:     active ? "var(--accent-pale)" : "transparent",
                    color:          active ? "var(--accent)"      : "var(--ink3)",
                    border:         active ? "0.5px solid var(--accent-pale2)" : "0.5px solid transparent",
                    cursor: "pointer", fontWeight: active ? 600 : 400,
                    transition: "all .15s",
                    textAlign: "left",
                    lineHeight: 1,
                  }}
                  onMouseEnter={(e) => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = "var(--ink2)"; } }}
                  onMouseLeave={(e) => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; } }}>
                  <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                  {effectiveSidebarOpen && (
                    <>
                      <span style={{ fontSize: 13, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1, paddingTop: 1 }}>{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "var(--accent)", color: "white" }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {!effectiveSidebarOpen && item.badge && (
                    <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }}/>
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ height: "0.5px", background: "var(--border)", margin: "6px 10px" }}/>

          <div className="flex-shrink-0 flex items-center gap-2.5 overflow-hidden"
            style={{ padding: effectiveSidebarOpen ? "10px 14px" : "10px 0", justifyContent: effectiveSidebarOpen ? "flex-start" : "center" }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-[11px]"
              style={{ background: "var(--accent-pale)", color: "var(--accent)", border: "0.5px solid var(--accent-pale2)" }}>
              {user.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            {effectiveSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--ink2)" }}>{user.email}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--ink4)" }}>Administrator</p>
              </div>
            )}
          </div>
        </aside>

        {isMobile && (
          <div style={{ width: 52, flexShrink: 0 }} />
        )}

        {/* ══════════ MAIN ══════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          <header className="flex items-center gap-2 flex-shrink-0"
            style={{
              height: 52,
              padding: "0 16px",
              background: "var(--bg-panel)",
              borderBottom: "0.5px solid var(--border)",
            }}>

            {isMobile && (
              <IconBtn title="Menu" onClick={() => setSidebarOpen((o) => !o)} size={32}>
                <Ic.Menu />
              </IconBtn>
            )}

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!isMobile && <span className="text-[11px]" style={{ color: "var(--ink4)" }}>ZynHive</span>}
              {!isMobile && <span style={{ color: "var(--ink4)" }}><Ic.Breadcrumb /></span>}
              <span className="font-semibold text-[14px]" style={{ color: "var(--ink)" }}>{activeNavItem?.label}</span>
            </div>

            {tab === "projects" && !isMobile && (
              <div className="admin-hdr-search relative flex-1 max-w-[220px] mx-3">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
                  <Ic.Search />
                </div>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-lg text-[12px]"
                  style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)", color: "var(--ink)", outline: "none", padding: "6px 12px 6px 28px", fontFamily: "inherit", transition: "border-color .2s" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {!isMobile && (
                <div className="admin-status-pill flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border)" }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }}/>
                  <span className="text-[11px]" style={{ color: "var(--ink4)" }}>
                    <span style={{ color: "var(--accent)", fontWeight: 600 }}>{projects.length}</span> projects
                  </span>
                </div>
              )}

              <div className="relative">
                <IconBtn title="Notifications" size={30}><Ic.Bell /></IconBtn>
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full pointer-events-none"
                  style={{ background: "var(--red)", border: "1.5px solid var(--bg-panel)" }}/>
              </div>

              <ThemeToggle dark={dark} onToggle={handleThemeToggle} />

              <ProfileDropdown email={user.email ?? ""} onLogout={() => adminLogout()} />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
            {tab === "projects" && (
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

        {/* ── ProjectForm overlay ── */}
        {formOpen && (
          <ProjectForm
            project={editProject}
            onClose={() => setFormOpen(false)}
            onSaved={() => {
              // Called by "Create Project →" and "Save Changes" — close + refresh + toast
              loadProjects();
              showToast(editProject ? "Project updated!" : "Project created!");
            }}
            onSavedAndContinue={() => {
              // Called by "Save & Add Another" — KEEP form open, just refresh list + toast
              loadProjects();
              showToast("Project saved!");
            }}
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