import { GalleryItem } from "../types/interface/gallery/gakkeryItem";
import { AdminProduct } from "../types/interface/production/adminProduct";
import { QuoteRequest } from "../types/interface/quoteRequest/quoteRequest";
import { SiteSettings } from "../types/interface/setting/siteSetting";
import { Testimonial } from "../types/interface/testimonials/testimonials";

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_PRODUCTS: AdminProduct[] = [
  {
    id: "crystal-award",
    name: "Crystal Award",
    desc: "Elegant personalized crystal awards for achievements and milestones.",
    fullDesc: "Our premium Crystal Awards are crafted from optical-grade clarity crystal, delivering a stunning visual presence at any recognition ceremony.",
    cat: "Crystal",
    features: ["Optical-grade crystal clarity", "Precision 2D/3D laser engraving", "Custom text & logo engraving", "Presented in premium gift box"],
    specs: [{ label: "Material", value: "Optical Crystal Glass" }, { label: "Finish", value: "Hand-polished, glossy" }],
    customizable: ["Recipient's name & designation", "Company or school logo", "Custom message"],
    tags: ["Best Seller", "Premium"],
    sizes: ["Small — 15cm", "Medium — 20cm", "Large — 25cm"],
    imgUrl: "",
  },
  {
    id: "wooden-plaque",
    name: "Wooden Plaque",
    desc: "Premium wooden plaques with gold-tone frame — ideal for recognition.",
    fullDesc: "Our Wooden Plaques combine natural hardwood warmth with professional gold-tone framing to create a lasting recognition piece.",
    cat: "Plaques",
    features: ["Premium hardwood construction", "Gold-tone metallic border frame", "High-contrast laser engraving", "Wall-mount ready"],
    specs: [{ label: "Material", value: "Hardwood (Teak / Sheesham)" }, { label: "Frame", value: "Gold-tone metallic border" }],
    customizable: ["Recipient name & title", "Logo & badge printing", "Custom message"],
    tags: ["Popular"],
    sizes: ["A5 — 21×15cm", "A4 — 30×21cm", "A3 — 42×30cm"],
    imgUrl: "",
  },
  {
    id: "gold-trophy",
    name: "Gold Trophy",
    desc: "Classic gold trophies for sports and corporate events.",
    fullDesc: "Our Gold Trophies are the quintessential symbol of victory and excellence. Cast from high-quality metal alloys and finished with a brilliant gold plating.",
    cat: "Trophies",
    features: ["Bright gold-plated finish", "Heavy-weight metal construction", "Customizable figurine toppers", "Engraved name plate included"],
    specs: [{ label: "Material", value: "Zinc alloy / Metal composite" }, { label: "Finish", value: "Gold electroplating" }],
    customizable: ["Trophy height and design style", "Name plate text", "Topper style"],
    tags: ["Most Popular"],
    sizes: ["15cm", "20cm", "25cm", "30cm", "45cm", "60cm", "75cm", "90cm"],
    imgUrl: "",
  },
  {
    id: "sports-medals",
    name: "Sports Medals Set",
    desc: "Complete medal sets with ribbons for tournaments and competitions.",
    fullDesc: "Our Sports Medals Sets are designed for every competitive event — from local school sports days to national tournaments.",
    cat: "Medals",
    features: ["Gold, silver & bronze finishes", "Full-colour custom ribbon included", "UV-printed or engraved design", "Bulk order discounts available"],
    specs: [{ label: "Material", value: "Zinc alloy / Aluminium" }, { label: "Diameter", value: "50mm, 65mm, 75mm" }],
    customizable: ["Event name and logo", "Position text (1st, 2nd, 3rd)", "Custom ribbon colour"],
    tags: ["Bulk Orders", "Popular"],
    sizes: ["50mm Diameter", "65mm Diameter", "75mm Diameter"],
    imgUrl: "",
  },
];

const SEED_GALLERY: GalleryItem[] = [
  { id: "g1", label: "Token of Appreciation Award", cat: "Crystal Awards", imgUrl: "", linkedProductId: "crystal-award" },
  { id: "g2", label: "Wooden Plaque with Gold Frame", cat: "Plaques", imgUrl: "", linkedProductId: "wooden-plaque" },
  { id: "g3", label: "Gold Sports Trophy", cat: "Trophies", imgUrl: "", linkedProductId: "gold-trophy" },
  { id: "g4", label: "Cultural Temple Trophy", cat: "Trophies", imgUrl: "", linkedProductId: "cultural-trophy" },
  { id: "g5", label: "Sports Medal Set", cat: "Medals", imgUrl: "", linkedProductId: "sports-medals" },
  { id: "g6", label: "Full Award Collection Display", cat: "Collection", imgUrl: "", linkedProductId: "award-collection" },
];

const SEED_TESTIMONIALS: Testimonial[] = [
  { id: "t1", name: "Ramesh Sharma", company: "Pokhara Academy", text: "Crystal Digital delivered outstanding trophies for our annual sports day. The quality was beyond expectations and delivery was on time!", rating: 5 },
  { id: "t2", name: "Sunita Gurung", company: "Annapurna Hotels", text: "We ordered custom crystal awards for our employee recognition ceremony. Beautifully crafted and professionally packaged. Highly recommend!", rating: 5 },
  { id: "t3", name: "Bikash Thapa", company: "Gandaki Province Office", text: "Excellent service for our government felicitation event. The wooden plaques and laser engraving were top-notch. Will definitely order again.", rating: 5 },
];

const SEED_QUOTES: QuoteRequest[] = [
  { id: "q1", name: "Anil Shrestha", email: "anil@example.com", phone: "+977 9801234567", product: "Crystal Award", size: "Medium — 20cm", message: "Need 25 crystal awards for our annual recognition event. Can you provide bulk pricing?", date: "2026-08-28", status: "new" },
  { id: "q2", name: "Priya Tamang", email: "priya@example.com", phone: "+977 9856789012", product: "Gold Trophy", size: "45cm", message: "Looking for 1st, 2nd, 3rd place trophies for a football tournament. Total 30 trophies needed.", date: "2026-08-25", status: "reviewed" },
  { id: "q3", name: "Sanjay Karki", email: "sanjay@corp.com", phone: "+977 9812345678", product: "Wooden Plaque", size: "A4 — 30×21cm", message: "Corporate employee awards — 15 wooden plaques with our logo. Please send pricing.", date: "2026-08-20", status: "quoted" },
  { id: "q4", name: "Meena Rai", email: "meena@school.edu", phone: "+977 9867890123", product: "Sports Medals", size: "65mm Diameter", message: "Annual sports day for 200 students. Need medals for all participants plus podium trophies.", date: "2026-08-15", status: "closed" },
  { id: "q5", name: "Ankit Ale", email: "anmolankit00@gmail.com", phone: "+977 9800000001", product: "Crystal Award", size: "Large — 25cm", message: "Test quote — requesting details on custom crystal award for an upcoming ceremony.", date: "2026-09-03", status: "new" },
];

const SEED_SETTINGS: SiteSettings = {
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

// export *;
export { SEED_GALLERY, SEED_PRODUCTS, SEED_QUOTES, SEED_SETTINGS, SEED_TESTIMONIALS }