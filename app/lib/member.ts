import { CREDENTIALS } from "./constants";

export interface Member {
  memberId: string;
  name?: string;
  email?: string;
}

interface AuthUser {
  id?: string;
  full_name?: string;
  email?: string;
}

export async function memberFromToken(token: string): Promise<Member | null> {
  if (!token || !CREDENTIALS.auth_api_url) return null;
  try {
    const response = await fetch(`${CREDENTIALS.auth_api_url}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { user?: AuthUser };
    const user = body.user;
    if (!user?.id) return null;
    return { memberId: user.id, name: user.full_name, email: user.email };
  } catch {
    return null;
  }
}
