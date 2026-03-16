// ─── src/pages/admin/AdminDashboard.tsx ─────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  adminLogout, fetchProjects, deleteProject, type FirestoreProject,
} from "../../lib/firebase";
import { ProjectForm } from "../../components/admin/ProjectForm";
import { TeamTab } from "../../components/admin/TeamTab";
import { LeadTab } from "../../components/admin/Leadtab";
import { getCloudinaryThumb } from "../../lib/cloudinary";
import type { User } from "firebase/auth";

// ─── Types ─────────────────────────────────────────────────────────────────
interface Props { user: User; }
type Tab = "projects" | "team" | "leads" | "analytics";

// ─── Constants & Design Tokens ─────────────────────────────────────────────
const THEME = {
  bg: "#080C14",
  bgAlt: "#0D1220",
  bgSurface: "#111827",
  bgPanel: "#0F1623",
  bgCard: "#131D2E",
  accent: "#3B82F6",
  accent2: "#6366F1",
  cyan: "#06B6D4",
  gold: "#F59E0B",
  green: "#10B981",
  red: "#EF4444",
  purple: "#8B5CF6",
};

// ─── SVG Icons (defined BEFORE TABS that uses them) ────────────────────────
const ProjectsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="8" y="1" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="1" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
    <rect x="8" y="8" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

const TeamIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="5" cy="4.5" r="2.2" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M1 12c0-2.2 1.8-3.5 4-3.5s4 1.3 4 3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    <circle cx="11" cy="4" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M13 10.5c0-1.5-.9-2.5-2.2-2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
  </svg>
);

const LeadsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1.5 3h11M1.5 7h7M1.5 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="11.5" cy="10" r="2" stroke="currentColor" strokeWidth="1.1"/>
  </svg>
);

const AnalyticsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1 11L4 7.5l3 2.5 3-5 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.1"/>
    <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M1 1l9 9M10 1l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path d="M8.5 4.5L11 6.5l-2.5 2M5 6.5h6M5 2H2.5A1 1 0 001.5 3v7a1 1 0 001 1H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = ({ direction }: { direction: "left" | "right" }) => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d={direction === "right" ? "M4 2l4 4-4 4" : "M8 2L4 6l4 4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M7.5 1.5l2 2L3 10H1V8L7.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <path d="M1.5 3h8M4 3V1.5h3V3M3.5 3l.5 6.5M7.5 3l-.5 6.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

// ─── Tabs Configuration (now defined AFTER the icon components) ────────────
const TABS: { id: Tab; label: string; icon: React.ReactNode; badge?: string }[] = [
  { 
    id: "projects", 
    label: "Projects",
    icon: <ProjectsIcon />
  },
  { 
    id: "team", 
    label: "Team",
    icon: <TeamIcon />
  },
  { 
    id: "leads", 
    label: "Leads",
    badge: "3",
    icon: <LeadsIcon />
  },
  { 
    id: "analytics", 
    label: "Analytics",
    icon: <AnalyticsIcon />
  },
];

// ─── Theme Injector Component ──────────────────────────────────────────────
const ThemeInjector = () => {
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(THEME).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);
  return null;
};

// ─── Toast Component ───────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl animate-slide-up"
      style={{
        background: type === "success" ? "var(--bg-card)" : "rgba(30,8,8,0.95)",
        border: `1px solid ${type === "success" ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.25)"}`,
        color: type === "success" ? "var(--ink2)" : "#FCA5A5",
        boxShadow: type === "success" 
          ? "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.08)" 
          : "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: type === "success" 
            ? "linear-gradient(135deg, #3B82F6, #06B6D4)" 
            : "rgba(239,68,68,0.15)",
          color: type === "success" ? "white" : "#F87171",
          boxShadow: type === "success" ? "0 0 10px rgba(59,130,246,0.4)" : "none",
        }}
      >
        {type === "success" ? "✓" : "✕"}
      </div>
      <span className="text-sm">{message}</span>
    </div>
  );
};

// ─── Stat Card Component ───────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub: string;
  color: string;
  icon: React.ReactNode;
  trend?: number;
}

