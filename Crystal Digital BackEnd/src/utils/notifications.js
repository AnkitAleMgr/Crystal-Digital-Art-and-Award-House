import { SettingModel } from "../admin/settings/model.js";
import { SubscriberModel } from "../admin/subscribers/model.js";
import { isMailConfigured, ownerEmail, sendMail } from "./mailer.js";
import { siteLink } from "./siteUrl.js";
import { signSubscriberToken } from "./subscribeTokens.js";

// Every email this business sends — built here, transported by utils/mailer.js,
// sent from the server only (a browser-side sender would ship the API key and
// make the recipient caller-controlled).
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
// configuring real SMTP credentials would mail the owner a dozen times per test
// run and the mail server would try to deliver to addresses that can never
// receive. This is checked against the *quote's* address, not the recipient, so
// it also silences the owner alert. Real enquiries are unaffected.
//
// Exported because the newsletter broadcast filters on it per recipient: the
// e2e suite confirms an @example.com subscriber to "active" and then creates a
// product, and that is exactly the case that must not send.
export const isTestAddress = (email) => /@(example\.(com|net|org)|test|invalid)$/i.test(String(email ?? "").trim());

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
    // One row per customization answer rather than a single blob, because the
    // whole point of the structured fields is that the owner can read them
    // without guessing which bit answers which question.
    ...(quote.customization ?? []).map((c) => row(esc(c.label), esc(c.value || "—"))),
    row("Artwork file", esc(dash(quote.attachment, "No file attached"))),
  ];

  // The raw Cloudinary URL with no f_auto,q_auto transform: this is the file
  // the customer has to reproduce at print size, and optimising it here would
  // hide exactly the detail that matters.
  const artwork = quote.attachmentUrl
    ? `<div style="margin:20px 0 0;padding:14px 16px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;font-size:14px;">
         <strong style="color:#166534;">Artwork attached</strong><br />
         <a href="${esc(quote.attachmentUrl)}" style="color:#2563EB;word-break:break-all;">${esc(quote.attachmentUrl)}</a>
       </div>`
    : quote.attachment
      ? `<p style="margin:18px 0 0;font-size:13px;color:#B45309;">
           The customer attached <strong>${esc(quote.attachment)}</strong>, but it was not stored — ask them to email it to you.
         </p>`
      : "";

  const html = layout(
    "New enquiry from the website",
    `${table(rows)}${artwork}${quote.message ? block(quote.message) : ""}
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

// ── Newsletter ────────────────────────────────────────────────────────────────
// Three things share the machinery below, and all three are about the same
// promise: a subscriber can always stop the mail. The unsubscribe link is not a
// nicety bolted on, it is the reason the list is allowed to exist.

const UNSUBSCRIBE_PLACEHOLDER = "%%UNSUBSCRIBE_URL%%";

const button = (href, text) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 0;">
    <tr><td style="border-radius:8px;background:linear-gradient(135deg,#2563EB,#1D4ED8);">
      <a href="${esc(href)}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;border-radius:8px;">
        ${esc(text)}
      </a>
    </td></tr>
  </table>`;

// `href` is built from SITE_URL plus a signed token, so it holds no
// visitor-supplied text — but it is escaped anyway, because it lands in an
// attribute and esc() turns & into &amp;, which is what an href wants.
const unsubscribeNote = (url) => `
  <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #E5E7EB;font-size:12px;color:#6B7280;line-height:1.7;">
    You are receiving this because you subscribed to product updates.<br />
    <a href="${esc(url)}" style="color:#2563EB;">Unsubscribe</a> if you would rather not hear from us.
  </p>`;

/**
 * Double opt-in step one: the visitor left an address in the footer, and this is
 * the mail that turns that address into a real subscriber. Nothing is broadcast
 * to a `pending` row, so if this is never opened the list stays clean.
 */
export const notifySubscriberOfConfirmation = async (subscriber) => {
  if (isTestAddress(subscriber?.email)) {
    return { sent: false, reason: "test_address" };
  }

  // Without a token there is no way to confirm, so mailing a dead-end link would
  // only teach people that our mail does not work.
  const token = signSubscriberToken(subscriber.email, "confirm");

  if (!token) {
    return { sent: false, reason: "no_token_secret" };
  }

  const info = await business();
  const href = siteLink(`/subscribe/confirm?token=${encodeURIComponent(token)}`);

  const html = layout(
    "One click and you're subscribed",
    `<p style="margin:0 0 6px;font-size:15px;">Please confirm your subscription to product updates from ${esc(info.name)}.</p>
     <p style="margin:0;font-size:14px;line-height:1.6;color:#4B5563;">
       We only email when something new is added to the site. Nothing else, ever.
     </p>
     ${button(href, "Confirm my subscription")}
     <p style="margin:18px 0 0;font-size:12px;color:#9CA3AF;">
       If you did not request this, ignore this email — the address will not be
       added to any list.
     </p>`,
    info
  );

  return sendMail({
    to: subscriber.email,
    subject: "Confirm your subscription",
    html,
    replyTo: ownerEmail() || undefined,
  });
};

/**
 * A new product was published, so every confirmed subscriber hears about it.
 *
 * Fire-and-forget from createProduct: the product is already saved, so a mail
 * outage must not fail the admin's save. Nothing here throws.
 *
 * The body is identical for every recipient except the unsubscribe URL, so it is
 * built once with a placeholder and substituted per send rather than re-templated
 * per address.
 */
export const notifySubscribersOfProduct = async (product) => {
  // Checked before the database read: with no key configured this is the common
  // case during setup and there is no point querying for a list we cannot mail.
  if (!isMailConfigured()) {
    return { sent: 0, total: 0, skipped: "not_configured" };
  }

  // A product with no slug has no /products/:slug page, so the link below would
  // 404. getPublicProducts filters those out of the site for the same reason.
  if (!product?.slug) {
    return { sent: 0, total: 0, skipped: "no_slug" };
  }

  let candidates;

  try {
    candidates = await SubscriberModel.find({ status: "active" })
      .select("email")
      .lean();
  } catch (error) {
    console.warn("[notifications] could not read subscribers:", error.message);
    return { sent: 0, total: 0, skipped: "read_failed" };
  }

  const targets = candidates.filter((row) => row.email && !isTestAddress(row.email));

  if (targets.length === 0) {
    return { sent: 0, total: 0, skipped: "no_active_subscribers" };
  }

  const info = await business();
  const productUrl = siteLink(`/products/${encodeURIComponent(product.slug)}`);

  // The raw upload URL with no f_auto,q_auto transform: email clients do not
  // send Accept: image/webp, and some still cannot render a WebP at all. The
  // admin previews make the same trade.
  const image = product.imgUrl
    ? `<img src="${esc(product.imgUrl)}" alt="${esc(product.name)}" width="520" style="width:100%;max-width:520px;border-radius:10px;display:block;border:1px solid #E5E7EB;" />`
    : "";

  const template = layout(
    `New: ${product.name}`,
    `${image}
     <p style="margin:18px 0 0;font-size:15px;line-height:1.6;">${esc(dash(product.desc, "We have just added a new product to our range."))}</p>
     ${product.cat ? `<p style="margin:10px 0 0;font-size:12px;color:#6B7280;">Category: ${esc(product.cat)}</p>` : ""}
     ${button(productUrl, "View this product")}
     ${product.fullDesc ? block(product.fullDesc) : ""}
     ${unsubscribeNote(UNSUBSCRIBE_PLACEHOLDER)}`,
    info
  );

  let sent = 0;
  let skippedNoToken = 0;

  // Sequential on purpose — an SMTP mail server is happiest with one send in
  // flight per connection, and this runs after the admin's save has already
  // been answered, so there is nothing to gain from racing. A list in the
  // thousands wants a provider batch API instead.
  for (const row of targets) {
    const token = signSubscriberToken(row.email, "unsubscribe");

    // Never send a recipient a message they cannot opt out of.
    if (!token) {
      skippedNoToken += 1;
      continue;
    }

    const url = siteLink(`/unsubscribe?token=${encodeURIComponent(token)}`);

    const result = await sendMail({
      to: row.email,
      subject: `New on the site — ${product.name}`,
      html: template.split(UNSUBSCRIBE_PLACEHOLDER).join(url),
      // RFC 8058: this is what puts a native "Unsubscribe" link next to the
      // sender in Gmail and Outlook, so they never have to find ours.
      headers: {
        "List-Unsubscribe": `<${url}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (result.sent) {
      sent += 1;
    }
  }

  console.log(
    `[notifications] broadcast "${product.name}": ${sent}/${targets.length} sent${
      skippedNoToken ? `, ${skippedNoToken} skipped (no token secret)` : ""
    }`
  );

  return { sent, total: targets.length, skippedNoToken };
};
