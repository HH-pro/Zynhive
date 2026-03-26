import { useState, useEffect, lazy, Suspense } from "react";
import { Cursor }        from "./components/ui/Cursor";
import { Navbar }        from "./components/layout/Navbar";
import { Footer }        from "./components/layout/Footer";
import { SplashScreen }  from "./components/ui/SplashScreen";
import { useTheme }      from "./hooks/index";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const HomePage      = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ServicesPage  = lazy(() => import("./pages/ServicesPage").then((m) => ({ default: m.ServicesPage })));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage").then((m) => ({ default: m.PortfolioPage })));
const AboutPage     = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const TeamPage      = lazy(() => import("./pages/TeamPage").then((m) => ({ default: m.TeamPage })));
const ContactPage   = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const AdminPage     = lazy(() => import("./pages/admin/AdminPage").then((m) => ({ default: m.AdminPage })));

// ─── Scroll progress bar ──────────────────────────────────────────────────────
function ScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const fn = () => {
      const el  = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] h-[2px] pointer-events-none">
      <div
        className="h-full rounded-r-full"
        style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, var(--accent), var(--cyan))",
          boxShadow: "0 0 8px var(--accent-dim), 0 0 16px rgba(0,212,255,0.2)",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
}

// ─── Page fallback (lazy-load) ────────────────────────────────────────────────
function PageLoader() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Animated diamond */}
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-[10px]"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--cyan))",
              backgroundSize: "200% 200%",
              transform: "rotate(45deg)",
              animation: "gradientShift 2s linear infinite, rPulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            className="absolute inset-[3px] rounded-[8px]"
            style={{ background: "var(--bg-base)", transform: "rotate(45deg)" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono font-bold text-[10px]" style={{ color: "var(--accent)" }}>ZH</span>
          </div>
        </div>
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase" style={{ color: "var(--ink4)" }}>
          Loading
        </span>
      </div>
    </div>
  );
}

// ─── Simple hash router ───────────────────────────────────────────────────────
function useRouter() {
  const [path, setPath] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || "/");
    window.addEventListener("popstate", onPop);

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a");
      if (
        !a || a.target === "_blank" ||
        a.href.startsWith("http") ||
        a.href.startsWith("mailto") ||
        a.href.startsWith("tel")
      ) return;
      const url = new URL(a.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      window.history.pushState(null, "", url.pathname);
      setPath(url.pathname);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("click", onClick);
    };
  }, []);

  return path;
}

// ─── Whether the current path is the admin section ────────────────────────────
const isAdminPath = (path: string) => path === "/admin" || path.startsWith("/admin/");

// ─── Router ───────────────────────────────────────────────────────────────────
function Router({ path }: { path: string }) {
  switch (path) {
    case "/":          return <HomePage />;
    case "/services":  return <ServicesPage />;
    case "/portfolio": return <PortfolioPage />;
    case "/about":     return <AboutPage />;
    case "/team":      return <TeamPage />;
    case "/contact":   return <ContactPage />;
    case "/admin":     return <AdminPage />;
  }
}

// ─── Eagerly preload all page chunks after first render ───────────────────────
function usePreloadPages() {
  useEffect(() => {
    const load = () => {
      import("./pages/ServicesPage");
      import("./pages/PortfolioPage");
      import("./pages/AboutPage");
      import("./pages/TeamPage");
      import("./pages/ContactPage");
    };
    // Wait until browser is idle so it doesn't compete with the initial render
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(load);
    } else {
      setTimeout(load, 300);
    }
  }, []);
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { dark, toggle } = useTheme();
  const path = useRouter();
  usePreloadPages();

  // Show splash only once per session (skip for admin)
  const [splashDone, setSplashDone] = useState(
    () => isAdminPath(window.location.pathname) || sessionStorage.getItem("zyn-splash") === "1"
  );

  const handleSplashDone = () => {
    sessionStorage.setItem("zyn-splash", "1");
    setSplashDone(true);
  };

  if (isAdminPath(path)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <AdminPage />
      </Suspense>
    );
  }

  return (
    <>
      {/* Splash screen — shown once per session */}
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}

      {/* Content — rendered behind splash, transitions in after */}
      <div
        style={{
          opacity:    splashDone ? 1 : 0,
          transition: "opacity 0.5s ease 0.1s",
          visibility: splashDone ? "visible" : "hidden",
        }}
      >
        <Cursor />
        <ScrollProgress />
        <Navbar dark={dark} onToggle={toggle} currentPage={path} />
        <Suspense fallback={<PageLoader />}>
          <Router path={path} />
        </Suspense>
        <Footer />
      </div>
    </>
  );
}
