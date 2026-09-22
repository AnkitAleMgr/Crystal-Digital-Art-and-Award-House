import { useNavigate } from "react-router-dom";
import { Image, MessageSquare, Package, Star, TrendingUp } from "lucide-react";
import { AdminSection } from "../constants/admin";
import { Badge } from "../components/ui/badge";
import { useAdmin } from "../components/layout/adminProvider";

// ── Overview ──────────────────────────────────────────────────────────────────
export function AdminOverview() {
  const { products, gallery, testimonials, quotes } = useAdmin();
  const navigate = useNavigate();
  const newQuotes = quotes.filter((q) => q.status === "new").length;
  const stats = [
    { label: "Total Products", value: products.length, icon: <Package size={22} />, color: "#2563EB", bg: "#EFF6FF", section: "products" as AdminSection },
    { label: "Gallery Items", value: gallery.length, icon: <Image size={22} />, color: "#16A34A", bg: "#F0FDF4", section: "gallery" as AdminSection },
    { label: "Testimonials", value: testimonials.length, icon: <Star size={22} />, color: "#D4AF37", bg: "#FEFCE8", section: "testimonials" as AdminSection },
    { label: "New Inquiries", value: newQuotes, icon: <MessageSquare size={22} />, color: "#DC2626", bg: "#FEF2F2", section: "quotes" as AdminSection },
  ];

  const recentQuotes = quotes.slice(0, 4);
  function go(section: AdminSection) {
    navigate(section === "overview" ? "/admin" : `/admin/${section}`);
  }

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
            onClick={() => go(s.section)}
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
          <button onClick={() => go("quotes")} className="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
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
              onClick={() => go(a.section)}
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