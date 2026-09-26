import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AdminProduct } from "../../types/interface/production/adminProduct";
import { GalleryItem } from "../../types/interface/gallery/gakkeryItem";
import { Testimonial } from "../../types/interface/testimonials/testimonials";
import { QuoteRequest } from "../../types/interface/quoteRequest/quoteRequest";
import { SiteSettings } from "../../types/interface/setting/siteSetting";
import { SEED_SETTINGS } from "../../data/seed";
import { api, setUnauthorizedHandler, TOKEN_KEY } from "../../utils/api";

type AdminContextValue = {
  authed: boolean;
  onLogin: () => void;
  onLogout: () => void;
  loading: boolean;
  error: string;
  clearError: () => void;
  products: AdminProduct[];
  createProduct: (data: Omit<AdminProduct, "id">) => Promise<AdminProduct>;
  updateProduct: (id: string, data: Omit<AdminProduct, "id">) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  gallery: GalleryItem[];
  createGalleryItem: (data: Omit<GalleryItem, "id">) => Promise<GalleryItem>;
  updateGalleryItem: (id: string, data: Omit<GalleryItem, "id">) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  testimonials: Testimonial[];
  createTestimonial: (data: Omit<Testimonial, "id">) => Promise<Testimonial>;
  updateTestimonial: (id: string, data: Omit<Testimonial, "id">) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  quotes: QuoteRequest[];
  updateQuoteStatus: (id: string, status: QuoteRequest["status"]) => Promise<void>;
  settings: SiteSettings;
  saveSettings: (data: SiteSettings) => Promise<void>;
  quoteCount: number;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("cdaah_admin") === "1"
  );
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(SEED_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = useCallback(() => setError(""), []);

  const run = useCallback(async <T,>(task: () => Promise<T>): Promise<T> => {
    setError("");
    try {
      return await task();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      if (!(err && typeof err === "object" && "status" in err && (err as { status: number }).status === 401)) {
        setError(message);
      }
      throw err;
    }
  }, []);

  const onLogout = useCallback(() => {
    sessionStorage.removeItem("cdaah_admin");
    sessionStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => onLogout());
    return () => setUnauthorizedHandler(null);
  }, [onLogout]);

  useEffect(() => {
    if (!authed) return;

    let cancelled = false;

    setLoading(true);

    Promise.all([
      api.getAll<AdminProduct>("products"),
      api.getAll<GalleryItem>("gallery"),
      api.getAll<Testimonial>("testimonials"),
      api.getAll<QuoteRequest>("quotes"),
      api.getSettings<SiteSettings>(),
    ])
      .then(([p, g, t, q, s]) => {
        if (cancelled) return;
        setProducts(p);
        setGallery(g);
        setTestimonials(t);
        setQuotes(q);
        if (s) setSettings(s);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof Error && !/session expired/i.test(err.message)) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authed]);

  const createProduct = (data: Omit<AdminProduct, "id">) =>
    run(() => api.create<AdminProduct>("products", data)).then((created) => {
      setProducts((prev) => [created, ...prev]);
      return created;
    });

  const updateProduct = async (id: string, data: Omit<AdminProduct, "id">) => {
    const updated = await run(() => api.update<AdminProduct>("products", id, data));
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const deleteProduct = async (id: string) => {
    await run(() => api.remove("products", id));
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const createGalleryItem = (data: Omit<GalleryItem, "id">) =>
    run(() => api.create<GalleryItem>("gallery", data)).then((created) => {
      setGallery((prev) => [created, ...prev]);
      return created;
    });

  const updateGalleryItem = async (id: string, data: Omit<GalleryItem, "id">) => {
    const updated = await run(() => api.update<GalleryItem>("gallery", id, data));
    setGallery((prev) => prev.map((g) => (g.id === id ? updated : g)));
  };

  const deleteGalleryItem = async (id: string) => {
    await run(() => api.remove("gallery", id));
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  const createTestimonial = (data: Omit<Testimonial, "id">) =>
    run(() => api.create<Testimonial>("testimonials", data)).then((created) => {
      setTestimonials((prev) => [created, ...prev]);
      return created;
    });

  const updateTestimonial = async (id: string, data: Omit<Testimonial, "id">) => {
    const updated = await run(() => api.update<Testimonial>("testimonials", id, data));
    setTestimonials((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const deleteTestimonial = async (id: string) => {
    await run(() => api.remove("testimonials", id));
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  };

  const updateQuoteStatus = async (id: string, status: QuoteRequest["status"]) => {
    const updated = await run(() => api.update<QuoteRequest>("quotes", id, { status }));
    setQuotes((prev) => prev.map((q) => (q.id === id ? updated : q)));
  };

  const saveSettings = async (data: SiteSettings) => {
    const saved = await run(() => api.saveSettings<SiteSettings>(data));
    if (saved) setSettings(saved);
  };

  const quoteCount = quotes.filter((q) => q.status === "new").length;

  return (
    <AdminContext.Provider
      value={{
        authed,
        onLogin: () => setAuthed(true),
        onLogout,
        loading,
        error,
        clearError,
        products,
        createProduct,
        updateProduct,
        deleteProduct,
        gallery,
        createGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        testimonials,
        createTestimonial,
        updateTestimonial,
        deleteTestimonial,
        quotes,
        updateQuoteStatus,
        settings,
        saveSettings,
        quoteCount,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
