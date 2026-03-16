// ─── src/types/leads.ts ──────────────────────────────────────────────────────
// Single source of truth for all lead types

export type FollowUpKey =
  | "initial"
  | "followup-1"
  | "followup-2"
  | "followup-3"
  | "followup-4"
  | "followup-5";

export interface MailEntry {
  date: string;
  type: FollowUpKey | string;
  status: "sent" | "failed" | "pending";
  subject?: string;
  bodySnapshot?: string;
}

export interface AuditResult {
  hasChatbot: boolean;
  hasQuickResponse: boolean;
  hasLeadForm: boolean;
  hasMobileOptimized: boolean;
  summary: string;
  missingFeatures: string[];
  score: number;
}

// FirestoreLead = what gets stored in Firestore
export interface FirestoreLead {
  id?: string;
  companyName: string;
  email: string;
  phone: string;
  whatsapp: string;
  hasWhatsapp: boolean;
  website: string;
  socialLinks: string;
  proposal: string;
  imageUrl: string;
  imagePublicId: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "closed" | "lost";
  priority: "high" | "medium" | "low";
  employeeName: string;
  employeeId: string;
  leadSource: string;
  leadScore: number;
  country: string;
  city: string;
  tags: string[];
  notes: { text: string; date: string; employeeName: string }[];
  followUpDate: string | null;
  followUpCount: number;
  lastContacted: string | null;
  createdAt?: string;
  updatedAt?: string;
  // AI fields (stored in Firestore as-is)
  mailHistory?: MailEntry[];
  auditData?: AuditResult;
}