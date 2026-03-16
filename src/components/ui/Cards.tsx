import { useState } from "react";
import type { Service, Project, TeamMember, Testimonial } from "../../lib/types";
import { ArrowRightIcon, LinkedInIcon, TwitterIcon, GitHubIcon } from "../ui/index";

// ─── ServiceCard ──────────────────────────────────────────────────────────────
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden transition-all duration-400"
      style={{
        background:  hovered ? "var(--bg-alt)"    : "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        borderBottom:"1px solid var(--border)",
        cursor: "default",
        padding: "2rem",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${service.color}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 30% 0%, ${service.color}0d, transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Index */}
      <span
        className="block font-mono text-[10px] tracking-[0.16em] uppercase mb-5 transition-colors duration-300"
        style={{ color: hovered ? service.color : "var(--ink4)" }}
      >
        0{index + 1}
      </span>

      {/* Icon box */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5
          transition-all duration-400"
        style={{
          background: hovered ? `${service.color}18` : "var(--bg-panel)",
          border: `1px solid ${hovered ? service.color + "30" : "var(--border2)"}`,
        }}
      >
        {service.emoji}
      </div>

      {/* Title */}
      <h3
        className="font-display text-[17px] font-bold tracking-tight leading-snug mb-2.5
          transition-colors duration-300"
        style={{ color: "var(--ink)" }}
      >
        {service.title}
      </h3>

      {/* Desc */}
      <p
        className="text-[13px] font-body leading-relaxed mb-6"
        style={{ color: "var(--ink3)" }}
      >
        {service.desc}
      </p>

      {/* Items */}
      <ul className="list-none flex flex-col gap-2 mb-8">
        {service.items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 text-[12px] transition-colors duration-200"
            style={{ color: hovered ? "var(--ink2)" : "var(--ink4)" }}
          >
            <span
              className="flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{ background: hovered ? service.color : "var(--border2)" }}
            />
            {item}
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <div
        className="absolute bottom-5 right-5 w-8 h-8 rounded-full flex items-center
          justify-center transition-all duration-300"
        style={{
          border: `1px solid ${hovered ? service.color : "var(--border2)"}`,
          background: hovered ? `${service.color}12` : "transparent",
          color: hovered ? service.color : "var(--ink4)",
          transform: hovered ? "rotate(45deg)" : "none",
        }}
      >
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────
export function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick?: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-400"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? project.color + "40" : "var(--border2)"}`,
        cursor: "pointer",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 20px 60px ${project.color}18` : "none",
      }}
      onClick={() => onClick?.(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Visual panel */}
      <div
        className="relative h-48 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${project.color}14, ${project.color}06)` }}
      >
        {/* Hover radial */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at center, ${project.color}22, transparent 65%)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Emoji */}
        <span
          className="text-6xl transition-all duration-500 relative z-10"
          style={{ transform: hovered ? "scale(1.12)" : "scale(1)" }}
        >
          {project.emoji}
        </span>

        {/* Badges */}
        {project.featured && (
          <span
            className="absolute top-3 left-3 font-mono text-[9px] font-bold
              tracking-widest px-2.5 py-1 rounded-lg uppercase text-white"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
          >
            Featured
          </span>
        )}
        <span
          className="absolute top-3 right-3 font-mono text-[9px] font-bold
            tracking-widest px-2.5 py-1 rounded-lg uppercase text-white"
          style={{ background: `${project.color}cc` }}
        >
          {project.category}
        </span>

        {/* View overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(3px)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <span
            className="font-mono text-[11px] text-white px-4 py-2 rounded-full
              border border-white/25 tracking-[0.1em]"
            style={{ background: "rgba(255,255,255,0.1)" }}
          >
            View Details →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="font-display text-[17px] font-bold tracking-tight mb-2"
          style={{ color: "var(--ink)" }}
        >
          {project.title}
        </h3>
        <p
          className="text-[13px] font-body leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--ink3)" }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-wide px-2.5 py-1 rounded-lg"
              style={{
                border: "1px solid var(--border2)",
                color: "var(--ink4)",
                background: "var(--bg-panel)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Result row */}
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
          style={{
            background: `${project.color}0d`,
            border: `1px solid ${project.color}22`,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 9l3-4 3 2.5 4-6" stroke={project.color}
              strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span
            className="font-mono text-[11px] font-semibold flex-1 truncate"
            style={{ color: project.color }}
          >
            {project.result}
          </span>
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
              transition-all duration-300"
            style={{
              border: `1px solid ${hovered ? project.color : "var(--border2)"}`,
              color: hovered ? project.color : "var(--ink4)",
              transform: hovered ? "rotate(45deg)" : "none",
            }}
          >
            <ArrowRightIcon className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TeamCard ─────────────────────────────────────────────────────────────────
export function TeamCard({ member }: { member: TeamMember }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-400"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? member.color + "40" : "var(--border2)"}`,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? `0 16px 48px ${member.color}14` : "none",
        padding: "1.75rem",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${member.color}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Hover glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${member.color}08, transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative z-10">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center font-display
            text-xl font-bold text-white mb-5 overflow-hidden relative transition-all duration-400"
          style={{
            background: `linear-gradient(135deg, ${member.color}90, ${member.color})`,
            transform: hovered ? "scale(1.05)" : "none",
            boxShadow: hovered ? `0 8px 24px ${member.color}40` : "none",
          }}
        >
          {member.initials}
        </div>

        {/* Name */}
        <h3
          className="font-display text-[17px] font-bold tracking-tight mb-1"
          style={{ color: "var(--ink)" }}
        >
          {member.name}
        </h3>

        {/* Role */}
        <span
          className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold mb-4 block"
          style={{ color: member.color }}
        >
          {member.role}
        </span>

        {/* Bio */}
        <p
          className="text-[13px] font-body leading-relaxed mb-5"
          style={{ color: "var(--ink3)" }}
        >
          {member.bio}
        </p>

        {/* Socials */}
        <div className="flex gap-2">
          {member.socials?.linkedin && (
            <SocialBtn href={member.socials.linkedin} color={member.color}>
              <LinkedInIcon className="w-3.5 h-3.5" />
            </SocialBtn>
          )}
          {member.socials?.twitter && (
            <SocialBtn href={member.socials.twitter} color={member.color}>
              <TwitterIcon className="w-3.5 h-3.5" />
            </SocialBtn>
          )}
          {member.socials?.github && (
            <SocialBtn href={member.socials.github} color={member.color}>
              <GitHubIcon className="w-3.5 h-3.5" />
            </SocialBtn>
          )}
        </div>
      </div>
    </div>
  );
}

// social button atom
function SocialBtn({
  href, color, children,
}: { href: string; color: string; children: React.ReactNode }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-xl flex items-center justify-center no-underline
        transition-all duration-200"
      style={{
        border: `1px solid ${hov ? color : "var(--border2)"}`,
        color:  hov ? color : "var(--ink4)",
        background: hov ? `${color}12` : "var(--bg-panel)",
        transform: hov ? "translateY(-2px)" : "none",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </a>
  );
}

// ─── TestimonialCard ──────────────────────────────────────────────────────────
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-400"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--accent-pale2)" : "var(--border2)"}`,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "var(--shadow-lg)" : "none",
        padding: "1.75rem",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-500"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Big decorative quote */}
      <span
        className="absolute top-2 right-4 font-display text-7xl font-bold leading-none
          pointer-events-none select-none transition-all duration-500"
        style={{
          color: "var(--accent)",
          opacity: hovered ? 0.12 : 0.05,
        }}
      >
        "
      </span>

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <svg key={i} width="13" height="13" viewBox="0 0 13 13"
            fill="var(--accent)">
            <path d="M6.5 1l1.5 3.3 3.6.5-2.6 2.5.6 3.5L6.5 9l-3.1 1.8.6-3.5L1.4 4.8l3.6-.5L6.5 1z"/>
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p
        className="text-[13px] font-body leading-relaxed mb-5 relative z-10"
        style={{ color: "var(--ink2)" }}
      >
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4"
        style={{ borderTop: "1px solid var(--border)" }}>
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
            font-display text-sm font-bold text-white"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
        >
          {testimonial.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-display text-[13px] font-bold truncate"
            style={{ color: "var(--ink)" }}
          >
            {testimonial.name}
          </div>
          <div
            className="text-[11px] font-mono truncate"
            style={{ color: "var(--ink4)" }}
          >
            {testimonial.role} · {testimonial.company}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em]
            uppercase flex-shrink-0 px-2 py-1 rounded-full"
          style={{
            color: "var(--cyan)",
            background: "rgba(0,170,204,0.08)",
            border: "1px solid rgba(0,170,204,0.18)",
          }}
        >
          <span
            className="w-1 h-1 rounded-full"
            style={{ background: "var(--cyan)", animation: "bPulse 2s infinite" }}
          />
          Verified
        </div>
      </div>
    </div>
  );
}

// ─── Project Modal ────────────────────────────────────────────────────────────
export function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[800] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn 0.2s ease",
        cursor: "default",
      }}
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden rounded-3xl max-w-lg w-full"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border2)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s var(--ease)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero panel */}
        <div
          className="h-44 flex items-center justify-center text-6xl relative"
          style={{ background: `linear-gradient(135deg, ${project.color}18, ${project.color}06)` }}
        >
          {/* Top line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${project.color}, transparent)` }}
          />
          <span className="relative z-10">{project.emoji}</span>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center
              justify-center text-[13px] transition-all duration-200"
            style={{
              background: "rgba(0,0,0,0.25)",
              color: "white",
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.45)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.25)"; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          <span
            className="inline-block font-mono text-[9px] font-bold tracking-widest
              px-2.5 py-1 rounded-lg text-white uppercase mb-4"
            style={{ background: `${project.color}cc` }}
          >
            {project.category}
          </span>

          <h2
            className="font-display text-[24px] font-bold tracking-tight mb-3"
            style={{ color: "var(--ink)" }}
          >
            {project.title}
          </h2>

          <p
            className="text-[14px] font-body leading-relaxed mb-5"
            style={{ color: "var(--ink3)" }}
          >
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2.5 py-1 rounded-xl"
                style={{
                  border: "1px solid var(--border2)",
                  color: "var(--ink4)",
                  background: "var(--bg-panel)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Result */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: `${project.color}0d`,
              border: `1px solid ${project.color}25`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${project.color}18`, border: `1px solid ${project.color}30` }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l3.5-5 3.5 3 5-7"
                  stroke={project.color} strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div
                className="font-mono text-[9px] tracking-[0.14em] uppercase mb-0.5"
                style={{ color: "var(--ink4)" }}
              >
                Key Result
              </div>
              <div
                className="font-display text-[14px] font-bold"
                style={{ color: project.color }}
              >
                {project.result}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}