// ─── src/components/admin/ProjectForm.tsx ───────────────────────────────────
import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { uploadToCloudinary }                                  from "../../lib/cloudinary";
import { createProject, updateProject, type FirestoreProject } from "../../lib/firebase";

const EMOJI_OPTIONS = ["🤖","🌐","📱","✦","📈","⚙️","🏦","🎨","🚀","🛒","🔒","💡","🧠","📊","🎯"];
const COLOR_OPTIONS = ["#3B6EF8","#00AACC","#7B5CFA","#1A66FF","#0DBFA8","#4D5BFF","#FF6B6B","#F59E0B"];
const CATEGORIES    = ["AI Development","Web Application","Mobile App","UI/UX Design","Digital Marketing","Software Consulting"];

type Props = {
  project?:             FirestoreProject | null;
  onClose:              () => void;
  onSaved:              () => void;
  // Called when "Save & Add Another" is clicked — parent should NOT close the form
  onSavedAndContinue?:  () => void;
};

const EMPTY: Omit<FirestoreProject,"id"|"createdAt"|"updatedAt"> = {
  title: "", category: CATEGORIES[0], tags: [], description: "", result: "",
  emoji: "🤖", color: "#3B6EF8", featured: false,
  imageUrl: "", imagePublicId: "", liveUrl: "", githubUrl: "",
};

