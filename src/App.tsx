import { useState, useEffect, lazy, Suspense } from "react";
import { Cursor }            from "./components/ui/Cursor";
import { Navbar }            from "./components/layout/Navbar";
import { Footer }            from "./components/layout/Footer";
import { SplashScreen }      from "./components/ui/SplashScreen";
import { useTheme }          from "./hooks/index";
import { LanguageProvider }  from "./contexts/LanguageContext";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const HomePage      = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ServicesPage  = lazy(() => import("./pages/ServicesPage").then((m) => ({ default: m.ServicesPage })));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage").then((m) => ({ default: m.PortfolioPage })));
const AboutPage     = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const TeamPage      = lazy(() => import("./pages/TeamPage").then((m) => ({ default: m.TeamPage })));
const ContactPage   = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const AdminPage     = lazy(() => import("./pages/admin/AdminPage").then((m) => ({ default: m.AdminPage })));
const ClientPage    = lazy(() => import("./pages/ClientPage").then((m) => ({ default: m.ClientPage })));
const MemberPage    = lazy(() => import("./pages/MemberPage").then((m) => ({ default: m.MemberPage })));

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
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "50%", left: "50%",
          width: 480, height: 320,
          transform: "translate(-50%,-50%)",
          background:
            "radial-gradient(ellipse, var(--accent-pale) 0%, transparent 70%)",
          animation: "rPulse 3.6s ease-in-out infinite",
        }}
      />

      <div
        className="relative flex flex-col items-center gap-6"
        style={{ animation: "fadeIn 0.5s ease both" }}
      >
        {/* Animated diamond + orbit */}
        <div className="relative w-16 h-16">
          {/* Sweeping arc */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              border: "1px solid transparent",
              borderTopColor: "var(--cyan)",
              borderRightColor: "var(--accent)",
              animation: "spinLoader 1.8s linear infinite",
              filter: "drop-shadow(0 0 6px var(--accent-dim))",
            }}
          />
          {/* Outer ring */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 76, height: 76,
              top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              border: "1px solid var(--accent-pale2)",
              animation: "rPulse 2.2s ease-in-out infinite",
            }}
          />

          {/* Diamond body */}
          <div className="absolute inset-2.5">
            <div
              className="absolute inset-0 rounded-[10px]"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), var(--cyan), var(--accent))",
                backgroundSize: "200% 200%",
                transform: "rotate(45deg)",
                animation: "gradientShift 2.4s linear infinite",
                boxShadow: "0 0 24px var(--accent-dim)",
              }}
            />
            <div
              className="absolute inset-[3px] rounded-[8px]"
              style={{ background: "var(--bg-base)", transform: "rotate(45deg)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-mono font-bold text-[10px]"
                style={{ color: "var(--accent)" }}
              >
                ZH
              </span>
            </div>
          </div>
        </div>

        {/* Label + dots */}
        <div className="flex flex-col items-center gap-2.5">
          <span
            className="font-mono text-[10px] tracking-[0.24em] uppercase"
            style={{ color: "var(--ink3)" }}
          >
            Loading
          </span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="rounded-full"
                style={{
                  width: 4, height: 4,
                  background: "var(--accent)",
                  animation: `bPulse 1.2s ${i * 0.18}s ease-in-out infinite`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
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
const isAdminPath  = (path: string) => path === "/admin" || path.startsWith("/admin/");
const isClientPath = (path: string) => path.startsWith("/client");
const isMemberPath = (path: string) => path.startsWith("/member");

// ─── Router ───────────────────────────────────────────────────────────────────
function Router({ path }: { path: string }) {
  if (path.startsWith("/client")) return <ClientPage />;
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
    () => isAdminPath(window.location.pathname) || isClientPath(window.location.pathname) || isMemberPath(window.location.pathname) || sessionStorage.getItem("zyn-splash") === "1"
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

  if (isClientPath(path)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ClientPage />
      </Suspense>
    );
  }

  if (isMemberPath(path)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <MemberPage />
      </Suspense>
    );
  }

  return (
    <LanguageProvider>
      {/* Splash screen — shown once per session */}
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}

      {/* Content — rendered behind splash, transitions in after */}
      <div
        style={{
          opacity:    splashDone ? 1 : 0,
          transform:  splashDone ? "none" : "scale(0.985)",
          transition:
            "opacity 0.75s cubic-bezier(0.22,1,0.36,1) 0.05s, " +
            "transform 0.85s cubic-bezier(0.22,1,0.36,1) 0.05s",
          visibility: splashDone ? "visible" : "hidden",
          transformOrigin: "center 35%",
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
    </LanguageProvider>
  );
}
