import { useState, useRef } from "react";
import type { Service, Project, TeamMember, Testimonial } from "../../lib/types";
import { ArrowRightIcon, LinkedInIcon, TwitterIcon, GitHubIcon } from "../ui/index";

// ── Professional SVG service icons ───────────────────────────────────────────

function IconAI({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      {/* Chip body */}
      <rect x="5" y="5" width="8" height="8" rx="1.5" stroke={color} strokeWidth="1.3" />
      {/* Inner dots */}
      <circle cx="7.5"  cy="7.5"  r="0.8" fill={color} />
      <circle cx="10.5" cy="7.5"  r="0.8" fill={color} />
      <circle cx="7.5"  cy="10.5" r="0.8" fill={color} />
      <circle cx="10.5" cy="10.5" r="0.8" fill={color} />
      {/* Pins — top */}
      <line x1="7"  y1="5"  x2="7"  y2="2.5"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="5"  x2="11" y2="2.5"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Pins — bottom */}
      <line x1="7"  y1="13" x2="7"  y2="15.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="11" y1="13" x2="11" y2="15.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Pins — left */}
      <line x1="5"  y1="7"  x2="2.5"  y2="7"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5"  y1="11" x2="2.5"  y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Pins — right */}
      <line x1="13" y1="7"  x2="15.5" y2="7"  stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="13" y1="11" x2="15.5" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconWeb({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      {/* Browser frame */}
      <rect x="1.5" y="3" width="15" height="12" rx="2" stroke={color} strokeWidth="1.3" />
      {/* Title bar divider */}
      <line x1="1.5" y1="6.5" x2="16.5" y2="6.5" stroke={color} strokeWidth="1.1" />
      {/* Traffic lights */}
      <circle cx="4"   cy="4.75" r="0.8" fill={color} opacity="0.45" />
      <circle cx="6.2" cy="4.75" r="0.8" fill={color} opacity="0.7"  />
      <circle cx="8.4" cy="4.75" r="0.8" fill={color} />
      {/* URL bar */}
      <rect x="10" y="3.9" width="5" height="1.7" rx="0.85" stroke={color} strokeWidth="0.8" opacity="0.45" />
      {/* Content lines */}
      <line x1="4" y1="9.5"  x2="14" y2="9.5"  stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="4" y1="11.5" x2="11" y2="11.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="4" y1="13.5" x2="9"  y2="13.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function IconMarketing({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
      {/* Rising bars */}
      <rect x="2"  y="10"  width="3"   height="5.5" rx="0.8" stroke={color} strokeWidth="1.2" />
      <rect x="7"  y="7"   width="3"   height="8.5" rx="0.8" stroke={color} strokeWidth="1.2" />
      <rect x="12" y="3.5" width="3.5" height="12"  rx="0.8" stroke={color} strokeWidth="1.2" />
      {/* Trend line */}
      <polyline
        points="3.5,9.5 8.5,6.5 13.75,3"
        stroke={color} strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round"
        opacity="0.6"
      />
      {/* Arrow tip */}
      <polyline
        points="11.5,2.5 13.75,3 13.2,5.2"
        stroke={color} strokeWidth="1.2"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// Map service ID (or title key) → icon component
function ServiceIcon({ service, color }: { service: Service; color: string }) {
  const key = service.title.toLowerCase();
  if (key.includes("web") || key.includes("app")) return <IconWeb color={color} />;
  if (key.includes("market")) return <IconMarketing color={color} />;
  // Default: AI / automation
  return <IconAI color={color} />;
}

// ─── ServiceCard ──────────────────────────────────────────────────────────────
export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div
      ref={cardRef}
      className="group relative overflow-hidden transition-all duration-500"
      style={{
        background: hovered
          ? `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, ${service.color}0f 0%, var(--bg-surface) 65%)`
          : "var(--bg-surface)",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        cursor: "default",
        padding: "2rem 2rem 2.5rem",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Top accent line — animated fill */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden">
        <div
          className="h-full w-full transition-all duration-700"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${service.color} 40%, ${service.color}88 70%, transparent 100%)`,
            transform: hovered ? "translateX(0%)" : "translateX(-101%)",
          }}
        />
      </div>

      {/* Corner index badge + icon row */}
      <div className="flex items-start justify-between mb-6">
        <span
          className="font-mono text-[10px] tracking-[0.18em] uppercase px-2 py-1 rounded-md transition-all duration-300"
          style={{
            color: hovered ? service.color : "var(--ink4)",
            background: hovered ? `${service.color}12` : "transparent",
            border: `1px solid ${hovered ? service.color + "30" : "transparent"}`,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Icon box — SVG replaces emoji */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500"
          style={{
            background: hovered ? `${service.color}18` : "var(--bg-panel)",
            border: `1px solid ${hovered ? service.color + "35" : "var(--border2)"}`,
            transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1) rotate(0deg)",
            boxShadow: hovered ? `0 8px 24px ${service.color}28` : "none",
          }}
        >
          <ServiceIcon
            service={service}
            color={hovered ? service.color : "var(--ink4)"}
          />
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-display text-[18px] font-bold tracking-tight leading-snug mb-2.5 transition-colors duration-300"
        style={{ color: "var(--ink)" }}
      >
        {service.title}
      </h3>

      {/* Subtle separator */}
      <div
        className="h-px mb-4 transition-all duration-500"
        style={{
          background: hovered
            ? `linear-gradient(90deg, ${service.color}50, transparent)`
            : "var(--border)",
          width: hovered ? "60%" : "30%",
        }}
      />

      {/* Description */}
      <p
        className="text-[13px] leading-relaxed mb-6"
        style={{ color: "var(--ink3)", lineHeight: "1.75" }}
      >
        {service.desc}
      </p>

      {/* Items — pill style */}
      <ul className="list-none flex flex-col gap-2 mb-8">
        {service.items.map((item, i) => (
          <li
            key={item}
            className="flex items-center gap-2.5 text-[12px] transition-all duration-300"
            style={{
              color: hovered ? "var(--ink2)" : "var(--ink4)",
              transitionDelay: hovered ? `${i * 40}ms` : "0ms",
            }}
          >
            <span
              className="flex-shrink-0 w-[5px] h-[5px] rounded-full transition-all duration-300"
              style={{
                background: hovered ? service.color : "var(--border2)",
                boxShadow: hovered ? `0 0 6px ${service.color}` : "none",
              }}
            />
            {item}
          </li>
        ))}
      </ul>

      {/* Footer row */}
      <div className="absolute bottom-5 left-6 right-5 flex items-center justify-between">
        <span
          className="font-mono text-[10px] tracking-widest uppercase transition-all duration-300"
          style={{
            color: hovered ? service.color : "transparent",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateX(0)" : "translateX(-8px)",
          }}
        >
          Learn more
        </span>

        {/* Arrow */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-400"
          style={{
            border: `1px solid ${hovered ? service.color : "var(--border2)"}`,
            background: hovered ? `${service.color}12` : "transparent",
            color: hovered ? service.color : "var(--ink4)",
            transform: hovered ? "rotate(45deg) scale(1.1)" : "none",
          }}
        >
          <ArrowRightIcon className="w-3.5 h-3.5" />
        </div>
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
      className="relative overflow-hidden rounded-2xl transition-all duration-500 flex flex-col"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? project.color + "45" : "var(--border2)"}`,
        cursor: "pointer",
        transform: hovered ? "translateY(-6px)" : "none",
        boxShadow: hovered
          ? `0 4px 6px ${project.color}08, 0 24px 60px ${project.color}18, 0 1px 0 ${project.color}20 inset`
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
      onClick={() => onClick?.(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px] transition-opacity duration-500 z-10"
        style={{
          background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Visual panel */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: 180,
          background: `linear-gradient(145deg, ${project.color}16 0%, ${project.color}06 60%, var(--bg-panel) 100%)`,
        }}
      >
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${project.color}08 1px, transparent 1px), linear-gradient(90deg, ${project.color}08 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />

        {/* Hover radial */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${project.color}28, transparent 70%)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Emoji — kept for project cards (each project has a unique visual identity) */}
        <span
          className="text-5xl transition-all duration-500 relative z-10"
          style={{
            transform: hovered ? "scale(1.15) translateY(-3px)" : "scale(1)",
            filter: hovered ? `drop-shadow(0 8px 16px ${project.color}60)` : "none",
          }}
        >
          {project.emoji}
        </span>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {project.featured && (
            <span
              className="font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-lg uppercase text-white"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
            >
              Featured
            </span>
          )}
        </div>
        <span
          className="absolute top-3 right-3 font-mono text-[9px] font-bold tracking-widest px-2.5 py-1 rounded-lg uppercase"
          style={{
            background: `${project.color}20`,
            color: project.color,
            border: `1px solid ${project.color}30`,
          }}
        >
          {project.category}
        </span>

        {/* View overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-all duration-300"
          style={{
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <span
            className="font-mono text-[11px] text-white px-4 py-2 rounded-full border border-white/20 tracking-[0.1em] transition-all duration-300"
            style={{
              background: "rgba(255,255,255,0.1)",
              transform: hovered ? "scale(1)" : "scale(0.9)",
            }}
          >
            View Details →
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3
          className="font-display text-[17px] font-bold tracking-tight mb-1.5 leading-snug"
          style={{ color: "var(--ink)" }}
        >
          {project.title}
        </h3>
        <p
          className="text-[13px] leading-relaxed mb-4 line-clamp-2"
          style={{ color: "var(--ink3)", lineHeight: "1.7" }}
        >
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] tracking-wide px-2.5 py-1 rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${hovered ? project.color + "25" : "var(--border2)"}`,
                color: hovered ? project.color : "var(--ink4)",
                background: hovered ? `${project.color}08` : "var(--bg-panel)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Result row */}
        <div
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-300"
          style={{
            background: hovered ? `${project.color}12` : `${project.color}08`,
            border: `1px solid ${hovered ? project.color + "30" : project.color + "18"}`,
          }}
        >
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: `${project.color}20`,
              border: `1px solid ${project.color}30`,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M1 9l3-4 3 2.5 4-6"
                stroke={project.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span
            className="font-mono text-[11px] font-semibold flex-1 truncate"
            style={{ color: project.color }}
          >
            {project.result}
          </span>
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              border: `1px solid ${hovered ? project.color + "50" : "var(--border2)"}`,
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
      className="relative overflow-hidden rounded-2xl transition-all duration-500"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? member.color + "40" : "var(--border2)"}`,
        transform: hovered ? "translateY(-5px)" : "none",
        boxShadow: hovered
          ? `0 20px 50px ${member.color}14, 0 4px 12px rgba(0,0,0,0.08)`
          : "0 1px 3px rgba(0,0,0,0.05)",
        padding: "1.75rem",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top color bar */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden">
        <div
          className="h-full w-full transition-all duration-700"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${member.color} 40%, ${member.color}88 70%, transparent 100%)`,
            transform: hovered ? "translateX(0%)" : "translateX(-101%)",
          }}
        />
      </div>

      {/* Subtle bg glow */}
      <div
        className="absolute top-0 right-0 pointer-events-none transition-opacity duration-700"
        style={{
          width: 180,
          height: 180,
          background: `radial-gradient(circle, ${member.color}0c, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          borderRadius: "50%",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="relative z-10">
        {/* Avatar + role row */}
        <div className="flex items-start gap-4 mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-display
              text-lg font-bold text-white flex-shrink-0 overflow-hidden relative transition-all duration-500"
            style={{
              background: `linear-gradient(145deg, ${member.color}bb, ${member.color})`,
              transform: hovered ? "scale(1.06)" : "scale(1)",
              boxShadow: hovered
                ? `0 8px 24px ${member.color}45, 0 0 0 3px ${member.color}18`
                : `0 4px 12px ${member.color}25`,
            }}
          >
            {/* Subtle shine */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, transparent 60%)",
              }}
            />
            <span className="relative z-10">{member.initials}</span>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h3
              className="font-display text-[17px] font-bold tracking-tight mb-1 leading-tight"
              style={{ color: "var(--ink)" }}
            >
              {member.name}
            </h3>
            <span
              className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase font-semibold px-2.5 py-1 rounded-lg"
              style={{
                color: member.color,
                background: `${member.color}12`,
                border: `1px solid ${member.color}25`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: member.color }}
              />
              {member.role}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div
          className="h-px mb-4 transition-all duration-500"
          style={{
            background: hovered
              ? `linear-gradient(90deg, ${member.color}40, transparent)`
              : "var(--border)",
          }}
        />

        {/* Bio */}
        <p
          className="text-[13px] leading-relaxed mb-5"
          style={{ color: "var(--ink3)", lineHeight: "1.75" }}
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

// ─── SocialBtn atom ───────────────────────────────────────────────────────────
function SocialBtn({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 rounded-xl flex items-center justify-center no-underline transition-all duration-200"
      style={{
        border: `1px solid ${hov ? color + "50" : "var(--border2)"}`,
        color: hov ? color : "var(--ink4)",
        background: hov ? `${color}10` : "var(--bg-panel)",
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? `0 4px 12px ${color}20` : "none",
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
      className="relative overflow-hidden rounded-2xl transition-all duration-500 flex flex-col"
      style={{
        background: "var(--bg-surface)",
        border: `1px solid ${hovered ? "var(--accent-pale2)" : "var(--border2)"}`,
        transform: hovered ? "translateY(-5px)" : "none",
        boxShadow: hovered
          ? "0 20px 50px rgba(0,0,0,0.1), var(--shadow-lg)"
          : "0 1px 3px rgba(0,0,0,0.05)",
        padding: "1.75rem",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] overflow-hidden">
        <div
          className="h-full w-full transition-all duration-700"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)",
            transform: hovered ? "translateX(0%)" : "translateX(-101%)",
          }}
        />
      </div>

      {/* Decorative quote mark */}
      <div
        className="absolute top-3 right-5 font-display font-bold leading-none pointer-events-none select-none transition-all duration-500"
        style={{
          fontSize: 72,
          color: "var(--accent)",
          opacity: hovered ? 0.14 : 0.06,
          transform: hovered ? "translateY(-3px)" : "none",
          lineHeight: 1,
        }}
      >
        "
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <svg
            key={i}
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="var(--accent)"
            style={{ opacity: 0.9 + i * 0.02 }}
          >
            <path d="M6.5 1l1.5 3.3 3.6.5-2.6 2.5.6 3.5L6.5 9l-3.1 1.8.6-3.5L1.4 4.8l3.6-.5L6.5 1z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p
        className="text-[13.5px] leading-relaxed mb-5 relative z-10 flex-1"
        style={{ color: "var(--ink2)", lineHeight: "1.8", fontStyle: "italic" }}
      >
        "{testimonial.text}"
      </p>

      {/* Divider */}
      <div
        className="h-px mb-4 transition-all duration-500"
        style={{
          background: hovered
            ? "linear-gradient(90deg, var(--accent-pale2), transparent)"
            : "var(--border)",
        }}
      />

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center
            font-display text-sm font-bold text-white relative overflow-hidden transition-all duration-400"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--cyan))",
            boxShadow: hovered ? "0 4px 16px var(--accent-dim)" : "none",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)",
            }}
          />
          <span className="relative z-10">{testimonial.initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div
            className="font-display text-[13.5px] font-bold truncate"
            style={{ color: "var(--ink)" }}
          >
            {testimonial.name}
          </div>
          <div className="text-[11px] font-mono truncate" style={{ color: "var(--ink4)" }}>
            {testimonial.role} · {testimonial.company}
          </div>
        </div>

        {/* Verified badge */}
        <div
          className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em]
            uppercase flex-shrink-0 px-2.5 py-1.5 rounded-full transition-all duration-300"
          style={{
            color: "var(--cyan)",
            background: hovered ? "rgba(0,170,204,0.12)" : "rgba(0,170,204,0.07)",
            border: "1px solid rgba(0,170,204,0.2)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: "var(--cyan)", animation: "bPulse 2s infinite" }}
          />
          Verified
        </div>
      </div>
    </div>
  );
}

// ─── ProjectModal ─────────────────────────────────────────────────────────────
export function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[800] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "fadeIn 0.2s ease",
        cursor: "default",
      }}
      onClick={onClose}
    >
      <div
        className="relative overflow-hidden rounded-3xl max-w-lg w-full"
        style={{
          background: "var(--bg-surface)",
          border: `1px solid ${project.color}30`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px ${project.color}15`,
          animation: "slideUp 0.3s var(--ease)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero panel */}
        <div
          className="relative flex items-center justify-center overflow-hidden"
          style={{
            height: 176,
            background: `linear-gradient(145deg, ${project.color}18 0%, ${project.color}08 60%, var(--bg-panel) 100%)`,
          }}
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(${project.color}10 1px, transparent 1px), linear-gradient(90deg, ${project.color}10 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-[1.5px]"
            style={{
              background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
            }}
          />

          <span
            className="text-6xl relative z-10"
            style={{ filter: `drop-shadow(0 8px 20px ${project.color}50)` }}
          >
            {project.emoji}
          </span>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center
              justify-center text-[13px] font-semibold transition-all duration-200"
            style={{
              background: "rgba(0,0,0,0.3)",
              color: "rgba(255,255,255,0.85)",
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.5)";
              (e.currentTarget as HTMLElement).style.color = "white";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.3)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-7">
          {/* Category + Featured row */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="inline-block font-mono text-[9px] font-bold tracking-widest
                px-2.5 py-1 rounded-lg uppercase"
              style={{
                background: `${project.color}18`,
                color: project.color,
                border: `1px solid ${project.color}28`,
              }}
            >
              {project.category}
            </span>
            {project.featured && (
              <span
                className="inline-block font-mono text-[9px] font-bold tracking-widest
                  px-2.5 py-1 rounded-lg uppercase text-white"
                style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}
              >
                Featured
              </span>
            )}
          </div>

          <h2
            className="font-display text-[22px] font-bold tracking-tight mb-3 leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {project.title}
          </h2>

          {/* Separator */}
          <div
            className="h-px mb-4"
            style={{
              background: `linear-gradient(90deg, ${project.color}40, transparent)`,
            }}
          />

          <p
            className="text-[14px] leading-relaxed mb-5"
            style={{ color: "var(--ink3)", lineHeight: "1.75" }}
          >
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[10px] px-2.5 py-1 rounded-xl transition-all duration-200"
                style={{
                  border: `1px solid ${project.color}20`,
                  color: project.color,
                  background: `${project.color}08`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Result */}
          <div
            className="flex items-center gap-3.5 p-4 rounded-2xl"
            style={{
              background: `${project.color}0d`,
              border: `1px solid ${project.color}22`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${project.color}18`,
                border: `1px solid ${project.color}30`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 12l3.5-5 3.5 3 5-7"
                  stroke={project.color}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
                className="font-display text-[15px] font-bold"
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