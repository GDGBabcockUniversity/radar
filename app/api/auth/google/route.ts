import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { CREDENTIALS } from "@/app/lib/constants";

const stateCookie = "radar_google_state";
const returnToCookie = "radar_google_return_to";
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 10 * 60,
};

function localPath(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}

export async function GET(req: NextRequest) {
  if (!CREDENTIALS.auth_api_url) {
    return NextResponse.json(
      { error: "Auth is not configured" },
      { status: 503 },
    );
  }

  const state = randomBytes(32).toString("base64url");
  const returnTo = localPath(
    req.nextUrl.searchParams.get("returnTo"),
    "/",
  );
  const authUrl = new URL("/auth/google", CREDENTIALS.auth_api_url);
  authUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authUrl);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.cookies.set(stateCookie, state, cookieOptions);
  response.cookies.set(returnToCookie, returnTo, cookieOptions);
  return response;
}
