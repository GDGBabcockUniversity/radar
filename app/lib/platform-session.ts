import "server-only";
import { cookies } from "next/headers";
import { CREDENTIALS } from "./credentials";
import { memberFromToken, type Member } from "./member";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function options(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function clearPlatformSession(store: CookieStore) {
  store.delete(CREDENTIALS.auth_cookie_name);
  store.delete(CREDENTIALS.auth_refresh_cookie_name);
}

export function setPlatformSession(
  store: Pick<CookieStore, "set">,
  access: string,
  refresh: string | undefined,
  expires: number,
) {
  store.set(CREDENTIALS.auth_cookie_name, access, options(expires));
  if (refresh)
    store.set(
      CREDENTIALS.auth_refresh_cookie_name,
      refresh,
      options(REFRESH_MAX_AGE),
    );
}

export async function getMemberWithRefresh(
  store: CookieStore,
): Promise<Member | null> {
  const access = store.get(CREDENTIALS.auth_cookie_name)?.value;
  const current = access ? await memberFromToken(access) : null;
  if (current) return current;
  const refresh = store.get(CREDENTIALS.auth_refresh_cookie_name)?.value;
  if (!refresh || !CREDENTIALS.auth_api_url) return null;
  try {
    const response = await fetch(`${CREDENTIALS.auth_api_url}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      if (response.status === 401 || response.status === 403)
        clearPlatformSession(store);
      return null;
    }
    const body = await response.json();
    const nextAccess = body?.tokens?.access_token;
    const nextRefresh = body?.tokens?.refresh_token;
    const expires = Number(body?.tokens?.expires_in) || 15 * 60;
    if (typeof nextAccess !== "string") {
      clearPlatformSession(store);
      return null;
    }
    const member = await memberFromToken(nextAccess);
    if (!member) {
      clearPlatformSession(store);
      return null;
    }
    setPlatformSession(
      store,
      nextAccess,
      typeof nextRefresh === "string" ? nextRefresh : undefined,
      expires,
    );
    return member;
  } catch {
    return null;
  }
}
