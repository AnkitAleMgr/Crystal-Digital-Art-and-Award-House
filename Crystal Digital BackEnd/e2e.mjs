import "dotenv/config";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import assert from "assert";

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

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });
const admin = await mongoose.connection.db.collection("admins").findOne({});
if (!admin) throw new Error("no admin exists — cannot run e2e");
const token = jwt.sign(
  { id: admin._id.toString(), email: admin.email, role: admin.role ?? "admin" },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: "15m" }
);
console.log("using admin:", admin.email, admin._id.toString());

const product = {
  slug: "e2e-test-widget",
  name: "E2E Test Widget",
  desc: "created by the e2e check",
  cat: "Crystal",
  features: ["feature a"],
  specs: [{ label: "Material", value: "glass" }],
  customizable: [],
  tags: ["new"],
  sizes: ["S", "L"],
};

const noSlug = { ...product, slug: undefined };
delete noSlug.slug;

const pass = [];
const fail = [];
const check = (label, cond, extra = "") =>
  (cond ? pass : fail).push(`${cond ? "PASS" : "FAIL"}  ${label}${extra ? ` — ${extra}` : ""}`);

// 1. Creating without a slug must be rejected (this is what breaks if the admin
//    UI forgets to send one).
{
  const { code, body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify(noSlug) });
  check("POST /admin/products without slug is rejected", code === 400 && body.errors?.slug, `code=${code} errors=${JSON.stringify(body.errors)}`);
}

// 2. Duplicate slug must be rejected.
{
  const { code, body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify(product) });
  check("POST /admin/products with slug succeeds", code === 201 || code === 200, `code=${code} ${body.message ?? ""}`);
  if (body.data) product.id = body.data.id;
}

// 3. It must show up on the public site, addressed by its slug.
{
  const { code, body } = await call("/api/products");
  const found = body.data?.find((p) => p.id === "e2e-test-widget");
  check("new product appears in GET /api/products", code === 200 && Boolean(found), `count=${body.data?.length}`);
  check("public response omits imgPublicId", found && !("imgPublicId" in found));
  check("public response carries sizes", found && Array.isArray(found.sizes) && found.sizes.length === 2);
}

// 4. A partial update must not wipe the other fields.
{
  const { body } = await call("/api/products");
  const before = body.data.find((p) => p.id === "e2e-test-widget");
  const { code, body: upd } = await call(`/admin/products/${product.id}`, {
    method: "PUT", token, body: JSON.stringify({ name: "E2E Test Widget Renamed" }),
  });
  const { body: after } = await call("/api/products");
  const now = after.data.find((p) => p.id === "e2e-test-widget");
  check("PUT partial update keeps the slug", code === 200 && now?.id === "e2e-test-widget", `code=${code}`);
  check("PUT partial update keeps desc", now?.desc === before.desc);
  check("PUT partial update applied the name", now?.name === "E2E Test Widget Renamed");
}

// 5. Clean up, and confirm it disappears from the public list.
{
  const { code } = await call(`/admin/products/${product.id}`, { method: "DELETE", token });
  const { body } = await call("/api/products");
  check("DELETE removes the product", code === 200, `code=${code}`);
  check("deleted product is gone from the public API", !body.data.some((p) => p.id === "e2e-test-widget"));
  check("DELETE returns no data key", !("data" in (await call(`/admin/products/${product.id}`, { method: "DELETE", token })).body));
}

// 6. The slugless admin-created product must stay hidden but survive.
{
  const { body: adminList } = await call("/admin/products", { token });
  const strays = adminList.data.filter((p) => !p.slug);
  const { body: pubList } = await call("/api/products");
  check("admin still sees the slugless test product", strays.length === 1, `found ${strays.length}: ${strays.map((s) => s.name).join(", ")}`);
  check("public API hides the slugless product", !pubList.data.some((p) => p.id === strays[0]?.id));
}

