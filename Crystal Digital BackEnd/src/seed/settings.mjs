// Canonical business details for the public website.
//
// These are the values that were previously hardcoded in the React components
// (Footer.tsx, ContactPage.tsx, AboutPage.tsx). They now live in MongoDB so the
// admin can edit them from Admin > Settings, and the public site reads them from
// GET /api/settings.
//
// Kept in its own file (not data.mjs) because dumpSeed.mjs regenerates data.mjs
// wholesale from the database — settings are not dumped content.
//
// The Google Maps *embed* iframe is intentionally NOT here: the pb= embed URL is
// a different thing from the human-facing "Get directions" link (mapLink), and
// the embed stays hardcoded in the components.

export const SEED_SETTINGS = {
  businessName: "Crystal Digital Art & Award House",
  tagline:
    "Pokhara's trusted destination for premium awards, trophies, laser engraving, and digital printing services.",
  phone: "061-523459 / 9856012712",
  email: "globallinksks@gmail.com",
  // Digits only (country code + number, no + or spaces). The site builds
  // https://wa.me/<whatsapp> from this, so an admin can type it either way.
  whatsapp: "9779856012712",
  address: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
  workingHours: "Monday – Saturday: 9:00 AM – 7:00 PM",
  facebookUrl: "https://www.facebook.com/crystaldigital12712/",
  mapLink:
    "https://www.google.com/maps/search/Crystal+Digital+Art+%26+Award+House+Pokhara+Nepal",
};
