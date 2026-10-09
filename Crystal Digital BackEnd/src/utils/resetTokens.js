import crypto from "crypto";
import jwt from "jsonwebtoken";

// The single-use token inside a password-reset link. Like the subscriber tokens,
// there is no token column: a signed token is self-contained, so a reset needs no
// lookup table and nothing secret sits in the database to leak.
//
// Two claims do the load-bearing work:
//   purpose  stops a reset link being replayed at another endpoint (and a
//            subscriber link being replayed here), even when one secret signs all.
//   ph       is a SHA-256 digest of the admin's CURRENT password hash. The moment
//            the password changes — including by this very reset — every
//            outstanding link stops verifying, so a link works exactly once and a
//            stolen copy cannot be reused.
//
// A reset token is NOT a session token: authMiddleware loads the admin by id and
// this payload never carries session semantics, but the purpose claim and the
// hour-long life are what keep it from being one.

const RESET_TTL = "1h";

// RESET_TOKEN_SECRET is preferred, falling back to ACCESS_TOKEN_SECRET so a fresh
// setup still works with no extra .env key. Rotating ACCESS_TOKEN_SECRET then
// invalidates any reset link still in flight, which the short TTL already limits.
const secret = () =>
  process.env.RESET_TOKEN_SECRET?.trim() ||
  process.env.ACCESS_TOKEN_SECRET?.trim() ||
  "";

// SHA-256 of the stored bcrypt hash. The hash itself never leaves the server;
// only this digest travels inside the token.
export const passwordFingerprint = (hash) =>
  crypto.createHash("sha256").update(String(hash ?? "")).digest("hex");

/** Returns null (never throws) when no secret is configured. */
export const signResetToken = (admin) => {
  const key = secret();

  if (!key) {
    console.error(
      "[resetTokens] no RESET_TOKEN_SECRET or ACCESS_TOKEN_SECRET set — token was NOT signed"
    );
    return null;
  }

  return jwt.sign(
    {
      id: String(admin._id),
      purpose: "reset",
      ph: passwordFingerprint(admin.password),
    },
    key,
    { expiresIn: RESET_TTL }
  );
};

/** Returns { id, ph }, or null for a bad/expired/wrong-purpose token. */
export const verifyResetToken = (token) => {
  const key = secret();

  if (!key || !token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, key);

    if (
      payload?.purpose !== "reset" ||
      typeof payload?.id !== "string" ||
      typeof payload?.ph !== "string"
    ) {
      return null;
    }

    return { id: payload.id, ph: payload.ph };
  } catch {
    return null;
  }
};
