import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Link, useNavigate, useParams } from "react-router-dom";


import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  Trophy,
  Layers,
  Shield,
  Printer,
  Tag,
  Cpu,
  Gift,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  ArrowUp,
  Send,
  CheckCircle,
  Zap,
  Users,
  ThumbsUp,
  Package,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  Settings,
} from "lucide-react";

import logo from "@/imports/image.png";
import img1 from "@/imports/image-1.png";
import img2 from "@/imports/image-2.png";
import img3 from "@/imports/image-3.png";
import img4 from "@/imports/image-4.png";
import img5 from "@/imports/image-5.png";
import img6 from "@/imports/image-6.png";
import img7 from "@/imports/image-7.png";
import img8 from "@/imports/image-8.png";
import img9 from "@/imports/image-9.png";
import img10 from "@/imports/image-10.png";
import img11 from "@/imports/image-11.png";
import img12 from "@/imports/image-12.png";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

// ── Types ────────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  img: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  specs: { label: string; value: string }[];
  customizable: string[];
  tags: string[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function useCounter(
  target: number,
  active: boolean,
  duration = 2000,
) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, active, duration]);
  return count;
}

// ── Global CSS ───────────────────────────────────────────────────────────────
export const globalStyles = `
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; overflow-x: hidden; }
  h1,h2,h3,h4,h5,h6 { font-family: 'Poppins', sans-serif; overflow-wrap: break-word; word-break: break-word; }
  p, li, label, blockquote { overflow-wrap: break-word; }
  img { max-width: 100%; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F1F5F9; }
  ::-webkit-scrollbar-thumb { background: #2563EB; border-radius: 3px; }
  .fade-in { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
  .fade-in.visible { opacity: 1; transform: none; }
  .slide-left { opacity: 0; transform: translateX(-30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .slide-left.visible { opacity: 1; transform: none; }
  .slide-right { opacity: 0; transform: translateX(30px); transition: opacity 0.7s ease, transform 0.7s ease; }
  .slide-right.visible { opacity: 1; transform: none; }
  @keyframes testimonialSlide {
    from { opacity: 0; transform: translateX(24px) scale(0.98); }
    to   { opacity: 1; transform: translateX(0) scale(1); }
  }
  .testimonial-card { animation: testimonialSlide 0.55s cubic-bezier(0.22,1,0.36,1) both; }

  /* ── Named utility classes — fluid clamp at every viewport width ── */
  .hero-title      { font-size: clamp(1.4rem, 4.5vw + 0.5rem, 3.75rem) !important; }
  .hero-sub        { font-size: clamp(0.82rem, 1.5vw + 0.52rem, 1.25rem) !important; }
  .section-heading { font-size: clamp(1.2rem, 2.5vw + 0.7rem, 2.5rem) !important; }
  .section-label   { font-size: clamp(0.58rem, 0.4vw + 0.46rem, 0.75rem) !important; }
  .card-title      { font-size: clamp(0.78rem, 0.8vw + 0.5rem, 1rem) !important; }
  .card-desc       { font-size: clamp(0.68rem, 0.6vw + 0.44rem, 0.875rem) !important; }
  .stat-number     { font-size: clamp(1.4rem, 2.5vw + 0.8rem, 2.5rem) !important; }
  .tag-pill        { font-size: clamp(0.58rem, 0.4vw + 0.36rem, 0.75rem) !important; }

  /* ── Tablet (≤1024px) — scale headings without named classes ── */
  @media (max-width: 1024px) {
    h1:not(.hero-title) { font-size: clamp(1.5rem, 4.5vw, 2.5rem); }
    h2:not(.section-heading) { font-size: clamp(1.25rem, 3.5vw, 2rem); }
    h3 { font-size: clamp(1.1rem, 3vw, 1.5rem); }
  }

  /* ── Mobile / tablet portrait (≤768px) ── */
  @media (max-width: 768px) {
    h1:not(.hero-title) { font-size: clamp(1.3rem, 5.5vw, 2rem) !important; }
    h2:not(.section-heading) { font-size: clamp(1.1rem, 4.5vw, 1.625rem) !important; }
    h3 { font-size: clamp(1rem, 4vw, 1.3rem) !important; }
    h4 { font-size: clamp(0.9rem, 3.5vw, 1.1rem) !important; }
    .py-16 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
    .section-label { letter-spacing: 0.09em !important; }
  }

  /* ── Small phone (≤480px) ── */
  @media (max-width: 480px) {
    h1:not(.hero-title) { font-size: clamp(1.15rem, 7vw, 1.75rem) !important; }
    h2:not(.section-heading) { font-size: clamp(1rem, 6vw, 1.4rem) !important; }
    h3 { font-size: clamp(0.9rem, 5.5vw, 1.15rem) !important; }
    h4 { font-size: clamp(0.82rem, 4.5vw, 1rem) !important; }
    .tag-pill { padding: 1px 6px !important; }
    .py-16 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
  }

  /* ── Very small phone (≤375px) ── */
  @media (max-width: 375px) {
    h1:not(.hero-title) { font-size: clamp(1.05rem, 8vw, 1.5rem) !important; }
    h2:not(.section-heading) { font-size: clamp(0.95rem, 7vw, 1.25rem) !important; }
    h3 { font-size: clamp(0.85rem, 6vw, 1.05rem) !important; }
    .py-16 { padding-top: 1.75rem !important; padding-bottom: 1.75rem !important; }
  }
`;

export function GlobalStyles() {
  return <style>{globalStyles}</style>;
}

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

// ── Product Sizes ─────────────────────────────────────────────────────────────
export const PRODUCT_SIZES: Record<string, string[]> = {
  "crystal-award": ["Small — 15cm", "Medium — 20cm", "Large — 25cm"],
  "wooden-plaque": ["A5 — 21×15cm", "A4 — 30×21cm", "A3 — 42×30cm"],
  "gold-trophy": ["15cm", "20cm", "25cm", "30cm", "45cm", "60cm", "75cm", "90cm"],
  "cultural-trophy": ["20cm", "30cm", "40cm", "50cm", "60cm"],
  "sports-medals": ["50mm Diameter", "65mm Diameter", "75mm Diameter"],
  "award-collection": ["Custom — varies by product"],
  "sports-trophy-sets": ["20cm Set", "30cm Set", "40cm Set", "50cm Set", "60cm Set"],
  "gold-honour-trophy": ["30cm", "45cm", "60cm", "75cm"],
  "cultural-heritage-trophy": ["25cm", "35cm", "45cm", "55cm", "70cm"],
  "premium-display-trophy": ["35cm", "45cm", "60cm", "70cm", "80cm"],
};



