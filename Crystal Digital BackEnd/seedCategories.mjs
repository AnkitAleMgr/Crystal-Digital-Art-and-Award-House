// One-shot: put the category list into the `categories` collection.
//
// Safe to re-run. Categories are added, renamed and deleted by hand in the
// admin panel, so this only INSERTs names that don't exist yet — it never
// removes, renames or reorders anything. That is the opposite of `npm run seed`,
// which is guarded against double-seeding and needs --force to wipe.
//
//   npm run seed:categories             add any missing categories
//   npm run seed:categories -- --force  wipe the collection and rebuild the list
//
// --force also leaves products and gallery items alone: their `cat` is a plain
// string, so wiping the list does not touch a single product.

import "dotenv/config";
import mongoose from "mongoose";

import { CategoryModel } from "./src/admin/categories/model.js";
import { ProductModel } from "./src/admin/products/model.js";
import { GalleryModel } from "./src/admin/gallery/model.js";
import { SEED_CATEGORIES, upsertCategories } from "./src/seed/categories.mjs";

const FORCE = process.argv.includes("--force");

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });

if (FORCE) {
  await CategoryModel.deleteMany({});
  console.log("Wiped the categories collection (products/gallery untouched).");
}

const { added, existing } = await upsertCategories();

// The whole point of the list is that every `cat` in the database has a category
// to be listed under, so report the ones that don't — that is a real data
// problem (a product whose category was deleted, or one typed by hand).
const known = new Set([...existing, ...added].map((name) => name.toLowerCase()));
const orphans = await Promise.all([
  ProductModel.distinct("cat", { cat: { $nin: ["", null] } }),
  GalleryModel.distinct("cat", { cat: { $nin: ["", null] } }),
]);

const missing = [
  ...new Set(orphans.flat().filter((name) => !known.has(String(name).toLowerCase()))),
];

console.log(`Categories: ${existing.length} already there, ${added.length} added.`);
if (added.length) {
  console.log(`  added: ${added.join(", ")}`);
}

if (missing.length) {
  console.log(
    `\nWarning: ${missing.length} categor${missing.length === 1 ? "y is" : "ies are"} used by a product or gallery item but not in the list:`
  );
  console.log(`  ${missing.join(", ")}`);
  console.log("  Add them in Admin -> Products (or here) so they get a filter pill.");
}

console.log("\nVerify with: curl -s http://localhost:3000/api/categories");

await mongoose.disconnect();
