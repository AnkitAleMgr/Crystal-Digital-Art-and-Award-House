// ── Storage Helpers ───────────────────────────────────────────────────────────
export function load<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch {
    return seed;
  }
}
export function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}