// ── HERO CAROUSEL ────────────────────────────────────────────────────────────
export const heroSlides = [
  {
    img: img2,
    title: "Crafting Excellence Into Every Award",
    sub: "Premium crystal and acrylic awards personalized for your milestone moments",
    badge: "Token of Appreciation",
  },
  {
    img: img3,
    title: "Premium Awards & Customized Gifts",
    sub: "From sports trophies to corporate recognition — beautifully crafted",
    badge: "Trophies & Medals",
  },
  {
    img: img4,
    title: "Professional Printing & Corporate Branding",
    sub: "Signage, name plates, and branding solutions delivered with precision",
    badge: "Corporate Trophies",
  },
];

export function HeroCarousel({
  onQuote,
  onGallery,
}: {
  onQuote: () => void;
  onGallery: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setIdx(next);
        setAnimating(false);
      }, 400);
    },
    [animating],
  );

  useEffect(() => {
    const id = setInterval(
      () => go((idx + 1) % heroSlides.length),
      5000,
    );
    return () => clearInterval(id);
  }, [idx, go]);

  const slide = heroSlides[idx];

  return (
    <section
      className="relative h-screen min-h-[580px] overflow-hidden"
      style={{ marginTop: "0" }}
    >
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ opacity: animating ? 0 : 1 }}
      >
        <ImageWithFallback
          src={slide.img}
          alt={slide.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,64,175,0.65) 50%, rgba(15,23,42,0.5) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20">
          <div className="max-w-2xl">
            <span
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-6 transition-all duration-500 text-[12px]"
              style={{
                background: "rgba(34,197,94,0.2)",
                color: "#16A34A",
                border: "1px solid rgba(34,197,94,0.4)",
                opacity: animating ? 0 : 1,
              }}
            >
              ✦ {slide.badge}
            </span>
            <h1
              className="hero-title text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 transition-all duration-500"
              style={{
                fontFamily: "Poppins, sans-serif",
                opacity: animating ? 0 : 1,
                transform: animating
                  ? "translateY(12px)"
                  : "none",
              }}
            >
              {slide.title}
            </h1>
            <p
              className="hero-sub text-base sm:text-lg text-blue-100 mb-8 leading-relaxed transition-all duration-500"
              style={{ opacity: animating ? 0 : 1 }}
            >
              {slide.sub}
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onGallery}
                className="px-6 py-3 rounded-xl font-semibold text-white border-2 border-white/40 hover:bg-white/10 transition-all"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                View Gallery
              </button>
              <button
                onClick={onQuote}
                className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #22C55E, #16A34A)",
                  color: "#ffffff",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Request a Quote
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() =>
          go((idx - 1 + heroSlides.length) % heroSlides.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <ChevronLeft size={20} className="text-white" />
      </button>
      <button
        onClick={() => go((idx + 1) % heroSlides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <ChevronRight size={20} className="text-white" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all"
            style={{
              width: i === idx ? "24px" : "8px",
              height: "8px",
              background:
                i === idx ? "#D4AF37" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}

// ── SECTION WRAPPER ──────────────────────────────────────────────────────────
export function Section({
  children,
  className = "",
  bg = "white",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`py-16 lg:py-24 ${className}`}
      style={{ background: bg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

export function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span
        className="w-8 h-0.5 rounded"
        style={{ background: "#D4AF37" }}
      />
      <span
        className="section-label text-xs font-bold tracking-widest uppercase"
        style={{
          color: "#D4AF37",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {children}
      </span>
      <span
        className="w-8 h-0.5 rounded"
        style={{ background: "#D4AF37" }}
      />
    </div>
  );
}

export function SectionHeading({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className="section-heading text-3xl lg:text-4xl font-bold leading-tight"
      style={{
        color: light ? "#fff" : "#1F2937",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {children}
    </h2>
  );
}

// ── SERVICES ─────────────────────────────────────────────────────────────────
export const services = [
  {
    emoji: "🏆",
    label: "Crystal Awards",
    desc: "Elegant crystal awards for every milestone and achievement.",
    color: "#2563EB",
  },
  {
    emoji: "🥇",
    label: "Custom Trophies",
    desc: "Gold, silver & bronze trophies crafted to your specifications.",
    color: "#D4AF37",
  },
  {
    emoji: "✨",
    label: "Laser Engraving",
    desc: "Precision laser engraving on crystal, wood, acrylic & metal.",
    color: "#7C3AED",
  },
  {
    emoji: "🖨️",
    label: "Digital Printing",
    desc: "High-resolution full-colour digital printing on any surface.",
    color: "#2563EB",
  },
  {
    emoji: "🎁",
    label: "Personalized Gifts",
    desc: "Unique customized gifts for corporate events and loved ones.",
    color: "#DC2626",
  },
  {
    emoji: "📋",
    label: "Name Plates & Sign Boards",
    desc: "Professional signage, nameplates and office branding items.",
    color: "#0891B2",
  },
  {
    emoji: "🏅",
    label: "Medals & Certificates",
    desc: "Sports medals, honour certificates and ribboned award sets.",
    color: "#D4AF37",
  },
  {
    emoji: "🏢",
    label: "Corporate Branding",
    desc: "End-to-end branding solutions for offices, events and gifting.",
    color: "#2563EB",
  },
];

export function ServicesGrid() {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-5"
    >
      {services.map((s, i) => (
        <div
          key={s.label}
          className="group flex flex-col gap-3 p-6 rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          style={{
            background: "white",
            border: "1px solid rgba(0,0,0,0.06)",
            boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(24px)",
            transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms, box-shadow 0.3s ease`,
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
            style={{ background: `${s.color}12` }}
          >
            {s.emoji}
          </div>
          <div>
            <h4
              className="card-title font-bold text-gray-800 text-sm mb-1.5 leading-snug"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {s.label}
            </h4>
            <p className="card-desc text-xs text-gray-500 leading-relaxed">
              {s.desc}
            </p>
          </div>
          <div className="mt-auto pt-2">
            <span
              className="text-xs font-semibold"
              style={{ color: s.color }}
            >
              Learn more →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── WHY CHOOSE US ─────────────────────────────────────────────────────────────
export const whyUs = [
  {
    icon: Star,
    title: "Premium Quality",
    desc: "Only the finest materials for lasting impressions.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    desc: "On-time delivery for every order, every time.",
  },
  {
    icon: Users,
    title: "Experienced Team",
    desc: "Skilled craftsmen with years of expertise.",
  },
  {
    icon: ThumbsUp,
    title: "Customer Satisfaction",
    desc: "Your satisfaction is our top priority.",
  },
  {
    icon: Gift,
    title: "Creative Designs",
    desc: "Fully customized to match your vision.",
  },
  {
    icon: Shield,
    title: "Affordable Pricing",
    desc: "Premium quality at competitive prices.",
  },
  {
    icon: Cpu,
    title: "Modern Equipment",
    desc: "State-of-the-art laser and printing technology.",
  },
  {
    icon: CheckCircle,
    title: "Professional Service",
    desc: "End-to-end support from design to delivery.",
  },
];

export function WhyChooseUs() {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 text-sm sm:grid-cols-2 lg:grid-cols-4 gap-5"
    >
      {whyUs.map((w, i) => {
        const Icon = w.icon;
        return (
          <div
            key={w.title}
            className="fade-in group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
              background: "white",
              border: "1px solid rgba(37,99,235,0.08)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
              transitionDelay: `${i * 70}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(24px)",
              transition: `opacity 0.5s ease ${i * 70}ms, transform 0.5s ease ${i * 70}ms, box-shadow 0.3s ease, translate 0.3s ease`,
            }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
              }}
            >
              <Icon size={20} style={{ color: "#2563EB" }} />
            </div>
            <h4
              className="card-title font-bold text-gray-800 mb-1.5 text-sm"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {w.title}
            </h4>
            <p className="card-desc text-xs text-gray-500 leading-relaxed">
              {w.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── FEATURED PRODUCTS ─────────────────────────────────────────────────────────
export const PRODUCT_FILTER_CATS = [
  "All",
  "Crystal",
  "Trophies",
  "Plaques",
  "Medals",
  "Collection",
];

const PAGE_SIZE = 6;

export function FeaturedProducts() {
  const navigate = useNavigate();
  const { ref, visible } = useInView();
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered =
    activeFilter === "All"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.cat === activeFilter);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageProducts = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function handleFilterChange(cat: string) {
    setActiveFilter(cat);
    setPage(1);
  }

  function handlePageChange(next: number) {
    setPage(next);
  }

  return (
    <div ref={ref}>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {PRODUCT_FILTER_CATS.map((cat) => {
          const active = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => handleFilterChange(cat)}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                background: active
                  ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                  : "white",
                color: active ? "#ffffff" : "#374151",
                border: active
                  ? "none"
                  : "1.5px solid rgba(0,0,0,0.10)",
                boxShadow: active
                  ? "0 4px 14px rgba(37,99,235,0.35)"
                  : "0 1px 4px rgba(0,0,0,0.06)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product grid — 3 columns × 2 rows = 6 per page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageProducts.map((p, i) => (
          <div
            key={p.id}
            className="group rounded-2xl overflow-hidden cursor-pointer"
            onClick={() => navigate(`/products/${p.id}`)}
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(28px)",
              transition: `opacity 0.6s ease ${i * 60}ms, transform 0.6s ease ${i * 60}ms`,
            }}
          >
            <div
              className="relative h-52 overflow-hidden"
              style={{ background: "#F8FAFC" }}
            >
              <ImageWithFallback
                src={p.img}
                alt={p.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span
                className="tag-pill absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(34,197,94,0.9)",
                  color: "#fff",
                }}
              >
                {p.cat}
              </span>
              {p.tags[0] && (
                <span
                  className="tag-pill absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(212,175,55,0.92)",
                    color: "#1F2937",
                  }}
                >
                  {p.tags[0]}
                </span>
              )}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "rgba(37,99,235,0.75)" }}
              >
                <span
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white border-2 border-white/60"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  View Details →
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3
                className="card-title font-bold text-gray-800 mb-1.5"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {p.name}
              </h3>
              <p className="card-desc text-sm text-gray-500 leading-relaxed">
                {p.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">
          No products in this category yet.
        </div>
      )}

      {/* Pagination — only appears when there is more than one page */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          {/* Prev arrow */}
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background:
                page === 1
                  ? "#F1F5F9"
                  : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              boxShadow:
                page === 1
                  ? "none"
                  : "0 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            <ChevronLeft
              size={18}
              className={
                page === 1 ? "text-gray-400" : "text-white"
              }
            />
          </button>

          {/* Page number dots */}
          <div className="flex items-center gap-2">
            {Array.from(
              { length: totalPages },
              (_, i) => i + 1,
            ).map((pg) => (
              <button
                key={pg}
                onClick={() => handlePageChange(pg)}
                className="w-9 h-9 rounded-full text-sm font-semibold transition-all"
                style={{
                  background:
                    pg === page
                      ? "linear-gradient(135deg, #D4AF37, #B8960C)"
                      : "white",
                  color: pg === page ? "#1F2937" : "#6B7280",
                  border:
                    pg === page
                      ? "none"
                      : "1.5px solid rgba(0,0,0,0.10)",
                  boxShadow:
                    pg === page
                      ? "0 4px 12px rgba(212,175,55,0.40)"
                      : "none",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {pg}
              </button>
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background:
                page === totalPages
                  ? "#F1F5F9"
                  : "linear-gradient(135deg, #2563EB, #1D4ED8)",
              boxShadow:
                page === totalPages
                  ? "none"
                  : "0 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            <ChevronRight
              size={18}
              className={
                page === totalPages
                  ? "text-gray-400"
                  : "text-white"
              }
            />
          </button>
        </div>
      )}
    </div>
  );
}

// ── TESTIMONIALS ──────────────────────────────────────────────────────────────
export const testimonials = [
  {
    name: "Ramesh Sharma",
    company: "Pokhara Academy",
    text: "Crystal Digital delivered outstanding trophies for our annual sports day. The quality was beyond expectations and delivery was on time!",
    rating: 5,
  },
  {
    name: "Sunita Gurung",
    company: "Annapurna Hotels",
    text: "We ordered custom crystal awards for our employee recognition ceremony. Beautifully crafted and professionally packaged. Highly recommend!",
    rating: 5,
  },
  {
    name: "Bikash Thapa",
    company: "Gandaki Province Office",
    text: "Excellent service for our government felicitation event. The wooden plaques and laser engraving were top-notch. Will definitely order again.",
    rating: 5,
  },
];

export function Testimonials() {
  const [tidx, setTidx] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setTidx((i) => (i + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);
  const t = testimonials[tidx];
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        key={tidx}
        className="testimonial-card p-8 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: t.rating }).map((_, i) => (
            <Star
              key={i}
              size={18}
              className="fill-current"
              style={{ color: "#D4AF37" }}
            />
          ))}
        </div>
        <p className="text-white/90 text-base leading-relaxed mb-6 italic">
          "{t.text}"
        </p>
        <div>
          <div
            className="font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            {t.name}
          </div>
          <div className="text-blue-200 text-sm">
            {t.company}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setTidx(i)}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background:
                i === tidx
                  ? "#D4AF37"
                  : "rgba(255,255,255,0.35)",
              width: i === tidx ? "20px" : "8px",
            }}
          />
        ))}
      </div>
    </div>
  );
}



