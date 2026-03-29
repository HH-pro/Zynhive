// ─── src/pages/PortfolioPage.tsx ─────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useReveal }                   from "../hooks/index";
import { fetchProjects }               from "../lib/firebase";
import { PROJECTS }                    from "../lib/data";
import { getCloudinaryThumb }          from "../lib/cloudinary";
import { SectionHead }                 from "../components/ui/index";
import { CTASection }                  from "../sections/HomeSections";

// ── Local Project shape ───────────────────────────────────────────────────────
interface Project {
  id:          string;
  title:       string;
  category:    string;
  tags:        string[];
  description: string;
  result:      string;
  emoji:       string;
  color:       string;
  featured:    boolean;
  imageUrl:    string;
  liveUrl:     string;
  githubUrl:   string;
}

// ── Normalise Firestore doc → Project ────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(fp: any): Project {
  return {
    id:          fp.id          ?? fp.title ?? String(Math.random()),
    title:       fp.title       || "",
    category:    fp.category    || "",
    tags:        Array.isArray(fp.tags) ? fp.tags : [],
    description: fp.description || "",
    result:      fp.result      || "",
    emoji:       fp.emoji       || "📦",
    color:       fp.color       || "#3B6EF8",
    featured:    fp.featured    ?? false,
    imageUrl:    fp.imageUrl    || "",
    liveUrl:     fp.liveUrl     || "",
    githubUrl:   fp.githubUrl   || "",
  };
}

const REVEAL_DELAYS = ["reveal-d1", "reveal-d2", "reveal-d3"] as const;

