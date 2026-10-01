import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { ProductModel } from "./src/admin/products/model.js";
import { GalleryModel } from "./src/admin/gallery/model.js";
import { TestimonialModel } from "./src/admin/testimonials/model.js";
import { SettingModel } from "./src/admin/settings/model.js";
import { QuoteModel } from "./src/admin/quotes/model.js";
import { CategoryModel } from "./src/admin/categories/model.js";
import { SubscriberModel } from "./src/admin/subscribers/model.js";
import { siteUrl } from "./src/utils/siteUrl.js";

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });
const db = mongoose.connection.db;

console.log("── database ──");
for (const [n, M] of [["products", ProductModel], ["categories", CategoryModel], ["gallery", GalleryModel], ["testimonials", TestimonialModel], ["settings", SettingModel], ["quotes", QuoteModel], ["subscribers", SubscriberModel]]) {
  console.log("  " + n.padEnd(14), await M.countDocuments(), "(" + M.collection.collectionName + ")");
}

// Only `active` rows are mailed, so that is the number that decides whether the
// next product create sends anything. `pending` is the double opt-in waiting on
// a click, and `unsubscribed` is kept as a row so the same address can rejoin.
for (const status of ["active", "pending", "unsubscribed"]) {
  console.log("    " + status.padEnd(14), await SubscriberModel.countDocuments({ status }));
}

// The broadcast is a no-op for a product with no slug, and every link in every
// email is built from SITE_URL. Both are silent-failure settings, so they are
// worth seeing next to the numbers they affect.
const broadcastable = await ProductModel.countDocuments({
  slug: { $exists: true, $ne: "" },
});
console.log("  products a broadcast would go out for:", broadcastable, "of", await ProductModel.countDocuments());
console.log("  SITE_URL (email links point here):", siteUrl(), process.env.SITE_URL ? "" : "(unset — using the dev-server default)");

const slugless = await ProductModel.countDocuments({ $or: [{ slug: { $exists: false } }, { slug: "" }] });
console.log("  slugless products (admin-only, hidden publicly):", slugless);

// A `cat` with no matching category is invisible on the site: the filter pills
// come from the categories collection, so such a product is only reachable via
// "All". Deleting a category clears its products' cat, so this should be empty
// unless a name was typed by hand or a category was renamed out from under one.
const known = new Set((await CategoryModel.find().select("name").lean()).map((c) => c.name.toLowerCase()));
const used = [...new Set([
  ...(await ProductModel.distinct("cat", { cat: { $nin: ["", null] } })),
  ...(await GalleryModel.distinct("cat", { cat: { $nin: ["", null] } })),
])];
const uncategorised = await Promise.all([
  ProductModel.countDocuments({ cat: { $in: ["", null] } }),
  GalleryModel.countDocuments({ cat: { $in: ["", null] } }),
]);
const unknownCats = used.filter((c) => !known.has(String(c).toLowerCase()));
console.log("  uncategorised (no cat, shown as Uncategorized):", uncategorised[0], "products /", uncategorised[1], "gallery items");
console.log("  cats with no category row (invisible on the site):", unknownCats.length, unknownCats.length ? JSON.stringify(unknownCats) : "");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const refs = new Set();
for (const M of [ProductModel, GalleryModel]) {
  for (const d of await M.find({}, "imgPublicId")) if (d.imgPublicId) refs.add(d.imgPublicId);
}

const listed = await cloudinary.api.resources({ max_results: 500, type: "upload" });
const assets = listed.resources
  .map((r) => r.public_id)
  .filter((id) => id.startsWith("crystal-digital/"));
const orphans = assets.filter((a) => !refs.has(a));
const dangling = [...refs].filter((r) => !assets.includes(r));

console.log("\n── cloudinary (crystal-digital/*) ──");
console.log("  assets:", assets.length, "| referenced by db:", refs.size);
console.log("  orphans (uploaded, unreferenced):", orphans.length, orphans.length ? JSON.stringify(orphans) : "");
console.log("  dangling (db points at a missing asset):", dangling.length, dangling.length ? JSON.stringify(dangling) : "");

await mongoose.disconnect();
