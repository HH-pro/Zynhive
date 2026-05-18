// ─── src/pages/admin/AdminDashboard.tsx ─────────────────────────────────────
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import {
  adminLogout, fetchProjects, deleteProject,
  subscribePendingReviews, updateReview, createClientUpdate,
  fetchClients, fetchAdminSettings, saveAdminSettings,
  logActivity, subscribeActivityLog,
  adjustMemberScore, updateTask, fetchMemberById, TASK_SCORE_REWARD,
  type FirestoreProject, type FirestoreReview, type FirestoreClient, type ActivityLog,
} from "../../lib/firebase";
import { sendTaskRejectedEmail } from "../../lib/email";
import { ProjectForm }        from "../../components/admin/ProjectForm";
import { TeamTab }            from "../../components/admin/TeamTab";
import { LeadTab }            from "../../components/admin/Leadtab";
import { ClientTab }          from "../../components/admin/ClientTab";
import { TaskTab }            from "../../components/admin/TaskTab";
import { OverviewTab }        from "../../components/admin/OverviewTab";
import { getCloudinaryThumb } from "../../lib/cloudinary";
import type { User }          from "firebase/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props { user: User; }
type Tab = "overview" | "projects" | "leads" | "team" | "analytics" | "clients" | "tasks";

// ─── Theme helpers ────────────────────────────────────────────────────────────
// Persists choice and writes data-theme to <html> so index.css vars swap.
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
      {/* Icon row */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 6px", pointerEvents: "none",
        fontSize: 11, lineHeight: 1,
      }}>
        <span style={{ opacity: dark ? 0.35 : 1, transition: "opacity .3s" }}>☀</span>
        <span style={{ opacity: dark ? 1 : 0.35, transition: "opacity .3s" }}>☽</span>
      </div>
      {/* Thumb */}
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
// Only admin-specific keyframes. All token variables live in index.css.
const ADMIN_KF = `
  @keyframes spinLoader    { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes fadeScaleIn   { from { opacity:0; transform:scale(0.95) translateY(4px); } to { opacity:1; transform:scale(1) translateY(0); } }
  @keyframes toastIn       { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulseLoad     { 0%,100% { opacity:.45; } 50% { opacity:.9; } }
  @keyframes slideInRight  { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes slideUpFade   { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bellShake     { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(12deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
  @keyframes glowPulse     { 0%,100%{box-shadow:0 0 6px rgba(79,125,255,.45)} 50%{box-shadow:0 0 18px rgba(79,125,255,.85),0 0 32px rgba(79,125,255,.35)} }
  @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
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
  Overview: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="6" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="9" y="1" width="5" height="4" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="1" y="7" width="5" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="8" y="7" width="6" height="3" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="8" y="11" width="6" height="3" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
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
  Clients: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="5.5" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M10.5 1.5v4M12.5 3.5h-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Tasks: () => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="2" y="4" width="11" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M5 4V3a2.5 2.5 0 015 0v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      <path d="M5 8.5l1.5 1.5 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
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
  Gear: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.1"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  History: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1.5 7a5.5 5.5 0 101-3M1.5 1v3h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 4.5V7l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  BarChart: () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="8" width="3" height="5" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="5.5" y="5" width="3" height="8" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
      <rect x="10" y="2" width="3" height="11" rx="0.8" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
};

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: "overview",  label: "Overview",  icon: <Ic.Overview /> },
  { id: "projects",  label: "Projects",  icon: <Ic.Projects /> },
  { id: "leads",     label: "Leads",     icon: <Ic.Leads /> },
  { id: "team",      label: "Team",      icon: <Ic.Team /> },
  { id: "tasks",     label: "Tasks",     icon: <Ic.Tasks /> },
  { id: "analytics", label: "Analytics", icon: <Ic.Analytics /> },
  { id: "clients",   label: "Clients",   icon: <Ic.Clients /> },
];

const CTA_LABELS: Record<Tab, string> = {
  overview:  "",
  projects:  "New Project",
  leads:     "Add Lead",
  team:      "Add Member",
  tasks:     "New Task",
  analytics: "",
  clients:   "Add Client",
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

// ─── Delete confirm (type-to-confirm) ────────────────────────────────────────
function DeleteConfirm({ title, onConfirm, onCancel }: {
  title: string; onConfirm: () => void; onCancel: () => void;
}) {
  const [typed, setTyped] = useState("");
  const confirmed = typed.trim().toLowerCase() === title.trim().toLowerCase();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}>
      <div className="w-full max-w-[380px] rounded-2xl p-7"
        style={{
          background: "var(--bg-panel)",
          border: "1px solid rgba(248,113,113,0.2)",
          boxShadow: "var(--shadow-lg), 0 0 0 1px rgba(248,113,113,0.1)",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
              <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Confirm deletion</h3>
            <p className="text-[12px]" style={{ color: "var(--ink4)" }}>This action cannot be undone</p>
          </div>
        </div>
        <p className="text-[13px] mb-4" style={{ color: "var(--ink3)" }}>
          Type <strong style={{ color: "var(--red)", fontFamily: "monospace" }}>{title}</strong> to confirm:
        </p>
        <input
          value={typed} onChange={(e) => setTyped(e.target.value)}
          placeholder={`Type "${title}"`}
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none mb-5 transition-all"
          style={{
            background: "var(--bg-alt)",
            border: `1px solid ${confirmed ? "var(--green)" : typed ? "var(--red)" : "var(--border2)"}`,
            color: "var(--ink)",
            fontFamily: "monospace",
            boxShadow: confirmed ? "0 0 0 3px rgba(52,211,153,0.15)" : typed ? "0 0 0 3px rgba(248,113,113,0.10)" : "none",
          }}
        />
        <div className="flex gap-2.5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[13px] font-medium"
            style={{ border: "1px solid var(--border2)", color: "var(--ink3)", background: "transparent", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            Cancel
          </button>
          <button onClick={confirmed ? onConfirm : undefined} disabled={!confirmed}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-medium text-white"
            style={{
              background: confirmed ? "var(--red)" : "var(--bg-alt)",
              color: confirmed ? "white" : "var(--ink4)",
              border: "none", cursor: confirmed ? "pointer" : "not-allowed",
              transition: "background .2s, color .2s",
            }}>
            {confirmed ? "Delete permanently" : "Type to confirm"}
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

      {/* Stat cards — 2 cols on mobile, 4 on desktop */}
      <div className="admin-stat-grid grid gap-3"
        style={{ gridTemplateColumns: compact ? "repeat(2,minmax(0,1fr))" : "repeat(4,minmax(0,1fr))" }}>
        <StatCard label="Total projects" value={stats.total}      sub="all categories"  iconBg="var(--accent-pale)"  iconColor="var(--accent)"  icon={<Ic.Projects />}/>
        <StatCard label="Featured"       value={stats.featured}   sub="on homepage"     iconBg="var(--purple-pale)"  iconColor="var(--purple)"  icon={<Ic.Star />}/>
        <StatCard label="With images"    value={stats.withImages} sub="on Cloudinary"   iconBg="var(--green-pale)"   iconColor="var(--green)"   icon={<Ic.Img />}/>
        <StatCard label="AI projects"    value={stats.aiProjects} sub="ML & LLM builds" iconBg="var(--gold-pale)"    iconColor="var(--gold)"    icon={<Ic.Ai />}/>
      </div>

      {/* Search bar */}
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

      {/* Table */}
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
      {/* Summary cards */}
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

      {/* Two-col grid → single col on mobile */}
      <div className="admin-analytics-grid" style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 16 }}>
        {/* Category bars */}
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

        {/* Top projects */}
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
// COMMAND PALETTE  (⌘K / Ctrl+K)
// ═════════════════════════════════════════════════════════════════════════════

const CMD_ACTIONS: { label: string; sub: string; tab: Tab; icon: React.ReactNode; color: string }[] = [
  { label: "Overview",  sub: "Dashboard home",    tab: "overview",  icon: <Ic.Overview />,  color: "var(--accent)"  },
  { label: "Projects",  sub: "Manage portfolio",  tab: "projects",  icon: <Ic.Projects />,  color: "var(--purple)"  },
  { label: "Leads",     sub: "CRM pipeline",      tab: "leads",     icon: <Ic.Leads />,     color: "var(--gold)"    },
  { label: "Team",      sub: "Team members",      tab: "team",      icon: <Ic.Team />,      color: "var(--green)"   },
  { label: "Tasks",     sub: "Task management",   tab: "tasks",     icon: <Ic.Tasks />,     color: "var(--cyan)"    },
  { label: "Analytics", sub: "Reports & charts",  tab: "analytics", icon: <Ic.Analytics />, color: "var(--red)"     },
  { label: "Clients",   sub: "Client portal",     tab: "clients",   icon: <Ic.Clients />,   color: "var(--accent)"  },
];

function CmdKPalette({ onClose, onNavigate }: { onClose: () => void; onNavigate: (tab: Tab) => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursor, setCursor] = useState(0);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = CMD_ACTIONS.filter(
    (a) => !q || a.label.toLowerCase().includes(q.toLowerCase()) || a.sub.toLowerCase().includes(q.toLowerCase()),
  );

  useEffect(() => { setCursor(0); }, [q]);

  function pick(tab: Tab) { onNavigate(tab); onClose(); }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
    if (e.key === "Enter" && filtered[cursor]) pick(filtered[cursor].tab);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[520px] rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", boxShadow: "var(--shadow-lg)", animation: "fadeScaleIn .18s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <svg width="15" height="15" viewBox="0 0 13 13" fill="none" style={{ color: "var(--ink4)", flexShrink: 0 }}>
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
            placeholder="Search pages, actions…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 14, color: "var(--ink)", fontFamily: "inherit" }}/>
          <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "var(--bg-alt)", border: "0.5px solid var(--border2)", color: "var(--ink4)", fontFamily: "monospace" }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: "6px 0" }}>
          {filtered.length === 0 ? (
            <p className="text-center py-8 text-[13px]" style={{ color: "var(--ink4)" }}>No results for "{q}"</p>
          ) : (
            filtered.map((a, i) => (
              <button key={a.tab} onClick={() => pick(a.tab)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all"
                style={{ background: i === cursor ? "var(--accent-pale)" : "transparent", border: "none", cursor: "pointer", outline: "none" }}
                onMouseEnter={() => setCursor(i)}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${a.color}18`, color: a.color }}>
                  {a.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: i === cursor ? "var(--accent)" : "var(--ink)" }}>{a.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--ink4)" }}>{a.sub}</p>
                </div>
                {i === cursor && (
                  <kbd style={{ fontSize: 10, padding: "2px 6px", borderRadius: 5, background: "var(--bg-alt)", border: "0.5px solid var(--border2)", color: "var(--accent)", fontFamily: "monospace", flexShrink: 0 }}>↵</kbd>
                )}
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 flex items-center gap-4" style={{ borderTop: "0.5px solid var(--border)" }}>
          {[["↑↓", "Navigate"], ["↵", "Open"], ["ESC", "Close"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ink4)" }}>
              <kbd style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "var(--bg-alt)", border: "0.5px solid var(--border2)", fontFamily: "monospace" }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// REVIEW SYSTEM
// ═════════════════════════════════════════════════════════════════════════════

function AcceptReviewModal({ review, clients, onClose, onAccepted, adminEmail }: {
  review:      FirestoreReview;
  clients:     FirestoreClient[];
  onClose:     () => void;
  onAccepted:  () => void;
  adminEmail?: string;
}) {
  const [clientId,    setClientId]    = useState(review.linkedClientId ?? "");
  const [title,       setTitle]       = useState(review.taskTitle);
  const [description, setDescription] = useState(review.report ?? review.taskDescription ?? "");
  const [category,    setCategory]    = useState<"seo" | "digital-marketing" | "general">("general");
  const [status,      setStatus]      = useState<"planning"|"in-progress"|"review"|"completed">("completed");
  const [pct,         setPct]         = useState(100);
  const [saving,      setSaving]      = useState(false);
  const [err,         setErr]         = useState("");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "0.5px solid var(--border2)", background: "var(--bg-alt)",
    color: "var(--ink)", fontSize: 13, outline: "none",
    fontFamily: "'DM Sans', sans-serif", transition: "border-color .2s",
  };

  async function confirm() {
    if (!clientId) { setErr("Please select a client."); return; }
    setSaving(true);
    try {
      const client = clients.find((c) => c.id === clientId);
      await createClientUpdate({
        clientId,
        title:             title.trim() || review.taskTitle,
        description:       description.trim(),
        status,
        phase:             review.memberName,
        completionPercent: pct,
        category,
      });
      await updateReview(review.id!, { status: "accepted" });

      // Reward the member's score (idempotent via scoreApplied flag on the task).
      if (review.memberId && review.taskId) {
        try {
          await adjustMemberScore(review.memberId, TASK_SCORE_REWARD);
          await updateTask(review.taskId, { scoreApplied: true });
        } catch { /* silent — accept already succeeded */ }
      }

      logActivity({ action: "Review accepted", detail: `${review.memberName} — ${review.taskTitle} (+${TASK_SCORE_REWARD})`, adminEmail: adminEmail ?? "", icon: "✓", category: "review" }).catch(() => {});
      onAccepted();
      onClose();
    } catch { setErr("Failed to accept. Try again."); }
    finally { setSaving(false); }
  }

  const CAT_OPTIONS: { v: typeof category; label: string; icon: string }[] = [
    { v: "seo",               label: "SEO",               icon: "🔍" },
    { v: "digital-marketing", label: "Digital Marketing", icon: "📣" },
    { v: "general",           label: "General Update",    icon: "📋" },
  ];
  const STATUS_OPTIONS: { v: typeof status; label: string; color: string }[] = [
    { v: "planning",    label: "Planning",    color: "var(--purple)" },
    { v: "in-progress", label: "In Progress", color: "var(--gold)"   },
    { v: "review",      label: "Review",      color: "var(--cyan)"   },
    { v: "completed",   label: "Completed",   color: "var(--green)"  },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[520px] rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", boxShadow: "var(--shadow-lg)", maxHeight: "90vh", overflowY: "auto", animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 flex items-start justify-between" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div>
            <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Accept & Post to Client Portal</h2>
            <p className="text-[11px] mt-1" style={{ color: "var(--ink4)" }}>
              Review the update details before publishing to the client's portal.
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ml-3"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Submission info */}
        <div className="mx-6 mt-5 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: `${review.memberColor}22`, color: review.memberColor, border: `1px solid ${review.memberColor}33` }}>
            {review.memberName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold" style={{ color: "var(--ink)" }}>{review.memberName}</p>
            <p className="text-[11px] truncate" style={{ color: "var(--ink4)" }}>completed: {review.taskTitle}</p>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ background: "var(--green-pale)", color: "var(--green)" }}>Completed</span>
        </div>

        {review.report && (
          <div className="mx-6 mt-3 px-4 py-3 rounded-xl text-[12px] leading-relaxed"
            style={{ background: "var(--green-pale)", color: "var(--ink3)", border: "0.5px solid rgba(34,197,94,0.2)" }}>
            <span className="font-semibold text-[11px]" style={{ color: "var(--green)" }}>Member's report: </span>
            {review.report}
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">

          {/* Client selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
              Post to Client *
            </label>
            <select value={clientId} onChange={(e) => { setClientId(e.target.value); setErr(""); }}
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { (e.target as HTMLElement).style.borderColor = "var(--border2)"; }}>
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.projectName ? ` — ${c.projectName}` : ""}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Update Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { (e.target as HTMLElement).style.borderColor = "var(--border2)"; }}/>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { (e.target as HTMLElement).style.borderColor = "var(--border2)"; }}/>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Category</label>
            <div className="flex gap-2">
              {CAT_OPTIONS.map(({ v, label, icon }) => (
                <button key={v} onClick={() => setCategory(v)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-medium transition-all"
                  style={{
                    background: category === v ? "var(--accent-pale)" : "var(--bg-alt)",
                    border: `0.5px solid ${category === v ? "var(--accent)" : "var(--border2)"}`,
                    color: category === v ? "var(--accent)" : "var(--ink4)",
                    cursor: "pointer",
                  }}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>

          {/* Status + Completion % */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Status</label>
              <div className="grid grid-cols-2 gap-1.5">
                {STATUS_OPTIONS.map(({ v, label, color }) => (
                  <button key={v} onClick={() => setStatus(v)}
                    className="py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                    style={{
                      background: status === v ? `${color}15` : "var(--bg-alt)",
                      border: `0.5px solid ${status === v ? color : "var(--border2)"}`,
                      color: status === v ? color : "var(--ink4)",
                      cursor: "pointer",
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Completion %</label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))}
                  style={{ flex: 1, accentColor: "var(--accent)" }}/>
                <span className="text-[13px] font-semibold w-10 text-right" style={{ color: "var(--accent)" }}>{pct}%</span>
              </div>
            </div>
          </div>

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
          <button onClick={confirm} disabled={saving}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white"
            style={{ background: saving ? "var(--accent-pale)" : "var(--green)", border: "none", cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1, transition: "opacity .15s, background .15s", color: saving ? "var(--green)" : "white" }}>
            {saving ? "Posting…" : "✓ Accept & Post to Portal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Settings Modal ────────────────────────────────────────────────────
function AdminSettingsModal({ onClose }: { onClose: () => void }) {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    fetchAdminSettings().then((s) => {
      setEmail(s.notificationEmail ?? "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    const trimmed = email.trim();
    if (trimmed && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
    setSaving(true);
    try {
      await saveAdminSettings({ notificationEmail: trimmed });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally { setSaving(false); }
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: "100%", maxWidth: 420, borderRadius: 20,
        background: "var(--bg-panel)", border: "1px solid var(--border2)",
        boxShadow: "0 24px 80px rgba(0,0,0,.45)",
        animation: "fadeScaleIn .2s cubic-bezier(0.16,1,0.3,1) both",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: "var(--accent-pale)", display: "flex",
              alignItems: "center", justifyContent: "center", color: "var(--accent)",
            }}>
              <Ic.Gear />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--ink1)", margin: 0 }}>Admin Settings</p>
              <p style={{ fontSize: 11, color: "var(--ink4)", margin: 0, marginTop: 1 }}>Notification preferences</p>
            </div>
          </div>
          <IconBtn title="Close" onClick={onClose}>✕</IconBtn>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          <label style={{
            fontSize: 11, fontWeight: 600, textTransform: "uppercase",
            letterSpacing: "0.07em", color: "var(--ink4)", display: "block", marginBottom: 8,
          }}>
            Notification Email
          </label>
          <p style={{ fontSize: 12, color: "var(--ink4)", marginBottom: 12, lineHeight: 1.6 }}>
            When a team member submits a report, an email will be sent to this address for review.
          </p>
          {loading ? (
            <div style={{ height: 40, background: "var(--bg-alt)", borderRadius: 10, animation: "pulseLoad 1.5s ease infinite" }}/>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                placeholder="admin@example.com"
                style={{
                  flex: 1, padding: "9px 13px", borderRadius: 10, fontSize: 13,
                  background: "var(--bg-alt)", border: "1px solid var(--border2)",
                  color: "var(--ink1)", outline: "none", fontFamily: "inherit",
                  transition: "border-color .2s",
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
              />
              <button onClick={handleSave} disabled={saving} style={{
                padding: "9px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                background: saved ? "#10B981" : "var(--accent)",
                border: "none", color: "white", cursor: saving ? "default" : "pointer",
                transition: "background .2s, opacity .15s", flexShrink: 0,
                opacity: saving ? 0.7 : 1,
              }}>
                {saved ? "✓ Saved" : saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
          {email && (
            <p style={{ fontSize: 11, color: "var(--ink4)", marginTop: 8 }}>
              Reviews will be sent to <strong style={{ color: "var(--accent)" }}>{email}</strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Review Panel ─────────────────────────────────────────────────────────────
function ReviewPanel({ reviews, clients, onClose, onReload, showToast, adminEmail }: {
  reviews:    FirestoreReview[];
  clients:    FirestoreClient[];
  onClose:    () => void;
  onReload:   () => void;
  showToast:  (msg: string, type?: "success" | "error") => void;
  adminEmail?: string;
}) {
  const [acceptTarget, setAcceptTarget] = useState<FirestoreReview | null>(null);

  async function handleReject(review: FirestoreReview) {
    // Optional feedback the admin can pass back to the member.
    const reason = (window.prompt(
      `Reject "${review.taskTitle}" — give ${review.memberName} a reason / what to fix?\n(optional, will be emailed to them)`,
      ""
    ) ?? "").trim();

    try {
      await updateReview(review.id!, { status: "rejected" });

      // Re-open the task: fresh 24h deadline, clear prior submission,
      // reset penalty/score flags so the next outcome counts again.
      let newDeadlinePKT = "";
      if (review.taskId) {
        const newDeadlineIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        newDeadlinePKT = new Date(newDeadlineIso).toLocaleString("en-US", {
          timeZone: "Asia/Karachi",
          month: "short", day: "numeric",
          hour: "numeric", minute: "2-digit", hour12: true,
        }) + " PKT";
        try {
          await updateTask(review.taskId, {
            status:         "pending",
            deadline:       newDeadlineIso,
            report:         "",
            reportedBy:     "",
            completedAt:    "",
            penaltyApplied: false,
            scoreApplied:   false,
          });
        } catch { /* silent */ }
      }

      // Email the member (fire-and-forget — don't block UI on email failure).
      if (review.memberId) {
        fetchMemberById(review.memberId).then((m) => {
          if (m?.email) {
            const portalUrl = `${window.location.origin}/member/${m.id}`;
            sendTaskRejectedEmail({
              toEmail:     m.email,
              toName:      m.name,
              taskTitle:   review.taskTitle,
              reason,
              newDeadline: newDeadlinePKT,
              portalUrl,
            }).catch(() => {});
          }
        }).catch(() => {});
      }

      logActivity({
        action:     "Review rejected",
        detail:     `${review.memberName} — ${review.taskTitle}${reason ? ` · "${reason.slice(0, 60)}"` : ""} · re-assigned (+24h)`,
        adminEmail: adminEmail ?? "",
        icon:       "✕",
        category:   "review",
      }).catch(() => {});

      onReload();
      showToast("Rejected — task re-assigned & member notified.");
    } catch { showToast("Failed to reject.", "error"); }
  }

  function relativeTime(ts: FirestoreReview["createdAt"]) {
    if (!ts) return "";
    const ms = (ts as any).toMillis?.() ?? 0;
    const diff = Date.now() - ms;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.4)", transition: "none" }} onClick={onClose}/>

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col"
        style={{
          width: "min(420px, 100vw)",
          background: "var(--bg-panel)",
          borderLeft: "0.5px solid var(--border2)",
          boxShadow: "var(--shadow-lg)",
          animation: "slideInRight .25s cubic-bezier(0.16,1,0.3,1) both",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div>
            <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Pending Reviews</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
              {reviews.length} update{reviews.length !== 1 ? "s" : ""} waiting for your approval
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--green-pale)", color: "var(--green)", fontSize: 22 }}>✓</div>
              <p className="font-medium text-[14px]" style={{ color: "var(--ink2)" }}>All caught up!</p>
              <p className="text-[12px] text-center" style={{ color: "var(--ink4)" }}>No pending reviews.<br/>When a team member completes a task, it'll appear here.</p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-xl overflow-hidden"
                style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)" }}>

                {/* Top strip */}
                <div className="px-4 pt-4 pb-3">
                  <div className="flex items-start gap-3 mb-2">
                    {/* Member avatar */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: `${r.memberColor}18`, color: r.memberColor, border: `1px solid ${r.memberColor}28` }}>
                      {r.memberName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[13px]" style={{ color: "var(--ink)" }}>{r.memberName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                          style={{ background: "var(--green-pale)", color: "var(--green)" }}>completed</span>
                      </div>
                      <p className="text-[12px] truncate" style={{ color: "var(--ink3)" }}>{r.taskTitle}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--ink4)" }}>{relativeTime(r.createdAt)}</p>
                    </div>
                  </div>

                  {/* Report */}
                  {r.report && (
                    <div className="px-3 py-2.5 rounded-lg text-[12px] leading-relaxed mt-2"
                      style={{ background: "var(--bg-alt)", color: "var(--ink3)", border: "0.5px solid var(--border)" }}>
                      <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--ink4)" }}>Report · </span>
                      {r.report.slice(0, 180)}{r.report.length > 180 ? "…" : ""}
                    </div>
                  )}

                  {/* Linked client badge */}
                  {r.linkedClientId && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" style={{ color: "var(--accent)", flexShrink: 0 }}>
                        <circle cx="5.5" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
                        <path d="M1 13c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
                      </svg>
                      <span className="text-[11px]" style={{ color: "var(--accent)" }}>
                        Linked: {r.linkedClientName || r.linkedClientId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={() => handleReject(r)}
                    className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-all"
                    style={{ border: "0.5px solid var(--border2)", background: "transparent", color: "var(--ink3)", cursor: "pointer" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--red-pale)"; el.style.color = "var(--red)"; el.style.borderColor = "rgba(239,68,68,0.3)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; el.style.borderColor = "var(--border2)"; }}>
                    ✕ Reject
                  </button>
                  <button onClick={() => setAcceptTarget(r)}
                    className="flex-[2] py-2 rounded-lg text-[12px] font-semibold transition-all text-white"
                    style={{ background: "var(--green)", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
                    ✓ Accept & Post to Portal
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Accept modal — above panel */}
      {acceptTarget && (
        <AcceptReviewModal
          review={acceptTarget}
          clients={clients}
          adminEmail={adminEmail}
          onClose={() => setAcceptTarget(null)}
          onAccepted={() => {
            setAcceptTarget(null);
            onReload();
            showToast("Update posted to client portal!");
          }}
        />
      )}
    </>
  );
}

// ─── Activity Log Panel ───────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  auth:     "var(--accent)",
  task:     "var(--gold)",
  client:   "var(--cyan)",
  review:   "var(--green)",
  project:  "var(--purple)",
  member:   "#60A5FA",
  settings: "var(--ink3)",
};

function ActivityLogPanel({ logs, onClose }: { logs: ActivityLog[]; onClose: () => void }) {
  function relativeTime(ts: ActivityLog["timestamp"]) {
    if (!ts) return "";
    const ms = (ts as any).toMillis?.() ?? 0;
    const diff = Date.now() - ms;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  return (
    <>
      <div className="fixed inset-0 z-[60]" style={{ background: "rgba(0,0,0,0.4)", transition: "none" }} onClick={onClose}/>
      <div className="fixed top-0 right-0 bottom-0 z-[70] flex flex-col"
        style={{
          width: "min(400px, 100vw)",
          background: "var(--bg-panel)",
          borderLeft: "0.5px solid var(--border2)",
          boxShadow: "var(--shadow-lg)",
          animation: "slideInRight .25s cubic-bezier(0.16,1,0.3,1) both",
        }}>
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "0.5px solid var(--border)" }}>
          <div>
            <h2 className="font-semibold text-[15px]" style={{ color: "var(--ink)" }}>Activity Log</h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--ink4)" }}>
              Last {Math.min(logs.length, 50)} actions
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", cursor: "pointer", color: "var(--ink4)" }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 gap-3 py-16">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-pale)", color: "var(--accent)", fontSize: 22 }}>
                <Ic.History />
              </div>
              <p className="font-medium text-[14px]" style={{ color: "var(--ink2)" }}>No activity yet</p>
              <p className="text-[12px] text-center" style={{ color: "var(--ink4)" }}>Actions you take in the dashboard will appear here.</p>
            </div>
          ) : (
            logs.map((log, i) => {
              const color = CATEGORY_COLORS[log.category ?? "settings"] ?? "var(--ink3)";
              return (
                <div key={log.id ?? i}
                  className="flex items-start gap-3 px-3 py-3 rounded-xl"
                  style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", animation: `slideUpFade .2s ${i * 0.03}s both` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[14px]"
                    style={{ background: `${color}18`, border: `1px solid ${color}28`, fontSize: 14 }}>
                    {log.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-[12px]" style={{ color: "var(--ink)" }}>{log.action}</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
                        style={{ background: `${color}15`, color }}>
                        {log.category}
                      </span>
                    </div>
                    {log.detail && (
                      <p className="text-[11px] truncate mb-1" style={{ color: "var(--ink3)" }}>{log.detail}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: "var(--ink4)" }}>{relativeTime(log.timestamp)}</span>
                      {log.adminEmail && (
                        <>
                          <span style={{ color: "var(--border2)" }}>·</span>
                          <span className="text-[10px] truncate" style={{ color: "var(--ink4)" }}>{log.adminEmail.split("@")[0]}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════

export function AdminDashboard({ user }: Props) {
  const [projects,      setProjects]      = useState<FirestoreProject[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [tab,           setTab]           = useState<Tab>("overview");
  const [search,        setSearch]        = useState("");
  const [formOpen,      setFormOpen]      = useState(false);
  const [editProject,   setEditProject]   = useState<FirestoreProject | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<FirestoreProject | null>(null);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const [toast,         setToast]         = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [dark,          setDark]          = useState<boolean>(() => getStoredTheme());
  const [pendingReviews,   setPendingReviews]   = useState<FirestoreReview[]>([]);
  const [reviewPanelOpen,  setReviewPanelOpen]  = useState(false);
  const [settingsOpen,     setSettingsOpen]     = useState(false);
  const [allClients,       setAllClients]       = useState<FirestoreClient[]>([]);
  const [activityLogs,     setActivityLogs]     = useState<ActivityLog[]>([]);
  const [activityLogOpen,  setActivityLogOpen]  = useState(false);

  const w        = useWindowWidth();
  const isMobile = w < 640;
  const isTablet = w >= 640 && w < 1024;

  // Mobile: sidebar is a slide-over overlay (never inline)
  // Tablet: always icon-only strip
  // Desktop: full or collapsed based on state
  const effectiveSidebarOpen = isMobile ? false : (isTablet ? false : sidebarOpen);

  // Apply theme on mount + change
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

  // Subscribe to pending reviews in real-time
  useEffect(() => {
    const unsub = subscribePendingReviews(setPendingReviews);
    return unsub;
  }, []);

  // Fetch clients list for the AcceptReviewModal
  useEffect(() => { fetchClients().then(setAllClients).catch(() => {}); }, []);

  // Subscribe to activity log in real-time
  useEffect(() => {
    const unsub = subscribeActivityLog(setActivityLogs);
    return unsub;
  }, []);

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    const title = deleteTarget.title;
    try {
      await deleteProject(deleteTarget.id);
      logActivity({ action: "Project deleted", detail: title, adminEmail: user.email ?? "", icon: "🗑", category: "project" }).catch(() => {});
      setDeleteTarget(null);
      await loadProjects();
      showToast(`"${title}" deleted`);
    } catch { showToast("Delete failed", "error"); }
  }

  function switchTab(next: Tab) { setTab(next); setSearch(""); }

  const ctaLabel      = CTA_LABELS[tab];
  const activeNavItem = NAV_ITEMS.find((n) => n.id === tab);

  const [clientAddOpen, setClientAddOpen] = useState(false);
  const [taskAddOpen,   setTaskAddOpen]   = useState(false);
  const [cmdOpen,       setCmdOpen]       = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCmdOpen((o) => !o); }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function handleCta() {
    if (tab === "projects") { setEditProject(null); setFormOpen(true); }
    if (tab === "clients")  { setClientAddOpen(true); }
    if (tab === "tasks")    { setTaskAddOpen(true); }
  }

  const sidebarW = isMobile ? 0 : (effectiveSidebarOpen ? 210 : 52);

  return (
    <>
      <KFInjector />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex"
        style={{ background: "var(--bg)", fontFamily: "'DM Sans',sans-serif" }}>

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 39, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
          />
        )}

        {/* ══════════ SIDEBAR ══════════ */}
        <aside className="flex flex-col flex-shrink-0"
          style={{
            width:       isMobile ? 210 : sidebarW,
            background:  "var(--bg-panel)",
            borderRight: "0.5px solid var(--border)",
            overflow:    "hidden",
            transition:  "transform .3s var(--ease), width .3s var(--ease)",
            flexShrink:  0,
            // Mobile: slide in/out as overlay
            ...(isMobile ? {
              position:  "fixed",
              top: 0, left: 0, bottom: 0,
              zIndex:    40,
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
            } : {}),
          }}>

          {/* Logo row */}
          {(() => {
            const showFull = effectiveSidebarOpen || isMobile;
            return (
              <div className="flex items-center flex-shrink-0"
                style={{
                  height: 52,
                  borderBottom: "0.5px solid var(--border)",
                  padding: showFull ? "0 12px" : "0",
                  justifyContent: showFull ? "flex-start" : "center",
                  gap: showFull ? 9 : 0,
                }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
                  style={{ background: "var(--grad-accent)", boxShadow: "var(--glow-accent)" }}
                  onClick={() => !isMobile && setSidebarOpen((o) => !o)}
                  title={showFull ? "ZynHive" : "Expand"}>
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                {showFull && (
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="font-semibold text-[14px] leading-tight whitespace-nowrap" style={{ color: "var(--ink)" }}>ZynHive</div>
                    <div className="text-[10px]" style={{ color: "var(--ink4)" }}>Admin panel</div>
                  </div>
                )}
                {showFull && (
                  <button onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ width: 24, height: 24, background: "transparent", border: "0.5px solid var(--border2)", color: "var(--ink4)", cursor: "pointer", transition: "all .15s" }}
                    onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
                    onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}>
                    <Ic.ChevronLeft />
                  </button>
                )}
              </div>
            );
          })()}

          {/* Section label */}
          {(effectiveSidebarOpen || isMobile) && (
            <div className="px-4 pt-3 pb-1">
              <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "var(--ink4)" }}>Menu</span>
            </div>
          )}

          {/* Nav */}
          {(() => {
            const showLabels = effectiveSidebarOpen || isMobile;
            return (
              <nav className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden"
                style={{ gap: 2, padding: showLabels ? "4px 8px" : "8px 6px" }}>
                {NAV_ITEMS.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button key={item.id}
                      onClick={() => { switchTab(item.id); if (isMobile) setSidebarOpen(false); }}
                      title={item.label}
                      style={{
                        display: "flex", alignItems: "center", width: "100%", position: "relative",
                        borderRadius: 9,
                        gap:            showLabels ? 10 : 0,
                        padding:        showLabels ? "10px 10px" : "10px 0",
                        justifyContent: showLabels ? "flex-start" : "center",
                        background:     active ? "linear-gradient(90deg, var(--accent-pale2), var(--accent-pale))" : "transparent",
                        color:          active ? "var(--accent)" : "var(--ink3)",
                        border:         active ? "1px solid var(--accent-dim)" : "1px solid transparent",
                        cursor: "pointer", fontWeight: active ? 600 : 400,
                        transition: "all .15s", textAlign: "left", lineHeight: 1,
                        fontFamily: "inherit",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = "var(--ink2)"; } }}
                      onMouseLeave={(e) => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; } }}>
                      {/* Active left glow bar */}
                      {active && (
                        <div style={{
                          position: "absolute", left: 0, top: "18%", bottom: "18%",
                          width: 3, borderRadius: 3,
                          background: "var(--grad-accent)",
                          boxShadow: "var(--glow-accent)",
                        }} />
                      )}
                      <span style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{item.icon}</span>
                      {showLabels && (
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
                      {!showLabels && item.badge && (
                        <span className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }}/>
                      )}
                    </button>
                  );
                })}
              </nav>
            );
          })()}

          <div style={{ height: "0.5px", background: "var(--border)", margin: "6px 10px" }}/>

          {/* User row */}
          {(() => {
            const showFull = effectiveSidebarOpen || isMobile;
            return (
              <div className="flex-shrink-0 flex items-center gap-2.5 overflow-hidden"
                style={{ padding: showFull ? "10px 14px" : "10px 0", justifyContent: showFull ? "flex-start" : "center" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-[11px]"
                  style={{
                    background: "var(--grad-accent)",
                    color: "white",
                    boxShadow: "0 0 0 2px var(--bg-panel), 0 0 0 4px var(--accent-dim), 0 4px 12px var(--accent-pale)",
                    letterSpacing: "-0.02em",
                  }}>
                  {user.email?.[0]?.toUpperCase() ?? "A"}
                </div>
                {showFull && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate" style={{ color: "var(--ink2)" }}>{user.email}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--ink4)" }}>Administrator</p>
                  </div>
                )}
              </div>
            );
          })()}
        </aside>

        {/* ══════════ MAIN ══════════ */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header */}
          <header className="flex items-center gap-2 flex-shrink-0"
            style={{
              height: 58,
              padding: "0 18px",
              background: "var(--nav-glass)",
              borderBottom: "1px solid var(--border)",
              backdropFilter: "blur(18px) saturate(1.4)",
              WebkitBackdropFilter: "blur(18px) saturate(1.4)",
              position: "sticky",
              top: 0,
              zIndex: 20,
              boxShadow: "var(--shadow-sm)",
            }}>

            {/* Hamburger on mobile + tablet */}
            {(isMobile || isTablet) && (
              <IconBtn title="Menu" onClick={() => setSidebarOpen((o) => !o)} size={32}>
                <Ic.Menu />
              </IconBtn>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isMobile && !isTablet && (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--green)", boxShadow: "0 0 8px var(--green)" }}/>
                  <span className="font-mono text-[10.5px] tracking-[0.12em] uppercase font-semibold"
                    style={{ color: "var(--ink4)" }}>
                    ZynHive
                  </span>
                </span>
              )}
              {!isMobile && !isTablet && <span style={{ color: "var(--ink4)" }}><Ic.Breadcrumb /></span>}
              <span className="font-semibold text-[14px] tracking-tight" style={{ color: "var(--ink)", letterSpacing: "-0.015em" }}>
                {activeNavItem?.label}
              </span>
            </div>

            {/* Inline search — projects, desktop only */}
            {tab === "projects" && !isMobile && !isTablet && (
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

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">

              {/* ⌘K search trigger */}
              {!isMobile && !isTablet && (
                <button onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]"
                  style={{ background: "var(--bg-alt)", border: "0.5px solid var(--border2)", color: "var(--ink4)", cursor: "pointer", transition: "all .15s", fontFamily: "inherit" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--accent)"; el.style.color = "var(--ink2)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border2)"; el.style.color = "var(--ink4)"; }}>
                  <Ic.Search />
                  <span>Search…</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded text-[10px]"
                    style={{ background: "var(--bg-card)", border: "0.5px solid var(--border2)", fontFamily: "monospace" }}>
                    ⌘K
                  </span>
                </button>
              )}

              {/* CTA Button */}
              {ctaLabel && (
                <PrimaryBtn small onClick={handleCta}>
                  <Ic.Plus />
                  {!isMobile && ctaLabel}
                </PrimaryBtn>
              )}

              {/* Bell — pending reviews */}
              <div className="relative">
                <button
                  title={pendingReviews.length > 0 ? `${pendingReviews.length} pending review${pendingReviews.length > 1 ? "s" : ""}` : "No pending reviews"}
                  onClick={() => setReviewPanelOpen(true)}
                  className="flex items-center justify-center rounded-lg transition-all"
                  style={{
                    width: 30, height: 30, background: "transparent", border: "none",
                    color: pendingReviews.length > 0 ? "var(--gold)" : "var(--ink4)",
                    cursor: "pointer",
                    animation: pendingReviews.length > 0 ? "bellShake 0.6s ease 0.3s" : "none",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--bg-alt)"; el.style.color = pendingReviews.length > 0 ? "var(--gold)" : "var(--ink2)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = pendingReviews.length > 0 ? "var(--gold)" : "var(--ink4)"; }}>
                  <Ic.Bell />
                </button>
                {pendingReviews.length > 0 && (
                  <div className="absolute -top-1 -right-1 flex items-center justify-center rounded-full pointer-events-none"
                    style={{ minWidth: 16, height: 16, padding: "0 4px", background: "var(--red)", border: "1.5px solid var(--bg-panel)", fontSize: 9, fontWeight: 700, color: "white", animation: "glowPulse 2s ease-in-out infinite" }}>
                    {pendingReviews.length}
                  </div>
                )}
              </div>

              {/* Activity log */}
              <IconBtn title="Activity Log" onClick={() => setActivityLogOpen(true)}>
                <Ic.History />
              </IconBtn>

              {/* Settings gear */}
              <IconBtn title="Admin Settings" onClick={() => setSettingsOpen(true)}>
                <Ic.Gear />
              </IconBtn>

              {/* Theme toggle */}
              <ThemeToggle dark={dark} onToggle={handleThemeToggle} />

              <ProfileDropdown email={user.email ?? ""} onLogout={() => adminLogout()} />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto" style={{ background: "var(--bg)" }}>
            {tab === "overview" && (
              <OverviewTab
                showToast={showToast}
                onNavigate={(t) => switchTab(t as Tab)}
                pendingReviewsCount={pendingReviews.length}
                onOpenReviews={() => setReviewPanelOpen(true)}
                user={{ email: user.email ?? "" }}
              />
            )}
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
            {tab === "tasks"     && (
              <TaskTab
                showToast={showToast}
                openAdd={taskAddOpen}
                onOpenAddDone={() => setTaskAddOpen(false)}
              />
            )}
            {tab === "analytics" && <AnalyticsTab projects={projects} />}
            {tab === "clients"   && (
              <ClientTab
                showToast={showToast}
                openAdd={clientAddOpen}
                onOpenAddDone={() => setClientAddOpen(false)}
              />
            )}
          </main>
        </div>

        {/* Overlays */}
        {formOpen && (
          <ProjectForm project={editProject} onClose={() => setFormOpen(false)}
            onSaved={() => { loadProjects(); showToast(editProject ? "Project updated!" : "Project created!"); }}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm title={deleteTarget.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
        )}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        {cmdOpen && <CmdKPalette onClose={() => setCmdOpen(false)} onNavigate={(t) => { switchTab(t); setCmdOpen(false); }} />}
        {reviewPanelOpen && createPortal(
          <ReviewPanel
            reviews={pendingReviews}
            clients={allClients}
            adminEmail={user.email ?? ""}
            onClose={() => setReviewPanelOpen(false)}
            onReload={() => { /* subscribePendingReviews auto-updates state */ }}
            showToast={showToast}
          />,
          document.body
        )}
        {activityLogOpen && createPortal(
          <ActivityLogPanel logs={activityLogs} onClose={() => setActivityLogOpen(false)} />,
          document.body
        )}
        {settingsOpen && <AdminSettingsModal onClose={() => setSettingsOpen(false)} />}
      </div>
    </>
  );
}