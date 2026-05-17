const h="re_PtprcVNk_M9fiyYAaBjzxVaTxGvUiDbAw",b="onboarding@resend.dev",m="ZynHive",u="zynhive@gmail.com";async function c(r){try{const t=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${h}`},body:JSON.stringify({from:`${m} <${b}>`,to:[r.to],subject:r.subject,text:r.body,...r.html?{html:r.html}:{},reply_to:r.replyTo||u||b})});if(!t.ok){const i=await t.json().catch(()=>({message:`Resend ${t.status}`}));throw new Error(i.message??`Resend ${t.status}`)}return{success:!0,messageId:(await t.json()).id}}catch(t){const e=t instanceof Error?t.message:"Send failed";return console.error("[Email] Resend error:",e),{success:!1,error:e}}}const g="linear-gradient(135deg,#3730A3 0%,#6366F1 50%,#818CF8 100%)",w="linear-gradient(135deg,#EEF2FF 0%,#F5F3FF 100%)";function f(r){return`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>ZynHive</title>
</head>
<body style="margin:0;padding:0;background-color:#0B0F1A;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
  style="background-color:#0B0F1A;padding:48px 16px 56px;">
<tr><td align="center">

  <!-- Pre-card tagline -->
  <p style="color:#4B5563;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
            margin:0 0 20px;font-family:Arial,sans-serif;">ZynHive Client Portal</p>

  <!-- Outer card -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"
    style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;
           box-shadow:0 32px 80px rgba(0,0,0,0.55),0 0 0 1px rgba(99,102,241,0.12);">

    ${r}

    <!-- FOOTER -->
    <tr>
      <td style="background:#F8F9FF;border-top:1px solid #E8ECF8;padding:28px 40px 32px;text-align:center;">
        <!-- Logo row -->
        <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:14px;">
          <tr>
            <td style="background:${g};border-radius:10px;width:32px;height:32px;
                       text-align:center;vertical-align:middle;line-height:32px;">
              <span style="color:#fff;font-size:10px;font-weight:900;font-family:Arial,sans-serif;
                           letter-spacing:-0.5px;">ZH</span>
            </td>
            <td style="padding-left:10px;vertical-align:middle;">
              <span style="color:#0F172A;font-size:15px;font-weight:800;font-family:Arial,sans-serif;
                           letter-spacing:-0.4px;">ZynHive</span>
              <span style="color:#94A3B8;font-size:11px;font-weight:500;font-family:Arial,sans-serif;
                           margin-left:6px;">· Your Digital Growth Partner</span>
            </td>
          </tr>
        </table>
        <!-- Divider dots -->
        <p style="color:#CBD5E1;font-size:10px;margin:0 0 10px;letter-spacing:0.15em;
                  font-family:Arial,sans-serif;">· · ·</p>
        <p style="color:#94A3B8;font-size:11px;margin:0 0 6px;font-family:Arial,sans-serif;">
          © 2026 ZynHive. All rights reserved.
        </p>
        <p style="color:#CBD5E1;font-size:10px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
          You received this because you have active notifications enabled on your client portal.
        </p>
      </td>
    </tr>

  </table>
  <!-- /Outer card -->

</td></tr>
</table>

</body>
</html>`}function A(r,t,e,i){const a=`
    <!-- HEADER -->
    <tr>
      <td style="background:${g};padding:0;text-align:center;position:relative;">
        <!-- Top accent bar -->
        <div style="height:4px;background:linear-gradient(90deg,#818CF8,#C7D2FE,#818CF8);"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:40px 40px 44px;text-align:center;">
              <!-- Logo pill -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.22);
                             border-radius:100px;padding:8px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.2);border-radius:6px;
                                   width:20px;height:20px;text-align:center;vertical-align:middle;line-height:20px;">
                          <span style="color:#fff;font-size:7px;font-weight:900;font-family:Arial,sans-serif;">ZH</span>
                        </td>
                        <td style="padding-left:8px;vertical-align:middle;">
                          <span style="color:#fff;font-size:13px;font-weight:800;letter-spacing:-0.2px;
                                       font-family:Arial,sans-serif;">ZynHive</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Status badge -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.18);border-radius:100px;padding:6px 16px;">
                    <span style="color:rgba(255,255,255,0.95);font-size:11px;font-weight:700;
                                 letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">
                      ● &nbsp;Project Update
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 12px;line-height:1.2;
                         letter-spacing:-0.7px;font-family:Arial,sans-serif;">
                You've Got a New Update
              </h1>
              <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;line-height:1.65;
                        font-family:Arial,sans-serif;max-width:380px;margin-left:auto;margin-right:auto;">
                Your project team posted a new update that needs your attention.
              </p>
            </td>
          </tr>
        </table>
        <!-- Wave divider -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#ffffff;height:1px;font-size:0;line-height:0;"></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 40px 36px;background:#ffffff;">

        <!-- Greeting -->
        <p style="color:#0F172A;font-size:17px;font-weight:600;margin:0 0 6px;
                  line-height:1.5;font-family:Arial,sans-serif;">
          Hello, ${r} 👋
        </p>
        <p style="color:#64748B;font-size:14px;margin:0 0 32px;line-height:1.65;font-family:Arial,sans-serif;">
          There's a new update ready for you to review on your project portal.
        </p>

        <!-- Update highlight card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
          <tr>
            <td style="background:${w};border:1.5px solid #C7D2FE;
                       border-radius:16px;padding:24px 26px;">
              <!-- Card header -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:${g};border-radius:8px;
                                   width:28px;height:28px;text-align:center;vertical-align:middle;line-height:28px;">
                          <span style="font-size:13px;line-height:28px;">📋</span>
                        </td>
                        <td style="padding-left:10px;vertical-align:middle;">
                          <span style="color:#6366F1;font-size:11px;font-weight:700;text-transform:uppercase;
                                       letter-spacing:0.08em;font-family:Arial,sans-serif;">New Update</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  ${t?`
                  <td align="right">
                    <span style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:100px;
                                 color:#4338CA;font-size:11px;font-weight:600;padding:4px 12px;
                                 font-family:Arial,sans-serif;">📁 ${t}</span>
                  </td>`:""}
                </tr>
              </table>
              <!-- Update title -->
              <p style="color:#1E1B4B;font-size:20px;font-weight:700;margin:0;
                        line-height:1.3;font-family:Arial,sans-serif;">${e}</p>
            </td>
          </tr>
        </table>

        <!-- Three feature columns -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:36px;">
          <tr>
            <!-- Track Progress -->
            <td width="32%" style="padding-right:6px;vertical-align:top;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:14px;
                             padding:16px 14px;text-align:center;">
                    <div style="background:#DCFCE7;border-radius:10px;width:40px;height:40px;
                                text-align:center;line-height:40px;font-size:18px;margin:0 auto 10px;">
                      📊
                    </div>
                    <p style="color:#166534;font-size:11px;font-weight:700;margin:0;
                              font-family:Arial,sans-serif;line-height:1.4;">Track<br/>Progress</p>
                  </td>
                </tr>
              </table>
            </td>
            <!-- Give Feedback -->
            <td width="32%" style="padding:0 3px;vertical-align:top;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#EFF6FF;border:1.5px solid #BFDBFE;border-radius:14px;
                             padding:16px 14px;text-align:center;">
                    <div style="background:#DBEAFE;border-radius:10px;width:40px;height:40px;
                                text-align:center;line-height:40px;font-size:18px;margin:0 auto 10px;">
                      💬
                    </div>
                    <p style="color:#1D4ED8;font-size:11px;font-weight:700;margin:0;
                              font-family:Arial,sans-serif;line-height:1.4;">Leave<br/>Feedback</p>
                  </td>
                </tr>
              </table>
            </td>
            <!-- Approve -->
            <td width="32%" style="padding-left:6px;vertical-align:top;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:#F5F3FF;border:1.5px solid #DDD6FE;border-radius:14px;
                             padding:16px 14px;text-align:center;">
                    <div style="background:#EDE9FE;border-radius:10px;width:40px;height:40px;
                                text-align:center;line-height:40px;font-size:18px;margin:0 auto 10px;">
                      ✅
                    </div>
                    <p style="color:#5B21B6;font-size:11px;font-weight:700;margin:0;
                              font-family:Arial,sans-serif;line-height:1.4;">Approve<br/>Deliverable</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${g};border-radius:14px;
                             box-shadow:0 8px 24px rgba(99,102,241,0.4);">
                    <a href="${i}"
                      style="display:block;color:#ffffff;text-decoration:none;
                             padding:16px 56px;font-size:15px;font-weight:800;
                             letter-spacing:-0.2px;font-family:Arial,sans-serif;
                             white-space:nowrap;">
                      Open Project Portal &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Bottom note -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top:1px solid #F1F5F9;padding-top:22px;text-align:center;">
              <p style="color:#94A3B8;font-size:12px;margin:0 0 6px;line-height:1.7;font-family:Arial,sans-serif;">
                Have questions? Reply to your project manager directly.
              </p>
              <a href="${i}" style="color:#6366F1;font-size:12px;font-weight:600;
                                            text-decoration:none;font-family:Arial,sans-serif;">
                Manage notification settings →
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  `;return f(a)}function F(r,t,e,i,a){const n="linear-gradient(135deg,#0C4A6E 0%,#0369A1 45%,#0EA5E9 100%)",l=`
    <!-- HEADER -->
    <tr>
      <td style="background:${n};padding:0;text-align:center;">
        <!-- Top accent bar -->
        <div style="height:4px;background:linear-gradient(90deg,#38BDF8,#BAE6FD,#38BDF8);"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:40px 40px 44px;text-align:center;">
              <!-- Logo pill -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.22);
                             border-radius:100px;padding:8px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.2);border-radius:6px;
                                   width:20px;height:20px;text-align:center;vertical-align:middle;line-height:20px;">
                          <span style="color:#fff;font-size:7px;font-weight:900;font-family:Arial,sans-serif;">ZH</span>
                        </td>
                        <td style="padding-left:8px;vertical-align:middle;">
                          <span style="color:#fff;font-size:13px;font-weight:800;letter-spacing:-0.2px;
                                       font-family:Arial,sans-serif;">ZynHive</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Status badge -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.18);border-radius:100px;padding:6px 16px;">
                    <span style="color:rgba(255,255,255,0.95);font-size:11px;font-weight:700;
                                 letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">
                      ● &nbsp;Team Reply
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:0 0 12px;line-height:1.2;
                         letter-spacing:-0.7px;font-family:Arial,sans-serif;">
                The Team Replied to You
              </h1>
              <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;line-height:1.65;
                        font-family:Arial,sans-serif;max-width:360px;margin-left:auto;margin-right:auto;">
                ZynHive has responded to your feedback — tap below to continue the conversation.
              </p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#ffffff;height:1px;font-size:0;line-height:0;"></td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:40px 40px 36px;background:#ffffff;">

        <!-- Greeting -->
        <p style="color:#0F172A;font-size:17px;font-weight:600;margin:0 0 6px;
                  line-height:1.5;font-family:Arial,sans-serif;">
          Hello, ${r} 👋
        </p>
        <p style="color:#64748B;font-size:14px;margin:0 0 28px;line-height:1.65;font-family:Arial,sans-serif;">
          The ZynHive team replied to your feedback${e?` on <strong style="color:#1E293B;">${e}</strong>`:""}.
        </p>

        <!-- Context breadcrumb -->
        ${e?`
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
          <tr>
            <td style="background:#F8FAFF;border:1px solid #E2E8F0;border-radius:10px;padding:12px 16px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="color:#CBD5E1;font-size:11px;font-family:Arial,sans-serif;vertical-align:middle;">
                    Regarding update &nbsp;›
                  </td>
                  <td style="padding-left:8px;vertical-align:middle;">
                    <span style="color:#334155;font-size:13px;font-weight:600;
                                 font-family:Arial,sans-serif;">${e}</span>
                  </td>
                  ${t?`
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="color:#94A3B8;font-size:11px;font-family:Arial,sans-serif;">· 📁 ${t}</span>
                  </td>`:""}
                </tr>
              </table>
            </td>
          </tr>
        </table>`:""}

        <!-- Reply bubble -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
          <tr>
            <td style="background:#F0F9FF;border:1.5px solid #BAE6FD;border-left:4px solid #0EA5E9;
                       border-radius:16px;padding:24px 26px;">
              <!-- Sender row -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
                <tr>
                  <td style="background:${n};border-radius:9px;
                             width:34px;height:34px;text-align:center;vertical-align:middle;line-height:34px;">
                    <span style="color:#fff;font-size:10px;font-weight:900;font-family:Arial,sans-serif;">ZH</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#0369A1;font-size:13px;font-weight:700;
                                 font-family:Arial,sans-serif;">ZynHive Team</span>
                    <br/>
                    <span style="color:#94A3B8;font-size:11px;font-family:Arial,sans-serif;">Project Team</span>
                  </td>
                </tr>
              </table>
              <!-- Message content -->
              <p style="color:#1E293B;font-size:14px;line-height:1.8;margin:0;
                        font-family:Arial,sans-serif;white-space:pre-line;">${i}</p>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${n};border-radius:14px;
                             box-shadow:0 8px 24px rgba(14,165,233,0.35);">
                    <a href="${a}"
                      style="display:block;color:#ffffff;text-decoration:none;
                             padding:16px 56px;font-size:15px;font-weight:800;
                             letter-spacing:-0.2px;font-family:Arial,sans-serif;
                             white-space:nowrap;">
                      View Full Conversation &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Bottom note -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top:1px solid #F1F5F9;padding-top:22px;text-align:center;">
              <p style="color:#94A3B8;font-size:12px;margin:0 0 6px;line-height:1.7;font-family:Arial,sans-serif;">
                You can reply directly from your project portal anytime.
              </p>
              <a href="${a}" style="color:#0EA5E9;font-size:12px;font-weight:600;
                                            text-decoration:none;font-family:Arial,sans-serif;">
                Open my portal →
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  `;return f(l)}function v(r,t,e,i,a,n){const l="linear-gradient(135deg,#1E1B4B 0%,#3730A3 50%,#4F46E5 100%)",o={high:{color:"#EF4444",bg:"#FEF2F2"},medium:{color:"#F59E0B",bg:"#FFFBEB"},low:{color:"#10B981",bg:"#F0FDF4"}},s=o[i]??o.medium,d=`
    <!-- HEADER -->
    <tr>
      <td style="background:${l};padding:0;text-align:center;">
        <div style="height:4px;background:linear-gradient(90deg,#818CF8,#C7D2FE,#818CF8);"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:40px 40px 44px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.22);
                             border-radius:100px;padding:8px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0"><tr>
                      <td style="background:rgba(255,255,255,0.2);border-radius:6px;width:20px;height:20px;
                                 text-align:center;vertical-align:middle;line-height:20px;">
                        <span style="color:#fff;font-size:7px;font-weight:900;font-family:Arial,sans-serif;">ZH</span>
                      </td>
                      <td style="padding-left:8px;vertical-align:middle;">
                        <span style="color:#fff;font-size:13px;font-weight:800;letter-spacing:-0.2px;
                                     font-family:Arial,sans-serif;">ZynHive</span>
                      </td>
                    </tr></table>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.18);border-radius:100px;padding:6px 16px;">
                    <span style="color:rgba(255,255,255,0.95);font-size:11px;font-weight:700;
                                 letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">
                      ● &nbsp;New Task Assigned
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;
                         letter-spacing:-0.6px;font-family:Arial,sans-serif;">
                You Have a New Task
              </h1>
              <p style="color:rgba(255,255,255,0.72);font-size:14px;margin:0;line-height:1.6;
                        font-family:Arial,sans-serif;max-width:360px;margin-left:auto;margin-right:auto;">
                A task has been assigned to you. View your portal to get started.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:36px 40px 32px;background:#ffffff;">
        <p style="color:#0F172A;font-size:17px;font-weight:600;margin:0 0 6px;
                  line-height:1.5;font-family:Arial,sans-serif;">
          Hello, ${r} 👋
        </p>
        <p style="color:#64748B;font-size:14px;margin:0 0 28px;line-height:1.65;font-family:Arial,sans-serif;">
          Your manager has assigned a new task to you. Check the details below.
        </p>

        <!-- Task card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#F8F9FF;border:1.5px solid #C7D2FE;border-radius:16px;padding:22px 24px;">
              <!-- Priority + Due row -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                <tr>
                  <td>
                    <span style="display:inline-block;background:${s.bg};border:1px solid ${s.color}40;
                                 color:${s.color};font-size:10px;font-weight:700;text-transform:uppercase;
                                 letter-spacing:0.08em;padding:3px 10px;border-radius:99px;
                                 font-family:Arial,sans-serif;">
                      ${i} priority
                    </span>
                  </td>
                  ${a?`
                  <td align="right">
                    <span style="color:#64748B;font-size:12px;font-family:Arial,sans-serif;">
                      📅 Due: <strong style="color:#1E293B;">${a}</strong>
                    </span>
                  </td>`:""}
                </tr>
              </table>
              <!-- Title -->
              <p style="color:#1E1B4B;font-size:19px;font-weight:700;margin:0 0 10px;
                        line-height:1.3;font-family:Arial,sans-serif;">${t}</p>
              <!-- Description -->
              ${e?`
              <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;
                        font-family:Arial,sans-serif;">${e}</p>`:""}
            </td>
          </tr>
        </table>

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${l};border-radius:14px;
                             box-shadow:0 8px 24px rgba(99,102,241,0.4);">
                    <a href="${n}"
                      style="display:block;color:#ffffff;text-decoration:none;
                             padding:16px 52px;font-size:15px;font-weight:800;
                             letter-spacing:-0.2px;font-family:Arial,sans-serif;white-space:nowrap;">
                      Open Task Portal &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top:1px solid #F1F5F9;padding-top:20px;text-align:center;">
              <p style="color:#94A3B8;font-size:12px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
                Log in to your portal to start the task, submit reports, and track progress.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;return f(d)}async function x(r){try{const t=await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});return t.ok?!0:(console.error("[email] /api/send-email:",t.status,await t.text()),!1)}catch(t){return console.error("[email] /api/send-email unreachable:",t),!1}}async function k(r){const{toEmail:t,toName:e,projectName:i,updateTitle:a,portalUrl:n}=r,l=`New Update on Your Project — ${a||i||"ZynHive"}`,o=A(e,i,a,n),s=`Hi ${e},

Your project "${i}" has a new update: ${a}.

View it here: ${n}

— ZynHive Team`;(await c({to:t,subject:l,body:s,html:o})).success||await x({type:"update",toEmail:t,toName:e,projectName:i,updateTitle:a,portalUrl:n})}async function z(r){const{toEmail:t,toName:e,taskTitle:i,taskDescription:a,priority:n,dueDate:l,portalUrl:o}=r,s=`New Task Assigned: ${i}`,d=v(e,i,a,n,l,o),p=`Hi ${e},

A new task has been assigned to you: "${i}"

Priority: ${n}
Due: ${l}

View your portal: ${o}

— ZynHive Team`;(await c({to:t,subject:s,body:p,html:d})).success||await x({type:"task",toEmail:t,toName:e,taskTitle:i,taskDescription:a,priority:n,dueDate:l,portalUrl:o})}async function $(r){const{toEmail:t,toName:e,projectName:i,updateTitle:a,replyMessage:n,portalUrl:l}=r,o=`ZynHive replied to your feedback${a?` on "${a}"`:""}`,s=F(e,i,a,n,l),d=`Hi ${e},

ZynHive Team replied to your feedback on "${a}":

"${n}"

View conversation: ${l}

— ZynHive Team`;(await c({to:t,subject:o,body:d,html:s})).success||await x({type:"reply",toEmail:t,toName:e,projectName:i,updateTitle:a,replyMessage:n,portalUrl:l})}function E(r,t,e,i,a,n){const l="linear-gradient(135deg,#064E3B 0%,#047857 50%,#10B981 100%)",o=`
    <!-- HEADER -->
    <tr>
      <td style="background:${l};padding:0;text-align:center;">
        <div style="height:4px;background:linear-gradient(90deg,#6EE7B7,#A7F3D0,#6EE7B7);"></div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding:40px 40px 44px;text-align:center;">
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.12);border:1.5px solid rgba(255,255,255,0.22);
                             border-radius:100px;padding:8px 20px;">
                    <table cellpadding="0" cellspacing="0" border="0"><tr>
                      <td style="background:rgba(255,255,255,0.2);border-radius:6px;width:20px;height:20px;
                                 text-align:center;vertical-align:middle;line-height:20px;">
                        <span style="color:#fff;font-size:7px;font-weight:900;font-family:Arial,sans-serif;">ZH</span>
                      </td>
                      <td style="padding-left:8px;vertical-align:middle;">
                        <span style="color:#fff;font-size:13px;font-weight:800;letter-spacing:-0.2px;
                                     font-family:Arial,sans-serif;">ZynHive</span>
                      </td>
                    </tr></table>
                  </td>
                </tr>
              </table>
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.18);border-radius:100px;padding:6px 16px;">
                    <span style="color:rgba(255,255,255,0.95);font-size:11px;font-weight:700;
                                 letter-spacing:0.08em;text-transform:uppercase;font-family:Arial,sans-serif;">
                      ✓ &nbsp;Task Completed — Review Needed
                    </span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 10px;line-height:1.2;
                         letter-spacing:-0.6px;font-family:Arial,sans-serif;">
                New Completion Report
              </h1>
              <p style="color:rgba(255,255,255,0.75);font-size:14px;margin:0;line-height:1.6;
                        font-family:Arial,sans-serif;max-width:360px;margin-left:auto;margin-right:auto;">
                A team member has completed a task and submitted a report for your review.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- BODY -->
    <tr>
      <td style="padding:36px 40px 32px;background:#ffffff;">
        <p style="color:#0F172A;font-size:17px;font-weight:600;margin:0 0 6px;
                  line-height:1.5;font-family:Arial,sans-serif;">
          Action Required 👆
        </p>
        <p style="color:#64748B;font-size:14px;margin:0 0 28px;line-height:1.65;font-family:Arial,sans-serif;">
          <strong style="color:#1E293B;">${r}</strong> has completed a task and submitted a report.
          Please review it in your admin dashboard and accept or reject it.
        </p>

        <!-- Task card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
          <tr>
            <td style="background:#F0FDF4;border:1.5px solid #BBF7D0;border-radius:14px;padding:20px 22px;">
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
                <tr>
                  <td style="background:#DCFCE7;border-radius:7px;width:28px;height:28px;
                             text-align:center;vertical-align:middle;line-height:28px;">
                    <span style="font-size:14px;">✅</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:#15803D;font-size:11px;font-weight:700;text-transform:uppercase;
                                 letter-spacing:0.08em;font-family:Arial,sans-serif;">Completed Task</span>
                  </td>
                  ${a?`
                  <td align="right">
                    <span style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:100px;
                                 color:#4338CA;font-size:11px;font-weight:600;padding:3px 10px;
                                 font-family:Arial,sans-serif;">👤 ${a}</span>
                  </td>`:""}
                </tr>
              </table>
              <p style="color:#14532D;font-size:18px;font-weight:700;margin:0 0 8px;
                        line-height:1.3;font-family:Arial,sans-serif;">${t}</p>
              ${e?`
              <p style="color:#166534;font-size:13px;line-height:1.65;margin:0;
                        font-family:Arial,sans-serif;">${e}</p>`:""}
            </td>
          </tr>
        </table>

        <!-- Report bubble -->
        ${i?`
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#F8FAFF;border:1.5px solid #C7D2FE;border-left:4px solid #6366F1;
                       border-radius:14px;padding:18px 20px;">
              <p style="color:#6366F1;font-size:10px;font-weight:700;text-transform:uppercase;
                        letter-spacing:0.1em;margin:0 0 8px;font-family:Arial,sans-serif;">
                Member's Report
              </p>
              <p style="color:#1E293B;font-size:14px;line-height:1.75;margin:0;
                        font-family:Arial,sans-serif;white-space:pre-line;">${i}</p>
            </td>
          </tr>
        </table>`:"<div style='height:28px'></div>"}

        <!-- CTA -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
          <tr>
            <td align="center">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:${l};border-radius:14px;
                             box-shadow:0 8px 24px rgba(16,185,129,0.35);">
                    <a href="${n}"
                      style="display:block;color:#ffffff;text-decoration:none;
                             padding:16px 52px;font-size:15px;font-weight:800;
                             letter-spacing:-0.2px;font-family:Arial,sans-serif;white-space:nowrap;">
                      Review in Dashboard &nbsp;→
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="border-top:1px solid #F1F5F9;padding-top:20px;text-align:center;">
              <p style="color:#94A3B8;font-size:12px;margin:0;line-height:1.7;font-family:Arial,sans-serif;">
                Accept to post it to the client portal, or reject it from your dashboard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;return f(o)}async function B(r){const{toEmail:t,memberName:e,taskTitle:i,taskDescription:a,report:n,linkedClientName:l,dashboardUrl:o}=r,s=`✅ Review Needed: ${e} completed "${i}"`,d=E(e,i,a,n,l,o),p=`${e} completed a task: "${i}"

Report:
${n}

Review it: ${o}`;(await c({to:t,subject:s,body:p,html:d})).success||await x({type:"admin-review",toEmail:t,memberName:e,taskTitle:i,taskDescription:a,report:n,linkedClientName:l,dashboardUrl:o})}export{k as a,$ as b,z as c,B as d,c as s};
