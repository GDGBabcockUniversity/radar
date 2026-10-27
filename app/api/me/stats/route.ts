import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getMemberWithRefresh } from "@/app/lib/platform-session";
import { getRadarMemberStats } from "@/app/lib/radar-activity";

// GET /api/me/stats — the current member's RADAR engagement summary. This is the
// interim "pull" surface the shared profile / Wrapped can read until a central
// push is wired. Anonymous callers get authenticated: false.
export async function GET() {
  const member = await getMemberWithRefresh(await cookies());
  if (!member) {
    return NextResponse.json({ authenticated: false });
  }
  try {
    const stats = await getRadarMemberStats(member.memberId);
    if (!stats) {
      return NextResponse.json({ authenticated: true, memberId: member.memberId, storageConfigured: false });
    }
    return NextResponse.json({
      authenticated: true,
      memberId: member.memberId,
      storageConfigured: true,
      ...stats,
    });
  } catch {
    return NextResponse.json({ authenticated: true, memberId: member.memberId });
  }
}
