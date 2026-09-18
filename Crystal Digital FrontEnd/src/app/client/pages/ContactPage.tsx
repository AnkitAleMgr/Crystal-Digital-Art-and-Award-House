import { useState } from "react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Section, SectionHeading, SectionLabel } from "../components/pages/home/homeSection";
import img8 from "../../../imports/image-8.png";

import { CheckCircle, ChevronDown, Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    message: "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const services_list = [
    "Crystal Awards",
    "Corporate Trophies",
    "Acrylic Awards",
    "Wooden Plaques",
    "Medal & Certificate",
    "Name Plates",
    "Sign Boards",
    "Laser Engraving",
    "Digital Printing",
    "Customized Gifts",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSendError(false);
    try {
      await fetch(
        "https://formsubmit.co/ajax/anmolankit00@gmail.com",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            _subject:
              "New Contact Message — Crystal Digital Art & Award House",
            Name: form.name,
            Email: form.email,
            Phone: form.phone,
            Service_Enquiry: form.service || "Not specified",
            Message: form.message,
            _template: "table",
          }),
        },
      );
      setSent(true);
      setTimeout(() => setSent(false), 5000);
      setForm({
        name: "",
        phone: "",
        email: "",
        service: "",
        message: "",
      });
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ paddingTop: "80px" }}>
      {/* Banner */}
      <div className="relative h-52 overflow-hidden">
        <ImageWithFallback
          src={img8}
          alt="Contact banner"
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
              Reach Out
            </div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      <Section bg="#F8FAFC">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Info */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <SectionLabel>Get In Touch</SectionLabel>
              <SectionHeading>
                We'd Love to Hear From You
              </SectionHeading>
              <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                Visit our store or contact us to discuss your
                custom award, trophy, or printing requirements.
              </p>
            </div>
            {[
              {
                icon: MapPin,
                label: "Address",
                val: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
              },
              {
                icon: Phone,
                label: "Phone",
                val: "061-523459 / 9856012712",
              },
              {
                icon: Mail,
                label: "Email",
                val: "globallinksks@gmail.com",
              },
              {
                icon: Clock,
                label: "Hours",
                val: "Monday – Saturday: 9:00 AM – 7:00 PM",
              },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="flex gap-4 p-4 rounded-xl items-start"
                  style={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #EFF6FF, #DBEAFE)",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: "#2563EB" }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5 font-medium">
                      {c.label}
                    </div>
                    <div className="text-sm text-gray-700 font-medium leading-snug">
                      {c.val}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* WhatsApp CTA */}
            <button
              onClick={() =>
                window.open(
                  "https://wa.me/9779856012712",
                  "_blank",
                )
              }
              className="mt-2 w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl font-bold text-white transition-all hover:scale-[1.03] hover:shadow-lg active:scale-[0.97]"
              style={{
                background:
                  "linear-gradient(135deg, #25D366, #128C7E)",
                boxShadow: "0 4px 18px rgba(37,211,102,0.35)",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              <MessageCircle size={18} />
              Chat on WhatsApp
            </button>

            {/* Social icons */}
            <div className="flex gap-3 mt-3">
              {[
                {
                  icon: Facebook,
                  label: "Facebook",
                  color: "#1877F2",
                  href: "https://www.facebook.com/crystaldigital12712/",
                },
                {
                  icon: Instagram,
                  label: "Instagram",
                  color: "#E1306C",
                  href: null,
                },
                {
                  icon: MapPin,
                  label: "Google Maps",
                  color: "#EA4335",
                  href: "https://www.google.com/maps/search/Crystal+Digital+Art+%26+Award+House+Pokhara+Nepal",
                },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    title={s.label}
                    onClick={() =>
                      s.href && window.open(s.href, "_blank")
                    }
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-md"
                    style={{
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}30`,
                      cursor: s.href ? "pointer" : "default",
                    }}
                  >
                    <Icon
                      size={18}
                      style={{ color: s.color }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <div
            className="lg:col-span-3 p-8 rounded-2xl"
            style={{
              background: "white",
              boxShadow: "0 4px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h3
              className="text-xl font-bold text-gray-800 mb-6"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              Send Us a Message
            </h3>
            {sent && (
              <div
                className="mb-5 px-5 py-4 rounded-xl flex items-center gap-3"
                style={{
                  background: "#ECFDF5",
                  border: "1px solid #6EE7B7",
                }}
              >
                <CheckCircle
                  size={18}
                  style={{ color: "#10B981" }}
                />
                <span className="text-sm font-medium text-green-800">
                  Your message has been sent! We'll contact you
                  soon.
                </span>
              </div>
            )}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value,
                      })
                    }
                    placeholder="061-XXXXXX or 98XXXXXXXX"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Service (Optional)
                </label>
                <div className="relative">
                  <select
                    value={form.service}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        service: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400 appearance-none"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  >
                    <option value="">Select a service</option>
                    {services_list.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Message *
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      message: e.target.value,
                    })
                  }
                  placeholder="Tell us about your requirement — quantity, occasion, customization details..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-blue-400 resize-none"
                  style={{
                    background: "#F8FAFC",
                    border: "1px solid rgba(0,0,0,0.08)",
                  }}
                />
              </div>
              {sendError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                  Failed to send — please try again or reach us
                  on WhatsApp directly.
                </p>
              )}
              <button
                type="submit"
                disabled={sending}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB, #1D4ED8)",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                <Send size={16} />
                {sending ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div
          className="mt-10 rounded-2xl overflow-hidden shadow-lg"
          style={{ height: "360px" }}
        >
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3515.8!2d83.988759!3d28.2206565!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3995944e9985132f%3A0x135f56a80ed54d24!2sCrystal%20Digital%20Art%20%26%20Craft!5e0!3m2!1sen!2snp!4v1720000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Crystal Digital Art & Award House map"
          />
        </div>
      </Section>
    </div>
  );
}