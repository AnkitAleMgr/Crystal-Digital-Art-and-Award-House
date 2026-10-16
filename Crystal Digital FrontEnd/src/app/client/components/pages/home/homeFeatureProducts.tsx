import { useState } from "react";
import { useSiteData } from "../../layout/siteDataProvider";
import {
  ALL_FILTER,
  categoryFilters,
  inCategory,
} from "../../../utils/categories";
import { useInView } from "../../../hooks/useInView";
import { ProductCard } from "../Product/productCard";
import { CategoryPills } from "../../ui/categoryPills";

const PAGE_SIZE = 6;

// Home section showing a capped teaser of products from the DB: category pills
// (collapsed when the list is long) and up to PAGE_SIZE cards of the selected
// category, each linking to its /products/:slug page. The full catalogue lives
// on /products (the section header's "View All Products" button) — this teaser
// deliberately does not paginate the whole collection, so it stays a fixed size
// no matter how many products exist.
export function FeaturedProducts() {
  const { ref, visible } = useInView();
  const { products: PRODUCTS, categories, loading } = useSiteData();
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const filters = categoryFilters(
    categories,
    PRODUCTS.filter((p) => !p.cat).length
  );
  const filtered = PRODUCTS.filter((p) => inCategory(p.cat, activeFilter));
  const shown = filtered.slice(0, PAGE_SIZE);

  return (
    <div ref={ref}>
      {/* Filter pills — from the admin-managed category list */}
      <CategoryPills
        filters={filters}
        active={activeFilter}
        onSelect={setActiveFilter}
        className="mb-10"
      />

      {/* Product grid — up to 6 cards, 3 columns × 2 rows */}
      {loading ? (
        <p className="text-center text-sm text-gray-400 py-16">
          Loading products…
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map((p, i) => (
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
    </div>
  );
}
