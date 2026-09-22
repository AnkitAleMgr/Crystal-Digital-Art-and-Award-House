import React, { createContext, useContext, useState } from "react";
import { AdminProduct } from "../../types/interface/production/adminProduct";
import { GalleryItem } from "../../types/interface/gallery/gakkeryItem";
import { Testimonial } from "../../types/interface/testimonials/testimonials";
import { QuoteRequest } from "../../types/interface/quoteRequest/quoteRequest";
import { SiteSettings } from "../../types/interface/setting/siteSetting";
import { SEED_GALLERY, SEED_PRODUCTS, SEED_QUOTES, SEED_SETTINGS, SEED_TESTIMONIALS } from "../../data/seed";
import { load, save } from "../../utils/storage";

type AdminContextValue = {
  authed: boolean;
  onLogin: () => void;
  onLogout: () => void;
  products: AdminProduct[];
  setProducts: (p: AdminProduct[]) => void;
  gallery: GalleryItem[];
  setGallery: (g: GalleryItem[]) => void;
  testimonials: Testimonial[];
  setTestimonials: (t: Testimonial[]) => void;
  quotes: QuoteRequest[];
  setQuotes: (q: QuoteRequest[]) => void;
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  quoteCount: number;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("cdaah_admin") === "1");
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

  function onLogin() { setAuthed(true); }
  function onLogout() {
    sessionStorage.removeItem("cdaah_admin");
    setAuthed(false);
  }
  function setProducts(p: AdminProduct[]) { setProductsState(p); save("cdaah_products", p); }
  function setGallery(g: GalleryItem[]) { setGalleryState(g); save("cdaah_gallery", g); }
  function setTestimonials(t: Testimonial[]) { setTestimonialsState(t); save("cdaah_testimonials", t); }
  function setQuotes(q: QuoteRequest[]) { setQuotesState(q); save("cdaah_quotes", q); }
  function setSettings(s: SiteSettings) { setSettingsState(s); save("cdaah_settings", s); }

  const quoteCount = quotes.filter((q) => q.status === "new").length;

  return (
    <AdminContext.Provider value={{ authed, onLogin, onLogout, products, setProducts, gallery, setGallery, testimonials, setTestimonials, quotes, setQuotes, settings, setSettings, quoteCount }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}