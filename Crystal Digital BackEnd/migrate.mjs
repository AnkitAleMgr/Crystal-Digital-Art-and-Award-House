// `npm run seed` — loads src/seed/data.mjs into MongoDB and uploads its images
// to Cloudinary through the running API (needs the server up plus a
// PROBE_TOKEN). Guarded: it refuses to run once products already have slugs;
// `-- --force` wipes the previously-seeded rows AND their Cloudinary assets
// first, so a reseed never orphans uploads. Admin-created rows are untouched.

import "dotenv/config";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

import { ProductModel } from "./src/admin/products/model.js";
import { GalleryModel } from "./src/admin/gallery/model.js";
import { TestimonialModel } from "./src/admin/testimonials/model.js";
import { CategoryModel } from "./src/admin/categories/model.js";
import { deleteImage } from "./src/claudinery/claudineryService.js";
import { SEED_PRODUCTS, SEED_GALLERY, SEED_TESTIMONIALS } from "./src/seed/data.mjs";
import { SEED_CATEGORIES, upsertCategories } from "./src/seed/categories.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const IMPORTS = resolve(HERE, "../Crystal Digital FrontEnd/src/imports");
const API = "http://localhost:3000";

const FORCE = process.argv.includes("--force");
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

console.log(
  `Seed: ${SEED_PRODUCTS.length} products, ${SEED_GALLERY.length} gallery items, ${SEED_TESTIMONIALS.length} testimonials`
);

const cache = new Map();

const upload = async (file, folder) => {
  const key = `${folder}/${file}`;
  if (cache.has(key)) return cache.get(key);

  const buf = readFileSync(resolve(IMPORTS, file));
  const ext = file.slice(file.lastIndexOf("."));
  const fd = new FormData();
  fd.append("image", new Blob([buf], { type: MIME[ext] ?? "application/octet-stream" }), file);
  fd.append("folder", folder);

  const res = await fetch(`${API}/admin/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PROBE_TOKEN}` },
    body: fd,
  });
  const payload = await res.json();
  if (!payload?.status) throw new Error(`Upload failed for ${key}: ${payload?.message}`);

  const value = { url: payload.data.url, publicId: payload.data.publicId };
  cache.set(key, value);
  return value;
};

await mongoose.connect(process.env.MONGO_DB_URI, { serverSelectionTimeoutMS: 15000 });

const seeded = await ProductModel.countDocuments({ slug: { $exists: true } });
const strays = await ProductModel.find({ slug: { $exists: false } }).select("name");

if (seeded > 0 && !FORCE) {
  console.log(
    `\nRefusing to run: ${seeded} products already have slugs (already seeded). Re-run with --force to wipe and reseed.`
  );
  await mongoose.disconnect();
  process.exit(1);
}

if (strays.length > 0) {
  console.log(
    `Keeping ${strays.length} admin-created product(s) with no slug: ${strays.map((s) => `"${s.name}"`).join(", ")}`
  );
  console.log("They stay invisible to the public site. Delete them from the admin panel when ready.\n");
}

if (FORCE) {
  // Only wipe previously-seeded docs (those carrying a slug) and destroy their
  // Cloudinary assets. Admin-created products are never touched. Without the
  // asset cleanup a reseed would orphan every upload, because Cloudinary
  // suffixes colliding filenames (image-2.png -> image-2-1.png).
  const stale = await Promise.all([
    ProductModel.find({ slug: { $exists: true } }).select("imgPublicId"),
    GalleryModel.find({}).select("imgPublicId"),
  ]);

  for (const doc of [...stale[0], ...stale[1]]) {
    if (doc.imgPublicId) await deleteImage(doc.imgPublicId);
  }

  const removed = await ProductModel.deleteMany({ slug: { $exists: true } });
  await Promise.all([GalleryModel.deleteMany({}), TestimonialModel.deleteMany({})]);
  console.log(
    `Cleared ${removed.deletedCount} seeded product(s) plus all gallery/testimonial rows and their Cloudinary assets.`
  );
}

for (const [i, p] of SEED_PRODUCTS.entries()) {
  const { url, publicId } = await upload(p.sourceImage, "products");
  const { sourceImage, ...fields } = p;
  await ProductModel.create({ ...fields, imgUrl: url, imgPublicId: publicId });
  console.log(`  product ${i + 1}/${SEED_PRODUCTS.length}  ${p.slug}  <- ${p.sourceImage}`);
}

for (const [i, g] of SEED_GALLERY.entries()) {
  const { url, publicId } = await upload(g.sourceImage, "gallery");
  const { sourceImage, ...fields } = g;
  await GalleryModel.create({ ...fields, imgUrl: url, imgPublicId: publicId });
  console.log(`  gallery ${i + 1}/${SEED_GALLERY.length}  ${g.label}  <- ${g.sourceImage}`);
}

for (const [i, t] of SEED_TESTIMONIALS.entries()) {
  await TestimonialModel.create(t);
  console.log(`  testimonial ${i + 1}/${SEED_TESTIMONIALS.length}  ${t.name}`);
}

// Categories are a separate collection but products/gallery rows reference them
// by name, so a fresh seed needs them to exist. upsertCategories only inserts
// missing names, which is why running it here cannot clobber a list the admin
// has since edited by hand — and why `npm run seed:categories` stays safe too.
const { added: addedCats } = await upsertCategories();
console.log(
  `  categories ${SEED_CATEGORIES.length} total${addedCats.length ? ` (${addedCats.length} added)` : " (already present)"}`
);

console.log(
  `\nDone. products=${await ProductModel.countDocuments()} gallery=${await GalleryModel.countDocuments()} testimonials=${await TestimonialModel.countDocuments()} categories=${await CategoryModel.countDocuments()}`
);
await mongoose.disconnect();
