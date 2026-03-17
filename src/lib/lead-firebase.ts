// ─── src/lib/lead-firebase.ts ────────────────────────────────────────────────
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, writeBatch, serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
// Single source of truth — all types from types/leads
import type { FirestoreLead, MailEntry, FollowUpKey, NewLead, LeadUpdate } from "../types/leads";

const COLLECTION = "leads";
const leadsRef   = () => collection(db, COLLECTION);

// ── Helpers ───────────────────────────────────────────────────────────────────

function docToLead(id: string, data: DocumentData): FirestoreLead {
  return {
    id,
    // ── Core contact ──────────────────────────────────────────────────────────
    companyName:    data.companyName    ?? data.name ?? "",   // back-compat: old docs used `name`
    email:          data.email          ?? "",
    phone:          data.phone          ?? "",
    whatsapp:       data.whatsapp       ?? "",
    hasWhatsapp:    data.hasWhatsapp    ?? false,
    website:        data.website        ?? "",
    socialLinks:    data.socialLinks    ?? data.instagram ?? "", // back-compat
    // ── CRM ───────────────────────────────────────────────────────────────────
    proposal:       data.proposal       ?? data.notes ?? "",   // back-compat
    imageUrl:       data.imageUrl       ?? "",
    imagePublicId:  data.imagePublicId  ?? "",
    status:         data.status         ?? "new",
    priority:       data.priority       ?? "medium",
    employeeName:   data.employeeName   ?? "",
    employeeId:     data.employeeId     ?? "",
    leadSource:     data.leadSource     ?? data.source ?? "Manual", // back-compat
    leadScore:      data.leadScore      ?? 0,
    country:        data.country        ?? "",
    city:           data.city           ?? "",
    tags:           data.tags           ?? (data.category ? [data.category] : []), // back-compat
    notes:          data.notes && Array.isArray(data.notes) ? data.notes : [],
    followUpDate:   data.followUpDate   ?? null,
    followUpCount:  data.followUpCount  ?? 0,
    lastContacted:  data.lastContacted  ?? null,
    // ── Timestamps ────────────────────────────────────────────────────────────
    // Firestore Timestamps are serialized to ISO strings for React state
    createdAt:      data.createdAt?.toDate?.()?.toISOString()
                    ?? data.dateAdded   // back-compat: old docs used `dateAdded`
                    ?? new Date().toISOString().split("T")[0],
    updatedAt:      data.updatedAt?.toDate?.()?.toISOString() ?? undefined,
    // ── AI fields ─────────────────────────────────────────────────────────────
    mailHistory:    data.mailHistory    ?? [],
    // Reconstruct auditData from flat fields if nested form not yet stored
    auditData:      data.auditData ?? (
      data.hasChatbot !== undefined ? {
        hasChatbot:         data.hasChatbot         ?? false,
        hasQuickResponse:   data.hasQuickResponse   ?? false,
        hasLeadForm:        data.hasLeadForm         ?? false,
        hasMobileOptimized: data.hasMobileOptimized  ?? false,
        summary:            data.aiAuditSummary      ?? "",
        missingFeatures:    data.missingFeatures     ?? [],
        score:              data.score               ?? 0,
      } : undefined
    ),
  };
}

// Strip client-only / server-managed fields before writing to Firestore
function leadToDoc(lead: LeadUpdate): Record<string, unknown> {
  return {
    ...lead,
    updatedAt: serverTimestamp(),
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function fetchLeads(): Promise<FirestoreLead[]> {
  // Try ordering by createdAt first; fall back to dateAdded for old documents
  try {
    const q    = query(leadsRef(), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToLead(d.id, d.data()));
  } catch {
    const q    = query(leadsRef(), orderBy("dateAdded", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToLead(d.id, d.data()));
  }
}

export async function fetchLeadsByStatus(
  status: FirestoreLead["status"],
): Promise<FirestoreLead[]> {
  const q    = query(leadsRef(), where("status", "==", status), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToLead(d.id, d.data()));
}

export async function addLead(lead: NewLead): Promise<string> {
  const docRef = await addDoc(leadsRef(), {
    ...lead,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addLeadsBatch(leads: NewLead[]): Promise<void> {
  const batch = writeBatch(db);
  for (const lead of leads) {
    const ref = doc(leadsRef());
    batch.set(ref, {
      ...lead,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}

export async function updateLead(id: string, data: LeadUpdate): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, leadToDoc(data));
}

export async function deleteLead(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function deleteLeadsBatch(ids: string[]): Promise<void> {
  const batch = writeBatch(db);
  for (const id of ids) {
    batch.delete(doc(db, COLLECTION, id));
  }
  await batch.commit();
}

// ── Email tracking ────────────────────────────────────────────────────────────

export async function recordEmailSent(
  leadId:       string,
  emailType:    FollowUpKey,
  bodySnapshot?: string,
): Promise<void> {
  const ref  = doc(db, COLLECTION, leadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Lead not found");

  const history: MailEntry[] = snap.data().mailHistory ?? [];
  history.push({
    date:         new Date().toISOString().split("T")[0],
    type:         emailType,
    status:       "sent",
    bodySnapshot,
  });

  await updateDoc(ref, {
    mailHistory:   history,
    status:        emailType,       // advance pipeline status
    lastContacted: new Date().toISOString().split("T")[0],
    updatedAt:     serverTimestamp(),
  });
}

export async function recordBatchEmailsSent(
  entries: { leadId: string; emailType: FollowUpKey; bodySnapshot?: string }[],
): Promise<void> {
  // Firestore batch limit = 500; chunk at 250 to leave room for reads
  const chunkSize = 250;
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const { leadId, emailType, bodySnapshot } of chunk) {
      const ref  = doc(db, COLLECTION, leadId);
      const snap = await getDoc(ref);
      if (!snap.exists()) continue;

      const history: MailEntry[] = snap.data().mailHistory ?? [];
      history.push({
        date:         new Date().toISOString().split("T")[0],
        type:         emailType,
        status:       "sent",
        bodySnapshot,
      });

      batch.update(ref, {
        mailHistory:   history,
        status:        emailType,
        lastContacted: new Date().toISOString().split("T")[0],
        updatedAt:     serverTimestamp(),
      });
    }

    await batch.commit();
  }
}

// ── Audit update ──────────────────────────────────────────────────────────────
// Stores audit result both as flat fields (back-compat) AND as nested auditData

export async function updateLeadAudit(
  id: string,
  audit: {
    hasChatbot:         boolean;
    hasQuickResponse:   boolean;
    hasLeadForm:        boolean;
    hasMobileOptimized: boolean;
    aiAuditSummary:     string;
  },
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    // Flat fields — back-compat with existing documents
    hasChatbot:         audit.hasChatbot,
    hasQuickResponse:   audit.hasQuickResponse,
    hasLeadForm:        audit.hasLeadForm,
    hasMobileOptimized: audit.hasMobileOptimized,
    aiAuditSummary:     audit.aiAuditSummary,
    // Nested auditData — used by new components
    auditData: {
      hasChatbot:         audit.hasChatbot,
      hasQuickResponse:   audit.hasQuickResponse,
      hasLeadForm:        audit.hasLeadForm,
      hasMobileOptimized: audit.hasMobileOptimized,
      summary:            audit.aiAuditSummary,
      missingFeatures:    [],
      score:              0,
    },
    updatedAt: serverTimestamp(),
  });
}