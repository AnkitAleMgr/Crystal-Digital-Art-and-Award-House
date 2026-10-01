import { Resend } from "resend";

// Transactional email via Resend (https://resend.com). This is the ONLY place
// the API key is read, and it runs server-side only — the browser must never see
// it, which is one of the reasons sending was moved off the frontend entirely.
//
// Nothing in here throws. Every caller is fire-and-forget: a quote that is
// already saved in MongoDB must not turn into a failed form submission because
// the mail provider had a bad minute. Failures are logged, not surfaced.

let client;

const getClient = () => {
  const key = process.env.RESEND_API_KEY?.trim();

  if (!key) {
    return null;
  }

  client ??= new Resend(key);
  return client;
};

export const isMailConfigured = () => Boolean(process.env.RESEND_API_KEY?.trim());

// Falls back to Resend's onboarding address, which is only allowed to send to
// the account owner's own inbox. That is enough to prove the setup works, but a
// real business should verify a domain and set MAIL_FROM to it.
export const mailFrom = () =>
  process.env.MAIL_FROM?.trim() || "Crystal Digital <onboarding@resend.dev>";

export const ownerEmail = () => process.env.OWNER_EMAIL?.trim() || "";

export const sendMail = async ({ to, subject, html, replyTo, headers }) => {
  const resend = getClient();

  if (!resend) {
    console.warn(`[mailer] RESEND_API_KEY is not set — "${subject}" was NOT sent`);
    return { sent: false, reason: "not_configured" };
  }

  if (!to) {
    console.warn(`[mailer] no recipient for "${subject}"`);
    return { sent: false, reason: "no_recipient" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: mailFrom(),
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      // Only the newsletter uses this, for the RFC 8058 List-Unsubscribe pair
      // that makes Gmail/Outlook render their own "Unsubscribe" button. Spread
      // conditionally so the single-recipient emails send no empty header.
      ...(headers && Object.keys(headers).length > 0 ? { headers } : {}),
    });

    if (error) {
      console.error(`[mailer] "${subject}" to ${to} failed:`, error);
      return { sent: false, reason: error.message };
    }

    console.log(`[mailer] sent "${subject}" to ${to} (${data?.id ?? "no id"})`);
    return { sent: true, id: data?.id };
  } catch (error) {
    console.error(`[mailer] "${subject}" to ${to} threw:`, error);
    return { sent: false, reason: error.message };
  }
};
