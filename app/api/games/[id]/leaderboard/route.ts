import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/app/lib/engagement";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/games/[id]/leaderboard — top scores for a game.
export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  try {
    const top = await getLeaderboard(decodeURIComponent(id), 10);
    return NextResponse.json({ gameId: id, top });
  } catch {
    return NextResponse.json({ gameId: id, top: [] });
  }
}
