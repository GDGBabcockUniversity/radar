import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CREDENTIALS } from "@/app/lib/constants";
import { getMember } from "@/app/lib/member";

// Session bridge: exchanges a Firebase ID token for the shared platform JWT
// (via the auth service's own /auth/login) and stores it as the httpOnly
// cookie app/lib/member.ts's getMember() already expects. Kept intentionally
// minimal — one JWT cookie, no refresh-token flow; when it expires the user
// just signs in again (RADAR sessions are short: read an article, play a
// game — not a long-lived dashboard).

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
    const expiresIn = Number(data?.tokens?.expires_in) || 60 * 60 * 24;
    const user = data?.user;
    if (!accessToken || !user) {
      return NextResponse.json(
        { success: false, error: "Unexpected auth response" },
        { status: 502 }
      );
    }

    const store = await cookies();
    store.set(CREDENTIALS.auth_cookie_name, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: expiresIn,
    });

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
  store.delete(CREDENTIALS.auth_cookie_name);
  return NextResponse.json({ success: true });
}

// GET — hydrate current session state on page load (used by AuthProvider).
export async function GET() {
  const member = await getMember();
  return NextResponse.json({ authenticated: !!member, member });
}
