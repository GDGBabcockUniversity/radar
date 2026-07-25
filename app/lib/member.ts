import crypto from "crypto";
import { cookies } from "next/headers";
import { CREDENTIALS } from "./constants";

// Member identity seam. Reads the shared GDG auth platform JWT from a cookie and
// returns the member, or null (anonymous) when there's no/invalid token or the
// auth env isn't configured. Never throws — missing config simply means
// anonymous, so the site and tracking keep working before auth is wired.

export interface Member {
  memberId: string;
  name?: string;
  email?: string;
}

// Minimal HS256 JWT verification (no extra dependency). Returns the decoded
// payload only when the signature and expiry check out.
function verifyHS256(
  token: string,
  secret: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest("base64url");
  const a = Buffer.from(sigB64);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    );
    if (typeof payload.exp === "number" && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/** Verifies a platform JWT with AUTH_JWT_SECRET. Null when unconfigured/invalid. */
export function verifyPlatformToken(
  token: string,
): Record<string, unknown> | null {
  if (!CREDENTIALS.auth_jwt_secret) return null;
  return verifyHS256(token, CREDENTIALS.auth_jwt_secret);
}

/**
 * Maps a verified platform JWT payload onto a Member. Exported so the session
 * route can build the member straight from a freshly refreshed token, without
 * round-tripping through the cookie store it just wrote to.
 */
export function memberFromPayload(
  payload: Record<string, unknown>,
): Member | null {
  // The auth service's JWT payload carries `user_id`/`full_name`
  // (see auth/src/services/authService.js) — check that shape first,
  // with the older guesses kept as fallbacks.
  const memberId = (payload.user_id ??
    payload.sub ??
    payload.id ??
    payload.userId) as string | undefined;
  if (!memberId) return null;
  return {
    memberId: String(memberId),
    name: (payload.full_name ?? payload.name) as string | undefined,
    email: payload.email as string | undefined,
  };
}

export async function getMember(): Promise<Member | null> {
  try {
    const store = await cookies();
    const token = store.get(CREDENTIALS.auth_cookie_name)?.value;
    if (!token) return null;
    const payload = verifyPlatformToken(token);
    if (!payload) return null;
    return memberFromPayload(payload);
  } catch {
    return null;
  }
}
