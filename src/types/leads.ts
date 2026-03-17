// ─── src/types/leads.ts ──────────────────────────────────────────────────────
// Single source of truth for all lead-related types.
// firebase.ts imports FirestoreLead from HERE — not the other way around.

import type { Timestamp } from "firebase/firestore";

// ── Email follow-up sequence keys ────────────────────────────────────────────

export type FollowUpKey =
  | "initial"
  | "followup-1"
  | "followup-2"
  | "followup-3"
  | "followup-4"
  | "followup-5";

// ── Mail history entry ────────────────────────────────────────────────────────

export interface MailEntry {
  date:          string;                         // ISO date string "YYYY-MM-DD"
  type:          FollowUpKey | string;
  status:        "sent" | "failed" | "pending";
  subject?:      string;
  bodySnapshot?: string;
}

// ── AI website audit result ───────────────────────────────────────────────────

export interface AuditResult {
  hasChatbot:         boolean;
  hasQuickResponse:   boolean;
  hasLeadForm:        boolean;
  hasMobileOptimized: boolean;
  summary:            string;
  missingFeatures:    string[];
  score:              number;
}

// ── Follow-up step shape ──────────────────────────────────────────────────────
// Defined here so lead-constants.ts can import it without a circular dep
export interface FollowUpStep {
  key:       FollowUpKey;
  label:     string;
  daysAfter: number;
}

// ── Main lead document — stored in Firestore ──────────────────────────────────
// createdAt / updatedAt come back as Firestore Timestamp from the server,
// but we always .toDate().toISOString() them before storing in React state,
// so we accept both here for compatibility.

export interface FirestoreLead {
  id?:              string;           // Firestore document ID (set after fetch)

  // ── Core contact info ──────────────────────────────────────────────────────
  companyName:      string;
  email:            string;
  phone:            string;
  whatsapp:         string;
  hasWhatsapp:      boolean;
  website:          string;
  socialLinks:      string;

  // ── CRM fields ─────────────────────────────────────────────────────────────
  proposal:         string;           // notes / proposal text
  imageUrl:         string;
  imagePublicId:    string;
  status:           "new" | "contacted" | "qualified" | "proposal" | "closed" | "lost";
  priority:         "high" | "medium" | "low";
  employeeName:     string;
  employeeId:       string;
  leadSource:       string;
  leadScore:        number;
  country:          string;
  city:             string;
  tags:             string[];
  notes:            { text: string; date: string; employeeName: string }[];
  followUpDate:     string | null;
  followUpCount:    number;
  lastContacted:    string | null;

  // ── Timestamps — Firestore returns Timestamp; we serialize to string ───────
  createdAt?:       string | Timestamp;
  updatedAt?:       string | Timestamp;

  // ── AI-managed fields ──────────────────────────────────────────────────────
  // These are optional so existing documents without them still type-check.
  mailHistory?:     MailEntry[];
  auditData?:       AuditResult;
}

// ── Convenience type for Firestore update payloads ───────────────────────────
// Omit server-managed fields so callers can't accidentally overwrite them.
export type LeadUpdate = Partial<
  Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">
>;

// ── Convenience type for creating a new lead ─────────────────────────────────
export type NewLead = Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">;