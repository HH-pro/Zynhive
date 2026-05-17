import type { IncomingMessage, ServerResponse } from "http";

const BRAND_GRADIENT = "linear-gradient(135deg,#4338CA 0%,#6366F1 48%,#818CF8 100%)";

function emailWrapper(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>ZynHive</title>
</head>
<body style="margin:0;padding:0;background-color:#05080F;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
  style="background-color:#05080F;padding:48px 16px;">
<tr><td align="center">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;
           box-shadow:0 40px 100px rgba(0,0,0,0.6);">

    ${bodyHtml}

    <!-- FOOTER -->
    <tr>
      <td style="background:#F8FAFF;border-top:1px solid #E5EAF5;padding:24px 36px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:12px;">
          <tr>
            <td style="background:${BRAND_GRADIENT};border-radius:9px;width:30px;height:30px;
                       text-align:center;vertical-align:middle;line-height:30px;">
              <span style="color:#fff;font-size:9px;font-weight:800;font-family:Arial,sans-serif;">ZH</span>
            </td>
            <td style="padding-left:9px;vertical-align:middle;">
              <span style="color:#0F172A;font-size:14px;font-weight:800;font-family:Arial,sans-serif;
                           letter-spacing:-0.3px;">ZynHive</span>
            </td>
          </tr>
        </table>
        <p style="color:#94A3B8;font-size:11px;margin:0 0 8px;font-family:Arial,sans-serif;">
          Your Digital Growth Partner &nbsp;·&nbsp; © 2025
        </p>
        <p style="color:#CBD5E1;font-size:10px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
          You're receiving this because you enabled email alerts on your client portal.
        </p>
      </td>
    </tr>

  </table>

</td></tr>
</table>

</body>
</html>`;
}

function buildUpdateHtml(toName: string, projectName: string, updateTitle: string, portalUrl: string): string {
  const body = `
    <!-- HEADER -->
    <tr>
      <td style="background:${BRAND_GRADIENT};padding:44px 36px 38px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:26px;">
          <tr>
            <td style="background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);
                       border-radius:12px;padding:10px 22px;">
              <span style="color:#fff;font-size:15px;font-weight:800;letter-spacing:-0.3px;
                           font-family:Arial,sans-serif;">&#10022; ZynHive</span>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:18px;">
          <tr>
            <td style="background:rgba(255,255,255,0.16);border-radius:16px;
                       width:58px;height:58px;text-align:center;vertical-align:middle;
                       font-size:26px;line-height:58px;">
              &#128203;
            </td>
          </tr>
        </table>
        <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;
                   letter-spacing:-0.6px;font-family:Arial,sans-serif;">New Project Update</h1>
        <p style="color:rgba(255,255,255,0.72);font-size:14px;margin:0;line-height:1.6;
                  font-family:Arial,sans-serif;">
          Your team just posted something new for you to review
        </p>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:38px 36px 32px;background:#ffffff;">

        <p style="color:#1E293B;font-size:16px;font-weight:500;margin:0 0 28px;
                  line-height:1.65;font-family:Arial,sans-serif;">
          Hello <strong style="color:#0F172A;">${toName}</strong> &#128075;<br/>
          <span style="color:#64748B;font-size:14px;">There's a new update on your project &mdash; here's a quick summary:</span>
        </p>

        <!-- Update info card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="margin-bottom:26px;border-radius:14px;overflow:hidden;
                 border:1px solid #DDE3F5;background:#F5F7FF;">
          <tr>
            <td style="border-left:4px solid #6366F1;padding:22px 24px;">
              <p style="color:#6366F1;font-size:10px;font-weight:800;text-transform:uppercase;
                        letter-spacing:0.09em;margin:0 0 9px;font-family:Arial,sans-serif;">
                &#128203; &nbsp;Update
              </p>
              <p style="color:#0F172A;font-size:18px;font-weight:700;margin:0 0 ${projectName ? "12px" : "0"};
                        line-height:1.3;font-family:Arial,sans-serif;">${updateTitle}</p>
              ${projectName ? `
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#EEF2FF;border-radius:7px;padding:5px 12px;">
                    <span style="color:#6366F1;font-size:12px;font-weight:600;
                                 font-family:Arial,sans-serif;">&#128193; &nbsp;${projectName}</span>
                  </td>
                </tr>
              </table>` : ""}
            </td>
          </tr>
        </table>

        <!-- Feature badges row -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
          <tr>
            <td width="33%" align="center" style="padding:4px;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;
                             padding:12px 10px;text-align:center;min-width:100px;">
                    <div style="font-size:20px;line-height:1;margin-bottom:5px;">&#128202;</div>
                    <p style="color:#15803D;font-size:10px;font-weight:700;margin:0;
                              font-family:Arial,sans-serif;line-height:1.4;">Live Progress<br/>Tracking</p>
                  </td>
                </tr>
              </table>
            </td>
            <td width="33%" align="center" style="padding:4px;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:10px;
                             padding:12px 10px;text-align:center;min-width:100px;">
                    <div style="font-size:20px;line-height:1;margin-bottom:5px;">&#128172;</div>
                    <p style="color:#1D4ED8;font-size:10px;font-weight:700;margin:0;
                              font-family:Arial,sans-serif;line-height:1.4;">Leave Your<br/>Feedback</p>
                  </td>
                </tr>
              </table>
            </td>
            <td width="33%" align="center" style="padding:4px;">
              <table cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:10px;
                             padding:12px 10px;text-align:center;min-width:100px;">
                    <div style="font-size:20px;line-height:1;margin-bottom:5px;">&#9989;</div>
                    <p style="color:#6D28D9;font-size:10px;font-weight:700;margin:0;
                              font-family:Arial,sans-serif;line-height:1.4;">Mark as<br/>Reviewed</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${portalUrl}"
                style="display:inline-block;background:${BRAND_GRADIENT};color:#ffffff;
                       text-decoration:none;padding:16px 52px;border-radius:13px;
                       font-size:15px;font-weight:800;letter-spacing:-0.2px;
                       font-family:Arial,sans-serif;">
                View Update in Portal &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr><td style="border-top:1px solid #E8EDF5;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;line-height:1.7;
                  font-family:Arial,sans-serif;">
          Questions? Just reply to your project manager or visit your portal.<br/>
          <a href="${portalUrl}" style="color:#6366F1;text-decoration:none;font-weight:600;">
            Manage notification preferences &rarr;
          </a>
        </p>

      </td>
    </tr>
  `;
  return emailWrapper(body);
}

function buildReplyHtml(toName: string, projectName: string, updateTitle: string, replyMessage: string, portalUrl: string): string {
  const body = `
    <!-- HEADER -->
    <tr>
      <td style="background:linear-gradient(135deg,#0F4C8A 0%,#1D4ED8 45%,#3B82F6 100%);
                 padding:44px 36px 38px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:26px;">
          <tr>
            <td style="background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);
                       border-radius:12px;padding:10px 22px;">
              <span style="color:#fff;font-size:15px;font-weight:800;letter-spacing:-0.3px;
                           font-family:Arial,sans-serif;">&#10022; ZynHive</span>
            </td>
          </tr>
        </table>
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:18px;">
          <tr>
            <td style="background:rgba(255,255,255,0.16);border-radius:16px;
                       width:58px;height:58px;text-align:center;vertical-align:middle;
                       font-size:26px;line-height:58px;">
              &#128172;
            </td>
          </tr>
        </table>
        <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;
                   letter-spacing:-0.6px;font-family:Arial,sans-serif;">Team Replied to You</h1>
        <p style="color:rgba(255,255,255,0.72);font-size:14px;margin:0;line-height:1.6;
                  font-family:Arial,sans-serif;">
          The ZynHive team responded to your feedback
        </p>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:38px 36px 32px;background:#ffffff;">

        <p style="color:#1E293B;font-size:16px;font-weight:500;margin:0 0 28px;
                  line-height:1.65;font-family:Arial,sans-serif;">
          Hello <strong style="color:#0F172A;">${toName}</strong> &#128075;<br/>
          <span style="color:#64748B;font-size:14px;">
            The ZynHive team replied to your feedback${updateTitle ? ` on <strong style="color:#1E293B;">${updateTitle}</strong>` : ""}.
          </span>
        </p>

        ${updateTitle ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
          <tr>
            <td style="background:#F8FAFF;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;">
              <p style="color:#94A3B8;font-size:10px;font-weight:700;text-transform:uppercase;
                        letter-spacing:0.07em;margin:0 0 4px;font-family:Arial,sans-serif;">Regarding update</p>
              <p style="color:#475569;font-size:13px;font-weight:600;margin:0;
                        font-family:Arial,sans-serif;">${updateTitle}</p>
              ${projectName ? `<p style="color:#94A3B8;font-size:12px;margin:4px 0 0;font-family:Arial,sans-serif;">&#128193; ${projectName}</p>` : ""}
            </td>
          </tr>
        </table>` : ""}

        <!-- Reply message -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#EFF6FF;border:1px solid #BFDBFE;border-left:4px solid #3B82F6;
                       border-radius:14px;padding:22px 24px;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#3B82F6,#6366F1);border-radius:8px;
                             width:30px;height:30px;text-align:center;vertical-align:middle;line-height:30px;">
                    <span style="color:#fff;font-size:9px;font-weight:800;font-family:Arial,sans-serif;">ZH</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#1D4ED8;font-size:12px;font-weight:700;
                                 font-family:Arial,sans-serif;">ZynHive Team</span>
                  </td>
                </tr>
              </table>
              <p style="color:#1E293B;font-size:14px;line-height:1.75;margin:0;
                        font-family:Arial,sans-serif;">${replyMessage}</p>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <a href="${portalUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#1D4ED8 0%,#3B82F6 100%);
                       color:#ffffff;text-decoration:none;padding:16px 52px;border-radius:13px;
                       font-size:15px;font-weight:800;letter-spacing:-0.2px;
                       font-family:Arial,sans-serif;">
                View Full Conversation &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>

        <!-- Divider -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
          <tr><td style="border-top:1px solid #E8EDF5;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>

        <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;line-height:1.7;
                  font-family:Arial,sans-serif;">
          You can reply directly from your project portal.<br/>
          <a href="${portalUrl}" style="color:#6366F1;text-decoration:none;font-weight:600;">
            Open my portal &rarr;
          </a>
        </p>

      </td>
    </tr>
  `;
  return emailWrapper(body);
}

function buildAdminReviewHtml(
  memberName: string, taskTitle: string, taskDescription: string,
  report: string, linkedClientName: string, dashboardUrl: string,
): string {
  const ADMIN_GRADIENT = "linear-gradient(135deg,#059669 0%,#10B981 50%,#34D399 100%)";
  const body = `
    <tr>
      <td style="background:${ADMIN_GRADIENT};padding:44px 36px 38px;text-align:center;">
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:26px;">
          <tr>
            <td style="background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.26);
                       border-radius:12px;padding:10px 22px;">
              <span style="color:#fff;font-size:15px;font-weight:800;letter-spacing:-0.3px;
                           font-family:Arial,sans-serif;">&#10022; ZynHive</span>
            </td>
          </tr>
        </table>
        <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;
                   letter-spacing:-0.6px;font-family:Arial,sans-serif;">Review Required</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:14px;margin:0;line-height:1.6;
                  font-family:Arial,sans-serif;">
          ${memberName} completed a task and needs your review
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:38px 36px 32px;background:#ffffff;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-radius:14px;overflow:hidden;border:1px solid #DDE3F5;background:#F5F7FF;">
          <tr>
            <td style="border-left:4px solid #10B981;padding:22px 24px;">
              <p style="color:#059669;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.09em;margin:0 0 6px;font-family:Arial,sans-serif;">Task Completed</p>
              <p style="color:#0F172A;font-size:17px;font-weight:700;margin:0 0 8px;line-height:1.3;font-family:Arial,sans-serif;">${taskTitle}</p>
              ${taskDescription ? `<p style="color:#64748B;font-size:13px;margin:0 0 8px;line-height:1.6;font-family:Arial,sans-serif;">${taskDescription}</p>` : ""}
              ${linkedClientName ? `<span style="background:#ECFDF5;border-radius:7px;padding:4px 10px;color:#059669;font-size:11px;font-weight:600;font-family:Arial,sans-serif;">&#128100; ${linkedClientName}</span>` : ""}
            </td>
          </tr>
        </table>
        ${report ? `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#F8FAFF;border:1.5px solid #C7D2FE;border-left:4px solid #6366F1;border-radius:14px;padding:18px 20px;">
              <p style="color:#6366F1;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;font-family:Arial,sans-serif;">Member's Report</p>
              <p style="color:#1E293B;font-size:14px;line-height:1.75;margin:0;font-family:Arial,sans-serif;white-space:pre-line;">${report}</p>
            </td>
          </tr>
        </table>` : ""}
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr>
            <td align="center">
              <a href="${dashboardUrl}" style="display:inline-block;background:${ADMIN_GRADIENT};color:#fff;text-decoration:none;padding:16px 52px;border-radius:13px;font-size:15px;font-weight:800;letter-spacing:-0.2px;font-family:Arial,sans-serif;">
                Review in Dashboard &nbsp;&rarr;
              </a>
            </td>
          </tr>
        </table>
        <p style="color:#94A3B8;font-size:12px;text-align:center;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
          Accept to post it to the client portal, or reject it from your dashboard.
        </p>
      </td>
    </tr>
  `;
  return emailWrapper(body);
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  if (req.method !== "POST") {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const body = req.body as {
    type?: "update" | "reply" | "admin-review" | "task";
    toEmail: string;
    toName: string;
    projectName: string;
    updateTitle: string;
    portalUrl: string;
    replyMessage?: string;
    memberName?: string;
    taskTitle?: string;
    taskDescription?: string;
    priority?: string;
    dueDate?: string;
    report?: string;
    linkedClientName?: string;
    dashboardUrl?: string;
  };

  const { type = "update", toEmail, toName, projectName, updateTitle, portalUrl, replyMessage,
          memberName, taskTitle, taskDescription, priority, dueDate, report, linkedClientName, dashboardUrl } = body ?? {};

  if (!toEmail) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing required fields" }));
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL ?? "onboarding@resend.dev";
  const fromName  = process.env.FROM_NAME  ?? "ZynHive";

  if (!resendKey) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Email service not configured" }));
    return;
  }

  let html: string;
  let subject: string;

  if (type === "admin-review") {
    html    = buildAdminReviewHtml(memberName ?? "", taskTitle ?? "", taskDescription ?? "", report ?? "", linkedClientName ?? "", dashboardUrl ?? "");
    subject = `✅ Review Needed: ${memberName ?? "A team member"} completed "${taskTitle ?? "a task"}"`;
  } else if (type === "reply") {
    html    = buildReplyHtml(toName, projectName, updateTitle, replyMessage ?? "", portalUrl);
    subject = `ZynHive Team replied to your feedback${updateTitle ? ` on "${updateTitle}"` : ""}`;
  } else if (type === "task") {
    subject = `New Task Assigned: ${taskTitle ?? ""}`;
    html    = buildUpdateHtml(toName, taskTitle ?? "", taskDescription ?? "", portalUrl);
  } else {
    html    = buildUpdateHtml(toName, projectName, updateTitle, portalUrl);
    subject = `New Update: ${updateTitle || projectName || "Your Project"}`;
  }

  try {
    const sendRes = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from:     `${fromName} <${fromEmail}>`,
        to:       [toEmail],
        subject,
        html,
        text:     subject,
        reply_to: fromEmail,
      }),
    });

    if (!sendRes.ok) {
      const errBody = await sendRes.json().catch(() => ({ message: `Resend ${sendRes.status}` }));
      throw new Error((errBody as { message?: string }).message ?? `Resend ${sendRes.status}`);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("[send-email] Resend error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to send email" }));
  }
}
