// `npm run e2e` — live contract checks against a server already running on
// :3000. It writes real rows (and one real Cloudinary upload) but sweeps its
// own fixtures first, so it stays repeatable; assertions below are numbered.

import "dotenv/config";
import crypto from "crypto";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const API = "http://localhost:3000";

const call = async (path, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      ...opts.headers,
    },
  });
  // Express's own 404 is an HTML page, so a missing route must not blow up the
  // harness — that 404 is itself something these checks assert on.
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = { status: false, message: text.slice(0, 200) };
  }
  return { code: res.status, body };
};

// call() always sends JSON, which cannot carry a file. This is the same request
// with a real multipart body — note the absence of Content-Type, because the
// runtime has to supply the multipart boundary itself.
const callForm = async (path, form, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    ...opts,
    headers: { ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}), ...(opts.headers ?? {}) },
    body: form,
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = { status: false, message: text.slice(0, 200) };
  }
  return { code: res.status, body };
};

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });
const admin = await mongoose.connection.db.collection("admins").findOne({});
if (!admin) throw new Error("no admin exists — cannot run e2e");
const token = jwt.sign(
  { id: admin._id.toString(), email: admin.email, role: admin.role ?? "admin" },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: "15m" }
);
console.log("using admin:", admin.email, admin._id.toString());

// No slug: the admin form does not ask for one any more, the server derives it
// from the name (checked in step 2).
const product = {
  name: "E2E Test Widget",
  desc: "created by the e2e check",
  cat: "Crystal",
  features: ["feature a"],
  specs: [{ label: "Material", value: "glass" }],
  customizationFields: [
    { label: "Recipient name", required: true, maxLength: 80 },
    { label: "Engraving note", required: false, maxLength: 120 },
  ],
  tags: ["new"],
  sizes: ["S", "L"],
};

// A product the admin left without customization fields, which is a valid state
// and must not demand anything on the quote form.
const plainProduct = {
  name: "E2E Plain Widget",
  desc: "no customization fields, no sizes",
  customizationFields: [],
  sizes: [],
};

const SLUG = "e2e-test-widget";

const pass = [];
const fail = [];
const check = (label, cond, extra = "") =>
  (cond ? pass : fail).push(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);

// The multipart body builder, defined up here because check 8b posts a
// multipart quote too — that is the shape the real quote modal actually sends.
const artworkForm = (fields, file) => {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  if (file) form.append("artwork", new Blob([file.bytes], { type: file.type }), file.name);
  return form;
};

// 0. A crashed run leaks whatever it had created so far, which would then fail
//    the count- and slug-based checks below on the next run. Every row this suite
//    makes uses an @example.com address or a name beginning with "E2E ", so
//    sweeping those makes the suite idempotent.
//
//    This has to run before check 1, not alongside the quote sweep: the product
//    slug is now derived from the name, so one leftover product shifts every
//    suffix the slug checks expect.
{
  const staleQuotes = (await call("/admin/quotes", { token })).body.data.filter((q) => q.email?.endsWith("@example.com"));
  for (const q of staleQuotes) await call(`/admin/quotes/${q.id}`, { method: "DELETE", token });
  if (staleQuotes.length) console.log(`swept ${staleQuotes.length} leftover quote(s) from a previous run`);

  const strays = (await call("/admin/products", { token })).body.data.filter((p) => p.name.startsWith("E2E "));
  for (const p of strays) await call(`/admin/products/${p.id}`, { method: "DELETE", token });
  if (strays.length) console.log(`swept ${strays.length} leftover product(s) from a previous run`);

  // The password-reset section creates a throwaway staff account; a crashed run
  // leaves it behind, so sweep it here like every other fixture.
  const resetAccounts = (await call("/admin/users", { token })).body.data.filter((u) => u.email?.startsWith("e2e-reset-"));
  for (const u of resetAccounts) await call(`/admin/users/${u.id}`, { method: "DELETE", token });
  if (resetAccounts.length) console.log(`swept ${resetAccounts.length} leftover e2e reset account(s) from a previous run`);
}

// 1. A slug sent by the caller is ignored — it is server-owned now, so a crafted
//    POST cannot pin a product to somebody else's URL.
{
  const { code, body } = await call("/admin/products", {
    method: "POST", token, body: JSON.stringify({ ...product, slug: "attacker-chosen" }),
  });
  check("POST /admin/products ignores a posted slug", code === 201 && body.data?.slug === SLUG, `code=${code} slug=${body.data?.slug}`);
  if (body.data) product.id = body.data.id;
}

// 2. A second product with the same name must get a distinct slug rather than a
//    500 on the unique index.
let plainId = null;
{
  const { code, body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify({ ...product, name: "E2E Test Widget" }) });
  check("a duplicate product name does not collide on the slug", code === 201 && body.data?.slug === `${SLUG}-2`, `code=${code} slug=${body.data?.slug}`);
  await call(`/admin/products/${body.data?.id}`, { method: "DELETE", token });
}

// 2b. A product with no customization fields and no sizes is legal.
{
  const { code, body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify(plainProduct) });
  plainId = body.data?.id ?? null;
  check("a product with no customization fields is accepted", code === 201 && body.data?.customizationFields?.length === 0, `code=${code}`);
}

// 3. It must show up on the public site, addressed by its slug.
{
  const { code, body } = await call("/api/products");
  const found = body.data?.find((p) => p.id === SLUG);
  check("new product appears in GET /api/products", code === 200 && Boolean(found), `count=${body.data?.length}`);
  check("public response omits imgPublicId", found && !("imgPublicId" in found));
  check("public response carries sizes", found && Array.isArray(found.sizes) && found.sizes.length === 2);
  check("public response carries customizationFields with the required flag", found?.customizationFields?.[0]?.label === "Recipient name" && found?.customizationFields?.[0]?.required === true, JSON.stringify(found?.customizationFields));
  check("public response has no leftover customizable list", found && !("customizable" in found));
  check("customization fields carry no subdocument _id", found && !JSON.stringify(found.customizationFields).includes("_id"), JSON.stringify(found?.customizationFields));
}

// 4. A partial update must not wipe the other fields.
{
  const { body } = await call("/api/products");
  const before = body.data.find((p) => p.id === SLUG);
  const { code, body: upd } = await call(`/admin/products/${product.id}`, {
    method: "PUT", token, body: JSON.stringify({ name: "E2E Test Widget Renamed" }),
  });
  const { body: after } = await call("/api/products");
  const now = after.data.find((p) => p.id === SLUG);
  check("PUT partial update keeps the slug even when the name changed", code === 200 && now?.id === SLUG, `code=${code}`);
  check("PUT partial update keeps desc", now?.desc === before.desc);
  check("PUT partial update applied the name", now?.name === "E2E Test Widget Renamed");
}

