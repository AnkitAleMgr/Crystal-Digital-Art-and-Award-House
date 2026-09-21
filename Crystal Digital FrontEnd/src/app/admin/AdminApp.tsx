import React, { useState, useRef } from "react";
import {
  LayoutDashboard,
  Package,
  Image,
  Star,
  MessageSquare,
  Settings,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Eye,
  Search,
  ChevronLeft,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Menu,
  Save,
  Tag,
  AlertTriangle,
} from "lucide-react";
import { AdminProduct } from "./types/interface/production/adminProduct";
import { GalleryItem } from "./types/interface/gallery/gakkeryItem";
import { Testimonial } from "./types/interface/testimonials/testimonials";
import { QuoteRequest } from "./types/interface/quoteRequest/quoteRequest";
import { SiteSettings } from "./types/interface/setting/siteSetting";
import { AdminOverview } from "./pages/DashBoard";
import { AdminProducts } from "./pages/adminProduct";
import { AdminGallery } from "./pages/galleryModal";
import { AdminTestimonials } from "./pages/testimonials";
import { AdminQuotes } from "./pages/quoteRequest";
import { AdminSettings } from "./pages/setting";

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_PRODUCTS: AdminProduct[] = [
  {
    id: "crystal-award",
    name: "Crystal Award",
    desc: "Elegant personalized crystal awards for achievements and milestones.",
    fullDesc: "Our premium Crystal Awards are crafted from optical-grade clarity crystal, delivering a stunning visual presence at any recognition ceremony.",
    cat: "Crystal",
    features: ["Optical-grade crystal clarity", "Precision 2D/3D laser engraving", "Custom text & logo engraving", "Presented in premium gift box"],
    specs: [{ label: "Material", value: "Optical Crystal Glass" }, { label: "Finish", value: "Hand-polished, glossy" }],
    customizable: ["Recipient's name & designation", "Company or school logo", "Custom message"],
    tags: ["Best Seller", "Premium"],
    sizes: ["Small — 15cm", "Medium — 20cm", "Large — 25cm"],
    imgUrl: "",
  },
  {
    id: "wooden-plaque",
    name: "Wooden Plaque",
    desc: "Premium wooden plaques with gold-tone frame — ideal for recognition.",
    fullDesc: "Our Wooden Plaques combine natural hardwood warmth with professional gold-tone framing to create a lasting recognition piece.",
    cat: "Plaques",
    features: ["Premium hardwood construction", "Gold-tone metallic border frame", "High-contrast laser engraving", "Wall-mount ready"],
    specs: [{ label: "Material", value: "Hardwood (Teak / Sheesham)" }, { label: "Frame", value: "Gold-tone metallic border" }],
    customizable: ["Recipient name & title", "Logo & badge printing", "Custom message"],
    tags: ["Popular"],
    sizes: ["A5 — 21×15cm", "A4 — 30×21cm", "A3 — 42×30cm"],
    imgUrl: "",
  },
  {
    id: "gold-trophy",
    name: "Gold Trophy",
    desc: "Classic gold trophies for sports and corporate events.",
    fullDesc: "Our Gold Trophies are the quintessential symbol of victory and excellence. Cast from high-quality metal alloys and finished with a brilliant gold plating.",
    cat: "Trophies",
    features: ["Bright gold-plated finish", "Heavy-weight metal construction", "Customizable figurine toppers", "Engraved name plate included"],
    specs: [{ label: "Material", value: "Zinc alloy / Metal composite" }, { label: "Finish", value: "Gold electroplating" }],
    customizable: ["Trophy height and design style", "Name plate text", "Topper style"],
    tags: ["Most Popular"],
    sizes: ["15cm", "20cm", "25cm", "30cm", "45cm", "60cm", "75cm", "90cm"],
    imgUrl: "",
  },
  {
    id: "sports-medals",
    name: "Sports Medals Set",
    desc: "Complete medal sets with ribbons for tournaments and competitions.",
    fullDesc: "Our Sports Medals Sets are designed for every competitive event — from local school sports days to national tournaments.",
    cat: "Medals",
    features: ["Gold, silver & bronze finishes", "Full-colour custom ribbon included", "UV-printed or engraved design", "Bulk order discounts available"],
    specs: [{ label: "Material", value: "Zinc alloy / Aluminium" }, { label: "Diameter", value: "50mm, 65mm, 75mm" }],
    customizable: ["Event name and logo", "Position text (1st, 2nd, 3rd)", "Custom ribbon colour"],
    tags: ["Bulk Orders", "Popular"],
    sizes: ["50mm Diameter", "65mm Diameter", "75mm Diameter"],
    imgUrl: "",
  },
];

