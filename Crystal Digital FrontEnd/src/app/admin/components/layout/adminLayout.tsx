import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, LogOut, Menu, MessageSquare } from "lucide-react";
import { AdminSection, NAV_ITEMS } from "../../constants/admin";
import { useAdmin } from "./adminProvider";
import { Sidebar } from "./sidebar";

export function AdminLayout() {
  const { onLogout, quoteCount } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"logout" | "viewSite" | null>(null);

  const section = sectionFromPath(location.pathname);

  function handleConfirm() {
    if (confirmAction === "logout") onLogout();
    if (confirmAction === "viewSite") window.location.hash = "";
    setConfirmAction(null);
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

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

      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} onLogout={() => setConfirmAction("logout")} />

      <div className="lg:pl-64 min-h-screen flex flex-col">
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
              {quoteCount > 0 && (
                <button onClick={() => navigate("/admin/quotes")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors">
                  <MessageSquare size={14} />
                  {quoteCount} new
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

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function sectionFromPath(pathname: string): AdminSection {
  const last = pathname.split("/").filter(Boolean)[1] ?? "overview";
  return NAV_ITEMS.some((n) => n.id === last) ? (last as AdminSection) : "overview";
}