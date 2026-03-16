// ─── src/lib/lead-firebase.ts ────────────────────────────────────────────────
// Firestore CRUD for the "leads" collection
// Assumes your firebase.ts already exports `db` (Firestore instance)

import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, writeBatch, serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase"; // ← your existing firebase config
import type { Lead, LeadMailEntry, LeadStatus, FollowUpKey } from "../types/leads";

const COLLECTION = "leads";
const leadsRef = () => collection(db, COLLECTION);

// ── Helpers ───────────────────────────────────────────────────────────────────

function docToLead(id: string, data: DocumentData): Lead {
  return {
    id,
    firestoreId: id,
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    website: data.website ?? "",
    instagram: data.instagram ?? "",
    source: data.source ?? "Manual",
    category: data.category ?? "",
    hasChatbot: data.hasChatbot ?? false,
    hasQuickResponse: data.hasQuickResponse ?? false,
    hasLeadForm: data.hasLeadForm ?? false,
    hasMobileOptimized: data.hasMobileOptimized ?? false,
    notes: data.notes ?? "",
    aiAuditSummary: data.aiAuditSummary ?? "",
    dateAdded: data.dateAdded ?? new Date().toISOString().split("T")[0],
    mailHistory: data.mailHistory ?? [],
    status: data.status ?? "new",
    selected: false, // UI-only state, never stored
  };
}

function leadToDoc(lead: Partial<Lead>): Record<string, unknown> {
  const { id, selected, firestoreId, ...rest } = lead as Lead & { id: string; selected: boolean; firestoreId?: string };
  return {
    ...rest,
    updatedAt: serverTimestamp(),
  };
}

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function fetchLeads(): Promise<Lead[]> {
  const q = query(leadsRef(), orderBy("dateAdded", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToLead(d.id, d.data()));
}

export async function fetchLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  const q = query(leadsRef(), where("status", "==", status), orderBy("dateAdded", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToLead(d.id, d.data()));
}

export async function fetchLeadsByCategory(category: string): Promise<Lead[]> {
  const q = query(leadsRef(), where("category", "==", category), orderBy("dateAdded", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToLead(d.id, d.data()));
}

export async function addLead(lead: Omit<Lead, "id" | "selected" | "firestoreId">): Promise<string> {
  const docRef = await addDoc(leadsRef(), {
    ...lead,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function addLeadsBatch(leads: Omit<Lead, "id" | "selected" | "firestoreId">[]): Promise<void> {
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

export async function updateLead(id: string, data: Partial<Lead>): Promise<void> {
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
  leadId: string,
  emailType: FollowUpKey,
  bodySnapshot?: string,
): Promise<void> {
  const ref = doc(db, COLLECTION, leadId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Lead not found");

  const data = snap.data();
  const history: LeadMailEntry[] = data.mailHistory ?? [];
  
  history.push({
    date: new Date().toISOString().split("T")[0],
    type: emailType,
    status: "sent",
    bodySnapshot,
  });

  await updateDoc(ref, {
    mailHistory: history,
    status: emailType,
    updatedAt: serverTimestamp(),
  });
}

export async function recordBatchEmailsSent(
  entries: { leadId: string; emailType: FollowUpKey; bodySnapshot?: string }[],
): Promise<void> {
  // Firestore batch limit = 500, so chunk if needed
  const chunkSize = 250; // Leave room for reads
  for (let i = 0; i < entries.length; i += chunkSize) {
    const chunk = entries.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const { leadId, emailType, bodySnapshot } of chunk) {
      const ref = doc(db, COLLECTION, leadId);
      const snap = await getDoc(ref);
      if (!snap.exists()) continue;

      const data = snap.data();
      const history: LeadMailEntry[] = data.mailHistory ?? [];
      history.push({
        date: new Date().toISOString().split("T")[0],
        type: emailType,
        status: "sent",
        bodySnapshot,
      });

      batch.update(ref, {
        mailHistory: history,
        status: emailType,
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  }
}

// ── Update audit results ──────────────────────────────────────────────────────

export async function updateLeadAudit(
  id: string,
  audit: {
    hasChatbot: boolean;
    hasQuickResponse: boolean;
    hasLeadForm: boolean;
    hasMobileOptimized: boolean;
    aiAuditSummary: string;
  },
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...audit,
    status: "audited",
    updatedAt: serverTimestamp(),
  });
}
