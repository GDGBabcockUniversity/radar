import { NextResponse } from "next/server";
import { getMember } from "@/app/lib/member";
import { getMemberStats } from "@/app/lib/engagement";

// GET /api/me/stats — the current member's RADAR engagement summary. This is the
// interim "pull" surface the shared profile / Wrapped can read until a central
// push is wired. Anonymous callers get authenticated: false.
export async function GET() {
  const member = await getMember();
  if (!member) {
    return NextResponse.json({ authenticated: false });
  }
  try {
    const stats = await getMemberStats(member.memberId);
    return NextResponse.json({
      authenticated: true,
      memberId: member.memberId,
      ...stats,
    });
  } catch {
    return NextResponse.json({ authenticated: true, memberId: member.memberId });
  }
}