// 4b. A PUT carrying a slug must not be able to move the public URL.
{
  const { code } = await call(`/admin/products/${product.id}`, {
    method: "PUT", token, body: JSON.stringify({ slug: "hijacked-url" }),
  });
  const { body } = await call("/api/products");
  check("PUT cannot rewrite the slug", code === 200 && body.data.some((p) => p.id === SLUG) && !body.data.some((p) => p.id === "hijacked-url"), `code=${code}`);
  await call(`/admin/products/${product.id}`, { method: "PUT", token, body: JSON.stringify({ name: "E2E Test Widget" }) });
}

// 4c. The admin can rewrite the customization fields.
{
  const { code } = await call(`/admin/products/${product.id}`, {
    method: "PUT", token, body: JSON.stringify({ customizationFields: [{ label: "Colour", required: true, maxLength: 40 }] }),
  });
  const { body } = await call("/api/products");
  const now = body.data.find((p) => p.id === SLUG);
  check("PUT replaces the customization fields", code === 200 && now?.customizationFields?.length === 1 && now?.customizationFields[0].label === "Colour", `code=${code}`);
  await call(`/admin/products/${product.id}`, { method: "PUT", token, body: JSON.stringify({ customizationFields: product.customizationFields }) });
}

// 5. Clean up, and confirm it disappears from the public list.
{
  const { code } = await call(`/admin/products/${product.id}`, { method: "DELETE", token });
  const { body } = await call("/api/products");
  check("DELETE removes the product", code === 200, `code=${code}`);
  check("deleted product is gone from the public API", !body.data.some((p) => p.id === SLUG));
  check("DELETE returns no data key", !("data" in (await call(`/admin/products/${product.id}`, { method: "DELETE", token })).body));
}

// 5b. The zero-customization product is cleaned up too.
{
  const { code } = await call(`/admin/products/${plainId}`, { method: "DELETE", token });
  check("DELETE removes the plain product", code === 200, `code=${code}`);
}

// 6. The legacy slugless row (created before slugs were server-owned) must stay
//    hidden from the public site but survive for the admin.
{
  const { body: adminList } = await call("/admin/products", { token });
  const strays = adminList.data.filter((p) => !p.slug);
  const { body: pubList } = await call("/api/products");
  check("admin still sees the pre-slug test product", strays.length === 1, `found ${strays.length}: ${strays.map((s) => s.name).join(", ")}`);
  check("public API hides it", !pubList.data.some((p) => p.id === strays[0]?.id));
}

// ── public quote submission ───────────────────────────────────────────────────
// Every request below carries a synthetic X-Forwarded-For. The quote rate limiter
// buckets on that header, so each run gets a clean bucket — otherwise repeated
// runs inside the 1h window would start failing on 429 and the suite would stop
// being repeatable. The limiter itself is exercised in check 14.
const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
const asIp = (extra = {}) => ({ ...extra, headers: { "X-Forwarded-For": ip, ...extra.headers } });
const quoteCount = async () => (await call("/admin/quotes", { token })).body.data.length;

// 7. The happy path, with every field the two public forms actually collect.
let quoteId = null;
{
  const before = await quoteCount();
  const { code, body } = await call("/api/quotes", asIp({
    method: "POST",
    body: JSON.stringify({
      name: "E2E Customer",
      email: "e2e-customer@example.com",
      phone: "9800000000",
      // Deliberately NOT product-scoped: the fixture product was deleted in check
      // 5, and a slug naming a product that no longer exists is a 400 by design.
      // The product-scoped path (size, required fields) is check 8b.
      product: "E2E Test Widget",
      size: "L",
      service: "Crystal Awards",
      quantity: "25",
      attachment: "e2e-logo.png",
      message: "Please quote 25 units.",
    }),
  }));
  quoteId = body.data?.id ?? null;
  check("POST /api/quotes accepts a valid submission", code === 201 && Boolean(quoteId), `code=${code} ${body.message ?? ""}`);
  check("POST /api/quotes does not echo the stored document", body.data && !("email" in body.data));

  const row = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === quoteId);
  check("quote row is visible to the admin", Boolean(row));
  check("status is server-owned and starts as new", row?.status === "new", `status=${row?.status}`);
  check("all form fields persisted", row?.service === "Crystal Awards" && row?.quantity === "25" && row?.attachment === "e2e-logo.png" && row?.product === "E2E Test Widget" && row?.size === "L" && row?.message === "Please quote 25 units.");
  check("a quote with no productSlug stores no customization", row?.customization?.length === 0 && row?.productSlug === "", JSON.stringify(row?.customization));
  check("quote has a server-set createdAt", Boolean(row?.createdAt) && new Date(row.createdAt).getTime() <= Date.now() + 5000, `createdAt=${row?.createdAt}`);
}

// 8. Validation must reject, and name the offending field.
{
  const { code, body } = await call("/api/quotes", asIp({ method: "POST", body: JSON.stringify({ name: "No Email" }) }));
  check("POST /api/quotes rejects a missing email", code === 400 && Boolean(body.errors?.email), `code=${code}`);
  const bad = await call("/api/quotes", asIp({ method: "POST", body: JSON.stringify({ name: "Bad", email: "not-an-email" }) }));
  check("POST /api/quotes rejects a malformed email", bad.code === 400 && Boolean(bad.body.errors?.email), `code=${bad.code}`);
}

