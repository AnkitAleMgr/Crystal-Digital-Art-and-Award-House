import mongoose from "mongoose";

const SettingSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "" },
    tagline: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    mapLink: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    workingHours: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SettingModel = mongoose.model("sitesetting", SettingSchema);