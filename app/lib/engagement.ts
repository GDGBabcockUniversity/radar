import { redis } from "./redis";

// The single engagement write seam. Every tracked action funnels through
// `emit()`. Today it writes to RADAR's own Redis (the system of record for
// RADAR features like leaderboards and "your stats"). Later, a central-events
// push can be added inside `sink` WITHOUT touching any caller — that is the
// whole point of routing everything through here.

export type EngagementType = "article.read" | "game.played";

export interface Identity {
  memberId: string | null;
  anonId?: string;
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
  };
  try {
    await redisSink(event);
    // Future: await centralSink(event) to push into the cross-product Wrapped.
  } catch {
    // fail-silent — engagement is non-critical and must never break a request
  }
}

async function redisSink(e: EngagementEvent): Promise<void> {
  const id = e.memberId; // member-keyed aggregates only when we know who it is
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

export async function getLeaderboard(
  gameId: string,
  n = 10,
): Promise<{ member: string; score: number }[]> {
  const flat = (await redis.zrange(`radar:lb:${gameId}`, 0, n - 1, {
    rev: true,
    withScores: true,
  })) as (string | number)[];
  const out: { member: string; score: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) {
    out.push({ member: String(flat[i]), score: Number(flat[i + 1]) });
  }
  return out;
}
