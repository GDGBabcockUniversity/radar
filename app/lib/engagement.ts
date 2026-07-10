import { redis } from "./redis";
import { CREDENTIALS } from "./constants";

// The single engagement write seam. Every tracked action funnels through
// `emit()`. It writes to two places in parallel: RADAR's own Redis (the
// system of record for RADAR features like leaderboards and "your stats")
// and the shared auth service's Postgres (radar_game_scores / radar_reads —
// what the cross-product profile reads via GET /auth/me). Each sink is
// isolated so one failing never skips or breaks the other.

export type EngagementType = "article.read" | "game.played";

export interface Identity {
  memberId: string | null;
  anonId?: string;
  // The raw platform JWT, when the request carried a valid session cookie —
  // needed to call the auth service's authenticated /radar/* endpoints on
  // the member's behalf. Absent for anonymous visitors (authServiceSink
  // then simply no-ops, same as redisSink already does without an id).
  platformToken?: string;
  // Display name from the JWT — persisted opportunistically so leaderboards
  // can show people instead of UUIDs. Never forwarded to the auth service
  // (it owns its own profile names).
  memberName?: string;
}

export interface EngagementEvent extends Identity {
  product: "radar";
  type: EngagementType;
  payload: Record<string, unknown>;
  ts: number;
}

export async function emit(
  type: EngagementType,
  payload: Record<string, unknown>,
  identity: Identity,
): Promise<void> {
  const event: EngagementEvent = {
    product: "radar",
    type,
    payload,
    ts: Date.now(),
    memberId: identity.memberId,
    anonId: identity.anonId,
    platformToken: identity.platformToken,
    memberName: identity.memberName,
  };
  // allSettled: engagement is non-critical and must never break a request,
  // and a failure in one sink must not prevent the other from running.
  await Promise.allSettled([redisSink(event), authServiceSink(event)]);
}

async function redisSink(e: EngagementEvent): Promise<void> {
  const id = e.memberId; // member-keyed aggregates only when we know who it is
  // Keep the UUID → display-name map fresh from any signed-in activity, so
  // leaderboards (and future member-facing surfaces) can resolve names.
  if (id && e.memberName) {
    await redis.hset("radar:member_names", { [id]: e.memberName });
  }
  if (e.type === "article.read") {
    const slug = String(e.payload.slug ?? "");
    if (id && slug) {
      await redis.sadd(`radar:reads:${id}`, slug);
      const seconds = Math.round(Number(e.payload.seconds ?? 0));
      if (seconds > 0) {
        await redis.incrby(`radar:read_seconds:${id}`, seconds);
      }
    }
  } else if (e.type === "game.played") {
    const gameId = String(e.payload.gameId ?? "");
    if (id) await redis.incr(`radar:games:${id}`);
    const score = Number(e.payload.score);
    if (id && gameId && Number.isFinite(score)) {
      // keep each member's best score (gt = only update when greater)
      await redis.zadd(`radar:lb:${gameId}`, { gt: true }, { score, member: id });
    }
  }
}

// Forwards the same event to the auth service so it lands in Postgres
// (radar_game_scores / radar_reads) — the source GET /auth/me reads from
// for the shared profile. Requires both a known member and their platform
// JWT; anonymous events, or events from a session with no/expired token,
// simply aren't forwarded (RADAR's own Redis stats still capture them).
async function authServiceSink(e: EngagementEvent): Promise<void> {
  const authApiUrl = CREDENTIALS.auth_api_url;
  if (!e.memberId || !e.platformToken || !authApiUrl) return;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${e.platformToken}`,
  };

  if (e.type === "article.read") {
    const slug = String(e.payload.slug ?? "");
    const seconds = Math.round(Number(e.payload.seconds ?? 0));
    if (!slug || seconds <= 0) return;
    await fetch(`${authApiUrl}/radar/reads`, {
      method: "POST",
      headers,
      body: JSON.stringify({ slug, seconds }),
      signal: AbortSignal.timeout(5000),
    });
  } else if (e.type === "game.played") {
    const gameId = String(e.payload.gameId ?? "");
    const score = Number(e.payload.score);
    if (!gameId || !Number.isFinite(score)) return;
    // gameId is "crossword:new-year-new-lies" — split into game + puzzle_id
    // to match the auth service's radar_game_scores columns.
    const [game, ...rest] = gameId.split(":");
    const puzzleId = rest.length > 0 ? rest.join(":") : undefined;
    await fetch(`${authApiUrl}/radar/scores`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        game,
        puzzle_id: puzzleId,
        score: Math.round(score),
        meta: e.payload,
      }),
      signal: AbortSignal.timeout(5000),
    });
  }
}

export interface MemberStats {
  articlesRead: number;
  readingSeconds: number;
  gamesPlayed: number;
}

export async function getMemberStats(memberId: string): Promise<MemberStats> {
  const [reads, seconds, games] = await Promise.all([
    redis.scard(`radar:reads:${memberId}`),
    redis.get<number>(`radar:read_seconds:${memberId}`),
    redis.get<number>(`radar:games:${memberId}`),
  ]);
  return {
    articlesRead: reads ?? 0,
    readingSeconds: seconds ?? 0,
    gamesPlayed: games ?? 0,
  };
}

export interface LeaderboardEntry {
  member: string;
  name: string | null;
  score: number;
}

export async function getLeaderboard(
  gameId: string,
  n = 10,
): Promise<LeaderboardEntry[]> {
  const flat = (await redis.zrange(`radar:lb:${gameId}`, 0, n - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];
  const out: LeaderboardEntry[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    out.push({ member: String(flat[i]), name: null, score: Number(flat[i + 1]) });
  }
  if (out.length > 0) {
    const names = await redis.hmget<Record<string, string>>(
      "radar:member_names",
      ...out.map((e) => e.member),
    );
    for (const entry of out) {
      entry.name = names?.[entry.member] ?? null;
    }
  }
  return out;
}
