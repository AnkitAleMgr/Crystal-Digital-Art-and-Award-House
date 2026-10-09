import nodemailer from "nodemailer";

// Transactional email via Nodemailer over SMTP. This is the ONLY place the SMTP
// credentials are read, and it runs server-side only — the browser must never
// see them, which is one of the reasons sending was moved off the frontend
// entirely.
//
// Nothing in here throws. Every caller is fire-and-forget: a quote that is
// already saved in MongoDB must not turn into a failed form submission because
// the mail server had a bad minute. Failures are logged, not surfaced.

let transport;

const smtpConfig = () => ({
  host: process.env.SMTP_HOST?.trim() || "",
  port: Number(process.env.SMTP_PORT?.trim() || 587),
  user: process.env.SMTP_USER?.trim() || "",
  pass: process.env.SMTP_PASS?.trim() || "",
});

// Transport is cached once the credentials are present. Port 465 speaks
// implicit TLS; 587/25 use STARTTLS, which Nodemailer negotiates the upgrade on
// by default.
const getTransport = () => {
  const { host, port, user, pass } = smtpConfig();

  if (!host || !user || !pass) {
    return null;
  }

  transport ??= nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transport;
};

// True when the SMTP credentials are set — callers use it to skip work (reading
// a subscriber list, say) that could not possibly send anything.
export const isMailConfigured = () => {
  const { host, user, pass } = smtpConfig();
  return Boolean(host && user && pass);
};

// MAIL_FROM is the real "from", which should be an address the SMTP server is
// allowed to send as. It falls back to the SMTP user when that looks like an
// email address, so a fresh setup still sends while the admin sorts the bounce
// policy for the domain out. Empty when there is nothing usable.
export const mailFrom = () =>
  process.env.MAIL_FROM?.trim() ||
  (smtpConfig().user.includes("@")
    ? `Crystal Digital <${smtpConfig().user}>`
    : "");

// OWNER_EMAIL, or "" when unset — every caller checks for "" and logs rather
// than handing an empty recipient to the mail server.
export const ownerEmail = () => process.env.OWNER_EMAIL?.trim() || "";

// Returns { sent: true, id } or { sent: false, reason } and never throws, so
// every caller can fire-and-forget without a try/catch. `reason` is a short
// token ("not_configured", "no_recipient") or the SMTP error's message.
export const sendMail = async ({ to, subject, html, replyTo, headers }) => {
  const mailer = getTransport();

  if (!mailer) {
    console.warn(`[mailer] SMTP is not configured — "${subject}" was NOT sent`);
    return { sent: false, reason: "not_configured" };
  }

  if (!to) {
    console.warn(`[mailer] no recipient for "${subject}"`);
    return { sent: false, reason: "no_recipient" };
  }

  try {
    const info = await mailer.sendMail({
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

    console.log(`[mailer] sent "${subject}" to ${to} (${info.messageId})`);
    return { sent: true, id: info.messageId };
  } catch (error) {
    console.error(`[mailer] "${subject}" to ${to} threw:`, error);
    return { sent: false, reason: error.message };
  }
};