// ─── src/pages/TeamPage.tsx ──────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useReveal }                         from "../hooks/index";
import { fetchMembers }                      from "../lib/firebase";
import { SectionHead, LinkButton }           from "../components/ui/index";
import { CTASection }                        from "../sections/HomeSections";

// ── Local shape — self-contained so we don't depend on lib/types.ts version ──
interface TeamMember {
  id:       string;
  name:     string;
  role:     string;
  bio:      string;
  initials: string;
  color:    string;
  imageUrl: string;
  socials: {
    linkedin:  string;
    twitter:   string;
    github:    string;
    instagram: string;
  };
}

// ── Normalise Firestore doc → TeamMember ─────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toMember(fm: any): TeamMember {
  return {
    id:       fm.id       ?? fm.name  ?? "",
    name:     fm.name     || "Unknown",
    role:     fm.role     || "",
    bio:      fm.bio      || "",
    initials: fm.initials || (typeof fm.name === "string" ? fm.name.slice(0, 2).toUpperCase() : "??"),
    color:    fm.color    || "#3B6EF8",
    imageUrl: fm.imageUrl || "",
    socials: {
      linkedin:  fm.socials?.linkedin  ?? "",
      twitter:   fm.socials?.twitter   ?? "",
      github:    fm.socials?.github    ?? "",
      instagram: fm.socials?.instagram ?? "",
    },
  };
}

