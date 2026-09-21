import React, { useState } from "react";
import { ChevronLeft, LogOut, Menu, MessageSquare } from "lucide-react";
import { AdminProduct } from "../../types/interface/production/adminProduct";
import { GalleryItem } from "../../types/interface/gallery/gakkeryItem";
import { Testimonial } from "../../types/interface/testimonials/testimonials";
import { QuoteRequest } from "../../types/interface/quoteRequest/quoteRequest";
import { SiteSettings } from "../../types/interface/setting/siteSetting";
import { AdminOverview } from "../../pages/DashBoard";
import { AdminProducts } from "../../pages/adminProduct";
import { AdminGallery } from "../../pages/galleryModal";
import { AdminTestimonials } from "../../pages/testimonials";
import { AdminQuotes } from "../../pages/quoteRequest";
import { AdminSettings } from "../../pages/setting";
import { SEED_GALLERY, SEED_PRODUCTS, SEED_QUOTES, SEED_SETTINGS, SEED_TESTIMONIALS } from "../../data/seed";
import { AdminSection, NAV_ITEMS } from "../../constants/admin";
import { load, save } from "../../utils/storage";
import { Sidebar } from "./sidebar";

export function AdminDashboard({ onLogout }: { onLogout: () => void }) {
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