// ── QUOTE MODAL ───────────────────────────────────────────────────────────────
export function QuoteModal({
  product,
  initialSize,
  onClose,
}: {
  product: Product;
  initialSize?: string;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [fileName, setFileName] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    quantity: "",
    engrave: "",
    size: initialSize || "",
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    try {
      await fetch("https://formsubmit.co/ajax/anmolankit00@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Quote Request — ${product.name} | Crystal Digital`,
          Name: form.name,
          Email: form.email || "Not provided",
          Phone: form.phone,
          Product: product.name,
          Category: product.cat,
          Selected_Size: form.size || "Not specified",
          Quantity: form.quantity || "Not specified",
          Engraving_Text: form.engrave || "None",
          Attached_File: fileName || "No file attached",
          _template: "table",
        }),
      });
      setSent(true);
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(7,11,22,0.88)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{
          background: "white",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <X size={15} className="text-gray-500" />
        </button>

        {sent ? (
          /* ── Confirmation screen ── */
          <div className="flex flex-col items-center justify-center text-center px-8 py-14">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #22C55E, #16A34A)",
              }}
            >
              <CheckCircle size={38} className="text-white" />
            </div>
            <h2
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Quote Request Sent!
            </h2>
            <p className="text-gray-500 text-sm mb-1 leading-relaxed">
              Thank you for your interest in the
            </p>
            <p
              className="font-bold mb-4"
              style={{
                color: "#2563EB",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {product.name}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
              Our team will review your request and contact you
              within 24 hours to confirm details and pricing.
            </p>
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-8 w-full"
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
              }}
            >
              <Phone size={15} style={{ color: "#16A34A" }} />
              <span className="text-sm text-green-800 font-medium">
                061-523459 / 9856012712
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, #2563EB, #1D4ED8)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Back to {product.name}
            </button>
          </div>
        ) : (
          /* ── Quote form ── */
          <>
            {/* Modal header — product context */}
            <div
              className="relative overflow-hidden rounded-t-3xl px-6 pt-7 pb-5"
              style={{
                background:
                  "linear-gradient(135deg, #0F172A, #1E3A8A)",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#D4AF37 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
                  style={{
                    border: "2px solid rgba(212,175,55,0.4)",
                  }}
                >
                  <ImageWithFallback
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: "#D4AF37" }}
                  >
                    Requesting Quote For
                  </p>
                  <h3
                    className="text-lg font-bold text-white leading-tight"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {product.name}
                  </h3>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(34,197,94,0.2)",
                      color: "#4ADE80",
                      border: "1px solid rgba(74,222,128,0.3)",
                    }}
                  >
                    {product.cat}
                  </span>
                </div>
              </div>
            </div>

            {/* Form body */}
            <form
              onSubmit={handleSubmit}
              className="px-6 py-6 flex flex-col gap-4"
            >
              <p className="text-xs text-gray-400 -mt-1">
                Fields marked{" "}
                <span style={{ color: "#DC2626" }}>*</span> are
                required.
              </p>

              {/* Selected size display */}
              {form.size && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2563EB" }}>
                    Selected Size
                  </span>
                  <span
                    className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
                  >
                    {form.size}
                  </span>
                </div>
              )}

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Phone{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="98XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
              </div>

              {/* Email + Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Quantity{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Logo / Image Upload
                </label>
                <label
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px dashed #CBD5E1",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.border =
                      "1.5px dashed #2563EB")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.border =
                      "1.5px dashed #CBD5E1")
                  }
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                    }}
                  >
                    <Send
                      size={14}
                      style={{
                        color: "#2563EB",
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {fileName ||
                        "Click to upload logo or image"}
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, SVG · Max 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              </div>

              {/* Text to engrave */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Text to Engrave / Special Instructions
                </label>
                <textarea
                  value={form.engrave}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      engrave: e.target.value,
                    })
                  }
                  placeholder={`e.g. "Presented to Ramesh Sharma for Outstanding Achievement — 2026" or describe your design...`}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                  }}
                  onFocus={(e) =>
                    (e.target.style.border =
                      "1.5px solid #2563EB")
                  }
                  onBlur={(e) =>
                    (e.target.style.border =
                      "1.5px solid #E2E8F0")
                  }
                />
              </div>

              {/* Submit */}
              {sendError && (
                <p className="text-center text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                  Failed to send — please try again or contact us directly on WhatsApp.
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  fontFamily: "Poppins, sans-serif",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
                }}
              >
                <Send size={15} />
                {sending ? "Sending…" : "Submit Quote Request"}
              </button>

              <p className="text-center text-xs text-gray-400">
                We'll respond within 24 hours · Free consultation
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────────────────

