export const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

export const TOKEN_KEY = "cdaah_token";

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  let res: Response;

  try {
    res = await fetch(`${API_BASE}/admin${path}`, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(
      `Cannot reach the server at ${API_BASE}. Is the backend running?`,
      0
    );
  }

  if (res.status === 401) {
    onUnauthorized?.();
    throw new ApiError("Your session expired. Please log in again.", 401);
  }

  const payload = await res.json().catch(() => null);

  if (!res.ok || !payload?.status) {
    const message =
      payload?.errors && typeof payload.errors === "object"
        ? Object.values(payload.errors as Record<string, string>).join(" ")
        : payload?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status);
  }

  return payload.data as T;
}

export const api = {
  getAll: <T>(resource: string) => request<T[]>(`/${resource}`),
  create: <T>(resource: string, body: unknown) =>
    request<T>(`/${resource}`, { method: "POST", body: JSON.stringify(body) }),
  update: <T>(resource: string, id: string, body: unknown) =>
    request<T>(`/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (resource: string, id: string) =>
    request<void>(`/${resource}/${id}`, { method: "DELETE" }),
  getSettings: <T>() => request<T>("/settings"),
  saveSettings: <T>(body: unknown) =>
    request<T>("/settings", { method: "PUT", body: JSON.stringify(body) }),
};
