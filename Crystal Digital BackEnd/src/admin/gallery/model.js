import mongoose from "mongoose";

// Gallery images, shared category list with products (see categories/model.js).
const GallerySchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    // Category *name*, not a ref — products and gallery share one list.
    cat: { type: String, default: "" },
    imgUrl: { type: String, default: "" },
    // Cloudinary destruction key; paired with imgUrl, kept by crud.js's
    // { withImages } option.
    imgPublicId: { type: String, default: "" },
    // The slug (not an ObjectId) of the product this image belongs to — public
    // products are addressed by slug, so this is what the gallery's link to
    // /products/:slug resolves against. Empty for a gallery-only image.
    linkedProductId: { type: String, default: "" },
  },
  { timestamps: true }
);

export const GalleryModel = mongoose.model("galleryitem", GallerySchema);