// 8b. The product-scoped rules must be enforced by the server, not just by the
//     browser. The test product was deleted in check 5, so it is recreated here
//     purely to hang the rules off.
let rulesSlug = null;
{
  const { body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify(product) });
  rulesSlug = body.data?.slug ?? null;
  check("fixture product for the quote rules exists", Boolean(rulesSlug), `slug=${rulesSlug}`);

  // A different IP from the rest of the suite: these checks spend ten POSTs on
  // their own, which is the whole of the 10/hour quote budget, and the limiter
  // buckets per IP.
  const rulesIp = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
  const base = { name: "Rules", email: "rules@example.com", productSlug: rulesSlug };
  const post = (extra) => call("/api/quotes", { ...asIp({ method: "POST", body: JSON.stringify({ ...base, ...extra }) }), headers: { "X-Forwarded-For": rulesIp } });

  const noSize = await post({ customization: [{ label: "Recipient name", value: "A" }] });
  check("a product with sizes rejects a quote with no size", noSize.code === 400 && Boolean(noSize.body.errors?.size), `code=${noSize.code} errors=${JSON.stringify(noSize.body.errors)}`);

  const fakeSize = await post({ size: "Enormous", customization: [{ label: "Recipient name", value: "A" }] });
  check("an invented size is rejected, not stored", fakeSize.code === 400 && Boolean(fakeSize.body.errors?.size), `code=${fakeSize.code}`);

  const noRequired = await post({ size: "L" });
  check("a missing required customization field is rejected", noRequired.code === 400 && Boolean(noRequired.body.errors?.["customization.Recipient name"]), `code=${noRequired.code} errors=${JSON.stringify(noRequired.body.errors)}`);

  const blankRequired = await post({ size: "L", customization: [{ label: "Recipient name", value: "   " }] });
  check("a whitespace-only answer counts as missing", blankRequired.code === 400 && Boolean(blankRequired.body.errors?.["customization.Recipient name"]), `code=${blankRequired.code}`);

  // A spoofed label list must not be able to SATISFY a required field. The server
  // reads the product's own definition rather than the posted labels, so the 400 is
  // keyed on the field the product really requires and the invented label is never
  // stored. Asserting the error KEY is what makes this test honest: a bare `400`
  // would also pass if the only reason for the refusal were the invented label.
  const spoofed = await post({ size: "L", customization: [{ label: "Admin never asked for this", value: "x" }] });
  check("a spoofed label list cannot satisfy a required field", spoofed.code === 400 && Boolean(spoofed.body.errors?.["customization.Recipient name"]), `code=${spoofed.code} errors=${JSON.stringify(spoofed.body.errors)}`);

  const optionalOk = await post({ size: "L", customization: [{ label: "Recipient name", value: "Asha" }] });
  check("an omitted optional field is fine", optionalOk.code === 201, `code=${optionalOk.code} ${optionalOk.body.message ?? ""}`);

  const stored = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === optionalOk.body.data?.id);
  check("an omitted optional field is stored as empty, not invented", stored?.customization?.length === 2 && stored?.customization?.[1]?.value === "", JSON.stringify(stored?.customization));
  await call(`/admin/quotes/${stored.id}`, { method: "DELETE", token });

  // An over-long answer is truncated rather than rejected — a nuisance, not an attack.
  const long = await post({ size: "L", customization: [{ label: "Recipient name", value: "x".repeat(400) }] });
  const longRow = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === long.body.data?.id);
  check("an answer over the field's maxLength is truncated, not refused", long.code === 201 && longRow?.customization?.[0]?.value?.length === 80, `code=${long.code} len=${longRow?.customization?.[0]?.value?.length}`);
  await call(`/admin/quotes/${longRow.id}`, { method: "DELETE", token });

  // A field the admin deleted between page load and submit is dropped silently:
  // that is the admin's edit, not the customer's mistake.
  const stale = await post({ size: "L", customization: [{ label: "Recipient name", value: "Bikram" }, { label: "Removed since", value: "old" }] });
  const staleRow = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === stale.body.data?.id);
  check("an answer to a since-deleted field is dropped, not stored", stale.code === 201 && !JSON.stringify(staleRow?.customization).includes("Removed since"), `code=${stale.code} ${JSON.stringify(staleRow?.customization)}`);
  await call(`/admin/quotes/${staleRow.id}`, { method: "DELETE", token });

  const unknownProduct = await post({ productSlug: "no-such-product-xyz" });
  check("a quote for a product that no longer exists is rejected", unknownProduct.code === 400 && Boolean(unknownProduct.body.errors?.product), `code=${unknownProduct.code}`);

  // The general contact form posts no slug, so it must be entirely unaffected.
  const general = await call("/api/quotes", { ...asIp({ method: "POST", body: JSON.stringify({ name: "General", email: "general@example.com", message: "Just a question." }) }), headers: { "X-Forwarded-For": rulesIp } });
  check("a general enquiry with no productSlug is unaffected", general.code === 201, `code=${general.code} ${general.body.message ?? ""}`);
  const generalRow = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === general.body.data?.id);
  check("a general enquiry stores no customization and no size requirement", generalRow?.customization?.length === 0 && generalRow?.size === "");
  await call(`/admin/quotes/${generalRow.id}`, { method: "DELETE", token });

  // The real form is multipart, so the answers arrive as one JSON string rather
  // than a JSON array. Reading only the array shape silently loses every answer
  // and then reports it as a missing required field, which is exactly the bug
  // this check exists to prevent.
  const multipart = await callForm(
    "/api/quotes",
    artworkForm({
      name: "Multipart",
      email: "multipart@example.com",
      productSlug: rulesSlug,
      size: "S",
      customization: JSON.stringify([
        { label: "Recipient name", value: "Sita" },
        { label: "Engraving note", value: "Best teacher" },
      ]),
    }),
    // A third IP: the rules bucket above is already spent by check 8b's ten
    // POSTs, which is the whole per-hour quote budget.
    { headers: { "X-Forwarded-For": `198.51.100.${200 + Math.floor(Math.random() * 40)}` } }
  );
  const mpRow = (await call("/admin/quotes", { token })).body.data.find((q) => q.email === "multipart@example.com");
  check("a multipart quote keeps its customization answers", multipart.code === 201 && mpRow?.customization?.length === 2 && mpRow?.customization?.[0]?.value === "Sita", `code=${multipart.code} ${multipart.body.message ?? ""} ${JSON.stringify(mpRow?.customization)}`);
  if (mpRow) await call(`/admin/quotes/${mpRow.id}`, { method: "DELETE", token });
}

// 9. A client must not be able to set status or backdate its own quote.
{
  const { code } = await call("/api/quotes", asIp({
    method: "POST",
    body: JSON.stringify({ name: "Injector", email: "injector@example.com", status: "closed", createdAt: "1990-01-01T00:00:00.000Z" }),
  }));
  const row = (await call("/admin/quotes", { token })).body.data.find((q) => q.email === "injector@example.com");
  check("injected status is ignored", code === 201 && row?.status === "new", `status=${row?.status}`);
  check("injected createdAt is ignored", row && new Date(row.createdAt).getFullYear() > 2000, `createdAt=${row?.createdAt}`);
  await call(`/admin/quotes/${row.id}`, { method: "DELETE", token });
}

// 10. The honeypot must be swallowed silently, not stored and not errored.
{
  const before = await quoteCount();
  const { code } = await call("/api/quotes", asIp({
    method: "POST",
    body: JSON.stringify({ name: "Spam Bot", email: "bot@example.com", website: "http://spam.example" }),
  }));
  const after = await quoteCount();
  check("honeypot submission returns 201 so the bot learns nothing", code === 201, `code=${code}`);
  check("honeypot submission is not stored", after === before, `${before} -> ${after}`);
}

