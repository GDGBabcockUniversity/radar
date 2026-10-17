import { redis } from "./redis";
import { recordRadarActivity } from "./radar-activity";

// The single engagement write seam. Every tracked action funnels through
// `emit()`. It writes RADAR's PostgreSQL record through Drizzle and its Redis
// projections in parallel. auth-v2 owns member identities only.

export type EngagementType = "article.read" | "game.played";

export interface Identity {
  memberId: string | null;
  anonId?: string;
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
    memberName: identity.memberName,
  };
  // allSettled: engagement is non-critical and a projection failure must not
  // prevent the durable RADAR record from being attempted.
  const results = await Promise.allSettled([
    redisSink(event),
    radarDatabaseSink(event),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `engagement ${i === 0 ? "redis" : "database"} sink failed:`,
        r.reason,
      );
    }
  });
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

    // Daily games are one attempt per member per day: the first submitted
    // result is THE result. Repeat submissions (fresh browser, cleared
    // storage, replay with a known answer) are ignored. The dated gameId
    // scopes the marker to the day; EX cleans it up after two days.
    if (id && e.payload.oneAttempt === true && gameId) {
      const first = await redis.set(`radar:attempt:${gameId}:${id}`, 1, {
        nx: true,
        ex: 60 * 60 * 48,
      });
      if (first === null) {
        // Logged (not silent) so a future "my score didn't show" report is
        // diagnosable from server logs instead of requiring a fresh
        // investigation — this is expected to fire on legitimate repeat
        // submissions, but should be rare for a genuine first attempt.
        console.log(`game.played dropped by oneAttempt marker: ${gameId}:${id}`);
        return;
      }
    }

    if (id) await redis.incr(`radar:games:${id}`);
    const score = Number(e.payload.score);
    if (id && gameId && Number.isFinite(score)) {
      // keep each member's best score (gt = only update when greater)
      await redis.zadd(`radar:lb:${gameId}`, { gt: true }, { score, member: id });
    }

    // Server-side daily win streaks. Only daily games opt in (via
    // streakEligible) — a replayable arcade run isn't a streak. baseId is the
    // undated game key, so the streak survives the daily leaderboard rotation.
    // The lastWinDate guard makes re-sends of the same day a no-op, which is
    // what lets sign-in claims of an earlier anonymous play stay idempotent.
    const baseId = String(e.payload.baseId ?? "");
    const day = String(e.payload.day ?? "");
    if (
      id &&
      baseId &&
      day &&
      e.payload.solved === true &&
      e.payload.streakEligible === true
    ) {
      const streakKey = `radar:streak:${baseId}:${id}`;
      const prev = await redis.hgetall<{ count: string; lastWinDate: string }>(
        streakKey,
      );
      if (prev?.lastWinDate !== day) {
        const next =
          prev?.lastWinDate === prevDateKey(day) ? Number(prev.count) + 1 : 1;
        await redis.hset(streakKey, { count: next, lastWinDate: day });
        await redis.zadd(
          `radar:lb:streak:${baseId}`,
          { gt: true },
          { score: next, member: id },
        );
      }
    }
  }
}

// "YYYY-MM-DD" minus one day. UTC math on the date string, so the server's
// timezone can never shift a player-local day key across midnight.
function prevDateKey(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

async function radarDatabaseSink(e: EngagementEvent): Promise<void> {
  if (!e.memberId) return;
  await recordRadarActivity({ userId: e.memberId, type: e.type, payload: e.payload, occurredAt: e.ts });
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
