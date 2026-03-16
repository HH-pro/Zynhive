/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        syne:   ["Syne", "sans-serif"],
        outfit: ["Outfit", "sans-serif"],
        mono:   ["JetBrains Mono", "monospace"],
      },
      colors: {
        /* Primary accent — electric blue */
        accent: {
          DEFAULT: "var(--accent)",
          2:       "var(--accent2)",
          dim:     "var(--accent-dim)",
          pale:    "var(--accent-pale)",
          pale2:   "var(--accent-pale2)",
        },
        /* Navy brand */
        navy: {
          DEFAULT: "var(--navy)",
          2:       "var(--navy2)",
          dim:     "var(--navy-dim)",
        },
        /* Cyan highlight */
        cyan: {
          DEFAULT: "var(--cyan)",
          2:       "var(--cyan2)",
        },
        /* Ink scale */
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink2)",
          3: "var(--ink3)",
          4: "var(--ink4)",
        },
        /* Bg tokens */
        surface: "var(--bg-surface)",
        panel:   "var(--bg-panel)",

        /* Legacy alias so old `amber` classnames still resolve */
        amber: {
          DEFAULT: "var(--accent)",
          2:       "var(--accent2)",
          dim:     "var(--accent-dim)",
          pale:    "var(--accent-pale)",
          pale2:   "var(--accent-pale2)",
        },
        teal: "var(--cyan)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(0.16,1,0.3,1)",
      },
      backgroundImage: {
        "gradient-accent-cyan": "linear-gradient(135deg, var(--accent), var(--cyan2))",
        "gradient-navy":        "linear-gradient(135deg, var(--navy), var(--navy2))",
      },
    },
  },
  plugins: [],
};
