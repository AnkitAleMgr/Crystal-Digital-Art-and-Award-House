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

// ── Types ────────────────────────────────────────────────────────────────────
interface AdminProduct {
  id: string;
  name: string;
  desc: string;
  fullDesc: string;
  cat: string;
  features: string[];
  specs: { label: string; value: string }[];
  customizable: string[];
  tags: string[];
  sizes: string[];
  imgUrl: string;
}

interface GalleryItem {
  id: string;
  label: string;
  cat: string;
  imgUrl: string;
  linkedProductId?: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  text: string;
  rating: number;
}

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  product: string;
  size?: string;
  message: string;
  date: string;
  status: "new" | "reviewed" | "quoted" | "closed";
}

interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  mapLink: string;
  facebookUrl: string;
  workingHours: string;
  whatsapp: string;
}

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
function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}
function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Email Notification Helper ─────────────────────────────────────────────────
async function sendNotificationEmail(to: string, subject: string, fields: Record<string, string>) {
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
const PRODUCT_CATS = ["Crystal", "Trophies", "Plaques", "Medals", "Collection", "Gifts"];
const GALLERY_CATS = ["Crystal Awards", "Trophies", "Plaques", "Medals", "Collection", "Printing"];
const STATUS_COLORS: Record<QuoteRequest["status"], string> = {
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
function Badge({ status }: { status: QuoteRequest["status"] }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize"
      style={{ color: STATUS_COLORS[status], background: STATUS_BG[status] }}
    >
      {status}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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

function ConfirmModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
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

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
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

function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
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

function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
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
function ImageUploadField({ label, value, onChange }: { label?: string; value: string; onChange: (dataUrl: string) => void }) {
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
type AdminSection = "overview" | "products" | "gallery" | "testimonials" | "quotes" | "settings";

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

// ── Overview ──────────────────────────────────────────────────────────────────
function AdminOverview({
  products,
  gallery,
  testimonials,
  quotes,
  setSection,
}: {
  products: AdminProduct[];
  gallery: GalleryItem[];
  testimonials: Testimonial[];
  quotes: QuoteRequest[];
  setSection: (s: AdminSection) => void;
}) {
  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const stats = [
    { label: "Total Products", value: products.length, icon: <Package size={22} />, color: "#2563EB", bg: "#EFF6FF", section: "products" as AdminSection },
    { label: "Gallery Items", value: gallery.length, icon: <Image size={22} />, color: "#16A34A", bg: "#F0FDF4", section: "gallery" as AdminSection },
    { label: "Testimonials", value: testimonials.length, icon: <Star size={22} />, color: "#D4AF37", bg: "#FEFCE8", section: "testimonials" as AdminSection },
    { label: "New Inquiries", value: newQuotes, icon: <MessageSquare size={22} />, color: "#DC2626", bg: "#FEF2F2", section: "quotes" as AdminSection },
  ];

  const recentQuotes = quotes.slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => setSection(s.section)}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-left hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <TrendingUp size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-0.5" style={{ fontFamily: "Poppins, sans-serif" }}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Recent inquiries */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Recent Quote Requests</h2>
          <button onClick={() => setSection("quotes")} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
        </div>
        <div className="divide-y divide-gray-50">
          {recentQuotes.map((q) => (
            <div key={q.id} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-gray-800">{q.name}</span>
                  <Badge status={q.status} />
                </div>
                <div className="text-xs text-gray-500 truncate">{q.product} — {q.message.slice(0, 60)}...</div>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{q.date}</div>
            </div>
          ))}
          {recentQuotes.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No quote requests yet.</div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Product", icon: <Package size={18} />, section: "products" as AdminSection, color: "#2563EB" },
            { label: "Add Gallery Item", icon: <Image size={18} />, section: "gallery" as AdminSection, color: "#16A34A" },
            { label: "Add Testimonial", icon: <Star size={18} />, section: "testimonials" as AdminSection, color: "#D4AF37" },
            { label: "View Inquiries", icon: <MessageSquare size={18} />, section: "quotes" as AdminSection, color: "#DC2626" },
          ].map((a) => (
            <button
              key={a.label}
              onClick={() => setSection(a.section)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15`, color: a.color }}>
                {a.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Products Panel ────────────────────────────────────────────────────────────
function emptyProduct(): Omit<AdminProduct, "id"> {
  return { name: "", desc: "", fullDesc: "", cat: "Crystal", features: [], specs: [], customizable: [], tags: [], sizes: [], imgUrl: "" };
}

function ProductModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: AdminProduct;
  onSave: (p: Omit<AdminProduct, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<AdminProduct, "id">>(initial ? { ...initial, sizes: initial.sizes ?? [] } : emptyProduct());
  const [featInput, setFeatInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [sizeInput, setSizeInput] = useState("");
  const [specLabel, setSpecLabel] = useState("");
  const [specVal, setSpecVal] = useState("");

  function addItem(field: "features" | "customizable", val: string, setter: (v: string) => void) {
    if (!val.trim()) return;
    setForm((f) => ({ ...f, [field]: [...f[field], val.trim()] }));
    setter("");
  }
  function removeItem(field: "features" | "customizable", idx: number) {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));
  }
  function addTag() {
    if (!tagInput.trim()) return;
    setForm((f) => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
    setTagInput("");
  }
  function addSpec() {
    if (!specLabel.trim() || !specVal.trim()) return;
    setForm((f) => ({ ...f, specs: [...f.specs, { label: specLabel.trim(), value: specVal.trim() }] }));
    setSpecLabel(""); setSpecVal("");
  }

  return (
    <Modal title={initial ? "Edit Product" : "Add New Product"} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Product Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Crystal Award" required />
          <Select label="Category *" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
            {PRODUCT_CATS.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </div>
        <Input label="Short Description *" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Brief product description" required />
        <Textarea label="Full Description" value={form.fullDesc} onChange={(e) => setForm({ ...form, fullDesc: e.target.value })} rows={4} placeholder="Detailed product description..." />
        <ImageUploadField label="Product Image" value={form.imgUrl} onChange={(url) => setForm({ ...form, imgUrl: url })} />

        {/* Features */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Features</label>
          <div className="flex gap-2 mb-2">
            <input value={featInput} onChange={(e) => setFeatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("features", featInput, setFeatInput))} placeholder="Add a feature..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={() => addItem("features", featInput, setFeatInput)} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.features.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100">
                {f} <button onClick={() => removeItem("features", i)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Specs */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Specifications</label>
          <div className="flex gap-2 mb-2">
            <input value={specLabel} onChange={(e) => setSpecLabel(e.target.value)} placeholder="Label (e.g. Material)" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <input value={specVal} onChange={(e) => setSpecVal(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())} placeholder="Value" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={addSpec} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="space-y-1.5">
            {form.specs.map((s, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 text-sm">
                <span className="font-medium text-gray-700">{s.label}:</span>
                <span className="text-gray-600">{s.value}</span>
                <button onClick={() => setForm((f) => ({ ...f, specs: f.specs.filter((_, ii) => ii !== i) }))}><X size={14} className="text-gray-400 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Customizable */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Customization Options</label>
          <div className="flex gap-2 mb-2">
            <input value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem("customizable", customInput, setCustomInput))} placeholder="Add option..." className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={() => addItem("customizable", customInput, setCustomInput)} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.customizable.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
                {c} <button onClick={() => removeItem("customizable", i)}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Available Sizes <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Leave empty if this product comes in one standard size only — size selection will be hidden on the product page.
          </p>
          <div className="flex gap-2 mb-2">
            <input
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!sizeInput.trim()) return;
                  setForm((f) => ({ ...f, sizes: [...(f.sizes || []), sizeInput.trim()] }));
                  setSizeInput("");
                }
              }}
              placeholder="e.g. Small — 15cm  or  A4  or  50mm"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              onClick={() => {
                if (!sizeInput.trim()) return;
                setForm((f) => ({ ...f, sizes: [...(f.sizes || []), sizeInput.trim()] }));
                setSizeInput("");
              }}
              className="px-3 py-2 rounded-lg text-white text-sm"
              style={{ background: "#2563EB" }}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(form.sizes || []).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
              >
                {s}{" "}
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, sizes: (f.sizes || []).filter((_, ii) => ii !== i) }))
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            {(form.sizes || []).length === 0 && (
              <span className="text-xs text-gray-400 italic">No sizes added — single/standard size product</span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
          <div className="flex gap-2 mb-2">
            <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="e.g. Popular, Best Seller" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            <button onClick={addTag} className="px-3 py-2 rounded-lg text-white text-sm" style={{ background: "#2563EB" }}><Plus size={16} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.tags.map((t, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium" style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}>
                <Tag size={11} /> {t} <button onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((_, ii) => ii !== i) }))}><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name && form.desc) onSave(form); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initial ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AdminProducts({ products, setProducts }: { products: AdminProduct[]; setProducts: (p: AdminProduct[]) => void }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [catFilter, setCatFilter] = useState("All");

  const filtered = products.filter((p) =>
    (catFilter === "All" || p.cat === catFilter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.cat.toLowerCase().includes(search.toLowerCase()))
  );

  function handleSave(data: Omit<AdminProduct, "id">) {
    if (editing) {
      const updated = products.map((p) => p.id === editing.id ? { ...data, id: editing.id } : p);
      setProducts(updated);
    } else {
      setProducts([...products, { ...data, id: `prod-${Date.now()}` }]);
      const subscribers: string[] = load("cdaah_subscribers", []);
      subscribers.forEach((email) => {
        sendNotificationEmail(
          email,
          `New Product: ${data.name} — Crystal Digital Art & Award House`,
          {
            Notification: "A new product has been added to Crystal Digital Art & Award House.",
            Product_Name: data.name,
            Category: data.cat,
            Description: data.desc || "—",
            Tags: data.tags?.join(", ") || "—",
            Visit: "https://crystaldigital.com.np",
          }
        );
      });
    }
    setShowModal(false);
    setEditing(null);
  }

  function handleDelete() {
    if (!deleting) return;
    setProducts(products.filter((p) => p.id !== deleting.id));
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} products in catalogue</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="All">All Categories</option>
          {PRODUCT_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Tags</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-800 text-sm">{p.name}</div>
                    <div className="text-gray-500 text-xs mt-0.5 truncate max-w-xs">{p.desc}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">{p.cat}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FDE68A" }}>{t}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(p); setShowModal(true); }} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleting(p)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <ProductModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
      {deleting && (
        <ConfirmModal message={`Are you sure you want to delete "${deleting.name}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}

// ── Gallery Panel ─────────────────────────────────────────────────────────────
function GalleryModal({
  initial,
  onSave,
  onClose,
  products,
}: {
  initial?: GalleryItem;
  onSave: (g: Omit<GalleryItem, "id">) => void;
  onClose: () => void;
  products: AdminProduct[];
}) {
  const [form, setForm] = useState<Omit<GalleryItem, "id">>(
    initial
      ? { label: initial.label, cat: initial.cat, imgUrl: initial.imgUrl, linkedProductId: initial.linkedProductId }
      : { label: "", cat: "Crystal Awards", imgUrl: "", linkedProductId: undefined }
  );

  return (
    <Modal title={initial ? "Edit Gallery Item" : "Add Gallery Item"} onClose={onClose}>
      <div className="space-y-4">
        <Input label="Title / Label *" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Gold Trophy Display" required />
        <Select label="Category *" value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })}>
          {GALLERY_CATS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <ImageUploadField label="Gallery Image" value={form.imgUrl} onChange={(url) => setForm({ ...form, imgUrl: url })} />

        {/* Product link */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">
            Link to Product <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <p className="text-xs text-gray-500 -mt-0.5">
            When linked, a visitor who opens this image in the gallery can click "Open Product Page" to go directly to that product. Leave as <em>None</em> for store, staff, or event photos that are not tied to a specific product.
          </p>
          <select
            value={form.linkedProductId || ""}
            onChange={(e) =>
              setForm({ ...form, linkedProductId: e.target.value || undefined })
            }
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          >
            <option value="">None — store / staff / event image</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.cat})
              </option>
            ))}
          </select>
          {form.linkedProductId && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1D4ED8" }}
            >
              🔗 Linked to: {products.find((p) => p.id === form.linkedProductId)?.name || form.linkedProductId}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.label) onSave(form); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initial ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AdminGallery({ gallery, setGallery, products }: { gallery: GalleryItem[]; setGallery: (g: GalleryItem[]) => void; products: AdminProduct[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);
  const [catFilter, setCatFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = gallery.filter((g) =>
    (catFilter === "All" || g.cat === catFilter) &&
    g.label.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(data: Omit<GalleryItem, "id">) {
    if (editing) {
      setGallery(gallery.map((g) => g.id === editing.id ? { ...data, id: editing.id } : g));
    } else {
      setGallery([...gallery, { ...data, id: `gal-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Gallery</h1>
          <p className="text-gray-500 text-sm mt-0.5">{gallery.length} items in gallery</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gallery..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="All">All Categories</option>
          {GALLERY_CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
              {item.imgUrl ? (
                <img src={item.imgUrl} alt={item.label} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image size={32} className="text-blue-200" />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing(item); setShowModal(true); }} className="p-1.5 rounded-lg bg-white shadow-sm text-gray-600 hover:text-blue-600">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(item)} className="p-1.5 rounded-lg bg-white shadow-sm text-gray-600 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="font-semibold text-gray-800 text-sm mb-2">{item.label}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700">{item.cat}</span>
                {item.linkedProductId ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1">
                    🔗 {products.find((p) => p.id === item.linkedProductId)?.name || "Product"}
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    No product link
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {/* Add placeholder */}
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 aspect-video sm:aspect-auto sm:min-h-[160px]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Plus size={20} className="text-blue-500" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Add Gallery Item</span>
        </button>
      </div>

      {filtered.length === 0 && gallery.length > 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No items match your filters.</div>
      )}

      {showModal && (
        <GalleryModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} products={products} />
      )}
      {deleting && (
        <ConfirmModal message={`Delete "${deleting.label}" from gallery?`} onConfirm={() => { setGallery(gallery.filter((g) => g.id !== deleting.id)); setDeleting(null); }} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}

// ── Testimonials Panel ────────────────────────────────────────────────────────
function TestimonialModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Testimonial;
  onSave: (t: Omit<Testimonial, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Omit<Testimonial, "id">>(
    initial ? { name: initial.name, company: initial.company, text: initial.text, rating: initial.rating }
      : { name: "", company: "", text: "", rating: 5 }
  );

  return (
    <Modal title={initial ? "Edit Testimonial" : "Add Testimonial"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Customer Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Sharma" required />
          <Input label="Company / Organization" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. Pokhara Academy" />
        </div>
        <Textarea label="Review / Testimonial *" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} rows={4} placeholder="Customer review text..." required />
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button key={r} onClick={() => setForm({ ...form, rating: r })} className="transition-transform hover:scale-110">
                <Star size={28} fill={r <= form.rating ? "#D4AF37" : "none"} color={r <= form.rating ? "#D4AF37" : "#D1D5DB"} />
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
          <button
            onClick={() => { if (form.name && form.text) onSave(form); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
            style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
          >
            {initial ? "Save Changes" : "Add Testimonial"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AdminTestimonials({ testimonials, setTestimonials }: { testimonials: Testimonial[]; setTestimonials: (t: Testimonial[]) => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  function handleSave(data: Omit<Testimonial, "id">) {
    if (editing) {
      setTestimonials(testimonials.map((t) => t.id === editing.id ? { ...data, id: editing.id } : t));
    } else {
      setTestimonials([...testimonials, { ...data, id: `test-${Date.now()}` }]);
    }
    setShowModal(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Testimonials</h1>
          <p className="text-gray-500 text-sm mt-0.5">{testimonials.length} customer reviews</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Plus size={18} /> Add Testimonial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Star key={r} size={14} fill={r <= t.rating ? "#D4AF37" : "none"} color={r <= t.rating ? "#D4AF37" : "#D1D5DB"} />
                ))}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(t); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setDeleting(t)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed flex-1 italic">"{t.text}"</p>
            <div className="border-t border-gray-50 pt-3">
              <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
              <div className="text-xs text-gray-500">{t.company}</div>
            </div>
          </div>
        ))}
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all flex flex-col items-center justify-center gap-2 min-h-[200px]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Plus size={20} className="text-blue-500" />
          </div>
          <span className="text-sm text-gray-500 font-medium">Add Review</span>
        </button>
      </div>

      {showModal && (
        <TestimonialModal initial={editing ?? undefined} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
      {deleting && (
        <ConfirmModal message={`Delete testimonial from "${deleting.name}"?`} onConfirm={() => { setTestimonials(testimonials.filter((t) => t.id !== deleting.id)); setDeleting(null); }} onCancel={() => setDeleting(null)} />
      )}
    </div>
  );
}

// ── Quote Requests Panel ──────────────────────────────────────────────────────
function AdminQuotes({ quotes, setQuotes }: { quotes: QuoteRequest[]; setQuotes: (q: QuoteRequest[]) => void }) {
  const [viewing, setViewing] = useState<QuoteRequest | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | QuoteRequest["status"]>("all");
  const [search, setSearch] = useState("");

  const filtered = quotes.filter((q) =>
    (statusFilter === "all" || q.status === statusFilter) &&
    (q.name.toLowerCase().includes(search.toLowerCase()) || q.product.toLowerCase().includes(search.toLowerCase()) || q.email.toLowerCase().includes(search.toLowerCase()))
  );

  function updateStatus(id: string, status: QuoteRequest["status"]) {
    const quote = quotes.find((q) => q.id === id);
    setQuotes(quotes.map((q) => q.id === id ? { ...q, status } : q));
    if (viewing?.id === id) setViewing((v) => v ? { ...v, status } : null);
    if (quote && quote.email) {
      const statusLabels: Record<QuoteRequest["status"], string> = {
        new: "Received",
        reviewed: "Under Review",
        quoted: "Price Quoted",
        closed: "Closed",
      };
      const statusMessages: Record<QuoteRequest["status"], string> = {
        new: "Your quote request has been received and is in our queue.",
        reviewed: "Our team is currently reviewing your quote request.",
        quoted: "We have prepared a price quote for your request. Our team will contact you shortly.",
        closed: "Your quote request has been closed. Thank you for your interest.",
      };
      sendNotificationEmail(
        quote.email,
        `Your Quote Request Update — Crystal Digital Art & Award House`,
        {
          Dear_Customer: quote.name,
          Product: quote.product,
          Selected_Size: quote.size || "Not specified",
          Status: statusLabels[status],
          Message: statusMessages[status],
          Contact_Us: "Call +977-61-XXXXXX or visit crystaldigital.com.np",
        }
      );
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Quote Requests</h1>
        <p className="text-gray-500 text-sm mt-0.5">{quotes.filter((q) => q.status === "new").length} new, {quotes.length} total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, product, email..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white">
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="quoted">Quoted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Product</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Date</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-gray-800 text-sm">{q.name}</div>
                    <div className="text-gray-500 text-xs">{q.email}</div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-700">{q.product}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{q.date}</span>
                  </td>
                  <td className="px-5 py-4">
                    <Badge status={q.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewing(q)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No quote requests found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View modal */}
      {viewing && (
        <Modal title="Quote Request Details" onClose={() => setViewing(null)}>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-bold text-gray-800">{viewing.name}</div>
                <div className="text-sm text-gray-500">{viewing.email} · {viewing.phone}</div>
              </div>
              <div className="ml-auto"><Badge status={viewing.status} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50">
              <div><div className="text-xs text-gray-500 mb-1">Product Interested In</div><div className="font-semibold text-gray-800 text-sm">{viewing.product}</div></div>
              <div><div className="text-xs text-gray-500 mb-1">Request Date</div><div className="font-semibold text-gray-800 text-sm">{viewing.date}</div></div>
              <div className="col-span-2">
                <div className="text-xs text-gray-500 mb-1">Selected Size</div>
                {viewing.size ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}
                  >
                    {viewing.size}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400 italic">Not specified by customer</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Message</div>
              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4">{viewing.message}</p>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Update Status</div>
              <div className="flex flex-wrap gap-2">
                {(["new", "reviewed", "quoted", "closed"] as QuoteRequest["status"][]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(viewing.id, s)}
                    className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all border"
                    style={{
                      background: viewing.status === s ? STATUS_COLORS[s] : "white",
                      color: viewing.status === s ? "white" : STATUS_COLORS[s],
                      borderColor: STATUS_COLORS[s],
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Settings Panel ────────────────────────────────────────────────────────────
function AdminSettings({ settings, setSettings }: { settings: SiteSettings; setSettings: (s: SiteSettings) => void }) {
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your business information and site settings.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
          <CheckCircle size={18} className="text-green-600" />
          <p className="text-green-700 text-sm font-medium">Settings saved successfully!</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide" style={{ fontFamily: "Poppins, sans-serif" }}>Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Business Name" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
          <Input label="Tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email Address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <Input label="WhatsApp Number" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        <Textarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
        <Input label="Working Hours" value={form.workingHours} onChange={(e) => setForm({ ...form, workingHours: e.target.value })} placeholder="e.g. Mon–Fri: 9AM–7PM" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide" style={{ fontFamily: "Poppins, sans-serif" }}>Social & Map Links</h2>
        <Input label="Facebook Page URL" value={form.facebookUrl} onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })} placeholder="https://facebook.com/..." />
        <Input label="Google Maps Link" value={form.mapLink} onChange={(e) => setForm({ ...form, mapLink: e.target.value })} placeholder="https://maps.google.com/..." />
      </div>

      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 flex items-start gap-3">
        <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-amber-700 text-sm">Settings are saved locally. In a production environment, these would sync to your backend database.</p>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg active:scale-95"
          style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}
        >
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
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
