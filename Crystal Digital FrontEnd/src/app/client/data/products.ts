import img1 from "../../../imports/image-1.png";
import img2 from "../../../imports/image-2.png";
import img3 from "../../../imports/image-3.png";
import img4 from "../../../imports/image-4.png";
import img5 from "../../../imports/image-5.png";
import img6 from "../../../imports/image-6.png";
import img9 from "../../../imports/image-9.png";
import img10 from "../../../imports/image-10.png";
import img11 from "../../../imports/image-11.png";
import img12 from "../../../imports/image-12.png";
import { Product } from "../types/Product";

// ── Products Data ─────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: "crystal-award",
    img: img2,
    name: "Crystal Award",
    desc: "Elegant personalized crystal awards for achievements and milestones.",
    fullDesc:
      "Our premium Crystal Awards are crafted from optical-grade clarity crystal, delivering a stunning visual presence at any recognition ceremony. Each piece is meticulously polished and laser-engraved with precision, ensuring your message, logo, or design is captured with breathtaking detail. Perfect for corporate excellence awards, academic achievements, retirement gifts, and milestone celebrations.",
    cat: "Crystal",
    features: [
      "Optical-grade crystal clarity",
      "Precision 2D/3D laser engraving",
      "Custom text & logo engraving",
      "Presented in premium gift box",
      "Available in multiple sizes",
      "Certificate of authenticity included",
    ],
    specs: [
      { label: "Material", value: "Optical Crystal Glass" },
      { label: "Finish", value: "Hand-polished, glossy" },
      {
        label: "Sizes Available",
        value: "Small (15cm), Medium (20cm), Large (25cm)",
      },
      {
        label: "Engraving Type",
        value: "Laser 2D / 3D engraving",
      },
      { label: "Turnaround", value: "3–5 business days" },
      { label: "Packaging", value: "Premium velvet gift box" },
    ],
    customizable: [
      "Recipient's name & designation",
      "Company or school logo",
      "Custom message up to 150 words",
      "Achievement date",
      "Award title & category",
    ],
    tags: ["Best Seller", "Premium"],
  },
  {
    id: "wooden-plaque",
    img: img1,
    name: "Wooden Plaque",
    desc: "Premium wooden plaques with gold-tone frame — ideal for recognition.",
    fullDesc:
      "Our Wooden Plaques combine natural hardwood warmth with professional gold-tone framing to create a lasting recognition piece. The smooth wood surface is laser-engraved to produce crisp, readable text and detailed logos. Ideal for employee of the month awards, academic excellence certificates, community service recognition, and special occasion gifting.",
    cat: "Plaques",
    features: [
      "Premium hardwood construction",
      "Gold-tone metallic border frame",
      "High-contrast laser engraving",
      "Wall-mount ready with hardware",
      "Available in multiple wood finishes",
      "Eco-friendly and sustainably sourced",
    ],
    specs: [
      {
        label: "Material",
        value: "Hardwood (Teak / Sheesham)",
      },
      { label: "Frame", value: "Gold-tone metallic border" },
      { label: "Sizes Available", value: "A5, A4, A3" },
      {
        label: "Engraving Type",
        value: "Laser engraving / UV print",
      },
      { label: "Turnaround", value: "2–4 business days" },
      { label: "Mounting", value: "Wall-mount hook included" },
    ],
    customizable: [
      "Recipient name & title",
      "Logo & badge printing",
      "Custom message or citation",
      "Date and event details",
      "Colour-fill engraving",
    ],
    tags: ["Popular"],
  },
  {
    id: "gold-trophy",
    img: img4,
    name: "Gold Trophy",
    desc: "Classic gold trophies for sports and corporate events.",
    fullDesc:
      "Our Gold Trophies are the quintessential symbol of victory and excellence. Cast from high-quality metal alloys and finished with a brilliant gold plating, these trophies are designed to stand the test of time. Whether for sports tournaments, inter-school competitions, corporate awards, or cultural events, our gold trophies make every winner feel truly special.",
    cat: "Trophies",
    features: [
      "Bright gold-plated finish",
      "Heavy-weight metal construction",
      "Customizable figurine toppers",
      "Engraved name plate included",
      "Stable anti-tip weighted base",
      "Available from 6 inches to 36 inches",
    ],
    specs: [
      {
        label: "Material",
        value: "Zinc alloy / Metal composite",
      },
      { label: "Finish", value: "Gold electroplating" },
      { label: "Heights Available", value: "15cm – 90cm" },
      { label: "Base", value: "Marble / wood base option" },
      { label: "Name Plate", value: "Engraved brass plate" },
      { label: "Turnaround", value: "1–3 business days" },
    ],
    customizable: [
      "Trophy height and design style",
      "Name plate text & event details",
      "Topper style (sport, academic, cultural)",
      "Base material (wood, marble, acrylic)",
      "Ribbon or medal add-on",
    ],
    tags: ["Most Popular"],
  },
  {
    id: "cultural-trophy",
    img: img5,
    name: "Cultural Trophy",
    desc: "Handcrafted wooden temple-style trophies for cultural celebrations.",
    fullDesc:
      "Our Cultural Trophies pay homage to Nepal's rich architectural and artistic heritage. Handcrafted by skilled artisans, these temple-style wooden trophies are finished with intricate detailing that reflects traditional craftsmanship. Ideal for cultural festivals, folk performances, religious events, and heritage celebrations across Nepal.",
    cat: "Trophies",
    features: [
      "Handcrafted by skilled artisans",
      "Intricate traditional detailing",
      "Natural wood with lacquer finish",
      "Unique Nepali cultural heritage design",
      "Laser-engraved name plate",
      "Sturdy and durable construction",
    ],
    specs: [
      { label: "Material", value: "Solid wood (hand-carved)" },
      { label: "Style", value: "Temple / Pagoda architecture" },
      { label: "Finish", value: "Natural lacquer or painted" },
      { label: "Heights Available", value: "20cm – 60cm" },
      { label: "Turnaround", value: "3–7 business days" },
      {
        label: "Engraving",
        value: "Brass plate laser engraving",
      },
    ],
    customizable: [
      "Carving style and motifs",
      "Wood type and colour",
      "Name plate inscription",
      "Size and height",
      "Cultural symbol or logo",
    ],
    tags: ["Unique", "Handcrafted"],
  },
  {
    id: "sports-medals",
    img: img3,
    name: "Sports Medals Set",
    desc: "Complete medal sets with ribbons for tournaments and competitions.",
    fullDesc:
      "Our Sports Medals Sets are designed for every competitive event — from local school sports days to national tournaments. Available in gold, silver, and bronze finishes, each medal is crafted with a polished metallic face, vibrant full-colour ribbon, and precision laser-engraved or UV-printed design. Order in bulk for cost-effective recognition at your next event.",
    cat: "Medals",
    features: [
      "Gold, silver & bronze finishes",
      "Full-colour custom ribbon included",
      "UV-printed or engraved design",
      "Bulk order discounts available",
      "Fast turnaround for event deadlines",
      "Velvet pouch packaging option",
    ],
    specs: [
      { label: "Material", value: "Zinc alloy / Aluminium" },
      {
        label: "Finish",
        value: "Gold, Silver, Bronze plating",
      },
      { label: "Diameter", value: "50mm, 65mm, 75mm" },
      { label: "Ribbon", value: "Custom colour, 18–22mm wide" },
      { label: "Minimum Order", value: "10 pieces" },
      { label: "Turnaround", value: "2–5 business days" },
    ],
    customizable: [
      "Event name and logo",
      "Position text (1st, 2nd, 3rd)",
      "Year and date",
      "Custom ribbon colour",
      "Back-side engraving",
    ],
    tags: ["Bulk Orders", "Popular"],
  },
  {
    id: "award-collection",
    img: img6,
    name: "Award Collection",
    desc: "Explore our full range of customized awards, gifts, and mementos.",
    fullDesc:
      "Our Award Collection showcases the complete range of what Crystal Digital Art & Award House offers — from elegant crystal pieces to classic trophies, precision-engraved plaques, corporate branding items, and personalized gifts. Each item in our collection can be fully customized to match your event's theme, brand identity, or personal touch.",
    cat: "Collection",
    features: [
      "Complete range under one roof",
      "Free custom design consultation",
      "Corporate and bulk pricing",
      "Full-colour printing available",
      "Packaging and delivery options",
      "Sample viewing at our store",
    ],
    specs: [
      {
        label: "Product Range",
        value: "Awards, Trophies, Plaques, Medals, Gifts",
      },
      {
        label: "Customization",
        value: "Full custom design support",
      },
      { label: "Minimum Order", value: "1 piece (no minimum)" },
      {
        label: "Bulk Discount",
        value: "Available for 10+ orders",
      },
      {
        label: "Consultation",
        value: "Free design consultation",
      },
      { label: "Turnaround", value: "Varies by product" },
    ],
    customizable: [
      "Any text, name, or message",
      "Logo and brand identity",
      "Colour and material",
      "Size and quantity",
      "Gift wrapping and packaging",
    ],
    tags: ["Full Range"],
  },
  {
    id: "sports-trophy-sets",
    img: img9,
    name: "Sports Trophy Sets",
    desc: "Complete coordinated sets for tournaments & competitions.",
    fullDesc:
      "Our Sports Trophy Sets provide everything you need to recognize excellence at your tournament or sporting event. Each set includes coordinated trophies in multiple sizes for different podium positions, ensuring a unified and professional look. Available in various sport-specific designs including football, cricket, volleyball, badminton, and more.",
    cat: "Trophies",
    features: [
      "Coordinated multi-size trophy set",
      "Sport-specific figurine toppers",
      "Matching ribbon medals option",
      "Gold, silver, bronze finishes",
      "Engraved base plates included",
      "Event-ready fast turnaround",
    ],
    specs: [
      {
        label: "Material",
        value: "Metal composite / Zinc alloy",
      },
      {
        label: "Set Composition",
        value: "1st, 2nd, 3rd + participation",
      },
      {
        label: "Sports Designs",
        value: "Cricket, Football, Volleyball & more",
      },
      { label: "Sizes", value: "20cm – 60cm per tier" },
      { label: "Turnaround", value: "1–3 business days" },
      {
        label: "Add-ons",
        value: "Medals, certificates, ribbons",
      },
    ],
    customizable: [
      "Sport type and figurine design",
      "Name plate text",
      "Number of positions in set",
      "Base style and material",
      "Matching medal set add-on",
    ],
    tags: ["Sets", "Events"],
  },
  {
    id: "gold-honour-trophy",
    img: img10,
    name: "Gold Honour Trophy",
    desc: "Classic gold trophies for felicitation events.",
    fullDesc:
      "The Gold Honour Trophy is our signature felicitation piece — a timeless symbol of respect and recognition. Designed for formal ceremonies, retirement events, lifetime achievement awards, and VIP presentations, this trophy commands attention with its commanding height, brilliant gold finish, and premium engraved base plate.",
    cat: "Trophies",
    features: [
      "Commanding ceremonial height",
      "Brilliant gold-plated finish",
      "Premium engraved brass plate",
      "Heavy marble or rosewood base",
      "Velvet-lined gift box packaging",
      "Ideal for formal felicitation",
    ],
    specs: [
      { label: "Material", value: "Metal with gold plating" },
      { label: "Base", value: "Premium marble or rosewood" },
      { label: "Heights Available", value: "30cm – 75cm" },
      {
        label: "Name Plate",
        value: "Engraved brass / gold plate",
      },
      { label: "Packaging", value: "Velvet-lined gift box" },
      { label: "Turnaround", value: "2–4 business days" },
    ],
    customizable: [
      "Height and design style",
      "Engraved name and title",
      "Base material and colour",
      "Personal message inscription",
      "Logo or emblem on body",
    ],
    tags: ["Premium", "Formal"],
  },
  {
    id: "cultural-heritage-trophy",
    img: img11,
    name: "Cultural & Heritage Trophy",
    desc: "Handcrafted wooden temple-style awards for cultural events.",
    fullDesc:
      "Celebrating Nepal's diverse cultural legacy, our Heritage Trophies are masterpieces of woodcraft and artistry. Inspired by the pagoda temples of the Kathmandu Valley and folk art traditions of Gandaki Province, each trophy is individually handcrafted, making it a one-of-a-kind collector's piece. Perfect for cultural events, folk festivals, and heritage preservation awards.",
    cat: "Trophies",
    features: [
      "Individually handcrafted by artisans",
      "Inspired by Nepali pagoda architecture",
      "Rich wood grain and lacquer finish",
      "Traditional motifs and carvings",
      "Unique — no two pieces identical",
      "Artisan-made locally in Nepal",
    ],
    specs: [
      {
        label: "Material",
        value: "Sal wood / Teak (hand-carved)",
      },
      { label: "Style", value: "Multi-tiered pagoda design" },
      {
        label: "Finish",
        value: "Natural wood, lacquer, gold accents",
      },
      { label: "Heights", value: "25cm – 70cm" },
      { label: "Turnaround", value: "5–10 business days" },
      {
        label: "Authenticity",
        value: "Handmade certificate included",
      },
    ],
    customizable: [
      "Carving depth and motifs",
      "Colour scheme and paint",
      "Inscription plate text",
      "Tier count and height",
      "Cultural symbol integration",
    ],
    tags: ["Handmade", "Heritage"],
  },
  {
    id: "premium-display-trophy",
    img: img12,
    name: "Premium Display Trophy",
    desc: "Showcase-ready trophies for offices and lobbies.",
    fullDesc:
      "Our Premium Display Trophies are designed for maximum visual impact — ideal for permanent display in offices, boardrooms, halls of fame, and institution lobbies. Each piece combines polished metal with crystal elements, mounted on a premium base, and optionally enclosed in a custom glass display case for preservation and prestige.",
    cat: "Trophies",
    features: [
      "Optional custom glass display case",
      "Crystal and metal combination",
      "LED-illuminated base option",
      "Permanent office display quality",
      "Weather-resistant finish",
      "Custom branding on case",
    ],
    specs: [
      { label: "Material", value: "Metal + crystal elements" },
      {
        label: "Display Case",
        value: "Optional custom glass case",
      },
      { label: "Base", value: "Illuminated LED base option" },
      { label: "Heights", value: "35cm – 80cm" },
      { label: "Turnaround", value: "5–7 business days" },
      {
        label: "Warranty",
        value: "Lifetime quality guarantee",
      },
    ],
    customizable: [
      "Trophy height and shape",
      "Crystal colour and cut style",
      "Engraved name plate",
      "Base lighting option",
      "Glass case dimensions",
    ],
    tags: ["Luxury", "Display"],
  },
];