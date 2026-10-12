import { useState } from "react";
import { useSiteData } from "../../layout/siteDataProvider";
import {
  ALL_FILTER,
  categoryFilters,
  inCategory,
} from "../../../utils/categories";
import { useInView } from "../../../hooks/useInView";
import { ProductCard } from "../Product/productCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 6;

// Home section showing products from the DB: filter pills, a paged grid and a
// slider control; each card links to its /products/:slug page.
export function FeaturedProducts() {
  const { ref, visible } = useInView();
  const { products: PRODUCTS, categories, loading } = useSiteData();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);
  const [page, setPage] = useState(1);

  const filters = categoryFilters(
    categories,
    PRODUCTS.filter((p) => !p.cat).length
  );
  const filtered = PRODUCTS.filter((p) => inCategory(p.cat, activeFilter));

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
      {/* Filter pills — from the admin-managed category list */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {filters.map((cat) => {
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
      {loading ? (
        <p className="text-center text-sm text-gray-400 py-16">
          Loading products…
        </p>
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageProducts.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} visible={visible} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-700 text-base">
          No products in this category yet.
        </div>
      )}
        </>
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