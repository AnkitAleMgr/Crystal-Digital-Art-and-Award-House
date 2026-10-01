import jwt from "jsonwebtoken";

// The token in a confirmation / unsubscribe link. There is no token column on
// the subscriber document on purpose: a signed token is self-contained, so
// unsubscribing needs no lookup table and there is no secret sitting in the
// database to leak.
//
// The `purpose` claim is the load-bearing part. One secret signs both link
// types, so without it a confirmation link could be replayed as an unsubscribe
// (or the reverse) by editing the URL. verifySubscriberToken refuses a token
// whose purpose is not the one the caller asked about.
//
// A subscriber token is NOT an admin token even when it falls back to
// ACCESS_TOKEN_SECRET: authMiddleware does AdminModel.findById(decoded.id) and
// these payloads carry no `id`, so every one of them 401s.

const CONFIRM_TTL = "24h";

// Long-lived on purpose. An unsubscribe link that expires in a day is useless —
// people read newsletters weeks later — and the only thing it can do is stop
// mail to one address, which that address asked for.
const UNSUBSCRIBE_TTL = "365d";

const secret = () =>
  process.env.SUBSCRIBER_TOKEN_SECRET?.trim() ||
  process.env.ACCESS_TOKEN_SECRET?.trim() ||
  "";

export const isSubscriberTokenConfigured = () => Boolean(secret());

/** Returns null (never throws) when no secret is configured. */
export const signSubscriberToken = (email, purpose) => {
  const key = secret();

  if (!key) {
    console.error(
      "[subscribeTokens] no SUBSCRIBER_TOKEN_SECRET or ACCESS_TOKEN_SECRET set — token was NOT signed"
    );
    return null;
  }

  return jwt.sign(
    { email: String(email ?? "").trim().toLowerCase(), purpose },
    key,
    { expiresIn: purpose === "confirm" ? CONFIRM_TTL : UNSUBSCRIBE_TTL }
  );
};

/** Returns the lowercased email, or null for a bad/expired/wrong-purpose token. */
export const verifySubscriberToken = (token, purpose) => {
  const key = secret();

  if (!key || !token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, key);

    if (payload?.purpose !== purpose) {
      return null;
    }

    const email = typeof payload.email === "string" ? payload.email.toLowerCase().trim() : "";

    return email || null;
  } catch {
    return null;
  }
};
