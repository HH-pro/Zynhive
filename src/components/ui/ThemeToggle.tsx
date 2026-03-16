export function ThemeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-[52px] h-7 rounded-full border-[1.5px] border-[var(--border2)] bg-[var(--bg-panel)] cursor-none overflow-hidden flex-shrink-0 transition-all duration-300 hover:border-[var(--accent)] hover:shadow-[0_0_0_3px_var(--amber-pale)]"
    >
      {/* Icons */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <span className={`text-[11px] leading-none transition-opacity duration-300 ${dark ? "opacity-35" : "opacity-100"}`}>☀</span>
        <span className={`text-[11px] leading-none transition-opacity duration-300 ${dark ? "opacity-100" : "opacity-35"}`}>☽</span>
      </div>
      {/* Thumb */}
      <div
        className={`absolute top-[3px] left-[3px] w-5 h-5 rounded-full bg-[var(--accent)] shadow transition-transform duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${dark ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}
