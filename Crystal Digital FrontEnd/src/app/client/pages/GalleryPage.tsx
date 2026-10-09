import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useSiteData } from "../components/layout/siteDataProvider";
import { cdn } from "../utils/api";
import {
  ALL_FILTER,
  catLabel,
  categoryFilters,
  inCategory,
} from "../utils/categories";
import { PublicGalleryItem } from "../types/Public";
import { applyPageMeta } from "../utils/seo";
import { Section } from "../components/pages/home/homeSection";
import { X } from "lucide-react";
import img7 from "../../../imports/image-7.webp";

// Gallery grid with category pills and a lightbox; items can link to a
// product's page via linkedProductId.
export function GalleryPage() {
  // SEO: per-route title/description replace the index.html defaults on mount.
  useEffect(() => {
    applyPageMeta({
      title: "Gallery | Crystal Digital — Crystal Awards, Trophies & Plaques",
      description:
        "Browse finished crystal awards, trophies, plaques and engraved gifts — every piece designed in-house and made to order at Crystal Digital Art & Award House.",
    });
  }, []);
  const navigate = useNavigate();
  const [filter, setFilter] = useState(ALL_FILTER);
  const [lightbox, setLightbox] = useState<PublicGalleryItem | null>(null);
  const { gallery: galleryItems, categories, products } = useSiteData();

  // Same shared category list as the home page — the admin manages one list for
  // products and gallery items, and this page used to keep a third hardcoded
  // copy of it that had already drifted from the admin's.
  const cats = categoryFilters(
    categories,
    galleryItems.filter((i) => !i.cat).length
  );
  const filtered = galleryItems.filter((i) => inCategory(i.cat, filter));

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Banner — a static local import, like the hero/about/contact headers.
          It used to come from the gallery collection so the admin could change
          it, but that meant an empty gallery rendered a blank banner. Decoration
          like this belongs in the code, not the database. */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={img7}
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
                src={cdn(item.img, 600)}
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
                  {catLabel(item.cat)}
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
              src={cdn(lightbox.img, 1200)}
              alt={lightbox.label}
              className="w-full object-cover max-h-[70vh]"
            />
            <div className="p-5 bg-white">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                {catLabel(lightbox.cat)}
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
                    const linked = products.find(
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