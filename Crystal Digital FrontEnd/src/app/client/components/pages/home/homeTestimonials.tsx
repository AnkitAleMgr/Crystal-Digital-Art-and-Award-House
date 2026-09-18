import { Star } from "lucide-react";
import { useEffect, useState } from "react";

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