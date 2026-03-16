// ─── src/hooks/useLeads.ts ───────────────────────────────────────────────────
// Central hook for all lead operations — keeps components clean

import { useState, useEffect, useCallback, useMemo } from "react";
import type { Lead, LeadStatus, FollowUpKey, AiAuditResult } from "../types/leads";
import { FOLLOW_UP_SEQUENCE } from "../lib/lead-constants";
import {
  fetchLeads, addLead, addLeadsBatch, updateLead,
  deleteLead, deleteLeadsBatch,
  recordEmailSent, recordBatchEmailsSent, updateLeadAudit,
} from "../lib/lead-firebase";
import { auditWebsite, generateEmail, generateBatchEmails } from "../lib/lead-ai";

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

export interface DueFollowUp {
  lead: Lead;
  nextStep: typeof FOLLOW_UP_SEQUENCE[number];
  daysSinceLastEmail: number;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useLeads(showToast: (msg: string, type?: "success" | "error") => void) {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [aiLoading, setAiLoading] = useState<string | null>(null); // loading context label

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
      const matchSearch = !search
        || l.name.toLowerCase().includes(search.toLowerCase())
        || l.email.toLowerCase().includes(search.toLowerCase())
        || l.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "all" || l.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, filterStatus]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = leads.length;
    const totalEmailsSent = leads.reduce((a, l) => a + l.mailHistory.length, 0);
    const dueList = getDueFollowUps(leads);
    const byStatus = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {});
    const bySource = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1;
      return acc;
    }, {});
    return { total, totalEmailsSent, dueFollowUps: dueList.length, byStatus, bySource };
  }, [leads]);

  // ── Selection ───────────────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)));
  }, []);

  const toggleSelectAll = useCallback((ids: string[]) => {
    setLeads((prev) => {
      const idSet = new Set(ids);
      const allSelected = prev.filter((l) => idSet.has(l.id)).every((l) => l.selected);
      return prev.map((l) => (idSet.has(l.id) ? { ...l, selected: !allSelected } : l));
    });
  }, []);

  const clearSelection = useCallback(() => {
    setLeads((prev) => prev.map((l) => ({ ...l, selected: false })));
  }, []);

  const selectedLeads = useMemo(() => filtered.filter((l) => l.selected), [filtered]);

  // ── CRUD operations ─────────────────────────────────────────────────────────
  const handleAddLead = useCallback(async (lead: Omit<Lead, "id" | "selected" | "firestoreId">) => {
    try {
      await addLead(lead);
      await load();
      showToast(`Lead "${lead.name}" added!`);
    } catch {
      showToast("Failed to add lead", "error");
    }
  }, [load, showToast]);

  const handleAddBatch = useCallback(async (newLeads: Omit<Lead, "id" | "selected" | "firestoreId">[]) => {
    try {
      await addLeadsBatch(newLeads);
      await load();
      showToast(`${newLeads.length} leads added!`);
    } catch {
      showToast("Failed to add leads", "error");
    }
  }, [load, showToast]);

  const handleDeleteLead = useCallback(async (id: string) => {
    const lead = leads.find((l) => l.id === id || l.firestoreId === id);
    try {
      await deleteLead(lead?.firestoreId || id);
      await load();
      showToast(`Lead removed`);
    } catch {
      showToast("Failed to delete", "error");
    }
  }, [leads, load, showToast]);

  const handleDeleteSelected = useCallback(async () => {
    const ids = selectedLeads.map((l) => l.firestoreId || l.id).filter(Boolean);
    try {
      await deleteLeadsBatch(ids);
      await load();
      showToast(`${ids.length} leads deleted`);
    } catch {
      showToast("Failed to delete leads", "error");
    }
  }, [selectedLeads, load, showToast]);

  // ── AI Audit ────────────────────────────────────────────────────────────────
  const handleAuditWebsite = useCallback(async (leadId: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.website) {
      showToast("No website URL to audit", "error");
      return;
    }
    setAiLoading(`Auditing ${lead.website}...`);
    try {
      const result: AiAuditResult = await auditWebsite(lead.website);
      await updateLeadAudit(lead.firestoreId || lead.id, {
        hasChatbot: result.hasChatbot,
        hasQuickResponse: result.hasQuickResponse,
        hasLeadForm: result.hasLeadForm,
        hasMobileOptimized: result.hasMobileOptimized,
        aiAuditSummary: result.summary,
      });
      await load();
      showToast(`Audit complete for ${lead.name} — Score: ${result.score}/100`);
    } catch {
      showToast("AI audit failed — check API connection", "error");
    } finally {
      setAiLoading(null);
    }
  }, [leads, load, showToast]);

  // ── AI Email & Send ─────────────────────────────────────────────────────────
  const handleSendEmail = useCallback(async (leadId: string, emailType: FollowUpKey) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setAiLoading(`Generating email for ${lead.name}...`);
    try {
      const previousBodies = lead.mailHistory
        .filter((m) => m.bodySnapshot)
        .map((m) => m.bodySnapshot!);
      const result = await generateEmail(lead, emailType, previousBodies);

      // Record in Firestore
      await recordEmailSent(lead.firestoreId || lead.id, emailType, result.body);
      await load();
      showToast(`${emailType} email sent to ${lead.name}`);
      return result;
    } catch {
      showToast("Failed to send email", "error");
    } finally {
      setAiLoading(null);
    }
  }, [leads, load, showToast]);

  const handleSendBatchEmails = useCallback(async (
    targetLeads: Lead[],
    emailType: FollowUpKey,
  ) => {
    setAiLoading(`Generating ${targetLeads.length} emails...`);
    try {
      const emails = await generateBatchEmails(targetLeads, emailType);
      const entries = targetLeads.map((l) => ({
        leadId: l.firestoreId || l.id,
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
    leads, filtered, loading, search, setSearch,
    filterStatus, setFilterStatus,
    stats, selectedLeads, dueFollowUps,
    aiLoading,
    toggleSelect, toggleSelectAll, clearSelection,
    handleAddLead, handleAddBatch,
    handleDeleteLead, handleDeleteSelected,
    handleAuditWebsite, handleSendEmail, handleSendBatchEmails,
    reload: load,
  };
}

// ── Pure helper ───────────────────────────────────────────────────────────────

function getDueFollowUps(leads: Lead[]): DueFollowUp[] {
  const result: DueFollowUp[] = [];
  for (const lead of leads) {
    if (lead.mailHistory.length === 0) continue;
    if (lead.status === "completed" || lead.status === "not-interested") continue;

    const lastMail = lead.mailHistory[lead.mailHistory.length - 1];
    const days = daysAgo(lastMail.date);
    const idx = FOLLOW_UP_SEQUENCE.findIndex((s) => s.key === lead.status);

    if (idx >= 0 && idx < FOLLOW_UP_SEQUENCE.length - 1) {
      const next = FOLLOW_UP_SEQUENCE[idx + 1];
      if (days >= next.daysAfter) {
        result.push({ lead, nextStep: next, daysSinceLastEmail: days });
      }
    }
  }
  return result.sort((a, b) => b.daysSinceLastEmail - a.daysSinceLastEmail);
}
