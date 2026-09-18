import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import logo from "../../../../imports/image.png";
import { Facebook, Instagram, MapPin, MessageCircle, Send } from "lucide-react";


// ── FOOTER ────────────────────────────────────────────────────────────────────
export function Footer() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "ok" | "dup" | "err">("idle");

  function handleSubscribe() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubState("err");
      return;
    }
    try {
      const existing: string[] = JSON.parse(localStorage.getItem("cdaah_subscribers") || "[]");
      if (existing.includes(trimmed)) {
        setSubState("dup");
        return;
      }
      localStorage.setItem("cdaah_subscribers", JSON.stringify([...existing, trimmed]));
      setSubState("ok");
      setEmail("");
    } catch {
      setSubState("err");
    }
  }
  return (
    <footer style={{ background: "#0F172A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-blue-800">
                <ImageWithFallback
                  src={logo}
                  alt="Crystal Digital logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div
                  className="text-sm font-bold text-blue-400"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  CRYSTAL DIGITAL
                </div>
                <div className="text-xs font-semibold tracking-widest text-[#0dcb00]">
                  ART & AWARD HOUSE
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Pokhara's trusted destination for premium awards,
              trophies, laser engraving, and digital printing
              services.
            </p>
            <div className="flex gap-3">
              {[
                {
                  icon: Facebook,
                  color: "#1877F2",
                  href: "https://www.facebook.com/crystaldigital12712/",
                },
                {
                  icon: Instagram,
                  color: "#E1306C",
                  href: null,
                },
                {
                  icon: MessageCircle,
                  color: "#25D366",
                  href: "https://wa.me/9779856012712",
                },
                {
                  icon: MapPin,
                  color: "#EA4335",
                  href: "https://www.google.com/maps/search/Crystal+Digital+Art+%26+Award+House+Pokhara+Nepal",
                },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <button
                    key={i}
                    onClick={() =>
                      s.href && window.open(s.href, "_blank")
                    }
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: `${s.color}20`,
                      border: `1px solid ${s.color}30`,
                      cursor: s.href ? "pointer" : "default",
                    }}
                  >
                    <Icon
                      size={16}
                      style={{ color: s.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Quick Links
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Home", path: "/" },
                { label: "About Us", path: "/about" },
                { label: "Gallery", path: "/gallery" },
                { label: "Contact", path: "/contact" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="text-left text-gray-400 text-sm hover:text-blue-400 transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Services
            </h4>
            <div className="flex flex-col gap-2.5">
              {[
                "Crystal Awards",
                "Corporate Trophies",
                "Laser Engraving",
                "Digital Printing",
                "Wooden Plaques",
                "Customized Gifts",
              ].map((s) => (
                <span key={s} className="text-gray-400 text-sm">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4
              className="font-bold text-white text-sm mb-4"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Newsletter
            </h4>
            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
              Subscribe for updates and special offers.
            </p>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubState("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder="your@email.com"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                }}
              />
              <button
                onClick={handleSubscribe}
                className="px-3 py-2.5 rounded-xl transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                }}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
            {subState === "ok" && (
              <p className="text-green-400 text-xs mt-2">Subscribed! You'll receive product updates.</p>
            )}
            {subState === "dup" && (
              <p className="text-yellow-400 text-xs mt-2">This email is already subscribed.</p>
            )}
            {subState === "err" && (
              <p className="text-red-400 text-xs mt-2">Please enter a valid email address.</p>
            )}
            <div className="mt-5 flex items-start gap-2.5">
              <MapPin
                size={14}
                className="text-blue-400 mt-0.5 flex-shrink-0"
              />
              <span className="text-gray-400 text-xs leading-relaxed">
                Darbarthok Marga 1, Samsung Galli, Pokhara
                33700, Nepal
              </span>
            </div>
          </div>
        </div>
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">
            © 2026 POCOMAT DEVINEERS — All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-gray-600 text-xs">
              Crystal Digital Art & Award House, Pokhara, Nepal
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="text-gray-400 text-xs hover:text-gray-600 transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}