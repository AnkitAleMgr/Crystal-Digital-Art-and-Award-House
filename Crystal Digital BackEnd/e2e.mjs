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
  return { code: res.status, body: await res.json() };
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

console.log("");
pass.forEach((l) => console.log(l));
fail.forEach((l) => console.log(l));
console.log(`\n${pass.length} passed, ${fail.length} failed`);
await mongoose.disconnect();
process.exit(fail.length ? 1 : 0);
