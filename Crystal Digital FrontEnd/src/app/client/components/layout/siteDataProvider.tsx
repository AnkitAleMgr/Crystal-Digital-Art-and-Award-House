import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "../../types/Product";
import {
  PublicGalleryItem,
  PublicSettings,
  PublicTestimonial,
} from "../../types/Public";
import { SITE_DEFAULTS, withSettingsDefaults } from "../../data/siteDefaults";
import { publicApi } from "../../utils/api";

type SiteContextValue = {
  products: Product[];
  gallery: PublicGalleryItem[];
  testimonials: PublicTestimonial[];
  /** Always populated — blank fields fall back to SITE_DEFAULTS. */
  settings: PublicSettings;
  loading: boolean;
  error: string;
};

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

export function SiteDataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [gallery, setGallery] = useState<PublicGalleryItem[]>([]);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>([]);
  const [settings, setSettings] = useState<PublicSettings>(SITE_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      publicApi.products<Product[]>(),
      publicApi.gallery<PublicGalleryItem[]>(),
      publicApi.testimonials<PublicTestimonial[]>(),
      publicApi.settings<PublicSettings | null>(),
    ])
      .then(([p, g, t, s]) => {
        if (cancelled) return;
        setProducts(p);
        setGallery(g);
        setTestimonials(t);
        setSettings(withSettingsDefaults(s));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Could not load content. Please try again later."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteContext.Provider
      value={{ products, gallery, testimonials, settings, loading, error }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteData() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSiteData must be used within SiteDataProvider");
  return ctx;
}