const SEED_GALLERY: GalleryItem[] = [
  { id: "g1", label: "Token of Appreciation Award", cat: "Crystal Awards", imgUrl: "", linkedProductId: "crystal-award" },
  { id: "g2", label: "Wooden Plaque with Gold Frame", cat: "Plaques", imgUrl: "", linkedProductId: "wooden-plaque" },
  { id: "g3", label: "Gold Sports Trophy", cat: "Trophies", imgUrl: "", linkedProductId: "gold-trophy" },
  { id: "g4", label: "Cultural Temple Trophy", cat: "Trophies", imgUrl: "", linkedProductId: "cultural-trophy" },
  { id: "g5", label: "Sports Medal Set", cat: "Medals", imgUrl: "", linkedProductId: "sports-medals" },
  { id: "g6", label: "Full Award Collection Display", cat: "Collection", imgUrl: "", linkedProductId: "award-collection" },
];

const SEED_TESTIMONIALS: Testimonial[] = [
  { id: "t1", name: "Ramesh Sharma", company: "Pokhara Academy", text: "Crystal Digital delivered outstanding trophies for our annual sports day. The quality was beyond expectations and delivery was on time!", rating: 5 },
  { id: "t2", name: "Sunita Gurung", company: "Annapurna Hotels", text: "We ordered custom crystal awards for our employee recognition ceremony. Beautifully crafted and professionally packaged. Highly recommend!", rating: 5 },
  { id: "t3", name: "Bikash Thapa", company: "Gandaki Province Office", text: "Excellent service for our government felicitation event. The wooden plaques and laser engraving were top-notch. Will definitely order again.", rating: 5 },
];

const SEED_QUOTES: QuoteRequest[] = [
  { id: "q1", name: "Anil Shrestha", email: "anil@example.com", phone: "+977 9801234567", product: "Crystal Award", size: "Medium — 20cm", message: "Need 25 crystal awards for our annual recognition event. Can you provide bulk pricing?", date: "2026-08-28", status: "new" },
  { id: "q2", name: "Priya Tamang", email: "priya@example.com", phone: "+977 9856789012", product: "Gold Trophy", size: "45cm", message: "Looking for 1st, 2nd, 3rd place trophies for a football tournament. Total 30 trophies needed.", date: "2026-08-25", status: "reviewed" },
  { id: "q3", name: "Sanjay Karki", email: "sanjay@corp.com", phone: "+977 9812345678", product: "Wooden Plaque", size: "A4 — 30×21cm", message: "Corporate employee awards — 15 wooden plaques with our logo. Please send pricing.", date: "2026-08-20", status: "quoted" },
  { id: "q4", name: "Meena Rai", email: "meena@school.edu", phone: "+977 9867890123", product: "Sports Medals", size: "65mm Diameter", message: "Annual sports day for 200 students. Need medals for all participants plus podium trophies.", date: "2026-08-15", status: "closed" },
  { id: "q5", name: "Ankit Ale", email: "anmolankit00@gmail.com", phone: "+977 9800000001", product: "Crystal Award", size: "Large — 25cm", message: "Test quote — requesting details on custom crystal award for an upcoming ceremony.", date: "2026-09-03", status: "new" },
];

const SEED_SETTINGS: SiteSettings = {
  businessName: "Crystal Digital Art & Award House",
  tagline: "Pokhara's Premier Award & Trophy Specialist",
  phone: "+977 056-XXX-XXX",
  email: "crystaldigital@example.com",
  address: "Darbarthok Marga 1, Samsung Galli, Pokhara 33700, Nepal",
  mapLink: "https://www.google.com/maps",
  facebookUrl: "https://www.facebook.com/crystaldigital12712/",
  workingHours: "Sun–Fri: 9:00 AM – 7:00 PM | Sat: 10:00 AM – 5:00 PM",
  whatsapp: "+977 9800000000",
};

// ── Storage Helpers ───────────────────────────────────────────────────────────
export function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}
export function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Email Notification Helper ─────────────────────────────────────────────────
export async function sendNotificationEmail(to: string, subject: string, fields: Record<string, string>) {
  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ _subject: subject, _template: "table", ...fields }),
    });
  } catch {
    // fire-and-forget — silent failure
  }
}

