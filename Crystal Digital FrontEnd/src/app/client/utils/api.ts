import type { QuoteSubmission } from "../types/Public";

export const PUBLIC_API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export class PublicApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fields: Record<string, string> = {}
  ) {
    super(message);
    this.status = status;
    this.fields = fields;
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${PUBLIC_API_BASE}/api${path}`, init);
  } catch {
    throw new PublicApiError(
      `Cannot reach the server at ${PUBLIC_API_BASE}.`,
      0
    );
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.status) {
    const fields: Record<string, string> = payload?.errors ?? {};
    const detail = Object.values(fields).join(" ");

    throw new PublicApiError(
      detail || payload?.message || `Request failed (${res.status})`,
      res.status,
      fields
    );
  }

  return payload.data as T;
}

const get = <T>(path: string) => request<T>(path);

const post = <T>(path: string, body: unknown) =>
  request<T>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const publicApi = {
  products: <T>() => get<T>("/products"),
  categories: <T>() => get<T>("/categories"),
  gallery: <T>() => get<T>("/gallery"),
  testimonials: <T>() => get<T>("/testimonials"),
  settings: <T>() => get<T>("/settings"),
  createQuote: (body: QuoteSubmission) =>
    post<{ id: string | null; createdAt: string }>("/quotes", body),
};
