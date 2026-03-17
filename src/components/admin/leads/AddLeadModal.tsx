// ─── src/components/admin/leads/AddLeadModal.tsx ────────────────────────────
import { useState } from "react";
import type { FirestoreLead } from "../../../types/leads";
import { LEAD_SOURCES, DEFAULT_CATEGORIES } from "../../../lib/lead-constants";
import { searchLeadsAI, type AISearchResult } from "../../../lib/lead-ai";

// ── LeadSource is not exported from types/leads — define locally ───────────
type LeadSource = string;

interface Props {
  onClose:    () => void;
  onAdd:      (lead: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onAddBatch: (leads: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">[]) => Promise<void>;
}

// ── Form shape — maps to FirestoreLead fields ─────────────────────────────
type LeadForm = {
  companyName:        string;
  email:              string;
  phone:              string;
  whatsapp:           string;
  hasWhatsapp:        boolean;
  website:            string;
  socialLinks:        string;
  proposal:           string;
  imageUrl:           string;
  imagePublicId:      string;
  leadSource:         LeadSource;
  country:            string;
  city:               string;
  tags:               string[];
  notes:              { text: string; date: string; employeeName: string }[];
  hasChatbot:         boolean;
  hasQuickResponse:   boolean;
  hasLeadForm:        boolean;
  hasMobileOptimized: boolean;
  plainNotes:         string;   // local-only convenience field, not in FirestoreLead
};

const emptyForm: LeadForm = {
  companyName: "", email: "", phone: "", whatsapp: "",
  hasWhatsapp: false, website: "", socialLinks: "", proposal: "",
  imageUrl: "", imagePublicId: "",
  leadSource: "Manual",
  country: "", city: "", tags: [], notes: [],
  hasChatbot: false, hasQuickResponse: false,
  hasLeadForm: false, hasMobileOptimized: false,
  plainNotes: "",
};

type BooleanLeadFormKey =
  | "hasChatbot"
  | "hasQuickResponse"
  | "hasLeadForm"
  | "hasMobileOptimized"
  | "hasWhatsapp";

const CHECKBOX_FIELDS: { key: BooleanLeadFormKey; label: string }[] = [
  { key: "hasChatbot",         label: "Has Chatbot"         },
  { key: "hasQuickResponse",   label: "Has Quick Response"  },
  { key: "hasLeadForm",        label: "Has Lead Form"       },
  { key: "hasMobileOptimized", label: "Mobile Optimized"    },
];

// Converts the local form into a FirestoreLead-compatible payload
function formToLead(
  form: LeadForm,
): Omit<FirestoreLead, "id" | "createdAt" | "updatedAt"> {
  return {
    companyName:    form.companyName,
    email:          form.email,
    phone:          form.phone,
    whatsapp:       form.whatsapp,
    hasWhatsapp:    form.hasWhatsapp,
    website:        form.website,
    socialLinks:    form.socialLinks,
    proposal:       form.proposal,
    imageUrl:       form.imageUrl,
    imagePublicId:  form.imagePublicId,
    status:         "new",
    priority:       "medium",
    employeeName:   "",
    employeeId:     "",
    leadSource:     form.leadSource,
    leadScore:      0,
    country:        form.country,
    city:           form.city,
    tags:           form.tags,
    notes:          form.plainNotes
      ? [{ text: form.plainNotes, date: new Date().toISOString().split("T")[0], employeeName: "" }]
      : [],
    followUpDate:   null,
    followUpCount:  0,
    lastContacted:  null,
    mailHistory:    [],
    auditData:      undefined,
  };
}

export function AddLeadModal({ onClose, onAdd, onAddBatch }: Props) {
  const [mode, setMode] = useState<"manual" | "ai-search">("manual");
  const [form, setForm] = useState<LeadForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [searchKeyword,  setSearchKeyword]  = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searching,      setSearching]      = useState(false);
  const [searchResults,  setSearchResults]  = useState<(AISearchResult & { selected: boolean })[]>([]);

  function set<K extends keyof LeadForm>(key: K, val: LeadForm[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSubmitManual() {
    if (!form.companyName || !form.email) return;
    setSaving(true);
    await onAdd(formToLead(form));
    setSaving(false);
    onClose();
  }

  async function handleAiSearch() {
    if (!searchKeyword || !searchLocation) return;
    setSearching(true);
    try {
      const results = await searchLeadsAI(searchKeyword, searchLocation);
      setSearchResults(results.map((r) => ({ ...r, selected: true })));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function handleImportSelected() {
    const selected = searchResults.filter((r) => r.selected);
    if (selected.length === 0) return;
    setSaving(true);
    const leadsToAdd: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">[] = selected.map((r) => ({
      companyName:   r.companyName,
      email:         r.email,
      phone:         r.phone,
      whatsapp:      "",
      hasWhatsapp:   false,
      website:       r.website,
      socialLinks:   "",
      proposal:      "",
      imageUrl:      "",
      imagePublicId: "",
      status:        "new" as const,
      priority:      "medium" as const,
      employeeName:  "",
      employeeId:    "",
      leadSource:    r.leadSource || "AI Search",
      leadScore:     0,
      country:       r.country,
      city:          r.city,
      tags:          [],
      notes:         [],
      followUpDate:  null,
      followUpCount: 0,
      lastContacted: null,
      mailHistory:   [],
      auditData:     undefined,
    }));
    await onAddBatch(leadsToAdd);
    setSaving(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{
          background:  "var(--bg-surface)",
          border:      "1px solid var(--border2)",
          boxShadow:   "var(--shadow-lg)",
          animation:   "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-[18px] font-bold" style={{ color: "var(--ink)" }}>
            Add Leads
          </h2>
          <button onClick={onClose}
            style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}
            className="w-8 h-8 rounded-lg flex items-center justify-center">
            ✕
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex rounded-xl p-1 mb-6"
          style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)" }}>
          {(["manual", "ai-search"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-2.5 rounded-lg font-mono text-[11px] font-semibold transition-all duration-200"
              style={{
                cursor: "pointer", border: "none",
                background: mode === m ? "linear-gradient(135deg, var(--accent), var(--cyan))" : "transparent",
                color:      mode === m ? "white" : "var(--ink4)",
              }}>
              {m === "manual" ? "✏️ Manual Add" : "🤖 AI Search & Import"}
            </button>
          ))}
        </div>

        {/* ── Manual Mode ── */}
        {mode === "manual" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Business Name *" value={form.companyName}
                onChange={(v) => set("companyName", v)} placeholder="e.g. Horizon Estates" />
              <FormField label="Email *" value={form.email}
                onChange={(v) => set("email", v)} placeholder="info@example.com" />
              <FormField label="Phone" value={form.phone}
                onChange={(v) => set("phone", v)} placeholder="+44 20 7946 0958" />
              <FormField label="Website" value={form.website}
                onChange={(v) => set("website", v)} placeholder="horizonestates.co.uk" />
              <FormField label="Country" value={form.country}
                onChange={(v) => set("country", v)} placeholder="United Kingdom" />
              <FormField label="City" value={form.city}
                onChange={(v) => set("city", v)} placeholder="London" />

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--ink4)" }}>Lead Source</label>
                <select value={form.leadSource} onChange={(e) => set("leadSource", e.target.value)}
                  className="py-2 px-3 rounded-lg text-[13px]"
                  style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", color: "var(--ink)", outline: "none", cursor: "pointer" }}>
                  {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--ink4)" }}>Category (tag)</label>
                <select value={form.tags[0] ?? ""} onChange={(e) => set("tags", e.target.value ? [e.target.value] : [])}
                  className="py-2 px-3 rounded-lg text-[13px]"
                  style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", color: "var(--ink)", outline: "none", cursor: "pointer" }}>
                  <option value="">Select category</option>
                  {DEFAULT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Checkboxes */}
              <div className="col-span-2 flex flex-wrap gap-4 py-2">
                {CHECKBOX_FIELDS.map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key] as boolean}
                      onChange={(e) => set(key, e.target.checked)}
                      className="w-4 h-4 rounded" style={{ accentColor: "var(--accent)" }} />
                    <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>{label}</span>
                  </label>
                ))}
              </div>

              {/* Notes */}
              <div className="col-span-2 flex flex-col gap-1">
                <label className="font-mono text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: "var(--ink4)" }}>Notes</label>
                <textarea value={form.plainNotes} onChange={(e) => set("plainNotes", e.target.value)}
                  rows={3} placeholder="Website issues, observations..."
                  className="py-2 px-3 rounded-lg text-[13px] resize-none"
                  style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", color: "var(--ink)", outline: "none" }} />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-[13px] font-medium"
                style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
                Cancel
              </button>
              <button onClick={handleSubmitManual}
                disabled={saving || !form.companyName || !form.email}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: saving ? "wait" : "pointer", border: "none" }}>
                {saving ? "Adding…" : "Add Lead"}
              </button>
            </div>
          </>
        )}

        {/* ── AI Search Mode ── */}
        {mode === "ai-search" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <FormField label="Industry / Keyword" value={searchKeyword}
                onChange={setSearchKeyword} placeholder="e.g. Real Estate" />
              <FormField label="Location" value={searchLocation}
                onChange={setSearchLocation} placeholder="e.g. London, UK" />
            </div>
            <button onClick={handleAiSearch}
              disabled={searching || !searchKeyword || !searchLocation}
              className="w-full py-3 rounded-xl text-[13px] font-semibold text-white mb-5
                transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: searching ? "wait" : "pointer", border: "none" }}>
              {searching ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />AI is searching...</>
              ) : <>🤖 Search with AI</>}
            </button>

            {searchResults.length > 0 && (
              <div className="rounded-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border2)" }}>
                <div className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: "var(--bg-alt)", borderBottom: "1px solid var(--border2)" }}>
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                    Found {searchResults.length} leads
                  </span>
                  <button
                    onClick={() => setSearchResults((p) => p.map((r) => ({ ...r, selected: !p.every((x) => x.selected) })))}
                    className="font-mono text-[10px]"
                    style={{ color: "var(--accent)", cursor: "pointer", background: "none", border: "none" }}>
                    Toggle All
                  </button>
                </div>
                {searchResults.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
                    style={{ borderColor: "var(--border)", background: r.selected ? "var(--accent-pale)" : "transparent" }}>
                    <input type="checkbox" checked={r.selected}
                      onChange={() => setSearchResults((p) => p.map((x, j) => (j === i ? { ...x, selected: !x.selected } : x)))}
                      className="w-4 h-4 flex-shrink-0" style={{ accentColor: "var(--accent)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>{r.companyName}</div>
                      <div className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{r.email} · {r.website}</div>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{r.leadSource}</span>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="flex justify-end gap-3">
                <button onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-medium"
                  style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
                  Cancel
                </button>
                <button onClick={handleImportSelected}
                  disabled={saving || searchResults.filter((r) => r.selected).length === 0}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150 disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: saving ? "wait" : "pointer", border: "none" }}>
                  {saving ? "Importing…" : `Import ${searchResults.filter((r) => r.selected).length} Leads`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: "var(--ink4)" }}>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="py-2 px-3 rounded-lg text-[13px]"
        style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", color: "var(--ink)", outline: "none" }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
        onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }} />
    </div>
  );
}