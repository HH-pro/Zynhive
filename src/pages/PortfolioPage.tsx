// ─── src/pages/PortfolioPage.tsx ─────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { useReveal }                   from "../hooks/index";
import { fetchProjects }               from "../lib/firebase";
import { PROJECTS }                    from "../lib/data";
import { getCloudinaryThumb }          from "../lib/cloudinary";
import { SectionHead }                 from "../components/ui/index";
import { CTASection }                  from "../sections/HomeSections";

// ── Local Project shape — self-contained, no dependency on lib/types.ts ──────
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
// Typed as `any` so it compiles regardless of what FirestoreProject exports.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toProject(fp: any): Project {
  return {
    id:          fp.id          ?? fp.title ?? "",
    title:       fp.title       || "",
    category:    fp.category    || "",
    tags:        fp.tags        ?? [],
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

// Reveal delay classes — must be static strings for Tailwind to include them
const REVEAL_DELAYS = ["reveal-d1", "reveal-d2", "reveal-d3"] as const;

// ─── Project Card ─────────────────────────────────────────────────────────────
function PortfolioCard({
  project,
  index,
  onClick,
}: { project: Project; index: number; onClick: (p: Project) => void }) {
  const delayClass = REVEAL_DELAYS[index % 3];

  return (
    <div
      onClick={() => onClick(project)}
      className={`group relative rounded-2xl border border-[var(--border)] overflow-hidden cursor-pointer
        transition-all duration-500 hover:-translate-y-1 reveal ${delayClass}`}
      style={{ background: "var(--bg-panel)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,110,248,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
      }}
    >
      {/* Image / Emoji panel */}
      <div
        className="relative h-48 overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${project.color}18, ${project.color}08)` }}
      >
        {project.imageUrl ? (
          <img
            src={getCloudinaryThumb(project.imageUrl, 640, 384)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-6xl transition-transform duration-500 group-hover:scale-110">
            {project.emoji}
          </span>
        )}

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/10 text-white text-[12px] font-mono">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1l1.5 3H11l-2.8 2 1 3.2L6 7.4l-3.2 1.8 1-3.2L1 4h3.5L6 1z" stroke="white" strokeWidth="0.8"/>
            </svg>
            View Details
          </div>
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-3 left-3 px-2 py-1 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase text-white"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}>
            Featured
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[9px] font-mono text-white/80 border border-white/15 backdrop-blur-sm"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          {project.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-[17px] font-bold text-[var(--ink)] mb-2 tracking-tight leading-snug">
          {project.title}
        </h3>
        <p className="text-[13px] text-[var(--ink3)] leading-relaxed font-body mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Result */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl"
          style={{ background: `${project.color}10`, border: `1px solid ${project.color}20` }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 9l3-4 3 2 4-5" stroke={project.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] font-mono font-semibold" style={{ color: project.color }}>
            {project.result}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <span key={t} className="font-mono text-[10px] px-2 py-1 rounded-lg border border-[var(--border2)] text-[var(--ink4)]"
              style={{ background: "var(--bg-surface)" }}>
              {t}
            </span>
          ))}
        </div>
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
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-3xl border border-[var(--border)]"
        style={{
          background:  "var(--bg-panel)",
          boxShadow:   "0 32px 100px rgba(0,0,0,0.5)",
          animation:   "fadeScaleIn .3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl flex items-center justify-center
            text-[var(--ink4)] hover:text-[var(--ink)] hover:bg-[var(--border)] transition-all"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Hero */}
        <div
          className="h-56 relative flex items-center justify-center overflow-hidden rounded-t-3xl"
          style={{ background: `linear-gradient(135deg, ${project.color}22, ${project.color}0a)` }}
        >
          {project.imageUrl ? (
            <img src={getCloudinaryThumb(project.imageUrl, 1360, 448)} alt={project.title}
              className="w-full h-full object-cover"/>
          ) : (
            <span className="text-8xl">{project.emoji}</span>
          )}
          <div className="absolute inset-0"
            style={{ background: "linear-gradient(to top, var(--bg-panel), transparent 60%)" }}/>
        </div>

        {/* Body */}
        <div className="px-8 pb-8 -mt-6 relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="font-display text-[26px] font-bold text-[var(--ink)] tracking-tight mb-1">
                {project.title}
              </h2>
              <span className="font-mono text-[11px] text-[var(--ink4)]">{project.category}</span>
            </div>
            {project.featured && (
              <div className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold tracking-widest uppercase text-white flex-shrink-0"
                style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}>
                Featured
              </div>
            )}
          </div>

          <p className="text-[15px] text-[var(--ink3)] leading-[1.85] font-body mb-6">{project.description}</p>

          {/* Result */}
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ background: `${project.color}10`, border: `1px solid ${project.color}20` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${project.color}20`, color: project.color }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 13l4-5.5 4 3 6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="font-mono text-[10px] text-[var(--ink4)] tracking-[0.1em] uppercase mb-0.5">Key Result</div>
              <div className="font-display text-[16px] font-bold" style={{ color: project.color }}>
                {project.result}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((t) => (
              <span key={t} className="font-mono text-[11px] px-3 py-1.5 rounded-xl border border-[var(--border2)] text-[var(--ink3)]"
                style={{ background: "var(--bg-surface)" }}>
                {t}
              </span>
            ))}
          </div>

          {/* Links */}
          {(project.liveUrl || project.githubUrl) && (
            <div className="flex gap-3">
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-300"
                  style={{ background: `linear-gradient(135deg, ${project.color}, ${project.color}99)` }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1h5v5M5 7L10.5 1.5M2 4H1v7h7v-1" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Live Site
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium border border-[var(--border2)]
                    text-[var(--ink3)] hover:text-[var(--ink)] hover:border-[var(--ink3)] transition-all">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="5" r="4" stroke="currentColor" strokeWidth="1"/>
                    <path d="M4 10c0-1 .5-1.5 2-1.5s2 .5 2 1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
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

  const [projects,  setProjects]  = useState<Project[]>(PROJECTS as Project[]);
  const [active,    setActive]    = useState(ALL);
  const [modal,     setModal]     = useState<Project | null>(null);
  // Start true — we always attempt a fetch; set false in finally
  const [isLoading, setIsLoading] = useState(true);
  const [view,      setView]      = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchProjects()
      .then((fps) => {
        if (fps.length > 0) setProjects(fps.map(toProject));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const categories = [ALL, ...Array.from(new Set(projects.map((p) => p.category)))];
  const filtered   = active === ALL ? projects : projects.filter((p) => p.category === active);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[55vh] flex items-end px-8 md:px-14 pb-20 pt-44 overflow-hidden"
        style={{ background: "var(--hero-bg)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(59,110,248,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,110,248,0.04) 1px,transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
          }}/>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--bg-base))" }}/>
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(59,110,248,0.09) 0%, transparent 65%)" }}/>

        <div className="relative z-10 max-w-4xl" style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-[var(--accent-pale2)] bg-[var(--accent-pale)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" style={{ animation: "bPulse 2s infinite" }}/>
            <span className="font-mono text-[10px] text-[var(--accent)] tracking-[0.14em] uppercase">Our Work</span>
          </div>

          <h1
            className="font-display font-extrabold leading-none tracking-tight mb-5"
            style={{ fontSize: "clamp(40px,7vw,88px)", color: "var(--hero-text)" }}
          >
            Work that<br/>
            <em className="not-italic" style={{ color: "var(--accent)" }}>speaks for itself.</em>
          </h1>

          <p className="text-[17px] font-light leading-relaxed max-w-xl" style={{ color: "var(--hero-muted)" }}>
            {projects.length}+ projects across AI, web, mobile, design, and growth. Every one built to win.
          </p>

          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { label: "AI Projects",   val: projects.filter((p) => p.category === "AI Development").length  },
              { label: "Web Apps",      val: projects.filter((p) => p.category === "Web Application").length },
              { label: "Mobile Apps",   val: projects.filter((p) => p.category === "Mobile App").length      },
              { label: "Featured Work", val: projects.filter((p) => p.featured).length                       },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border)]"
                style={{ background: "var(--bg-panel)" }}>
                <span className="font-display text-[15px] font-bold text-[var(--accent)]">{val}</span>
                <span className="font-mono text-[10px] text-[var(--ink4)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTER + GRID ────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-24 bg-[var(--bg-base)]">
        <div className="max-w-7xl mx-auto">

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10 reveal">
            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className="font-mono text-[11px] tracking-wider uppercase px-4 py-2 rounded-full border transition-all duration-200"
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
                    <span className="ml-1.5 opacity-60">
                      ({projects.filter((p) => p.category === cat).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl border border-[var(--border)]"
              style={{ background: "var(--bg-surface)" }}>
              {(["grid", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-lg transition-all duration-200"
                  style={
                    view === v
                      ? { background: "linear-gradient(135deg, var(--accent), var(--cyan))", color: "white" }
                      : { background: "transparent", color: "var(--ink4)" }
                  }>
                  {v === "grid" ? (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1"/>
                      <rect x="7.5" y="1" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1"/>
                      <rect x="1" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1"/>
                      <rect x="7.5" y="7.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="1" y="1" width="11" height="3" rx="1" stroke="currentColor" strokeWidth="1"/>
                      <rect x="1" y="5.5" width="11" height="3" rx="1" stroke="currentColor" strokeWidth="1"/>
                      <rect x="1" y="10" width="11" height="2.5" rx="1" stroke="currentColor" strokeWidth="1"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-[var(--border)] overflow-hidden"
                  style={{ background: "var(--bg-panel)" }}>
                  <div className="h-48 animate-pulse" style={{ background: "var(--bg-surface)" }}/>
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-5 rounded-lg animate-pulse" style={{ width: "75%", background: "var(--bg-surface)" }}/>
                    <div className="h-4 rounded-lg animate-pulse" style={{ background: "var(--bg-surface)" }}/>
                    <div className="h-4 rounded-lg animate-pulse" style={{ width: "66%", background: "var(--bg-surface)" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid view */}
          {!isLoading && view === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
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
                    className={`group flex items-center gap-5 p-4 rounded-2xl border border-[var(--border)]
                      cursor-pointer transition-all duration-300 reveal ${delayClass}`}
                    style={{ background: "var(--bg-panel)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,110,248,0.3)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: `${p.color}18` }}
                    >
                      {p.imageUrl ? (
                        <img src={getCloudinaryThumb(p.imageUrl, 112, 112)} alt={p.title}
                          className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-2xl">{p.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-display text-[15px] font-bold text-[var(--ink)] truncate">{p.title}</h3>
                        {p.featured && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase text-white flex-shrink-0"
                            style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}>
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[var(--ink4)] line-clamp-1 font-body">{p.description}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-1.5 flex-shrink-0 text-[11px] font-mono"
                      style={{ color: p.color }}>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path d="M1 8.5l3-4 3 2 3-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      {p.result}
                    </div>
                    <div className="flex-shrink-0 text-[var(--ink4)] group-hover:text-[var(--accent)] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="var(--ink4)" strokeWidth="1.5"/>
                  <path d="M8 14s1-2 3-2 3 2 3 2M8.5 9h.01M13.5 9h.01" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-display text-[16px] font-bold text-[var(--ink3)]">No projects in this category yet</p>
              <button onClick={() => setActive(ALL)}
                className="font-mono text-[11px] text-[var(--accent)] underline underline-offset-2">
                Show all →
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