import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CREDENTIALS } from "@/app/lib/constants";
import {
  clearPlatformSession,
  getMemberWithRefresh,
  setPlatformSession,
} from "@/app/lib/platform-session";

// Creates RADAR's httpOnly cookie session from native auth-v2 credentials.
export async function POST(req: NextRequest) {
  if (!CREDENTIALS.auth_api_url)
    return NextResponse.json(
      { success: false, error: "Auth is not configured" },
      { status: 503 },
    );
  const body = await req.json().catch(() => ({}));
  const { email, password, fullName } = body;
  if (typeof email !== "string" || typeof password !== "string")
    return NextResponse.json(
      { success: false, error: "email and password are required" },
      { status: 400 },
    );
  try {
    const registering = typeof fullName === "string";
    if (registering && !fullName.trim())
      return NextResponse.json(
        { success: false, error: "Full name is required" },
        { status: 400 },
      );

    const response = await fetch(
      `${CREDENTIALS.auth_api_url}/auth/${registering ? "register" : "login"}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          registering
            ? { email, password, full_name: fullName.trim() }
            : { email, password },
        ),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error:
            errorBody.message ||
            (registering ? "Account creation failed" : "Authentication failed"),
        },
        { status: registering ? response.status : 401 },
      );
    }
    const data = await response.json();
    const access = data?.tokens?.access_token;
    const refresh = data?.tokens?.refresh_token;
    const expires = Number(data?.tokens?.expires_in) || 15 * 60;
    const user = data?.user;
    if (typeof access !== "string" || !user?.id)
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
  } catch {
    return NextResponse.json(
      { success: false, error: "Authentication service unavailable" },
      { status: 503 },
    );
  }
}

export async function DELETE() {
  clearPlatformSession(await cookies());
  return NextResponse.json({ success: true });
}
export async function GET() {
  const member = await getMemberWithRefresh(await cookies());
  return NextResponse.json({ authenticated: !!member, member });
}
