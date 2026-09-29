import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, LogOut, Menu, MessageSquare } from "lucide-react";
import { AdminSection, NAV_ITEMS } from "../../constants/admin";
import { useAdmin } from "./adminProvider";
import { Sidebar } from "./sidebar";

export function AdminLayout() {
  const { onLogout, quoteCount } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const section = sectionFromPath(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}`}</style>

      {confirmLogout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmLogout(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <LogOut size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>
                  Sign Out?
                </h3>
                <p className="text-sm text-gray-500">
                  You will be returned to the login screen. Any unsaved changes will remain in your browser.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmLogout(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} onLogout={() => setConfirmLogout(true)} />

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
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View Site"
                title="Open the website in a new tab"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <ExternalLink size={14} />
                <span className="hidden sm:inline">View Site</span>
              </a>
              <button
                onClick={() => setConfirmLogout(true)}
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