// 11. Quotes stay private — the public side must never expose them.
{
  const { code } = await call("/api/quotes");
  check("GET /api/quotes stays 404 (no public read)", code === 404, `code=${code}`);
}

// 12. Status changes and deletion still work through the admin CRUD.
{
  const upd = await call(`/admin/quotes/${quoteId}`, { method: "PUT", token, body: JSON.stringify({ status: "quoted" }) });
  check("PUT /admin/quotes changes status", upd.code === 200 && upd.body.data?.status === "quoted", `code=${upd.code}`);
  check("partial update kept the customer fields", upd.body.data?.name === "E2E Customer" && upd.body.data?.quantity === "25");
  const del = await call(`/admin/quotes/${quoteId}`, { method: "DELETE", token });
  check("DELETE /admin/quotes removes the quote", del.code === 200, `code=${del.code}`);
  check("deleted quote is gone from the admin list", !(await call("/admin/quotes", { token })).body.data.some((q) => q.id === quoteId));
}

// 13. A mail outage must never cost a customer their quote. The send is
//     skipped for reserved example domains (see isTestAddress in
//     notifications.js), so this stays a no-op whether or not SMTP is
//     configured — the row must still save and the API must still answer 201.
{
  const saved = await call("/api/quotes", asIp({
    method: "POST",
    body: JSON.stringify({ name: "No Mail", email: "nomail@example.com", message: "still want this saved" }),
  }));
  const row = (await call("/admin/quotes", { token })).body.data.find((q) => q.email === "nomail@example.com");
  check("quote saves even when email is suppressed", saved.code === 201 && Boolean(row), `code=${saved.code}`);

  const moved = await call(`/admin/quotes/${row.id}`, { method: "PUT", token, body: JSON.stringify({ status: "reviewed" }) });
  check("status change still works when email is suppressed", moved.code === 200 && moved.body.data?.status === "reviewed", `code=${moved.code}`);

  const same = await call(`/admin/quotes/${row.id}`, { method: "PUT", token, body: JSON.stringify({ status: "reviewed" }) });
  check("re-saving the same status is still 200", same.code === 200 && same.body.data?.status === "reviewed", `code=${same.code}`);

  await call(`/admin/quotes/${row.id}`, { method: "DELETE", token });
}

// 14. The rate limiter must actually bite on a single flood source.
{
  const floodIp = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
  const post = () => call("/api/quotes", {
    method: "POST",
    headers: { "X-Forwarded-For": floodIp },
    body: JSON.stringify({ name: "Flood", email: "flood@example.com", message: "x" }),
  });
  const codes = [];
  for (let i = 0; i < 12; i += 1) codes.push((await post()).code);
  check("quote endpoint is rate limited per IP", codes.includes(429), `codes=${codes.join(",")}`);
  check("rate limit allows a normal burst first", codes.slice(0, 10).every((c) => c === 201), `codes=${codes.join(",")}`);
  for (const q of (await call("/admin/quotes", { token })).body.data.filter((x) => x.email === "flood@example.com")) {
    await call(`/admin/quotes/${q.id}`, { method: "DELETE", token });
  }
}

// ── categories ────────────────────────────────────────────────────────────────
// Products and gallery items reference a category by NAME, so these checks cover
// the three things that can silently orphan them: a rename that doesn't follow
// through, a delete that doesn't strip, and a `cat` the schema still demands.
const CAT = "E2E Test Category";
const CAT_NAME = "E2E Category Widget";
// The slug is derived from the name by the server now, so the checks below must
// derive it the same way rather than pinning it in a POST body.
const CAT_SLUG = CAT_NAME.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
let catId = null;
let widgetId = null;

// 15. Sweep leftovers from a crashed run, so the create check is repeatable.
{
  const list = (await call("/admin/categories", { token })).body.data ?? [];
  for (const c of list.filter((x) => x.name === CAT)) {
    await call(`/admin/categories/${c.id}`, { method: "DELETE", token });
  }
  const products = (await call("/admin/products", { token })).body.data;
  for (const p of products.filter((x) => x.slug === CAT_SLUG)) {
    await call(`/admin/products/${p.id}`, { method: "DELETE", token });
  }
}

// 16. The public list is unauthenticated; the admin CRUD is not.
{
  const pub = await call("/api/categories");
  check("GET /api/categories is public", pub.code === 200 && Array.isArray(pub.body.data), `code=${pub.code}`);
  check("public category shape is id/name/order", pub.body.data.every((c) => c.id && typeof c.name === "string" && typeof c.order === "number"), JSON.stringify(pub.body.data[0] ?? null));
  check("GET /admin/categories requires a token", (await call("/admin/categories")).code === 401);
}

// 17. Creating a category appends it to the end of the pill order.
{
  const before = (await call("/api/categories")).body.data;
  const { code, body } = await call("/admin/categories", { method: "POST", token, body: JSON.stringify({ name: CAT }) });
  const after = (await call("/api/categories")).body.data;
  check("POST /admin/categories creates one", code === 201 && body.data?.name === CAT, `code=${code} ${body.message ?? ""}`);
  check("new category is appended last", after[after.length - 1]?.name === CAT, `last=${after[after.length - 1]?.name}`);
  check("existing categories kept their order", before.every((c, i) => after[i]?.id === c.id));
  catId = body.data?.id ?? null;
}

// 18. Duplicates are rejected case-insensitively, with a field-level message.
{
  const same = await call("/admin/categories", { method: "POST", token, body: JSON.stringify({ name: CAT }) });
  check("duplicate category name is rejected", same.code === 400 && Boolean(same.body.errors?.name), `code=${same.code}`);
  const lower = await call("/admin/categories", { method: "POST", token, body: JSON.stringify({ name: CAT.toLowerCase() }) });
  check("duplicate detection ignores case", lower.code === 400, `code=${lower.code}`);
  const blank = await call("/admin/categories", { method: "POST", token, body: JSON.stringify({ name: "   " }) });
  check("blank category name is rejected", blank.code === 400 && Boolean(blank.body.errors?.name), `code=${blank.code}`);
  check("duplicate attempts did not create a second row", (await call("/api/categories")).body.data.filter((c) => c.name === CAT).length === 1);
}

