import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import img1 from "../../..//imports/image-1.png";
import img2 from "../../..//imports/image-2.png";
import img3 from "../../..//imports/image-3.png";
import img4 from "../../..//imports/image-4.png";
import img5 from "../../..//imports/image-5.png";
import img6 from "../../..//imports/image-6.png";
import img7 from "../../..//imports/image-7.png";
import img8 from "../../..//imports/image-8.png";
import img9 from "../../..//imports/image-9.png";
import { PRODUCTS } from "../data/products";
import { Section } from "../components/pages/home/homeSection";
import { X } from "lucide-react";

const cats = [
  "All",
  "Crystal Awards",
  "Trophies",
  "Plaques",
  "Medals",
  "Collection",
];

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