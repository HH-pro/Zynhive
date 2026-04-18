// ─── src/components/admin/ClientTab.tsx ──────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchClients, createClient, updateClient, deleteClient,
  fetchClientUpdates, createClientUpdate, updateClientUpdate, deleteClientUpdate,
  fetchUpdateFeedback, createUpdateFeedback,
  type FirestoreClient, type FirestoreClientUpdate, type FirestoreUpdateFeedback,
} from "../../lib/firebase";
import { sendUpdateNotificationEmail } from "../../lib/email";
import { uploadToCloudinary } from "../../lib/cloudinary";

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<FirestoreClientUpdate["status"], { label: string; color: string; bg: string }> = {
  "planning":    { label: "Planning",    color: "#6366F1", bg: "rgba(99,102,241,0.1)"  },
  "in-progress": { label: "In Progress", color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
  "review":      { label: "Review",      color: "#378ADD", bg: "rgba(55,138,221,0.1)"  },
  "completed":   { label: "Completed",   color: "#22C55E", bg: "rgba(34,197,94,0.1)"   },
  "on-hold":     { label: "On Hold",     color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FieldInput({
  label, value, onChange, placeholder = "", type = "text", required = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}{required && <span style={{ color: "var(--red)" }}> *</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "var(--bg-alt)", border: "0.5px solid var(--border2)",
          borderRadius: 8, padding: "8px 12px", fontSize: 13,
          color: "var(--ink)", outline: "none", fontFamily: "inherit",
          transition: "border-color .2s",
        }}
        onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
        onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
      />
    </div>
  );
}

function FieldTextarea({
  label, value, onChange, placeholder = "", rows = 3,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <textarea
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        style={{
          background: "var(--bg-alt)", border: "0.5px solid var(--border2)",
          borderRadius: 8, padding: "8px 12px", fontSize: 13,
          color: "var(--ink)", outline: "none", fontFamily: "inherit",
          resize: "vertical", transition: "border-color .2s",
        }}
        onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)"; }}
        onBlur={(e)  => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"; }}
      />
    </div>
  );
}

// ─── Client Form Modal ────────────────────────────────────────────────────────
function ClientFormModal({
  client, onClose, onSaved,
}: {
  client: FirestoreClient | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [name,        setName]        = useState(client?.name        ?? "");
  const [company,     setCompany]     = useState(client?.company     ?? "");
  const [email,       setEmail]       = useState(client?.email       ?? "");
  const [password,    setPassword]    = useState(client?.password    ?? "");
  const [projectName, setProjectName] = useState(client?.projectName ?? "");
  const [saving,      setSaving]      = useState(false);

  async function handleSave() {
    if (!name.trim() || !email.trim() || !password.trim()) return;
    setSaving(true);
    try {
      const data = {
        name: name.trim(), company: company.trim(), email: email.trim(),
        password: password.trim(), projectName: projectName.trim(),
      };
      if (client?.id) {
        await updateClient(client.id, data);
        onSaved("Client updated!");
      } else {
        await createClient(data);
        onSaved("Client created!");
      }
      onClose();
    } catch (err) {
      console.error("[ClientForm] save error:", err);
      onSaved("__error__Save failed — check Firestore rules");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          borderRadius: 16, padding: 28, width: "100%", maxWidth: 460,
          boxShadow: "var(--shadow-lg)",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
            {client ? "Edit Client" : "Add Client"}
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)", padding: 4, borderRadius: 6 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FieldInput label="Client Name" value={name} onChange={setName} placeholder="e.g. Ahmad Khan" required />
          <FieldInput label="Company" value={company} onChange={setCompany} placeholder="e.g. TechCorp" />
          <FieldInput label="Email" value={email} onChange={setEmail} placeholder="client@email.com" type="email" required />
          <FieldInput label="Portal Password" value={password} onChange={setPassword} placeholder="Set a login password" type="text" required />
          <FieldInput label="Project Name" value={projectName} onChange={setProjectName} placeholder="e.g. E-commerce Website" />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "0.5px solid var(--border2)", background: "transparent", color: "var(--ink3)", cursor: "pointer", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving || !name.trim() || !email.trim() || !password.trim()}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 9, border: "none",
              background: saving || !name.trim() || !email.trim() || !password.trim() ? "var(--bg-alt)" : "var(--accent)",
              color: saving || !name.trim() || !email.trim() || !password.trim() ? "var(--ink4)" : "white",
              cursor: saving || !name.trim() || !email.trim() || !password.trim() ? "default" : "pointer",
              fontSize: 13, fontWeight: 600, transition: "all .15s",
            }}
          >
            {saving ? "Saving…" : client ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Update Templates ─────────────────────────────────────────────────────────
type TemplateCategory = "seo" | "digital-marketing";
type TemplateFrequency = "daily" | "weekly";

interface UpdateTemplate {
  id:          string;
  title:       string;
  description: string;
  phase:       string;
  status:      FirestoreClientUpdate["status"];
  pct:         number;
  icon:        string;
  category:    TemplateCategory;
  frequency:   TemplateFrequency;
}

const UPDATE_TEMPLATES: UpdateTemplate[] = [
  // ── SEO Daily ─────────────────────────────────────────────────────────────
  {
    id: "seo-d-1", category: "seo", frequency: "daily", icon: "📊",
    title: "Keyword Rankings Check",
    description: "Monitored keyword positions for all target keywords. Tracked movements and flagged any significant drops or gains for immediate action.",
    phase: "SEO – Daily Monitoring", status: "in-progress", pct: 100,
  },
  {
    id: "seo-d-2", category: "seo", frequency: "daily", icon: "🔧",
    title: "On-Page Optimization",
    description: "Optimized meta titles, descriptions, and heading structure on key pages. Improved internal linking, keyword density, and content relevance.",
    phase: "SEO – On-Page", status: "completed", pct: 100,
  },
  {
    id: "seo-d-3", category: "seo", frequency: "daily", icon: "⚙️",
    title: "Technical SEO Audit",
    description: "Reviewed site crawl errors, broken links, redirect chains, and indexing issues. Resolved critical technical issues affecting search visibility.",
    phase: "SEO – Technical", status: "in-progress", pct: 75,
  },
  {
    id: "seo-d-4", category: "seo", frequency: "daily", icon: "✍️",
    title: "Content Optimization",
    description: "Updated and optimized existing content for target keywords. Improved readability scores, added semantic keywords, and updated outdated information.",
    phase: "SEO – Content", status: "completed", pct: 100,
  },
  {
    id: "seo-d-5", category: "seo", frequency: "daily", icon: "🔗",
    title: "Link Building Outreach",
    description: "Sent outreach emails for backlink acquisition. Followed up with pending prospects and identified new high-authority link opportunities.",
    phase: "SEO – Off-Page", status: "in-progress", pct: 60,
  },
  {
    id: "seo-d-6", category: "seo", frequency: "daily", icon: "📝",
    title: "Schema Markup Implementation",
    description: "Added and verified structured data markup on key pages. Implemented FAQ, Article, and LocalBusiness schema to enhance SERP appearance.",
    phase: "SEO – Technical", status: "completed", pct: 100,
  },
  {
    id: "seo-d-7", category: "seo", frequency: "daily", icon: "✏️",
    title: "Blog Post Published",
    description: "Researched, written, and published a fully SEO-optimized blog post targeting high-intent keywords. Post includes proper headings, internal links, meta description, and featured image.",
    phase: "SEO – Blog Content", status: "completed", pct: 100,
  },
  // ── SEO Weekly ────────────────────────────────────────────────────────────
  {
    id: "seo-w-1", category: "seo", frequency: "weekly", icon: "📈",
    title: "Weekly SEO Performance Report",
    description: "Comprehensive weekly SEO review covering organic traffic growth, keyword ranking changes, click-through rates, and top-performing pages. Action items identified for next week.",
    phase: "SEO – Weekly Report", status: "review", pct: 100,
  },
  {
    id: "seo-w-2", category: "seo", frequency: "weekly", icon: "🔍",
    title: "Backlink Profile Analysis",
    description: "Full backlink audit completed. Reviewed new referring domains, identified lost links, analyzed anchor text distribution, and disavowed low-quality links.",
    phase: "SEO – Off-Page Weekly", status: "completed", pct: 100,
  },
  {
    id: "seo-w-3", category: "seo", frequency: "weekly", icon: "🏆",
    title: "Competitor SEO Analysis",
    description: "Analyzed top 5 competitor SEO strategies. Identified keyword gaps, new content opportunities, and backlink prospects. Competitive gap report prepared.",
    phase: "SEO – Competitive Analysis", status: "completed", pct: 100,
  },
  {
    id: "seo-w-4", category: "seo", frequency: "weekly", icon: "📅",
    title: "Content Strategy Review",
    description: "Reviewed weekly content performance metrics and updated the SEO content strategy. Identified high-potential topic clusters and planned new content pieces.",
    phase: "SEO – Content Planning", status: "completed", pct: 100,
  },
  {
    id: "seo-w-5", category: "seo", frequency: "weekly", icon: "⚡",
    title: "Core Web Vitals & Speed Report",
    description: "Audited Core Web Vitals (LCP, CLS, FID), page speed scores, and mobile usability across all key pages. Optimization recommendations documented.",
    phase: "SEO – Technical Weekly", status: "review", pct: 100,
  },
  {
    id: "seo-w-6", category: "seo", frequency: "weekly", icon: "🗺️",
    title: "Local SEO & Google Business Update",
    description: "Updated Google Business Profile with fresh posts, photos, and Q&A responses. Reviewed local citation consistency and monitored local ranking positions.",
    phase: "SEO – Local Weekly", status: "completed", pct: 100,
  },
  {
    id: "seo-w-7", category: "seo", frequency: "weekly", icon: "📖",
    title: "Weekly Blog Strategy & Publishing",
    description: "Planned, written, and published weekly SEO blog content. Topics selected based on keyword research and search intent. Posts optimized for featured snippets and ranked for target queries.",
    phase: "SEO – Blog Weekly", status: "completed", pct: 100,
  },
  // ── Digital Marketing Daily ───────────────────────────────────────────────
  {
    id: "dm-d-1", category: "digital-marketing", frequency: "daily", icon: "📱",
    title: "Social Media Posts Published",
    description: "Published scheduled posts across all active platforms. Engaged with audience comments and messages. Monitored brand mentions and trending hashtags.",
    phase: "Social Media – Daily", status: "completed", pct: 100,
  },
  {
    id: "dm-d-2", category: "digital-marketing", frequency: "daily", icon: "📧",
    title: "Email Outreach Executed",
    description: "Sent targeted outreach emails to segmented contacts. Monitored delivery rates, open rates, and replies. Followed up with warm leads identified from previous sends.",
    phase: "Email Marketing – Daily", status: "completed", pct: 100,
  },
  {
    id: "dm-d-3", category: "digital-marketing", frequency: "daily", icon: "🎯",
    title: "Lead Generation Activities",
    description: "Executed daily lead generation tasks across all channels. New leads captured, qualified, and entered into the CRM pipeline for follow-up.",
    phase: "Lead Gen – Daily", status: "completed", pct: 100,
  },
  {
    id: "dm-d-4", category: "digital-marketing", frequency: "daily", icon: "🎬",
    title: "Content Creation & Publishing",
    description: "Created and published fresh content including graphics, short-form videos, reels, and stories optimized for each platform's algorithm.",
    phase: "Content – Daily", status: "completed", pct: 100,
  },
  {
    id: "dm-d-5", category: "digital-marketing", frequency: "daily", icon: "📊",
    title: "Analytics & Performance Review",
    description: "Reviewed daily analytics across all marketing channels. Identified top-performing content, traffic sources, and conversion paths. Reported key metrics.",
    phase: "Analytics – Daily", status: "completed", pct: 100,
  },
  {
    id: "dm-d-6", category: "digital-marketing", frequency: "daily", icon: "🤝",
    title: "Community & Engagement Management",
    description: "Actively managed online communities, responded to DMs, comments, and mentions. Built relationships with followers and potential clients through authentic engagement.",
    phase: "Social Media – Engagement Daily", status: "completed", pct: 100,
  },
  // ── Digital Marketing Weekly ──────────────────────────────────────────────
  {
    id: "dm-w-1", category: "digital-marketing", frequency: "weekly", icon: "📋",
    title: "Weekly Marketing Performance Report",
    description: "Full-funnel weekly marketing review. Covered total reach, impressions, leads generated, conversion rates, and revenue attributed to marketing efforts.",
    phase: "Marketing – Weekly Report", status: "review", pct: 100,
  },
  {
    id: "dm-w-2", category: "digital-marketing", frequency: "weekly", icon: "📲",
    title: "Social Media Analytics Review",
    description: "Weekly social media performance deep-dive. Follower growth, engagement rates, top-performing content, best posting times, and competitive benchmarking analyzed.",
    phase: "Social Media – Weekly", status: "completed", pct: 100,
  },
  {
    id: "dm-w-3", category: "digital-marketing", frequency: "weekly", icon: "🗓️",
    title: "Content Calendar Planned",
    description: "Next week's content calendar finalized and approved. Topics researched, captions written, creatives briefed, and posting schedule confirmed for all platforms.",
    phase: "Content Planning – Weekly", status: "completed", pct: 100,
  },
  {
    id: "dm-w-4", category: "digital-marketing", frequency: "weekly", icon: "✉️",
    title: "Email Marketing Weekly Summary",
    description: "Weekly email marketing performance review. Open rates, click-through rates, unsubscribes, and conversions analyzed. Next week's email strategy updated.",
    phase: "Email Marketing – Weekly", status: "completed", pct: 100,
  },
  {
    id: "dm-w-5", category: "digital-marketing", frequency: "weekly", icon: "🔍",
    title: "Audience & Competitor Research",
    description: "Researched target audience behavior shifts and monitored competitor activity. Updated buyer personas and identified new content and engagement opportunities.",
    phase: "Strategy – Weekly", status: "completed", pct: 100,
  },
  {
    id: "dm-w-6", category: "digital-marketing", frequency: "weekly", icon: "💡",
    title: "Brand Awareness & Outreach Review",
    description: "Reviewed brand visibility metrics, press mentions, and influencer outreach results. Planned next week's brand-building activities and partnership opportunities.",
    phase: "Brand Building – Weekly", status: "completed", pct: 100,
  },
];

// ─── Update Form Modal ────────────────────────────────────────────────────────
function UpdateFormModal({
  update, clientId, onClose, onSaved,
}: {
  update: FirestoreClientUpdate | null;
  clientId: string;
  onClose: () => void;
  onSaved: (msg: string, updateTitle?: string) => void;
}) {
  const [title,      setTitle]      = useState(update?.title              ?? "");
  const [desc,       setDesc]       = useState(update?.description        ?? "");
  const [status,     setStatus]     = useState<FirestoreClientUpdate["status"]>(update?.status ?? "in-progress");
  const [phase,      setPhase]      = useState(update?.phase              ?? "");
  const [pct,        setPct]        = useState(String(update?.completionPercent ?? 0));
  const [images,     setImages]     = useState<string[]>(() => {
    const existing = update?.images ?? [];
    return update?.imageUrl && !existing.includes(update.imageUrl)
      ? [update.imageUrl, ...existing]
      : existing;
  });
  const [category,   setCategory]   = useState<FirestoreClientUpdate["category"]>(update?.category ?? "general");
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [dragOver,   setDragOver]   = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [saving,     setSaving]     = useState(false);

  // Template picker state (only shown for new updates)
  const [showTemplates,    setShowTemplates]    = useState(!update);
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("seo");
  const [templateFreq,     setTemplateFreq]     = useState<TemplateFrequency>("daily");

  function applyTemplate(t: UpdateTemplate) {
    setTitle(t.title);
    setDesc(t.description);
    setPhase(t.phase);
    setStatus(t.status);
    setPct(String(t.pct));
    setCategory(t.category);
    setShowTemplates(false);
  }

  async function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    setUploadPct(0);
    try {
      const res = await uploadToCloudinary(file, "zynhive/client-updates", setUploadPct);
      setImages((prev) => [...prev, res.secure_url]);
    } catch {
      // silently ignore — user can retry
    } finally {
      setUploading(false);
    }
  }

  const visibleTemplates = UPDATE_TEMPLATES.filter(
    (t) => t.category === templateCategory && t.frequency === templateFreq
  );

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data: Omit<FirestoreClientUpdate, "id" | "createdAt" | "updatedAt"> = {
        clientId, title: title.trim(), description: desc.trim(),
        status, phase: phase.trim(), completionPercent: Math.min(100, Math.max(0, Number(pct) || 0)),
        category: category ?? "general",
        images,
        ...(images.length > 0 ? { imageUrl: images[0] } : {}),
      };
      if (update?.id) {
        await updateClientUpdate(update.id, data);
        onSaved("Update saved!");
      } else {
        await createClientUpdate(data);
        onSaved("Update added!", title.trim());
      }
      onClose();
    } catch (err) {
      console.error("[UpdateForm] save error:", err);
      onSaved("__error__Save failed — check Firestore rules");
    } finally {
      setSaving(false);
    }
  }

  const catConfig: Record<TemplateCategory, { label: string; color: string; bg: string }> = {
    "seo":               { label: "SEO",               color: "#378ADD", bg: "rgba(55,138,221,0.1)"  },
    "digital-marketing": { label: "Digital Marketing", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
  };
  const freqConfig: Record<TemplateFrequency, { label: string; color: string }> = {
    "daily":  { label: "Daily",  color: "#22C55E" },
    "weekly": { label: "Weekly", color: "#F59E0B" },
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          borderRadius: 16, width: "100%", maxWidth: showTemplates ? 620 : 480,
          boxShadow: "var(--shadow-lg)", maxHeight: "90vh",
          display: "flex", flexDirection: "column",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
          transition: "max-width .25s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{ padding: "18px 22px 14px", borderBottom: "0.5px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              {update ? "Edit Update" : "Add Update"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {!update && (
                <button
                  onClick={() => setShowTemplates((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
                    border: `0.5px solid ${showTemplates ? "var(--accent-pale2)" : "var(--border2)"}`,
                    background: showTemplates ? "var(--accent-pale)" : "var(--bg-alt)",
                    color: showTemplates ? "var(--accent)" : "var(--ink4)",
                    cursor: "pointer", transition: "all .15s",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <rect x="1" y="1" width="4.2" height="4.2" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                    <rect x="6.8" y="1" width="4.2" height="4.2" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                    <rect x="1" y="6.8" width="4.2" height="4.2" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                    <rect x="6.8" y="6.8" width="4.2" height="4.2" rx="1" stroke="currentColor" strokeWidth="1.1"/>
                  </svg>
                  Templates
                </button>
              )}
              <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)", padding: 4 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", gap: 0 }}>

          {/* Template panel */}
          {showTemplates && (
            <div style={{ width: 280, flexShrink: 0, borderRight: "0.5px solid var(--border)", display: "flex", flexDirection: "column" }}>
              {/* Category tabs */}
              <div style={{ padding: "12px 14px 10px", borderBottom: "0.5px solid var(--border)" }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {(Object.keys(catConfig) as TemplateCategory[]).map((cat) => {
                    const cfg = catConfig[cat];
                    const active = templateCategory === cat;
                    return (
                      <button
                        key={cat} onClick={() => setTemplateCategory(cat)}
                        style={{
                          flex: 1, padding: "5px 0", borderRadius: 7, fontSize: 11, fontWeight: active ? 700 : 500,
                          border: `1px solid ${active ? cfg.color : "var(--border2)"}`,
                          background: active ? cfg.bg : "transparent",
                          color: active ? cfg.color : "var(--ink4)",
                          cursor: "pointer", transition: "all .15s",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
                {/* Frequency tabs */}
                <div style={{ display: "flex", gap: 5 }}>
                  {(Object.keys(freqConfig) as TemplateFrequency[]).map((freq) => {
                    const cfg = freqConfig[freq];
                    const active = templateFreq === freq;
                    return (
                      <button
                        key={freq} onClick={() => setTemplateFreq(freq)}
                        style={{
                          flex: 1, padding: "4px 0", borderRadius: 6, fontSize: 10, fontWeight: active ? 700 : 500,
                          border: `1px solid ${active ? cfg.color : "var(--border2)"}`,
                          background: active ? `${cfg.color}15` : "transparent",
                          color: active ? cfg.color : "var(--ink4)",
                          cursor: "pointer", transition: "all .15s",
                        }}
                      >
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Template list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
                {visibleTemplates.map((t) => {
                  const catCfg  = catConfig[t.category];
                  const freqCfg = freqConfig[t.frequency];
                  const isSelected = title === t.title;
                  return (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t)}
                      style={{
                        display: "flex", alignItems: "flex-start", gap: 9,
                        padding: "10px 10px", borderRadius: 9, textAlign: "left",
                        border: `1px solid ${isSelected ? catCfg.color : "var(--border)"}`,
                        background: isSelected ? catCfg.bg : "var(--bg-alt)",
                        cursor: "pointer", transition: "all .15s", width: "100%",
                      }}
                      onMouseEnter={(e) => { if (!isSelected) { const el = e.currentTarget as HTMLElement; el.style.borderColor = catCfg.color; el.style.background = catCfg.bg; } }}
                      onMouseLeave={(e) => { if (!isSelected) { const el = e.currentTarget as HTMLElement; el.style.borderColor = "var(--border)"; el.style.background = "var(--bg-alt)"; } }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0, lineHeight: 1.2 }}>{t.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? catCfg.color : "var(--ink2)", lineHeight: 1.3, marginBottom: 3 }}>
                          {t.title}
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99, background: `${freqCfg.color}18`, color: freqCfg.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {freqCfg.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Form fields */}
          <div style={{ flex: 1, padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
            <FieldInput label="Update Title" value={title} onChange={setTitle} placeholder="e.g. Weekly SEO Report" required />
            <FieldTextarea label="Description" value={desc} onChange={setDesc} placeholder="Describe what was done…" rows={5} />
            <FieldInput label="Phase / Milestone" value={phase} onChange={setPhase} placeholder="e.g. SEO – Week 3" />

            {/* Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</label>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(Object.keys(STATUS_CONFIG) as FirestoreClientUpdate["status"][]).map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const active = status === s;
                  return (
                    <button
                      key={s} onClick={() => setStatus(s)}
                      style={{
                        padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: active ? 600 : 400,
                        border: `1px solid ${active ? cfg.color : "var(--border2)"}`,
                        background: active ? cfg.bg : "transparent",
                        color: active ? cfg.color : "var(--ink4)",
                        cursor: "pointer", transition: "all .15s",
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Section</label>
              <div style={{ display: "flex", gap: 5 }}>
                {([
                  { value: "seo",               label: "SEO",               color: "#378ADD", bg: "rgba(55,138,221,0.1)"  },
                  { value: "digital-marketing", label: "Digital Marketing", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
                  { value: "general",           label: "General",           color: "#64748B", bg: "rgba(100,116,139,0.1)" },
                ] as const).map(({ value, label, color, bg }) => {
                  const active = category === value;
                  return (
                    <button
                      key={value} onClick={() => setCategory(value)}
                      style={{
                        padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: active ? 600 : 400,
                        border: `1px solid ${active ? color : "var(--border2)"}`,
                        background: active ? bg : "transparent",
                        color: active ? color : "var(--ink4)",
                        cursor: "pointer", transition: "all .15s",
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Completion % */}
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Completion — <span style={{ color: "var(--accent)", fontFamily: "monospace" }}>{pct}%</span>
              </label>
              <input
                type="range" min={0} max={100} step={5} value={pct}
                onChange={(e) => setPct(e.target.value)}
                style={{ accentColor: "var(--accent)", width: "100%", cursor: "pointer" }}
              />
            </div>

            {/* Images upload */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "var(--ink4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Images <span style={{ color: "var(--ink4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional, multiple)</span>
              </label>

              {/* Hidden file input */}
              <input
                ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
              />

              {/* Thumbnail grid */}
              {images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {images.map((url, idx) => (
                    <div key={idx} style={{ position: "relative", borderRadius: 8, overflow: "hidden", border: "0.5px solid var(--border2)", aspectRatio: "1" }}>
                      <img src={url} alt={`img-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        title="Remove"
                        style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", border: "none", background: "rgba(239,68,68,.85)", color: "white", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
                      >
                        ✕
                      </button>
                      {idx === 0 && (
                        <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 8, fontWeight: 700, background: "rgba(0,0,0,.6)", color: "white", borderRadius: 4, padding: "1px 5px" }}>COVER</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload progress or drop zone */}
              {uploading ? (
                <div style={{ borderRadius: 10, border: "0.5px solid var(--border2)", background: "var(--bg-alt)", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--ink4)" }}>Uploading…</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace" }}>{uploadPct}%</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 99, background: "var(--border2)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${uploadPct}%`, background: "var(--accent)", borderRadius: 99, transition: "width .2s" }}/>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                  style={{
                    borderRadius: 10, border: `1.5px dashed ${dragOver ? "var(--accent)" : "var(--border2)"}`,
                    background: dragOver ? "var(--accent-pale)" : "var(--bg-alt)",
                    padding: images.length > 0 ? "10px 14px" : "18px 14px",
                    textAlign: "center", cursor: "pointer", transition: "all .15s",
                  }}
                >
                  {images.length > 0 ? (
                    <div style={{ fontSize: 12, color: "var(--ink4)" }}>+ Add another image</div>
                  ) : (
                    <>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>🖼️</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3)", marginBottom: 3 }}>Click to upload or drag & drop</div>
                      <div style={{ fontSize: 10, color: "var(--ink4)" }}>PNG, JPG, WEBP — max 10 MB each</div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ padding: "14px 22px", borderTop: "0.5px solid var(--border)", display: "flex", gap: 10, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "0.5px solid var(--border2)", background: "transparent", color: "var(--ink3)", cursor: "pointer", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave} disabled={saving || !title.trim()}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 9, border: "none",
              background: saving || !title.trim() ? "var(--bg-alt)" : "var(--accent)",
              color: saving || !title.trim() ? "var(--ink4)" : "white",
              cursor: saving || !title.trim() ? "default" : "pointer",
              fontSize: 13, fontWeight: 600, transition: "all .15s",
            }}
          >
            {saving ? "Saving…" : update ? "Save Changes" : "Add Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "var(--bg-card)", border: "0.5px solid var(--border2)",
          borderRadius: 16, padding: 28, width: "100%", maxWidth: 360, textAlign: "center",
          boxShadow: "var(--shadow-lg)",
          animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--red-pale)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M3 7h14M8 7V4.5h4V7M6 7l1 11h6l1-11" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>Delete?</p>
        <p style={{ fontSize: 12, color: "var(--ink4)", marginBottom: 20 }}>
          "<strong style={{ color: "var(--ink2)" }}>{label}</strong>" will be permanently removed.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "0.5px solid var(--border2)", background: "transparent", color: "var(--ink3)", cursor: "pointer", fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "var(--red)", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Updates Panel ────────────────────────────────────────────────────────────
function UpdatesPanel({
  client, onClose, showToast,
}: {
  client: FirestoreClient;
  onClose: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [updates,       setUpdates]       = useState<FirestoreClientUpdate[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [updateForm,    setUpdateForm]    = useState<FirestoreClientUpdate | null | "new">(null);
  const [deleteTarget,  setDeleteTarget]  = useState<FirestoreClientUpdate | null>(null);
  const [copiedUrl,     setCopiedUrl]     = useState(false);
  // Feedback state keyed by updateId
  const [feedbackMap,   setFeedbackMap]   = useState<Record<string, FirestoreUpdateFeedback[]>>({});
  const [fbOpenId,      setFbOpenId]      = useState<string | null>(null);
  const [fbLoadingId,   setFbLoadingId]   = useState<string | null>(null);
  const [fbReplyMap,    setFbReplyMap]    = useState<Record<string, string>>({});
  const [fbSendingId,   setFbSendingId]   = useState<string | null>(null);

  const portalUrl = `${window.location.origin}/client/${client.id}`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClientUpdates(client.id!);
      setUpdates(data);
    } catch (err) {
      console.error("[UpdatesPanel] load error:", err);
      showToast("Failed to load updates — check Firestore rules", "error");
    } finally {
      setLoading(false);
    }
  }, [client.id, showToast]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    try {
      await deleteClientUpdate(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      showToast("Update deleted");
    } catch { showToast("Delete failed", "error"); }
  }

  function handleCopy() {
    copyToClipboard(portalUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  }

  const latest = updates[0];

  async function toggleFeedback(updateId: string) {
    if (fbOpenId === updateId) { setFbOpenId(null); return; }
    setFbOpenId(updateId);
    if (feedbackMap[updateId]) return; // already loaded
    setFbLoadingId(updateId);
    try {
      const data = await fetchUpdateFeedback(updateId);
      setFeedbackMap((prev) => ({ ...prev, [updateId]: data }));
    } catch { /* ignore */ }
    finally { setFbLoadingId(null); }
  }

  async function handleReply(u: FirestoreClientUpdate) {
    const msg = (fbReplyMap[u.id!] ?? "").trim();
    if (!msg || !u.id) return;
    setFbSendingId(u.id);
    try {
      await createUpdateFeedback({
        updateId: u.id, clientId: client.id!,
        message: msg, fromClient: false, senderName: "ZynHive Team",
      });
      setFbReplyMap((prev) => ({ ...prev, [u.id!]: "" }));
      const updated = await fetchUpdateFeedback(u.id);
      setFeedbackMap((prev) => ({ ...prev, [u.id!]: updated }));
    } catch { /* ignore */ }
    finally { setFbSendingId(null); }
  }

  function formatFbTime(ts: unknown): string {
    if (!ts) return "";
    try {
      const d = (ts as { toDate?: () => Date })?.toDate ? (ts as { toDate: () => Date }).toDate() : new Date(ts as string);
      return d.toLocaleString("en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return ""; }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[55] flex items-center justify-center px-4"
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <div
          style={{
            background: "var(--bg-card)", border: "0.5px solid var(--border2)",
            borderRadius: 18, width: "100%", maxWidth: 640,
            maxHeight: "88vh", display: "flex", flexDirection: "column",
            boxShadow: "var(--shadow-lg)",
            animation: "fadeScaleIn .22s cubic-bezier(0.16,1,0.3,1) both",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={{ padding: "18px 22px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: "var(--accent-pale)", border: "0.5px solid var(--accent-pale2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 700, color: "var(--accent)",
              }}
            >
              {initials(client.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>{client.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink4)", marginTop: 2 }}>{client.company || client.email}</div>
            </div>
            {/* Portal URL copy */}
            <button
              onClick={handleCopy}
              title="Copy client portal link"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                border: "0.5px solid var(--border2)", cursor: "pointer",
                background: copiedUrl ? "var(--green-pale)" : "var(--bg-alt)",
                color: copiedUrl ? "var(--green)" : "var(--ink3)",
                transition: "all .2s", flexShrink: 0,
              }}
            >
              {copiedUrl ? (
                <><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg> Copied!</>
              ) : (
                <><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.1"/><path d="M4 4V2.5A1.5 1.5 0 015.5 1H9.5A1.5 1.5 0 0111 2.5v4A1.5 1.5 0 019.5 8H8" stroke="currentColor" strokeWidth="1.1"/></svg> Copy Link</>
              )}
            </button>
            <button
              onClick={() => setUpdateForm("new")}
              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "none", background: "var(--accent)", color: "white", cursor: "pointer" }}
            >
              <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
              Add Update
            </button>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--ink4)", padding: 4, marginLeft: 2 }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* Progress bar */}
          {latest && (
            <div style={{ padding: "10px 22px 0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: "var(--ink4)" }}>Overall Progress</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", fontFamily: "monospace" }}>{latest.completionPercent}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: "var(--bg-alt)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${latest.completionPercent}%`, background: "linear-gradient(90deg, var(--accent), var(--cyan))", borderRadius: 99, transition: "width .6s" }}/>
              </div>
            </div>
          )}

          {/* Updates list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 22px 18px" }}>
            {loading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 40, gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--border2)", borderTopColor: "var(--accent)", animation: "spin .7s linear infinite" }}/>
                <span style={{ fontSize: 12, color: "var(--ink4)" }}>Loading…</span>
              </div>
            ) : updates.length === 0 ? (
              <div style={{ textAlign: "center", paddingTop: 40 }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>📋</div>
                <p style={{ fontSize: 13, color: "var(--ink4)" }}>No updates yet</p>
                <button
                  onClick={() => setUpdateForm("new")}
                  style={{ marginTop: 12, padding: "7px 16px", borderRadius: 9, border: "none", background: "var(--accent)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  Add first update
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {updates.map((u, i) => {
                  const cfg         = STATUS_CONFIG[u.status];
                  const fbOpen      = fbOpenId === u.id;
                  const fbList      = feedbackMap[u.id!] ?? [];
                  const clientMsgs  = fbList.filter((f) => f.fromClient).length;
                  return (
                    <div
                      key={u.id}
                      style={{
                        background: "var(--bg-alt)", border: `0.5px solid ${fbOpen ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 12, overflow: "hidden",
                        position: "relative", transition: "border-color .15s",
                      }}
                    >
                      <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        {/* Step indicator */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, paddingTop: 2 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "var(--accent)" : "var(--bg-card)", border: `1.5px solid ${i === 0 ? "var(--accent)" : "var(--border2)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {i === 0 ? (
                              <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            ) : (
                              <span style={{ fontSize: 9, fontWeight: 700, color: "var(--ink4)" }}>{updates.length - i}</span>
                            )}
                          </div>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", lineHeight: 1.3 }}>{u.title}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
                              {cfg.label}
                            </span>
                          </div>
                          {u.phase && (
                            <div style={{ fontSize: 11, color: "var(--ink4)", marginBottom: 5 }}>{u.phase}</div>
                          )}
                          {u.description && (
                            <p style={{ fontSize: 12, color: "var(--ink3)", lineHeight: 1.55, margin: 0 }}>{u.description}</p>
                          )}
                          {/* Mini progress */}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                            <div style={{ flex: 1, height: 3, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${u.completionPercent}%`, background: cfg.color, borderRadius: 99 }}/>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, fontFamily: "monospace", flexShrink: 0 }}>{u.completionPercent}%</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {/* Feedback toggle */}
                          <button
                            onClick={() => toggleFeedback(u.id!)}
                            title="View / Reply feedback"
                            style={{
                              width: 26, height: 26, borderRadius: 7, border: `0.5px solid ${fbOpen ? "var(--accent)" : "var(--border)"}`,
                              background: fbOpen ? "var(--accent-pale)" : "transparent",
                              cursor: "pointer", color: fbOpen ? "var(--accent)" : "var(--ink4)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              gap: 3, transition: "all .15s", position: "relative",
                            }}
                            onMouseEnter={(e) => { if (!fbOpen) { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; el.style.borderColor = "var(--accent-pale2)"; } }}
                            onMouseLeave={(e) => { if (!fbOpen) { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; el.style.borderColor = "var(--border)"; } }}
                          >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 1.5h9v7H7.5L5.5 10.5v-2H1.5v-7z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>
                            {clientMsgs > 0 && (
                              <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", color: "white", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid var(--bg-card)" }}>
                                {clientMsgs > 9 ? "9+" : clientMsgs}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => setUpdateForm(u)}
                            title="Edit"
                            style={{ width: 26, height: 26, borderRadius: 7, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--ink4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}
                          >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            title="Delete"
                            style={{ width: 26, height: 26, borderRadius: 7, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--ink4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s" }}
                            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--red-pale)"; el.style.color = "var(--red)"; }}
                            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}
                          >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                      </div>

                      {/* ── Feedback panel (inline) ── */}
                      {fbOpen && (
                        <div style={{ borderTop: "0.5px solid var(--border)", padding: "12px 16px", background: "var(--bg-card)" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--ink4)", marginBottom: 10 }}>
                            Client Feedback & Replies
                          </div>

                          {/* Thread */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 200, overflowY: "auto", marginBottom: 10 }}>
                            {fbLoadingId === u.id ? (
                              <div style={{ fontSize: 11, color: "var(--ink4)", padding: "4px 0" }}>Loading…</div>
                            ) : fbList.length === 0 ? (
                              <div style={{ fontSize: 11, color: "var(--ink4)", fontStyle: "italic" }}>No feedback yet for this update.</div>
                            ) : (
                              fbList.map((fb) => (
                                <div key={fb.id} style={{ display: "flex", flexDirection: "column", gap: 2, alignSelf: fb.fromClient ? "flex-start" : "flex-end", maxWidth: "86%" }}>
                                  <div style={{
                                    padding: "7px 11px", fontSize: 12, lineHeight: 1.55, color: "var(--ink2)",
                                    borderRadius: fb.fromClient ? "4px 12px 12px 12px" : "12px 4px 12px 12px",
                                    background: fb.fromClient ? "var(--bg-alt)" : "var(--accent-pale)",
                                    border: `0.5px solid ${fb.fromClient ? "var(--border2)" : "var(--accent-pale2)"}`,
                                  }}>
                                    {fb.message}
                                  </div>
                                  <div style={{ display: "flex", gap: 5, padding: "1px 4px", alignSelf: fb.fromClient ? "flex-start" : "flex-end" }}>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: fb.fromClient ? "var(--ink4)" : "var(--accent)" }}>
                                      {fb.fromClient ? (fb.senderName || "Client") : (fb.senderName || "Team")}
                                    </span>
                                    <span style={{ fontSize: 9, color: "var(--ink4)" }}>{formatFbTime(fb.createdAt)}</span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Reply input */}
                          <div style={{ display: "flex", gap: 7, alignItems: "flex-end" }}>
                            <textarea
                              value={fbReplyMap[u.id!] ?? ""}
                              onChange={(e) => setFbReplyMap((prev) => ({ ...prev, [u.id!]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(u); } }}
                              placeholder="Reply to client…"
                              rows={2}
                              style={{
                                flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 12,
                                fontFamily: "inherit", border: "0.5px solid var(--border2)",
                                background: "var(--bg-alt)", color: "var(--ink)", outline: "none",
                                resize: "none", lineHeight: 1.5,
                              }}
                              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--accent)"; }}
                              onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "var(--border2)"; }}
                            />
                            <button
                              onClick={() => handleReply(u)}
                              disabled={fbSendingId === u.id || !(fbReplyMap[u.id!] ?? "").trim()}
                              style={{
                                padding: "8px 13px", borderRadius: 8, border: "none", flexShrink: 0,
                                background: fbSendingId === u.id || !(fbReplyMap[u.id!] ?? "").trim() ? "var(--bg-alt)" : "var(--accent)",
                                color: fbSendingId === u.id || !(fbReplyMap[u.id!] ?? "").trim() ? "var(--ink4)" : "white",
                                cursor: fbSendingId === u.id || !(fbReplyMap[u.id!] ?? "").trim() ? "default" : "pointer",
                                fontSize: 11, fontWeight: 600, transition: "all .15s",
                              }}
                            >
                              {fbSendingId === u.id ? "…" : "Reply"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested modals */}
      {updateForm && (
        <UpdateFormModal
          update={updateForm === "new" ? null : updateForm}
          clientId={client.id!}
          onClose={() => setUpdateForm(null)}
          onSaved={(msg, updateTitle) => {
            if (msg.startsWith("__error__")) { showToast(msg.replace("__error__", ""), "error"); }
            else {
              showToast(msg);
              load();
              // Email notification on new update
              if (msg === "Update added!") {
                import("../../lib/firebase").then(({ fetchClientById }) =>
                  fetchClientById(client.id!).then((fresh) => {
                    const toEmail = fresh?.notificationEmail || fresh?.email || client.email;
                    if (toEmail) {
                      sendUpdateNotificationEmail({
                        toEmail,
                        toName:      client.name,
                        projectName: client.projectName || "Your Project",
                        updateTitle: updateTitle || "New Update",
                        portalUrl:   `${window.location.origin}/client/${client.id}`,
                      });
                    }
                  })
                );
              }
            }
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm label={deleteTarget.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}

// ─── Client Row ───────────────────────────────────────────────────────────────
function ClientRow({
  client, onEdit, onDelete, onViewUpdates,
}: {
  client: FirestoreClient;
  onEdit: () => void;
  onDelete: () => void;
  onViewUpdates: () => void;
}) {
  const [hov, setHov] = useState(false);
  const colors = ["#378ADD", "#7F77DD", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  const color = colors[(client.name.charCodeAt(0) ?? 0) % colors.length];

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 16px",
        borderBottom: "0.5px solid var(--border)",
        background: hov ? "var(--bg-alt)" : "transparent",
        transition: "background .15s", cursor: "default",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Avatar */}
      <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `${color}18`, border: `1px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color }}>
        {initials(client.name)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{client.name}</span>
          {client.company && (
            <span style={{ fontSize: 10, color: "var(--ink4)", background: "var(--bg-alt)", border: "0.5px solid var(--border)", borderRadius: 5, padding: "1px 6px", flexShrink: 0 }}>{client.company}</span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--ink4)" }}>{client.email}</span>
          {client.projectName && (
            <span style={{ fontSize: 10, color, background: `${color}10`, border: `1px solid ${color}20`, borderRadius: 5, padding: "1px 6px" }}>{client.projectName}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <button
          onClick={onViewUpdates}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600,
            border: "0.5px solid var(--border2)", background: "transparent",
            color: "var(--ink3)", cursor: "pointer", transition: "all .15s",
            opacity: hov ? 1 : 0,
          }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; el.style.borderColor = "var(--accent-pale2)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink3)"; el.style.borderColor = "var(--border2)"; }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 2C3 2 1 6 1 6s2 4 5 4 5-4 5-4-2-4-5-4z" stroke="currentColor" strokeWidth="1.1"/><circle cx="6" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.1"/></svg>
          Updates
        </button>
        <button
          onClick={onEdit}
          title="Edit"
          style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", opacity: hov ? 1 : 0 }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--accent-pale)"; el.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 1.5l2 2L4 10H2V8L8.5 1.5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/></svg>
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: "transparent", cursor: "pointer", color: "var(--ink4)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s", opacity: hov ? 1 : 0 }}
          onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "var(--red-pale)"; el.style.color = "var(--red)"; }}
          onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "var(--ink4)"; }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 3h9M4 3V2h4v1M3.5 3l.5 7.5M8.5 3l-.5 7.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>
        </button>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN CLIENT TAB
// ═════════════════════════════════════════════════════════════════════════════

export function ClientTab({ showToast, openAdd = false, onOpenAddDone }: {
  showToast: (msg: string, type?: "success" | "error") => void;
  openAdd?: boolean;
  onOpenAddDone?: () => void;
}) {
  const [clients,       setClients]       = useState<FirestoreClient[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [clientForm,    setClientForm]    = useState<FirestoreClient | null | "new">(null);
  const [deleteTarget,  setDeleteTarget]  = useState<FirestoreClient | null>(null);
  const [viewClient,    setViewClient]    = useState<FirestoreClient | null>(null);
  const [search,        setSearch]        = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (err) {
      console.error("[ClientTab] load error:", err);
      showToast("Failed to load clients — check Firestore rules", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  // Open "Add Client" modal when parent header CTA is clicked
  useEffect(() => {
    if (openAdd) {
      setClientForm("new");
      onOpenAddDone?.();
    }
  }, [openAdd, onOpenAddDone]);

  async function handleDelete() {
    if (!deleteTarget?.id) return;
    try {
      await deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      showToast(`"${deleteTarget.name}" deleted`);
    } catch { showToast("Delete failed", "error"); }
  }

  const filtered = clients.filter((c) =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
          {[
            { label: "Total Clients", value: clients.length, color: "var(--accent)", bg: "var(--accent-pale)", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><circle cx="6" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.1"/><path d="M1 13c0-2.5 2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/></svg> },
            { label: "Active Projects", value: clients.filter((c) => c.projectName).length, color: "var(--green)", bg: "var(--green-pale)", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><rect x="1" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/><rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.1"/></svg> },
            { label: "Portal Links", value: clients.length, color: "var(--purple)", bg: "var(--purple-pale)", icon: <svg width="14" height="14" viewBox="0 0 15 15" fill="none"><path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/><path d="M9 1h5v5M14 1L7 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg> },
          ].map(({ label, value, color, bg, icon }) => (
            <div key={label} style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "var(--ink4)" }}>{label}</span>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Search + Add */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <svg width="12" height="12" viewBox="0 0 13 13" fill="none" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink4)", pointerEvents: "none" }}>
              <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M8.5 8.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search clients…"
              style={{ width: "100%", paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, background: "var(--bg-card)", border: "0.5px solid var(--border2)", borderRadius: 8, fontSize: 13, color: "var(--ink)", outline: "none", fontFamily: "inherit" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e)  => { (e.target as HTMLInputElement).style.borderColor = "var(--border2)"; }}
            />
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, padding: "5px 12px", borderRadius: 8, background: "var(--bg-card)", border: "0.5px solid var(--border)", color: "var(--ink4)" }}>
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>{filtered.length}</span> / {clients.length}
          </div>
          <button
            onClick={() => setClientForm("new")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: "var(--accent)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            <svg width="10" height="10" viewBox="0 0 11 11" fill="none"><path d="M5.5 1v9M1 5.5h9" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            Add Client
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: "var(--bg-alt)", borderBottom: "0.5px solid var(--border)" }}>
            <span style={{ flex: 1, paddingLeft: 46, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink4)" }}>Client</span>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink4)", width: 130, textAlign: "right" }}>Actions</span>
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", gap: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--border2)", borderTopColor: "var(--accent)", animation: "spinLoader .7s linear infinite" }}/>
              <span style={{ fontSize: 12, color: "var(--ink4)" }}>Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 16px", gap: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-pale)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M2 17c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 3v5M17.5 5.5h-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink2)", margin: 0 }}>
                {search ? "No clients found" : "No clients yet"}
              </p>
              <p style={{ fontSize: 12, color: "var(--ink4)", margin: 0 }}>
                {search ? "Try a different search" : "Add your first client to get started"}
              </p>
              {!search && (
                <button
                  onClick={() => setClientForm("new")}
                  style={{ marginTop: 4, padding: "7px 16px", borderRadius: 8, border: "none", background: "var(--accent)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  Add first client →
                </button>
              )}
            </div>
          ) : (
            filtered.map((c) => (
              <ClientRow
                key={c.id}
                client={c}
                onEdit={() => setClientForm(c)}
                onDelete={() => setDeleteTarget(c)}
                onViewUpdates={() => setViewClient(c)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {clientForm && (
        <ClientFormModal
          client={clientForm === "new" ? null : clientForm}
          onClose={() => setClientForm(null)}
          onSaved={(msg) => {
            if (msg.startsWith("__error__")) { showToast(msg.replace("__error__", ""), "error"); }
            else { showToast(msg); load(); }
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm label={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
      {viewClient && (
        <UpdatesPanel
          client={viewClient}
          onClose={() => setViewClient(null)}
          showToast={showToast}
        />
      )}

    </>
  );
}