// 19. A rename must follow through to the products and gallery items using it.
{
  const { code } = await call(`/admin/categories/${catId}`, { method: "PUT", token, body: JSON.stringify({ name: `${CAT} Renamed` }) });
  const doc = (await call("/api/categories")).body.data.find((c) => c.name === `${CAT} Renamed`);
  check("PUT /admin/categories renames", code === 200 && Boolean(doc), `code=${code}`);

  const made = await call("/admin/products", { method: "POST", token, body: JSON.stringify({ name: CAT_NAME, desc: "created by the e2e check", cat: `${CAT} Renamed` }) });
  check("a product can be filed under a new category", made.code === 201, `code=${made.code} ${made.body.message ?? ""}`);
  widgetId = made.body.data?.id ?? null;

  const renamed = await call(`/admin/categories/${catId}`, { method: "PUT", token, body: JSON.stringify({ name: CAT }) });
  const product = (await call("/admin/products", { token })).body.data.find((p) => p.slug === CAT_SLUG);
  check("rename followed through to the product's cat", renamed.code === 200 && product?.cat === CAT, `cat=${product?.cat}`);
  check("renamed category is back in the public list", (await call("/api/categories")).body.data.some((c) => c.id === catId && c.name === CAT));
}

// 20. Deleting a category strips it from the products using it — it must not
//     delete them, and the product must survive without a category at all.
{
  const { code, body } = await call(`/admin/categories/${catId}`, { method: "DELETE", token });
  check("DELETE /admin/categories removes it", code === 200, `code=${code}`);
  check("DELETE returns no data key", !("data" in body));
  check("category is gone from the public list", !(await call("/api/categories")).body.data.some((c) => c.id === catId));

  const product = (await call("/admin/products", { token })).body.data.find((p) => p.slug === CAT_SLUG);
  check("the product survived its category", Boolean(product), "product was deleted");
  check("the product's cat was cleared, not dropped", product?.cat === "", `cat=${JSON.stringify(product?.cat)}`);
  check("the product is still published (has a slug)", (await call("/api/products")).body.data.some((p) => p.id === CAT_SLUG));
}

// 21. `cat` is optional now, so an uncategorized product is a first-class thing
//     rather than a validation error.
{
  const { code, body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify({ name: "E2E No Category", desc: "created by the e2e check" }) });
  check("a product can be created with no category", code === 201 && body.data?.cat === "", `code=${code} ${body.message ?? ""}`);
  await call(`/admin/products/${body.data?.id}`, { method: "DELETE", token });
}

// 22. A non-ObjectId id must 404 rather than leak a CastError.
{
  check("PUT /admin/categories/:id with junk id is 404", (await call("/admin/categories/not-an-id", { method: "PUT", token, body: JSON.stringify({ name: "x" }) })).code === 404);
  check("DELETE /admin/categories/:id with junk id is 404", (await call("/admin/categories/not-an-id", { method: "DELETE", token })).code === 404);
}

// 23. The newsletter. Every address here is @example.com, which isTestAddress()
//     in notifications.js filters out of every send — so this whole section runs
//     with real SMTP credentials configured and still mails nobody. That is the
//     point of the guard, and it is what makes the suite safe to run against a
//     live key.
//
//     Each check gets its own synthetic X-Forwarded-For. The subscribe limiter
//     allows 5/hour, and this section makes more than 5 subscribe calls, so they
//     each need a clean bucket — the same reason the quote section pins an IP.
//     The limiter itself is exercised deliberately in 23.13.
const SUB = "e2e-newsletter@example.com";
const subSecret = process.env.SUBSCRIBER_TOKEN_SECRET?.trim() || process.env.ACCESS_TOKEN_SECRET;
const mintToken = (email, purpose) =>
  jwt.sign({ email: email.toLowerCase(), purpose }, subSecret, { expiresIn: "1h" });
let subIpCounter = 0;
const asSubIp = (extra = {}) => ({
  ...extra,
  headers: {
    "X-Forwarded-For": `198.51.100.${(subIpCounter += 1) % 250}`,
    ...extra.headers,
  },
});
const findSub = async () =>
  (await call("/admin/subscribers", { token })).body.data.find((s) => s.email === SUB);

// 23.1 Sweep leftovers from a crashed run so the create checks are repeatable.
{
  for (const s of (await call("/admin/subscribers", { token })).body.data.filter((x) => x.email?.endsWith("@example.com"))) {
    await call(`/admin/subscribers/${s.id}`, { method: "DELETE", token });
  }
}

// 23.2 Subscribing stores a *pending* row, never an active one. Only the
//       confirmation link may promote it, so a typo or a bot cannot get mail.
{
  const { code, body } = await call("/api/subscribers", asSubIp({
    method: "POST",
    body: JSON.stringify({ email: SUB }),
  }));
  const row = await findSub();
  check("POST /api/subscribers is public and 201s", code === 201, `code=${code}`);
  check("a new subscriber starts as pending", row?.status === "pending", `status=${row?.status}`);
  check("the response never echoes the address list", !("email" in (body.data ?? {})), JSON.stringify(body.data ?? null));
}

// 23.3 Honeypot, exactly as the quote form: 201, and nothing stored.
{
  const before = (await call("/admin/subscribers", { token })).body.data.length;
  const { code } = await call("/api/subscribers", asSubIp({
    method: "POST",
    body: JSON.stringify({ email: "honeypot@example.com", website: "http://spam.example" }),
  }));
  const after = (await call("/admin/subscribers", { token })).body.data;
  check("honeypot subscribe is answered 201", code === 201, `code=${code}`);
  check("honeypot subscribe stored nothing", after.length === before && !after.some((s) => s.email === "honeypot@example.com"));
}

// 23.4 Email validation is hand-rolled, so the message is one the visitor can act
//       on, and it arrives as a field map rather than a bare 500.
{
  const blank = await call("/api/subscribers", asSubIp({ method: "POST", body: JSON.stringify({ email: "  " }) }));
  check("blank email is 400 with a field message", blank.code === 400 && Boolean(blank.body.errors?.email), `code=${blank.code}`);
  const bad = await call("/api/subscribers", asSubIp({ method: "POST", body: JSON.stringify({ email: "not-an-email" }) }));
  check("malformed email is 400 with a field message", bad.code === 400 && Boolean(bad.body.errors?.email), `code=${bad.code}`);
}

// 23.5 Submitting twice must not create a second row: email is uniquely indexed.
{
  const before = (await call("/admin/subscribers", { token })).body.data.length;
  const again = await call("/api/subscribers", asSubIp({ method: "POST", body: JSON.stringify({ email: SUB }) }));
  const after = (await call("/admin/subscribers", { token })).body.data;
  check("re-subscribing a pending address is still 201", again.code === 201, `code=${again.code}`);
  check("re-subscribing does not duplicate the row", after.length === before);
  check("re-subscribing does not silently activate it", (await findSub())?.status === "pending");
}

