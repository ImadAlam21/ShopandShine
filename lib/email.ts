import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "Shop & Shine <onboarding@resend.dev>";
const OWNER = process.env.OWNER_EMAIL;

const resend = apiKey ? new Resend(apiKey) : null;

/**
 * Sends an email via Resend. No-ops (with a warning) when RESEND_API_KEY is
 * unset, so the app keeps working before email is configured.
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping:", opts.subject);
    return;
  }
  try {
    await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

/** Notify the shop owner. No-ops if OWNER_EMAIL is unset. */
export async function notifyOwner(opts: {
  subject: string;
  html: string;
}): Promise<void> {
  if (!OWNER) {
    console.warn("[email] OWNER_EMAIL not set — skipping owner notification.");
    return;
  }
  await sendEmail({ to: OWNER, ...opts });
}
