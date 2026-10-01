import mongoose from "mongoose";

export const QUOTE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const QuoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
      match: QUOTE_EMAIL_PATTERN,
    },
    phone: { type: String, default: "", trim: true, maxlength: 40 },
    product: { type: String, default: "", trim: true, maxlength: 160 },
    size: { type: String, default: "", trim: true, maxlength: 80 },
    service: { type: String, default: "", trim: true, maxlength: 120 },
    quantity: { type: String, default: "", trim: true, maxlength: 20 },
    engrave: { type: String, default: "", trim: true, maxlength: 500 },
    // The name the customer chose, kept even when the upload succeeded so the
    // admin recognises the file ("logo-final.png") instead of a random id.
    attachment: { type: String, default: "", trim: true, maxlength: 160 },
    // The image itself, on Cloudinary. attachmentPublicId is what deleteQuote
    // hands to Cloudinary to destroy the asset — without it a deleted quote
    // would leave the file behind, costing storage forever.
    attachmentUrl: { type: String, default: "", trim: true, maxlength: 500 },
    attachmentPublicId: { type: String, default: "", trim: true, maxlength: 200 },
    message: { type: String, default: "", trim: true, maxlength: 2000 },
    status: {
      type: String,
      enum: ["new", "reviewed", "quoted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

QuoteSchema.index({ createdAt: -1 });

export const QuoteModel = mongoose.model("quote", QuoteSchema);