// 23.6 The token is purpose-scoped. An unsubscribe token replayed against the
//       confirm endpoint must be refused, or anyone could unsubscribe a stranger
//       by editing a URL.
{
  const junk = await call("/api/subscribers/confirm", { method: "POST", body: JSON.stringify({ token: "not-a-jwt" }) });
  check("a junk confirm token is 400", junk.code === 400, `code=${junk.code}`);
  const wrongPurpose = await call("/api/subscribers/confirm", {
    method: "POST",
    body: JSON.stringify({ token: mintToken(SUB, "unsubscribe") }),
  });
  check("an unsubscribe token cannot confirm a subscription", wrongPurpose.code === 400, `code=${wrongPurpose.code}`);
  const noToken = await call("/api/subscribers/confirm", { method: "POST", body: JSON.stringify({}) });
  check("confirm with no token is 400", noToken.code === 400, `code=${noToken.code}`);
}

// 23.7 Confirming promotes the row, and only then is it broadcast to.
{
  const { code, body } = await call("/api/subscribers/confirm", {
    method: "POST",
    body: JSON.stringify({ token: mintToken(SUB, "confirm") }),
  });
  const row = await findSub();
  check("confirming a valid token is 200", code === 200, `code=${code} ${body.message ?? ""}`);
  check("confirming sets the row active", row?.status === "active", `status=${row?.status}`);
  check("confirming records confirmedAt", Boolean(row?.confirmedAt));
  check("confirming does not return the stored document", !("createdAt" in (body.data ?? {})), JSON.stringify(body.data ?? null));
}

// 23.8 Creating a product while a subscriber is active must still work. The
//       broadcast runs here and reaches nobody, because the address is a
//       reserved example domain — but the admin's save must not depend on it.
{
  const { code, body } = await call("/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify({ name: "E2E Newsletter Widget", desc: "created by the e2e broadcast check" }),
  });
  check("product create still 201s with an active subscriber", code === 201, `code=${code} ${body.message ?? ""}`);
  await call(`/admin/products/${body.data?.id}`, { method: "DELETE", token });
}

// 23.9 Every product now gets a server-generated slug, so a new product always
//       has a public page to link the broadcast to. The broadcast's own
//       slug guard remains for the one legacy row that predates this (the
//       seeded "test product 1"), which is why it is not dead code.
{
  const { code, body } = await call("/admin/products", {
    method: "POST",
    token,
    body: JSON.stringify({ name: "E2E Auto Slug Widget", desc: "slug comes from the name" }),
  });
  check("a product created with no slug gets one derived from its name", code === 201 && body.data?.slug === "e2e-auto-slug-widget", `code=${code} slug=${body.data?.slug}`);
  await call(`/admin/products/${body.data?.id}`, { method: "DELETE", token });
}

// 23.10 Unsubscribing is idempotent, and it survives a token that has already
//        been used once.
{
  const token = mintToken(SUB, "unsubscribe");
  const first = await call("/api/subscribers/unsubscribe", { method: "POST", body: JSON.stringify({ token }) });
  check("unsubscribing is 200", first.code === 200, `code=${first.code} ${first.body.message ?? ""}`);
  check("unsubscribing sets the status", (await findSub())?.status === "unsubscribed", `status=${(await findSub())?.status}`);
  const again = await call("/api/subscribers/unsubscribe", { method: "POST", body: JSON.stringify({ token }) });
  check("unsubscribing twice is still 200", again.code === 200, `code=${again.code}`);
  const wrongPurpose = await call("/api/subscribers/unsubscribe", {
    method: "POST",
    body: JSON.stringify({ token: mintToken(SUB, "confirm") }),
  });
  check("a confirm token cannot unsubscribe", wrongPurpose.code === 400, `code=${wrongPurpose.code}`);
}

// 23.11 A confirmation link that outlived an unsubscribe must not undo it, and
//        the way back on is the footer form.
{
  const stale = await call("/api/subscribers/confirm", {
    method: "POST",
    body: JSON.stringify({ token: mintToken(SUB, "confirm") }),
  });
  check("a stale confirm link does not reactivate", stale.code === 409, `code=${stale.code}`);
  check("the row is still unsubscribed", (await findSub())?.status === "unsubscribed");

  const back = await call("/api/subscribers", asSubIp({ method: "POST", body: JSON.stringify({ email: SUB }) }));
  check("re-subscribing after unsubscribing is 201", back.code === 201, `code=${back.code}`);
  check("re-subscribing puts the row back to pending", (await findSub())?.status === "pending", `status=${(await findSub())?.status}`);
}

// 23.12 The admin list is protected and read/delete only. An admin-create route
//        would let anyone with a token put an address on the list that never
//        opted in, so its absence is asserted rather than assumed.
{
  check("GET /admin/subscribers requires a token", (await call("/admin/subscribers")).code === 401);
  const list = await call("/admin/subscribers", { token });
  check("GET /admin/subscribers lists the rows", list.code === 200 && Array.isArray(list.body.data), `code=${list.code}`);
  check("there is no admin route to create a subscriber", (await call("/admin/subscribers", { method: "POST", token, body: JSON.stringify({ email: "sneaky@example.com" }) })).code === 404);
  check("admin create really did not store anything", !(await call("/admin/subscribers", { token })).body.data.some((s) => s.email === "sneaky@example.com"));
}

// 23.13 The subscribe limiter. This block deliberately reuses ONE ip so the
//        requests land in the same bucket — but the ip itself is randomised per
//        run, otherwise a second run inside the hour would find the bucket
//        already drained by the first and every request would be 429.
{
  const ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
  const at = (extra) => ({ ...extra, headers: { "X-Forwarded-For": ip } });
  const codes = [];
  for (let i = 0; i < 6; i += 1) {
    codes.push((await call("/api/subscribers", at({ method: "POST", body: JSON.stringify({ email: `burst-${i}@example.com` }) }))).code);
  }
  check("the 6th subscribe in an hour is 429", codes[5] === 429, `codes=${codes.join(",")}`);
  check("the first 5 were accepted", codes.slice(0, 5).every((c) => c === 201), `codes=${codes.join(",")}`);
  for (const s of (await call("/admin/subscribers", { token })).body.data.filter((x) => x.email?.startsWith("burst-"))) {
    await call(`/admin/subscribers/${s.id}`, { method: "DELETE", token });
  }
}

