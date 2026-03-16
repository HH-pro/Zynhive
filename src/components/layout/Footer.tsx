import { SITE_CONFIG, FOOTER_COLS, SOCIAL_HANDLES, NAV_LINKS } from "../../lib/data";
import { LinkedInIcon, TwitterIcon, GitHubIcon } from "../ui/index";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  Li: <LinkedInIcon />,
  Tw: <TwitterIcon />,
  Gh: <GitHubIcon />,
  Ig: <span className="text-xs font-bold font-syne">Ig</span>,
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-alt)] border-t border-[var(--border)] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-8 md:px-14 pt-16 pb-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[var(--border)] mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="/" className="font-syne text-[22px] font-extrabold text-[var(--ink)] tracking-[-0.03em] no-underline mb-3 block transition-colors duration-300">
              {SITE_CONFIG.name.slice(0, 3)}
              <span className="text-[var(--accent)]">{SITE_CONFIG.name[3]}</span>
              {SITE_CONFIG.name.slice(4)}
            </a>
            <p className="text-[13px] font-light text-[var(--ink3)] leading-relaxed mb-5 transition-colors duration-300">
              {SITE_CONFIG.description}
            </p>
            <div className="flex gap-2">
              {SOCIAL_HANDLES.map((handle) => (
                <a
                  key={handle}
                  href="#"
                  className="w-9 h-9 border border-[var(--border2)] rounded-lg flex items-center justify-center text-[var(--ink3)] no-underline transition-all duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-pale)]"
                  aria-label={handle}
                >
                  {SOCIAL_ICONS[handle]}
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_COLS).map(([col, links]) => (
            <div key={col}>
              <h4 className="font-syne text-[12px] font-bold text-[var(--ink)] tracking-[0.06em] uppercase mb-4 transition-colors duration-300">
                {col}
              </h4>
              <ul className="list-none flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] font-light text-[var(--ink3)] no-underline transition-colors duration-200 hover:text-[var(--accent)] flex items-center gap-2 group"
                    >
                      <span className="text-[var(--accent-pale2)] group-hover:text-[var(--accent)] transition-colors duration-200">–</span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="font-syne text-[12px] font-bold text-[var(--ink)] tracking-[0.06em] uppercase mb-4 transition-colors duration-300">
              Contact
            </h4>
            <ul className="list-none flex flex-col gap-3">
              {[
                { label: `WhatsApp: ${SITE_CONFIG.phone}`, href: SITE_CONFIG.whatsapp },
                { label: SITE_CONFIG.email,                href: `mailto:${SITE_CONFIG.email}` },
                { label: SITE_CONFIG.location,             href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-[13px] font-light text-[var(--ink3)] no-underline transition-colors duration-200 hover:text-[var(--accent)] flex items-center gap-2 group"
                  >
                    <span className="text-[var(--accent-pale2)] group-hover:text-[var(--accent)] transition-colors duration-200">–</span>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[var(--ink4)] transition-colors duration-300">
          <span>© {year} {SITE_CONFIG.name}. All rights reserved.</span>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((l) => (
              <a key={l} href="#" className="text-[var(--ink4)] no-underline transition-colors duration-200 hover:text-[var(--accent)]">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
