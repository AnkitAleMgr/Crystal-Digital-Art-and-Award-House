import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "../../../../app/components/figma/ImageWithFallback";
import { Menu, X } from "lucide-react";
import logo from "../../../../imports/image.png";

// ── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handler);

    return () => window.removeEventListener("scroll", handler);
  }, []);

  const nav = [
    { label: "Home", path: "/" },
    { label: "About Us", path: "/about" },
    { label: "Gallery", path: "/gallery" },
    { label: "Contact", path: "/contact" },
  ];

  const goToPage = (path: string) => {
    setOpen(false);
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToQuote = () => {
    setOpen(false);

    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document
          .getElementById("premium-products")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    } else {
      document
        .getElementById("premium-products")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "rgba(255,255,255,0.97)"
          : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled
          ? "0 2px 24px rgba(37,99,235,0.10)"
          : "0 1px 0 rgba(0,0,0,0.06)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <button
            onClick={() => goToPage("/")}
            className="flex items-center gap-3 group"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all">
              <ImageWithFallback
                src={logo}
                alt="Crystal Digital Art & Award House logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="hidden sm:block text-left">
              <div
                className="text-sm font-bold text-blue-600 leading-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                CRYSTAL DIGITAL
              </div>

              <div className="text-xs tracking-widest text-[#459e14] font-bold">
                ART & AWARD HOUSE
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => {
              const active = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    setOpen(false);
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}
                  className="relative px-4 py-2 text-sm font-medium transition-colors rounded-lg"
                  style={{
                    color: active ? "#2563EB" : "#374151",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {item.label}

                  {active && (
                    <span
                      className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full"
                      style={{
                        background: "#2563EB",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Get a Quote */}
            <button
              onClick={goToQuote}
              className="hidden lg:block px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, #2563EB, #1D4ED8)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Get a Quote
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? (
                <X size={22} className="text-gray-700" />
              ) : (
                <Menu size={22} className="text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className="lg:hidden overflow-hidden transition-all duration-300"
        style={{
          maxHeight: open ? "400px" : "0",
          background: "white",
          borderTop: open
            ? "1px solid rgba(0,0,0,0.06)"
            : "none",
        }}
      >
        <div className="px-4 py-3 flex flex-col gap-1">

          {nav.map((item) => {
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  setOpen(false);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{
                  color: active ? "#2563EB" : "#374151",
                  background: active
                    ? "#EFF6FF"
                    : "transparent",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Mobile Get a Quote */}
          <button
            onClick={goToQuote}
            className="mt-2 px-4 py-3 rounded-xl text-sm font-semibold text-white text-center"
            style={{
              background:
                "linear-gradient(135deg, #2563EB, #1D4ED8)",
            }}
          >
            Get a Quote
          </button>
        </div>
      </div>
    </header>
  );
}