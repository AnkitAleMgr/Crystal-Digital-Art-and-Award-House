import mongoose from "mongoose";

// Deliberately the same shape as SUBSCRIBER_EMAIL_PATTERN: one pattern shared by
// the schema's `match` and the hand-rolled public validation, so the message a
// visitor sees is the rule the database enforces.
export const QUOTE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// `status` only ever moves through the admin PUT (which emails the customer on
// a real transition). The public POST writes "new" itself and ignores anything
// posted alongside it, so a crafted body cannot pre-close its own quote.
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
    // Which product's rules this quote was filed under, so a later edit to that
    // product's required fields cannot be checked against the wrong definition.
    // Empty for a general contact-form enquiry, which is not product-scoped.
    productSlug: { type: String, default: "", trim: true, maxlength: 160 },
    size: { type: String, default: "", trim: true, maxlength: 80 },
    service: { type: String, default: "", trim: true, maxlength: 120 },
    quantity: { type: String, default: "", trim: true, maxlength: 20 },
    // The customer's answers to the product's customizationFields, stored as
    // [{ label, value }] rather than one free-text blob. The label is kept with
    // the value on purpose: the admin reads "Recipient name: Ramesh", and the
    // answer stays meaningful after the product's field is renamed or removed.
    // It replaced the `engrave` free-text box, which let a customer answer a
    // question the admin never asked.
    customization: {
      type: [
        {
          _id: false,
          label: { type: String, trim: true, maxlength: 120 },
          value: { type: String, trim: true, maxlength: 1000 },
        },
      ],
      default: [],
    },
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