export function HomePage() {
  const navigate = useNavigate();

  const goToGallery = () => {
    navigate("/gallery");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToQuote = () => {
    const el = document.getElementById("premium-products");

    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    navigate("/contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <HeroCarousel onQuote={goToQuote} onGallery={goToGallery} />

      <Section bg="#F8FAFC">
        <SectionLabel>What We Do</SectionLabel>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
          <SectionHeading>Our Services</SectionHeading>

          <p className="max-w-xl text-sm leading-relaxed text-gray-500">
            From premium awards and trophies to precision engraving and digital
            printing, we create customized products for every milestone and
            occasion.
          </p>
        </div>

        <ServicesGrid />
      </Section>

      <Section bg="white" id="premium-products">
        <SectionLabel>Featured Collection</SectionLabel>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
          <SectionHeading>Premium Awards & Products</SectionHeading>

          <button
            onClick={goToGallery}
            className="self-start lg:self-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            View Full Gallery →
          </button>
        </div>

        <FeaturedProducts />
      </Section>

      <Section bg="#0F172A">
        <div className="text-center mb-10">
          <SectionLabel>Why Crystal Digital</SectionLabel>

          <SectionHeading light>
            Built Around Quality & Service
          </SectionHeading>

          <p className="max-w-2xl mx-auto mt-4 text-sm leading-relaxed text-blue-100">
            Quality materials, modern equipment, creative design, and dependable
            service come together to make every order memorable.
          </p>
        </div>

        <WhyChooseUs />
      </Section>

      {/* FIXED: removed the extra } */}
      <Section bg="linear-gradient(135deg, #1E3A8A, #2563EB)">
        <div className="text-center mb-8">
          <SectionLabel>Customer Stories</SectionLabel>

          <SectionHeading light>
            What Our Customers Say
          </SectionHeading>
        </div>

        <Testimonials />
      </Section>

      <Section bg="#F8FAFC">
        <div
          className="relative overflow-hidden rounded-3xl p-8 lg:p-14 text-center"
          style={{
            background: "linear-gradient(135deg, #1F2937, #374151)",
          }}
        >
          <div className="relative">
            <SectionLabel>Ready to Create?</SectionLabel>

            <h2
              className="text-2xl lg:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Turn Your Idea Into a Memorable Award
            </h2>

            <p className="max-w-2xl mx-auto text-gray-300 text-sm lg:text-base leading-relaxed mb-7">
              Tell us what you need and our team will help with design,
              customization, pricing, and delivery.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/contact")}
                className="px-7 py-3.5 rounded-xl font-bold text-white transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                }}
              >
                Request a Quote
              </button>

              <button
                onClick={goToGallery}
                className="px-7 py-3.5 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
              >
                Explore Gallery
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── PRODUCT DETAIL PAGE ───────────────────────────────────────────────────────
export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const product = PRODUCTS.find((item) => item.id === productId);

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const { ref: specsRef, visible: specsVisible } =
    useInView(0.1);
  const { ref: customRef, visible: customVisible } =
    useInView(0.1);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-3xl font-bold text-gray-800 mb-3"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          The product you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/gallery")}
          className="px-5 py-3 rounded-xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <>
      {quoteOpen && (
        <QuoteModal
          product={product}
          initialSize={selectedSize}
          onClose={() => setQuoteOpen(false)}
        />
      )}

      <div
        style={{
          paddingTop: "80px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        {/* ── Breadcrumb strip ── */}
        <div
          style={{
            background: "#F8FAFC",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={12} />
              Home
            </button>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-xs text-gray-400">
              Products
            </span>
            <ChevronRight size={10} className="text-gray-300" />
            <span
              className="text-xs font-semibold"
              style={{ color: "#2563EB" }}
            >
              {product.name}
            </span>
          </div>
        </div>

        {/* ── Split: image | info ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left — sticky image */}
            <div className="lg:sticky lg:top-28 self-start">
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    color: "#16A34A",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  {product.cat}
                </span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(212,175,55,0.12)",
                      color: "#92720A",
                      border: "1px solid rgba(212,175,55,0.35)",
                    }}
                  >
                    ✦ {tag}
                  </span>
                ))}
              </div>

              <div
                className="relative rounded-3xl overflow-hidden group"
                style={{
                  background: "#EFF6FF",
                  border: "1px solid rgba(37,99,235,0.12)",
                  boxShadow:
                    "0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                  aspectRatio: "4/3",
                }}
              >
                <ImageWithFallback
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-24"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,23,42,0.55), transparent)",
                  }}
                />
                <div
                  className="absolute bottom-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(212,175,55,0.92)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Settings
                    size={11}
                    style={{ color: "#1F2937" }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#1F2937" }}
                  >
                    Fully Customizable
                  </span>
                </div>
              </div>
            </div>

            {/* Right — info */}
            <div>
              <h1
                className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3"
                style={{
                  color: "#1F2937",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-0.5 w-10 rounded"
                  style={{ background: "#D4AF37" }}
                />
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#D4AF37" }}
                >
                  Crystal Digital Art & Award House
                </span>
              </div>

              <p className="text-base leading-relaxed mb-8 text-gray-600">
                {product.fullDesc}
              </p>

              {/* Available Sizes */}
              {(PRODUCT_SIZES[product.id] || []).length > 0 && (
                <div
                  className="mb-8 p-5 rounded-2xl"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(37,99,235,0.08)",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#D4AF37" }}
                  >
                    Available Sizes
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Select a size to pre-fill your quote request.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(PRODUCT_SIZES[product.id] || []).map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSize(
                            size === selectedSize ? "" : size,
                          )
                        }
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background:
                            selectedSize === size
                              ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                              : "white",
                          color:
                            selectedSize === size ? "white" : "#374151",
                          border:
                            selectedSize === size
                              ? "none"
                              : "1.5px solid rgba(37,99,235,0.15)",
                          boxShadow:
                            selectedSize === size
                              ? "0 4px 14px rgba(37,99,235,0.30)"
                              : "0 1px 4px rgba(0,0,0,0.05)",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize ? (
                    <p
                      className="text-xs font-semibold mt-3"
                      style={{ color: "#2563EB" }}
                    >
                      ✓ Selected: {selectedSize}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-3">
                      No size selected — you can specify in the quote
                      form.
                    </p>
                  )}
                </div>
              )}

              {/* Features card */}
              <div
                className="mb-8 p-5 rounded-2xl"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(37,99,235,0.08)",
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#D4AF37" }}
                >
                  Key Features
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {product.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        }}
                      >
                        <CheckCircle
                          size={9}
                          className="text-white"
                        />
                      </span>
                      <span className="text-sm leading-snug text-gray-600">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => setQuoteOpen(true)}
                  className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563EB, #1D4ED8)",
                    fontFamily: "Poppins, sans-serif",
                    boxShadow:
                      "0 8px 24px rgba(37,99,235,0.35)",
                  }}
                >
                  <Send size={15} />
                  Request a Quote
                </button>
                <button
                  onClick={() => navigate("/gallery")}
                  className="px-7 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: "white",
                    color: "#2563EB",
                    border: "2px solid #2563EB",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  View Gallery
                </button>
              </div>

              {/* Contact strip */}
              <div
                className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 rounded-xl"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {[
                  {
                    icon: Phone,
                    label: "061-523459",
                    color: "#2563EB",
                  },
                  {
                    icon: Clock,
                    label: "Mon–Sat  9AM–7PM",
                    color: "#D4AF37",
                  },
                  {
                    icon: MapPin,
                    label: "Pokhara, Nepal",
                    color: "#DC2626",
                  },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                  >
                    <Icon size={13} style={{ color }} />
                    <span className="text-xs font-medium text-gray-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Specifications ── */}
        <div
          style={{
            background: "#F8FAFC",
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-4 mb-10">
              <div
                className="h-px flex-1"
                style={{ background: "rgba(0,0,0,0.08)" }}
              />
              <div className="text-center">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#D4AF37" }}
                >
                  Technical Details
                </p>
                <h2
                  className="text-2xl font-bold text-gray-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Specifications
                </h2>
              </div>
              <div
                className="h-px flex-1"
                style={{ background: "rgba(0,0,0,0.08)" }}
              />
            </div>
            <div
              ref={specsRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {product.specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className="p-5 rounded-2xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(37,99,235,0.08)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    opacity: specsVisible ? 1 : 0,
                    transform: specsVisible
                      ? "none"
                      : "translateY(16px)",
                    transition: `opacity 0.5s ease ${i * 55}ms, transform 0.5s ease ${i * 55}ms`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "#D4AF37" }}
                  >
                    {spec.label}
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-snug">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Customization — Royal Blue gradient matches site testimonials ── */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #1D4ED8 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(#D4AF37 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              <div className="lg:col-span-2">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#D4AF37" }}
                >
                  Personalize It
                </p>
                <h2
                  className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-white"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  What Can Be Customized?
                </h2>
                <p className="text-sm leading-relaxed mb-6 text-blue-100">
                  Every piece is built to order. Share your
                  vision — text, logo, size, occasion — and
                  we'll craft it with precision.
                </p>
                <button
                  onClick={() => setQuoteOpen(true)}
                  className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4AF37, #B8960C)",
                    color: "#1F2937",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Start Your Order
                </button>
              </div>
              <div
                ref={customRef}
                className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {product.customizable.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      border:
                        "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      opacity: customVisible ? 1 : 0,
                      transform: customVisible
                        ? "none"
                        : "translateX(12px)",
                      transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`,
                    }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: "rgba(212,175,55,0.25)",
                        color: "#D4AF37",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white/90">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div style={{ background: "#F8FAFC" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div
              className="relative text-center py-14 px-6 rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #1F2937, #374151)",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#D4AF37 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
                  style={{
                    background: "rgba(212,175,55,0.15)",
                    color: "#D4AF37",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  ✦ Ready to Order
                </div>
                <h2
                  className="text-2xl lg:text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Interested in the {product.name}?
                </h2>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto text-base">
                  Contact us for pricing, customization options,
                  and delivery. Free consultation always
                  available.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className="px-8 py-4 rounded-xl font-bold text-gray-900 transition-all hover:scale-105 hover:shadow-xl shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4AF37, #B8960C)",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    Get a Free Quote
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all flex items-center gap-2"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    <ArrowLeft size={16} />
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── ABOUT PAGE ────────────────────────────────────────────────────────────────
export function StatCounter({
  target,
  label,
  suffix = "+",
}: {
  target: number;
  label: string;
  suffix?: string;
}) {
  const { ref, visible } = useInView(0.3);
  const count = useCounter(target, visible);
  return (
    <div ref={ref} className="text-center">
      <div
        className="stat-number text-4xl font-bold mb-1"
        style={{
          color: "#D4AF37",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {count}
        {suffix}
      </div>
      <div className="text-sm text-blue-100 font-medium">
        {label}
      </div>
    </div>
  );
}

export function AboutPage() {
  const { ref: r1, visible: v1 } = useInView();
  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Hero banner */}
      <div className="relative h-64 overflow-hidden">
        <ImageWithFallback
          src={img6}
          alt="Crystal Digital store"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(37,99,235,0.6))",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#D4AF37" }}
            >
              About Us
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Our Story
            </h1>
          </div>
        </div>
      </div>

      {/* Story */}
      <Section bg="white">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div
            ref={r1}
            style={{
              opacity: v1 ? 1 : 0,
              transform: v1 ? "none" : "translateX(-30px)",
              transition: "all 0.7s ease",
            }}
          >
            <SectionLabel>Who We Are</SectionLabel>
            <SectionHeading>
              Crystal Digital Art & Award House
            </SectionHeading>
            <p className="text-gray-500 mt-5 mb-5 leading-relaxed text-base">
              Established in the heart of Pokhara, Crystal
              Digital Art & Award House has grown into the
              region's most trusted provider of customized
              awards, trophies, plaques, digital printing, and
              branding solutions. We serve schools,
              corporations, sports organizations, government
              bodies, and individuals across Nepal.
            </p>
            <p className="text-gray-500 mb-5 leading-relaxed text-base">
              Our state-of-the-art laser engraving and digital
              printing equipment, combined with our team's
              creative expertise, enables us to craft
              award-winning products that leave lasting
              impressions.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                {
                  title: "Our Mission",
                  desc: "To deliver premium, personalized awards and printing solutions that celebrate achievements with elegance and precision.",
                },
                {
                  title: "Our Vision",
                  desc: "To be Nepal's leading award and digital craft company, known for quality, creativity, and exceptional customer care.",
                },
                {
                  title: "Core Values",
                  desc: "Quality, Creativity, Integrity, Innovation, and Customer Satisfaction guide everything we do.",
                },
                {
                  title: "Our Commitment",
                  desc: "On-time delivery, competitive pricing, and lifetime quality guarantee on all our products.",
                },
              ].map((v) => (
                <div
                  key={v.title}
                  className="p-4 rounded-xl"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(37,99,235,0.08)",
                  }}
                >
                  <h4
                    className="font-bold text-gray-800 text-sm mb-1.5"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {v.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div
              className="rounded-2xl overflow-hidden h-60 shadow-lg"
              style={{ background: "#EFF6FF" }}
            >
              <ImageWithFallback
                src={img7}
                alt="Award store collection"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="rounded-2xl overflow-hidden h-60 shadow-lg mt-8"
              style={{ background: "#EFF6FF" }}
            >
              <ImageWithFallback
                src={img8}
                alt="Trophy collection"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Stats */}
      <section
        className="py-16"
        style={{
          background:
            "linear-gradient(135deg, #1E3A8A, #2563EB)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCounter
              target={10}
              label="Years of Experience"
            />
            <StatCounter
              target={5000}
              label="Happy Customers"
            />
            <StatCounter
              target={12000}
              label="Completed Projects"
            />
            <StatCounter target={800} label="Custom Designs" />
          </div>
        </div>
      </section>

      {/* Map */}
      <Section bg="#F8FAFC">
        <div className="text-center mb-10">
          <SectionLabel>Find Us</SectionLabel>
          <SectionHeading>Our Location</SectionHeading>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div
            className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg"
            style={{ height: "380px" }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.8!2d83.988759!3d28.2206565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995944e9985132f%3A0x135f56a80ed54d24!2sCrystal%20Digital%20Art%20%26%20Craft!5e0!3m2!1sen!2snp!4v1720000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Crystal Digital Art & Award House location"
            />
          </div>
          <div className="flex flex-col gap-4">
            {[
              {
                icon: MapPin,
                label: "Address",
                val: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
              },
              {
                icon: Phone,
                label: "Phone",
                val: "061-523459 / 9856012712",
              },
              {
                icon: Mail,
                label: "Email",
                val: "globallinksks@gmail.com",
              },
              {
                icon: Clock,
                label: "Business Hours",
                val: "Mon–Sat: 9:00 AM – 7:00 PM",
              },
            ].map((info) => {
              const Icon = info.icon;
              return (
                <div
                  key={info.label}
                  className="flex gap-4 p-4 rounded-xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF6FF" }}
                  >
                    <Icon
                      size={18}
                      style={{ color: "#2563EB" }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium">
                      {info.label}
                    </div>
                    <div className="text-sm text-gray-700 font-medium leading-snug">
                      {info.val}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── GALLERY PAGE ──────────────────────────────────────────────────────────────
const galleryItems = [
  {
    img: img2,
    cat: "Crystal Awards",
    label: "Token of Appreciation Award",
    linkedProductId: "crystal-award",
  },
  {
    img: img1,
    cat: "Plaques",
    label: "Wooden Plaque with Gold Frame",
    linkedProductId: "wooden-plaque",
  },
  {
    img: img4,
    cat: "Trophies",
    label: "Gold Sports Trophy",
    linkedProductId: "gold-trophy",
  },
  {
    img: img5,
    cat: "Trophies",
    label: "Cultural Temple Trophy",
    linkedProductId: "cultural-trophy",
  },
  {
    img: img3,
    cat: "Medals",
    label: "Sports Medal Set",
    linkedProductId: "sports-medals",
  },
  {
    img: img6,
    cat: "Collection",
    label: "Full Award Collection Display",
    linkedProductId: "award-collection",
  },
  {
    img: img7,
    cat: "Collection",
    label: "Awards & Trophies Showcase",
  },
  {
    img: img8,
    cat: "Collection",
    label: "Trophy & Plaque Inventory",
  },
  {
    img: img9,
    cat: "Collection",
    label: "Store Interior — Award Shelf Display",
    // no linkedProductId: store/event photo — clicking will NOT show "Open Product Page"
  },
];

const cats = [
  "All",
  "Crystal Awards",
  "Trophies",
  "Plaques",
  "Medals",
  "Collection",
];

export function GalleryPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [lightbox, setLightbox] = useState<
    null | (typeof galleryItems)[0]
  >(null);
  const filtered =
    filter === "All"
      ? galleryItems
      : galleryItems.filter((i) => i.cat === filter);

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={img6}
          alt="Gallery banner"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(37,99,235,0.6))",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#D4AF37" }}
            >
              Our Work
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Gallery
            </h1>
          </div>
        </div>
      </div>

      <Section bg="white">
        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className="px-5 py-2 rounded-full text-sm font-semibold transition-all"
              style={{
                background:
                  filter === c
                    ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                    : "white",
                color: filter === c ? "white" : "#374151",
                border:
                  filter === c
                    ? "none"
                    : "1px solid rgba(0,0,0,0.1)",
                boxShadow:
                  filter === c
                    ? "0 4px 14px rgba(37,99,235,0.3)"
                    : "0 1px 4px rgba(0,0,0,0.04)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "#F8FAFC",
                aspectRatio: "4/3",
              }}
              onClick={() => setLightbox(item)}
            >
              <ImageWithFallback
                src={item.img}
                alt={item.label}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4"
                style={{
                  background:
                    "linear-gradient(to top, rgba(15,23,42,0.85), transparent)",
                }}
              >
                <span
                  className="tag-pill text-xs font-bold tracking-wide mb-1"
                  style={{ color: "#D4AF37" }}
                >
                  {item.cat}
                </span>
                <span className="card-title text-sm font-semibold text-white">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
          }}
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ImageWithFallback
              src={lightbox.img}
              alt={lightbox.label}
              className="w-full object-cover max-h-[70vh]"
            />
            <div className="p-5 bg-white">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                {lightbox.cat}
              </div>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div
                  className="font-bold text-gray-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {lightbox.label}
                </div>
                {lightbox.linkedProductId &&
                  (() => {
                    const linked = PRODUCTS.find(
                      (p) => p.id === lightbox.linkedProductId,
                    );
                    return linked ? (
                      <button
                        onClick={() => {
                          setLightbox(null);
                          navigate(`/products/${linked.id}`);
                        }}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-md active:scale-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #2563EB, #1D4ED8)",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        Open Product Page →
                      </button>
                    ) : null;
                  })()}
              </div>
            </div>
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CONTACT PAGE ──────────────────────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const services_list = [
    "Crystal Awards",
    "Corporate Trophies",
    "Acrylic Awards",
    "Wooden Plaques",
    "Medal & Certificate",
    "Name Plates",
    "Sign Boards",
    "Laser Engraving",
    "Digital Printing",
    "Customized Gifts",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    try {
      await fetch(
        "https://formsubmit.co/ajax/anmolankit00@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject:
              "New Contact Message — Crystal Digital Art & Award House",
            Name: form.name,
            Email: form.email,
            Phone: form.phone,
            Service_Enquiry: form.service || "Not specified",
            Message: form.message,
            _template: "table",
          }),
        },
      );
      setSent(true);
      setTimeout(() => setSent(false), 5000);
      setForm({
        name: "",
        phone: "",
        email: "",
        service: "",
        message: "",
      });
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={img8}
          alt="Contact banner"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.85), rgba(37,99,235,0.6))",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <div
              className="text-xs font-bold tracking-widest uppercase mb-3"
              style={{ color: "#D4AF37" }}
            >
              Reach Out
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      <Section bg="#F8FAFC">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <SectionLabel>Get In Touch</SectionLabel>
              <SectionHeading>
                We'd Love to Hear From You
              </SectionHeading>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Visit our store or contact us to discuss your
                custom award, trophy, or printing requirements.
              </p>
            </div>
            {[
              {
                icon: MapPin,
                label: "Address",
                val: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
              },
              {
                icon: Phone,
                label: "Phone",
                val: "061-523459 / 9856012712",
              },
              {
                icon: Mail,
                label: "Email",
                val: "globallinksks@gmail.com",
              },
              {
                icon: Clock,
                label: "Hours",
                val: "Monday – Saturday: 9:00 AM – 7:00 PM",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="flex gap-4 p-4 rounded-xl items-start"
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: "#2563EB" }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium">
                      {c.label}
                    </div>
                    <div className="text-sm text-gray-700 font-medium leading-snug">
                      {c.val}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* WhatsApp CTA */}
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/9779856012712",
                  "_blank",
                )
              }
              className="mt-2 w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]"
              style={{
                background:
                  "linear-gradient(135deg, #25D366, #128C7E)",
                boxShadow: "0 4px 18px rgba(37,211,102,0.35)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </button>

            {/* Social icons */}
            <div className="flex gap-3 mt-3">
              {[
                {
                  icon: Facebook,
                  label: "Facebook",
                  color: "#1877F2",
                  href: "https://www.facebook.com/crystaldigital12712/",
                },
                {
                  icon: Instagram,
                  label: "Instagram",
                  color: "#E1306C",
                  href: null,
                },
                {
                  icon: MapPin,
                  label: "Google Maps",
                  color: "#EA4335",
                  href: "https://www.google.com/maps/search/Crystal+Digital+Art+%26+Award+House+Pokhara+Nepal",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    title={s.label}
                    onClick={() =>
                      s.href && window.open(s.href, "_blank")
                    }
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-md"
                    style={{
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}30`,
                      cursor: s.href ? "pointer" : "default",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: s.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div
            className="lg:col-span-3 p-8 rounded-2xl"
            style={{
              background: "white",
              boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              className="text-xl font-bold text-gray-800 mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Send Us a Message
            </h3>
            {sent && (
              <div
                className="mb-5 px-5 py-4 rounded-xl flex items-center gap-3"
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #6EE7B7",
                }}
              >
                <CheckCircle
                  size={18}
                  style={{ color: "#10B981" }}
                />
                <span className="text-sm font-medium text-green-800">
                  Your message has been sent! We'll contact you
                  soon.
                </span>
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="061-XXXXXX or 98XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Service (Optional)
                </label>
                <div className="relative">
                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        service: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400 appearance-none"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <option value="">Select a service</option>
                    {services_list.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                  placeholder="Tell us about your requirement — quantity, occasion, customization details..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400 resize-none"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                />
              </div>
              {sendError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  Failed to send — please try again or reach us
                  on WhatsApp directly.
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                <Send size={16} />
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div
          className="mt-10 rounded-2xl overflow-hidden shadow-lg"
          style={{ height: "360px" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.8!2d83.988759!3d28.2206565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995944e9985132f%3A0x135f56a80ed54d24!2sCrystal%20Digital%20Art%20%26%20Craft!5e0!3m2!1sen!2snp!4v1720000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Crystal Digital Art & Award House map"
          />
        </div>
      </Section>
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
export function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "ok" | "dup" | "err">("idle");

  function handleSubscribe() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubState("err");
      return;
    }
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("cdaah_subscribers") || "[]");
      if (existing.includes(trimmed)) {
        setSubState("dup");
        return;
      }
      localStorage.setItem("cdaah_subscribers", JSON.stringify([...existing, trimmed]));
      setSubState("ok");
      setEmail("");
    } catch {
      setSubState("err");
    }
  }
  return (
    <footer style={{ background: "#0F172A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-800">
                <ImageWithFallback
                  src={logo}
                  alt="Crystal Digital logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div
                  className="text-sm font-bold text-blue-400"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  CRYSTAL DIGITAL
                </div>
                <div className="text-xs font-semibold tracking-widest text-[#0dcb00]">
                  ART & AWARD HOUSE
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Pokhara's trusted destination for premium awards,
              trophies, laser engraving, and digital printing
              services.
            </p>
            <div className="flex gap-3">
              {[
                {
                  icon: Facebook,
                  color: "#1877F2",
                  href: "https://www.facebook.com/crystaldigital12712/",
                },
                {
                  icon: Instagram,
                  color: "#E1306C",
                  href: null,
                },
                {
                  icon: MessageCircle,
                  color: "#25D366",
                  href: "https://wa.me/9779856012712",
                },
                {
                  icon: MapPin,
                  color: "#EA4335",
                  href: "https://www.google.com/maps/search/Crystal+Digital+Art+%26+Award+House+Pokhara+Nepal",
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      s.href && window.open(s.href, "_blank")
                    }
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: `${s.color}20`,
                      border: `1px solid ${s.color}30`,
                      cursor: s.href ? "pointer" : "default",
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: s.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Gallery", path: "/gallery" },
                { label: "Contact", path: "/contact" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-left text-gray-400 text-sm hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Services
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                "Crystal Awards",
                "Corporate Trophies",
                "Laser Engraving",
                "Digital Printing",
                "Wooden Plaques",
                "Customized Gifts",
              ].map((s) => (
                <span key={s} className="text-gray-400 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Subscribe for updates and special offers.
            </p>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
              <button
                onClick={handleSubscribe}
                className="px-3 py-2.5 rounded-xl transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
            {subState === "ok" && (
              <p className="text-green-400 text-xs mt-2">Subscribed! You'll receive product updates.</p>
            )}
            {subState === "dup" && (
              <p className="text-yellow-400 text-xs mt-2">This email is already subscribed.</p>
            )}
            {subState === "err" && (
              <p className="text-red-400 text-xs mt-2">Please enter a valid email address.</p>
            )}
            <div className="mt-5 flex items-start gap-2.5">
              <MapPin
                size={14}
                className="text-blue-400 mt-0.5 flex-shrink-0"
              />
              <span className="text-gray-400 text-xs leading-relaxed">
                Darbarthok Marga 1, Samsung Galli, Pokhara
                33700, Nepal
              </span>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © 2026 POCOMAT DEVINEERS — All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-xs">
              Crystal Digital Art & Award House, Pokhara, Nepal
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-400 text-xs hover:text-gray-600 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── BACK TO TOP ───────────────────────────────────────────────────────────────
export function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const handler = () => setShow(window.scrollY > 400);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return show ? (
    <button
      onClick={() =>
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
      className="fixed bottom-6 right-6 w-11 h-11 rounded-full flex items-center justify-center z-40 shadow-xl transition-all hover:scale-110"
      style={{
        background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
      }}
    >
      <ArrowUp size={18} className="text-white" />
    </button>
  ) : null;
}

// ── MAIN SITE ────────────────────────────────────────────────────────────────
// Kept as a compatibility export for the existing App.tsx root route.
export function MainSite() {
  return <HomePage />;
}

export default MainSite;