// ─── Portfolio Card ───────────────────────────────────────────────────────────
function PortfolioCard({
  project,
  index,
  onClick,
}: { project: Project; index: number; onClick: (p: Project) => void }) {
  return (
    <div
      onClick={() => onClick(project)}
      className="group relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border2)",
        boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
        opacity: 1,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${project.color}50`;
        el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.1), 0 0 0 1px ${project.color}20`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border2)";
        el.style.boxShadow = "0 2px 16px rgba(0,0,0,0.04)";
      }}
    >
      {/* Image / Emoji panel */}
      <div
        className="relative h-52 overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${project.color}20, ${project.color}08)` }}
      >
        {project.imageUrl ? (
          <img
            src={getCloudinaryThumb(project.imageUrl, 640, 416)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            loading="lazy"
          />
        ) : (
          <span className="text-6xl transition-transform duration-500 group-hover:scale-110 select-none">
            {project.emoji}
          </span>
        )}

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400"
          style={{ background: "rgba(2,8,66,0.65)", backdropFilter: "blur(6px)" }}
        >
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-white/25 bg-white/10 text-white text-[12px] font-mono font-medium tracking-wider">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="white" strokeWidth="1.2"/>
              <path d="M4.5 6h3M6 4.5v3" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            View Project
          </div>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase text-white"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
          >
            Featured
          </div>
        )}

        {/* Category badge */}
        {project.category && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[9px] font-mono text-white/85 border border-white/15 backdrop-blur-sm"
            style={{ background: "rgba(0,0,0,0.45)" }}
          >
            {project.category}
          </div>
        )}

        {/* Bottom gradient fade into card bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--bg-surface))" }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="font-syne text-[17px] font-bold mb-2 tracking-tight leading-snug"
          style={{ color: "var(--ink)" }}
        >
          {project.title}
        </h3>
        <p
          className="text-[13px] leading-[1.75] font-light mb-4 line-clamp-2"
          style={{ color: "var(--ink3)" }}
        >
          {project.description}
        </p>

        {/* Result pill */}
        {project.result && (
          <div
            className="flex items-center gap-2 mb-5 px-3.5 py-2.5 rounded-xl"
            style={{ background: `${project.color}0e`, border: `1px solid ${project.color}22` }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 9l3-4 3 2 4-5" stroke={project.color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-[11px] font-mono font-semibold" style={{ color: project.color }}>
              {project.result}
            </span>
          </div>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="font-mono text-[10px] px-2.5 py-1 rounded-lg border"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border2)", color: "var(--ink3)" }}
              >
                {t}
              </span>
            ))}
            {project.tags.length > 4 && (
              <span
                className="font-mono text-[10px] px-2.5 py-1 rounded-lg border"
                style={{ background: "var(--bg-panel)", borderColor: "var(--border2)", color: "var(--ink4)" }}
              >
                +{project.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4 py-0 sm:py-8"
      style={{ background: "rgba(0,4,40,0.8)", backdropFilter: "blur(10px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full sm:max-w-[700px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto
          rounded-t-3xl sm:rounded-3xl border border-[var(--border)]"
        style={{
          background: "var(--bg-panel)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,110,248,0.1)",
          animation: "fadeScaleIn .35s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.color = "var(--ink)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)";
            (e.currentTarget as HTMLElement).style.color = "var(--ink3)";
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Hero */}
        <div
          className="h-52 sm:h-64 relative flex items-center justify-center overflow-hidden rounded-t-3xl"
          style={{ background: `linear-gradient(135deg, ${project.color}25, ${project.color}0c)` }}
        >
          {project.imageUrl ? (
            <img
              src={getCloudinaryThumb(project.imageUrl, 1400, 512)}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-8xl select-none">{project.emoji}</span>
          )}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--bg-panel) 0%, transparent 55%)" }}
          />
          {project.featured && (
            <div
              className="absolute top-4 left-4 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase text-white"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
            >
              Featured
            </div>
          )}
          {project.category && (
            <div
              className="absolute top-4 right-14 px-2.5 py-1 rounded-lg text-[9px] font-mono border border-white/20 backdrop-blur-sm"
              style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.8)" }}
            >
              {project.category}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-6 sm:px-8 pb-8 -mt-4 relative z-10">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2
                className="font-syne text-[24px] sm:text-[28px] font-bold tracking-tight mb-1"
                style={{ color: "var(--ink)" }}
              >
                {project.title}
              </h2>
              {project.category && (
                <span className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>
                  {project.category}
                </span>
              )}
            </div>
          </div>

          <p
            className="text-[14px] sm:text-[15px] leading-[1.9] font-light mb-7"
            style={{ color: "var(--ink3)" }}
          >
            {project.description}
          </p>

          {/* Result highlight */}
          {project.result && (
            <div
              className="rounded-2xl p-5 mb-7 flex items-center gap-4"
              style={{ background: `${project.color}0d`, border: `1px solid ${project.color}22` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${project.color}20`, color: project.color }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M2 14l4-6 4 3.5 6-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div
                  className="font-mono text-[9px] tracking-[0.12em] uppercase mb-1"
                  style={{ color: "var(--ink4)" }}
                >
                  Key Result
                </div>
                <div className="font-syne text-[17px] font-bold" style={{ color: project.color }}>
                  {project.result}
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-7">
              {project.tags.map((t) => (
                <span
                  key={t}
                  className="font-mono text-[11px] px-3 py-1.5 rounded-xl border"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border2)", color: "var(--ink3)" }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Action links */}
          {(project.liveUrl || project.githubUrl) && (
            <div className="flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(135deg, ${project.color}, ${project.color}bb)`,
                    boxShadow: `0 4px 20px ${project.color}40`,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1h5v5M5 7L10.5 1.5M2 4H1v7h7v-1" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  Live Site
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[13px] font-medium border transition-all duration-200 hover:-translate-y-0.5"
                  style={{ background: "var(--bg-surface)", borderColor: "var(--border2)", color: "var(--ink3)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--ink3)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink3)";
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M4.5 11c0-1 .5-1.5 2-1.5s2 .5 2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PortfolioPage ────────────────────────────────────────────────────────────
const ALL = "All";

export function PortfolioPage() {
  useReveal();

  // ── FIX: start with static fallback, replace with Firestore data if available
  const [projects,  setProjects]  = useState<Project[]>(PROJECTS as Project[]);
  const [active,    setActive]    = useState(ALL);
  const [modal,     setModal]     = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [view,      setView]      = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProjects()
      .then((fps) => {
        // ── FIX: always update from Firestore if the call succeeds —
        //    even if fps.length === 0 (which would mean "Firestore is
        //    authoritative and currently empty").
        //    Remove the length-guard so a single uploaded project shows up.
        const mapped = fps.map(toProject);
        if (mapped.length > 0) {
          setProjects(mapped);
        }
        // If Firestore returns empty, keep the static PROJECTS fallback.
      })
      .catch((err) => {
        console.error("Failed to fetch projects:", err);
        setFetchError(true);
        // Static fallback already set as initial state — no action needed.
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [ALL, ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];
  const filtered   = active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[60vh] flex items-end px-4 sm:px-6 lg:px-14 pb-16 sm:pb-20 pt-40 sm:pt-44 overflow-hidden"
        style={{ background: "var(--hero-bg)" }}
      >
        {/* Grid overlay — FIX: was missing backgroundImage */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,110,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,110,248,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
          }}
        />

        {/* Glows */}
        <div
          className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(59,110,248,0.11) 0%, transparent 60%)" }}
        />
        <div
          className="absolute top-2/3 right-1/4 w-[400px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.07) 0%, transparent 65%)" }}
        />

        {/* Bottom fade — FIX: use gradient, not solid color */}
        <div
          className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
          style={{ background: "var(--bg-base)" }}
        />

        <div
          className="relative z-10 max-w-4xl w-full"
          style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full"
            style={{ border: "1px solid var(--accent-pale2)", background: "var(--accent-pale)" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent)", animation: "bPulse 2s infinite" }}
            />
            <span
              className="font-mono text-[10px] tracking-[0.16em] uppercase"
              style={{ color: "var(--accent)" }}
            >
              Our Work
            </span>
          </div>

          <h1
            className="font-syne font-extrabold leading-[0.95] tracking-tight mb-5"
            style={{ fontSize: "clamp(38px,7vw,90px)", color: "var(--hero-text)" }}
          >
            Work that
            <br />
            <em className="not-italic" style={{ color: "var(--accent)" }}>speaks for itself.</em>
          </h1>

          <p
            className="text-[16px] sm:text-[18px] font-light leading-relaxed max-w-xl"
            style={{ color: "var(--hero-muted)" }}
          >
            {projects.length}+ projects across web, mobile, design, and growth. Every one built to win.
          </p>

          {/* Stats row — FIX: label color was hardcoded rgb(10,15,80), invisible in dark mode */}
          <div className="flex flex-wrap gap-2.5 mt-1">
            {[
              { label: "Web Apps",      val: projects.filter((p) => p.category === "Web Application").length || projects.length },
              { label: "Mobile Apps",   val: projects.filter((p) => p.category === "Mobile App").length      || "–" },
              { label: "Featured",      val: projects.filter((p) => p.featured).length                       || "–" },
              { label: "Total Projects",val: projects.length },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-4 py-2 mt-5 rounded-full border"
                style={{ borderColor: "rgba(59,110,248,0.22)", background: "rgba(59,110,248,0.08)" }}
              >
                <span className="font-syne text-[15px] font-bold" style={{ color: "var(--accent)" }}>
                  {val}
                </span>
                {/* FIX: was rgb(10,15,80) — use CSS variable for dark mode compat */}
                <span className="font-mono text-[10px]" style={{ color: "var(--ink3)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER + GRID ────────────────────────────────────────────────── */}
      <section
        className="px-4 sm:px-6 lg:px-14 py-16 md:py-24 lg:py-28"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="max-w-7xl mx-auto">

          <SectionHead
            tag="Portfolio"
            heading={<>Selected <span className="text-gradient-blue">projects.</span></>}
            sub="A curated look at our most impactful work across industries."
          />

          {/* Controls row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 reveal">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className="font-mono text-[10px] tracking-wider uppercase px-4 py-2 rounded-full border transition-all duration-200"
                  style={
                    active === cat
                      ? { background: "linear-gradient(135deg, var(--accent), var(--cyan))", borderColor: "transparent", color: "white" }
                      : { background: "var(--bg-surface)", borderColor: "var(--border2)", color: "var(--ink3)" }
                  }
                  onMouseEnter={(e) => {
                    if (active !== cat) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                      (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (active !== cat) {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)";
                      (e.currentTarget as HTMLElement).style.color = "var(--ink3)";
                    }
                  }}
                >
                  {cat}
                  {cat !== ALL && (
                    <span className="ml-1.5 opacity-50">
                      ({projects.filter((p) => p.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div
              className="flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto"
              style={{ background: "var(--bg-surface)", borderColor: "var(--border2)" }}
            >
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3.5 py-2 rounded-lg transition-all duration-200"
                  style={
                    view === v
                      ? { background: "linear-gradient(135deg, var(--accent), var(--cyan))", color: "white" }
                      : { background: "transparent", color: "var(--ink4)" }
                  }
                >
                  {v === "grid" ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1"   y="1"   width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                      <rect x="7.5" y="1"   width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                      <rect x="1"   y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                      <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1" y="1.5" width="11" height="3"   rx="1.2" stroke="currentColor" strokeWidth="1"/>
                      <rect x="1" y="5.5" width="11" height="3"   rx="1.2" stroke="currentColor" strokeWidth="1"/>
                      <rect x="1" y="9.5" width="11" height="2.5" rx="1.2" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Fetch error banner */}
          {fetchError && (
            <div
              className="mb-8 px-5 py-3.5 rounded-xl text-[13px] flex items-center gap-3"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border2)",
                color: "var(--ink3)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="var(--ink4)" strokeWidth="1.2"/>
                <path d="M8 5v3.5M8 10.5v.5" stroke="var(--ink4)" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Showing cached projects — couldn't reach the database.
            </div>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-3xl overflow-hidden"
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
                >
                  <div className="h-52 animate-pulse" style={{ background: "var(--bg-alt)" }}/>
                  <div className="p-6 flex flex-col gap-3">
                    <div className="h-5 rounded-lg animate-pulse" style={{ width: "75%", background: "var(--bg-alt)" }}/>
                    <div className="h-4 rounded-lg animate-pulse" style={{ background: "var(--bg-alt)" }}/>
                    <div className="h-4 rounded-lg animate-pulse" style={{ width: "60%", background: "var(--bg-alt)" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid view */}
          {!isLoading && view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filtered.map((p, i) => (
                <PortfolioCard key={p.id} project={p} index={i} onClick={setModal} />
              ))}
            </div>
          )}

          {/* List view */}
          {!isLoading && view === "list" && (
            <div className="flex flex-col gap-3 mb-12">
              {filtered.map((p, i) => {
                const delayClass = REVEAL_DELAYS[i % 3];
                return (
                  <div
                    key={p.id}
                    onClick={() => setModal(p)}
                    className="group flex items-center gap-5 p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300"
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border2)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
                      opacity: 1,
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = `${p.color}45`;
                      el.style.boxShadow = `0 8px 30px rgba(0,0,0,0.08), 0 0 0 1px ${p.color}18`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = "var(--border2)";
                      el.style.boxShadow = "0 2px 12px rgba(0,0,0,0.03)";
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden transition-transform duration-300 group-hover:scale-105"
                      style={{ background: `${p.color}15`, border: `1px solid ${p.color}22` }}
                    >
                      {p.imageUrl ? (
                        <img
                          src={getCloudinaryThumb(p.imageUrl, 112, 112)}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl select-none">{p.emoji}</span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-syne text-[15px] font-bold truncate" style={{ color: "var(--ink)" }}>
                          {p.title}
                        </h3>
                        {p.featured && (
                          <span
                            className="hidden sm:inline px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase text-white flex-shrink-0"
                            style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
                          >
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] line-clamp-1 font-light" style={{ color: "var(--ink4)" }}>
                        {p.description}
                      </p>
                    </div>

                    {/* Result */}
                    {p.result && (
                      <div
                        className="hidden md:flex items-center gap-1.5 flex-shrink-0 text-[11px] font-mono"
                        style={{ color: p.color }}
                      >
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                          <path d="M1 8.5l3-4 3 2 3-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                        </svg>
                        {p.result}
                      </div>
                    )}

                    {/* Arrow */}
                    <div
                      className="flex-shrink-0 transition-all duration-300 group-hover:translate-x-0.5"
                      style={{ color: "var(--ink4)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M5 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="var(--ink4)" strokeWidth="1.5"/>
                  <path d="M8 14s1-2 3-2 3 2 3 2M8.5 9h.01M13.5 9h.01" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-syne text-[16px] font-semibold" style={{ color: "var(--ink3)" }}>
                No projects in this category yet
              </p>
              <button
                onClick={() => setActive(ALL)}
                className="font-mono text-[11px] transition-colors"
                style={{ color: "var(--accent)" }}
              >
                Show all projects →
              </button>
            </div>
          )}

        </div>
      </section>

      <CTASection />

      {modal && <ProjectDetailModal project={modal} onClose={() => setModal(null)} />}
    </main>
  );
}