export function ProjectForm({ project, onClose, onSaved, onSavedAndContinue }: Props) {
  const isEdit = !!project;

  const [form,       setForm]       = useState({ ...EMPTY, ...project });
  const [tagInput,   setTagInput]   = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileRef                     = useRef<HTMLInputElement>(null);

  function field(key: keyof typeof EMPTY, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) field("tags", [...form.tags, t]);
    setTagInput("");
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadPct(0);
    try {
      const res = await uploadToCloudinary(file, "zynhive/portfolio", setUploadPct);
      field("imageUrl",      res.secure_url);
      field("imagePublicId", res.public_id);
    } catch (err) {
      setError("Image upload failed. Check Cloudinary config.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);
    try {
      if (isEdit && project?.id) {
        await updateProject(project.id, form);
      } else {
        await createProject(form);
      }
      onSaved();   // tells parent to refresh list + show toast
      onClose();   // closes the drawer
    } catch (err) {
      setError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveAndAddAnother() {
    setError("");
    setSuccessMsg("");
    setSaving(true);
    try {
      await createProject(form);

      // Tell parent to refresh list + show toast, but NOT close the form
      onSavedAndContinue?.();

      // Reset form locally — drawer stays open
      setForm({ ...EMPTY });
      setTagInput("");
      if (fileRef.current) fileRef.current.value = "";
      setSuccessMsg("✓ Project saved! Fill in details for the next one.");
    } catch (err) {
      setError("Failed to save. Please try again.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>

      <div
        className="relative h-full w-full max-w-[600px] overflow-y-auto flex flex-col"
        style={{
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border)",
          animation: "slideInRight .3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] sticky top-0 z-10"
          style={{ background: "var(--bg-panel)" }}>
          <div>
            <h2 className="font-display text-[17px] font-bold text-[var(--ink)] tracking-tight">
              { "Add New Project"}
            </h2>
            <p className="font-mono text-[10px] text-[var(--ink4)] tracking-[0.1em] mt-0.5">
              {isEdit ? `ID: ${project?.id?.slice(0,8)}…` : "New entry → Firestore + Cloudinary"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--ink4)]
              hover:text-[var(--ink)] hover:bg-[var(--border)] transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="mx-6 mt-5 flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px]"
            style={{ background: "rgba(13,191,168,0.1)", border: "1px solid rgba(13,191,168,0.3)", color: "var(--cyan)" }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M4 6.5l2 2 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6 flex-1">

          {/* IMAGE UPLOAD */}
          <div className="flex flex-col gap-2">
            <Label>Cover Image</Label>
            <div
              onClick={() => !uploading && fileRef.current?.click()}
              className={`relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center
                cursor-pointer transition-all duration-300 overflow-hidden ${
                form.imageUrl ? "border-[var(--accent)] h-44" : "border-[var(--border2)] h-36 hover:border-[var(--accent)]"
              }`}
              style={{ background: "var(--bg-surface)" }}
            >
              {form.imageUrl ? (
                <>
                  <img src={form.imageUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-mono">Click to replace</span>
                  </div>
                </>
              ) : uploading ? (
                <div className="flex flex-col items-center gap-3 w-full px-8">
                  <div className="w-full bg-[var(--border)] rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${uploadPct}%`, background: "linear-gradient(90deg, var(--accent), var(--cyan))" }} />
                  </div>
                  <span className="font-mono text-[11px] text-[var(--accent)]">Uploading {uploadPct}%…</span>
                </div>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-2 text-[var(--ink4)]">
                    <path d="M4 16l4-4 4 4 4-6 4 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <span className="text-[13px] text-[var(--ink4)]">Click to upload image</span>
                  <span className="font-mono text-[10px] text-[var(--ink4)] mt-0.5">PNG, JPG, WEBP · max 10MB</span>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>

          {/* TITLE + EMOJI */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Project Title *</Label>
              <Input
                value={form.title}
                onChange={(v) => field("title", v)}
                placeholder="e.g. NeuralDesk AI"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Icon</Label>
              <div className="relative group">
                <button type="button"
                  className="w-[46px] h-[38px] rounded-xl border border-[var(--border2)] flex items-center
                    justify-center text-xl hover:border-[var(--accent)] transition-colors"
                  style={{ background: "var(--bg-surface)" }}>
                  {form.emoji}
                </button>
                <div className="absolute top-full mt-1 right-0 z-20 p-2 rounded-xl border border-[var(--border)]
                  grid grid-cols-5 gap-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto
                  transition-opacity duration-200"
                  style={{ background: "var(--bg-panel)" }}>
                  {EMOJI_OPTIONS.map((em) => (
                    <button key={em} type="button" onClick={() => field("emoji", em)}
                      className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-colors ${
                        form.emoji === em ? "bg-[var(--accent-pale)]" : "hover:bg-[var(--border)]"
                      }`}>{em}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY + COLOR */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Category *</Label>
              <select
                value={form.category}
                onChange={(e) => field("category", e.target.value)}
                className="px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)] outline-none border border-[var(--border2)]
                  focus:border-[var(--accent)] transition-colors"
                style={{ background: "var(--bg-surface)" }}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Accent Color</Label>
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => field("color", c)}
                    className={`w-7 h-7 rounded-full transition-all duration-200 ${
                      form.color === c
                        ? "ring-2 ring-offset-2 ring-[var(--accent)] scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-1.5">
            <Label>Description *</Label>
            <textarea
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
              placeholder="Brief project description (2–3 sentences)"
              rows={3}
              required
              className="px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)] placeholder:text-[var(--ink4)]
                outline-none resize-none border border-[var(--border2)] focus:border-[var(--accent)]
                transition-colors leading-relaxed"
              style={{ background: "var(--bg-surface)" }}
            />
          </div>

          {/* RESULT */}
          <div className="flex flex-col gap-1.5">
            <Label>Key Result *</Label>
            <Input
              value={form.result}
              onChange={(v) => field("result", v)}
              placeholder='e.g. "Reduced support tickets by 68%"'
              required
            />
          </div>

          {/* TAGS */}
          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="e.g. LLM, React, Python"
                className="flex-1 px-3 py-2 rounded-xl text-[13px] text-[var(--ink)] placeholder:text-[var(--ink4)]
                  outline-none border border-[var(--border2)] focus:border-[var(--accent)] transition-colors"
                style={{ background: "var(--bg-surface)" }}
              />
              <button type="button" onClick={addTag}
                className="px-3 py-2 rounded-xl text-[12px] font-mono text-[var(--accent)] border border-[var(--accent-pale2)]
                  hover:bg-[var(--accent-pale)] transition-colors">
                + Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono
                    border border-[var(--border2)]" style={{ background: "var(--bg-surface)", color: "var(--ink3)" }}>
                    {t}
                    <button type="button" onClick={() => field("tags", form.tags.filter((x) => x !== t))}
                      className="text-[var(--ink4)] hover:text-red-400 transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* LINKS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Live URL</Label>
              <Input value={form.liveUrl} onChange={(v) => field("liveUrl", v)} placeholder="https://…" type="url"/>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>GitHub URL</Label>
              <Input value={form.githubUrl} onChange={(v) => field("githubUrl", v)} placeholder="https://github.com/…" type="url"/>
            </div>
          </div>

          {/* FEATURED TOGGLE */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => field("featured", !form.featured)}
              className="relative w-10 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
              style={form.featured
                ? { background: "linear-gradient(135deg, var(--accent), var(--cyan))" }
                : { background: "var(--border2)" }
              }
            >
              <span
                className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                style={{ left: form.featured ? "calc(100% - 20px)" : "4px" }}
              />
            </div>
            <span className="text-[14px] text-[var(--ink2)] font-body">Feature this project on homepage</span>
          </label>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[13px]"
              style={{ background: "var(--red-pale)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--red)" }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1"/>
                <path d="M6.5 4v3M6.5 9h.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-3">
              <button type="button" onClick={onClose}
                className="flex-1 py-3 rounded-xl text-[14px] font-medium border border-[var(--border2)]
                  text-[var(--ink3)] hover:text-[var(--ink)] hover:border-[var(--ink3)] transition-all"
                style={{ background: "transparent", cursor: "pointer" }}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploading}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--cyan))", cursor: "pointer" }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    Saving…
                  </span>
                ) : (
                  isEdit ? "Save Changes" : "Create Project →"
                )}
              </button>
            </div>

            {/* Save & Add Another — only in create mode, always visible */}
            {isEdit && (
              <button
                type="button"
                disabled={saving || uploading}
                onClick={handleSaveAndAddAnother}
                className="w-full py-3 rounded-xl text-[14px] font-medium border border-dashed
                  border-[var(--accent-pale2)] text-[var(--accent)] hover:bg-[var(--accent-pale)]
                  disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200
                  flex items-center justify-center gap-2"
                style={{ background: "transparent", cursor: "pointer" }}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[var(--accent)]/30 border-t-[var(--accent)] rounded-full animate-spin"/>
                    Saving…
                  </span>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    Save & Add Another
                  </>
                )}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--ink3)]">
      {children}
    </span>
  );
}

function Input({
  value, onChange, placeholder, required, type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="px-3 py-2.5 rounded-xl text-[14px] text-[var(--ink)] placeholder:text-[var(--ink4)]
        outline-none border border-[var(--border2)] focus:border-[var(--accent)] transition-colors w-full"
      style={{ background: "var(--bg-surface)" }}
    />
  );
}