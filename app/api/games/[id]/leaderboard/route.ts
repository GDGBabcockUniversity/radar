import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard } from "@/app/lib/engagement";
import { getGame, leaderboardId } from "@/app/lib/games";

export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/games/[id]/leaderboard?day=YYYY-MM-DD — top scores for a game.
// `id` is the game's slug (e.g. "signal"); an optional `day` scopes to that
// day's bucket for daily/arcade games (falls back to the permanent bucket
// otherwise). Freshness matters more than caching here — a player checking
// their post-game rank wants THIS second's board, not a stale edge copy.
export async function GET(req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const game = getGame(id);
  if (!game) {
    return NextResponse.json({ gameId: id, top: [] }, { status: 404 });
  }

  const dayParam = req.nextUrl.searchParams.get("day");
  const day = dayParam && DAY_RE.test(dayParam) ? dayParam : undefined;

  try {
    const gameId = leaderboardId(game, day);
    const top = await getLeaderboard(gameId, 5);
    return NextResponse.json({ gameId, top });
  } catch {
    return NextResponse.json({ gameId: leaderboardId(game, day), top: [] });
  }
}
