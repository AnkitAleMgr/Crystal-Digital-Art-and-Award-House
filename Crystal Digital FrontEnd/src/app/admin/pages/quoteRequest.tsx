import { useState } from "react";
import { QuoteRequest } from "../types/interface/quoteRequest/quoteRequest";
import { Badge } from "../components/ui/badge";
import { Modal } from "../components/ui/modal";
import { sendNotificationEmail } from "../utils/sendNotification";
import { STATUS_COLORS } from "../constants/admin";
import { useAdmin } from "../components/layout/adminProvider";
import { Eye, Search, User } from "lucide-react";

// ── Quote Requests Panel ──────────────────────────────────────────────────────
export function AdminQuotes() {
  const { quotes, setQuotes } = useAdmin();
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