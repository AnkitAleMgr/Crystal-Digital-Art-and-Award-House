import { PublicSettings } from "../types/Public";

// Fallback business details, used until GET /api/settings resolves and again for
// any individual field the admin has left blank. The point is that the site can
// never render an empty phone number or address just because the settings doc is
// missing a value.
//
// These deliberately mirror Crystal Digital BackEnd/src/seed/settings.mjs, which
// is what fills the database. They are duplicated on purpose: the backend cannot
// import frontend code and the frontend must render without a network round-trip.

export const SITE_DEFAULTS: PublicSettings = {
  businessName: "Crystal Digital Art & Award House",
  tagline:
    "Pokhara's trusted destination for premium awards, trophies, laser engraving, and digital printing services.",
  phone: "061-523459 / 9856012712",
  email: "globallinksks@gmail.com",
  whatsapp: "9779856012712",
  address: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
  workingHours: "Monday – Saturday: 9:00 AM – 7:00 PM",
  facebookUrl: "https://www.facebook.com/crystaldigital12712/",
  mapLink:
    "https://www.google.com/maps/search/Crystal+Digital+Art+%26+Award+House+Pokhara+Nepal",
};

// A blank/cleared field falls back rather than disappearing from the page, so a
// half-filled settings doc is always safe to save.
export function withSettingsDefaults(
  fetched?: Partial<PublicSettings> | null
): PublicSettings {
  const merged = { ...SITE_DEFAULTS };

  for (const key of Object.keys(SITE_DEFAULTS) as (keyof PublicSettings)[]) {
    if (key === "id") continue;
    const value = fetched?.[key];
    if (typeof value === "string" && value.trim()) {
      merged[key] = value.trim() as never;
    }
  }

  return merged;
}

// The admin types the WhatsApp number however they like ("+977 9856012712",
// "977-9856012712"). wa.me only accepts digits, so strip everything else.
export function whatsappLink(settings: PublicSettings): string {
  const digits = settings.whatsapp.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
