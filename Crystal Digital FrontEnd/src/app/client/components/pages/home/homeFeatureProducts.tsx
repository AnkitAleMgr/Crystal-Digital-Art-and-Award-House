import { useNavigate } from "react-router-dom";
import { PRODUCTS } from "../../../data/products";
import { useInView } from "../../../hooks/useInView";
import { useState } from "react";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { ChevronLeft, ChevronRight } from "lucide-react";

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