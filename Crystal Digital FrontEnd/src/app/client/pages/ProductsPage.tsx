import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, PackageSearch, Search } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { useSiteData } from "../components/layout/siteDataProvider";
import { ProductCard } from "../components/pages/Product/productCard";
import { Section } from "../components/pages/home/homeSection";
import { CategoryPills } from "../components/ui/categoryPills";
import {
  ALL_FILTER,
  categoryFilters,
  inCategory,
} from "../utils/categories";
import { applyPageMeta } from "../utils/seo";
import { useInView } from "../hooks/useInView";
import banner from "../../../imports/image-6.webp";

const PAGE_SIZE = 12;

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "name-desc", label: "Name (Z–A)" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

// The full product catalogue: category pills, a search box, a sort control and
// a "Load more" button. Filter and sort live in the URL, so a filtered view is
// shareable and survives reload/back. Everything is filtered client-side from
// the one fetch the SiteDataProvider already made.
export function ProductsPage() {
  // SEO: per-route title/description replace the index.html defaults on mount.
  useEffect(() => {
    applyPageMeta({
      title: "Products | Crystal Digital — Crystal Awards, Trophies & Gifts",
      description:
        "Browse our full range of crystal awards, trophies, plaques, medals and engraved gifts — customisable, made to order at Crystal Digital Art & Award House, Nepal.",
    });
  }, []);

  const { products, categories, loading } = useSiteData();
  const [params, setParams] = useSearchParams();
  const { ref, visible } = useInView();

  const activeCat = params.get("cat") || ALL_FILTER;
  const sort = (params.get("sort") as SortValue) || "newest";
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  // Returning to the top of a freshly filtered list is expected; clicking
  // "Load more" keeps the scroll position on its own.
  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [activeCat, sort, query]);

  const filters = categoryFilters(
    categories,
    products.filter((p) => !p.cat).length
  );

  const searching = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    if (!inCategory(p.cat, activeCat)) return false;
    if (!searching) return true;
    return (
      p.name.toLowerCase().includes(searching) ||
      p.desc.toLowerCase().includes(searching)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  const visibleItems = sorted.slice(0, shown);
  const remaining = sorted.length - visibleItems.length;

  function setParam(key: string, value: string, clear = false) {
    const next = new URLSearchParams(params);
    if (clear) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Banner — a static local import, like the other page headers. */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={banner}
          alt="Products banner"
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
              Explore
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Our Products
            </h1>
          </div>
        </div>
      </div>

      <Section bg="white">
        {/* Category pills — the shared admin-managed list */}
        <CategoryPills
          filters={filters}
          active={activeCat}
          onSelect={(c) => setParam("cat", c, c === ALL_FILTER)}
          className="mb-8"
        />

        {/* Search + sort + result count */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <p className="text-sm text-gray-500 order-2 lg:order-1">
            {loading
              ? "Loading products…"
              : `${sorted.length} ${sorted.length === 1 ? "product" : "products"}`}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 order-1 lg:order-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setParam("sort", e.target.value, e.target.value === "newest")}
                aria-label="Sort products"
                className="w-full sm:w-auto appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div ref={ref}>
          {!loading && sorted.length === 0 ? (
            <div className="py-20 text-center">
              <PackageSearch size={40} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-sm">
                {query.trim()
                  ? `No products match “${query.trim()}”.`
                  : "No products in this category yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleItems.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} visible={visible} />
              ))}
            </div>
          )}

          {remaining > 0 && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-lg active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                Load More ({remaining} remaining)
              </button>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
