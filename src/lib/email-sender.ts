// ─── src/lib/email-sender.ts ─────────────────────────────────────────────────
// All emails go through /api/send-email (Vercel serverless → Resend).
// No direct browser → Resend calls (blocked by CORS).

export interface SendEmailPayload {
  to:      string;
  subject: string;
  body:    string;
  html?:   string;
}

export interface SendEmailResult {
  success:    boolean;
  messageId?: string;
  error?:     string;
}

export async function sendEmail(payload: SendEmailPayload): Promise<SendEmailResult> {
  try {
    const res = await fetch("/api/send-email", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type:    "direct",
        toEmail: payload.to,
        subject: payload.subject,
        html:    payload.html ?? "",
        text:    payload.body,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      return { success: false, error: (err as { error?: string }).error ?? `HTTP ${res.status}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    console.error("[Email] /api/send-email unreachable:", msg);
    return { success: false, error: msg };
  }
}
