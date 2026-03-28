import { useState, useEffect, useRef } from "react";
import { NAV_LINKS, SITE_CONFIG }      from "../../lib/data";
import { ThemeToggle }                 from "../ui/ThemeToggle";

interface NavbarProps {
  dark: boolean;
  onToggle: () => void;
  currentPage?: string;
}

export function Navbar({ dark, onToggle, currentPage = "/" }: NavbarProps) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", fn, { passive: true });
    fn();
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [currentPage]);

  const onHero = !scrolled;

  const inkMain     = onHero ? "rgba(244,246,255,0.95)" : "var(--ink)";
  // Nav link text: accent blue when scrolled in light mode, muted in dark, white/dim on hero
  const inkMuted    = onHero ? "rgba(244,246,255,0.55)" : dark ? "var(--ink3)" : "var(--accent)";
  const hoverBg     = onHero ? "rgba(255,255,255,0.08)" : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";
  const activeBg    = onHero ? "rgba(255,255,255,0.12)" : "var(--accent-pale)";
  const activeColor = onHero ? "rgba(244,246,255,0.98)" : "var(--accent)";

  // Logo filter:
  // • on hero: none — white logo shows great on dark hero bg
  // • scrolled + light: navy blue (~#0a1a4a)
  // • scrolled + dark:  none — logo visible on dark glass pill
  const logoFilter = "none";

  const navBg = scrolled
    ? dark ? "rgba(17,18,20,0.88)" : "rgba(2,8,66,0.45)"
    : "rgba(2,8,66,0.45)";

  const navBorder = scrolled
    ? dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)"
    : "rgba(255,255,255,0.10)";

  const navShadow = scrolled
    ? dark
      ? "0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.04)"
      : "0 8px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(0,0,0,0.05)"
    : "0 8px 40px rgba(2,8,66,0.35)";

  return (
    <>
      {/* ── Outer wrapper ─────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        style={{ paddingTop: scrolled ? 10 : 16, transition: "padding .35s var(--ease)" }}
      >
        {/* ── The pill ─────────────────────────────────────────────────── */}
        <nav
          ref={menuRef}
          className="pointer-events-auto flex flex-col"
          style={{
            width: "80%",
            maxWidth: 1200,
            borderRadius: scrolled ? 16 : 20,
            background: navBg,
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: `1px solid ${navBorder}`,
            boxShadow: navShadow,
            transition: "border-radius .35s var(--ease), background .35s ease, box-shadow .35s ease, border-color .35s ease",
            overflow: "hidden",
          }}
        >
          {/* Accent top-line */}
          <div
            className="absolute top-0 left-0 right-0 h-px pointer-events-none transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg, transparent 0%, var(--accent) 30%, var(--cyan) 70%, transparent 100%)",
              opacity: scrolled ? 0.7 : 0.3,
            }}
          />

          {/* ── Inner bar ─────────────────────────────────────────────── */}
          <div
            className="flex items-center justify-between px-4 sm:px-5 md:px-6"
            style={{ height: scrolled ? 56 : 64, transition: "height .35s var(--ease)" }}
          >
            {/* Logo */}
            <a href="/" className="flex items-center no-underline group flex-shrink-0">
              <img
                src="/logo.png"
                alt={SITE_CONFIG.name}
                className="object-contain group-hover:opacity-80"
                style={{
                  height: scrolled ? 44 : 54,
                  width: "auto",
                  maxWidth: 180,
                  transition: "height .35s var(--ease), filter .4s ease, opacity .2s ease",
                  filter: logoFilter,
                }}
              />
            </a>

            {/* Desktop Nav — absolutely centered */}
            <ul
              className="hidden md:flex items-center gap-0.5 list-none"
              style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
            >
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = currentPage === href;
                return (
                  <li key={label}>
                    <a
                      href={href}
                      className="relative flex items-center px-3.5 py-2 rounded-xl
                        text-[11px] font-semibold tracking-[0.05em] uppercase no-underline
                        transition-all duration-200"
                      style={{
                        color: isActive ? activeColor : inkMuted,
                        background: isActive ? activeBg : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.color = inkMain;
                          (e.currentTarget as HTMLElement).style.background = hoverBg;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          (e.currentTarget as HTMLElement).style.color = inkMuted;
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                        }
                      }}
                    >
                      {label}
                      {isActive && (
                        <span
                          className="absolute bottom-1 left-3 right-3 h-px rounded-full"
                          style={{
                            background: onHero
                              ? "rgba(244,246,255,0.5)"
                              : "linear-gradient(90deg, var(--accent), var(--cyan))",
                          }}
                        />
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            {/* Right Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ThemeToggle dark={dark} onToggle={onToggle} />

              {/* Hire Us CTA */}
              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl
                  text-[11px] font-bold text-white tracking-[0.04em]
                  transition-all duration-200 active:scale-95 overflow-hidden relative"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                  boxShadow: "0 4px 16px var(--accent-dim)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px var(--accent-dim)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px var(--accent-dim)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shineSweep 3s ease-in-out infinite",
                  }}
                />
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none" className="relative z-10">
                  <path d="M6.5 1C3.46 1 1 3.46 1 6.5c0 .97.26 1.88.7 2.67L1 12l2.94-.66A5.47 5.47 0 006.5 12C9.54 12 12 9.54 12 6.5S9.54 1 6.5 1z"
                    stroke="white" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M4.5 5c0-.28.22-.5.5-.5h.5c.28 0 .5.22.5.5v.5c0 .55-.45 1-.97 1.25.35.7.9 1.25 1.6 1.6.25-.52.7-.97 1.25-.97H8c.28 0 .5.22.5.5v.5c0 .28-.22.5-.5.5C6.07 8.88 4.5 7.3 4.5 5z"
                    fill="white"/>
                </svg>
                <span className="relative z-10">Hire Us</span>
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden w-9 h-9 flex flex-col justify-center items-center gap-[5px]
                  rounded-xl transition-all duration-200"
                style={{
                  background: mobileOpen ? (onHero ? "rgba(255,255,255,0.12)" : "var(--accent-pale)") : "transparent",
                  border: `1px solid ${mobileOpen ? (onHero ? "rgba(255,255,255,0.2)" : "var(--accent-pale2)") : "transparent"}`,
                  cursor: "pointer",
                }}
                aria-label="Toggle menu"
              >
                {[
                  mobileOpen ? "rotate(45deg) translate(4.5px, 4.5px)" : "none",
                  "none",
                  mobileOpen ? "rotate(-45deg) translate(4.5px, -4.5px)" : "none",
                ].map((transform, i) => (
                  <span
                    key={i}
                    className="block w-[18px] h-[1.5px] rounded-full transition-all duration-300 origin-center"
                    style={{
                      background: mobileOpen ? "var(--accent)" : inkMain,
                      transform,
                      opacity: i === 1 && mobileOpen ? 0 : 1,
                    }}
                  />
                ))}
              </button>
            </div>
          </div>

          {/* ── Mobile Menu ─────────────────────────────────────────────── */}
          <div
            className="md:hidden overflow-hidden transition-all duration-300"
            style={{
              maxHeight: mobileOpen ? 480 : 0,
              opacity:   mobileOpen ? 1 : 0,
              borderTop: mobileOpen
                ? `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"}`
                : "none",
            }}
          >
            <div
              className="h-px w-full"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--cyan))", opacity: 0.35 }}
            />

            <div className="px-4 py-4 flex flex-col gap-1">
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
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
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
                    {isActive ? (
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: "var(--accent)" }}
                      />
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ color: "var(--ink4)" }}>
                        <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </a>
                );
              })}

              <div
                className="my-1 h-px"
                style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}
              />

              <a
                href={SITE_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                  text-[13px] font-bold text-white transition-all duration-200 overflow-hidden relative"
                style={{
                  background: "linear-gradient(135deg, var(--accent), var(--cyan))",
                  boxShadow: "0 4px 20px var(--accent-dim)",
                }}
              >
                <span
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                    backgroundSize: "200% 100%",
                    animation: "shineSweep 3s ease-in-out infinite",
                  }}
                />
                <svg width="14" height="14" viewBox="0 0 13 13" fill="none" className="relative z-10">
                  <path d="M6.5 1C3.46 1 1 3.46 1 6.5c0 .97.26 1.88.7 2.67L1 12l2.94-.66A5.47 5.47 0 006.5 12C9.54 12 12 9.54 12 6.5S9.54 1 6.5 1z"
                    stroke="white" strokeWidth="1" strokeLinejoin="round"/>
                  <path d="M4.5 5c0-.28.22-.5.5-.5h.5c.28 0 .5.22.5.5v.5c0 .55-.45 1-.97 1.25.35.7.9 1.25 1.6 1.6.25-.52.7-.97 1.25-.97H8c.28 0 .5.22.5.5v.5c0 .28-.22.5-.5.5C6.07 8.88 4.5 7.3 4.5 5z"
                    fill="white"/>
                </svg>
                <span className="relative z-10">Chat on WhatsApp — Hire Us</span>
              </a>
            </div>
          </div>
        </nav>
      </div>

      <style>{`
        @keyframes shineSweep {
          0%   { background-position: 200% center; }
          50%  { background-position: -200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </>
  );
}