// ── Constants ─────────────────────────────────────────────────────────────────
const ADMIN_USER = "admin";
const ADMIN_PASS = "crystal@2024";
export const PRODUCT_CATS = ["Crystal", "Trophies", "Plaques", "Medals", "Collection", "Gifts"];
export const GALLERY_CATS = ["Crystal Awards", "Trophies", "Plaques", "Medals", "Collection", "Printing"];
export const STATUS_COLORS: Record<QuoteRequest["status"], string> = {
  new: "#2563EB",
  reviewed: "#D4AF37",
  quoted: "#16A34A",
  closed: "#6B7280",
};
const STATUS_BG: Record<QuoteRequest["status"], string> = {
  new: "#EFF6FF",
  reviewed: "#FEFCE8",
  quoted: "#F0FDF4",
  closed: "#F9FAFB",
};

// ── Shared UI ─────────────────────────────────────────────────────────────────
export function Badge({ status }: { status: QuoteRequest["status"] }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ color: STATUS_COLORS[status], background: STATUS_BG[status] }}
    >
      {status}
    </span>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Confirm Delete</h3>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}

export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <input
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400"
      />
    </div>
  );
}

export function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <textarea
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-gray-400 resize-none"
      />
    </div>
  );
}

export function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <select
        {...props}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
      >
        {children}
      </select>
    </div>
  );
}

// ── Image Upload Field ────────────────────────────────────────────────────────
export function ImageUploadField({ label, value, onChange }: { label?: string; value: string; onChange: (dataUrl: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div
        className="relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
        style={{ borderColor: value ? "#2563EB" : "#E5E7EB", background: "#F8FAFC" }}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <div className="relative h-36 flex items-center justify-center">
            <img src={value} alt="Preview" className="h-full w-full object-contain p-2" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); if (inputRef.current) inputRef.current.value = ""; }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-100 flex items-center justify-center hover:bg-red-200 transition-colors"
            >
              <X size={12} className="text-red-600" />
            </button>
          </div>
        ) : (
          <div className="h-24 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Image size={24} />
            <span className="text-xs font-medium">Click to upload image</span>
            <span className="text-xs">PNG, JPG · Max 5MB</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Login Page ─────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      if (username === ADMIN_USER && password === ADMIN_PASS) {
        sessionStorage.setItem("cdaah_admin", "1");
        onLogin();
      } else {
        setError("Invalid credentials. Please check your username and password.");
      }
      setLoading(false);
    }, 800);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #1D4ED8 100%)" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "#D4AF37", filter: "blur(80px)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10" style={{ background: "#60A5FA", filter: "blur(60px)", transform: "translate(-30%, 30%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl" style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)" }}>
            <Lock size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Admin Portal</h1>
          <p className="text-blue-200 text-sm">Crystal Digital Art & Award House</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your credentials to access the dashboard.</p>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 mb-5">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Eye size={16} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-70 mt-2"
              style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-600 text-center font-medium">Authorized personnel only. All access is logged.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export type AdminSection = "overview" | "products" | "gallery" | "testimonials" | "quotes" | "settings";

