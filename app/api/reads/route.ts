import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import { emit } from "@/app/lib/engagement";

// sendBeacon can arrive as text/plain, so parse the raw body rather than
// requiring a JSON content type.
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const body = JSON.parse(raw || "{}") as Record<string, unknown>;
    const member = await getMemberWithRefresh(await cookies());
    await emit("article.read", body, { memberId: member?.memberId ?? null, memberName: member?.name });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
