import img2 from "../../../../../imports/image-2.png";
import img3 from "../../../../../imports/image-3.png";
import img4 from "../../../../../imports/image-4.png";
import { useCallback, useEffect, useState } from "react";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { ChevronLeft, ChevronRight } from "lucide-react";

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