import mongoose from "mongoose";

// A single shared category list for products AND gallery items: products are
// also shown in the gallery, and gallery-only images can carry a category of
// their own, so one list keeps the filter pills consistent across the site.
//
// Products/gallery docs keep `cat` as a plain string (the category *name*)
// rather than a ref. That is deliberate: renaming a category is then a single
// updateMany instead of a document rewrite, and a category can be deleted
// without leaving dangling ObjectIds behind — the docs are simply stripped.
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 60,
    },
    // Admin-controlled display order. createCategory appends with
    // countDocuments(), so the order categories were created in is the order
    // the pills render in.
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.model("category", CategorySchema);