// ─── Social icons ─────────────────────────────────────────────────────────────
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  linkedin: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 6v4.5M4.5 4.5v.01M6.5 10.5V8a1.5 1.5 0 013 0v2.5M6.5 8.5h3"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  twitter: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  github: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M5 13v-1.5c0-1 .5-1.5 2-1.5s2 .5 2 1.5V13"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="1.5" width="11" height="11" rx="3.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="7" cy="7" r="2.8" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="10.2" cy="3.8" r="0.6" fill="currentColor"/>
    </svg>
  ),
};

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ member }: { member: TeamMember }) {
  const socials = Object.entries(member.socials ?? {}).filter(([, v]) => v);

  return (
    <div
      className="group relative rounded-3xl overflow-hidden transition-all duration-500"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border2)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${member.color}55`;
        el.style.transform   = "translateY(-6px)";
        el.style.boxShadow   = `0 20px 50px rgba(0,0,0,0.12), 0 0 0 1px ${member.color}20`;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border2)";
        el.style.transform   = "none";
        el.style.boxShadow   = "0 2px 20px rgba(0,0,0,0.04)";
      }}
    >
      {/* Top gradient bar */}
      <div className="h-[3px] w-full transition-all duration-500"
        style={{ background: `linear-gradient(90deg, ${member.color}, ${member.color}66, transparent)` }}/>

      {/* Ambient glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${member.color}10, transparent 70%)` }}
      />

      <div className="relative px-6 pt-7 pb-7 flex flex-col items-center text-center z-10">
        {/* Avatar */}
        <div
          className="relative mb-5 rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-500 group-hover:scale-[1.03]"
          style={{
            width: "100%",
            maxHeight: "240px",
            aspectRatio: "1 / 1",
            border: `2px solid ${member.color}30`,
            background: member.imageUrl ? "transparent" : `${member.color}12`,
          }}
        >
          {member.imageUrl ? (
            <img src={member.imageUrl} alt={member.name}
              className="w-full h-full object-contain object-center" loading="lazy"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-syne text-5xl font-bold" style={{ color: member.color }}>
                {member.initials}
              </span>
            </div>
          )}
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: `inset 0 0 30px ${member.color}15` }}/>
        </div>

        {/* Name + role */}
        <h3 className="font-syne text-[18px] font-bold tracking-tight mb-1.5" style={{ color: "var(--ink)" }}>
          {member.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-3 h-px" style={{ background: member.color }}/>
          <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold"
            style={{ color: member.color }}>
            {member.role}
          </span>
          <div className="w-3 h-px" style={{ background: member.color }}/>
        </div>

        <p className="text-[13px] leading-[1.75] font-light mb-6 max-w-[260px]" style={{ color: "var(--ink3)" }}>
          {member.bio}
        </p>

        {/* Divider */}
        {socials.length > 0 && (
          <div className="w-full h-px mb-4" style={{ background: "var(--border2)" }}/>
        )}

        {/* Socials */}
        {socials.length > 0 && (
          <div className="flex items-center gap-2">
            {socials.map(([key, href]) => (
              <a
                key={key}
                href={href as string}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={key}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border2)", color: "var(--ink4)" }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = member.color;
                  el.style.color       = member.color;
                  el.style.background  = `${member.color}12`;
                  el.style.transform   = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.borderColor = "var(--border2)";
                  el.style.color       = "var(--ink4)";
                  el.style.background  = "var(--bg-panel)";
                  el.style.transform   = "none";
                }}
              >
                {SOCIAL_ICONS[key] ?? null}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
      <div className="h-[3px] animate-pulse" style={{ background: "var(--border2)" }}/>
      <div className="px-6 pt-7 pb-7 flex flex-col items-center gap-4">
        <div className="w-full aspect-square max-h-[240px] rounded-2xl animate-pulse" style={{ background: "var(--bg-alt)" }}/>
        <div className="h-5 rounded-lg animate-pulse" style={{ width: "9rem", background: "var(--bg-alt)" }}/>
        <div className="h-3 rounded-lg animate-pulse" style={{ width: "6rem", background: "var(--bg-alt)" }}/>
        <div className="flex flex-col gap-2 w-full items-center">
          {(["100%", "85%", "70%"] as const).map((w) => (
            <div key={w} className="h-3 rounded-lg animate-pulse"
              style={{ width: w, background: "var(--bg-alt)" }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TeamPage ─────────────────────────────────────────────────────────────────
export function TeamPage() {
  useReveal();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchMembers()
      .then((docs) => {
        setMembers(docs.map(toMember));
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[TeamPage] fetchMembers →", msg);
        setError(msg);
        setMembers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[60vh] flex items-end px-4 sm:px-6 lg:px-14 pb-16 sm:pb-20 pt-40 sm:pt-44 overflow-hidden"
        style={{ background: "var(--bg-base)" }}
      >
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,110,248,0.05) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(59,110,248,0.05) 1px,transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 90% 85% at 50% 40%, black 25%, transparent 100%)",
          }}/>

        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(59,110,248,0.10) 0%, transparent 65%)" }}/>
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.06) 0%, transparent 65%)" }}/>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--bg-base))" }}/>

        <div className="relative z-10 max-w-3xl w-full"
          style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}>
          {/* Label badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 rounded-full"
            style={{ border: "1px solid var(--accent-pale2)", background: "var(--accent-pale)" }}>
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent)", animation: "bPulse 2s infinite" }}/>
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase" style={{ color: "var(--accent)" }}>
              The Team
            </span>
          </div>

          <h1
            className="font-syne font-extrabold leading-[0.95] tracking-tight mb-5"
            style={{ fontSize: "clamp(36px,6.5vw,82px)", color: "var(--hero-text)" }}
          >
            The people behind<br/>
            <em className="not-italic" style={{ color: "var(--accent)" }}>the products.</em>
          </h1>

          <p className="text-[16px] sm:text-[18px] font-light leading-relaxed max-w-xl"
            style={{ color: "var(--hero-muted)" }}>
            Senior-only. Deeply collaborative. Obsessed with craft.
          </p>

          {!loading && members.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-8">
              {[
                { label: "Team Members",  val: members.length },
                { label: "Avg Experience", val: "8+ yrs"      },
                { label: "Projects Done", val: "120+"         },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2.5 px-4 py-2 rounded-full"
                  style={{ border: "1px solid rgba(59,110,248,0.25)", background: "rgba(59,110,248,0.1)" }}>
                  <span className="font-syne text-[15px] font-bold" style={{ color: "var(--accent)" }}>
                    {val}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "rgba(232,237,255,0.55)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TEAM GRID ────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-14 py-16 md:py-24 lg:py-32 transition-colors duration-500"
        style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="Our People"
            heading={<>Built by <span className="text-gradient-blue">experts,</span> for builders.</>}
            sub="Every team member has shipped real products at scale. No juniors, no outsourcing."
          />

          {/* Firestore error banner */}
          {error && (
            <div className="mb-10 px-5 py-5 rounded-2xl flex items-start gap-4"
              style={{ background: "rgba(255,60,60,0.05)", border: "1px solid rgba(255,60,60,0.18)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,107,107,0.12)" }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke="#FF6B6B" strokeWidth="1.2"/>
                  <path d="M9 5.5v4M9 11.5h.01" stroke="#FF6B6B" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="font-syne text-[13px] font-semibold mb-1" style={{ color: "#FF6B6B" }}>
                  Firestore fetch failed
                </p>
                <p className="font-mono text-[11px] leading-relaxed" style={{ color: "rgba(255,107,107,0.75)" }}>
                  {error}
                </p>
                <p className="font-mono text-[10px] mt-2" style={{ color: "rgba(255,107,107,0.5)" }}>
                  Check: Firebase config in .env · Firestore rules allow read: if true for /team · Collection name is "team"
                </p>
                <button onClick={load}
                  className="mt-3 font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "#FF6B6B" }}>
                  Retry →
                </button>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i}/>)}
            </div>
          ) : members.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-5">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="9" cy="8" r="4" stroke="var(--ink4)" strokeWidth="1.5"/>
                  <path d="M2 21c0-4 3-6 7-6s7 2 7 6" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M18 7v6M21 10h-6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-syne text-[16px] font-semibold" style={{ color: "var(--ink3)" }}>
                No team members in Firestore yet
              </p>
              <p className="text-[13px] text-center max-w-xs" style={{ color: "var(--ink4)" }}>
                Go to <strong>/admin → Team</strong> and add your first member
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => <MemberCard key={m.id} member={m}/>)}
            </div>
          )}
        </div>
      </section>

      {/* ── CULTURE ──────────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-14 py-16 md:py-24 lg:py-32 transition-colors duration-500"
        style={{ background: "var(--bg-alt)" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="Culture"
            heading={<>How we <span className="text-gradient-blue">work together.</span></>}
            sub="Remote-first. Async-friendly. High trust, high output."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Remote-First",        desc: "Distributed across 3 timezones. Optimized for async without sacrificing momentum.", icon: "🌍", color: "#3B6EF8" },
              { label: "No Meetings Culture",  desc: "90% of decisions happen in writing. Meetings are a last resort, not a default.",    icon: "🚫", color: "#00AACC" },
              { label: "Ship Fast",            desc: "Weekly milestones. Real code in client hands every 7 days. Progress is visible.",    icon: "⚡", color: "#7B5CFA" },
              { label: "Learn Together",       desc: "Bi-weekly tech deep-dives, shared reading list, and internal R&D lab projects.",     icon: "🧠", color: "#0DBFA8" },
            ].map(({ label, desc, icon, color }, i) => {
              const delayClass = (["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4"] as const)[i];
              return (
                <div
                  key={label}
                  className={`reveal ${delayClass} relative p-7 rounded-2xl overflow-hidden group transition-all duration-400`}
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = `${color}40`;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border2)";
                    (e.currentTarget as HTMLElement).style.transform = "none";
                  }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 20%, ${color}12, transparent 65%)` }}/>
                  {/* Top line */}
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }}/>

                  <span className="text-3xl mb-5 block relative z-10">{icon}</span>
                  <h3 className="font-syne text-[15px] font-bold mb-2 relative z-10" style={{ color: "var(--ink)" }}>
                    {label}
                  </h3>
                  <p className="text-[13px] leading-[1.7] relative z-10" style={{ color: "var(--ink3)" }}>
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HIRING CTA ───────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 lg:px-14 py-16 md:py-24 transition-colors duration-500"
        style={{ background: "var(--bg-base)" }}>
        <div className="max-w-2xl mx-auto text-center reveal">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full"
            style={{ border: "1px solid var(--accent-pale2)", background: "var(--accent-pale)" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "var(--cyan)" }}/>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--cyan)" }}/>
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase font-semibold"
              style={{ color: "var(--cyan)" }}>
              We're Hiring
            </span>
          </div>

          <h2 className="font-syne text-[28px] sm:text-[34px] font-bold tracking-tight mb-4" style={{ color: "var(--ink)" }}>
            Want to join the team?
          </h2>
          <p className="text-[15px] leading-relaxed mb-8 max-w-md mx-auto font-light" style={{ color: "var(--ink3)" }}>
            We're always looking for exceptional engineers, designers, and growth marketers.
            If you're obsessed with craft and want to work on meaningful projects — we want to meet you.
          </p>
          <LinkButton href="/contact" variant="accent" size="md">
            Send Your Application →
          </LinkButton>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
