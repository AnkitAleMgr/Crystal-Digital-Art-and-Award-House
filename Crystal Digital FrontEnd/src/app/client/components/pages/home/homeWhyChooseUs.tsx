import { CheckCircle, Cpu, Gift, Shield, Star, ThumbsUp, Users, Zap } from "lucide-react";
import { useInView } from "../../../hooks/useInView";


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