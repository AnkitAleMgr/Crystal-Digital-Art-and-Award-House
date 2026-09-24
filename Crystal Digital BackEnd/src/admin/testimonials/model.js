import mongoose from "mongoose";

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    company: { type: String, default: "" },
    text: { type: String, required: true },
    rating: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const TestimonialModel = mongoose.model("testimonial", TestimonialSchema);