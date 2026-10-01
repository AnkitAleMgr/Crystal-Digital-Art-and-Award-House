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
    // The structured fields the customer MUST (or may) answer on the quote
    // form for this product. It replaced a `customizable: [String]` list of
    // marketing tags that nothing ever collected an answer for, so "required"
    // is enforced in three places: the quote modal, POST /api/quotes, and the
    // admin form that defines them.
    customizationFields: {
      // _id: false — a customization field is a value, not a document. Without
      // this Mongoose mints an id per row, which leaks into the public API
      // response and into the admin modal's keys for no benefit.
      type: [
        {
          _id: false,
          label: { type: String, required: true, trim: true, maxlength: 120 },
          required: { type: Boolean, default: false },
          // Capped so one customer cannot paste an essay into "Name". The admin
          // form bounds it too; the clamp here is the one that actually holds,
          // because the admin PUT runs with runValidators.
          maxLength: { type: Number, default: 300, min: 20, max: 1000 },
        },
      ],
      default: [],
    },
    tags: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    // The public /products/:slug address. Still required and still unique, but
    // it is generated from the product name by the controller rather than typed
    // by the admin — the form no longer shows it at all.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    imgUrl: { type: String, default: "" },
    imgPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model("product", ProductSchema);