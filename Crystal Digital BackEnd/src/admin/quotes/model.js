import mongoose from "mongoose";

const QuoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    product: { type: String, default: "" },
    size: { type: String, default: "" },
    message: { type: String, default: "" },
    date: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "reviewed", "quoted", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export const QuoteModel = mongoose.model("quote", QuoteSchema);