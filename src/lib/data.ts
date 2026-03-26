import type {
  Service, Project, TeamMember, Testimonial, ProcessStep, NavLink, StatItem,
} from "./types";

// ─── Config ───────────────────────────────────────────────────────────────────
export const SITE_CONFIG = {
  name:        "ZynHive",
  tagline:     "We Build Digital Experiences That Scale.",
  description: "Full-service AI & software agency. From concept to production — we build digital products that win markets.",
  email:       "hello@zynhive.com",
  phone:       "+92 343 4783677",
  whatsapp:    "https://wa.me/923434783677",
  location:    "Lahore, Pakistan",
  established: "2024",
};

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_LINKS: NavLink[] = [
  { label: "Home",      href: "/"          },
  { label: "Services",  href: "/services"  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About",     href: "/about"     },
  { label: "Team",      href: "/team"      },
  { label: "Contact",   href: "/contact"   },
];

// ─── Hero ─────────────────────────────────────────────────────────────────────
export const HERO_WORDS = [
  "AI Solutions", "Web Apps", "Mobile Apps", "Digital Growth", "UI/UX Design",
];

export const HERO_STATS: StatItem[] = [
  { target: 120, suffix: "+",  label: "Projects Delivered"  },
  { target: 98,  suffix: "%",  label: "Client Satisfaction" },
  { target: 5,   suffix: "yr", label: "Years Experience"    },
];

// ─── Marquee ──────────────────────────────────────────────────────────────────
export const MARQUEE_ITEMS = [
  "AI Development", "Web Applications", "Mobile Apps", "UI/UX Design",
  "Digital Marketing", "SEO Optimization", "Custom Software", "Cloud Solutions", "E-Commerce",
];

// ─── Services  (navy-family accent colors) ────────────────────────────────────
export const SERVICES: Service[] = [
  {
    id: "s1", emoji: "🤖", color: "#3B6EF8",   // electric blue
    title: "AI Development",
    desc:  "Custom LLM integrations, AI agents, and automation workflows that transform your operations.",
    items: ["LLM Integration", "AI Automation", "Custom Models", "Data Pipelines"],
  },
  {
    id: "s2", emoji: "🌐", color: "#00AACC",   // teal-cyan
    title: "Web Applications",
    desc:  "Production-grade web apps with modern stacks — fast, scalable, and pixel-perfect.",
    items: ["React / Next.js", "Node.js / Laravel", "Web Portals", "E-Commerce"],
  },
  {
    id: "s3", emoji: "📱", color: "#7B5CFA",   // indigo-violet
    title: "Mobile Apps",
    desc:  "Cross-platform and native mobile experiences built for performance and delight.",
    items: ["React Native", "Flutter", "iOS & Android", "Enterprise Apps"],
  },
  {
    id: "s4", emoji: "✦",  color: "#1A66FF",   // royal blue
    title: "UI/UX Design",
    desc:  "Interfaces that convert. Research-driven design systems rooted in user psychology.",
    items: ["UX Research", "Design Systems", "Prototyping", "Brand Identity"],
  },
  {
    id: "s5", emoji: "📈", color: "#0DBFA8",   // teal-green
    title: "Digital Marketing",
    desc:  "Data-driven campaigns that grow your audience, build trust, and increase revenue.",
    items: ["SEO Strategy", "Social Media", "PPC Campaigns", "Content Marketing"],
  },
  {
    id: "s6", emoji: "⚙️",  color: "#4D5BFF",   // periwinkle
    title: "Software Consulting",
    desc:  "Architecture audits, IT consulting, and legacy modernisation for growing businesses.",
    items: ["Tech Audits", "IT Consulting", "Legacy Migration", "Cloud Setup"],
  },
];

// ─── Portfolio Projects (navy-blue accent colors) ─────────────────────────────
export const PROJECTS: Project[] = [
  {
    id: "p1", emoji: "🤖", color: "#3B6EF8", featured: true,
    title: "NeuralDesk AI",
    category: "AI Development",
    tags: ["LLM", "React", "Python"],
    description: "Enterprise AI assistant platform with custom LLM fine-tuning, multi-modal inputs, and real-time analytics dashboard.",
    result: "Reduced support tickets by 68%",
  },
  {
    id: "p2", emoji: "🛒", color: "#00AACC", featured: true,
    title: "Mercado E-Commerce",
    category: "Web Application",
    tags: ["Next.js", "Stripe", "Postgres"],
    description: "Full-stack e-commerce platform for a fashion brand with AI-powered recommendations and real-time inventory.",
    result: "$2.4M GMV in first 90 days",
  },
  {
    id: "p3", emoji: "📱", color: "#7B5CFA", featured: true,
    title: "Vivo Health App",
    category: "Mobile App",
    tags: ["React Native", "Firebase", "ML"],
    description: "AI-powered fitness and wellness app with personalized coaching, biometric tracking, and community features.",
    result: "140K downloads in 6 months",
  },
  {
    id: "p4", emoji: "🏦", color: "#1A66FF",
    title: "FinFlow Dashboard",
    category: "Web Application",
    tags: ["React", "Node.js", "PostgreSQL"],
    description: "Real-time financial operations dashboard for a fintech startup handling $50M+ monthly transactions.",
    result: "99.99% uptime, 0 data breaches",
  },
  {
    id: "p5", emoji: "🎨", color: "#4D5BFF",
    title: "Cura Design System",
    category: "UI/UX Design",
    tags: ["Figma", "React", "Storybook"],
    description: "Comprehensive design system for a healthcare SaaS — 200+ components, full accessibility compliance.",
    result: "40% faster dev cycles",
  },
  {
    id: "p6", emoji: "🚀", color: "#0DBFA8",
    title: "LaunchPad SEO Suite",
    category: "Digital Marketing",
    tags: ["SEO", "Analytics", "Content"],
    description: "Full-stack SEO and content strategy overhaul for a B2B SaaS, including technical audit and backlink campaigns.",
    result: "312% organic traffic growth",
  },
];

// ─── Process ──────────────────────────────────────────────────────────────────
export const PROCESS_STEPS: ProcessStep[] = [
  { step: "01", title: "Discovery & Strategy",  desc: "Deep-dive into your vision, market, and goals. We map a clear roadmap before a single line of code is written." },
  { step: "02", title: "Design & Prototyping",  desc: "High-fidelity prototypes and design systems that align stakeholders and eliminate rework." },
  { step: "03", title: "Development & Build",   desc: "Agile sprints with weekly demos. Clean, tested, documented code delivered on schedule." },
  { step: "04", title: "Testing & QA",          desc: "Rigorous quality assurance across browsers, devices and edge cases. Performance, security, accessibility." },
  { step: "05", title: "Deployment & Launch",   desc: "CI/CD pipelines, zero-downtime deploys, and a smooth go-live backed by our team." },
];

// ─── Team  (navy-blue avatar colors) ─────────────────────────────────────────
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm1", initials: "ZA", color: "#3B6EF8",
    name: "Zain Ahmed", role: "CEO & Founder",
    bio: "Visionary technologist with 8+ years building AI-first products for Fortune 500 companies. Previously led engineering at two successful exits.",
    socials: { linkedin: "#", twitter: "#", github: "#" },
  },
  {
    id: "tm2", initials: "SR", color: "#00AACC",
    name: "Sara Raza", role: "Head of Design",
    bio: "Award-winning UX architect who has shipped products used by 10M+ users. She believes design is the ultimate business differentiator.",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    id: "tm3", initials: "HK", color: "#7B5CFA",
    name: "Hamza Khan", role: "Lead Engineer",
    bio: "Full-stack architect specializing in high-performance systems. Core contributor to 3 open-source projects with 8K+ stars.",
    socials: { linkedin: "#", github: "#" },
  },
  {
    id: "tm4", initials: "AM", color: "#1A66FF",
    name: "Ayesha Malik", role: "AI/ML Engineer",
    bio: "PhD in Machine Learning. Designed custom LLM pipelines deployed at scale across healthcare, finance, and legal sectors.",
    socials: { linkedin: "#", github: "#" },
  },
  {
    id: "tm5", initials: "OU", color: "#4D5BFF",
    name: "Omar Ullah", role: "Mobile Lead",
    bio: "Cross-platform specialist with 50+ apps shipped. Passionate about performance, accessibility, and delightful micro-interactions.",
    socials: { linkedin: "#", github: "#" },
  },
  {
    id: "tm6", initials: "FN", color: "#0DBFA8",
    name: "Fatima Noor", role: "Growth Director",
    bio: "Performance marketing strategist who has generated $20M+ in attributable revenue. Data obsessed, creativity fueled.",
    socials: { linkedin: "#", twitter: "#" },
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export const TESTIMONIALS: Testimonial[] = [
  { id: "t1", initials: "SJ", rating: 5, name: "Sarah Johnson",     role: "CEO",              company: "InnovateX",    text: "ZynHive exceeded every expectation. Tight process, professional team, and results that speak for themselves. Delivered on time, on budget." },
  { id: "t2", initials: "DK", rating: 5, name: "David Kim",         role: "CTO",              company: "NextGen Tech", text: "From design to deployment, handled with genuine expertise. The AI integration they built saved us 20 hours per week immediately." },
  { id: "t3", initials: "EC", rating: 5, name: "Emily Carter",      role: "Founder",          company: "StartUp Hub",  text: "They understood our vision perfectly and shipped a product that truly scales. Not just developers — strategic partners." },
  { id: "t4", initials: "MR", rating: 5, name: "Michael Rodriguez", role: "Product Director", company: "TechVision",   text: "Technical depth and attention to detail are rare. Their solution impresses both our users and our investors." },
  { id: "t5", initials: "JT", rating: 5, name: "Jessica Taylor",    role: "Operations Lead",  company: "ScaleFast",    text: "Genuinely collaborative. They helped us pivot fast when market conditions shifted — felt like our in-house team." },
  { id: "t6", initials: "AK", rating: 5, name: "Ahmed Khan",        role: "CEO",              company: "LaunchPad",    text: "Best investment we made. The website ZynHive built tripled our leads in 60 days. The SEO alone paid for the whole project." },
];

// ─── Tech Stack ───────────────────────────────────────────────────────────────
export const TECH_STACK = [
  "React.js", "Next.js", "TypeScript", "Node.js", "Python", "Laravel",
  "Flutter", "React Native", "Firebase", "Supabase", "PostgreSQL", "MongoDB",
  "AWS", "Vercel", "Tailwind CSS", "Figma", "WordPress", "Shopify",
  "OpenAI API", "LangChain", "Stripe", "Docker", "Redis", "GitHub Actions",
];

// ─── Footer ───────────────────────────────────────────────────────────────────
export const FOOTER_COLS: Record<string, string[]> = {
  Services: ["AI Development", "Web Applications", "Mobile Apps", "UI/UX Design", "Digital Marketing"],
  Company:  ["About Us", "Our Work", "Blog", "Careers", "Contact"],
};

export const SOCIAL_HANDLES = ["Li", "Tw", "Gh", "Ig"] as const;

// ─── Intro bullets ────────────────────────────────────────────────────────────
export const INTRO_BULLETS = [
  "Creative designs that tell your brand story",
  "Smart AI-powered technology for business growth",
  "Results-driven marketing & SEO strategies",
  "End-to-end from concept to production launch",
];
// ─── Tech Stack (categorized) ─────────────────────────────────────────────────
export const TECH_STACK_AI = [
  "OpenAI API", "LangChain", "Python", "TensorFlow", "Hugging Face",
  "LlamaIndex", "Pinecone", "Whisper", "Stable Diffusion", "AutoGPT",
];

export const TECH_STACK_WEB = [
  "React.js", "Next.js", "TypeScript", "Node.js", "Laravel",
  "Tailwind CSS", "PostgreSQL", "MongoDB", "Supabase", "Stripe",
  "Flutter", "React Native", "Firebase", "Figma", "Shopify",
];

export const TECH_STACK_INFRA = [
  "AWS", "Vercel", "Docker", "Redis", "GitHub Actions",
  "Nginx", "Cloudflare", "Supabase", "CI/CD", "Linux VPS",
];