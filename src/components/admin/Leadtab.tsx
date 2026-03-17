// ─── src/components/admin/LeadTab.tsx ────────────────────────────────────────
import {
  useState, useEffect, useCallback, useRef, useMemo,
  type FormEvent, type ChangeEvent,
} from "react";
import {
  fetchLeads, createLead, updateLead, deleteLead,
} from "../../lib/firebase";
import { uploadToCloudinary } from "../../lib/cloudinary";
import {
  auditWebsite, generateEmail, generateBatchEmails,
  AI_ENABLED,
} from "../../lib/lead-ai";
import { sendEmail } from "../../lib/email-sender";
// FirestoreLead is the single source of truth — import from types/leads, not firebase
import type { FirestoreLead, LeadUpdate, MailEntry, AuditResult, FollowUpKey } from "../../types/leads";
import { scrapeGoogleMaps, type ScrapedLead } from "../../lib/maps-scraper";

const HASDATA_KEY    = import.meta.env.VITE_HASDATA_API_KEY    ?? "";
const OUTSCRAPER_KEY = import.meta.env.VITE_OUTSCRAPER_API_KEY ?? "";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_OPTIONS: { value: FirestoreLead["status"]; label: string; color: string; bg: string }[] = [
  { value: "new",       label: "New",       color: "#3B6EF8", bg: "rgba(59,110,248,0.1)"  },
  { value: "contacted", label: "Contacted", color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  { value: "qualified", label: "Qualified", color: "#7B5CFA", bg: "rgba(123,92,250,0.1)"  },
  { value: "proposal",  label: "Proposal",  color: "#00AACC", bg: "rgba(0,170,204,0.1)"   },
  { value: "closed",    label: "Closed ✓",  color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
  { value: "lost",      label: "Lost",      color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
];

const PRIORITY_OPTIONS: { value: FirestoreLead["priority"]; label: string; color: string }[] = [
  { value: "high",   label: "High",   color: "#EF4444" },
  { value: "medium", label: "Medium", color: "#F59E0B" },
  { value: "low",    label: "Low",    color: "#10B981" },
];

const LEAD_SOURCES = [
  "Website","Referral","LinkedIn","Email Campaign",
  "Cold Call","WhatsApp","Instagram","Facebook","Google Maps","AI Search","Other",
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria",
  "Bangladesh","Belgium","Brazil","Canada","Chile","China","Colombia",
  "Denmark","Egypt","Finland","France","Germany","Greece","India",
  "Indonesia","Ireland","Israel","Italy","Japan","Kenya","Malaysia",
  "Mexico","Netherlands","New Zealand","Nigeria","Norway","Pakistan",
  "Philippines","Poland","Portugal","Qatar","Russia","Saudi Arabia",
  "Singapore","South Africa","South Korea","Spain","Sweden","Switzerland",
  "Thailand","Turkey","UAE","UK","USA","Vietnam","Other",
];

const EMPTY_FORM: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt"> = {
  companyName:"", email:"", phone:"", whatsapp:"", hasWhatsapp:false,
  website:"", socialLinks:"", proposal:"", imageUrl:"", imagePublicId:"",
  status:"new", priority:"medium", employeeName:"", employeeId:"",
  leadSource:"", leadScore:0, country:"", city:"",
  tags:[], notes:[], followUpDate:null, followUpCount:0, lastContacted:null,
};

// ── FollowUpStep type ─────────────────────────────────────────────────────────
type FollowUpStep = { key: FollowUpKey; label: string; daysAfter: number };

const FOLLOW_UP_SEQUENCE: FollowUpStep[] = [
  { key: "initial",    label: "Initial Email",       daysAfter: 0 },
  { key: "followup-1", label: "Follow-up 1",         daysAfter: 5 },
  { key: "followup-2", label: "Follow-up 2",         daysAfter: 7 },
  { key: "followup-3", label: "Follow-up 3",         daysAfter: 5 },
  { key: "followup-4", label: "Follow-up 4",         daysAfter: 7 },
  { key: "followup-5", label: "Follow-up 5 (Final)", daysAfter: 7 },
];

const MAIL_STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  none:         { bg:"rgba(107,114,128,0.08)", text:"#9ca3af", border:"rgba(107,114,128,0.2)" },
  initial:      { bg:"rgba(34,197,94,0.08)",   text:"#86efac", border:"rgba(34,197,94,0.2)"  },
  "followup-1": { bg:"rgba(245,158,11,0.08)",  text:"#fde68a", border:"rgba(245,158,11,0.2)" },
  "followup-2": { bg:"rgba(239,68,68,0.08)",   text:"#fca5a5", border:"rgba(239,68,68,0.2)"  },
  "followup-3": { bg:"rgba(123,92,250,0.08)",  text:"#d8b4fe", border:"rgba(123,92,250,0.2)" },
  "followup-4": { bg:"rgba(6,182,212,0.08)",   text:"#67e8f9", border:"rgba(6,182,212,0.2)"  },
  "followup-5": { bg:"rgba(252,211,77,0.08)",  text:"#fcd34d", border:"rgba(252,211,77,0.2)" },
};

// ══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════════

function calcScore(lead: Partial<FirestoreLead>): number {
  let s = 0;
  if (lead.email)    s += 20; if (lead.phone)    s += 20;
  if (lead.whatsapp) s += 15; if (lead.website)  s += 10;
  if (lead.proposal) s += 15; if (lead.country)  s += 5;
  if (lead.city)     s += 5;  if ((lead.followUpCount ?? 0) > 2) s += 10;
  return s;
}

const getStatus         = (val: string) => STATUS_OPTIONS.find((s) => s.value === val) ?? STATUS_OPTIONS[0];
const getPriorityColor  = (p: string)   => PRIORITY_OPTIONS.find((o) => o.value === p)?.color ?? "#6b7280";
const daysAgo           = (d: string)   => Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
const fmtDate           = (d: string)   => new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
const today             = ()            => new Date().toISOString().split("T")[0];

// ── FirestoreLead already has mailHistory and auditData — no cast needed ──────
const getMailHistory = (lead: FirestoreLead): MailEntry[]      => lead.mailHistory ?? [];
const getAuditData   = (lead: FirestoreLead): AuditResult | null => lead.auditData  ?? null;

const getMailStatus = (lead: FirestoreLead): string => {
  const h = getMailHistory(lead);
  return h.length > 0 ? (h[h.length - 1].type) : "none";
};

function getDueFollowUp(lead: FirestoreLead): FollowUpStep | null {
  const hist = getMailHistory(lead);
  if (!hist.length) return null;
  const last = hist[hist.length - 1];
  if (!last) return null;
  const days = daysAgo(last.date);
  const idx  = FOLLOW_UP_SEQUENCE.findIndex((s) => s.key === last.type);
  if (idx >= 0 && idx < FOLLOW_UP_SEQUENCE.length - 1) {
    const next = FOLLOW_UP_SEQUENCE[idx + 1];
    if (next && days >= next.daysAfter) return next;
  }
  return null;
}

function getNextEmailType(lead: FirestoreLead): FollowUpKey | null {
  const hist = getMailHistory(lead);
  if (!hist.length) return "initial";
  const lastEntry = hist[hist.length - 1];
  if (!lastEntry) return "initial";
  const last = lastEntry.type;
  if (last === "followup-5") return null;
  const idx = FOLLOW_UP_SEQUENCE.findIndex((s) => s.key === last);
  if (idx >= 0 && idx < FOLLOW_UP_SEQUENCE.length - 1) {
    return FOLLOW_UP_SEQUENCE[idx + 1]?.key ?? null;
  }
  return null;
}

// LeadUpdate is imported from types/leads — see import block above

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--ink3)" }}>
      {children}
    </span>
  );
}

function Field({ label, span = 1, children }: { label: string; span?: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5" style={{ gridColumn: `span ${span}` }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Inp({ name, value, onChange, placeholder, type = "text", required }: {
  name: string; value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <input name={name} value={value} onChange={onChange} type={type}
      placeholder={placeholder} required={required}
      className="px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors duration-200 border border-[var(--border2)] w-full"
      style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
      onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
    />
  );
}

function Sel({ name, value, onChange, children }: {
  name: string; value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <select name={name} value={value} onChange={onChange}
      className="px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors duration-200 border border-[var(--border2)] w-full"
      style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
      onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = "var(--accent)"; }}
      onBlur={(e)  => { (e.target as HTMLSelectElement).style.borderColor = "var(--border2)"; }}>
      {children}
    </select>
  );
}

function AiOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}>
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)", animation: "fadeScaleIn .3s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)" }}/>
          <div className="absolute inset-2 rounded-full flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-[14px] font-semibold" style={{ color: "var(--ink)" }}>AI Processing</p>
          <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>{message}</p>
        </div>
      </div>
    </div>
  );
}

function AuditTags({ audit }: { audit: AuditResult | null }) {
  if (!audit) return <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>Not audited</span>;
  const issues: string[] = [];
  if (!audit.hasChatbot)         issues.push("No Bot");
  if (!audit.hasQuickResponse)   issues.push("Slow Resp");
  if (!audit.hasLeadForm)        issues.push("No Form");
  if (!audit.hasMobileOptimized) issues.push("Not Mobile");
  if (!issues.length)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold"
        style={{ background: "rgba(34,197,94,0.08)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}>
        ✓ All Good
      </span>
    );
  return (
    <div className="flex flex-wrap gap-1">
      {issues.slice(0, 2).map((i) => (
        <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded-md font-mono text-[9px] font-bold"
          style={{ background: "rgba(239,68,68,0.08)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
          {i}
        </span>
      ))}
      {issues.length > 2 && (
        <span className="font-mono text-[9px] px-1 py-0.5 rounded" style={{ color: "var(--ink4)", background: "var(--bg-alt)" }}>
          +{issues.length - 2}
        </span>
      )}
    </div>
  );
}

function MailStatusBadge({ lead }: { lead: FirestoreLead }) {
  const ms    = getMailStatus(lead);
  const sc    = MAIL_STATUS_COLORS[ms] ?? MAIL_STATUS_COLORS["none"];
  const label = FOLLOW_UP_SEQUENCE.find((s) => s.key === ms)?.label ?? "No Emails";
  const count = getMailHistory(lead).length;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold"
      style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
      {count > 0 && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.text }}/>}
      {label}{count > 0 ? ` (${count})` : ""}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEAD FORM
// ══════════════════════════════════════════════════════════════════════════════

function LeadForm({ lead, onClose, onSaved }: {
  lead?: FirestoreLead | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!lead;
  const [form, setForm]         = useState<Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">>({ ...EMPTY_FORM, ...(lead ?? {}) });
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError]       = useState("");
  const [tagInput, setTagInput] = useState((lead?.tags ?? []).join(", "));
  const fileRef = useRef<HTMLInputElement>(null);

  const field = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((f) => ({ ...f, [name]: val }));
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadPct(0);
    try {
      const res = await uploadToCloudinary(file, "zynhive/leads", setUploadPct);
      field("imageUrl", res.secure_url);
      field("imagePublicId", res.public_id);
    } catch { setError("Image upload failed."); }
    finally { setUploading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      const tags = tagInput.split(",").map((t) => t.trim()).filter(Boolean);
      const data: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt"> = {
        ...form, tags, leadScore: calcScore({ ...form, tags }),
      };
      if (isEdit && lead?.id) {
        await updateLead(lead.id, data);
        onSaved("Lead updated!");
      } else {
        await createLead(data);
        onSaved("Lead created!");
      }
      onClose();
    } catch { setError("Failed to save. Please try again."); }
    finally { setSaving(false); }
  }

  const iCls = "px-3 py-2.5 rounded-xl text-[13px] outline-none transition-colors duration-200 border border-[var(--border2)] w-full";
  const iSty = { background: "var(--bg-alt)", color: "var(--ink)" };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative h-full w-full max-w-[640px] overflow-y-auto flex flex-col"
        style={{ background: "var(--bg-panel)", borderLeft: "1px solid var(--border2)", animation: "slideInRight .3s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div className="flex items-center justify-between px-6 py-5 sticky top-0 z-10"
          style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border2)" }}>
          <div>
            <h2 className="font-display text-[17px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>
              {isEdit ? "Edit Lead" : "Add New Lead"}
            </h2>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--ink4)" }}>
              {isEdit ? `ID: ${lead?.id?.slice(0, 8)}…` : "New entry → Firestore"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 flex-1">
          {/* Logo upload */}
          <Field label="Company Logo">
            <div className="relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-300"
              style={{ height: form.imageUrl ? 120 : 80, borderColor: form.imageUrl ? "var(--accent)" : "var(--border2)", background: "var(--bg-surface)", cursor: "pointer" }}
              onClick={() => !uploading && fileRef.current?.click()}>
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} alt="logo" className="h-full w-full object-contain p-2"/>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0"; }}>
                    <span className="font-mono text-white text-[11px]">Click to replace</span>
                  </div>
                </>
              ) : uploading ? (
                <div className="flex flex-col items-center gap-2 w-full px-8">
                  <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "var(--border2)" }}>
                    <div className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadPct}%`, background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}/>
                  </div>
                  <span className="font-mono text-[11px]" style={{ color: "var(--accent)" }}>Uploading {uploadPct}%…</span>
                </div>
              ) : (
                <span className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>Click to upload logo</span>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage}/>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Company Name *" span={2}>
              <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Acme Corp" required className={iCls} style={iSty}/>
            </Field>
            <Field label="Status">
              <Sel name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Sel>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Priority">
              <Sel name="priority" value={form.priority} onChange={handleChange}>
                {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Sel>
            </Field>
            <Field label="Lead Source">
              <Sel name="leadSource" value={form.leadSource} onChange={handleChange}>
                <option value="">Select source</option>
                {LEAD_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </Field>
            <Field label="Follow-up Date">
              <input type="date" name="followUpDate" value={form.followUpDate ?? ""} onChange={handleChange} className={iCls} style={iSty}/>
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Country">
              <Sel name="country" value={form.country} onChange={handleChange}>
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Sel>
            </Field>
            <Field label="City"><Inp name="city" value={form.city} onChange={handleChange} placeholder="Lahore"/></Field>
            <Field label="Email"><Inp name="email" value={form.email} onChange={handleChange} placeholder="contact@co.com" type="email"/></Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Phone"><Inp name="phone" value={form.phone} onChange={handleChange} placeholder="+92 300 0000000"/></Field>
            <Field label="WhatsApp"><Inp name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+92 300 0000000"/></Field>
            <Field label="Website"><Inp name="website" value={form.website} onChange={handleChange} placeholder="https://…" type="url"/></Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Social Links"><Inp name="socialLinks" value={form.socialLinks} onChange={handleChange} placeholder="LinkedIn / Instagram"/></Field>
            <Field label="Tags (comma separated)">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="hot, enterprise" className={iCls} style={iSty}/>
            </Field>
          </div>

          <label className="flex items-center gap-3" style={{ cursor: "pointer" }}>
            <div className="relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
              style={{ background: form.hasWhatsapp ? "linear-gradient(135deg, var(--accent), var(--cyan))" : "var(--border2)" }}
              onClick={() => field("hasWhatsapp", !form.hasWhatsapp)}>
              <span className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: form.hasWhatsapp ? "calc(100% - 20px)" : "4px" }}/>
            </div>
            <span className="text-[13px] font-body" style={{ color: "var(--ink2)" }}>WhatsApp number is active</span>
          </label>

          <Field label="Notes / Proposal">
            <textarea name="proposal" value={form.proposal} onChange={handleChange} rows={4}
              placeholder="Notes, context, next steps…"
              className="px-3 py-2.5 rounded-xl text-[13px] outline-none resize-none border border-[var(--border2)] transition-colors duration-200 leading-relaxed"
              style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"; }}/>
          </Field>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px]"
              style={{ background: "rgba(239,68,68,0.07)", borderColor: "rgba(239,68,68,0.2)", color: "var(--red)" }}>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2 sticky bottom-0 -mx-6 px-6 pb-6 mt-auto"
            style={{ background: "var(--bg-panel)", borderTop: "1px solid var(--border)" }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all border"
              style={{ borderColor: "var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: "pointer" }}>
              {saving
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Saving…
                  </span>
                : isEdit ? "Save Changes" : "Add Lead →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRM
// ══════════════════════════════════════════════════════════════════════════════

function DeleteConfirm({ name, onConfirm, onCancel }: {
  name: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-[380px] rounded-2xl p-7 text-center"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)", animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <h3 className="font-display text-[17px] font-bold mb-2" style={{ color: "var(--ink)" }}>Delete Lead?</h3>
        <p className="text-[13px] mb-6 font-body" style={{ color: "var(--ink4)" }}>
          "<strong style={{ color: "var(--ink3)" }}>{name}</strong>" will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-[13px] border"
            style={{ borderColor: "var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #e53535, #EF4444)", cursor: "pointer", border: "none" }}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// LEAD MODAL
// ══════════════════════════════════════════════════════════════════════════════

function LeadModal({ lead, onClose, onEdit, onAudit, onSendEmail, aiLoading }: {
  lead: FirestoreLead;
  onClose: () => void;
  onEdit: () => void;
  onAudit: (id: string) => void;
  onSendEmail: (id: string, type: FollowUpKey, customSubject?: string, customBody?: string) => void;
  aiLoading: boolean;
}) {
  const [tab, setTab] = useState<"details" | "emails" | "notes">("details");

  const [composing,   setComposing]   = useState(false);
  const [genLoading,  setGenLoading]  = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody,    setEditBody]    = useState("");
  const [pendingType, setPendingType] = useState<FollowUpKey | null>(null);

  const st        = getStatus(lead.status);
  const pc        = getPriorityColor(lead.priority);
  const score     = lead.leadScore ?? calcScore(lead);
  const audit     = getAuditData(lead);
  const mailHist  = getMailHistory(lead);
  const nextEmail = getNextEmailType(lead);
  // id is optional — fall back to empty string for callbacks
  const leadId    = lead.id ?? "";

  async function handleOpenCompose(emailType: FollowUpKey) {
    setPendingType(emailType);
    setComposing(true);
    setGenLoading(true);
    setEditSubject("");
    setEditBody("");
    try {
      const prev = getMailHistory(lead).filter((m) => m.bodySnapshot).map((m) => m.bodySnapshot!);
      const res  = await generateEmail(lead, emailType, prev);
      setEditSubject(res.subject);
      setEditBody(res.body);
    } catch {
      setEditSubject("Follow-up from ZynHive");
      setEditBody(`Hi ${lead.companyName} Team,\n\nI wanted to follow up on my previous message. Would you be open to a quick 10-minute call?\n\nBest regards`);
    } finally {
      setGenLoading(false);
    }
  }

  function handleCancelCompose() {
    setComposing(false); setPendingType(null); setEditSubject(""); setEditBody("");
  }

  function handleConfirmSend() {
    if (!pendingType) return;
    onSendEmail(leadId, pendingType, editSubject, editBody);
    setComposing(false); setPendingType(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-[680px] max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)", boxShadow: "0 32px 80px rgba(0,0,0,0.45)", animation: "fadeScaleIn .3s cubic-bezier(0.16,1,0.3,1) both" }}>

        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {lead.imageUrl
              ? <img src={lead.imageUrl} alt={lead.companyName} className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
                  style={{ background: "var(--bg-panel)", border: "1px solid var(--border2)", padding: 4 }}/>
              : <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-display text-xl font-bold text-white"
                  style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}>
                  {lead.companyName[0]}
                </div>
            }
            <div className="min-w-0">
              <h2 className="font-display text-[20px] font-bold tracking-tight truncate" style={{ color: "var(--ink)" }}>
                {lead.companyName}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold tracking-widest" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                <span className="px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold" style={{ background: `${pc}18`, color: pc }}>{lead.priority?.toUpperCase()}</span>
                <MailStatusBadge lead={lead}/>
                <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                  Score: <strong style={{ color: score > 70 ? "#10B981" : score > 40 ? "#F59E0B" : "#EF4444" }}>{score}</strong>
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {(["details", "emails", "notes"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-xl font-mono text-[11px] tracking-[0.08em] uppercase transition-all duration-200 capitalize"
              style={{ background: tab === t ? "var(--accent-pale)" : "transparent", color: tab === t ? "var(--accent)" : "var(--ink4)", border: tab === t ? "1px solid var(--accent-pale2)" : "1px solid transparent", cursor: "pointer" }}>
              {t}{t === "emails" && mailHist.length > 0 ? ` (${mailHist.length})` : ""}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* DETAILS TAB */}
          {tab === "details" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: "Email",     val: lead.email,       href: `mailto:${lead.email}` },
                  { label: "Phone",     val: lead.phone,       href: `tel:${lead.phone}` },
                  { label: "WhatsApp",  val: lead.whatsapp,    href: lead.hasWhatsapp ? `https://wa.me/${lead.whatsapp?.replace(/\D/g, "")}` : undefined },
                  { label: "Website",   val: lead.website,     href: lead.website },
                  { label: "Country",   val: lead.country,     href: undefined },
                  { label: "City",      val: lead.city,        href: undefined },
                  { label: "Source",    val: lead.leadSource,  href: undefined },
                  { label: "Assigned",  val: lead.employeeName,href: undefined },
                  { label: "Follow-up", val: lead.followUpDate ? new Date(lead.followUpDate).toLocaleDateString() : null, href: undefined },
                  { label: "Social",    val: lead.socialLinks, href: undefined },
                ] as { label: string; val: string | null | undefined; href?: string }[])
                  .filter((r) => r.val)
                  .map(({ label, val, href }) => (
                    <div key={label} className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                      <span className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: "var(--ink4)" }}>{label}</span>
                      {href
                        ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-[13px] font-body truncate" style={{ color: "var(--accent)" }}>{val}</a>
                        : <span className="text-[13px] font-body truncate" style={{ color: "var(--ink)" }}>{val}</span>
                      }
                    </div>
                  ))}
              </div>

              <div className="p-4 rounded-xl" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: "var(--ink4)" }}>🤖 AI Website Audit</span>
                  {lead.website && (
                    <button onClick={() => onAudit(leadId)} disabled={aiLoading}
                      className="font-mono text-[10px] px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
                      style={{ background: "var(--accent-pale)", color: "var(--accent)", cursor: aiLoading ? "wait" : "pointer", border: "1px solid var(--accent-pale2)" }}>
                      {audit ? "Re-audit" : "Run Audit"}
                    </button>
                  )}
                </div>
                {audit ? (
                  <div className="flex flex-col gap-2">
                    <AuditTags audit={audit}/>
                    <p className="text-[12px] font-body leading-relaxed" style={{ color: "var(--ink3)" }}>{audit.summary}</p>
                    <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                      Score: <strong style={{ color: audit.score > 70 ? "#10B981" : audit.score > 40 ? "#F59E0B" : "#EF4444" }}>{audit.score}/100</strong>
                    </span>
                  </div>
                ) : (
                  <p className="text-[12px] font-body" style={{ color: "var(--ink4)" }}>
                    {lead.website ? "Click 'Run Audit' to analyse" : "No website provided"}
                  </p>
                )}
              </div>

              {lead.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((t) => (
                    <span key={t} className="font-mono text-[10px] px-2.5 py-1 rounded-xl"
                      style={{ background: "var(--bg-panel)", border: "1px solid var(--border2)", color: "var(--ink4)" }}>{t}</span>
                  ))}
                </div>
              )}

              {lead.proposal && (
                <div className="p-4 rounded-xl" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                  <p className="font-mono text-[9px] tracking-[0.12em] uppercase mb-2" style={{ color: "var(--ink4)" }}>Notes</p>
                  <p className="text-[13px] font-body leading-relaxed" style={{ color: "var(--ink3)" }}>{lead.proposal}</p>
                </div>
              )}
            </div>
          )}

          {/* EMAILS TAB */}
          {tab === "emails" && (
            <div className="flex flex-col gap-4">
              {composing ? (
                <div className="flex flex-col gap-3 p-4 rounded-2xl" style={{ background: "var(--bg-alt)", border: "1px solid var(--accent-pale2)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-[14px] font-bold" style={{ color: "var(--ink)" }}>
                        ✏️ {FOLLOW_UP_SEQUENCE.find((s) => s.key === pendingType)?.label}
                      </span>
                      {genLoading && (
                        <span className="flex items-center gap-1.5">
                          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" style={{ color: "var(--accent)" }}/>
                          <span className="font-mono text-[10px]" style={{ color: "var(--accent)" }}>AI writing…</span>
                        </span>
                      )}
                    </div>
                    <button onClick={handleCancelCompose}
                      className="font-mono text-[10px] px-2.5 py-1 rounded-lg"
                      style={{ color: "var(--ink4)", border: "1px solid var(--border2)", cursor: "pointer", background: "transparent" }}>
                      ✕ Cancel
                    </button>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                    <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>To:</span>
                    <span className="font-mono text-[11px] font-semibold" style={{ color: "var(--ink)" }}>{lead.email}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Subject</span>
                    <input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} disabled={genLoading}
                      placeholder={genLoading ? "AI generating…" : "Email subject…"}
                      className="px-3 py-2.5 rounded-xl text-[13px] outline-none border border-[var(--border2)] w-full transition-colors"
                      style={{ background: "var(--bg-surface)", color: "var(--ink)", opacity: genLoading ? 0.5 : 1 }}
                      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
                      onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}/>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>Body</span>
                      <span className="font-mono text-[9px]" style={{ color: "var(--ink4)" }}>{editBody.split(" ").filter(Boolean).length} words</span>
                    </div>
                    <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} disabled={genLoading} rows={8}
                      placeholder={genLoading ? "AI is crafting your email…" : "Email body…"}
                      className="px-3 py-2.5 rounded-xl text-[13px] outline-none border border-[var(--border2)] w-full resize-none leading-relaxed transition-colors"
                      style={{ background: "var(--bg-surface)", color: "var(--ink)", opacity: genLoading ? 0.5 : 1 }}
                      onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)"; }}
                      onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"; }}/>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => pendingType && handleOpenCompose(pendingType)}
                      disabled={genLoading || aiLoading}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-50"
                      style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M1 6A5 5 0 1 0 6 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        <path d="M1 1v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Regenerate
                    </button>
                    <button onClick={handleConfirmSend}
                      disabled={genLoading || aiLoading || !editSubject || !editBody}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: genLoading || aiLoading ? "wait" : "pointer", border: "none" }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <rect x="1" y="2.5" width="11" height="8" rx="1.5" stroke="white" strokeWidth="1.1" fill="none"/>
                        <path d="M1 3.5l5.5 4 5.5-4" stroke="white" strokeWidth="1.1" fill="none"/>
                      </svg>
                      {aiLoading ? "Sending…" : `Send to ${lead.email}`}
                    </button>
                  </div>
                </div>
              ) : (
                nextEmail ? (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => onSendEmail(leadId, nextEmail)} disabled={aiLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: aiLoading ? "wait" : "pointer", border: "none" }}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.2" fill="none"/>
                        <path d="M1 4l6 3.5L13 4" stroke="white" strokeWidth="1.2" fill="none"/>
                      </svg>
                      {aiLoading ? "Generating…" : `⚡ Quick Send — ${FOLLOW_UP_SEQUENCE.find((s) => s.key === nextEmail)?.label}`}
                    </button>
                    <button onClick={() => handleOpenCompose(nextEmail)} disabled={aiLoading}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
                      style={{ border: "1px solid var(--accent-pale2)", color: "var(--accent)", background: "var(--accent-pale)", cursor: aiLoading ? "wait" : "pointer" }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M9.5 1.5l2 2L5 10H3V8L9.5 1.5z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
                      </svg>
                      ✏️ Customize then Send
                    </button>
                    <p className="font-mono text-[9px] text-center" style={{ color: "var(--ink4)" }}>
                      Quick Send = AI generates &amp; sends instantly &nbsp;|&nbsp; Customize = review &amp; edit before sending
                    </p>
                  </div>
                ) : mailHist.length > 0 ? (
                  <div className="text-center py-3 rounded-xl font-mono text-[12px]"
                    style={{ background: "rgba(34,197,94,0.08)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" }}>
                    ✓ All follow-up emails completed
                  </div>
                ) : null
              )}

              {!composing && (
                mailHist.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="font-body text-[14px]" style={{ color: "var(--ink4)" }}>No emails sent yet</p>
                    <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>Use the buttons above to send your first email</p>
                  </div>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "var(--border2)" }}/>
                    {mailHist.map((mail, i) => (
                      <div key={i} className="relative pb-5 last:pb-0">
                        <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full border-2"
                          style={{ borderColor: "var(--bg-surface)", background: mail.status === "sent" ? "#22c55e" : "#ef4444" }}/>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-display text-[13px] font-semibold" style={{ color: "var(--ink)" }}>
                            {FOLLOW_UP_SEQUENCE.find((s) => s.key === mail.type)?.label ?? mail.type}
                          </span>
                          <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{fmtDate(mail.date)}</span>
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded-md uppercase font-bold"
                            style={{ color: mail.status === "sent" ? "#86efac" : "#fca5a5", background: mail.status === "sent" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)" }}>
                            {mail.status}
                          </span>
                        </div>
                        {mail.subject && <p className="font-mono text-[11px] mb-1" style={{ color: "var(--ink3)" }}>Subject: {mail.subject}</p>}
                        {mail.bodySnapshot && (
                          <details className="mt-1">
                            <summary className="font-mono text-[10px] cursor-pointer" style={{ color: "var(--accent)" }}>View email body</summary>
                            <div className="mt-1.5 p-3 rounded-lg text-[11px] font-body leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto"
                              style={{ color: "var(--ink3)", background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                              {mail.bodySnapshot}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* NOTES TAB */}
          {tab === "notes" && (
            <div>
              {lead.notes?.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {lead.notes.map((n, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: "var(--bg-alt)", border: "1px solid var(--border)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-[13px] font-bold" style={{ color: "var(--ink)" }}>{n.employeeName}</span>
                        <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                          {n.date ? new Date(n.date).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-[13px] font-body" style={{ color: "var(--ink3)" }}>{n.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 font-body text-[14px]" style={{ color: "var(--ink4)" }}>No notes yet</p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border"
            style={{ borderColor: "var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
            Close
          </button>
          <button onClick={onEdit} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: "pointer", border: "none" }}>
            Edit Lead →
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// AI SEARCH MODAL
// ══════════════════════════════════════════════════════════════════════════════

function AiSearchModal({ onClose, onImport }: {
  onClose: () => void;
  onImport: (leads: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">[]) => Promise<void>;
}) {
  const [keyword,   setKeyword]   = useState("");
  const [location,  setLocation]  = useState("");
  const [limit,     setLimit]     = useState(20);
  const [searching, setSearching] = useState(false);
  const [results,   setResults]   = useState<(ScrapedLead & { selected: boolean })[]>([]);
  const [importing, setImporting] = useState(false);
  const [err,       setErr]       = useState("");
  const [source,    setSource]    = useState<string>("");

  async function handleSearch() {
    if (!keyword || !location) return;
    setSearching(true); setErr(""); setResults([]); setSource("");
    try {
      const res = await scrapeGoogleMaps({ keyword, location, limit });
      setResults(res.leads.map((r) => ({ ...r, selected: true })));
      setSource(res.source);
      if (res.error) setErr(res.error);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Search failed");
    } finally { setSearching(false); }
  }

  async function handleImport() {
    const sel = results.filter((r) => r.selected);
    if (!sel.length) return;
    setImporting(true);
    await onImport(sel.map((r): Omit<FirestoreLead, "id" | "createdAt" | "updatedAt"> => ({
      ...EMPTY_FORM,
      companyName: r.companyName,
      email:       r.email,
      phone:       r.phone,
      website:     r.website,
      country:     r.country,
      city:        r.city,
      leadSource:  "Google Maps",
      proposal: [
        r.address   ? `Address: ${r.address}`                          : "",
        r.rating    ? `Rating: ${r.rating}⭐ (${r.reviews} reviews)`   : "",
        r.mapsUrl   ? `Maps: ${r.mapsUrl}`                             : "",
        r.instagram ? `Instagram: ${r.instagram}`                      : "",
        r.facebook  ? `Facebook: ${r.facebook}`                        : "",
      ].filter(Boolean).join("\n"),
      tags: [keyword.toLowerCase(), r.category?.toLowerCase() ?? ""].filter(Boolean),
    })));
    setImporting(false);
    onClose();
  }

  const sourceLabel: Record<string, { text: string; color: string }> = {
    "hasdata":    { text: "📍 Real Google Maps Data", color: "#10B981" },
    "outscraper": { text: "📍 Real Google Maps Data", color: "#10B981" },
    "ai-sample":  { text: "🤖 AI Sample Data",        color: "#F59E0B" },
  };
  const srcInfo = sourceLabel[source];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[620px] max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)", animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-[17px] font-bold" style={{ color: "var(--ink)" }}>📍 Google Maps Lead Scraper</h2>
            <p className="font-mono text-[10px] mt-0.5" style={{ color: "var(--ink4)" }}>Extract real business data from Google Maps</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}>✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex flex-col gap-1">
            <Label>Industry / Keyword</Label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="e.g. Real Estate Agency"
              className="px-3 py-2.5 rounded-xl text-[13px] outline-none border border-[var(--border2)] w-full"
              style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}/>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Location</Label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Karachi, Pakistan"
              className="px-3 py-2.5 rounded-xl text-[13px] outline-none border border-[var(--border2)] w-full"
              style={{ background: "var(--bg-alt)", color: "var(--ink)" }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}/>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex flex-col gap-1 flex-1">
            <Label>Max Results</Label>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl text-[13px] outline-none border border-[var(--border2)] w-full"
              style={{ background: "var(--bg-alt)", color: "var(--ink)", cursor: "pointer" }}>
              <option value={10}>10 leads</option>
              <option value={20}>20 leads</option>
              <option value={50}>50 leads</option>
              <option value={100}>100 leads</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <Label>Data Source</Label>
            <div className="px-3 py-2.5 rounded-xl text-[11px] font-mono border border-[var(--border2)]"
              style={{ background: "var(--bg-alt)", color: HASDATA_KEY || OUTSCRAPER_KEY ? "#10B981" : "#F59E0B" }}>
              {HASDATA_KEY ? "✅ HasData (Real Maps)" : OUTSCRAPER_KEY ? "✅ Outscraper (Real Maps)" : "⚠️ AI Sample (No key set)"}
            </div>
          </div>
        </div>

        <button onClick={handleSearch} disabled={searching || !keyword || !location}
          className="w-full py-3 rounded-xl text-[13px] font-semibold text-white mb-4 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: searching ? "wait" : "pointer", border: "none" }}>
          {searching
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Scraping Google Maps…</>
            : "📍 Scrape Google Maps"}
        </button>

        {!HASDATA_KEY && !OUTSCRAPER_KEY && (
          <div className="mb-4 px-3 py-2.5 rounded-xl border text-[11px] font-mono"
            style={{ background: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.2)", color: "#fde68a" }}>
            ⚠️ Real data ke liye free API key add karo in .env:<br/>
            <span style={{ color: "var(--accent)" }}>hasdata.com</span> → 1,000 free calls/month →{" "}
            <strong>VITE_HASDATA_API_KEY=xxx</strong>
          </div>
        )}

        {err && (
          <div className="mb-4 px-3 py-2.5 rounded-xl border text-[11px] font-mono"
            style={{ background: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.2)", color: "#fde68a" }}>
            ⚠️ {err}
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between px-4 py-2.5 rounded-t-xl"
              style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", borderBottom: "none" }}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
                  {results.length} businesses found
                </span>
                {srcInfo && (
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-md font-bold"
                    style={{ background: `${srcInfo.color}15`, color: srcInfo.color, border: `1px solid ${srcInfo.color}25` }}>
                    {srcInfo.text}
                  </span>
                )}
              </div>
              <button
                onClick={() => setResults((p) => p.map((r) => ({ ...r, selected: !p.every((x) => x.selected) })))}
                className="font-mono text-[10px]"
                style={{ color: "var(--accent)", cursor: "pointer", background: "none", border: "none" }}>
                Toggle All
              </button>
            </div>

            <div className="rounded-b-xl overflow-hidden mb-4" style={{ border: "1px solid var(--border2)" }}>
              {results.map((r, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors"
                  style={{ borderColor: "var(--border)", background: r.selected ? "var(--accent-pale)" : "transparent" }}>
                  <input type="checkbox" checked={r.selected}
                    onChange={() => setResults((p) => p.map((x, j) => j === i ? { ...x, selected: !x.selected } : x))}
                    className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ accentColor: "var(--accent)" }}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>{r.companyName}</span>
                      {r.rating > 0 && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
                          ⭐ {r.rating} ({r.reviews})
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] truncate" style={{ color: "var(--ink4)" }}>
                      {r.phone || "—"} · {r.email || "no email"} · {r.website || "no website"}
                    </div>
                    {r.address && (
                      <div className="font-mono text-[9px] mt-0.5 truncate" style={{ color: "var(--ink4)" }}>📍 {r.address}</div>
                    )}
                  </div>
                  {r.mapsUrl && (
                    <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-[9px] px-2 py-1 rounded flex-shrink-0"
                      style={{ color: "var(--accent)", border: "1px solid var(--accent-pale2)", background: "var(--accent-pale)", cursor: "pointer" }}
                      onClick={(e) => e.stopPropagation()}>
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>

            <button onClick={handleImport} disabled={importing || results.filter((r) => r.selected).length === 0}
              className="w-full py-3 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: importing ? "wait" : "pointer", border: "none" }}>
              {importing ? "Importing…" : `Import ${results.filter((r) => r.selected).length} Leads to CRM`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSE MODAL (batch)
// ══════════════════════════════════════════════════════════════════════════════

function ComposeModal({ leads, onClose, onSend }: {
  leads: FirestoreLead[];
  onClose: () => void;
  onSend: (leads: FirestoreLead[], type: FollowUpKey) => Promise<void>;
}) {
  const [emailType, setEmailType] = useState<FollowUpKey>("initial");
  const [preview,   setPreview]   = useState("");
  const [subject,   setSubject]   = useState("");
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);

  useEffect(() => {
    if (!leads.length) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const prev = getMailHistory(leads[0]).filter((m) => m.bodySnapshot).map((m) => m.bodySnapshot!);
        const res  = await generateEmail(leads[0], emailType, prev);
        if (!cancelled) { setPreview(res.body); setSubject(res.subject); }
      } catch {
        if (!cancelled) {
          setPreview("(Preview failed — leads will still get personalised emails)");
          setSubject(`Follow-up for ${leads[0].companyName}`);
        }
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [leads, emailType]);

  async function handleSend() { setSending(true); await onSend(leads, emailType); setSending(false); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="w-full max-w-[580px] max-h-[85vh] overflow-y-auto rounded-2xl p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)", animation: "fadeScaleIn .25s cubic-bezier(0.16,1,0.3,1) both" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-[17px] font-bold" style={{ color: "var(--ink)" }}>📧 AI Email Composer</h2>
            <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>
              Sending to <strong style={{ color: "var(--ink)" }}>{leads.length}</strong> lead{leads.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}>✕</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {FOLLOW_UP_SEQUENCE.map((step) => (
            <button key={step.key} onClick={() => setEmailType(step.key)}
              className="px-3 py-2 rounded-xl font-mono text-[11px] font-semibold transition-all duration-150"
              style={{ cursor: "pointer", background: emailType === step.key ? "linear-gradient(135deg, var(--accent), var(--cyan))" : "var(--bg-alt)", color: emailType === step.key ? "white" : "var(--ink4)", border: `1px solid ${emailType === step.key ? "transparent" : "var(--border2)"}` }}>
              {step.label}
            </button>
          ))}
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--ink4)" }}>
              Preview ({leads[0]?.companyName})
            </span>
            {loading && (
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" style={{ color: "var(--accent)" }}/>
                <span className="font-mono text-[10px]" style={{ color: "var(--accent)" }}>Generating...</span>
              </span>
            )}
          </div>
          <div className="px-3 py-2 rounded-t-xl font-mono text-[12px]"
            style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", borderBottom: "none", color: "var(--ink3)" }}>
            <span style={{ color: "var(--ink4)" }}>Subject:</span>{" "}
            <span style={{ color: "var(--ink)" }}>{loading ? "..." : subject}</span>
          </div>
          <div className="p-4 rounded-b-xl font-body text-[12px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto"
            style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)", color: loading ? "var(--ink4)" : "var(--ink3)" }}>
            {loading ? "✨ AI is crafting a personalised email..." : preview}
          </div>
          <p className="font-mono text-[9px] mt-1.5" style={{ color: "var(--ink4)" }}>Each lead gets a unique AI-personalised version</p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-[13px] font-medium"
            style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
            Cancel
          </button>
          <button onClick={handleSend} disabled={sending || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: sending ? "wait" : "pointer", border: "none" }}>
            {sending
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sending...</>
              : `Send ${leads.length} Email${leads.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN LeadTab
// ══════════════════════════════════════════════════════════════════════════════

interface Props { showToast: (msg: string, type?: "success" | "error") => void; }

export function LeadTab({ showToast }: Props) {
  const [leads,        setLeads]        = useState<FirestoreLead[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [statusF,      setStatusF]      = useState("all");
  const [priorityF,    setPriorityF]    = useState("all");
  const [countryF,     setCountryF]     = useState("all");
  const [formOpen,     setFormOpen]     = useState(false);
  const [editLead,     setEditLead]     = useState<FirestoreLead | null>(null);
  const [viewLead,     setViewLead]     = useState<FirestoreLead | null>(null);
  const [deleteTgt,    setDeleteTgt]    = useState<FirestoreLead | null>(null);
  const [subTab,       setSubTab]       = useState<"all" | "followups" | "crm-analytics">("all");
  const [aiLoading,    setAiLoading]    = useState<string | null>(null);
  const [selectedIds,  setSelectedIds]  = useState<Set<string>>(new Set());
  const [showCompose,  setShowCompose]  = useState(false);
  const [showAiSearch, setShowAiSearch] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try   { setLeads(await fetchLeads()); }
    catch { showToast("Failed to load leads", "error"); }
    finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id: string) => setSelectedIds((p) => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleSelectAll = (ids: string[]) => setSelectedIds((p) => {
    const all = ids.every((id) => p.has(id));
    const n   = new Set(p);
    all ? ids.forEach((id) => n.delete(id)) : ids.forEach((id) => n.add(id));
    return n;
  });
  const selectedLeads = useMemo(() => leads.filter((l) => l.id && selectedIds.has(l.id)), [leads, selectedIds]);

  // ── AI: Audit ──────────────────────────────────────────────────────────────
  async function handleAudit(leadId: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead?.website) { showToast("No website to audit", "error"); return; }
    setAiLoading(`Auditing ${lead.website}…`);
    try {
      const result = await auditWebsite(lead.website);
      // auditData is a typed field on FirestoreLead — no cast needed
      const update: LeadUpdate = { auditData: result };
      await updateLead(leadId, update);
      await load();
      showToast(`Audit done — Score: ${result.score}/100`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      showToast(msg.includes("key") ? "API key missing — check .env" : "AI audit failed", "error");
    } finally { setAiLoading(null); }
  }

  // ── AI: Generate + Send Email ──────────────────────────────────────────────
  async function handleSendEmail(
    leadId: string,
    emailType: FollowUpKey,
    customSubject?: string,
    customBody?: string,
  ) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    if (!lead.email) { showToast(`${lead.companyName} has no email address`, "error"); return; }

    setAiLoading(`Sending email to ${lead.companyName}…`);
    try {
      let subject = customSubject ?? "";
      let body    = customBody    ?? "";

      if (!subject || !body) {
        setAiLoading(`Generating email for ${lead.companyName}…`);
        const prev   = getMailHistory(lead).filter((m) => m.bodySnapshot).map((m) => m.bodySnapshot!);
        const result = await generateEmail(lead, emailType, prev);
        subject = result.subject;
        body    = result.body;
      }

      setAiLoading(`Sending email to ${lead.email}…`);
      const sendResult = await sendEmail({ to: lead.email, subject, body });
      const status: "sent" | "failed" = sendResult.success ? "sent" : "failed";

      const history: MailEntry[] = [...getMailHistory(lead), { date: today(), type: emailType, status, subject, bodySnapshot: body }];
      const update: LeadUpdate = {
        mailHistory:   history,
        lastContacted: today(),
        followUpCount: (lead.followUpCount ?? 0) + 1,
        status:        lead.status === "new" ? "contacted" : lead.status,
      };
      await updateLead(leadId, update);
      await load();

      if (sendResult.success) showToast(`✉️ Email sent to ${lead.companyName}`);
      else showToast(`Email generated but send failed: ${sendResult.error ?? "unknown error"}`, "error");

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      showToast(msg.includes("key") ? "API key missing" : "Email generation failed", "error");
    } finally { setAiLoading(null); }
  }

  // ── Batch Send ─────────────────────────────────────────────────────────────
  async function handleBatchSend(targetLeads: FirestoreLead[], emailType: FollowUpKey) {
    setAiLoading(`Generating ${targetLeads.length} emails…`);
    let sent = 0;
    try {
      const emailMap = await generateBatchEmails(targetLeads, emailType);
      for (let i = 0; i < targetLeads.length; i++) {
        const lead = targetLeads[i];
        if (!lead?.email || !lead.id) continue;
        setAiLoading(`Sending ${i + 1}/${targetLeads.length}: ${lead.companyName}…`);
        const content = emailMap.get(lead.id);
        if (!content) continue;
        try {
          const sendResult = await sendEmail({ to: lead.email, subject: content.subject, body: content.body });
          const status: "sent" | "failed" = sendResult.success ? "sent" : "failed";
          const history: MailEntry[] = [
            ...getMailHistory(lead),
            { date: today(), type: emailType, status, subject: content.subject, bodySnapshot: content.body },
          ];
          const update: LeadUpdate = {
            mailHistory:   history,
            lastContacted: today(),
            followUpCount: (lead.followUpCount ?? 0) + 1,
            status:        lead.status === "new" ? "contacted" : lead.status,
          };
          await updateLead(lead.id, update);
          if (sendResult.success) sent++;
        } catch { /* continue to next */ }
        if (i < targetLeads.length - 1) await new Promise((r) => setTimeout(r, 600));
      }
      setSelectedIds(new Set());
      await load();
      showToast(`✉️ Sent ${sent}/${targetLeads.length} emails`);
    } catch { showToast("Batch send failed", "error"); }
    finally { setAiLoading(null); }
  }

  async function handleAiImport(newLeads: Omit<FirestoreLead, "id" | "createdAt" | "updatedAt">[]) {
    for (const lead of newLeads) await createLead(lead);
    await load();
    showToast(`${newLeads.length} leads imported!`);
  }

  async function handleDelete() {
    if (!deleteTgt?.id) return;
    try {
      await deleteLead(deleteTgt.id);
      setDeleteTgt(null);
      await load();
      showToast(`"${deleteTgt.companyName}" deleted`);
    } catch { showToast("Delete failed", "error"); }
  }

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filtered = leads.filter((l) => {
    const q  = search.toLowerCase();
    const ms = !q
      || l.companyName?.toLowerCase().includes(q)
      || l.email?.toLowerCase().includes(q)
      || l.phone?.includes(q)
      || l.country?.toLowerCase().includes(q)
      || l.city?.toLowerCase().includes(q)
      || l.tags?.some((t) => t.toLowerCase().includes(q));
    return ms
      && (statusF   === "all" || l.status   === statusF)
      && (priorityF === "all" || l.priority === priorityF)
      && (countryF  === "all" || l.country  === countryF);
  });

  const dueFollowUps = useMemo(
    () => leads.filter((l) => getDueFollowUp(l) !== null && l.status !== "closed" && l.status !== "lost"),
    [leads],
  );

  const stats = {
    total:       leads.length,
    new:         leads.filter((l) => l.status === "new").length,
    closed:      leads.filter((l) => l.status === "closed").length,
    high:        leads.filter((l) => l.priority === "high").length,
    emailsSent:  leads.reduce((a, l) => a + getMailHistory(l).length, 0),
    dueFollowUps: dueFollowUps.length,
  };

  const countries = [...new Set(leads.map((l) => l.country).filter((c): c is string => Boolean(c)))].sort();
  const selStyle  = "px-3 py-2 rounded-xl text-[12px] font-mono border border-[var(--border2)] outline-none transition-colors";
  const selInline = { background: "var(--bg-surface)", color: "var(--ink4)", cursor: "pointer" };

  // Always read the latest version of viewLead from the leads array
  const resolvedView = viewLead ? (leads.find((l) => l.id === viewLead.id) ?? viewLead) : null;

  return (
    <div className="p-6 flex flex-col gap-5">
      {aiLoading && <AiOverlay message={aiLoading}/>}

      {!AI_ENABLED && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.2)", color: "#fde68a" }}>
          <span>⚠️</span>
          <span className="font-mono text-[11px]">
            AI features disabled — add <strong>VITE_OPENROUTER_API_KEY</strong> to .env and restart.
            Get free key: <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" style={{ color: "var(--accent)" }}>openrouter.ai/keys</a>
          </span>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex rounded-xl p-1" style={{ background: "var(--bg-alt)", border: "1px solid var(--border2)" }}>
          {([
            { id: "all"            as const, label: "All Leads",  count: stats.total        },
            { id: "followups"      as const, label: "Follow-ups", count: stats.dueFollowUps },
            { id: "crm-analytics"  as const, label: "CRM Stats",  count: null               },
          ]).map(({ id, label, count }) => (
            <button key={id} onClick={() => setSubTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[11px] font-semibold transition-all duration-200"
              style={{ cursor: "pointer", background: subTab === id ? "linear-gradient(135deg, var(--accent), var(--cyan))" : "transparent", color: subTab === id ? "white" : "var(--ink4)", border: "none" }}>
              {label}
              {count !== null && count > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                  style={{ background: subTab === id ? "rgba(255,255,255,0.2)" : "var(--bg-surface)", color: subTab === id ? "white" : "var(--ink4)" }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {selectedLeads.length > 0 && (
            <>
              <button onClick={() => setShowCompose(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: "pointer", border: "none" }}>
                📧 Email {selectedLeads.length}
              </button>
              <button onClick={() => setSelectedIds(new Set())}
                className="font-mono text-[10px] px-3 py-2 rounded-xl"
                style={{ color: "var(--ink4)", cursor: "pointer", background: "none", border: "1px solid var(--border2)" }}>
                Clear
              </button>
            </>
          )}
          {AI_ENABLED && (
            <button onClick={() => setShowAiSearch(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
              style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
              🤖 AI Search
            </button>
          )}
          <button onClick={() => { setEditLead(null); setFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", boxShadow: "0 4px 16px var(--accent-dim)", cursor: "pointer", border: "none" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Add Lead
          </button>
        </div>
      </div>

      {/* ─── ALL LEADS ─────────────────────────────────────────────────────── */}
      {subTab === "all" && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {([
              { label: "Total",         val: stats.total,        color: "var(--accent)"  },
              { label: "New",           val: stats.new,          color: "var(--cyan)"    },
              { label: "Closed",        val: stats.closed,       color: "#10B981"        },
              { label: "High Priority", val: stats.high,         color: "#EF4444"        },
              { label: "Emails Sent",   val: stats.emailsSent,   color: "#7B5CFA"        },
              { label: "Due Follow-up", val: stats.dueFollowUps, color: "#F59E0B"        },
            ] as const).map(({ label, val, color }) => (
              <div key={label} className="rounded-2xl p-4 flex flex-col gap-1.5 relative overflow-hidden"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${color}14, transparent 55%)` }}/>
                <span className="font-mono text-[9px] tracking-[0.14em] uppercase relative z-10" style={{ color: "var(--ink4)" }}>{label}</span>
                <span className="font-display text-[24px] font-bold leading-none relative z-10" style={{ color: "var(--ink)" }}>{val}</span>
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, ${color}60, transparent)` }}/>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--ink4)" }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1"/>
                  <path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads…"
                className="w-full pl-8 pr-4 py-2 rounded-xl text-[13px] border border-[var(--border2)] outline-none transition-colors"
                style={{ background: "var(--bg-surface)", color: "var(--ink)", cursor: "text" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}/>
            </div>
            <select value={statusF}   onChange={(e) => setStatusF(e.target.value)}   className={selStyle} style={selInline}>
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={priorityF} onChange={(e) => setPriorityF(e.target.value)} className={selStyle} style={selInline}>
              <option value="all">All Priorities</option>
              {PRIORITY_OPTIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {countries.length > 0 && (
              <select value={countryF} onChange={(e) => setCountryF(e.target.value)} className={selStyle} style={selInline}>
                <option value="all">All Countries</option>
                {countries.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <div className="font-mono text-[11px] ml-auto" style={{ color: "var(--ink4)" }}>{filtered.length} / {leads.length}</div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
            <div className="grid px-5 py-3"
              style={{ gridTemplateColumns: "36px 2fr 1fr 1fr 100px 100px 80px", background: "var(--bg-alt)", borderBottom: "1px solid var(--border2)" }}>
              <div>
                <input type="checkbox"
                  onChange={() => toggleSelectAll(filtered.map((l) => l.id ?? "").filter(Boolean))}
                  checked={filtered.length > 0 && filtered.every((l) => l.id && selectedIds.has(l.id))}
                  className="w-4 h-4" style={{ accentColor: "var(--accent)" }}/>
              </div>
              {["Company", "Status", "Priority", "Email Stage", "Audit", "Actions"].map((h) => (
                <span key={h} className="font-mono text-[9px] tracking-[0.16em] uppercase" style={{ color: "var(--ink4)" }}>{h}</span>
              ))}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-9 h-9 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--border2)", borderTopColor: "var(--accent)" }}/>
                <span className="font-mono text-[11px]" style={{ color: "var(--ink4)" }}>Loading leads…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="font-display text-[14px] font-semibold" style={{ color: "var(--ink3)" }}>
                  {search || statusF !== "all" ? "No results found" : "No leads yet"}
                </p>
              </div>
            ) : (
              filtered.map((lead) => {
                const st    = getStatus(lead.status);
                const pc    = getPriorityColor(lead.priority);
                const score = lead.leadScore ?? calcScore(lead);
                const audit = getAuditData(lead);
                const due   = getDueFollowUp(lead);
                const isSel = Boolean(lead.id && selectedIds.has(lead.id));
                return (
                  <div key={lead.id}
                    className="grid px-5 py-3.5 border-b last:border-0 group transition-colors duration-150"
                    style={{ gridTemplateColumns: "36px 2fr 1fr 1fr 100px 100px 80px", borderColor: "var(--border)", cursor: "default", background: isSel ? "var(--accent-pale)" : "transparent" }}
                    onMouseEnter={(e) => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "var(--bg-alt)"; }}
                    onMouseLeave={(e) => { if (!isSel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>

                    <div className="flex items-center">
                      <input type="checkbox" checked={isSel}
                        onChange={() => lead.id && toggleSelect(lead.id)}
                        className="w-4 h-4" style={{ accentColor: "var(--accent)" }}/>
                    </div>

                    <div className="flex items-center gap-3 min-w-0 cursor-pointer" onClick={() => setViewLead(lead)}>
                      {lead.imageUrl
                        ? <img src={lead.imageUrl} alt={lead.companyName} className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
                            style={{ background: "var(--bg-panel)", border: "1px solid var(--border2)", padding: 2 }}/>
                        : <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-white text-sm"
                            style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}>
                            {lead.companyName?.[0] ?? "?"}
                          </div>
                      }
                      <div className="min-w-0">
                        <div className="font-display text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>{lead.companyName}</div>
                        <div className="font-mono text-[10px] truncate" style={{ color: "var(--ink4)" }}>{lead.email || lead.phone || "—"}</div>
                      </div>
                      <span className="flex-shrink-0 w-6 h-6 rounded-full text-[9px] font-bold flex items-center justify-center ml-1"
                        style={{
                          background: score > 70 ? "rgba(16,185,129,0.12)" : score > 40 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                          color:      score > 70 ? "#10B981"                : score > 40 ? "#F59E0B"                : "#EF4444",
                          border:     `1px solid ${score > 70 ? "rgba(16,185,129,0.25)" : score > 40 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
                        }}>
                        {score}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <span className="px-2 py-0.5 rounded-lg font-mono text-[9px] font-bold tracking-widest" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                    </div>

                    <div className="flex items-center">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold" style={{ color: pc }}>
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: pc }}/>
                        {lead.priority}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <div className="flex flex-col gap-1">
                        <MailStatusBadge lead={lead}/>
                        {due && <span className="font-mono text-[9px] font-bold" style={{ color: "#F59E0B" }}>⏰ {due.label} due</span>}
                      </div>
                    </div>

                    <div className="flex items-center"><AuditTags audit={audit}/></div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {([
                        { title: "View",   onClick: () => setViewLead(lead),                         danger: false, icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1"/><path d="M1 6c1.5-3 3-4.5 5-4.5S10.5 3 11 6c-1.5 3-3 4.5-5 4.5S1.5 9 1 6z" stroke="currentColor" strokeWidth="1"/></svg> },
                        { title: "Edit",   onClick: () => { setEditLead(lead); setFormOpen(true); }, danger: false, icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg> },
                        { title: "Delete", onClick: () => setDeleteTgt(lead),                        danger: true,  icon: <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg> },
                      ] as const).map(({ title, onClick, danger, icon }) => (
                        <button key={title} onClick={onClick} title={title}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                          style={{ color: "var(--ink4)", cursor: "pointer", background: "transparent", border: "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = danger ? "rgba(239,68,68,0.1)" : "var(--accent-pale)"; (e.currentTarget as HTMLElement).style.color = danger ? "#EF4444" : "var(--accent)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--ink4)"; }}>
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* ─── FOLLOW-UPS ────────────────────────────────────────────────────── */}
      {subTab === "followups" && (
        <>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {FOLLOW_UP_SEQUENCE.map((step) => {
              const count = leads.filter((l) => getMailStatus(l) === step.key).length;
              const sc    = MAIL_STATUS_COLORS[step.key] ?? MAIL_STATUS_COLORS["none"];
              return (
                <div key={step.key} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                  <div className="font-display text-[22px] font-bold leading-none mb-1" style={{ color: sc.text }}>{count}</div>
                  <div className="font-mono text-[8px] uppercase tracking-wider" style={{ color: "var(--ink4)" }}>{step.label}</div>
                  <div className="font-mono text-[8px] mt-0.5" style={{ color: "var(--ink4)" }}>{step.daysAfter > 0 ? `after ${step.daysAfter}d` : "first"}</div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-display text-[15px] font-bold" style={{ color: "var(--ink)" }}>⏰ Due Follow-ups ({dueFollowUps.length})</h3>
            {dueFollowUps.length > 0 && (
              <button
                onClick={async () => {
                  for (const l of dueFollowUps) {
                    const d = getDueFollowUp(l);
                    if (d && l.id) await handleSendEmail(l.id, d.key);
                  }
                }}
                disabled={!!aiLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: aiLoading ? "wait" : "pointer", border: "none" }}>
                Send All Follow-ups
              </button>
            )}
          </div>

          {dueFollowUps.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-display text-[14px] font-semibold" style={{ color: "var(--ink3)" }}>All caught up!</p>
              <p className="font-mono text-[11px] mt-1" style={{ color: "var(--ink4)" }}>No follow-ups due right now</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
              {dueFollowUps.map((lead) => {
                const due  = getDueFollowUp(lead);
                const hist = getMailHistory(lead);
                const last = hist[hist.length - 1];
                if (!due || !last) return null;
                const days = daysAgo(last.date);
                const sc   = MAIL_STATUS_COLORS[due.key] ?? MAIL_STATUS_COLORS["none"];
                return (
                  <div key={lead.id} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{lead.companyName}</div>
                      <div className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{lead.email}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>{FOLLOW_UP_SEQUENCE.find((s) => s.key === last.type)?.label}</div>
                      <div className="font-mono text-[9px]" style={{ color: "var(--ink4)" }}>{fmtDate(last.date)}</div>
                    </div>
                    <span className="font-mono text-[12px] font-bold" style={{ color: days >= 10 ? "#ef4444" : "#F59E0B" }}>{days}d ago</span>
                    <span className="px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>{due.label}</span>
                    <button onClick={() => lead.id && handleSendEmail(lead.id, due.key)} disabled={!!aiLoading}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: aiLoading ? "wait" : "pointer", border: "none" }}>
                      Send
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {leads.filter((l) => l.status === "new" && getMailHistory(l).length === 0).length > 0 && (
            <>
              <h3 className="font-display text-[15px] font-bold mt-2" style={{ color: "var(--ink)" }}>📋 New — Review &amp; Send Initial Email</h3>
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                {leads.filter((l) => l.status === "new" && getMailHistory(l).length === 0).map((lead) => (
                  <div key={lead.id} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{lead.companyName}</div>
                      <div className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>{lead.email} · {lead.website || "no website"}</div>
                    </div>
                    <AuditTags audit={getAuditData(lead)}/>
                    <div className="flex gap-2">
                      <button onClick={() => setViewLead(lead)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                        style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
                        👁 Review
                      </button>
                      {lead.website && (
                        <button onClick={() => lead.id && handleAudit(lead.id)} disabled={!!aiLoading}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold disabled:opacity-50"
                          style={{ border: "1px solid var(--border2)", color: "var(--ink3)", cursor: "pointer", background: "transparent" }}>
                          🤖 Audit
                        </button>
                      )}
                      <button onClick={() => lead.id && handleSendEmail(lead.id, "initial")} disabled={!!aiLoading}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: aiLoading ? "wait" : "pointer", border: "none" }}>
                        📧 Send Initial
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ─── CRM ANALYTICS ─────────────────────────────────────────────────── */}
      {subTab === "crm-analytics" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { label: "Total Leads",     val: stats.total,       color: "var(--accent)", icon: "👥" },
              { label: "Emails Sent",     val: stats.emailsSent,  color: "var(--cyan)",   icon: "📧" },
              { label: "Due Follow-ups",  val: stats.dueFollowUps,color: "#F59E0B",       icon: "⏰" },
              { label: "Conversion Rate", val: stats.total > 0 ? `${Math.round((stats.closed / stats.total) * 100)}%` : "0%", color: "#10B981", icon: "📊" },
            ] as const).map(({ label, val, color, icon }) => (
              <div key={label} className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
                <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 0% 0%, ${color}10, transparent 55%)` }}/>
                <div className="flex items-center justify-between relative z-10 mb-2">
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase font-semibold" style={{ color: "var(--ink4)" }}>{label}</span>
                  <span className="text-base">{icon}</span>
                </div>
                <div className="font-display text-[28px] font-bold leading-none relative z-10"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}aa)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {val}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
            <h3 className="font-display text-[15px] font-bold mb-5" style={{ color: "var(--ink)" }}>Email Pipeline</h3>
            <div className="flex gap-1 h-10 rounded-xl overflow-hidden mb-4">
              {[{ key: "none", label: "No Emails" }, ...FOLLOW_UP_SEQUENCE].map(({ key, label }) => {
                const count = leads.filter((l) => getMailStatus(l) === key).length;
                if (!count) return null;
                const pct = Math.max((count / Math.max(leads.length, 1)) * 100, 5);
                const sc  = MAIL_STATUS_COLORS[key] ?? MAIL_STATUS_COLORS["none"];
                return (
                  <div key={key} className="flex items-center justify-center rounded-lg"
                    style={{ width: `${pct}%`, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                    title={`${label}: ${count}`}>
                    {count}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[{ key: "none", label: "No Emails" }, ...FOLLOW_UP_SEQUENCE].map(({ key, label }) => {
                const count = leads.filter((l) => getMailStatus(l) === key).length;
                if (!count) return null;
                const sc = MAIL_STATUS_COLORS[key] ?? MAIL_STATUS_COLORS["none"];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded" style={{ background: sc.text }}/>
                    <span className="font-mono text-[10px]" style={{ color: "var(--ink4)" }}>
                      {label}: <strong style={{ color: sc.text }}>{count}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
              <h3 className="font-display text-[15px] font-bold mb-5" style={{ color: "var(--ink)" }}>Lead Sources</h3>
              {(() => {
                const bySource = leads.reduce<Record<string, number>>((a, l) => {
                  const s = l.leadSource || "Unknown"; a[s] = (a[s] || 0) + 1; return a;
                }, {});
                const max = Math.max(...Object.values(bySource), 1);
                return Object.entries(bySource).sort(([, a], [, b]) => b - a).map(([src, cnt]) => (
                  <div key={src} className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>{src}</span>
                      <span className="font-mono text-[11px] font-bold" style={{ color: "var(--accent)" }}>{cnt}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.round((cnt / max) * 100)}%`, background: "linear-gradient(90deg, var(--accent), var(--cyan))" }}/>
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="rounded-2xl p-6" style={{ background: "var(--bg-surface)", border: "1px solid var(--border2)" }}>
              <h3 className="font-display text-[15px] font-bold mb-5" style={{ color: "var(--ink)" }}>Lead Status</h3>
              {STATUS_OPTIONS.map(({ value, label, color }) => {
                const cnt = leads.filter((l) => l.status === value).length;
                const pct = leads.length > 0 ? Math.round((cnt / leads.length) * 100) : 0;
                return (
                  <div key={value} className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[11px]" style={{ color: "var(--ink3)" }}>{label}</span>
                      <span className="font-mono text-[11px] font-bold" style={{ color }}>{cnt} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-alt)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Overlays */}
      {formOpen      && <LeadForm lead={editLead} onClose={() => setFormOpen(false)} onSaved={(msg) => { load(); showToast(msg); }}/>}
      {resolvedView  && <LeadModal lead={resolvedView} onClose={() => setViewLead(null)} onEdit={() => { setEditLead(resolvedView); setViewLead(null); setFormOpen(true); }} onAudit={handleAudit} onSendEmail={handleSendEmail} aiLoading={!!aiLoading}/>}
      {deleteTgt     && <DeleteConfirm name={deleteTgt.companyName} onConfirm={handleDelete} onCancel={() => setDeleteTgt(null)}/>}
      {showCompose   && selectedLeads.length > 0 && <ComposeModal leads={selectedLeads} onClose={() => setShowCompose(false)} onSend={handleBatchSend}/>}
      {showAiSearch  && <AiSearchModal onClose={() => setShowAiSearch(false)} onImport={handleAiImport}/>}
    </div>
  );
}