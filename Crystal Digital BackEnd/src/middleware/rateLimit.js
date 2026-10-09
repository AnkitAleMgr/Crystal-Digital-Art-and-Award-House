// Sliding-window rate limiting with no dependency: every hit keeps its own
// timestamp, so the limit is "max hits in the last windowMs", not a calendar
// window that resets on the hour.
//
// `hits` is one module-level Map shared by every limiter built here, so each one
// namespaces its own buckets with `keyPrefix`. Without that, mounting a second
// limiter would merge it with the first and a visitor's quote requests would
// eat into their subscription attempts.
//
// The Map is in-memory: it resets on restart and does not span instances. Move
// it to Redis before running more than one process.

const WINDOW_MS = 60 * 60 * 1000;

const hits = new Map();

// The sweeper has to outlive the longest window in use, otherwise a 24h bucket
// would be emptied an hour in and the limit it enforces would silently reset.
let widestWindowMs = WINDOW_MS;

const sweep = setInterval(() => {
  const cutoff = Date.now() - widestWindowMs;

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

export const rateLimit = ({
  max = 10,
  windowMs = WINDOW_MS,
  keyPrefix = "default",
  message = "Too many requests from this device. Please try again later.",
  scope = "ip",
  // When set, exceeding the limit calls this instead of answering 429. Used by
  // the artwork budget, which must not turn a real customer's quote away.
  onLimit = null,
} = {}) => {
  widestWindowMs = Math.max(widestWindowMs, windowMs);

  // scope "global" is one bucket for the whole site. It is the only thing that
  // bounds a botnet, since a per-IP limit can be sidestepped with a new IP for
  // every request.
  const bucketFor = (req) =>
    scope === "global" ? `${keyPrefix}:all` : `${keyPrefix}:${clientKey(req)}`;

  return (req, res, next) => {
    const key = bucketFor(req);
    const now = Date.now();
    const cutoff = now - windowMs;

    const stamps = (hits.get(key) ?? []).filter((stamp) => stamp > cutoff);

    if (stamps.length >= max) {
      const retryAfter = Math.max(1, Math.ceil((stamps[0] + windowMs - now) / 1000));

      if (onLimit) {
        return onLimit(req, res, next);
      }

      res.set("Retry-After", String(retryAfter));

      return res.status(429).json({ status: false, message });
    }

    stamps.push(now);
    hits.set(key, stamps);

    next();
  };
};

// 10 per IP per hour. Worded to send urgent enquiries to the phone, because
// unlike a subscription a quote is something the visitor is waiting on.
export const quoteRateLimit = rateLimit({
  keyPrefix: "quotes",
  message:
    "Too many quote requests from this device. Please try again later, or call us directly.",
});

// Lower than the quote limit and on its own buckets: subscribing is a one-off,
// and the only thing worth stopping here is a script filling the list. The
// 429 is worded to invite a retry rather than a phone call, because unlike a
// quote the visitor is not waiting on us.
export const subscribeRateLimit = rateLimit({
  max: 5,
  keyPrefix: "subscribers",
  message: "Too many subscription attempts from this device. Please try again later.",
});

// Admin password-reset requests, on their own buckets. Five an hour is enough for
// somebody fat-fingering their address a couple of times, and far too few to use
// the endpoint to email-bomb an inbox.
export const forgotPasswordRateLimit = rateLimit({
  max: 5,
  keyPrefix: "admin-forgot",
  message: "Too many reset requests from this device. Please try again later.",
});

// ── Customer artwork budget ────────────────────────────────────────────────────
//
// quoteRateLimit bounds uploads per IP (10/hour x 5MB), but 10 IPs are 10x that.
// This is the ceiling on what the whole site can push into Cloudinary in a day,
// which is the number that actually protects the account quota.
//
// It does NOT answer 429, and that is deliberate. The two limits are attached to
// the same request: rejecting here would throw away a real customer's quote
// because someone else had already spent the day's budget — and the artwork is
// strictly less important than the enquiry. Instead it flags the request, and
// createPublicQuote saves the quote with the filename only, exactly as it did
// before uploads existed. The admin then sees the usual "ask for the artwork"
// fallback, so the degradation is visible rather than silent.
//
// Only a request that actually carries a file spends a slot.
const DAY_MS = 24 * 60 * 60 * 1000;

export const DAILY_ARTWORK_UPLOAD_LIMIT = 25;

const artworkBudget = rateLimit({
  max: DAILY_ARTWORK_UPLOAD_LIMIT,
  windowMs: DAY_MS,
  keyPrefix: "quote-artwork",
  scope: "global",
  onLimit: (req, _res, next) => {
    console.warn(
      `[artwork] daily budget of ${DAILY_ARTWORK_UPLOAD_LIMIT} reached — saving the quote without the image`
    );
    req.artworkOverBudget = true;
    next();
  },
});

export const artworkDailyBudget = (req, _res, next) => {
  // Only a request that actually carries a file spends a slot.
  if (!req.file) {
    return next();
  }

  artworkBudget(req, _res, next);
};
