import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getMember } from "@/app/lib/member";
import { emit, type EngagementType } from "@/app/lib/engagement";
import { CREDENTIALS } from "@/app/lib/constants";

const VALID_TYPES: EngagementType[] = ["article.read", "game.played"];

// POST /api/engagement — record one engagement event for the current member
// (or anonymously). Fail-silent: tracking must never break the client.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body?.type as EngagementType;
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const payload =
      body?.payload && typeof body.payload === "object" ? body.payload : {};

    const member = await getMember();

    // Stable anonymous id so pre-login activity is still attributable.
    let anonId = req.cookies.get("radar_anon_id")?.value;
    const res = NextResponse.json({ ok: true });
    if (!anonId) {
      anonId = crypto.randomUUID();
      res.cookies.set("radar_anon_id", anonId, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    // Raw token (not just the decoded member) — needed to call the auth
    // service's authenticated /radar/* endpoints on the member's behalf.
    const platformToken = req.cookies.get(CREDENTIALS.auth_cookie_name)?.value;

    await emit(type, payload, {
      memberId: member?.memberId ?? null,
      anonId,
      platformToken,
      memberName: member?.name,
    });

    if (type === "game.played") {
      try {
        // Force the hub's ISR cache to regenerate on the next request
        // instead of waiting out its revalidate window.
        revalidatePath("/games");
      } catch {
        /* best-effort cache invalidation — never break tracking */
      }
    }

    return res;
  } catch {
    // Never surface tracking failures to the client.
    return NextResponse.json({ ok: false });
  }
}
