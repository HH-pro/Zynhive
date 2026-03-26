import React from "react";

// ─── Icons ────────────────────────────────────────────────────────────────────

export function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M2.5 8l4 4 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function TwitterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );
}

export function GitHubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22" />
    </svg>
  );
}

// ─── Button Variants ──────────────────────────────────────────────────────────

const SIZE_MAP = {
  sm:  "px-4 py-2 text-sm",
  md:  "px-6 py-3 text-sm",
  lg:  "px-8 py-4 text-base",
} as const;

const VARIANT_MAP = {
  // Electric-blue accent (primary CTA)
  accent:   "bg-[var(--accent)] hover:bg-[var(--accent2)] text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
  // Legacy alias
  amber:    "bg-[var(--accent)] hover:bg-[var(--accent2)] text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0",
  // Ghost — navy-tinted border
  ghost:    "bg-transparent text-[var(--ink3)] border border-[var(--border2)] hover:border-[var(--accent)] hover:text-[var(--ink)] hover:bg-[var(--accent-pale)]",
  // Outline for dark hero backgrounds
  outline:  "bg-transparent text-[var(--hero-muted)] border border-[var(--hero-border)] hover:border-[rgba(244,246,255,0.4)] hover:text-[var(--hero-text)]",
  // WhatsApp
  whatsapp: "bg-[#25D366] hover:bg-[#1fbb59] text-white shadow-md hover:shadow-xl hover:-translate-y-0.5",
  // Navy solid
  navy:     "bg-[var(--navy)] hover:bg-[var(--navy2)] text-white shadow-md hover:shadow-xl hover:-translate-y-0.5",
} as const;

type VariantKey = keyof typeof VARIANT_MAP;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VariantKey;
  size?: keyof typeof SIZE_MAP;
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "accent", size = "md", loading = false,
  children, className = "", ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 font-semibold rounded-lg font-outfit transition-all duration-200 disabled:opacity-50 ${SIZE_MAP[size]} ${VARIANT_MAP[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

export function LinkButton({
  href, variant = "accent", size = "md",
  children, className = "", external = false,
}: {
  href: string;
  variant?: VariantKey;
  size?: keyof typeof SIZE_MAP;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 font-semibold rounded-lg font-outfit transition-all duration-200 ${SIZE_MAP[size]} ${VARIANT_MAP[variant]} ${className}`}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHead({
  tag, heading, sub, light = false,
}: {
  tag: string;
  heading: React.ReactNode;
  sub?: string;
  light?: boolean;
}) {
  return (
    <div className="mb-14 reveal">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-5 h-px bg-[var(--accent)]" />
        <span className="font-mono text-[11px] text-[var(--accent)] tracking-[0.12em] uppercase">{tag}</span>
      </div>
      <h2
        className={`font-syne font-extrabold leading-none tracking-tight transition-colors duration-300 ${
          light ? "text-[var(--hero-text)]" : "text-[var(--ink)]"
        }`}
        style={{ fontSize: "clamp(28px,4vw,50px)" }}
      >
        {heading}
      </h2>
      {sub && (
        <p
          className={`mt-3 text-base font-light leading-relaxed max-w-xl transition-colors duration-300 ${
            light ? "text-[var(--hero-muted)]" : "text-[var(--ink3)]"
          }`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider border border-[var(--accent-pale2)] bg-[var(--accent-pale)] text-[var(--accent)] uppercase ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider() {
  return <hr className="border-t border-[var(--border)] my-0" />;
}