// 23.14 Deleting removes them for good, and a confirm link for a deleted row
//        404s rather than resurrecting it.
{
  const row = await findSub();
  const gone = await call(`/admin/subscribers/${row.id}`, { method: "DELETE", token });
  check("DELETE /admin/subscribers/:id is 200", gone.code === 200, `code=${gone.code}`);
  check("the row is gone", !(await findSub()));
  check("DELETE returns no data key", !("data" in gone.body));
  const orphan = await call("/api/subscribers/confirm", {
    method: "POST",
    body: JSON.stringify({ token: mintToken(SUB, "confirm") }),
  });
  check("confirming a deleted subscriber is 404", orphan.code === 404, `code=${orphan.code}`);
  check("DELETE /admin/subscribers/:id with junk id is 404", (await call("/admin/subscribers/not-an-id", { method: "DELETE", token })).code === 404);
}

// ── customer artwork ───────────────────────────────────────────────────────────
// The quote form now sends the image itself, not just its name. What matters is
// that the file is really stored and reachable, that the name is not guessable,
// and that every failure mode costs the artwork rather than the enquiry.
//
// A real 2x2 PNG: these checks genuinely write to Cloudinary, then clean up.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
  "base64"
);

// 25. A real image is uploaded, stored, and actually served back.
let artworkUrl = null;
let artworkId = null;
{
  const { code, body } = await callForm(
    "/api/quotes",
    artworkForm(
      { name: "E2E Artwork", email: "artwork@example.com", product: "E2E Test Widget" },
      { bytes: PNG, type: "image/png", name: "e2e-customer-logo.png" }
    ),
    asIp()
  );
  artworkId = body.data?.id ?? null;
  check("POST /api/quotes with artwork is 201", code === 201 && Boolean(artworkId), `code=${code} ${body.message ?? ""}`);

  const row = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === artworkId);
  artworkUrl = row?.attachmentUrl ?? null;
  check("the filename is the uploaded part's name", row?.attachment === "e2e-customer-logo.png", row?.attachment);
  check("attachmentUrl points at the quote-artwork folder", /\/quote-artwork\//.test(artworkUrl ?? ""), artworkUrl ?? "(none)");
  check("the stored name is randomised, not the customer's filename", Boolean(row?.attachmentPublicId) && !row.attachmentPublicId.includes("customer-logo"), row?.attachmentPublicId ?? "(none)");
  check("the 201 never echoes the document back", body.data && !("attachmentUrl" in body.data) && !("email" in body.data));

  const img = artworkUrl ? await fetch(artworkUrl) : null;
  check("the image is really served from Cloudinary", img?.status === 200, `code=${img?.status}`);
  check("Cloudinary served an actual image", (img?.headers.get("content-type") ?? "").startsWith("image/"), img?.headers.get("content-type") ?? "(none)");
}

// 26. A honeypot submission must not become free image hosting.
{
  const before = await quoteCount();
  const { code } = await callForm(
    "/api/quotes",
    artworkForm(
      { name: "Artwork Bot", email: "artworkbot@example.com", website: "http://spam.example" },
      { bytes: PNG, type: "image/png", name: "bot-logo.png" }
    ),
    asIp()
  );
  check("honeypot with a file attached still returns 201", code === 201, `code=${code}`);
  check("honeypot with a file attached stores nothing", (await quoteCount()) === before, `${before} -> ${await quoteCount()}`);
}

// 27. Artwork that cannot be stored must still leave the quote intact — the
//     enquiry is always worth more than the attachment.
{
  const { code, body } = await callForm(
    "/api/quotes",
    artworkForm(
      { name: "E2E Pdf Artwork", email: "pdfart@example.com" },
      { bytes: Buffer.from("%PDF-1.4 not an image"), type: "application/pdf", name: "artwork.pdf" }
    ),
    asIp()
  );
  const row = (await call("/admin/quotes", { token })).body.data.find((q) => q.id === body.data?.id);
  check("a PDF attachment does not fail the submission", code === 201 && Boolean(row), `code=${code}`);
  check("the PDF filename is still recorded", row?.attachment === "artwork.pdf", row?.attachment);
  check("a non-image is not pushed to Cloudinary", !row?.attachmentUrl, row?.attachmentUrl ?? "(none)");
  await call(`/admin/quotes/${row.id}`, { method: "DELETE", token });
}

// 28. Deleting a quote must destroy the asset, or storage leaks for every quote
//     ever deleted.
{
  const del = await call(`/admin/quotes/${artworkId}`, { method: "DELETE", token });
  check("DELETE /admin/quotes with artwork is 200", del.code === 200, `code=${del.code}`);
  check("the quote row is gone", !(await call("/admin/quotes", { token })).body.data.some((q) => q.id === artworkId));

  // The CDN can take a moment to drop a destroyed asset, so retry briefly. The
  // window has to be genuinely generous (up to ~30s): at 12s this check failed
  // against a correctly-deleted asset while a later fetch of the same URL 404'd.
  let destroyed = false;
  for (let i = 0; i < 15 && !destroyed; i += 1) {
    destroyed = artworkUrl ? (await fetch(artworkUrl)).status === 404 : true;
    if (!destroyed) await new Promise((r) => setTimeout(r, 2000));
  }
  check("deleting the quote destroyed the Cloudinary asset", destroyed);
}

// ── admin password reset ───────────────────────────────────────────────────────
// The "Forgot password" flow. A throwaway staff account is created and reset, so
// the real admin's password is never touched. Every address is @example.com, so
// the reset email is suppressed (isTestAddress) and nothing is actually sent.
const RESET_EMAIL = `e2e-reset-${Math.floor(Math.random() * 1e6)}@example.com`;
const OLD_PASS = "OldPass123";
const NEW_PASS = "NewPass456";
const resetSecret =
  process.env.RESET_TOKEN_SECRET?.trim() || process.env.ACCESS_TOKEN_SECRET;
const mintReset = (id, fingerprint) =>
  jwt.sign({ id, purpose: "reset", ph: fingerprint }, resetSecret, { expiresIn: "1h" });
let resetUserId = null;
let resetPh = null;

// 29. A throwaway admin/staff account to reset.
{
  const { code, body } = await call("/admin/users", {
    method: "POST",
    token,
    body: JSON.stringify({ name: "E2E Reset", email: RESET_EMAIL, password: OLD_PASS, role: "staff" }),
  });
  resetUserId = body.data?.id ?? null;
  check("created a throwaway staff account for the reset checks", code === 201 && Boolean(resetUserId), `code=${code} ${body.message ?? ""}`);

  const raw = await mongoose.connection.db.collection("admins").findOne({ email: RESET_EMAIL });
  resetPh = raw ? crypto.createHash("sha256").update(String(raw.password)).digest("hex") : null;
}

