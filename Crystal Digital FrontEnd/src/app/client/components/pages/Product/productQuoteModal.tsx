import { CheckCircle, Phone, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Product } from "../../../types/Product";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";

// ── QUOTE MODAL ───────────────────────────────────────────────────────────────
export function QuoteModal({
  product,
  initialSize,
  onClose,
}: {
  product: Product;
  initialSize?: string;
  onClose: () => void;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [fileName, setFileName] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    quantity: "",
    engrave: "",
    size: initialSize || "",
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileName(e.target.files?.[0]?.name ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    try {
      await fetch("https://formsubmit.co/ajax/anmolankit00@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Quote Request — ${product.name} | Crystal Digital`,
          Name: form.name,
          Email: form.email || "Not provided",
          Phone: form.phone,
          Product: product.name,
          Category: product.cat,
          Selected_Size: form.size || "Not specified",
          Quantity: form.quantity || "Not specified",
          Engraving_Text: form.engrave || "None",
          Attached_File: fileName || "No file attached",
          _template: "table",
        }),
      });
      setSent(true);
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(7,11,22,0.88)",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl"
        style={{
          background: "white",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <X size={15} className="text-gray-500" />
        </button>

        {sent ? (
          /* ── Confirmation screen ── */
          <div className="flex flex-col items-center justify-center text-center px-8 py-14">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg"
              style={{
                background:
                  "linear-gradient(135deg, #22C55E, #16A34A)",
              }}
            >
              <CheckCircle size={38} className="text-white" />
            </div>
            <h2
              className="text-2xl font-bold text-gray-900 mb-2"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Quote Request Sent!
            </h2>
            <p className="text-gray-500 text-sm mb-1 leading-relaxed">
              Thank you for your interest in the
            </p>
            <p
              className="font-bold mb-4"
              style={{
                color: "#2563EB",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              {product.name}
            </p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
              Our team will review your request and contact you
              within 24 hours to confirm details and pricing.
            </p>
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-8 w-full"
              style={{
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
              }}
            >
              <Phone size={15} style={{ color: "#16A34A" }} />
              <span className="text-sm text-green-800 font-medium">
                061-523459 / 9856012712
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl font-bold text-white transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, #2563EB, #1D4ED8)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Back to {product.name}
            </button>
          </div>
        ) : (
          /* ── Quote form ── */
          <>
            {/* Modal header — product context */}
            <div
              className="relative overflow-hidden rounded-t-3xl px-6 pt-7 pb-5"
              style={{
                background:
                  "linear-gradient(135deg, #0F172A, #1E3A8A)",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "radial-gradient(#D4AF37 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
                  style={{
                    border: "2px solid rgba(212,175,55,0.4)",
                  }}
                >
                  <ImageWithFallback
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: "#D4AF37" }}
                  >
                    Requesting Quote For
                  </p>
                  <h3
                    className="text-lg font-bold text-white leading-tight"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {product.name}
                  </h3>
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
                    style={{
                      background: "rgba(34,197,94,0.2)",
                      color: "#4ADE80",
                      border: "1px solid rgba(74,222,128,0.3)",
                    }}
                  >
                    {product.cat}
                  </span>
                </div>
              </div>
            </div>

            {/* Form body */}
            <form
              onSubmit={handleSubmit}
              className="px-6 py-6 flex flex-col gap-4"
            >
              <p className="text-xs text-gray-400 -mt-1">
                Fields marked{" "}
                <span style={{ color: "#DC2626" }}>*</span> are
                required.
              </p>

              {/* Selected size display */}
              {form.size && (
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#2563EB" }}>
                    Selected Size
                  </span>
                  <span
                    className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
                  >
                    {form.size}
                  </span>
                </div>
              )}

              {/* Name + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Full Name{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Phone{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="98XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
              </div>

              {/* Email + Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Quantity{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: "1.5px solid #E2E8F0",
                    }}
                    onFocus={(e) =>
                      (e.target.style.border =
                        "1.5px solid #2563EB")
                    }
                    onBlur={(e) =>
                      (e.target.style.border =
                        "1.5px solid #E2E8F0")
                    }
                  />
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Logo / Image Upload
                </label>
                <label
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px dashed #CBD5E1",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.border =
                      "1.5px dashed #2563EB")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.border =
                      "1.5px dashed #CBD5E1")
                  }
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                    }}
                  >
                    <Send
                      size={14}
                      style={{
                        color: "#2563EB",
                        transform: "rotate(-45deg)",
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {fileName ||
                        "Click to upload logo or image"}
                    </p>
                    <p className="text-xs text-gray-400">
                      PNG, JPG, SVG · Max 5MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              </div>

              {/* Text to engrave */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Text to Engrave / Special Instructions
                </label>
                <textarea
                  value={form.engrave}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      engrave: e.target.value,
                    })
                  }
                  placeholder={`e.g. "Presented to Ramesh Sharma for Outstanding Achievement — 2026" or describe your design...`}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px solid #E2E8F0",
                  }}
                  onFocus={(e) =>
                    (e.target.style.border =
                      "1.5px solid #2563EB")
                  }
                  onBlur={(e) =>
                    (e.target.style.border =
                      "1.5px solid #E2E8F0")
                  }
                />
              </div>

              {/* Submit */}
              {sendError && (
                <p className="text-center text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                  Failed to send — please try again or contact us directly on WhatsApp.
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mt-1 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  fontFamily: "Poppins, sans-serif",
                  boxShadow: "0 8px 24px rgba(37,99,235,0.35)",
                }}
              >
                <Send size={15} />
                {sending ? "Sending…" : "Submit Quote Request"}
              </button>

              <p className="text-center text-xs text-gray-400">
                We'll respond within 24 hours · Free consultation
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}