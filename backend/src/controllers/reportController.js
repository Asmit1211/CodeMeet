import { sendReportEmail } from "../lib/mailer.js";

/**
 * POST /api/sessions/report
 * Body: { candidateEmail, result, feedback, finalCode }
 */
export async function sendInterviewReport(req, res) {
  try {
    const { candidateEmail, result, feedback, finalCode } = req.body;

    if (!candidateEmail || !result || !feedback) {
      return res.status(400).json({ message: "candidateEmail, result, and feedback are required." });
    }

    const isPassed = result === "Pass";
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "long",
      timeStyle: "short",
    });

    // Sanitize code for safe HTML embedding
    const safeCode = finalCode
      ? finalCode.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      : "";

    const resultColor = isPassed ? "#10b981" : "#ef4444";
    const resultGlow  = isPassed ? "0 0 20px rgba(16,185,129,0.45), 0 0 40px rgba(16,185,129,0.2)" : "0 0 20px rgba(239,68,68,0.45), 0 0 40px rgba(239,68,68,0.2)";
    const resultLabel = isPassed ? "PASSED" : "FAILED";
    const resultEmoji = isPassed ? "✅" : "❌";

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0;padding:0;background-color:#020617;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

      <!-- Outer wrapper -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#020617;padding:32px 16px;">
        <tr>
          <td align="center">

            <!-- Main card -->
            <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f172a;border-radius:16px;overflow:hidden;border:1px solid #1e293b;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6);">

              <!-- ═══════════ HEADER ═══════════ -->
              <tr>
                <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);padding:40px 40px 36px;text-align:center;">
                  <!-- Logo / Brand -->
                  <table cellpadding="0" cellspacing="0" border="0" align="center">
                    <tr>
                      <td style="background:rgba(255,255,255,0.15);border-radius:12px;padding:8px 12px;">
                        <span style="font-size:20px;line-height:1;">⚡</span>
                      </td>
                      <td style="padding-left:12px;">
                        <span style="color:#ffffff;font-size:14px;font-weight:600;letter-spacing:2px;text-transform:uppercase;">CODEMEET</span>
                      </td>
                    </tr>
                  </table>
                  <h1 style="margin:20px 0 0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;line-height:1.3;">
                    Interview Report
                  </h1>
                  <p style="margin:10px 0 0;color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:0.5px;">
                    ${timestamp}
                  </p>
                </td>
              </tr>

              <!-- ═══════════ RESULT BADGE ═══════════ -->
              <tr>
                <td style="padding:36px 40px 0;" align="center">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="
                        background-color:${resultColor};
                        color:#ffffff;
                        font-size:18px;
                        font-weight:800;
                        padding:14px 48px;
                        border-radius:999px;
                        letter-spacing:2px;
                        text-transform:uppercase;
                        box-shadow:${resultGlow};
                      ">
                        ${resultEmoji}&nbsp;&nbsp;${resultLabel}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══════════ DIVIDER ═══════════ -->
              <tr>
                <td style="padding:32px 40px 0;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,#334155,transparent);"></div>
                </td>
              </tr>

              <!-- ═══════════ FEEDBACK ═══════════ -->
              <tr>
                <td style="padding:28px 40px 0;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                      <td>
                        <h2 style="margin:0 0 16px;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">
                          💬&nbsp; Interviewer Feedback
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="background-color:#1e293b;border-radius:12px;border-left:4px solid #6366f1;padding:20px 24px;">
                        <p style="margin:0;color:#e2e8f0;font-size:15px;line-height:1.75;font-style:italic;">
                          "${feedback.replace(/\n/g, "<br/>")}"
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- ═══════════ CODE BLOCK ═══════════ -->
              ${finalCode ? `
              <tr>
                <td style="padding:28px 40px 0;">
                  <h2 style="margin:0 0 16px;color:#94a3b8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:3px;">
                    🖥&nbsp; Submitted Code
                  </h2>
                  <!-- VS Code style editor -->
                  <div style="background-color:#0d1117;border-radius:12px;overflow:hidden;border:1px solid #21262d;">
                    <!-- Title bar -->
                    <div style="background-color:#161b22;padding:10px 16px;border-bottom:1px solid #21262d;">
                      <table cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ff5f57;margin-right:6px;"></span></td>
                          <td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#febc2e;margin-right:6px;"></span></td>
                          <td><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#28c840;margin-right:20px;"></span></td>
                          <td><span style="color:#8b949e;font-size:12px;font-family:'SF Mono','Fira Code','Courier New',monospace;">solution.js</span></td>
                        </tr>
                      </table>
                    </div>
                    <!-- Code content -->
                    <div style="padding:20px;overflow-x:auto;">
                      <pre style="margin:0;color:#c9d1d9;font-family:'SF Mono','Fira Code','Cascadia Code','Courier New',monospace;font-size:13px;line-height:1.7;white-space:pre-wrap;word-break:break-word;tab-size:2;">${safeCode}</pre>
                    </div>
                  </div>
                </td>
              </tr>` : ""}

              <!-- ═══════════ FOOTER ═══════════ -->
              <tr>
                <td style="padding:36px 40px 32px;">
                  <div style="height:1px;background:linear-gradient(90deg,transparent,#334155,transparent);margin-bottom:24px;"></div>
                  <p style="margin:0;color:#475569;font-size:12px;text-align:center;line-height:1.7;">
                    This is an automated report generated by
                    <strong style="color:#818cf8;">CodeMeet</strong>.<br/>
                    Please do not reply to this email.
                  </p>
                  <p style="margin:12px 0 0;text-align:center;">
                    <span style="color:#334155;font-size:11px;">© ${new Date().getFullYear()} CodeMeet · Built for excellence</span>
                  </p>
                </td>
              </tr>

            </table>
            <!-- End main card -->

          </td>
        </tr>
      </table>
    </body>
    </html>`;

    await sendReportEmail({
      to: candidateEmail,
      subject: `CodeMeet Interview Report — ${isPassed ? "Passed ✅" : "Failed ❌"}`,
      html,
    });

    res.status(200).json({ message: "Interview report sent successfully!" });
  } catch (error) {
    console.error("Error in sendInterviewReport:", error.message);
    res.status(500).json({ message: "Failed to send interview report email." });
  }
}
