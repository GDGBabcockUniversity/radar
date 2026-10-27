import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CREDENTIALS } from "@/app/lib/credentials";
import {
  clearPlatformSession,
  getMemberWithRefresh,
  setPlatformSession,
} from "@/app/lib/platform-session";

// Exchanges a verified Firebase identity for RADAR's httpOnly platform session.
export async function POST(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json(
      { success: false, error: "Invalid request origin" },
      { status: 403 },
    );

  if (!CREDENTIALS.auth_api_url)
    return NextResponse.json(
      { success: false, error: "Auth is not configured" },
      { status: 503 },
    );
  const body = await req.json().catch(() => null);
  const firebaseToken = body?.firebase_token;
  if (typeof firebaseToken !== "string" || !firebaseToken.trim())
    return NextResponse.json(
      { success: false, error: "Firebase token is required" },
      { status: 400 },
    );
  try {
    const response = await fetch(`${CREDENTIALS.auth_api_url}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firebase_token: firebaseToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorBody.error || "Authentication failed",
        },
        { status: response.status },
      );
    }
    const data = await response.json();
    const access = data?.tokens?.access_token;
    const refresh = data?.tokens?.refresh_token;
    const expires = Number(data?.tokens?.expires_in) || 15 * 60;
    const user = data?.user;
    if (
      typeof access !== "string" ||
      !access ||
      typeof refresh !== "string" ||
      !refresh ||
      typeof user?.id !== "string"
    )
      return NextResponse.json(
        { success: false, error: "Unexpected auth response" },
        { status: 502 },
      );
    setPlatformSession(
      await cookies(),
      access,
      typeof refresh === "string" ? refresh : undefined,
      expires,
    );
    return NextResponse.json({
      success: true,
      member: { memberId: user.id, name: user.full_name, email: user.email },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Authentication service unavailable" },
      { status: 503 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (req.headers.get("origin") !== req.nextUrl.origin)
    return NextResponse.json(
      { success: false, error: "Invalid request origin" },
      { status: 403 },
    );
  const store = await cookies();
  try {
    await getMemberWithRefresh(store);
    const access = store.get(CREDENTIALS.auth_cookie_name)?.value;
    const refresh = store.get(CREDENTIALS.auth_refresh_cookie_name)?.value;
    if (access && CREDENTIALS.auth_api_url) {
      const response = await fetch(`${CREDENTIALS.auth_api_url}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh_token: refresh }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Logout failed");
    }
  } catch {
    clearPlatformSession(store);
    return NextResponse.json(
      {
        success: false,
        error: "Signed out locally; server logout unavailable",
      },
      { status: 503 },
    );
  }
  clearPlatformSession(store);
  return NextResponse.json({ success: true });
}
export async function GET() {
  const member = await getMemberWithRefresh(await cookies());
  return NextResponse.json({ authenticated: !!member, member });
}
