import mongoose from "mongoose";

// Deliberately the same pattern as the quote email rather than a new one: both
// are addresses a visitor typed into a public form, and both get hand-rolled
// messages the visitor can act on. Keeping one pattern means the validation
// messages read the same on every form.
export const SUBSCRIBER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Status is the whole double opt-in mechanism:
//
//   pending       — the footer form was submitted and a confirmation link was
//                   emailed, but nobody has clicked it yet. NOT broadcast to.
//   active        — confirmed. The only status the product broadcast reads.
//   unsubscribed  — they clicked the link in an email. Kept as a row (rather
//                   than deleted) so the same address re-subscribing updates one
//                   document instead of colliding with the unique email index.
//
// `unsubscribed` rows are also what stops a stale confirmation link working
// forever: confirming a row that has explicitly opted out is refused.
const SubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160,
      match: SUBSCRIBER_EMAIL_PATTERN,
    },
    status: {
      type: String,
      enum: ["pending", "active", "unsubscribed"],
      default: "pending",
    },
    confirmedAt: { type: Date, default: null },
    unsubscribedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// The broadcast reads every active row on each product create, so the status is
// the index that matters.
SubscriberSchema.index({ status: 1, createdAt: -1 });

export const SubscriberModel = mongoose.model("subscriber", SubscriberSchema);
