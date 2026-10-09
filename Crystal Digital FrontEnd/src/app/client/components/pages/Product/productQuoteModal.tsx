import { CheckCircle, Phone, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Product } from "../../../types/Product";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { PublicApiError, publicApi } from "../../../utils/api";
import { catLabel } from "../../../utils/categories";
import { useSiteData } from "../../layout/siteDataProvider";

// Overlay asking for a quote on one product: standard details, the product's
// customization fields, optional artwork upload, and a POST to /api/quotes.
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
  const [sendError, setSendError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [fileTooBig, setFileTooBig] = useState(false);
  const { settings } = useSiteData();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    quantity: "",
    // One entry per product customizationField, keyed by label. Seeded from the
    // product so a field the admin has since removed simply never renders, and
    // one added after this page loaded is caught server-side rather than lost.
    customization: Object.fromEntries(
      product.customizationFields.map((f) => [f.label, ""])
    ),
    size: initialSize || "",
    website: "",
  });

  // 5MB, matching MAX_IMAGE_BYTES in the backend's middleware/imageUpload.js.
  const MAX_ARTWORK_BYTES = 5 * 1024 * 1024;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;

    setFile(picked);
    setFileName(picked?.name ?? "");
    setFileSize(picked?.size ?? 0);
    setFileTooBig(Boolean(picked && picked.size > MAX_ARTWORK_BYTES));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError("");
    setFieldErrors({});

    if (fileTooBig) {
      setSendError(
        "That artwork is over 5MB. Please email it to us instead — your other details have not been sent."
      );
      setSending(false);
      return;
    }

    // The browser's own required handling covers these, but an empty-value
    // custom field and a blank size would otherwise leave a confusing message
    // for the server to reject.
    const missing = product.customizationFields.filter(
      (f) => f.required && !(form.customization[f.label] ?? "").trim()
    );

    if (missing.length > 0) {
      setFieldErrors(
        Object.fromEntries(
          missing.map((f) => [
            `customization.${f.label}`,
            `${f.label} is required.`,
          ])
        )
      );
      setSendError("Please fill in every required field.");
      setSending(false);
      return;
    }

    if (product.sizes.length > 0 && !form.size) {
      setFieldErrors({ size: "Please choose a size." });
      setSendError("Please choose a size.");
      setSending(false);
      return;
    }

    try {
      await publicApi.createQuote(
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          product: product.name,
          productSlug: product.slug,
          size: form.size,
          quantity: form.quantity,
          customization: product.customizationFields.map((f) => ({
            label: f.label,
            value: form.customization[f.label] ?? "",
          })),
          attachment: fileName,
          website: form.website,
        },
        file
      );

      setSent(true);
    } catch (error) {
      if (error instanceof PublicApiError) {
        setFieldErrors(error.fields);
        setSendError(error.message);
        return;
      }

      setSendError(
        "Failed to send — please try again or contact us directly on WhatsApp."
      );
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
                {settings.phone}
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
                    {catLabel(product.cat)}
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
                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldErrors.name}
                    </p>
                  )}
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
                    Email Address{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
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
                      border: fieldErrors.email
                        ? "1.5px solid #FCA5A5"
                        : "1.5px solid #E2E8F0",
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
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldErrors.email}
                    </p>
                  )}
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
                      {fileTooBig
                        ? "That file is over 5MB — please send it by email instead"
                        : fileName
                          ? `${(fileSize / 1024).toFixed(0)} KB · sent securely with your quote`
                          : "JPG, PNG, WebP or AVIF, up to 5MB"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                    className="hidden"
                    onChange={handleFile}
                  />
                </label>
              </div>

              {/* Size — required whenever the product offers a choice */}
              {product.sizes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                    Size{" "}
                    <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <select
                    required
                    value={form.size}
                    onChange={(e) =>
                      setForm({ ...form, size: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: "#F8FAFC",
                      border: fieldErrors.size
                        ? "1.5px solid #FCA5A5"
                        : "1.5px solid #E2E8F0",
                    }}
                  >
                    <option value="">Choose a size…</option>
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.size && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {fieldErrors.size}
                    </p>
                  )}
                </div>
              )}

              {/* Customization fields defined by the admin for this product */}
              {product.customizationFields.map((field) => {
                const value = form.customization[field.label] ?? "";
                const error = fieldErrors[`customization.${field.label}`];
                const over = value.length > field.maxLength;

                return (
                  <div key={field.label}>
                    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wide">
                      {field.label}{" "}
                      {field.required ? (
                        <span style={{ color: "#DC2626" }}>*</span>
                      ) : (
                        <span className="font-normal normal-case text-gray-400">
                          (optional)
                        </span>
                      )}
                    </label>
                    <textarea
                      required={field.required}
                      value={value}
                      maxLength={field.maxLength}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          customization: {
                            ...form.customization,
                            [field.label]: e.target.value,
                          },
                        })
                      }
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                      style={{
                        background: "#F8FAFC",
                        border: error
                          ? "1.5px solid #FCA5A5"
                          : "1.5px solid #E2E8F0",
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
                    <div className="flex justify-between mt-1">
                      {error ? (
                        <p className="text-xs text-red-600">{error}</p>
                      ) : (
                        <span />
                      )}
                      <span
                        className="text-xs ml-auto"
                        style={{
                          color: over ? "#DC2626" : "#9CA3AF",
                        }}
                      >
                        {value.length}/{field.maxLength}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Honeypot: hidden from humans, bots fill it in. The server
                  swallows any request carrying a value and answers 201
                  without storing anything. */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              >
                <label htmlFor="quote-website">Website</label>
                <input
                  id="quote-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </div>
              {sendError && (
                <p className="text-center text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5 border border-red-100">
                  {sendError}
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