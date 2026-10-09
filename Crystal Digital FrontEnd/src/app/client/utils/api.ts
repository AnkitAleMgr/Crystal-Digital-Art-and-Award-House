import type {
  QuoteSubmission,
  SubscriberAck,
  SubscriberResult,
  SubscriberSubmission,
} from "../types/Public";

// "Where is the API?" — the public site's only HTTP access point. VITE_API_BASE
// is baked in at build time; the dev default is the local backend.
export const PUBLIC_API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

// Error for public API failures; carries the HTTP status (0 = unreachable) and
// the server's field-level validation map, shown next to the form fields.
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
// upload (a 2.7 MB PNG instead of a 240 KB WebP). An optional width adds
// w_<n>,c_limit so a full-size upload is not sent for a small slot; c_limit
// never upscales, so a narrow source is left alone.
export function cdn(url: string, width?: number): string {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  if (url.includes("/upload/f_auto,")) return url;
  const transform = width
    ? `f_auto,q_auto,w_${width},c_limit`
    : "f_auto,q_auto";
  return url.replace("/upload/", `/upload/${transform}/`);
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

// No Content-Type header on purpose. The browser has to pick the multipart
// boundary itself; setting the header by hand produces a body with no boundary
// and the server cannot find any field.
const postForm = <T>(path: string, form: FormData) =>
  request<T>(path, { method: "POST", body: form });

// The public read/write surface behind GET /api/* and POST /api/quotes,
// /api/subscribers(+confirm/unsubscribe). Components never fetch() directly.
export const publicApi = {
  products: <T>() => get<T>("/products"),
  categories: <T>() => get<T>("/categories"),
  gallery: <T>() => get<T>("/gallery"),
  testimonials: <T>() => get<T>("/testimonials"),
  settings: <T>() => get<T>("/settings"),
  // Sent as multipart so the artwork rides along with the text fields in one
  // request. Uploading the image first and posting the link afterwards would
  // leave a file on Cloudinary every time someone attaches artwork and then
  // abandons the form.
  createQuote: (body: QuoteSubmission, artwork?: File | null) => {
    const form = new FormData();

    for (const [key, value] of Object.entries(body)) {
      if (value === undefined || value === null || value === "") continue;

      // FormData holds strings only. An array of objects would otherwise become
      // the literal "[object Object]" and every customization answer would be
      // lost, which the server then reads as a missing required field.
      form.append(key, typeof value === "object" ? JSON.stringify(value) : String(value));
    }

    if (artwork) {
      form.append("artwork", artwork);
    }

    return postForm<{ id: string | null; createdAt: string }>("/quotes", form);
  },
  subscribe: (body: SubscriberSubmission) =>
    post<SubscriberAck>("/subscribers", body),
  // These two take the signed token out of the email link. They are POSTs and
  // not GETs on purpose: email clients auto-follow links with security scanners,
  // so a GET would let a scanner confirm a subscription nobody clicked.
  confirmSubscription: (token: string) =>
    post<SubscriberResult>("/subscribers/confirm", { token }),
  unsubscribe: (token: string) =>
    post<SubscriberResult>("/subscribers/unsubscribe", { token }),
};
