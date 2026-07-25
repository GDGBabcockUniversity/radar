import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CREDENTIALS } from "@/app/lib/constants";
import {
  getMember,
  memberFromPayload,
  verifyPlatformToken,
  type Member,
} from "@/app/lib/member";

// Session bridge: exchanges a Firebase ID token for the shared platform JWT
// (via the auth service's own /auth/login) and stores it as the httpOnly
// cookie app/lib/member.ts's getMember() already expects.
//
// The access token lives 24h. On its own that logged everyone out daily — and
// because app/lib/engagement.ts only writes reads/scores when it can see a
// valid token, a whole day's activity was being dropped on the floor after
// every expiry. So we also keep the refresh token the auth service already
// hands us and renew silently in GET, which AuthProvider calls on mount.

// Matches the auth service's JWT_REFRESH_EXPIRES_IN ("7d") and the
// refresh_tokens.expires_at row it writes (auth/src/services/authService.js).
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

type CookieStore = Awaited<ReturnType<typeof cookies>>;

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function setAccessCookie(store: CookieStore, token: string, expiresIn: number) {
  store.set(CREDENTIALS.auth_cookie_name, token, cookieOptions(expiresIn));
}

function setRefreshCookie(store: CookieStore, token: string) {
  store.set(
    CREDENTIALS.auth_refresh_cookie_name,
    token,
    cookieOptions(REFRESH_MAX_AGE),
  );
}

function clearSessionCookies(store: CookieStore) {
  store.delete(CREDENTIALS.auth_cookie_name);
  store.delete(CREDENTIALS.auth_refresh_cookie_name);
}

/**
 * Trades the refresh cookie for a fresh access token and rewrites the access
 * cookie. Returns the member on success, null when there's no usable refresh
 * token — in which case the caller just reports an anonymous session and the
 * client falls back to re-exchanging its (still valid) Firebase token.
 *
 * The auth service's /auth/refresh returns a new access token only; the
 * refresh token itself is not rotated, so its cookie is left untouched.
 */
async function refreshSession(store: CookieStore): Promise<Member | null> {
  const refreshToken = store.get(
    CREDENTIALS.auth_refresh_cookie_name,
  )?.value;
  if (!refreshToken || !CREDENTIALS.auth_api_url) return null;

  try {
    const res = await fetch(`${CREDENTIALS.auth_api_url}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      // Refresh token revoked or past its 7 days — drop it so we stop
      // retrying on every page load.
      clearSessionCookies(store);
      return null;
    }

    const data = await res.json();
    const accessToken = data?.tokens?.access_token;
    const expiresIn = Number(data?.tokens?.expires_in) || 60 * 60 * 24;
    if (!accessToken) return null;

    const payload = verifyPlatformToken(accessToken);
    if (!payload) return null;

    setAccessCookie(store, accessToken, expiresIn);
    return memberFromPayload(payload);
  } catch {
    // Network/timeout — keep the refresh cookie and try again next load.
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!CREDENTIALS.auth_api_url || !CREDENTIALS.auth_jwt_secret) {
      return NextResponse.json(
        { success: false, error: "Auth is not configured" },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const firebaseToken = body?.firebase_token;
    if (!firebaseToken || typeof firebaseToken !== "string") {
      return NextResponse.json(
        { success: false, error: "firebase_token is required" },
        { status: 400 }
      );
    }

    const loginRes = await fetch(`${CREDENTIALS.auth_api_url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_token: firebaseToken }),
      signal: AbortSignal.timeout(10000),
    });

    if (!loginRes.ok) {
      return NextResponse.json(
        { success: false, error: "Authentication failed" },
        { status: 401 }
      );
    }

    const data = await loginRes.json();
    const accessToken = data?.tokens?.access_token;
    const refreshToken = data?.tokens?.refresh_token;
    const expiresIn = Number(data?.tokens?.expires_in) || 60 * 60 * 24;
    const user = data?.user;
    if (!accessToken || !user) {
      return NextResponse.json(
        { success: false, error: "Unexpected auth response" },
        { status: 502 }
      );
    }

    // A cookie that getMember() can't verify is worse than no cookie:
    // sign-in appears to work, then every later request is anonymous —
    // sessions vanish on refresh and scores silently drop. Catch a
    // mismatched AUTH_JWT_SECRET here, the only moment it's diagnosable.
    if (!verifyPlatformToken(accessToken)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Server auth misconfigured: AUTH_JWT_SECRET does not match the auth service",
        },
        { status: 500 }
      );
    }

    const store = await cookies();
    setAccessCookie(store, accessToken, expiresIn);
    // Optional: an auth service that stops issuing refresh tokens just means
    // we're back to the old expire-and-sign-in-again behaviour, not an error.
    if (typeof refreshToken === "string" && refreshToken) {
      setRefreshCookie(store, refreshToken);
    }

    return NextResponse.json({
      success: true,
      member: {
        memberId: user.id,
        name: user.full_name,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Session exchange failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const store = await cookies();
  const accessToken = store.get(CREDENTIALS.auth_cookie_name)?.value;
  const refreshToken = store.get(
    CREDENTIALS.auth_refresh_cookie_name,
  )?.value;

  // Revoke the refresh token server-side so a stolen cookie can't outlive the
  // sign-out. Best-effort: /auth/logout needs a live access token, which we
  // won't have if this sign-out follows an expiry.
  if (accessToken && refreshToken && CREDENTIALS.auth_api_url) {
    try {
      await fetch(`${CREDENTIALS.auth_api_url}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      /* the cookies still get cleared below */
    }
  }

  clearSessionCookies(store);
  return NextResponse.json({ success: true });
}

// GET — hydrate current session state on page load (used by AuthProvider).
// Renews a lapsed access token from the refresh cookie so a 24h-old session
// comes back silently instead of appearing signed out.
export async function GET() {
  let member = await getMember();
  if (!member) {
    const store = await cookies();
    member = await refreshSession(store);
  }
  return NextResponse.json({ authenticated: !!member, member });
}
