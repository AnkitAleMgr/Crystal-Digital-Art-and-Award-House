import mongoose from "mongoose";

// The single settings document (no :id — see settings/controller.js). Every
// public copy of the phone/address/hours reads from here rather than the code.
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
    // Bare digits (no "+", spaces or scheme), not a URL: the site builds the
    // wa.me link itself, so whatever the admin types still yields a working
    // WhatsApp button.
    whatsapp: { type: String, default: "" },
  },
  { timestamps: true }
);

export const SettingModel = mongoose.model("sitesetting", SettingSchema);