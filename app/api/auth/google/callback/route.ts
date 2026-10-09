import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CREDENTIALS } from "@/app/lib/constants";
import { setPlatformSession } from "@/app/lib/platform-session";

const stateCookie = "radar_google_state";
const returnToCookie = "radar_google_return_to";

function statesMatch(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function localPath(value: string | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stateCookie)?.value;
  const returnTo = localPath(cookieStore.get(returnToCookie)?.value);

  const clearAndFail = (status: number, error: string) => {
    const response = NextResponse.json({ error }, { status });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.cookies.delete(stateCookie);
    response.cookies.delete(returnToCookie);
    return response;
  };

  if (!expectedState || !state || !statesMatch(expectedState, state)) {
    return clearAndFail(400, "Google sign-in state is invalid or expired");
  }
  if (!code || !CREDENTIALS.auth_api_url) {
    return clearAndFail(400, "Google sign-in could not be completed");
  }

  try {
    const response = await fetch(
      `${CREDENTIALS.auth_api_url}/auth/exchange`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    const data = await response.json().catch(() => ({}));
    const access = data?.tokens?.access_token;
    const refresh = data?.tokens?.refresh_token;
    const expires = Number(data?.tokens?.expires_in) || 15 * 60;
    const user = data?.user;

    if (!response.ok || typeof access !== "string" || !user?.id) {
      return clearAndFail(401, "Google sign-in failed");
    }

    const redirect = NextResponse.redirect(new URL(returnTo, req.url));
    redirect.headers.set("Cache-Control", "no-store");
    redirect.headers.set("Referrer-Policy", "no-referrer");
    setPlatformSession(
      redirect.cookies,
      access,
      typeof refresh === "string" ? refresh : undefined,
      expires,
    );
    redirect.cookies.delete(stateCookie);
    redirect.cookies.delete(returnToCookie);
    return redirect;
  } catch {
    return clearAndFail(503, "Authentication service unavailable");
  }
}
