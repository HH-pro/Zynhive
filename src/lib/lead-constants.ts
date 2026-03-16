// ─── src/lib/lead-constants.ts ───────────────────────────────────────────────
// All static config for the follow-up pipeline, status colors, templates, etc.

import type { FollowUpStep, LeadStatus, LeadSource } from "../types/leads";

// ── Follow-up sequence ────────────────────────────────────────────────────────
export const FOLLOW_UP_SEQUENCE: FollowUpStep[] = [
  { key: "initial",    label: "Initial Email",      daysAfter: 0 },
  { key: "followup-1", label: "Follow-up 1",        daysAfter: 5 },
  { key: "followup-2", label: "Follow-up 2",        daysAfter: 7 },
  { key: "followup-3", label: "Follow-up 3",        daysAfter: 5 },
  { key: "followup-4", label: "Follow-up 4",        daysAfter: 7 },
  { key: "followup-5", label: "Follow-up 5 (Final)", daysAfter: 7 },
];

// ── Status colors (matches your existing CSS vars aesthetic) ──────────────────
export const STATUS_COLORS: Record<
  LeadStatus,
  { bg: string; text: string; border: string }
> = {
  new:              { bg: "rgba(59,110,248,0.08)",  text: "#7dd3fc", border: "rgba(59,110,248,0.2)" },
  audited:          { bg: "rgba(13,191,168,0.08)",  text: "#5eead4", border: "rgba(13,191,168,0.2)" },
  initial:          { bg: "rgba(34,197,94,0.08)",   text: "#86efac", border: "rgba(34,197,94,0.2)" },
  "followup-1":     { bg: "rgba(245,158,11,0.08)",  text: "#fde68a", border: "rgba(245,158,11,0.2)" },
  "followup-2":     { bg: "rgba(239,68,68,0.08)",   text: "#fca5a5", border: "rgba(239,68,68,0.2)" },
  "followup-3":     { bg: "rgba(123,92,250,0.08)",  text: "#d8b4fe", border: "rgba(123,92,250,0.2)" },
  "followup-4":     { bg: "rgba(6,182,212,0.08)",   text: "#67e8f9", border: "rgba(6,182,212,0.2)" },
  "followup-5":     { bg: "rgba(252,211,77,0.08)",  text: "#fcd34d", border: "rgba(252,211,77,0.2)" },
  completed:        { bg: "rgba(34,197,94,0.08)",   text: "#4ade80", border: "rgba(34,197,94,0.25)" },
  "not-interested": { bg: "rgba(107,114,128,0.08)", text: "#9ca3af", border: "rgba(107,114,128,0.2)" },
};

// ── Lead sources ──────────────────────────────────────────────────────────────
export const LEAD_SOURCES: LeadSource[] = [
  "Google Maps",
  "Instagram",
  "LinkedIn",
  "Website",
  "Manual",
  "AI Search",
];

// ── Default categories (user can add more) ────────────────────────────────────
export const DEFAULT_CATEGORIES = [
  "Real Estate UK",
  "Real Estate US",
  "Dental Clinics",
  "Restaurants",
  "E-commerce",
  "SaaS Companies",
  "Marketing Agencies",
  "Law Firms",
  "Fitness Studios",
  "Custom",
];

// ── AI prompts for email generation ───────────────────────────────────────────
export const AI_EMAIL_SYSTEM_PROMPT = `You are a professional B2B cold email copywriter. 
You write personalized, concise outreach emails for a company that sells:
- AI chatbots for websites
- Quick-response / lead-capture systems  
- Customer query automation

Rules:
1. Keep emails under 150 words
2. Be conversational, not salesy
3. Reference specific issues found on their website
4. Include a clear, low-commitment CTA
5. Never use spammy language or ALL CAPS
6. Personalize using the lead's business name, website, and audit findings
7. Return ONLY valid JSON: { "subject": "...", "body": "..." }`;

export const AI_AUDIT_SYSTEM_PROMPT = `You are a website auditor AI. Given a business website URL, 
analyze it for the following:
1. Does it have a chatbot or live chat widget?
2. Does it have quick response / auto-reply capability?
3. Does it have a lead capture form?
4. Is it mobile optimized?

Provide a JSON response ONLY:
{
  "hasChatbot": boolean,
  "hasQuickResponse": boolean,
  "hasLeadForm": boolean,
  "hasMobileOptimized": boolean,
  "summary": "2-3 sentence summary of findings",
  "missingFeatures": ["list", "of", "missing", "features"],
  "score": number (0-100)
}`;
