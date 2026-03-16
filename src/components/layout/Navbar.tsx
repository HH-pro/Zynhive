import { useState, useEffect, useRef } from "react";
import { NAV_LINKS, SITE_CONFIG }      from "../../lib/data";
import { ThemeToggle }                 from "../ui/ThemeToggle";

interface NavbarProps {
  dark: boolean;
  onToggle: () => void;
  currentPage?: string;
}

export function Navbar({ dark, onToggle, currentPage = "/" }: NavbarProps) {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <nav
      ref={menuRef}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        height: scrolled ? 60 : 72,
        background: scrolled
          ? "var(--nav-glass)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6 md:px-10">

        {/* ── Logo ──────────────────────────────────────────────────────── */}
        <a
          href="/"
          className="flex items-center gap-2.5 no-underline group"
          style={{ cursor: "pointer" }}
        >
          {/* Diamond icon */}
          <div className="relative w-8 h-8 flex-shrink-0">
            <div
              className="absolute inset-0 rounded-lg transition-transform duration-500 group-hover:rotate-90"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                transform: "rotate(45deg)",
              }}
            />
            <div
              className="absolute inset-[3px] rounded-md"
              style={{
                background: scrolled ? "var(--nav-glass)" : dark ? "#010420" : "#F4F6FF",
                transform: "rotate(45deg)",
                transition: "background 0.5s",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-mono font-bold text-[9px]"
                style={{ color: "var(--accent)" }}
              >
                ZH
              </span>
            </div>
          </div>

          {/* Name */}
          <span
            className="font-display text-[20px] font-bold tracking-tight leading-none"
            style={{ color: "var(--ink)" }}
          >
            {SITE_CONFIG.name.slice(0, 3)}
            <span style={{ color: "var(--accent)" }}>{SITE_CONFIG.name[3]}</span>
            {SITE_CONFIG.name.slice(4)}
          </span>
        </a>

        {/* ── Desktop Nav ────────────────────────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-1 list-none">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = currentPage === href;
            const isHover  = activeHover === href;

            return (
              <li key={label}>
                <a
                  href={href}
                  onMouseEnter={() => setActiveHover(href)}
                  onMouseLeave={() => setActiveHover(null)}
                  className="relative flex items-center gap-1 px-4 py-2 rounded-xl
                    text-[12px] font-semibold tracking-[0.06em] uppercase no-underline
                    transition-all duration-200"
                  style={{
                    color: isActive
                      ? "var(--accent)"
                      : isHover
                        ? "var(--ink)"
                        : "var(--ink3)",
                    background: isActive
                      ? "var(--accent-pale)"
                      : isHover
                        ? "var(--bg-panel)"
                        : "transparent",
                    cursor: "pointer",
                  }}
                >
                  {label}
                  {isActive && (
                    <span
                      className="w-1 h-1 rounded-full flex-shrink-0"
                      style={{ background: "var(--accent)" }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* ── Right Controls ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <ThemeToggle dark={dark} onToggle={onToggle} />

          {/* Hire Us CTA */}
          <a
            href={SITE_CONFIG.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl
              text-[12px] font-bold text-white tracking-[0.04em]
              transition-all duration-200 active:scale-95"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--cyan))",
              boxShadow: "0 4px 16px var(--accent-dim)",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.88";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px var(--accent-dim)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px var(--accent-dim)";
            }}
          >
            {/* WhatsApp icon */}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 1C3.46 1 1 3.46 1 6.5c0 .97.26 1.88.7 2.67L1 12l2.94-.66A5.47 5.47 0 006.5 12C9.54 12 12 9.54 12 6.5S9.54 1 6.5 1z"
                stroke="white" strokeWidth="1" strokeLinejoin="round"
              />
              <path
                d="M4.5 5c0-.28.22-.5.5-.5h.5c.28 0 .5.22.5.5v.5c0 .55-.45 1-.97 1.25.35.7.9 1.25 1.6 1.6.25-.52.7-.97 1.25-.97H8c.28 0 .5.22.5.5v.5c0 .28-.22.5-.5.5C6.07 8.88 4.5 7.3 4.5 5z"
                fill="white"
              />
            </svg>
            Hire Us
          </a>

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-1.5
              rounded-xl transition-all duration-200"
            style={{
              background: mobileOpen ? "var(--bg-panel)" : "transparent",
              border: `1px solid ${mobileOpen ? "var(--border2)" : "transparent"}`,
              cursor: "pointer",
            }}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: "var(--ink)",
                transform: mobileOpen ? "rotate(45deg) translateY(7px)" : "none",
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: "var(--ink)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-px transition-all duration-300"
              style={{
                background: "var(--ink)",
                transform: mobileOpen ? "rotate(-45deg) translateY(-7px)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────────────────── */}
      <div
        className="md:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: mobileOpen ? 400 : 0,
          opacity:   mobileOpen ? 1 : 0,
          background: "var(--nav-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: mobileOpen ? "1px solid var(--border)" : "none",
        }}
      >
        <div className="px-6 py-5 flex flex-col gap-1">

          {NAV_LINKS.map(({ label, href }) => {
            const isActive = currentPage === href;
            return (
              <a
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl
                  text-[13px] font-semibold tracking-[0.05em] uppercase no-underline
                  transition-all duration-200"
                style={{
                  color: isActive ? "var(--accent)" : "var(--ink3)",
                  background: isActive ? "var(--accent-pale)" : "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "var(--bg-panel)";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--ink3)";
                  }
                }}
              >
                {label}
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </a>
            );
          })}

          {/* Mobile Hire Us */}
          <a
            href={SITE_CONFIG.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-3 px-4 py-3 rounded-xl
              text-[13px] font-bold text-white transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--cyan))",
              cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 13 13" fill="none">
              <path
                d="M6.5 1C3.46 1 1 3.46 1 6.5c0 .97.26 1.88.7 2.67L1 12l2.94-.66A5.47 5.47 0 006.5 12C9.54 12 12 9.54 12 6.5S9.54 1 6.5 1z"
                stroke="white" strokeWidth="1" strokeLinejoin="round"
              />
              <path
                d="M4.5 5c0-.28.22-.5.5-.5h.5c.28 0 .5.22.5.5v.5c0 .55-.45 1-.97 1.25.35.7.9 1.25 1.6 1.6.25-.52.7-.97 1.25-.97H8c.28 0 .5.22.5.5v.5c0 .28-.22.5-.5.5C6.07 8.88 4.5 7.3 4.5 5z"
                fill="white"
              />
            </svg>
            Chat on WhatsApp — Hire Us
          </a>
        </div>
      </div>
    </nav>
  );
}