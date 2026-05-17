// ─── src/lib/email-sender.ts ─────────────────────────────────────────────────
// Sends email via Resend API directly from the browser.
// VITE_RESEND_API_KEY must be set in .env

const RESEND_KEY = import.meta.env.VITE_RESEND_API_KEY ?? "";
const FROM_EMAIL = import.meta.env.VITE_EMAIL_FROM     ?? "onboarding@resend.dev";
const FROM_NAME  = import.meta.env.VITE_APP_NAME       ?? "ZynHive";
const REPLY_TO   = import.meta.env.VITE_REPLY_TO       ?? "";

export interface SendEmailPayload {
  to:       string;
  subject:  string;
  body:     string;
  html?:    string;
  replyTo?: string;
}

export interface SendEmailResult {
  success:    boolean;
  messageId?: string;
  error?:     string;
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  if (!RESEND_KEY) {
    console.warn("[Email] VITE_RESEND_API_KEY not set — email not sent.");
    return { success: false, error: "API key not configured" };
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
        ...(payload.html ? { html: payload.html } : {}),
        reply_to: payload.replyTo || REPLY_TO || FROM_EMAIL,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: `Resend ${res.status}` }));
      throw new Error((err as { message?: string }).message ?? `Resend ${res.status}`);
    }

    const data = await res.json() as { id?: string };
    return { success: true, messageId: data.id };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Send failed";
    console.error("[Email] Resend error:", msg);
    return { success: false, error: msg };
  }
}