const StatCard = ({ label, value, sub, color, icon, trend }: StatCardProps) => (
  <div 
    className="relative rounded-2xl p-5 overflow-hidden group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
    style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}
  >
    {/* Gradient overlay on hover */}
    <div 
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(circle at 0% 0%, ${color}12, transparent 60%)` }}
    />
    
    {/* Top border glow */}
    <div 
      className="absolute top-0 left-0 right-0 h-px"
      style={{ background: `linear-gradient(90deg, ${color}60, transparent 50%)` }}
    />

    <div className="flex items-start justify-between mb-4 relative z-10">
      <div 
        className="w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${color}12`, border: `1px solid ${color}20`, color }}
      >
        {icon}
      </div>
      <span 
        className="font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 rounded-lg"
        style={{ color: "var(--ink4)", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}
      >
        {label}
      </span>
    </div>
    
    <div className="relative z-10">
      <div className="flex items-end gap-2">
        <div 
          className="font-mono text-[30px] font-black leading-none tracking-tight"
          style={{ color, textShadow: `0 0 24px ${color}40` }}
        >
          {value}
        </div>
        {trend !== undefined && (
          <span className={`text-xs mb-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{sub}</div>
    </div>
  </div>
);

// ─── Action Button Component ───────────────────────────────────────────────
interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

const ActionButton = ({ icon, label, color, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    title={label}
    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-110"
    style={{ color: "var(--ink4)" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = `${color}12`;
      e.currentTarget.style.color = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "var(--ink4)";
    }}
  >
    {icon}
  </button>
);

// ─── Project Row Component ─────────────────────────────────────────────────
interface ProjectRowProps {
  project: FirestoreProject;
  onEdit: (project: FirestoreProject) => void;
  onDelete: (project: FirestoreProject) => void;
}

const ProjectRow = ({ project, onEdit, onDelete }: ProjectRowProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0 transition-all duration-200"
      style={{ borderColor: "var(--border)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo/Image */}
      <div 
        className="w-10 h-10 rounded-xl flex-shrink-0 overflow-hidden transition-transform duration-300"
        style={{ 
          background: `${project.color}12`, 
          border: `1px solid ${project.color}25`,
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {project.imageUrl ? (
          <img 
            src={getCloudinaryThumb(project.imageUrl, 80, 80)} 
            alt={project.title} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base">
            {project.emoji}
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-[13px] truncate" style={{ color: "var(--ink)" }}>
            {project.title}
          </span>
          {project.featured && (
            <span 
              className="flex-shrink-0 px-1.5 py-0.5 rounded-md text-[8px] font-mono font-bold tracking-widest uppercase animate-pulse"
              style={{ background: "linear-gradient(90deg, #3B82F6, #06B6D4)", color: "white" }}
            >
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span 
            className="font-mono text-[9px] px-2 py-0.5 rounded-md"
            style={{ color: project.color, background: `${project.color}10`, border: `1px solid ${project.color}20` }}
          >
            {project.category}
          </span>
          {project.tags.slice(0, 2).map((tag) => (
            <span 
              key={tag} 
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ color: "var(--ink4)", background: "var(--bg-alt)", border: "1px solid var(--border)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Result (desktop only) */}
      <div className="hidden lg:flex items-center gap-1.5 max-w-[180px] flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: project.color }} />
        <span className="text-[12px] line-clamp-1" style={{ color: "var(--ink3)" }}>
          {project.result}
        </span>
      </div>

      {/* Actions */}
      <div 
        className={`flex items-center gap-1 flex-shrink-0 transition-all duration-200 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <ActionButton
          icon={<EditIcon />}
          label="Edit"
          color={THEME.accent}
          onClick={() => onEdit(project)}
        />
        <ActionButton
          icon={<DeleteIcon />}
          label="Delete"
          color={THEME.red}
          onClick={() => onDelete(project)}
        />
      </div>
    </div>
  );
};

// ─── Delete Confirmation Modal ─────────────────────────────────────────────
interface DeleteConfirmProps {
  project: FirestoreProject;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirm = ({ project, onConfirm, onCancel }: DeleteConfirmProps) => (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
    onClick={onCancel}
  >
    <div 
      className="w-full max-w-[380px] rounded-2xl p-7 text-center animate-scale-in"
      style={{ 
        background: "var(--bg-card)", 
        border: "1px solid rgba(239,68,68,0.2)", 
        boxShadow: "0 0 60px rgba(239,68,68,0.08)"
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
      
      <h3 className="font-bold text-[17px] mb-2" style={{ color: "var(--ink)" }}>
        Delete Project?
      </h3>
      
      <p className="text-[13px] mb-6 leading-relaxed" style={{ color: "var(--ink4)" }}>
        "<strong style={{ color: "var(--ink3)" }}>{project.title}</strong>" will be permanently removed.
      </p>
      
      <div className="flex gap-3">
        <button 
          onClick={onCancel} 
          className="flex-1 py-2.5 rounded-xl text-[13px] transition-all hover:border-ink4"
          style={{ 
            border: "1px solid var(--border2)", 
            color: "var(--ink3)", 
            background: "transparent"
          }}
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm} 
          className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:shadow-lg hover:scale-105"
          style={{ background: "linear-gradient(135deg, #dc2626, #EF4444)" }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Search Bar Component ──────────────────────────────────────────────────
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

const SearchBar = ({ value, onChange, onClear, placeholder = "Search projects…" }: SearchBarProps) => (
  <div className="relative flex-1 min-w-[220px] max-w-sm">
    <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink4)" }}>
      <SearchIcon />
    </div>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-10 py-2 rounded-xl text-[13px] transition-all"
      style={{ 
        background: "var(--bg-card)", 
        border: "1px solid var(--border2)", 
        color: "var(--ink)", 
        outline: "none"
      }}
      onFocus={(e) => {
        e.target.style.borderColor = "rgba(59,130,246,0.4)";
        e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--border2)";
        e.target.style.boxShadow = "none";
      }}
    />
    {value && (
      <button
        onClick={onClear}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/5 transition-colors"
        style={{ color: "var(--ink4)" }}
      >
        <CloseIcon />
      </button>
    )}
  </div>
);

// ─── Loading State Component ───────────────────────────────────────────────
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--border2)", borderTopColor: THEME.accent }}
      />
      <div className="absolute inset-0 rounded-full border-2 border-b-transparent animate-spin"
        style={{ borderColor: "transparent", borderBottomColor: THEME.cyan, animationDirection: "reverse", animationDuration: "1.5s" }}
      />
    </div>
    <span className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>
      Loading from Firestore…
    </span>
  </div>
);

// ─── Empty State Component ─────────────────────────────────────────────────
interface EmptyStateProps {
  hasSearch: boolean;
  onAddNew: () => void;
  onClearSearch: () => void;
}

const EmptyState = ({ hasSearch, onAddNew, onClearSearch }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <div 
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
    >
      {hasSearch ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--ink4)" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M8 12h8M12 8v8" stroke={THEME.accent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--ink4)" }}>
          <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M9 12h6M12 9v6" stroke={THEME.accent} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )}
    </div>
    
    <div className="text-center">
      <p className="font-semibold text-[15px] mb-1" style={{ color: "var(--ink3)" }}>
        {hasSearch ? "No results found" : "No projects yet"}
      </p>
      <p className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>
        {hasSearch ? "Try a different search term" : "Click 'New Project' to get started"}
      </p>
    </div>

    {hasSearch ? (
      <button
        onClick={onClearSearch}
        className="font-mono text-[11px] px-4 py-2 rounded-xl transition-all"
        style={{ color: "var(--ink4)", border: "1px solid var(--border2)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--ink4)";
          e.currentTarget.style.color = "var(--ink2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border2)";
          e.currentTarget.style.color = "var(--ink4)";
        }}
      >
        Clear search
      </button>
    ) : (
      <button
        onClick={onAddNew}
        className="font-mono text-[11px] px-4 py-2 rounded-xl text-white hover:shadow-lg hover:scale-105 transition-all"
        style={{ background: "linear-gradient(135deg, #3B82F6, #06B6D4)" }}
      >
        Add first project →
      </button>
    )}
  </div>
);

// ─── Analytics Tab Component ───────────────────────────────────────────────
interface AnalyticsTabProps {
  projects: FirestoreProject[];
}

const AnalyticsTab = ({ projects }: AnalyticsTabProps) => {
  const byCategory = useMemo(() => 
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {}), 
    [projects]
  );

  const maxCount = Math.max(...Object.values(byCategory), 1);
  
  const catColors: Record<string, string> = {
    "AI Development": THEME.accent,
    "Web Application": THEME.cyan,
    "Mobile App": THEME.purple,
    "UI/UX Design": THEME.gold,
    "Digital Marketing": THEME.green,
    "Software Consulting": THEME.accent2,
  };

  const summaryStats = useMemo(() => [
    { label: "Featured", value: projects.filter((p) => p.featured).length, color: THEME.accent },
    { label: "With Image", value: projects.filter((p) => p.imageUrl).length, color: THEME.cyan },
    { label: "Categories", value: Object.keys(byCategory).length, color: THEME.purple },
    { label: "Total Tags", value: projects.reduce((a, p) => a + p.tags.length, 0), color: THEME.gold },
  ], [projects, byCategory]);

  const topProjects = useMemo(() => 
    projects.filter((p) => p.result).slice(0, 5),
    [projects]
  );

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryStats.map(({ label, value, color }) => (
          <div 
            key={label} 
            className="rounded-2xl p-5 text-center relative overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, ${color}60, transparent 60%)` }}
            />
            <div 
              className="font-mono text-[32px] font-black leading-none mb-2 relative z-10"
              style={{ color, textShadow: `0 0 24px ${color}40` }}
            >
              {value}
            </div>
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase relative z-10" style={{ color: "var(--ink4)" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Category Distribution */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}>
        <h3 className="font-bold text-[15px] mb-6" style={{ color: "var(--ink)" }}>
          Projects by Category
        </h3>
        <div className="flex flex-col gap-4">
          {Object.entries(byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([category, count]) => {
              const color = catColors[category] || THEME.accent;
              const percentage = Math.round((count / maxCount) * 100);
              
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>
                        {category}
                      </span>
                    </div>
                    <span className="font-mono text-[11px] font-bold" style={{ color }}>
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                    <div 
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${percentage}%`, 
                        background: `linear-gradient(90deg, ${color}, ${color}66)`,
                        boxShadow: `0 0 8px ${color}40`
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Top Performing Projects */}
      <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border2)" }}>
        <h3 className="font-bold text-[15px] mb-5" style={{ color: "var(--ink)" }}>
          Top Performing Projects
        </h3>
        
        {topProjects.length > 0 ? (
          <div className="flex flex-col gap-2">
            {topProjects.map((project, index) => (
              <div 
                key={project.id} 
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 hover:bg-white/5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <span 
                  className="font-mono text-[10px] w-5 text-center flex-shrink-0"
                  style={{ 
                    color: index === 0 ? THEME.gold : index === 1 ? THEME.ink3 : index === 2 ? THEME.accent : "var(--ink4)" 
                  }}
                >
                  {index === 0 ? "①" : index === 1 ? "②" : index === 2 ? "③" : `${index + 1}`}
                </span>
                
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: `${project.color}15`, border: `1px solid ${project.color}25` }}
                >
                  {project.emoji}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] truncate" style={{ color: "var(--ink)" }}>
                    {project.title}
                  </div>
                  <div className="font-mono text-[9px]" style={{ color: "var(--ink4)" }}>
                    {project.category}
                  </div>
                </div>
                
                <span className="font-mono text-[11px] font-bold flex-shrink-0" style={{ color: project.color }}>
                  {project.result}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] py-6 text-center" style={{ color: "var(--ink4)" }}>
            No projects yet
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Main Dashboard Component ──────────────────────────────────────────────
export function AdminDashboard({ user }: Props) {
  const [projects, setProjects] = useState<FirestoreProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("projects");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editProject, setEditProject] = useState<FirestoreProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FirestoreProject | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch {
      showToast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadProjects();
      showToast(`"${deleteTarget.title}" deleted`);
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const filteredProjects = useMemo(() => 
    projects.filter((p) =>
      !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    ),
    [projects, search]
  );

  const currentTab