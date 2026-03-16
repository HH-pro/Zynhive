// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Service {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  items: string[];
  color: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  result: string;
  emoji: string;
  color: string;
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
  socials: { linkedin?: string; twitter?: string; github?: string };
}

export interface Testimonial {
  id: string;
  initials: string;
  name: string;
  role: string;
  company: string;
  text: string;
  rating: number;
}

export interface ProcessStep {
  step: string;
  title: string;
  desc: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface StatItem {
  target: number;
  suffix: string;
  label: string;
}
