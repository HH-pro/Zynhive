// import { useState, useEffect, lazy, Suspense } from "react";
// import { Cursor }  from "./components/ui/Cursor";
// import { Navbar }  from "./components/layout/Navbar";
// import { Footer }  from "./components/layout/Footer";
// import { useTheme } from "./hooks/index";

// // ─── Lazy-loaded pages ────────────────────────────────────────────────────────
// const HomePage      = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
// const ServicesPage  = lazy(() => import("./pages/ServicesPage").then((m) => ({ default: m.ServicesPage })));
// const PortfolioPage = lazy(() => import("./pages/PortfolioPage").then((m) => ({ default: m.PortfolioPage })));
// const AboutPage     = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
// const TeamPage      = lazy(() => import("./pages/TeamPage").then((m) => ({ default: m.TeamPage })));
// const ContactPage   = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
// const AdminPage     = lazy(() => import("./pages/admin/AdminPage").then((m) => ({ default: m.AdminPage })));

// // ─── Simple hash router ───────────────────────────────────────────────────────
// function useRouter() {
//   const [path, setPath] = useState(() => window.location.pathname || "/");

//   useEffect(() => {
//     const onPop = () => setPath(window.location.pathname || "/");
//     window.addEventListener("popstate", onPop);

//     // Intercept <a> clicks for SPA navigation
//     const onClick = (e: MouseEvent) => {
//       const a = (e.target as HTMLElement).closest("a");
//       if (
//         !a ||
//         a.target === "_blank" ||
//         a.href.startsWith("http") ||
//         a.href.startsWith("mailto") ||
//         a.href.startsWith("tel")
//       ) return;
//       const url = new URL(a.href);
//       if (url.origin !== window.location.origin) return;
//       e.preventDefault();
//       window.history.pushState(null, "", url.pathname);
//       setPath(url.pathname);
//       window.scrollTo({ top: 0, behavior: "smooth" });
//     };

//     document.addEventListener("click", onClick);
//     return () => {
//       window.removeEventListener("popstate", onPop);
//       document.removeEventListener("click", onClick);
//     };
//   }, []);

//   return path;
// }

// // ─── Page fallback ────────────────────────────────────────────────────────────
// function PageLoader() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
//       <div className="flex flex-col items-center gap-4">
//         <div className="w-10 h-10 border-2 border-[var(--border2)] border-t-[var(--accent)] rounded-full animate-spin" />
//         <span className="font-mono text-[11px] text-[var(--ink4)] tracking-widest uppercase">Loading</span>
//       </div>
//     </div>
//   );
// }

// // ─── Whether the current path is the admin section ────────────────────────────
// const isAdminPath = (path: string) => path === "/admin" || path.startsWith("/admin/");

// // ─── Router ───────────────────────────────────────────────────────────────────
// function Router({ path }: { path: string }) {
//   switch (path) {
//     case "/services":  return <ServicesPage />;
//     case "/portfolio": return <PortfolioPage />;
//     case "/about":     return <AboutPage />;
//     case "/team":      return <TeamPage />;
//     case "/contact":   return <ContactPage />;
//     case "/admin":     return <AdminPage />;
//     default:           return <HomePage />;
//   }
// }

// // ─── App Root ─────────────────────────────────────────────────────────────────
// export default function App() {
//   const { dark, toggle } = useTheme();
//   const path = useRouter();

//   // Admin pages get their own full-screen layout — no Navbar/Footer/Cursor chrome
//   if (isAdminPath(path)) {
//     return (
//       <Suspense fallback={<PageLoader />}>
//         <AdminPage />
//       </Suspense>
//     );
//   }

//   return (
//     <>
//       <Cursor />
//       <Navbar dark={dark} onToggle={toggle} currentPage={path} />
//       <Suspense fallback={<PageLoader />}>
//         <Router path={path} />
//       </Suspense>
//       <Footer />
//     </>
//   );
// }

import { useState, useEffect, lazy, Suspense } from "react";
import { Cursor } from "./components/ui/Cursor";
// import { Navbar } from "./components/layout/Navbar";
// import { Footer } from "./components/layout/Footer";
import { useTheme } from "./hooks/index";

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage }))
);

// ─── Page fallback ────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[var(--border2)] border-t-[var(--accent)] rounded-full animate-spin" />
        <span className="font-mono text-[11px] text-[var(--ink4)] tracking-widest uppercase">
          Loading
        </span>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const { dark, toggle } = useTheme();

  return (
    <>
      <Cursor />

      {/* Navbar temporarily disabled */}
      {/*
      <Navbar dark={dark} onToggle={toggle} currentPage="/" />
      */}

      <Suspense fallback={<PageLoader />}>
        <HomePage />
      </Suspense>

      {/* Footer temporarily disabled */}
      {/*
      <Footer />
      */}
    </>
  );
}