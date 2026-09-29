import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    fullDesc: { type: String, default: "" },
    // The category *name*, not a ref — see admin/categories/model.js. Empty
    // means uncategorized: deleting a category clears the products that used it
    // rather than deleting them, so this can no longer be required.
    cat: { type: String, default: "" },
    features: { type: [String], default: [] },
    specs: {
      type: [{ label: String, value: String }],
      default: [],
    },
    customizable: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    imgUrl: { type: String, default: "" },
    imgPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model("product", ProductSchema);