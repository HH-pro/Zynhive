// ─── Language types ───────────────────────────────────────────────────────────
export type Lang = "en" | "sv";

// ─── Translation map ──────────────────────────────────────────────────────────
export const translations = {
  en: {
    nav: {
      links: [
        { label: "Home",      href: "/" },
        { label: "Services",  href: "/services" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "About",     href: "/about" },
        { label: "Team",      href: "/team" },
        { label: "Contact",   href: "/contact" },
      ],
      hireUs:       "Hire Us",
      chatWhatsapp: "Chat on WhatsApp — Hire Us",
    },

    hero: {
      available:  "Available for projects",
      weBuilt:    "We Build",
      thatScale:  "That Scale.",
      words: [
        "AI Solutions", "Web Apps", "Mobile Apps", "Digital Growth",
        "UI/UX Design", "RAG Pipelines", "AI Agents", "SaaS Products",
      ],
      // sub rendered in component — only the highlighted word changes
      subBefore:   "From",
      subCyan:     "LLM fine-tuning",
      subMid:      "to pixel-perfect interfaces — we engineer AI products that automate workflows, delight users, and generate revenue. Lahore-based.",
      subAfter:    "Global delivery.",
      exploreServices: "Explore Services",
      letsTalk:        "Let's Talk",
      scroll:          "Scroll",
      liveMetrics:     "Live Metrics",
      aiPipeline:      "AI pipeline · production",
      productionLive:  "Production live",
      lahoreHQ:        "Lahore HQ",
      support247:      "24 / 7 support",
      stats: [
        { target: 120, suffix: "+",  label: "Projects Delivered"  },
        { target: 98,  suffix: "%",  label: "Client Satisfaction" },
        { target: 5,   suffix: "yr", label: "Years Experience"    },
        { target: 40,  suffix: "+",  label: "AI Models Deployed"  },
      ],
    },

    intro: {
      tag:            "Who We Are",
      headingBefore:  "Where",
      headingGrad:    "Intelligence",
      headingAfter:   "Meets Design Excellence",
      bodyBefore:     "ZynHive is an AI-first digital agency built for the intelligence era. We combine deep LLM expertise with sharp creative vision to build products that don't just work — they",
      bodyAccent:     "think",
      bodyAfter:      ", adapt, and grow with your business.",
      bullets: [
        "Creative designs that tell your brand story",
        "Smart AI-powered technology for business growth",
        "Results-driven marketing & SEO strategies",
        "End-to-end from concept to production launch",
      ],
      stats: [
        { suffix: "+",  label: "Projects"    },
        { suffix: "%",  label: "Satisfaction" },
        { suffix: "yr", label: "Experience"  },
      ],
      centerCard:  "Always Learning",
      centerLabel: "AI Core",
      chips: [
        { label: "LLM Ready",  val: "GPT-4o"  },
        { label: "Accuracy",   val: "97.3%"   },
        { label: "Response",   val: "< 1ms"   },
        { label: "Uptime",     val: "99.9%"   },
      ],
      mobileChips: [
        { label: "LLM Ready", val: "GPT-4o", icon: "🤖" },
        { label: "Accuracy",  val: "97.3%",  icon: "🎯" },
        { label: "Response",  val: "< 1ms",  icon: "⚡" },
        { label: "Uptime",    val: "99.9%",  icon: "🔒" },
      ],
    },

    services: {
      tag:     "What We Build",
      headingBefore: "Services Powered by",
      headingGrad:   "Artificial Intelligence",
      sub:     "Every service we offer is enhanced by AI — from design research to deployment monitoring. One investment that compounds.",
      viewAll: "View All Services",
      badges:  ["GPT-4o Powered", "LangChain", "RAG Pipelines", "Real-time AI", "Custom LLMs"],
      list: [
        {
          id: "s1", emoji: "🤖", color: "#3B6EF8",
          title: "AI Development",
          desc:  "Custom LLM integrations, AI agents, and automation workflows that transform your operations.",
          items: ["LLM Integration", "AI Automation", "Custom Models", "Data Pipelines"],
        },
        {
          id: "s2", emoji: "🌐", color: "#00AACC",
          title: "Web Applications",
          desc:  "Production-grade web apps with modern stacks — fast, scalable, and pixel-perfect.",
          items: ["React / Next.js", "Node.js / Laravel", "Web Portals", "E-Commerce"],
        },
        {
          id: "s3", emoji: "📱", color: "#7B5CFA",
          title: "Mobile Apps",
          desc:  "Cross-platform and native mobile experiences built for performance and delight.",
          items: ["React Native", "Flutter", "iOS & Android", "Enterprise Apps"],
        },
        {
          id: "s4", emoji: "✦", color: "#1A66FF",
          title: "UI/UX Design",
          desc:  "Interfaces that convert. Research-driven design systems rooted in user psychology.",
          items: ["UX Research", "Design Systems", "Prototyping", "Brand Identity"],
        },
        {
          id: "s5", emoji: "📈", color: "#0DBFA8",
          title: "Digital Marketing",
          desc:  "Data-driven campaigns that grow your audience, build trust, and increase revenue.",
          items: ["SEO Strategy", "Social Media", "PPC Campaigns", "Content Marketing"],
        },
        {
          id: "s6", emoji: "⚙️", color: "#4D5BFF",
          title: "Software Consulting",
          desc:  "Architecture audits, IT consulting, and legacy modernisation for growing businesses.",
          items: ["Tech Audits", "IT Consulting", "Legacy Migration", "Cloud Setup"],
        },
      ],
    },

    process: {
      tag:            "How We Work",
      headingBefore:  "A Proven",
      headingGrad:    "5-Step Process",
      sub:            "From first conversation to live product — a clear, collaborative process that keeps you in the loop at every stage.",
      stepOf:         (a: number, total: number) => `Step ${a} of ${total}`,
      steps: [
        {
          step: "01", title: "Discovery & Strategy",
          desc: "Deep-dive into your vision, market, and goals. We map a clear roadmap before a single line of code is written.",
          insight: "We map your competitive landscape, define success metrics, and align on a clear roadmap before a single line of code is written.",
        },
        {
          step: "02", title: "Design & Prototyping",
          desc: "High-fidelity prototypes and design systems that align stakeholders and eliminate rework.",
          insight: "Interactive prototypes let you feel the product early — we iterate fast, validate assumptions, and lock in the vision.",
        },
        {
          step: "03", title: "Development & Build",
          desc: "Agile sprints with weekly demos. Clean, tested, documented code delivered on schedule.",
          insight: "Clean architecture, rigorous code reviews, and modern tooling mean less technical debt from day one.",
        },
        {
          step: "04", title: "Testing & QA",
          desc: "Rigorous quality assurance across browsers, devices and edge cases. Performance, security, accessibility.",
          insight: "Every feature is stress-tested across devices, browsers, and edge cases before it reaches your users.",
        },
        {
          step: "05", title: "Deployment & Launch",
          desc: "CI/CD pipelines, zero-downtime deploys, and a smooth go-live backed by our team.",
          insight: "Zero-downtime deployments, real-time monitoring, and a dedicated support window — so launch day is calm, not chaotic.",
        },
        {
          step: "06", title: "Growth & Support",
          desc: "Post-launch monitoring, iterative improvements, and ongoing partnership to help your product scale.",
          insight: "Ongoing support, performance tuning, and feature roadmap planning — we stay invested in your success.",
        },
      ],
    },

    tech: {
      tag:            "What We Do",
      headingBefore:  "Three Things,",
      headingGrad:    "Done Right",
      sub:            "Automation, digital experiences, and growth — built to work together.",
      toolsLabel:     "tools",
      categories: [
        {
          label: "AI Automations", short: "AI", icon: "🤖",
          description: "N8N, Zapier, chatbots, and custom AI agents that replace repetitive work.",
          note: "Automation-first. Every workflow is built to scale — from simple Zapier triggers to fully custom AI agents.",
        },
        {
          label: "Web & Apps", short: "Web", icon: "💻",
          description: "Fast websites, SaaS dashboards, and mobile apps built for real users.",
          note: "Performance by default. Every site targets sub-1s load times and 90+ Lighthouse scores.",
        },
        {
          label: "Digital Marketing", short: "Marketing", icon: "📈",
          description: "SEO, paid ads, social, and content that drives measurable growth.",
          note: "ROI-focused. Every campaign is tracked end-to-end — from impression to revenue.",
        },
      ],
    },

    testimonials: {
      tag:            "Client Stories",
      headingBefore:  "Trusted by",
      headingGrad:    "Industry Leaders",
      sub:            "Real outcomes. Real companies. Real AI impact.",
      list: [
        {
          id: "t1", initials: "SJ", rating: 5,
          name: "Sarah Johnson", role: "CEO", company: "InnovateX",
          text: "ZynHive exceeded every expectation. Tight process, professional team, and results that speak for themselves. Delivered on time, on budget.",
        },
        {
          id: "t2", initials: "DK", rating: 5,
          name: "David Kim", role: "CTO", company: "NextGen Tech",
          text: "From design to deployment, handled with genuine expertise. The AI integration they built saved us 20 hours per week immediately.",
        },
        {
          id: "t3", initials: "EC", rating: 5,
          name: "Emily Carter", role: "Founder", company: "StartUp Hub",
          text: "They understood our vision perfectly and shipped a product that truly scales. Not just developers — strategic partners.",
        },
        {
          id: "t4", initials: "MR", rating: 5,
          name: "Michael Rodriguez", role: "Product Director", company: "TechVision",
          text: "Technical depth and attention to detail are rare. Their solution impresses both our users and our investors.",
        },
        {
          id: "t5", initials: "JT", rating: 5,
          name: "Jessica Taylor", role: "Operations Lead", company: "ScaleFast",
          text: "Genuinely collaborative. They helped us pivot fast when market conditions shifted — felt like our in-house team.",
        },
        {
          id: "t6", initials: "AK", rating: 5,
          name: "Ahmed Khan", role: "CEO", company: "LaunchPad",
          text: "Best investment we made. The website ZynHive built tripled our leads in 60 days. The SEO alone paid for the whole project.",
        },
      ],
    },

    cta: {
      badge:          "AI Systems Ready · Let's Build",
      headingBefore:  "Ready to",
      headingGrad:    "Transform",
      headingAfter:   "Your Business with AI?",
      body:           "One conversation. We'll map where AI creates the most leverage in your business and hand you a concrete plan — no fluff, no jargon, no sales pitch.",
      chatBtn:        "Chat on WhatsApp",
      messageBtn:     "Send a Message →",
      trust: [
        { icon: "🔒", text: "No lock-in contracts" },
        { icon: "⚡", text: "48hr response time"   },
        { icon: "🤖", text: "Free AI audit call"   },
        { icon: "📄", text: "NDA on request"       },
      ],
    },
  },

  // ── Swedish ──────────────────────────────────────────────────────────────────
  sv: {
    nav: {
      links: [
        { label: "Hem",       href: "/" },
        { label: "Tjänster",  href: "/services" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Om oss",    href: "/about" },
        { label: "Team",      href: "/team" },
        { label: "Kontakt",   href: "/contact" },
      ],
      hireUs:       "Anlita oss",
      chatWhatsapp: "Chatta på WhatsApp — Anlita oss",
    },

    hero: {
      available:  "Tillgänglig för projekt",
      weBuilt:    "Vi bygger",
      thatScale:  "Som skalar.",
      words: [
        "AI-lösningar", "Webbappar", "Mobilappar", "Digital tillväxt",
        "UI/UX Design", "RAG-pipelines", "AI-agenter", "SaaS-produkter",
      ],
      subBefore:   "Från",
      subCyan:     "LLM-finjustering",
      subMid:      "till pixelperfekta gränssnitt — vi utvecklar AI-produkter som automatiserar arbetsflöden, glädjer användare och genererar intäkter. Baserade i Lahore.",
      subAfter:    "Global leverans.",
      exploreServices: "Utforska tjänster",
      letsTalk:        "Låt oss prata",
      scroll:          "Scrolla",
      liveMetrics:     "Livedata",
      aiPipeline:      "AI-pipeline · produktion",
      productionLive:  "Produktion live",
      lahoreHQ:        "Lahore HK",
      support247:      "24/7 support",
      stats: [
        { target: 120, suffix: "+",  label: "Levererade projekt"    },
        { target: 98,  suffix: "%",  label: "Kundnöjdhet"           },
        { target: 5,   suffix: "yr", label: "Års erfarenhet"        },
        { target: 40,  suffix: "+",  label: "AI-modeller driftsatta" },
      ],
    },

    intro: {
      tag:            "Vilka vi är",
      headingBefore:  "Där",
      headingGrad:    "intelligens",
      headingAfter:   "möter designexcellens",
      bodyBefore:     "ZynHive är en AI-first digital byrå byggd för intelligensåldern. Vi kombinerar djup LLM-expertis med skarp kreativ vision för att bygga produkter som inte bara fungerar — de",
      bodyAccent:     "tänker",
      bodyAfter:      ", anpassar sig och växer med ditt företag.",
      bullets: [
        "Kreativa designer som berättar ditt varumärkes historia",
        "Smart AI-driven teknologi för företagstillväxt",
        "Resultatdriven marknadsföring & SEO-strategier",
        "Heltäckande från koncept till produktionslansering",
      ],
      stats: [
        { suffix: "+",  label: "Projekt"    },
        { suffix: "%",  label: "Nöjdhet"    },
        { suffix: "yr", label: "Erfarenhet" },
      ],
      centerCard:  "Alltid lärande",
      centerLabel: "AI-kärna",
      chips: [
        { label: "LLM-redo",       val: "GPT-4o"  },
        { label: "Träffsäkerhet",  val: "97,3%"   },
        { label: "Svarstid",       val: "< 1ms"   },
        { label: "Drifttid",       val: "99,9%"   },
      ],
      mobileChips: [
        { label: "LLM-redo",      val: "GPT-4o", icon: "🤖" },
        { label: "Träffsäkerhet", val: "97,3%",  icon: "🎯" },
        { label: "Svarstid",      val: "< 1ms",  icon: "⚡" },
        { label: "Drifttid",      val: "99,9%",  icon: "🔒" },
      ],
    },

    services: {
      tag:            "Vad vi bygger",
      headingBefore:  "Tjänster drivna av",
      headingGrad:    "artificiell intelligens",
      sub:            "Varje tjänst vi erbjuder är förstärkt med AI — från designforskning till driftsättningsövervakning. En investering som förnyas.",
      viewAll:        "Visa alla tjänster",
      badges:         ["GPT-4o driven", "LangChain", "RAG-pipelines", "Realtids-AI", "Anpassade LLM:er"],
      list: [
        {
          id: "s1", emoji: "🤖", color: "#3B6EF8",
          title: "AI-utveckling",
          desc:  "Anpassade LLM-integrationer, AI-agenter och automatiseringsarbetsflöden som transformerar din verksamhet.",
          items: ["LLM-integration", "AI-automation", "Anpassade modeller", "Datapipelines"],
        },
        {
          id: "s2", emoji: "🌐", color: "#00AACC",
          title: "Webbapplikationer",
          desc:  "Produktionsklara webbappar med moderna stackar — snabba, skalbara och pixelperfekta.",
          items: ["React / Next.js", "Node.js / Laravel", "Webbportaler", "E-handel"],
        },
        {
          id: "s3", emoji: "📱", color: "#7B5CFA",
          title: "Mobilappar",
          desc:  "Plattformsoberoende och nativa mobilupplevelser byggda för prestanda och glädje.",
          items: ["React Native", "Flutter", "iOS & Android", "Företagsappar"],
        },
        {
          id: "s4", emoji: "✦", color: "#1A66FF",
          title: "UI/UX Design",
          desc:  "Gränssnitt som konverterar. Forskningsdrivna designsystem rotade i användarpsykologi.",
          items: ["UX-forskning", "Designsystem", "Prototypning", "Varumärkesidentitet"],
        },
        {
          id: "s5", emoji: "📈", color: "#0DBFA8",
          title: "Digital marknadsföring",
          desc:  "Datadrivna kampanjer som ökar din publik, bygger förtroende och ökar intäkterna.",
          items: ["SEO-strategi", "Sociala medier", "PPC-kampanjer", "Innehållsmarknadsföring"],
        },
        {
          id: "s6", emoji: "⚙️", color: "#4D5BFF",
          title: "Programvarukonsulting",
          desc:  "Arkitekturgranskning, IT-konsulting och legacy-modernisering för växande företag.",
          items: ["Teknikgranskningar", "IT-konsulting", "Legacy-migrering", "Molnkonfiguration"],
        },
      ],
    },

    process: {
      tag:            "Hur vi jobbar",
      headingBefore:  "En beprövad",
      headingGrad:    "5-stegsprocess",
      sub:            "Från första samtal till levande produkt — en tydlig, samarbetsinriktad process som håller dig informerad i varje steg.",
      stepOf:         (a: number, total: number) => `Steg ${a} av ${total}`,
      steps: [
        {
          step: "01", title: "Upptäckt & Strategi",
          desc: "Vi dyker djupt in i din vision, marknad och dina mål. Vi kartlägger en tydlig färdplan innan en enda rad kod skrivs.",
          insight: "Vi kartlägger ditt konkurrenslandskap, definierar framgångsmått och alignar på en tydlig färdplan innan en enda rad kod skrivs.",
        },
        {
          step: "02", title: "Design & Prototypning",
          desc: "Högupplösta prototyper och designsystem som alignar intressenter och eliminerar omarbetning.",
          insight: "Interaktiva prototyper låter dig känna produkten tidigt — vi itererar snabbt, validerar antaganden och låser in visionen.",
        },
        {
          step: "03", title: "Utveckling & Byggande",
          desc: "Agila sprintar med veckovisa demos. Ren, testad, dokumenterad kod levererad i tid.",
          insight: "Ren arkitektur, rigorösa kodgranskningar och moderna verktyg innebär mindre teknisk skuld från dag ett.",
        },
        {
          step: "04", title: "Testning & QA",
          desc: "Rigorös kvalitetssäkring över webbläsare, enheter och edge-cases. Prestanda, säkerhet, tillgänglighet.",
          insight: "Varje funktion stresstestas över enheter, webbläsare och edge-cases innan den når dina användare.",
        },
        {
          step: "05", title: "Driftsättning & Lansering",
          desc: "CI/CD-pipelines, noll-nedtid driftsättningar och en smidig lansering backat av vårt team.",
          insight: "Noll-nedtid driftsättningar, realtidsövervakning och ett dedikerat supportfönster — så att lanseringsdagen är lugn, inte kaotisk.",
        },
        {
          step: "06", title: "Tillväxt & Support",
          desc: "Övervakning efter lansering, iterativa förbättringar och löpande partnerskap för att hjälpa din produkt att skala.",
          insight: "Löpande support, prestandaoptimering och funktionsplanering — vi förblir investerade i din framgång.",
        },
      ],
    },

    tech: {
      tag:            "Vad vi gör",
      headingBefore:  "Tre saker,",
      headingGrad:    "rätt gjorda",
      sub:            "Automation, digitala upplevelser och tillväxt — byggda för att fungera tillsammans.",
      toolsLabel:     "verktyg",
      categories: [
        {
          label: "AI-automatisering", short: "AI", icon: "🤖",
          description: "N8N, Zapier, chatbotar och anpassade AI-agenter som ersätter repetitivt arbete.",
          note: "Automation-först. Varje arbetsflöde är byggt för att skala — från enkla Zapier-triggers till fullt anpassade AI-agenter.",
        },
        {
          label: "Webb & Appar", short: "Webb", icon: "💻",
          description: "Snabba webbplatser, SaaS-dashboards och mobilappar byggda för riktiga användare.",
          note: "Prestanda som standard. Varje sajt siktar på sub-1s laddningstider och 90+ Lighthouse-poäng.",
        },
        {
          label: "Digital marknadsföring", short: "Marknadsföring", icon: "📈",
          description: "SEO, betalda annonser, sociala medier och innehåll som driver mätbar tillväxt.",
          note: "ROI-fokuserat. Varje kampanj spåras end-to-end — från visning till intäkt.",
        },
      ],
    },

    testimonials: {
      tag:            "Kundberättelser",
      headingBefore:  "Betrodd av",
      headingGrad:    "branschledare",
      sub:            "Verkliga resultat. Verkliga företag. Verklig AI-påverkan.",
      list: [
        {
          id: "t1", initials: "SJ", rating: 5,
          name: "Sarah Johnson", role: "VD", company: "InnovateX",
          text: "ZynHive överträffade alla förväntningar. Strikt process, professionellt team och resultat som talar för sig själva. Levererade i tid och inom budget.",
        },
        {
          id: "t2", initials: "DK", rating: 5,
          name: "David Kim", role: "CTO", company: "NextGen Tech",
          text: "Från design till driftsättning, hanterat med verklig expertis. AI-integrationen de byggde sparade oss 20 timmar per vecka direkt.",
        },
        {
          id: "t3", initials: "EC", rating: 5,
          name: "Emily Carter", role: "Grundare", company: "StartUp Hub",
          text: "De förstod vår vision perfekt och levererade en produkt som verkligen skalar. Inte bara utvecklare — strategiska partners.",
        },
        {
          id: "t4", initials: "MR", rating: 5,
          name: "Michael Rodriguez", role: "Produktdirektör", company: "TechVision",
          text: "Tekniskt djup och uppmärksamhet på detaljer är sällsynt. Deras lösning imponerar på både våra användare och investerare.",
        },
        {
          id: "t5", initials: "JT", rating: 5,
          name: "Jessica Taylor", role: "Driftschef", company: "ScaleFast",
          text: "Genuint samarbetsinriktat. De hjälpte oss att snabbt anpassa oss när marknadsförhållandena förändrades — kändes som vårt interna team.",
        },
        {
          id: "t6", initials: "AK", rating: 5,
          name: "Ahmed Khan", role: "VD", company: "LaunchPad",
          text: "Bästa investeringen vi gjorde. Webbplatsen ZynHive byggde tredubblat våra leads på 60 dagar. SEO ensamt betalade hela projektet.",
        },
      ],
    },

    cta: {
      badge:          "AI-system redo · Låt oss bygga",
      headingBefore:  "Redo att",
      headingGrad:    "transformera",
      headingAfter:   "ditt företag med AI?",
      body:           "Ett samtal. Vi kartlägger var AI skapar mest hävstång i din verksamhet och ger dig en konkret plan — inget fluff, inga buzzwords, ingen försäljningspitch.",
      chatBtn:        "Chatta på WhatsApp",
      messageBtn:     "Skicka ett meddelande →",
      trust: [
        { icon: "🔒", text: "Inga bindande avtal"        },
        { icon: "⚡", text: "48h svarstid"               },
        { icon: "🤖", text: "Gratis AI-granskningssamtal" },
        { icon: "📄", text: "NDA på begäran"             },
      ],
    },
  },
} as const;

export type Translations = typeof translations["en"];
