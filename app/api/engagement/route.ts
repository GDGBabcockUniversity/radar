import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import { emit, type EngagementType } from "@/app/lib/engagement";

const VALID_TYPES: EngagementType[] = ["article.read", "game.played"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body?.type as EngagementType;
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const payload =
      body?.payload && typeof body.payload === "object" ? body.payload : {};

    const member = await getMemberWithRefresh(await cookies());

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

    await emit(type, payload, {
      memberId: member?.memberId ?? null,
      anonId,
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
