import { useNavigate } from "react-router-dom";
import { Product } from "../../../types/Product";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { cdn } from "../../../utils/api";
import { catLabel } from "../../../utils/categories";
import { priceLabel } from "../../../utils/price";

// One product tile, shared by the home "Featured Collection" and the /products
// listing so the two can never drift. `visible`/`index` drive the entrance
// animation from the section's useInView; the image is lazy-loaded because a
// listing can hold many cards at once.
export function ProductCard({
  product,
  index = 0,
  visible = true,
}: {
  product: Product;
  index?: number;
  visible?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="group rounded-2xl overflow-hidden cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(28px)",
        transition: `opacity 0.6s ease ${index * 60}ms, transform 0.6s ease ${index * 60}ms`,
      }}
    >
      <div className="relative h-52 overflow-hidden" style={{ background: "#F8FAFC" }}>
        <ImageWithFallback
          src={cdn(product.img, 800)}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="tag-pill absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: "rgba(34,197,94,0.9)",
            color: "#fff",
          }}
        >
          {catLabel(product.cat)}
        </span>
        {product.tags[0] && (
          <span
            className="tag-pill absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{
              background: "rgba(212,175,55,0.92)",
              color: "#1F2937",
            }}
          >
            {product.tags[0]}
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
          {product.name}
        </h3>
        <p className="card-desc text-sm text-gray-500 leading-relaxed">
          {product.desc}
        </p>
        <p
          className="mt-3 text-sm font-bold"
          style={{ color: "#2563EB", fontFamily: "Poppins, sans-serif" }}
        >
          {priceLabel(product.price)}
        </p>
      </div>
    </div>
  );
}
