// The public address of the website. The backend cannot infer it: it serves JSON
// on port 3000 while the site is served from somewhere else entirely, and a
// confirmation link has to point at a page a human can click.
//
// Falls back to the Vite dev server so `npm run dev` works with no .env change.
// In production SITE_URL must be the real public origin — the unsubscribe links
// in every broadcast email are built from it.
const DEFAULT_SITE_URL = "http://localhost:5173";

export const siteUrl = () =>
  (process.env.SITE_URL?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");

export const siteLink = (path) => {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${suffix}`;
};
