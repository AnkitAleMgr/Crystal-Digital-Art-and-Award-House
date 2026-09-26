import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    cat: { type: String, default: "" },
    imgUrl: { type: String, default: "" },
    imgPublicId: { type: String, default: "" },
    linkedProductId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const GalleryModel = mongoose.model("galleryitem", GallerySchema);