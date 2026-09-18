import { useNavigate, useParams } from "react-router-dom";
import { PRODUCTS} from "../../client/data/products";
import { PRODUCT_SIZES } from "../../client/data/productSize";
import { useInView } from "../../client/hooks/useInView";
import { QuoteModal } from "../../client/components/pages/Product/productQuoteModal";
import { useState } from "react";
import { ArrowLeft, CheckCircle, ChevronRight, Clock, MapPin, Phone, Send, Settings } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

// ── PRODUCT DETAIL PAGE ───────────────────────────────────────────────────────
export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();

  const product = PRODUCTS.find((item) => item.id === productId);

  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const { ref: specsRef, visible: specsVisible } =
    useInView(0.1);
  const { ref: customRef, visible: customVisible } =
    useInView(0.1);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="text-3xl font-bold text-gray-800 mb-3"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Product Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          The product you are looking for does not exist.
        </p>
        <button
          onClick={() => navigate("/gallery")}
          className="px-5 py-3 rounded-xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <>
      {quoteOpen && (
        <QuoteModal
          product={product}
          initialSize={selectedSize}
          onClose={() => setQuoteOpen(false)}
        />
      )}

      <div
        style={{
          paddingTop: "80px",
          background: "white",
          minHeight: "100vh",
        }}
      >
        {/* ── Breadcrumb strip ── */}
        <div
          style={{
            background: "#F8FAFC",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={12} />
              Home
            </button>
            <ChevronRight size={10} className="text-gray-300" />
            <span className="text-xs text-gray-400">
              Products
            </span>
            <ChevronRight size={10} className="text-gray-300" />
            <span
              className="text-xs font-semibold"
              style={{ color: "#2563EB" }}
            >
              {product.name}
            </span>
          </div>
        </div>

        {/* ── Split: image | info ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            {/* Left — sticky image */}
            <div className="lg:sticky lg:top-28 self-start">
              <div className="flex items-center gap-2 mb-5 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    color: "#16A34A",
                    border: "1px solid rgba(34,197,94,0.3)",
                  }}
                >
                  {product.cat}
                </span>
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(212,175,55,0.12)",
                      color: "#92720A",
                      border: "1px solid rgba(212,175,55,0.35)",
                    }}
                  >
                    ✦ {tag}
                  </span>
                ))}
              </div>

              <div
                className="relative rounded-3xl overflow-hidden group"
                style={{
                  background: "#EFF6FF",
                  border: "1px solid rgba(37,99,235,0.12)",
                  boxShadow:
                    "0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                  aspectRatio: "4/3",
                }}
              >
                <ImageWithFallback
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-24"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,23,42,0.55), transparent)",
                  }}
                />
                <div
                  className="absolute bottom-5 left-5 flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(212,175,55,0.92)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Settings
                    size={11}
                    style={{ color: "#1F2937" }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#1F2937" }}
                  >
                    Fully Customizable
                  </span>
                </div>
              </div>
            </div>

            {/* Right — info */}
            <div>
              <h1
                className="text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-3"
                style={{
                  color: "#1F2937",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="h-0.5 w-10 rounded"
                  style={{ background: "#D4AF37" }}
                />
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#D4AF37" }}
                >
                  Crystal Digital Art & Award House
                </span>
              </div>

              <p className="text-base leading-relaxed mb-8 text-gray-600">
                {product.fullDesc}
              </p>

              {/* Available Sizes */}
              {(PRODUCT_SIZES[product.id] || []).length > 0 && (
                <div
                  className="mb-8 p-5 rounded-2xl"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(37,99,235,0.08)",
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: "#D4AF37" }}
                  >
                    Available Sizes
                  </p>
                  <p className="text-xs text-gray-400 mb-4">
                    Select a size to pre-fill your quote request.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(PRODUCT_SIZES[product.id] || []).map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          setSelectedSize(
                            size === selectedSize ? "" : size,
                          )
                        }
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background:
                            selectedSize === size
                              ? "linear-gradient(135deg, #2563EB, #1D4ED8)"
                              : "white",
                          color:
                            selectedSize === size ? "white" : "#374151",
                          border:
                            selectedSize === size
                              ? "none"
                              : "1.5px solid rgba(37,99,235,0.15)",
                          boxShadow:
                            selectedSize === size
                              ? "0 4px 14px rgba(37,99,235,0.30)"
                              : "0 1px 4px rgba(0,0,0,0.05)",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize ? (
                    <p
                      className="text-xs font-semibold mt-3"
                      style={{ color: "#2563EB" }}
                    >
                      ✓ Selected: {selectedSize}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-3">
                      No size selected — you can specify in the quote
                      form.
                    </p>
                  )}
                </div>
              )}

              {/* Features card */}
              <div
                className="mb-8 p-5 rounded-2xl"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(37,99,235,0.08)",
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-4"
                  style={{ color: "#D4AF37" }}
                >
                  Key Features
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {product.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-start gap-2.5"
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #2563EB, #1D4ED8)",
                        }}
                      >
                        <CheckCircle
                          size={9}
                          className="text-white"
                        />
                      </span>
                      <span className="text-sm leading-snug text-gray-600">
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={() => setQuoteOpen(true)}
                  className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background:
                      "linear-gradient(135deg, #2563EB, #1D4ED8)",
                    fontFamily: "Poppins, sans-serif",
                    boxShadow:
                      "0 8px 24px rgba(37,99,235,0.35)",
                  }}
                >
                  <Send size={15} />
                  Request a Quote
                </button>
                <button
                  onClick={() => navigate("/gallery")}
                  className="px-7 py-4 rounded-2xl font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: "white",
                    color: "#2563EB",
                    border: "2px solid #2563EB",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  View Gallery
                </button>
              </div>

              {/* Contact strip */}
              <div
                className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 rounded-xl"
                style={{
                  background: "#F8FAFC",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {[
                  {
                    icon: Phone,
                    label: "061-523459",
                    color: "#2563EB",
                  },
                  {
                    icon: Clock,
                    label: "Mon–Sat  9AM–7PM",
                    color: "#D4AF37",
                  },
                  {
                    icon: MapPin,
                    label: "Pokhara, Nepal",
                    color: "#DC2626",
                  },
                ].map(({ icon: Icon, label, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2"
                  >
                    <Icon size={13} style={{ color }} />
                    <span className="text-xs font-medium text-gray-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Specifications ── */}
        <div
          style={{
            background: "#F8FAFC",
            borderTop: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center gap-4 mb-10">
              <div
                className="h-px flex-1"
                style={{ background: "rgba(0,0,0,0.08)" }}
              />
              <div className="text-center">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{ color: "#D4AF37" }}
                >
                  Technical Details
                </p>
                <h2
                  className="text-2xl font-bold text-gray-800"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Specifications
                </h2>
              </div>
              <div
                className="h-px flex-1"
                style={{ background: "rgba(0,0,0,0.08)" }}
              />
            </div>
            <div
              ref={specsRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {product.specs.map((spec, i) => (
                <div
                  key={spec.label}
                  className="p-5 rounded-2xl"
                  style={{
                    background: "white",
                    border: "1px solid rgba(37,99,235,0.08)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                    opacity: specsVisible ? 1 : 0,
                    transform: specsVisible
                      ? "none"
                      : "translateY(16px)",
                    transition: `opacity 0.5s ease ${i * 55}ms, transform 0.5s ease ${i * 55}ms`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-2"
                    style={{ color: "#D4AF37" }}
                  >
                    {spec.label}
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-snug">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Customization — Royal Blue gradient matches site testimonials ── */}
        <div
          className="relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #1D4ED8 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(#D4AF37 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid lg:grid-cols-5 gap-12 items-start">
              <div className="lg:col-span-2">
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#D4AF37" }}
                >
                  Personalize It
                </p>
                <h2
                  className="text-2xl lg:text-3xl font-bold mb-4 leading-tight text-white"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  What Can Be Customized?
                </h2>
                <p className="text-sm leading-relaxed mb-6 text-blue-100">
                  Every piece is built to order. Share your
                  vision — text, logo, size, occasion — and
                  we'll craft it with precision.
                </p>
                <button
                  onClick={() => setQuoteOpen(true)}
                  className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
                  style={{
                    background:
                      "linear-gradient(135deg, #D4AF37, #B8960C)",
                    color: "#1F2937",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Start Your Order
                </button>
              </div>
              <div
                ref={customRef}
                className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {product.customizable.map((item, i) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 p-4 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      border:
                        "1px solid rgba(255,255,255,0.15)",
                      backdropFilter: "blur(8px)",
                      opacity: customVisible ? 1 : 0,
                      transform: customVisible
                        ? "none"
                        : "translateX(12px)",
                      transition: `opacity 0.4s ease ${i * 60}ms, transform 0.4s ease ${i * 60}ms`,
                    }}
                  >
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{
                        background: "rgba(212,175,55,0.25)",
                        color: "#D4AF37",
                      }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-white/90">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Final CTA ── */}
        <div style={{ background: "#F8FAFC" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div
              className="relative text-center py-14 px-6 rounded-3xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #1F2937, #374151)",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#D4AF37 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5"
                  style={{
                    background: "rgba(212,175,55,0.15)",
                    color: "#D4AF37",
                    border: "1px solid rgba(212,175,55,0.3)",
                  }}
                >
                  ✦ Ready to Order
                </div>
                <h2
                  className="text-2xl lg:text-4xl font-bold text-white mb-4"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Interested in the {product.name}?
                </h2>
                <p className="text-gray-300 mb-8 max-w-xl mx-auto text-base">
                  Contact us for pricing, customization options,
                  and delivery. Free consultation always
                  available.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className="px-8 py-4 rounded-xl font-bold text-gray-900 transition-all hover:scale-105 hover:shadow-xl shadow-lg"
                    style={{
                      background:
                        "linear-gradient(135deg, #D4AF37, #B8960C)",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    Get a Free Quote
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="px-8 py-4 rounded-xl font-semibold text-white border-2 border-white/30 hover:bg-white/10 transition-all flex items-center gap-2"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    <ArrowLeft size={16} />
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}