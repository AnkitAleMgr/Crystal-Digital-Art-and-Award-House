import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    desc: { type: String, required: true },
    fullDesc: { type: String, default: "" },
    cat: { type: String, required: true },
    features: { type: [String], default: [] },
    specs: {
      type: [{ label: String, value: String }],
      default: [],
    },
    customizable: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    imgUrl: { type: String, default: "" },
    imgPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model("product", ProductSchema);