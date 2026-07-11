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
  // Failures still get logged — a misconfigured Redis or auth URL otherwise
  // drops every score with no trace anywhere.
  const results = await Promise.allSettled([
    redisSink(event),
    authServiceSink(event),
  ]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(
        `engagement ${i === 0 ? "redis" : "auth-service"} sink failed:`,
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
      if (first === null) return;
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