// 30. The account's current password works before any reset.
{
  const login = await call("/admin/admin-login", { method: "POST", body: JSON.stringify({ email: RESET_EMAIL, password: OLD_PASS }) });
  check("the throwaway account can sign in before the reset", login.code === 200 && login.body.status === true, `code=${login.code}`);
}

// 31. Forgot password never reveals whether an address exists: the unknown and
//     the known address must get a byte-identical answer.
{
  const unknown = await call("/admin/forgot-password", {
    method: "POST",
    headers: { "X-Forwarded-For": `203.0.113.${Math.floor(Math.random() * 250) + 1}` },
    body: JSON.stringify({ email: "nobody-here@example.com" }),
  });
  const known = await call("/admin/forgot-password", {
    method: "POST",
    headers: { "X-Forwarded-For": `203.0.113.${Math.floor(Math.random() * 250) + 1}` },
    body: JSON.stringify({ email: RESET_EMAIL }),
  });
  check("forgot-password is public and answers 200", unknown.code === 200 && unknown.body.status === true, `code=${unknown.code}`);
  check("forgot-password for an unknown address is also 200", known.code === 200 && known.body.status === true, `code=${known.code}`);
  check("forgot-password reveals nothing that distinguishes the two", unknown.body.message === known.body.message, `unknown="${unknown.body.message}" known="${known.body.message}"`);
  check("forgot-password never returns a token", !JSON.stringify(unknown.body).includes("token") && !JSON.stringify(known.body).includes("token"));
}

// 32. The token is verified by purpose and by a digest of the current hash, so
//     every bad shape must be refused.
{
  const junk = await call("/admin/reset-password", { method: "POST", body: JSON.stringify({ token: "not-a-jwt", password: NEW_PASS }) });
  check("a junk reset token is 400", junk.code === 400, `code=${junk.code}`);

  const wrongPurpose = await call("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: jwt.sign({ id: resetUserId, purpose: "confirm", ph: resetPh }, resetSecret, { expiresIn: "1h" }), password: NEW_PASS }),
  });
  check("a wrong-purpose token cannot reset a password", wrongPurpose.code === 400, `code=${wrongPurpose.code}`);

  const unknownId = await call("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: mintReset("0123456789abcdef01234567", resetPh), password: NEW_PASS }),
  });
  check("a token for a non-existent account is refused", unknownId.code === 400, `code=${unknownId.code}`);

  const stalePrint = await call("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: mintReset(resetUserId, "0".repeat(64)), password: NEW_PASS }),
  });
  check("a token whose password fingerprint does not match is refused", stalePrint.code === 400, `code=${stalePrint.code}`);
}

// 33. A valid token with a password that breaks the policy is refused, and the
//     field-level message comes back.
{
  const weak = await call("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: mintReset(resetUserId, resetPh), password: "short" }),
  });
  check("a too-short new password is refused", weak.code === 400 && Boolean(weak.body.errors?.password), `code=${weak.code} ${JSON.stringify(weak.body.errors)}`);
}

// 34. The happy path: a fresh valid token sets the password, and signing in then
//     uses the new one while the old one is dead.
{
  const before = (await call("/admin/admin-login", { method: "POST", body: JSON.stringify({ email: RESET_EMAIL, password: OLD_PASS }) })).code;
  const good = await call("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: mintReset(resetUserId, resetPh), password: NEW_PASS }),
  });
  check("a valid reset token updates the password", good.code === 200 && good.body.status === true, `code=${good.code} ${good.body.message ?? ""}`);

  const withNew = await call("/admin/admin-login", { method: "POST", body: JSON.stringify({ email: RESET_EMAIL, password: NEW_PASS }) });
  const withOld = await call("/admin/admin-login", { method: "POST", body: JSON.stringify({ email: RESET_EMAIL, password: OLD_PASS }) });
  check("the account signs in with the new password", before === 200 && withNew.code === 200, `before=${before} after=${withNew.code}`);
  check("the old password no longer works", withOld.code === 400, `code=${withOld.code}`);
}

// 35. The link is single-use: the same token is refused once the password has
//     changed, because its fingerprint no longer matches.
{
  const reuse = await call("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ token: mintReset(resetUserId, resetPh), password: "Another789" }),
  });
  check("a used reset token cannot be replayed", reuse.code === 400, `code=${reuse.code}`);
}

// 36. The forgot endpoint is rate limited, so it cannot be used to email-bomb.
{
  const ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
  const at = () => call("/admin/forgot-password", {
    method: "POST",
    headers: { "X-Forwarded-For": ip },
    body: JSON.stringify({ email: "burst@example.com" }),
  });
  const codes = [];
  for (let i = 0; i < 6; i += 1) codes.push((await at()).code);
  check("the 6th forgot-password request in an hour is 429", codes[5] === 429, `codes=${codes.join(",")}`);
  check("the first 5 forgot-password requests are accepted", codes.slice(0, 5).every((c) => c === 200), `codes=${codes.join(",")}`);
}

// 37. Clean up the throwaway account.
{
  const del = await call(`/admin/users/${resetUserId}`, { method: "DELETE", token });
  check("the throwaway reset account is deleted", del.code === 200, `code=${del.code}`);
}

// 24. Cleanup, so a re-run starts from the same state.
{
  await call(`/admin/products/${widgetId}`, { method: "DELETE", token });
  // The rules fixture from check 8b is the product still carrying the required
  // customization field, so it has to go too or check 2's slug suffix shifts.
  const leftovers = (await call("/admin/products", { token })).body.data;
  const fixture = leftovers.find((p) => p.name === "E2E Test Widget");
  if (fixture) await call(`/admin/products/${fixture.id}`, { method: "DELETE", token });
  const left = (await call("/admin/products", { token })).body.data.filter(
    (p) => p.slug === CAT_SLUG || p.slug === "e2e-no-category" || p.slug === "e2e-newsletter-widget"
  );
  check("e2e category fixtures cleaned up", left.length === 0, `left ${left.map((p) => p.slug).join(", ")}`);
  const subs = (await call("/admin/subscribers", { token })).body.data.filter((s) => s.email?.endsWith("@example.com"));
  check("e2e subscriber fixtures cleaned up", subs.length === 0, `left ${subs.map((s) => s.email).join(", ")}`);
}

console.log("");
pass.forEach((l) => console.log(l));
fail.forEach((l) => console.log(l));
console.log(`\n${pass.length} passed, ${fail.length} failed`);
await mongoose.disconnect();
process.exit(fail.length ? 1 : 0);
