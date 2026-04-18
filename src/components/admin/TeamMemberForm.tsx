// ─── src/components/admin/TeamMemberForm.tsx ────────────────────────────────
import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { uploadToCloudinary }                                  from "../../lib/cloudinary";
import { createMember, updateMember, type FirestoreMember }   from "../../lib/firebase";

const COLOR_OPTIONS = [
  "#3B6EF8","#00AACC","#7B5CFA","#1A66FF",
  "#0DBFA8","#4D5BFF","#FF6B6B","#F59E0B",
];

const ROLES = [
  "CEO & Founder", "CTO", "Head of Design", "Lead Engineer",
  "AI/ML Engineer", "Mobile Lead", "Growth Director",
  "Full Stack Developer", "UI/UX Designer", "DevOps Engineer",
  "Project Manager", "Marketing Lead", "Sales Director", "SEO", "Other",
];

type Props = {
  member?:  FirestoreMember | null;
  nextOrder: number;
  onClose:  () => void;
  onSaved:  () => void;
};

const EMPTY_SOCIALS = { linkedin: "", twitter: "", github: "", instagram: "" };

const EMPTY: Omit<FirestoreMember, "id" | "createdAt" | "updatedAt"> = {
  name: "", role: ROLES[0], bio: "", initials: "", color: "#3B6EF8",
  imageUrl: "", imagePublicId: "", order: 0,
  socials: { ...EMPTY_SOCIALS },
};

