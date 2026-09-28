import { SettingModel } from "../admin/settings/model.js";
import { ownerEmail, sendMail } from "./mailer.js";

// The two emails this business sends, and the only two. They used to be built in
// the React app and POSTed to formsubmit.co, which meant the customer email
// addresses were shipped to a third party and never actually delivered (FormSubmit
// answers 200 with "This form needs Activation" until each recipient clicks a
// link — asking an enquirer to click an "Activate Form" link from a business
// reads as phishing, so the feature was effectively dead).
//
// Everything is escaped: these bodies carry customer-supplied name/message text
// and are rendered as HTML by the mail client.

const esc = (value) =>
  String(value ?? "")
    .trim()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// IANA reserved example domains (RFC 2606 / RFC 6761). They can never be a real
// customer mailbox, and the e2e suite submits ~15 of them per run. Without this,
// configuring a real RESEND_API_KEY would mail the owner a dozen times per test
// run and Resend would try to deliver to addresses that can never receive mail.
// This is checked against the *quote's* address, not the recipient, so it also
// silences the owner alert. Real enquiries are unaffected.
const isTestAddress = (email) => /@(example\.(com|net|org)|test|invalid)$/i.test(String(email ?? "").trim());

const dash = (value, fallback = "Not specified") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

// Real contact details come from the settings doc, so the email footer stays
// correct when the admin edits the phone number.
const business = async () => {
  try {
    const doc = await SettingModel.findOne().lean();
    return {
      name: doc?.businessName || "Crystal Digital Art & Award House",
      phone: doc?.phone || "",
      address: doc?.address || "",
      hours: doc?.workingHours || "",
    };
  } catch (error) {
    console.warn("[notifications] could not read settings for the email footer:", error.message);
    return { name: "Crystal Digital Art & Award House", phone: "", address: "", hours: "" };
  }
};

const layout = (heading, inner, business) => `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#F1F5F9;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1F2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:14px;overflow:hidden;border:1px solid #E5E7EB;">
          <tr><td style="background:linear-gradient(135deg,#2563EB,#1D4ED8);padding:22px 28px;">
            <div style="color:#FFFFFF;font-size:13px;font-weight:700;letter-spacing:2px;">CRYSTAL DIGITAL</div>
            <div style="color:#BFDBFE;font-size:11px;letter-spacing:2px;margin-top:2px;">ART &amp; AWARD HOUSE</div>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="margin:0 0 18px;font-size:20px;line-height:1.3;">${esc(heading)}</h1>
            ${inner}
          </td></tr>
          <tr><td style="background:#F8FAFC;border-top:1px solid #E5E7EB;padding:18px 28px;font-size:12px;color:#6B7280;line-height:1.6;">
            <strong style="color:#374151;">${esc(business.name)}</strong><br />
            ${business.phone ? esc(business.phone) : ""}
            ${business.address ? `<br />${esc(business.address)}` : ""}
            ${business.hours ? `<br />${esc(business.hours)}` : ""}
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

const row = (label, value) => `
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:12px;color:#6B7280;width:140px;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 0;border-bottom:1px solid #F1F5F9;font-size:14px;color:#111827;">${value}</td>
  </tr>`;

const table = (rows) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join("")}</table>`;

const block = (text) => `
  <div style="margin-top:18px;padding:14px 16px;background:#F8FAFC;border-left:3px solid #2563EB;border-radius:6px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(text)}</div>`;

/**
 * A new public quote/contact submission, to the business owner.
 * Reply-To is the customer, so hitting reply in the inbox answers them directly
 * without the owner having to copy the address across.
 */
export const notifyOwnerOfQuote = async (quote) => {
  const to = ownerEmail();

  if (isTestAddress(quote?.email)) {
    return { sent: false, reason: "test_address" };
  }

  if (!to) {
    console.warn("[notifications] OWNER_EMAIL is not set — new enquiry alert was NOT sent");
    return { sent: false, reason: "no_owner_email" };
  }

  const info = await business();

  const rows = [
    row("Name", esc(quote.name)),
    row("Email", esc(quote.email)),
    row("Phone", esc(dash(quote.phone, "Not provided"))),
    row("Product", esc(dash(quote.product, "—"))),
    row("Service", esc(dash(quote.service, "—"))),
    row("Size", esc(dash(quote.size, "—"))),
    row("Quantity", esc(dash(quote.quantity, "—"))),
    row("Engraving", esc(dash(quote.engrave, "—"))),
    row("Artwork file", esc(dash(quote.attachment, "No file attached"))),
  ];

  const html = layout(
    "New enquiry from the website",
    `${table(rows)}${quote.message ? block(quote.message) : ""}
     <p style="margin:20px 0 0;font-size:12px;color:#9CA3AF;">
       Reply to this email to answer ${esc(quote.name)} directly.
     </p>`,
    info
  );

  return sendMail({
    to,
    subject: `New enquiry — ${quote.product || quote.service || "General"}`,
    html,
    replyTo: quote.email,
  });
};

const STATUS = {
  new: {
    label: "Received",
    message: "Your request has been received and is in our queue. We will get back to you shortly.",
  },
  reviewed: {
    label: "Under review",
    message: "Our team is currently reviewing your request.",
  },
  quoted: {
    label: "Price quoted",
    message: "We have prepared a price for your request. Our team will contact you with the details.",
  },
  closed: {
    label: "Closed",
    message: "This request has been closed. Thank you for your interest — you are always welcome back.",
  },
};

/** The admin moved a quote to a new status, so the customer hears about it. */
export const notifyCustomerOfStatus = async (quote) => {
  const state = STATUS[quote.status];

  if (!state) {
    return { sent: false, reason: "unknown_status" };
  }

  if (isTestAddress(quote.email)) {
    return { sent: false, reason: "test_address" };
  }

  const info = await business();

  const rows = [
    row("Status", `<strong>${esc(state.label)}</strong>`),
    row("Request", esc(quote.product || quote.service || "General enquiry")),
    row("Size", esc(dash(quote.size, "—"))),
    row("Quantity", esc(dash(quote.quantity, "—"))),
  ];

  const html = layout(
    `Your quote request — ${state.label}`,
    `<p style="margin:0 0 6px;font-size:15px;">Dear ${esc(quote.name)},</p>
     <p style="margin:0;font-size:14px;line-height:1.6;color:#4B5563;">${esc(state.message)}</p>
     ${table(rows)}
     <p style="margin:20px 0 0;font-size:14px;color:#4B5563;">
       Reply to this email if you have any questions.
     </p>`,
    info
  );

  return sendMail({
    to: quote.email,
    subject: `Your quote request update — ${state.label}`,
    html,
    replyTo: ownerEmail() || undefined,
  });
};
