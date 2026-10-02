import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AdminProduct } from "../../types/interface/production/adminProduct";
import { AdminCategory } from "../../types/interface/category/category";
import { GalleryItem } from "../../types/interface/gallery/gakkeryItem";
import { Testimonial } from "../../types/interface/testimonials/testimonials";
import { QuoteRequest } from "../../types/interface/quoteRequest/quoteRequest";
import { SiteSettings } from "../../types/interface/setting/siteSetting";
import { Subscriber } from "../../types/interface/subscriber/subscriber";
import type { AdminUser } from "../../types/adminUser";
import { SEED_SETTINGS } from "../../data/seed";
import { api, setUnauthorizedHandler, TOKEN_KEY, usersApi } from "../../utils/api";

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
  /**
   * The shared product/gallery category list. It drives the Category selects
   * here and, through GET /api/categories, the filter pills on the public site.
   */
  categories: AdminCategory[];
  createCategory: (name: string) => Promise<AdminCategory>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string, name: string) => Promise<void>;
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
  deleteQuote: (id: string) => Promise<void>;
  refreshQuotes: () => Promise<void>;
  settings: SiteSettings;
  saveSettings: (data: SiteSettings) => Promise<void>;
  quoteCount: number;
  /**
   * The newsletter list. Read-only from here on purpose: subscribers arrive
   * through the public footer form and change status by clicking the link in
   * their own email, so the only admin action is removing one entirely.
   */
  subscribers: Subscriber[];
  deleteSubscriber: (id: string) => Promise<void>;
  refreshSubscribers: () => Promise<void>;
  /** How many rows the next product broadcast would actually go out to. */
  activeSubscriberCount: number;
  users: AdminUser[];
  refreshUsers: () => Promise<void>;
  addUser: (data: import("../../types/adminUser").AdminUserCreate) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  currentUser: AdminUser | null;
  isAdminUser: boolean;
};

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem("cdaah_admin") === "1"
  );
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
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
    setCurrentUser(null);
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
      api.getAll<AdminCategory>("categories"),
      api.getAll<GalleryItem>("gallery"),
      api.getAll<Testimonial>("testimonials"),
      api.getAll<QuoteRequest>("quotes"),
      api.getAll<Subscriber>("subscribers"),
      api.getSettings<SiteSettings>(),
    ])
      .then(([p, c, g, t, q, sub, s]) => {
        if (cancelled) return;
        setProducts(p);
        setCategories(c);
        setGallery(g);
        setTestimonials(t);
        setQuotes(q);
        setSubscribers(sub);
        if (s) setSettings(s);

      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof Error && !/session expired/i.test(err.message)) {
          setError(err.message);
        }
      })
            .then(() => {
        if (cancelled) return;
        return fetch((import.meta.env.VITE_API_BASE ?? "http://localhost:3000") + "/admin/me", {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("cdaah_token") || ""}` },
        })
          .then((r) => r.json())
          .then((me: any) => {
            const u = me?.data || me?.user;
            if (u) setCurrentUser(u);
          })
          .catch(() => {});
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

  const createCategory = (name: string) =>
    run(() => api.create<AdminCategory>("categories", { name })).then((created) => {
      // Appended locally rather than re-sorted: the API already returns the
      // display order and a new category lands last in it.
      setCategories((prev) => [...prev, created]);
      return created;
    });

  // Products and gallery items hold the category *name*, so renaming one has to
  // be mirrored here or the tables would keep showing a category that no longer
  // exists until the next reload. The backend does the same rewrite server-side.
  const renameCategory = async (id: string, name: string) => {
    const updated = await run(() =>
      api.update<AdminCategory>("categories", id, { name })
    );
    const previous = categories.find((c) => c.id === id)?.name;
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
    if (previous && previous !== updated.name) {
      setProducts((prev) =>
        prev.map((p) => (p.cat === previous ? { ...p, cat: updated.name } : p))
      );
      setGallery((prev) =>
        prev.map((g) => (g.cat === previous ? { ...g, cat: updated.name } : g))
      );
    }
  };

  // Deleting a category does not delete what used it: the server clears `cat`,
  // which the admin tables and the site both show as "Uncategorized". The name
  // is passed alongside the id because that is what the docs were storing.
  const deleteCategory = async (id: string, name: string) => {
    await run(() => api.remove("categories", id));
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) =>
      prev.map((p) => (p.cat === name ? { ...p, cat: "" } : p))
    );
    setGallery((prev) =>
      prev.map((g) => (g.cat === name ? { ...g, cat: "" } : g))
    );
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

  const deleteQuote = async (id: string) => {
    await run(() => api.remove("quotes", id));
    setQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const refreshQuotes = async () => {
    const fresh = await run(() => api.getAll<QuoteRequest>("quotes"));
    setQuotes(fresh);
  };

  const saveSettings = async (data: SiteSettings) => {
    const saved = await run(() => api.saveSettings<SiteSettings>(data));
    if (saved) setSettings(saved);
  };

  const deleteSubscriber = async (id: string) => {
    await run(() => api.remove("subscribers", id));
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  // Somebody can subscribe while the dashboard is open, exactly like a new
  // quote — the provider never polls, so this is the same explicit-refresh
  // pattern the Quotes page uses.
  const refreshSubscribers = async () => {
    const fresh = await run(() => api.getAll<Subscriber>("subscribers"));
    setSubscribers(fresh);
  };


  
  const refreshUsers = async () => {
    const u = await run(() => usersApi.list());
    setUsers(u);
  };
  const addUser = async (data: import("../../types/adminUser").AdminUserCreate) => {
    const created = await run(() => usersApi.create(data));
    setUsers((prev) => [created, ...prev]);
  };
  const deleteUser = async (id: string) => {
    await run(() => usersApi.remove(id));
    setUsers((prev) => prev.filter((x) => x.id !== id));
  };
  const isAdminUser = currentUser?.role === "admin";

  const quoteCount = quotes.filter((q) => q.status === "new").length;
  const activeSubscriberCount = subscribers.filter((s) => s.status === "active").length;

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
        categories,
        createCategory,
        renameCategory,
        deleteCategory,
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
        deleteQuote,
        refreshQuotes,
        settings,
        saveSettings,
        quoteCount,
        subscribers,
        deleteSubscriber,
        refreshSubscribers,
        activeSubscriberCount,
        users,
        refreshUsers,
        addUser,
        deleteUser,
        currentUser,
        isAdminUser,
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