// ─── tiny shared atoms ────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink3)]">
      {children}
    </span>
  );
}
function Input({
  value, onChange, placeholder, required, type = "text",
}: { value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)]
        placeholder:text-[var(--ink4)] outline-none border border-[var(--border2)]
        focus:border-[var(--accent)] transition-colors"
      style={{ background: "var(--bg-surface)" }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TeamMemberForm({ member, nextOrder, onClose, onSaved }: Props) {
  const isEdit = !!member;

  const [form, setForm] = useState<Omit<FirestoreMember, "id" | "createdAt" | "updatedAt">>({
    ...EMPTY,
    order: nextOrder,
    ...(member ? {
      name:          member.name,
      role:          member.role,
      bio:           member.bio,
      initials:      member.initials,
      color:         member.color,
      imageUrl:      member.imageUrl,
      imagePublicId: member.imagePublicId,
      order:         member.order,
      socials:       { ...EMPTY_SOCIALS, ...member.socials },
    } : {}),
  });

  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // ── field helpers ────────────────────────────────────────────────────────
  function field<K extends keyof typeof EMPTY>(key: K, val: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }
  function social(key: keyof typeof EMPTY_SOCIALS, val: string) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [key]: val } }));
  }

  // Auto-generate initials from name
  function handleNameChange(v: string) {
    field("name", v);
    const parts = v.trim().split(" ").filter(Boolean);
    const auto  = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : v.slice(0, 2).toUpperCase();
    field("initials", auto);
  }

  // ── photo upload ─────────────────────────────────────────────────────────
  async function handlePhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadPct(0);
    try {
      const res = await uploadToCloudinary(file, "zynhive/team", setUploadPct);
      field("imageUrl",      res.secure_url);
      field("imagePublicId", res.public_id);
    } catch {
      setError("Photo upload failed. Check Cloudinary config.");
    } finally {
      setUploading(false);
    }
  }

  // ── submit ───────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (isEdit && member?.id) {
        await updateMember(member.id, form);
      } else {
        await createMember(form);
      }
      onSaved();
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative h-full w-full max-w-[580px] overflow-y-auto flex flex-col"
        style={{
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border)",
          animation: "slideInRight .3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] sticky top-0 z-10"
          style={{ background: "var(--bg-panel)" }}
        >
          <div>
            <h2 className="font-display text-[17px] font-bold text-[var(--ink)] tracking-tight">
              {isEdit ? "Edit Team Member" : "Add Team Member"}
            </h2>
            <p className="font-mono text-[10px] text-[var(--ink4)] tracking-[0.1em] mt-0.5">
              {isEdit ? `ID: ${member?.id?.slice(0, 8)}…` : "New member → Firestore + Cloudinary"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink4)]
              hover:text-[var(--ink)] hover:bg-[var(--border)] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 flex-1">

          {/* PHOTO UPLOAD ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <Label>Profile Photo</Label>
            <div className="flex items-start gap-5">

              {/* Avatar preview */}
              <div
                className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden border-2 cursor-pointer
                  relative group"
                style={{
                  borderColor: form.imageUrl ? form.color : "var(--border2)",
                  background: form.imageUrl ? "transparent" : `${form.color}18`,
                }}
                onClick={() => !uploading && fileRef.current?.click()}
              >
                {form.imageUrl ? (
                  <>
                    <img
                      src={form.imageUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                      transition-opacity flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M2 12l4-4 4 4 4-6 4 6H2z" stroke="white" strokeWidth="1"/>
                        <rect x="1" y="2" width="14" height="12" rx="2" stroke="white" strokeWidth="1"/>
                      </svg>
                    </div>
                  </>
                ) : uploading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <div className="w-8 h-8 border-2 border-[var(--border2)] border-t-[var(--accent)]
                      rounded-full animate-spin" />
                    <span className="font-mono text-[8px] text-[var(--accent)]">{uploadPct}%</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <span className="font-display text-2xl font-bold"
                      style={{ color: form.color }}>
                      {form.initials || "?"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="px-4 py-2 rounded-xl text-[12px] font-mono border border-[var(--border2)]
                    text-[var(--ink3)] hover:border-[var(--accent)] hover:text-[var(--accent)]
                    transition-all disabled:opacity-50"
                  style={{ background: "var(--bg-surface)" }}
                >
                  {uploading ? `Uploading ${uploadPct}%…` : "Upload Photo"}
                </button>
                <p className="text-[11px] text-[var(--ink4)] font-body leading-relaxed">
                  PNG, JPG or WEBP · Square preferred · Max 5MB
                  <br />If no photo, initials avatar will be used.
                </p>
              </div>
            </div>
            <input
              ref={fileRef} type="file" accept="image/*"
              className="hidden" onChange={handlePhoto}
            />
          </div>

          {/* NAME + INITIALS ───────────────────────────────────────────── */}
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={handleNameChange}
                placeholder="e.g. Zain Ahmed"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Initials</Label>
              <input
                value={form.initials}
                onChange={(e) => field("initials", e.target.value.toUpperCase().slice(0, 3))}
                maxLength={3}
                placeholder="ZA"
                className="w-full px-3 py-2.5 rounded-xl text-[14px] font-mono font-bold text-center
                  text-[var(--ink)] placeholder:text-[var(--ink4)] outline-none
                  border border-[var(--border2)] focus:border-[var(--accent)] transition-colors"
                style={{ background: "var(--bg-surface)" }}
              />
            </div>
          </div>

          {/* ROLE ─────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <Label>Role / Title *</Label>
            <div className="flex gap-2">
              <select
                value={ROLES.includes(form.role) ? form.role : "Other"}
                onChange={(e) => {
                  if (e.target.value !== "Other") field("role", e.target.value);
                }}
                className="flex-1 px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)] outline-none
                  border border-[var(--border2)] focus:border-[var(--accent)] transition-colors"
                style={{ background: "var(--bg-surface)" }}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* Custom role input if not in list */}
            {!ROLES.slice(0, -1).includes(form.role) && (
              <Input
                value={form.role}
                onChange={(v) => field("role", v)}
                placeholder="Custom role title"
                required
              />
            )}
          </div>

          {/* BIO ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label>Bio *</Label>
              <span className="font-mono text-[9px] text-[var(--ink4)]">
                {form.bio.length}/280
              </span>
            </div>
            <textarea
              value={form.bio}
              onChange={(e) => field("bio", e.target.value.slice(0, 280))}
              placeholder="Short professional bio (2–3 sentences)…"
              rows={4}
              required
              className="px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)] placeholder:text-[var(--ink4)]
                outline-none resize-none border border-[var(--border2)] focus:border-[var(--accent)]
                transition-colors leading-relaxed"
              style={{ background: "var(--bg-surface)" }}
            />
          </div>

          {/* COLOR ────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c} type="button" onClick={() => field("color", c)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 ${
                    form.color === c
                      ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ background: c }}
                />
              ))}
              {/* Custom hex */}
              <div className="flex items-center gap-1.5 ml-2">
                <div className="w-6 h-6 rounded-full border border-[var(--border2)]"
                  style={{ background: form.color }} />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => field("color", e.target.value)}
                  maxLength={7}
                  className="w-20 px-2 py-1 rounded-lg text-[11px] font-mono text-[var(--ink)]
                    border border-[var(--border2)] outline-none focus:border-[var(--accent)]"
                  style={{ background: "var(--bg-surface)" }}
                />
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            <Label>Social Links</Label>
            <div className="flex flex-col gap-2.5">

              {([
                { key: "linkedin",  icon: "in",  placeholder: "https://linkedin.com/in/username",  label: "LinkedIn" },
                { key: "twitter",   icon: "𝕏",   placeholder: "https://twitter.com/username",      label: "Twitter / X" },
                { key: "github",    icon: "</>",  placeholder: "https://github.com/username",       label: "GitHub" },
                { key: "instagram", icon: "ig",  placeholder: "https://instagram.com/username",    label: "Instagram" },
              ] as const).map(({ key, icon, placeholder, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                      font-mono text-[9px] font-bold border border-[var(--border2)]"
                    style={{
                      background: form.socials[key] ? `${form.color}15` : "var(--bg-surface)",
                      color: form.socials[key] ? form.color : "var(--ink4)",
                    }}
                  >
                    {icon}
                  </div>
                  <input
                    type="url"
                    value={form.socials[key]}
                    onChange={(e) => social(key, e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded-xl text-[13px] text-[var(--ink)]
                      placeholder:text-[var(--ink4)] outline-none border border-[var(--border2)]
                      focus:border-[var(--accent)] transition-colors"
                    style={{ background: "var(--bg-surface)" }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ORDER ────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <Label>Display Order</Label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => field("order", Number(e.target.value))}
                className="w-24 px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)] text-center
                  outline-none border border-[var(--border2)] focus:border-[var(--accent)] transition-colors"
                style={{ background: "var(--bg-surface)" }}
              />
              <p className="text-[12px] text-[var(--ink4)] font-body">
                Lower number = appears first on team page.
                <span className="text-[var(--ink3)]"> (0 = first)</span>
              </p>
            </div>
          </div>

          {/* Error ─────────────────────────────────────────────────────── */}
          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px]"
              style={{
                background: "rgba(255,80,80,0.08)",
                border: "1px solid rgba(255,80,80,0.2)",
                color: "#FF6B6B",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Actions ───────────────────────────────────────────────────── */}
          <div className="flex gap-3 pt-2 sticky bottom-0 pb-4"
            style={{ background: "var(--bg-panel)", marginLeft: "-1.5rem", marginRight: "-1.5rem", padding: "1rem 1.5rem" }}>
            <button
              type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl text-[14px] font-medium border border-[var(--border2)]
                text-[var(--ink3)] hover:text-[var(--ink)] hover:border-[var(--ink3)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white
                disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
              style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))" }}
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Saving…
                </span>
              ) : (
                isEdit ? "Save Changes" : "Add Member →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}