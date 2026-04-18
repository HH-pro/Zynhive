import nodemailer from "nodemailer";
import type { IncomingMessage, ServerResponse } from "http";

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = req.body as {
    toEmail: string;
    toName: string;
    projectName: string;
    updateTitle: string;
    portalUrl: string;
  };

  const { toEmail, toName, projectName, updateTitle, portalUrl } = body ?? {};

  if (!toEmail || !toName) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing required fields" }));
    return;
  }

  const user     = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;

  if (!user || !password) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Email service not configured" }));
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: password },
  });

  const html = `
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

  try {
    await transporter.sendMail({
      from:    `"ZynHive" <${user}>`,
      to:      toEmail,
      subject: `New Update: ${updateTitle || projectName || "Your Project"}`,
      html,
    });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("[send-email] nodemailer error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to send email" }));
  }
}
