import nodemailer from "nodemailer";
import { ENV } from "./env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
});

/**
 * Send an email using the pre-configured transporter.
 * @param {{ to: string, subject: string, html: string }} options
 */
export async function sendReportEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"CodeMeet" <${ENV.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