const NAV_ITEMS: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
  { id: "overview", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "products", label: "Products", icon: <Package size={18} /> },
  { id: "gallery", label: "Gallery", icon: <Image size={18} /> },
  { id: "testimonials", label: "Testimonials", icon: <Star size={18} /> },
  { id: "quotes", label: "Quote Requests", icon: <MessageSquare size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

function Sidebar({
  section,
  setSection,
  onLogout,
  mobileOpen,
  setMobileOpen,
  quoteCount,
}: {
  section: AdminSection;
  setSection: (s: AdminSection) => void;
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  quoteCount: number;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, #0F172A 0%, #1E3A8A 100%)" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #D4AF37, #B8960C)" }}>
                <Lock size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>Admin Portal</div>
                <div className="text-blue-300 text-xs">Crystal Digital</div>
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "text-white" : "text-blue-200 hover:text-white hover:bg-white/10"}`}
                style={active ? { background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" } : {}}
              >
                <span className={active ? "text-[#D4AF37]" : ""}>{item.icon}</span>
                <span style={{ fontFamily: "Poppins, sans-serif" }}>{item.label}</span>
                {item.id === "quotes" && quoteCount > 0 && (
                  <span className="ml-auto text-xs font-bold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">{quoteCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:text-red-200 hover:bg-white/10 transition-all"
          >
            <LogOut size={18} />
            <span style={{ fontFamily: "Poppins, sans-serif" }}>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Admin Dashboard Shell ─────────────────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<AdminSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"logout" | "viewSite" | null>(null);

  const [products, setProductsState] = useState<AdminProduct[]>(() => load("cdaah_products", SEED_PRODUCTS));
  const [gallery, setGalleryState] = useState<GalleryItem[]>(() => load("cdaah_gallery", SEED_GALLERY));
  const [testimonials, setTestimonialsState] = useState<Testimonial[]>(() => load("cdaah_testimonials", SEED_TESTIMONIALS));
  const [quotes, setQuotesState] = useState<QuoteRequest[]>(() => {
    const stored = load("cdaah_quotes", SEED_QUOTES);
    if (!stored.find((q) => q.id === "q5")) {
      const merged = [...stored, SEED_QUOTES[SEED_QUOTES.length - 1]];
      save("cdaah_quotes", merged);
      return merged;
    }
    return stored;
  });
  const [settings, setSettingsState] = useState<SiteSettings>(() => load("cdaah_settings", SEED_SETTINGS));

  function setProducts(p: AdminProduct[]) { setProductsState(p); save("cdaah_products", p); }
  function setGallery(g: GalleryItem[]) { setGalleryState(g); save("cdaah_gallery", g); }
  function setTestimonials(t: Testimonial[]) { setTestimonialsState(t); save("cdaah_testimonials", t); }
  function setQuotes(q: QuoteRequest[]) { setQuotesState(q); save("cdaah_quotes", q); }
  function setSettings(s: SiteSettings) { setSettingsState(s); save("cdaah_settings", s); }

  function handleConfirm() {
    if (confirmAction === "logout") onLogout();
    if (confirmAction === "viewSite") window.location.hash = "";
    setConfirmAction(null);
  }

  const newQuoteCount = quotes.filter((q) => q.status === "new").length;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>
      {/* Confirmation dialog */}
      {confirmAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${confirmAction === "logout" ? "bg-red-100" : "bg-blue-100"}`}>
                {confirmAction === "logout"
                  ? <LogOut size={20} className="text-red-600" />
                  : <ChevronLeft size={20} className="text-blue-600" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {confirmAction === "logout" ? "Sign Out?" : "Leave Admin?"}
                </h3>
                <p className="text-sm text-gray-500">
                  {confirmAction === "logout"
                    ? "You will be returned to the login screen. Any unsaved changes will remain in your browser."
                    : "You will be taken to the main website. You can return to admin via the footer link."}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                style={{ background: confirmAction === "logout" ? "#DC2626" : "#2563EB" }}
              >
                {confirmAction === "logout" ? "Sign Out" : "Go to Site"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        section={section}
        setSection={setSection}
        onLogout={() => setConfirmAction("logout")}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        quoteCount={newQuoteCount}
      />

      {/* Main content */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Menu size={20} />
              </button>
              <div>
                <h2 className="font-bold text-gray-800 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
                  {NAV_ITEMS.find((n) => n.id === section)?.label}
                </h2>
                <p className="text-xs text-gray-400 hidden sm:block">Crystal Digital Art & Award House</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {newQuoteCount > 0 && (
                <button onClick={() => setSection("quotes")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">
                  <MessageSquare size={14} />
                  {newQuoteCount} new
                </button>
              )}
              <button
                onClick={() => setConfirmAction("viewSite")}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={14} /> View Site
              </button>
              <button
                onClick={() => setConfirmAction("logout")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 transition-colors"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {section === "overview" && (
            <AdminOverview products={products} gallery={gallery} testimonials={testimonials} quotes={quotes} setSection={setSection} />
          )}
          {section === "products" && (
            <AdminProducts products={products} setProducts={setProducts} />
          )}
          {section === "gallery" && (
            <AdminGallery gallery={gallery} setGallery={setGallery} products={products} />
          )}
          {section === "testimonials" && (
            <AdminTestimonials testimonials={testimonials} setTestimonials={setTestimonials} />
          )}
          {section === "quotes" && (
            <AdminQuotes quotes={quotes} setQuotes={setQuotes} />
          )}
          {section === "settings" && (
            <AdminSettings settings={settings} setSettings={setSettings} />
          )}
        </main>
      </div>
    </div>
  );
}

// ── Admin App Root ─────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("cdaah_admin") === "1");

  function handleLogin() { setAuthed(true); }
  function handleLogout() {
    sessionStorage.removeItem("cdaah_admin");
    setAuthed(false);
  }

  return authed ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />;
}
