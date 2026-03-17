// ─── src/hooks/useLeads.ts ───────────────────────────────────────────────────
import { useState, useEffect, useCallback, useMemo } from "react";
// FirestoreLead is the single source of truth — always import from types/leads
import type { FirestoreLead, NewLead, AuditResult, FollowUpKey, MailEntry } from "../types/leads";
import { FOLLOW_UP_SEQUENCE } from "../lib/lead-constants";
import {
  fetchLeads, addLead, addLeadsBatch,
  deleteLead, deleteLeadsBatch,
  recordEmailSent, recordBatchEmailsSent, updateLeadAudit,
} from "../lib/lead-firebase";
import { auditWebsite, generateEmail, generateBatchEmails } from "../lib/lead-ai";

// ── Derived types — no phantom imports ───────────────────────────────────────
// LeadStatus and Lead are not exported from types/leads — derive from FirestoreLead
type LeadStatus = FirestoreLead["status"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

// Safe accessor — mailHistory is optional on FirestoreLead
function getMailHistory(lead: FirestoreLead): MailEntry[] {
  return lead.mailHistory ?? [];
}

export interface DueFollowUp {
  lead:               FirestoreLead;
  nextStep:           typeof FOLLOW_UP_SEQUENCE[number];
  daysSinceLastEmail: number;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLeads(
  showToast: (msg: string, type?: "success" | "error") => void,
) {
  const [leads,        setLeads]        = useState<FirestoreLead[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [aiLoading,    setAiLoading]    = useState<string | null>(null);

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchLeads();
      setLeads(data);
    } catch {
      showToast("Failed to load leads", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const q            = search.toLowerCase();
      const matchSearch  = !q
        || l.companyName.toLowerCase().includes(q)
        || l.email.toLowerCase().includes(q)
        || (l.leadSource ?? "").toLowerCase().includes(q)
        || l.tags?.some((t) => t.toLowerCase().includes(q));
      const matchStatus  = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total           = leads.length;
    const totalEmailsSent = leads.reduce((a, l) => a + getMailHistory(l).length, 0);
    const dueList         = getDueFollowUps(leads);

    const byStatus = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});

    // leadSource replaces old lead.source
    const bySource = leads.reduce<Record<string, number>>((acc, l) => {
      const src = l.leadSource || "Unknown";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    }, {});

    return { total, totalEmailsSent, dueFollowUps: dueList.length, byStatus, bySource };
  }, [leads]);

  // ── Selection — FirestoreLead has no `selected` field; track externally ─────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      const next        = new Set(prev);
      if (allSelected) ids.forEach((id) => next.delete(id));
      else             ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectedLeads = useMemo(
    () => filtered.filter((l) => l.id && selectedIds.has(l.id)),
    [filtered, selectedIds],
  );

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleAddLead = useCallback(async (lead: NewLead) => {
    try {
      await addLead(lead);
      await load();
      showToast(`Lead "${lead.companyName}" added!`);
    } catch {
      showToast("Failed to add lead", "error");
    }
  }, [load, showToast]);

  const handleAddBatch = useCallback(async (newLeads: NewLead[]) => {
    try {
      await addLeadsBatch(newLeads);
      await load();
      showToast(`${newLeads.length} leads added!`);
    } catch {
      showToast("Failed to add leads", "error");
    }
  }, [load, showToast]);

  const handleDeleteLead = useCallback(async (id: string) => {
    try {
      await deleteLead(id);
      await load();
      showToast("Lead removed");
    } catch {
      showToast("Failed to delete", "error");
    }
  }, [load, showToast]);

  const handleDeleteSelected = useCallback(async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    try {
      await deleteLeadsBatch(ids);
      clearSelection();
      await load();
      showToast(`${ids.length} leads deleted`);
    } catch {
      showToast("Failed to delete leads", "error");
    }
  }, [selectedIds, clearSelection, load, showToast]);

  // ── AI Audit ────────────────────────────────────────────────────────────────
  const handleAuditWebsite = useCallback(async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.website) { showToast("No website URL to audit", "error"); return; }

    setAiLoading(`Auditing ${lead.website}...`);
    try {
      const result: AuditResult = await auditWebsite(lead.website);
      // updateLeadAudit expects the flat shape it was designed for
      await updateLeadAudit(leadId, {
        hasChatbot:         result.hasChatbot,
        hasQuickResponse:   result.hasQuickResponse,
        hasLeadForm:        result.hasLeadForm,
        hasMobileOptimized: result.hasMobileOptimized,
        aiAuditSummary:     result.summary,
      });
      await load();
      showToast(`Audit complete for ${lead.companyName} — Score: ${result.score}/100`);
    } catch {
      showToast("AI audit failed — check API connection", "error");
    } finally {
      setAiLoading(null);
    }
  }, [leads, load, showToast]);

  // ── AI Email & Send ─────────────────────────────────────────────────────────
  const handleSendEmail = useCallback(async (
    leadId:    string,
    emailType: FollowUpKey,
  ) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setAiLoading(`Generating email for ${lead.companyName}...`);
    try {
      // mailHistory is optional — use safe accessor
      const previousBodies = getMailHistory(lead)
        .filter((m: MailEntry) => m.bodySnapshot)
        .map((m: MailEntry) => m.bodySnapshot!);

      const result = await generateEmail(lead, emailType, previousBodies);
      await recordEmailSent(leadId, emailType, result.body);
      await load();
      showToast(`${emailType} email sent to ${lead.companyName}`);
      return result;
    } catch {
      showToast("Failed to send email", "error");
    } finally {
      setAiLoading(null);
    }
  }, [leads, load, showToast]);

  const handleSendBatchEmails = useCallback(async (
    targetLeads: FirestoreLead[],
    emailType:   FollowUpKey,
  ) => {
    setAiLoading(`Generating ${targetLeads.length} emails...`);
    try {
      const emails = await generateBatchEmails(targetLeads, emailType);

      // id is optional on FirestoreLead — filter out entries without one
      const entries = targetLeads
        .filter((l): l is FirestoreLead & { id: string } => Boolean(l.id))
        .map((l) => ({
          leadId:       l.id,
          emailType,
          bodySnapshot: emails.get(l.id)?.body,
        }));

      await recordBatchEmailsSent(entries);
      clearSelection();
      await load();
      showToast(`Sent ${emailType} to ${targetLeads.length} leads!`);
    } catch {
      showToast("Batch send failed", "error");
    } finally {
      setAiLoading(null);
    }
  }, [load, showToast, clearSelection]);

  // ── Due follow-ups ──────────────────────────────────────────────────────────
  const dueFollowUps = useMemo(() => getDueFollowUps(leads), [leads]);

  return {
    leads, filtered, loading,
    search, setSearch,
    filterStatus, setFilterStatus,
    stats, selectedLeads, dueFollowUps,
    aiLoading, selectedIds,
    toggleSelect, toggleSelectAll, clearSelection,
    handleAddLead, handleAddBatch,
    handleDeleteLead, handleDeleteSelected,
    handleAuditWebsite, handleSendEmail, handleSendBatchEmails,
    reload: load,
  };
}

// ── Pure helper ───────────────────────────────────────────────────────────────

function getDueFollowUps(leads: FirestoreLead[]): DueFollowUp[] {
  const result: DueFollowUp[] = [];

  for (const lead of leads) {
    // Skip completed / lost statuses
    if (lead.status === "closed" || lead.status === "lost") continue;

    const hist = getMailHistory(lead);
    if (hist.length === 0) continue;

    const lastMail = hist[hist.length - 1];
    if (!lastMail) continue;

    const days = daysAgo(lastMail.date);
    // Compare against lastMail.type (a FollowUpKey), not lead.status (a CRM status)
    const idx  = FOLLOW_UP_SEQUENCE.findIndex((s) => s.key === lastMail.type);

    if (idx >= 0 && idx < FOLLOW_UP_SEQUENCE.length - 1) {
      const next = FOLLOW_UP_SEQUENCE[idx + 1];
      if (next && days >= next.daysAfter) {
        result.push({ lead, nextStep: next, daysSinceLastEmail: days });
      }
    }
  }

  return result.sort((a, b) => b.daysSinceLastEmail - a.daysSinceLastEmail);
}