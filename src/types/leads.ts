// ─── src/lib/types.ts ────────────────────────────────────────────────────────
// Local (non-Firestore) types used by pages and components.
// These are the "display" shapes after normalising from Firestore docs.

// ── Project ───────────────────────────────────────────────────────────────────
export interface Project {
  id:          string;
  title:       string;
  category:    string;
  tags:        string[];
  description: string;
  result:      string;
  emoji:       string;
  color:       string;
  featured:    boolean;
  imageUrl:    string;
  liveUrl:     string;
  githubUrl:   string;
}

// ── TeamMember ────────────────────────────────────────────────────────────────
export interface TeamMember {
  id:       string;
  name:     string;
  role:     string;
  bio:      string;
  initials: string;
  color:    string;
  imageUrl: string;
  socials:  {
    linkedin:  string;
    twitter:   string;
    github:    string;
    instagram: string;
  };
}

// ── Service (used by ServicesPage / ServiceCard) ───────────────────────────────
export interface Service {
  id:          string;
  title:       string;
  description: string;
  icon:        string;        // emoji or SVG string
  color:       string;
  features:    string[];
  cta?:        string;
}