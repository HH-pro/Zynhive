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

  const year = new Date().getFullYear();
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>New Project Update — ZynHive</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F1F5FB;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1F5FB;padding:40px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(99,102,241,0.10);">

          <!-- ── Header banner ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);padding:36px 40px 32px;text-align:center;">
              <!-- Logo mark -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.15);border-radius:12px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="font-size:18px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">ZH</span>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:0.1em;">ZynHive Client Portal</p>
              <h1 style="margin:0;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.2;">Project Update Ready</h1>
            </td>
          </tr>

          <!-- ── Notification badge ── -->
          <tr>
            <td style="padding:0 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:-18px;">
                <tr>
                  <td align="center">
                    <span style="display:inline-block;background:#EEF2FF;border:1.5px solid #C7D2FE;border-radius:99px;padding:5px 16px;font-size:12px;font-weight:700;color:#4F46E5;letter-spacing:0.04em;">
                      🔔 &nbsp;New update posted to your project
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="padding:28px 40px 0;">
              <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:#0F172A;">
                Hello, ${toName} 👋
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748B;line-height:1.75;">
                We've just added a new update to your project on the ZynHive Client Portal. Here's a quick summary of what's new:
              </p>
            </td>
          </tr>

          <!-- ── Info card ── -->
          <tr>
            <td style="padding:0 40px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#F8FAFF;border:1.5px solid #E0E7FF;border-radius:12px;overflow:hidden;">
                ${projectName ? `
                <tr>
                  <td style="padding:16px 20px 12px;border-bottom:1px solid #E0E7FF;">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:0.1em;">Project</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#0F172A;">${projectName}</p>
                  </td>
                </tr>` : ""}
                ${updateTitle ? `
                <tr>
                  <td style="padding:14px 20px 16px;">
                    <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#6366F1;text-transform:uppercase;letter-spacing:0.1em;">Latest Update</p>
                    <p style="margin:0;font-size:15px;font-weight:700;color:#0F172A;">${updateTitle}</p>
                  </td>
                </tr>` : ""}
              </table>
            </td>
          </tr>

          <!-- ── Divider ── -->
          <tr><td style="padding:24px 40px 0;"><div style="height:1px;background:#F1F5FB;"></div></td></tr>

          <!-- ── CTA ── -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0 0 16px;font-size:13px;color:#64748B;line-height:1.7;">
                Log in to your client portal to view the full update details, track progress, and share your feedback with our team.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${portalUrl}"
                      style="display:inline-block;background:linear-gradient(135deg,#4F46E5 0%,#7C3AED 100%);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:0.01em;">
                      View My Project Update &rarr;
                    </a>
                  </td>
                </tr>
              </table>
              <!-- Fallback link -->
              <p style="margin:12px 0 0;font-size:11px;color:#94A3B8;text-align:center;">
                Or copy this link: <a href="${portalUrl}" style="color:#6366F1;word-break:break-all;">${portalUrl}</a>
              </p>
            </td>
          </tr>

          <!-- ── What's next tip ── -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#FFFBEB;border:1.5px solid #FDE68A;border-radius:10px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#92400E;line-height:1.65;">
                      <strong style="color:#78350F;">💡 Tip:</strong> &nbsp;You can leave feedback or ask questions directly inside your portal — our team will respond promptly.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#F8FAFF;border-top:1px solid #E0E7FF;padding:20px 40px;text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#4F46E5;">ZynHive</p>
              <p style="margin:0 0 10px;font-size:11px;color:#94A3B8;">Your Digital Growth Partner</p>
              <p style="margin:0;font-size:10px;color:#CBD5E1;line-height:1.6;">
                You received this email because you are a ZynHive client.<br/>
                &copy; ${year} ZynHive. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>

</body>
</html>`;

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
