// import { useReveal } from "../hooks/index";
// import { HeroSection } from "../sections/HeroSection";
// import {
//   MarqueeSection,
//   IntroSection,
//   ServicesPreviewSection,
//   ProcessSection,
//   TechSection,
//   TestimonialsSection,
//   CTASection,
// } from "../sections/HomeSections";

// export function HomePage() {
//   useReveal();
//   return (
//     <main>
//       <HeroSection />
//       <MarqueeSection />
//       <IntroSection />
//       <ServicesPreviewSection />
//       <ProcessSection />
//       <TechSection />
//       <TestimonialsSection />
//       <CTASection />
//     </main>
//   );
// }
import { useEffect } from "react";

export function HomePage() {
  useEffect(() => {
    document.title = "Under Production";
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white overflow-hidden">
      
      {/* Floating blur circles */}
      <div className="absolute w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl animate-pulse top-20 left-20"></div>
      <div className="absolute w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse bottom-20 right-20"></div>

      <div className="relative text-center px-6">
        
        {/* Animated Icon */}
        <div className="text-7xl mb-6 animate-bounce">
          🚧
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Website Under Production
        </h1>

        {/* Description */}
        <p className="mt-6 text-lg text-gray-300 max-w-xl mx-auto">
          We're building something amazing. Our team is working hard to launch
          the new experience very soon.
        </p>

        {/* Animated Loader */}
        <div className="flex justify-center mt-10 space-x-2">
          <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></span>
          <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
          <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce delay-300"></span>
        </div>

        {/* Button */}
        <div className="mt-10">
          <button className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/40 hover:scale-105">
            Coming Soon
          </button>
        </div>

      </div>
    </main>
  );
}