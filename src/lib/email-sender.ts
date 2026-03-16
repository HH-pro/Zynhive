// ─── src/lib/email-sender.ts ─────────────────────────────────────────────────
// Email sending via Render proxy (Resend backend)

const EMAIL_API_URL = import.meta.env.VITE_EMAIL_API_URL ?? "";
const RESEND_KEY    = import.meta.env.VITE_RESEND_API_KEY ?? "";
const FROM_EMAIL    = import.meta.env.VITE_EMAIL_FROM     ?? "noreply@zynhive.com";
const FROM_NAME     = import.meta.env.VITE_APP_NAME       ?? "ZynHive";
const REPLY_TO      = import.meta.env.VITE_REPLY_TO       ?? "";  // ← aapki Gmail jahan reply aaye

export interface SendEmailPayload {
  to:       string;
  subject:  string;
  body:     string;
  replyTo?: string;
}

export interface SendEmailResult {
  success:    boolean;
  messageId?: string;
  error?:     string;
}

// ── Via Render backend proxy ──────────────────────────────────────────────────
export async function sendEmailViaBackend(
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  try {
    const res = await fetch(EMAIL_API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        // replyTo — pehle payload ka use karo, phir .env ka, phir FROM_EMAIL
        replyTo: payload.replyTo || REPLY_TO || FROM_EMAIL,
      }),
    });

    if (!res.ok) throw new Error(`Backend ${res.status}`);
    return await res.json();

  } catch (err: any) {
    console.error("[Email] Backend send failed:", err);
    // Backend fail hone pe direct try karo
    return sendEmailDirect(payload);
  }
}

// ── Direct via Resend API (fallback) ─────────────────────────────────────────
export async function sendEmailDirect(
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  if (!RESEND_KEY) {
    console.log("[Email SIMULATED]", payload);
    return { success: true, messageId: `sim_${Date.now()}` };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from:     `${FROM_NAME} <${FROM_EMAIL}>`,
        to:       [payload.to],
        subject:  payload.subject,
        text:     payload.body,
        reply_to: payload.replyTo || REPLY_TO || FROM_EMAIL,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(err.message ?? `Resend ${res.status}`);
    }

    const data = await res.json();
    return { success: true, messageId: data.id };

  } catch (err: any) {
    console.error("[Email] Direct send failed:", err);
    return { success: false, error: err?.message ?? "Send failed" };
  }
}

// ── Main export — backend first, direct fallback ──────────────────────────────
export async function sendEmail(
  payload: SendEmailPayload,
): Promise<SendEmailResult> {
  if (EMAIL_API_URL) return sendEmailViaBackend(payload);
  return sendEmailDirect(payload);
}