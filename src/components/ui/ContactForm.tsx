import { useForm } from "../../hooks/index";
import { Button, CheckIcon } from "../ui/index";
import { SITE_CONFIG } from "../../lib/data";

const INPUT_BASE = "input-field";

export function ContactForm() {
  const { form, status, errors, handleChange, handleSubmit } = useForm();

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-5" style={{ animation: "slideUp .4s var(--ease)" }}>
        <div className="w-16 h-16 rounded-full bg-[var(--amber-pale)] border border-[var(--amber-pale2)] flex items-center justify-center">
          <CheckIcon className="w-7 h-7 text-[var(--accent)]" />
        </div>
        <h3 className="font-syne text-xl font-bold text-[var(--ink)]">Message Sent!</h3>
        <p className="text-sm text-[var(--ink3)] max-w-xs">
          Thanks for reaching out. We'll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            className={`${INPUT_BASE} ${errors.name ? "error" : ""}`}
          />
          {errors.name && <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            className={`${INPUT_BASE} ${errors.email ? "error" : ""}`}
          />
          {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
        </div>
      </div>

      {/* Subject */}
      <input
        name="subject"
        value={form.subject}
        onChange={handleChange}
        placeholder="Subject (optional)"
        className={INPUT_BASE}
      />

      {/* Message */}
      <div>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your project..."
          rows={5}
          className={`${INPUT_BASE} resize-none ${errors.message ? "error" : ""}`}
        />
        {errors.message && <p className="mt-1.5 text-xs text-red-500">{errors.message}</p>}
      </div>

      <Button type="submit" variant="amber" size="lg" loading={status === "sending"} className="w-full justify-center">
        {status === "sending" ? "Sending…" : "Send Message →"}
      </Button>

      <p className="text-center text-xs text-[var(--ink4)]">
        Or chat directly on{" "}
        <a href={SITE_CONFIG.whatsapp} target="_blank" rel="noreferrer" className="text-[var(--accent)] hover:underline">
          WhatsApp
        </a>
      </p>
    </form>
  );
}
