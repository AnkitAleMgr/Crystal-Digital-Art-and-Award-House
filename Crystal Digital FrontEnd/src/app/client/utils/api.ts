export const PUBLIC_API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export class PublicApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/**
 * Cloudinary serves WebP/AVIF automatically and picks a sensible quality when
 * f_auto and q_auto are present. This is what turns the original 3-4MB PNGs
 * into ~100-300KB responses, so every image URL should pass through here.
 */
// Cloudinary delivery transforms have to be injected into the URL *path*, not
// appended as a query string: .../image/upload/f_auto,q_auto/<version>/<id>.
// Appending "?f_auto&q_auto" is silently ignored and serves the original
// upload (a 2.7 MB PNG instead of a 240 KB WebP).
export function cdn(url: string): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  if (url.includes("/upload/f_auto,")) return url;
  return url.replace("/upload/", "/upload/f_auto,q_auto/");
}

async function get<T>(path: string): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${PUBLIC_API_BASE}/api${path}`);
  } catch {
    throw new PublicApiError(
      `Cannot reach the server at ${PUBLIC_API_BASE}.`,
      0
    );
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.status) {
    throw new PublicApiError(
      payload?.message || `Request failed (${res.status})`,
      res.status
    );
  }

  return payload.data as T;
}

export const publicApi = {
  products: <T>() => get<T>("/products"),
  gallery: <T>() => get<T>("/gallery"),
  testimonials: <T>() => get<T>("/testimonials"),
  settings: <T>() => get<T>("/settings"),
};
