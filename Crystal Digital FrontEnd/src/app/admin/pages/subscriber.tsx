import { useMemo, useState } from "react";
import { AlertCircle, Download, Inbox, Mail, RefreshCw, Trash2, Users } from "lucide-react";
import { ConfirmModal } from "../components/ui/confirmModal";
import { formatWhen } from "../utils/formatWhen";
import { downloadCsv } from "../utils/csv";
import { useAdmin } from "../components/layout/adminProvider";
import { Subscriber } from "../types/interface/subscriber/subscriber";

type Status = Subscriber["status"];

const STATUS_STYLE: Record<Status, { label: string; color: string; bg: string }> = {
  active: { label: "Subscribed", color: "#16A34A", bg: "#F0FDF4" },
  pending: { label: "Awaiting confirmation", color: "#D4AF37", bg: "#FEFCE8" },
  unsubscribed: { label: "Unsubscribed", color: "#6B7280", bg: "#F9FAFB" },
};

const FILTERS: ("all" | Status)[] = ["all", "active", "pending", "unsubscribed"];

export function AdminSubscribers() {
  const { subscribers, activeSubscriberCount, deleteSubscriber, refreshSubscribers, error, clearError } = useAdmin();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [deleting, setDeleting] = useState<Subscriber | null>(null);

  const counts = useMemo(
    () => ({
      all: subscribers.length,
      active: activeSubscriberCount,
      pending: subscribers.filter((s) => s.status === "pending").length,
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    }),
    [subscribers, activeSubscriberCount]
  );

  const visible = useMemo(
    () => (filter === "all" ? subscribers : subscribers.filter((s) => s.status === filter)),
    [subscribers, filter]
  );

  function handleExport() {
    downloadCsv(
      `subscribers-${filter}.csv`,
      ["email", "status", "subscribed_at", "confirmed_at", "unsubscribed_at"],
      visible.map((s) => [s.email, s.status, s.createdAt, s.confirmedAt, s.unsubscribedAt])
    );
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteSubscriber(deleting.id);
      setDeleting(null);
    } catch {
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "Poppins, sans-serif" }}>Subscribers</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {activeSubscriberCount} confirmed {activeSubscriberCount === 1 ? "subscriber" : "subscribers"} will be emailed when you add a product
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshSubscribers()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={visible.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-white"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(["active", "pending", "unsubscribed"] as Status[]).map((status) => {
          const style = STATUS_STYLE[status];
          return (
            <div key={status} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: style.color }}>
                {status === "active" ? <Users size={14} /> : status === "pending" ? <Mail size={14} /> : <Inbox size={14} />}
                {style.label}
              </div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{counts[status]}</div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium flex-1">{error}</p>
          <button onClick={clearError} className="text-red-500 hover:text-red-700 text-xs font-semibold">Dismiss</button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={
              filter === key
                ? { background: "#1D4ED8", color: "#FFFFFF" }
                : { background: "#FFFFFF", color: "#6B7280", border: "1px solid #E5E7EB" }
            }
          >
            {key === "all" ? "All" : STATUS_STYLE[key].label} ({counts[key]})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <Mail size={32} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">
            {subscribers.length === 0
              ? "Nobody has subscribed yet. Addresses left in the footer form appear here once they confirm."
              : "No subscribers with this status."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {["Email", "Status", "Signed up", "Confirmed", ""].map((heading, i) => (
                    <th key={i} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const style = STATUS_STYLE[s.status];
                  return (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800 break-all">{s.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: style.color, background: style.bg }}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{formatWhen(s.createdAt)}</td>
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">{s.confirmedAt ? formatWhen(s.confirmedAt) : "—"}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => setDeleting(s)}
                          aria-label={`Delete ${s.email}`}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleting && (
        <ConfirmModal
          message={`Remove "${deleting.email}" from the list entirely? If they are an active subscriber they will stop receiving product updates.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
