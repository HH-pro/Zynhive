// ─── src/lib/email.ts ─────────────────────────────────────────────────────────
// Primary path: VITE_EMAIL_API_URL (Render backend → Resend) — works locally & on Vercel.
// Fallback:     /api/send-email (Vercel serverless, Gmail/nodemailer) — Vercel-only.

import { sendEmail } from "./email-sender";

function updateHtml(toName: string, projectName: string, updateTitle: string, portalUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 24px;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#6366F1,#818CF8);border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px;">
          <span style="font-size:16px;font-weight:800;color:white;">ZH</span>
        </div>
        <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">New Project Update</h1>
      </div>

      <p style="color:#334155;font-size:15px;margin:0 0 8px;">Hello <strong>${toName}</strong>,</p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px;">
        Your project has a new update. Here's a quick summary:
      </p>

      <div style="background:white;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
        ${projectName ? `<div style="margin-bottom:10px;"><span style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.06em;">Project</span><br/><span style="font-size:14px;font-weight:600;color:#0f172a;">${projectName}</span></div>` : ""}
        ${updateTitle ? `<div><span style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.06em;">Update</span><br/><span style="font-size:14px;font-weight:600;color:#0f172a;">${updateTitle}</span></div>` : ""}
      </div>

      <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366F1,#818CF8);color:white;text-decoration:none;padding:13px 0;border-radius:9px;font-size:14px;font-weight:700;margin-bottom:20px;">
        View Full Update →
      </a>

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
        — ZynHive Team &nbsp;·&nbsp; Your Digital Growth Partner
      </p>
    </div>
  `;
}

function replyHtml(toName: string, projectName: string, updateTitle: string, replyMessage: string, portalUrl: string) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f8fafc;padding:32px 24px;border-radius:12px;">
      <div style="background:linear-gradient(135deg,#6366F1,#818CF8);border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="width:40px;height:40px;background:rgba(255,255,255,.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:10px;">
          <span style="font-size:16px;font-weight:800;color:white;">ZH</span>
        </div>
        <h1 style="color:white;font-size:20px;font-weight:800;margin:0;">Team Replied to Your Feedback</h1>
      </div>

      <p style="color:#334155;font-size:15px;margin:0 0 8px;">Hello <strong>${toName}</strong>,</p>
      <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px;">
        The ZynHive team has replied to your feedback${updateTitle ? ` on <strong>${updateTitle}</strong>` : ""}.
      </p>

      <div style="background:white;border:1px solid #e2e8f0;border-left:3px solid #6366F1;border-radius:10px;padding:18px 20px;margin-bottom:20px;">
        ${projectName ? `<div style="margin-bottom:12px;"><span style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.06em;">Project</span><br/><span style="font-size:14px;font-weight:600;color:#0f172a;">${projectName}</span></div>` : ""}
        ${replyMessage ? `<div><span style="font-size:11px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:.06em;">Reply</span><br/><span style="font-size:14px;color:#334155;line-height:1.7;">${replyMessage}</span></div>` : ""}
      </div>

      <a href="${portalUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#6366F1,#818CF8);color:white;text-decoration:none;padding:13px 0;border-radius:9px;font-size:14px;font-weight:700;margin-bottom:20px;">
        View Full Conversation →
      </a>

      <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
        — ZynHive Team &nbsp;·&nbsp; Your Digital Growth Partner
      </p>
    </div>
  `;
}

// ── Vercel serverless fallback (only when VITE_EMAIL_API_URL is not set) ───────
async function sendViaVercel(body: object): Promise<boolean> {
  try {
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[email] /api/send-email error:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] /api/send-email unreachable:", err);
    return false;
  }
}

export async function sendUpdateNotificationEmail(params: {
  toEmail:     string;
  toName:      string;
  projectName: string;
  updateTitle: string;
  portalUrl:   string;
}): Promise<void> {
  const { toEmail, toName, projectName, updateTitle, portalUrl } = params;
  const subject = `New Update: ${updateTitle || projectName || "Your Project"}`;
  const html    = updateHtml(toName, projectName, updateTitle, portalUrl);
  const body    = `Hi ${toName},\n\nYour project "${projectName}" has a new update: ${updateTitle}.\n\nView it here: ${portalUrl}\n\n— ZynHive Team`;

  // Primary: Render/Resend (works locally and on Vercel)
  const result = await sendEmail({ to: toEmail, subject, body, html });
  if (result.success) return;

  // Fallback: Vercel serverless (Vercel-only)
  await sendViaVercel({ type: "update", toEmail, toName, projectName, updateTitle, portalUrl });
}

export async function sendReplyNotificationEmail(params: {
  toEmail:      string;
  toName:       string;
  projectName:  string;
  updateTitle:  string;
  replyMessage: string;
  portalUrl:    string;
}): Promise<void> {
  const { toEmail, toName, projectName, updateTitle, replyMessage, portalUrl } = params;
  const subject = `ZynHive Team replied to your feedback${updateTitle ? ` on "${updateTitle}"` : ""}`;
  const html    = replyHtml(toName, projectName, updateTitle, replyMessage, portalUrl);
  const body    = `Hi ${toName},\n\nThe ZynHive team replied to your feedback on "${updateTitle}":\n\n"${replyMessage}"\n\nView the full conversation: ${portalUrl}\n\n— ZynHive Team`;

  const result = await sendEmail({ to: toEmail, subject, body, html });
  if (result.success) return;

  await sendViaVercel({ type: "reply", toEmail, toName, projectName, updateTitle, replyMessage, portalUrl });
}
