import { Link, useLocation } from "react-router-dom";
import { Lock, LogOut, X } from "lucide-react";
import { AdminSection, NAV_ITEMS } from "../../constants/admin";
import { useAdmin } from "./adminProvider";

export function Sidebar({
  onLogout,
  mobileOpen,
  setMobileOpen,
}: {
  onLogout: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { quoteCount } = useAdmin();
  const location = useLocation();
  const section: AdminSection = sectionFromPath(location.pathname);

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "linear-gradient(180deg, #0F172A 0%, #1E3A8A 100%)" }}
      >
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

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            return (
              <Link
                key={item.id}
                to={item.id === "overview" ? "/admin" : `/admin/${item.id}`}
                onClick={() => setMobileOpen(false)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "text-white" : "text-blue-200 hover:text-white hover:bg-white/10"}`}
                style={active ? { background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" } : {}}
              >
                <span className={active ? "text-[#D4AF37]" : ""}>{item.icon}</span>
                <span style={{ fontFamily: "Poppins, sans-serif" }}>{item.label}</span>
                {item.id === "quotes" && quoteCount > 0 && (
                  <span className="ml-auto text-xs font-bold bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">{quoteCount}</span>
                )}
              </Link>
            );
          })}
        </nav>

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

function sectionFromPath(pathname: string): AdminSection {
  const last = pathname.split("/").filter(Boolean)[1] ?? "overview";
  return NAV_ITEMS.some((n) => n.id === last) ? (last as AdminSection) : "overview";
}