import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useSiteData } from "../../layout/siteDataProvider";

// Auto-rotating customer testimonial card, fed from the DB.
export function Testimonials() {
  const { testimonials, loading } = useSiteData();
  const [tidx, setTidx] = useState(0);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const id = setInterval(
      () => setTidx((i) => (i + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(id);
  }, [testimonials.length]);

  // The list can shrink (or arrive late) after the index was set, so clamp it.
  const active = tidx < testimonials.length ? tidx : 0;
  const t = testimonials[active];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-8">
        <p className="text-sm text-gray-400">Loading testimonials…</p>
      </div>
    );
  }

  if (!t) return null;
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