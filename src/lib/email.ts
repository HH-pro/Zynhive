// ─── src/lib/email.ts ─────────────────────────────────────────────────────────
// Sends emails via the /api/send-email Vercel serverless function.
// Configure these in Vercel environment variables (NOT in .env — server-side only):
//   GMAIL_USER          your Gmail address (e.g. zynhive@gmail.com)
//   GMAIL_APP_PASSWORD  16-char Google App Password

export async function sendUpdateNotificationEmail(params: {
  toEmail:     string;
  toName:      string;
  projectName: string;
  updateTitle: string;
  portalUrl:   string;
}): Promise<void> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[email] send-email API error:", res.status, text);
    }
  } catch (err) {
    console.error("[email] Failed to reach send-email API:", err);
  }
}
