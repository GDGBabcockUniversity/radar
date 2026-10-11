import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import { recordAnonymousView } from "@/app/lib/anonymous-views";
import { emit } from "@/app/lib/engagement";

// sendBeacon can arrive as text/plain, so parse the raw body rather than
// requiring a JSON content type.
export async function POST(req: NextRequest) {
  try {
    if (req.headers.get("origin") !== req.nextUrl.origin)
      return NextResponse.json({ ok: false }, { status: 403 });
    const raw = await req.text();
    if (raw.length > 4096)
      return NextResponse.json({ ok: false }, { status: 413 });
    const body = JSON.parse(raw || "{}") as Record<string, unknown>;
    if (
      !body ||
      typeof body.postId !== "string" ||
      !body.postId.trim() ||
      body.postId.length > 500 ||
      typeof body.seconds !== "number" ||
      !Number.isFinite(body.seconds) ||
      body.seconds < 1 ||
      body.seconds > 86400 ||
      typeof body.sessionId !== "string" ||
      body.sessionId.length > 64 ||
      typeof body.maxScroll !== "number" ||
      !Number.isFinite(body.maxScroll) ||
      body.maxScroll < 0 ||
      body.maxScroll > 100
    )
      return NextResponse.json({ ok: false }, { status: 400 });
    const member = await getMemberWithRefresh(await cookies());
    if (!member) {
      await recordAnonymousView(req, body.postId.trim());
      return NextResponse.json({ ok: true });
    }
    await emit("article.read", body, {
      memberId: member?.memberId ?? null,
      memberName: member?.name,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