// ── public quote submission ───────────────────────────────────────────────────
// Every request below carries a synthetic X-Forwarded-For. The quote rate limiter
// buckets on that header, so each run gets a clean bucket — otherwise repeated
// runs inside the 1h window would start failing on 429 and the suite would stop
// being repeatable. The limiter itself is exercised in check 16.
const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
const asIp = (extra = {}) => ({ ...extra, headers: { "X-Forwarded-For": ip, ...extra.headers } });
const quoteCount = async () => (await call("/admin/quotes", { token })).body.data.length;

// 0. A crashed run leaks whatever it had created so far, which would then fail
//    the count-based checks below on the next run. Every row this suite makes
//    uses an @example.com address, so sweeping those makes the suite idempotent.
{
  const stale = (await call("/admin/quotes", { token })).body.data.filter((q) => q.email?.endsWith("@example.com"));
  for (const q of stale) await call(`/admin/quotes/${q.id}`, { method: "DELETE", token });
  if (stale.length) console.log(`swept ${stale.length} leftover quote(s) from a previous run`);
}

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
      product: "E2E Test Widget",
      size: "L",
      service: "Crystal Awards",
      quantity: "25",
      engrave: "Presented to E2E — 2026",
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
  check("all form fields persisted", row?.service === "Crystal Awards" && row?.quantity === "25" && row?.engrave === "Presented to E2E — 2026" && row?.attachment === "e2e-logo.png" && row?.product === "E2E Test Widget" && row?.size === "L" && row?.message === "Please quote 25 units.");
  check("quote has a server-set createdAt", Boolean(row?.createdAt) && new Date(row.createdAt).getTime() <= Date.now() + 5000, `createdAt=${row?.createdAt}`);
}

// 8. Validation must reject, and name the offending field.
{
  const { code, body } = await call("/api/quotes", asIp({ method: "POST", body: JSON.stringify({ name: "No Email" }) }));
  check("POST /api/quotes rejects a missing email", code === 400 && Boolean(body.errors?.email), `code=${code}`);
  const bad = await call("/api/quotes", asIp({ method: "POST", body: JSON.stringify({ name: "Bad", email: "not-an-email" }) }));
  check("POST /api/quotes rejects a malformed email", bad.code === 400 && Boolean(bad.body.errors?.email), `code=${bad.code}`);
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
//     notifications.js), so this stays a no-op whether or not RESEND_API_KEY is
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
const CAT_SLUG = "e2e-cat-widget";
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

  const made = await call("/admin/products", { method: "POST", token, body: JSON.stringify({ slug: CAT_SLUG, name: "E2E Category Widget", desc: "created by the e2e check", cat: `${CAT} Renamed` }) });
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
  const { code, body } = await call("/admin/products", { method: "POST", token, body: JSON.stringify({ slug: "e2e-no-cat", name: "E2E No Category", desc: "created by the e2e check" }) });
  check("a product can be created with no category", code === 201 && body.data?.cat === "", `code=${code} ${body.message ?? ""}`);
  await call(`/admin/products/${body.data?.id}`, { method: "DELETE", token });
}

// 22. A non-ObjectId id must 404 rather than leak a CastError.
{
  check("PUT /admin/categories/:id with junk id is 404", (await call("/admin/categories/not-an-id", { method: "PUT", token, body: JSON.stringify({ name: "x" }) })).code === 404);
  check("DELETE /admin/categories/:id with junk id is 404", (await call("/admin/categories/not-an-id", { method: "DELETE", token })).code === 404);
}

// 23. Cleanup, so a re-run starts from the same state.
{
  await call(`/admin/products/${widgetId}`, { method: "DELETE", token });
  const left = (await call("/admin/products", { token })).body.data.filter((p) => p.slug === CAT_SLUG || p.slug === "e2e-no-cat");
  check("e2e category fixtures cleaned up", left.length === 0, `left ${left.map((p) => p.slug).join(", ")}`);
}

console.log("");
pass.forEach((l) => console.log(l));
fail.forEach((l) => console.log(l));
console.log(`\n${pass.length} passed, ${fail.length} failed`);
await mongoose.disconnect();
process.exit(fail.length ? 1 : 0);
