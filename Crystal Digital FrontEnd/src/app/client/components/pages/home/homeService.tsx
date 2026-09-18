import { useInView } from "../../../hooks/useInView";

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
