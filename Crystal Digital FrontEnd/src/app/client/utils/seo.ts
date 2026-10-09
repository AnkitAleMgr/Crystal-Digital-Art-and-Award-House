// On-page SEO for a client-rendered SPA: every route serves the same static
// index.html, so the meaningful title/description/canonical can only be written
// after React mounts. Each page calls applyPageMeta() once its content is
// known; this is what Google and social scrapers read after running the JS.
//
// Domain-specific URLs (robots.txt, sitemap.xml) are static files and hardcode
// the production origin. Here we use window.location.origin instead, so the
// tags are correct on localhost during development and on the real domain
// after deployment without a rebuild.

export interface PageMeta {
  /** Document title, ideally ≤ 60 characters with the brand at one end. */
  title: string;
  /** Meta description, ~140–160 characters of real sales copy. */
  description: string;
  /** Utility/admin pages pass true — they must never appear in search results. */
  noindex?: boolean;
  /** og:type; defaults to "website". Product pages pass "product". */
  type?: string;
}

const META_NAMES = {
  description: "description",
  robots: "robots",
  "og:title": "og:title",
  "og:description": "og:description",
  "og:url": "og:url",
  "og:type": "og:type",
  "twitter:title": "twitter:title",
  "twitter:description": "twitter:description",
} as const;

/** Gets the existing <meta>/<link> by name/property, creating it if absent. */
function upsertTag(attr: "name" | "property", key: string): HTMLElement {
  const value = META_NAMES[key as keyof typeof META_NAMES] ?? key;
  const selector = `meta[${attr}="${value}"]`;
  const found = document.head.querySelector<HTMLElement>(selector);

  if (found) return found;

  const meta = document.createElement("meta");
  meta.setAttribute(attr, value);
  document.head.appendChild(meta);
  return meta;
}

/**
 * Pushes the per-page SEO tags for the route that is now on screen:
 * title, description, robots, canonical and the Open Graph/Twitter set.
 * Safe to call on every navigation — every tag is updated in place.
 */
export function applyPageMeta({ title, description, noindex = false, type = "website" }: PageMeta): void {
  const url = window.location.origin + window.location.pathname;

  document.title = title;
  upsertTag("name", "description").setAttribute("content", description);
  upsertTag("name", "robots").setAttribute("content", noindex ? "noindex, nofollow" : "index, follow");

  // Canonical collapses www/non-www and any leftover query strings onto one
  // URL, so link equity is not split between duplicates.
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  upsertTag("property", "og:title").setAttribute("content", title);
  upsertTag("property", "og:description").setAttribute("content", description);
  upsertTag("property", "og:url").setAttribute("content", url);
  upsertTag("property", "og:type").setAttribute("content", type);
  upsertTag("name", "twitter:title").setAttribute("content", title);
  upsertTag("name", "twitter:description").setAttribute("content", description);
}
