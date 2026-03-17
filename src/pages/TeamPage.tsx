// ─── src/pages/TeamPage.tsx ──────────────────────────────────────────────────
import { useState, useEffect, useCallback } from "react";
import { useReveal }                          from "../hooks/index";
import { fetchMembers, type FirestoreMember } from "../lib/firebase";
import { SectionHead, LinkButton }            from "../components/ui/index";
import { CTASection }                         from "../sections/HomeSections";
import type { TeamMember }                    from "../lib/types";

// ── normalise Firestore doc → local TeamMember shape ─────────────────────────
function toMember(fm: FirestoreMember): TeamMember {
  return {
    id:       fm.id ?? fm.name,
    name:     fm.name     || "Unknown",
    role:     fm.role     || "",
    bio:      fm.bio      || "",
    initials: fm.initials || (fm.name?.slice(0, 2).toUpperCase() ?? "??"),
    color:    fm.color    || "#3B6EF8",
    imageUrl: fm.imageUrl || "",
    // Merge optional sub-fields so TeamMember.socials is always fully typed
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
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="1" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1"/>
      <path d="M4 5.5v4M4 4v.01M6 9.5V7a1 1 0 012 0v2.5M6 7.5h2"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  twitter: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  github: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1"/>
      <path d="M4.5 12v-1c0-1 .5-1.5 2-1.5s2 .5 2 1.5v1"
        stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  instagram: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1.5" y="1.5" width="10" height="10" rx="3" stroke="currentColor" strokeWidth="1"/>
      <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1"/>
      <circle cx="9.5" cy="3.5" r="0.5" fill="currentColor"/>
    </svg>
  ),
};

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ member }: { member: TeamMember }) {
  const socials = Object.entries(member.socials ?? {}).filter(([, v]) => v);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = `${member.color}50`;
        el.style.transform   = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.borderColor = "var(--border2)";
        el.style.transform   = "none";
      }}
    >
      {/* Top color bar */}
      <div className="h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${member.color}, ${member.color}44)` }}/>

      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${member.color}0c, transparent 65%)` }}
      />

      <div className="relative px-6 pt-7 pb-6 flex flex-col items-center text-center z-10">
        {/* Avatar */}
        <div
          className="w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden
            mb-5 border-2 transition-transform duration-500 group-hover:scale-[1.02] flex-shrink-0"
          style={{
            borderColor: `${member.color}35`,
            background:  member.imageUrl ? "transparent" : `${member.color}14`,
            maxHeight:   "260px",
          }}
        >
          {member.imageUrl ? (
            <img src={member.imageUrl} alt={member.name}
              className="w-full h-full object-contain object-center" loading="lazy"/>
          ) : (
            <span className="font-display text-6xl font-bold" style={{ color: member.color }}>
              {member.initials}
            </span>
          )}
        </div>

        <h3 className="font-display text-[17px] font-bold tracking-tight mb-1" style={{ color: "var(--ink)" }}>
          {member.name}
        </h3>
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold mb-4"
          style={{ color: member.color }}>
          {member.role}
        </span>
        <p className="text-[13px] leading-relaxed font-body mb-5 max-w-[260px]" style={{ color: "var(--ink3)" }}>
          {member.bio}
        </p>

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
                  el.style.background  = `${member.color}10`;
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
// Static inline widths — Tailwind can't purge dynamic w-${n} class strings
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
      <div className="h-1 animate-pulse" style={{ background: "var(--border2)" }}/>
      <div className="px-6 pt-7 pb-6 flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-2xl animate-pulse" style={{ background: "var(--bg-alt)" }}/>
        <div className="h-4 rounded-lg animate-pulse" style={{ width: "8rem", background: "var(--bg-alt)" }}/>
        <div className="h-3 rounded-lg animate-pulse" style={{ width: "5rem", background: "var(--bg-alt)" }}/>
        <div className="flex flex-col gap-2 w-full items-center mt-1">
          {(["100%", "83%", "66%"] as const).map((w) => (
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
        className="relative min-h-[55vh] flex items-end px-8 md:px-14 pb-20 pt-44 overflow-hidden"
        style={{ background: "var(--hero-bg)" }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,110,248,0.04) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(59,110,248,0.04) 1px,transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "radial-gradient(ellipse 85% 85% at 50% 50%, black 25%, transparent 100%)",
          }}/>
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, var(--bg-base))" }}/>
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(59,110,248,0.08) 0%, transparent 65%)" }}/>

        <div className="relative z-10 max-w-3xl"
          style={{ animation: "heroUp .8s cubic-bezier(0.16,1,0.3,1) both" }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full"
            style={{ border: "1px solid var(--accent-pale2)", background: "var(--accent-pale)" }}>
            <span className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent)", animation: "bPulse 2s infinite" }}/>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--accent)" }}>
              The Team
            </span>
          </div>

          <h1
            className="font-display font-bold leading-none tracking-tight mb-5"
            style={{ fontSize: "clamp(38px,6.5vw,80px)", color: "var(--hero-text)" }}
          >
            The people behind<br/>
            <em className="not-italic" style={{ color: "var(--accent)" }}>the products.</em>
          </h1>

          <p className="text-[17px] font-light leading-relaxed max-w-xl" style={{ color: "var(--hero-muted)" }}>
            Senior-only. Deeply collaborative. Obsessed with craft.
          </p>

          {!loading && members.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { label: "Team Members",  val: members.length },
                { label: "Years Avg XP",  val: "8+"           },
                { label: "Projects Done", val: "120+"         },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center gap-2 px-3.5 py-1.5 rounded-full"
                  style={{ border: "1px solid rgba(59,110,248,0.2)", background: "rgba(59,110,248,0.08)" }}>
                  <span className="font-display text-[15px] font-bold" style={{ color: "var(--accent)" }}>
                    {val}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: "rgba(232,237,255,0.5)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TEAM GRID ────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-28 transition-colors duration-500"
        style={{ background: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="Our People"
            heading={<>Built by <span className="text-gradient-blue">experts,</span> for builders.</>}
            sub="Every team member has shipped real products at scale. No juniors, no outsourcing."
          />

          {/* Firestore error banner */}
          {error && (
            <div className="mb-8 px-5 py-4 rounded-2xl flex items-start gap-3"
              style={{ background: "rgba(255,60,60,0.06)", border: "1px solid rgba(255,60,60,0.2)" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="flex-shrink-0 mt-0.5">
                <circle cx="9" cy="9" r="7.5" stroke="#FF6B6B" strokeWidth="1.2"/>
                <path d="M9 5.5v4M9 11.5h.01" stroke="#FF6B6B" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <div>
                <p className="font-display text-[13px] font-semibold mb-1" style={{ color: "#FF6B6B" }}>
                  Firestore fetch failed
                </p>
                <p className="font-mono text-[11px] leading-relaxed" style={{ color: "rgba(255,107,107,0.75)" }}>
                  {error}
                </p>
                <p className="font-mono text-[10px] mt-2" style={{ color: "rgba(255,107,107,0.55)" }}>
                  Check: Firebase config in .env · Firestore rules allow read: if true for /team · Collection name is "team"
                </p>
                <button onClick={load}
                  className="mt-3 font-mono text-[10px] px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.25)", color: "#FF6B6B", cursor: "pointer" }}>
                  Retry →
                </button>
              </div>
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i}/>)}
            </div>
          ) : members.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="9" cy="8" r="4" stroke="var(--ink4)" strokeWidth="1.5"/>
                  <path d="M2 19c0-4 3-6 7-6s7 2 7 6" stroke="var(--ink4)" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M17 5v6M20 8h-6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-display text-[15px] font-semibold" style={{ color: "var(--ink3)" }}>
                No team members in Firestore yet
              </p>
              <p className="text-[13px] font-body text-center max-w-xs" style={{ color: "var(--ink4)" }}>
                Go to <strong>/admin → Team</strong> and add your first member
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {members.map((m) => <MemberCard key={m.id} member={m}/>)}
            </div>
          )}
        </div>
      </section>

      {/* ── CULTURE ──────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-28 transition-colors duration-500"
        style={{ background: "var(--bg-alt)" }}>
        <div className="max-w-7xl mx-auto">
          <SectionHead
            tag="Culture"
            heading={<>How we <span className="text-gradient-blue">work together.</span></>}
            sub="Remote-first. Async-friendly. High trust, high output."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: "Remote-First",       desc: "Distributed across 3 timezones. Optimized for async without sacrificing momentum.", emoji: "🌍", color: "#3B6EF8" },
              { label: "No Meetings Culture", desc: "90% of decisions happen in writing. Meetings are a last resort, not a default.",    emoji: "🚫", color: "#00AACC" },
              { label: "Ship Fast",           desc: "Weekly milestones. Real code in client hands every 7 days. Progress is visible.",    emoji: "⚡", color: "#7B5CFA" },
              { label: "Learn Together",      desc: "Bi-weekly tech deep-dives, shared reading list, and internal R&D lab projects.",     emoji: "🧠", color: "#0DBFA8" },
            ].map(({ label, desc, emoji, color }, i) => {
              const delayClass = (["reveal-d1", "reveal-d2", "reveal-d3", "reveal-d4"] as const)[i];
              return (
                <div
                  key={label}
                  className={`reveal ${delayClass} relative p-7 rounded-2xl text-center overflow-hidden group transition-all duration-300`}
                  style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 30%, ${color}10, transparent 65%)` }}
                  />
                  <div
                    className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                  />
                  <span className="text-3xl mb-5 block relative z-10">{emoji}</span>
                  <h3 className="font-display text-[15px] font-bold mb-2 relative z-10" style={{ color: "var(--ink)" }}>
                    {label}
                  </h3>
                  <p className="text-[13px] leading-relaxed font-body relative z-10" style={{ color: "var(--ink3)" }}>
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HIRING CTA ───────────────────────────────────────────────────── */}
      <section className="px-8 md:px-14 py-24 transition-colors duration-500"
        style={{ background: "var(--bg-base)" }}>
        <div className="max-w-2xl mx-auto text-center reveal">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full"
            style={{ border: "1px solid var(--accent-pale2)", background: "var(--accent-pale)" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: "var(--cyan)" }}/>
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--cyan)" }}/>
            </span>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold"
              style={{ color: "var(--cyan)" }}>
              We're Hiring
            </span>
          </div>

          <h2 className="font-display text-[30px] font-bold tracking-tight mb-4" style={{ color: "var(--ink)" }}>
            Want to join the team?
          </h2>
          <p className="text-[15px] leading-relaxed mb-8 max-w-md mx-auto font-body" style={{ color: "var(--ink3)" }}>
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