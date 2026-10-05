import { Link } from "react-router-dom";
import { useState } from "react";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import logo from "../../../../imports/image.png";
import { Facebook, Instagram, Loader2, MapPin, MessageCircle, Send } from "lucide-react";
import { useSiteData } from "./siteDataProvider";
import { whatsappLink } from "../../data/siteDefaults";
import { PublicApiError, publicApi } from "../../utils/api";


// "idle" | "invalid" is what the visitor typed; "network" is us not being
// reachable. They used to share one state, so a dead server reported "Please
// enter a valid email address" — which is both wrong and the reason nobody
// could work out what was happening.
type SubState = "idle" | "sending" | "sent" | "already" | "invalid" | "network";

// ── FOOTER ────────────────────────────────────────────────────────────────────
export function Footer() {
  const { settings } = useSiteData();
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<SubState>("idle");

  async function handleSubscribe() {
    const trimmed = email.trim();

    // noValidate on the form, so this runs instead of the browser's own
    // tooltip. Left on, the native bubble would swallow the submit and the
    // aria-live region below would stay empty — the visitor would see an
    // unstyled browser message in whatever wording their browser prefers.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubState("invalid");
      return;
    }

    setSubState("sending");

    try {
      const result = await publicApi.subscribe({ email: trimmed });

      setSubState(result.alreadySubscribed ? "already" : "sent");
      setEmail("");
    } catch (error) {
      // A 400 here is the server's own field message, which is the accurate one
      // to show. Status 0 is the "never reached the server" sentinel.
      setSubState(
        error instanceof PublicApiError && error.status === 0 ? "network" : "invalid"
      );
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
              {settings.tagline}
            </p>
            <div className="flex gap-3">
              {[
                {
                  icon: Facebook,
                  color: "#1877F2",
                  href: settings.facebookUrl,
                },
                {
                  icon: Instagram,
                  color: "#E1306C",
                  href: null,
                },
                {
                  icon: MessageCircle,
                  color: "#25D366",
                  href: whatsappLink(settings),
                },
                {
                  icon: MapPin,
                  color: "#EA4335",
                  href: settings.mapLink,
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
              Get an email when we add something new. Nothing else, and you can
              unsubscribe from any one of them.
            </p>
            <form
              className="flex gap-2"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                handleSubscribe();
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setSubState("idle"); }}
                placeholder="your@email.com"
                aria-label="Email address for product updates"
                autoComplete="email"
                disabled={subState === "sending"}
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-white/50 disabled:opacity-60"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "white",
                }}
              />
              <button
                type="submit"
                disabled={subState === "sending"}
                aria-label="Subscribe to product updates"
                className="px-3 py-2.5 rounded-xl transition-all hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                }}
              >
                {subState === "sending" ? (
                  <Loader2 size={14} className="text-white animate-spin" />
                ) : (
                  <Send size={14} className="text-white" />
                )}
              </button>
            </form>
            {/* aria-live so the result is announced — the whole point of the
                form is the message that comes back. */}
            <p aria-live="polite" className="mt-2 text-xs min-h-4">
              {subState === "sent" && (
                <span className="text-green-400">
                  Almost done — check your inbox and click the link we just sent.
                </span>
              )}
              {subState === "already" && (
                <span className="text-yellow-400">
                  You're already subscribed. We'll only email when something new
                  is added.
                </span>
              )}
              {subState === "invalid" && (
                <span className="text-red-400">
                  Please enter a valid email address.
                </span>
              )}
              {subState === "network" && (
                <span className="text-red-400">
                  We couldn't reach the server. Please try again in a moment.
                </span>
              )}
            </p>
            <div className="mt-5 flex items-start gap-2.5">
              <MapPin
                size={14}
                className="text-blue-400 mt-0.5 flex-shrink-0"
              />
              <span className="text-gray-400 text-xs leading-relaxed">
                {settings.address}
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
              {settings.businessName}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}