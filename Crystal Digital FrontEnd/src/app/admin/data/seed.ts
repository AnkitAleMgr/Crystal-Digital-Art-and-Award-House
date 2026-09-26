// Only the settings placeholder survives here. The products/gallery/testimonials/quotes
// arrays were removed once the dashboard moved off localStorage onto the API, and the
// public website content now lives in the backend at src/seed/data.mjs.
//
// SEED_SETTINGS is the placeholder shown before GET /admin/settings resolves.

import { SiteSettings } from "../types/interface/setting/siteSetting";

export const SEED_SETTINGS: SiteSettings = {
  businessName: "Crystal Digital Art & Award House",
  tagline: "Pokhara's Premier Award & Trophy Specialist",
  phone: "+977 056-XXX-XXX",
  email: "crystaldigital@example.com",
  address: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
  mapLink: "https://www.google.com/maps",
  facebookUrl: "https://www.facebook.com/crystaldigital12712/",
  workingHours: "Sun–Fri: 9:00 AM – 7:00 PM | Sat: 10:00 AM – 5:00 PM",
  whatsapp: "+977 9800000000",
};
