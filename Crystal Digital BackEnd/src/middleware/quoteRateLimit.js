const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

const hits = new Map();

const sweep = setInterval(() => {
  const cutoff = Date.now() - WINDOW_MS;

  for (const [key, stamps] of hits) {
    const kept = stamps.filter((stamp) => stamp > cutoff);

    if (kept.length === 0) {
      hits.delete(key);
    } else {
      hits.set(key, kept);
    }
  }
}, WINDOW_MS);

sweep.unref();

// X-Forwarded-For is checked first on purpose: when the app sits behind a proxy
// and "trust proxy" is not enabled, express reports the proxy's own address as
// req.ip, which would collapse every visitor into a single shared bucket.
const clientKey = (req) => {
  const forwarded = req.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }

  return req.ip || "unknown";
};

export const quoteRateLimit = (req, res, next) => {
  const key = clientKey(req);
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const stamps = (hits.get(key) ?? []).filter((stamp) => stamp > cutoff);

  if (stamps.length >= MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((stamps[0] + WINDOW_MS - now) / 1000));

    res.set("Retry-After", String(retryAfter));

    return res.status(429).json({
      status: false,
      message:
        "Too many quote requests from this device. Please try again later, or call us directly.",
    });
  }

  stamps.push(now);
  hits.set(key, stamps);

  next();
};
