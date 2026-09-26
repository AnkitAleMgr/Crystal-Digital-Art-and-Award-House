import "dotenv/config";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { ProductModel } from "./src/admin/products/model.js";
import { GalleryModel } from "./src/admin/gallery/model.js";
import { TestimonialModel } from "./src/admin/testimonials/model.js";
import { SettingModel } from "./src/admin/settings/model.js";
import { QuoteModel } from "./src/admin/quotes/model.js";

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });
const db = mongoose.connection.db;

console.log("── database ──");
for (const [n, M] of [["products", ProductModel], ["gallery", GalleryModel], ["testimonials", TestimonialModel], ["settings", SettingModel], ["quotes", QuoteModel]]) {
  console.log("  " + n.padEnd(14), await M.countDocuments(), "(" + M.collection.collectionName + ")");
}

const slugless = await ProductModel.countDocuments({ $or: [{ slug: { $exists: false } }, { slug: "" }] });
console.log("  slugless products (admin-only, hidden publicly):", slugless);

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
