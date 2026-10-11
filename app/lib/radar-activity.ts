import "server-only";
import { and, count, eq, sql, sum } from "drizzle-orm";
import { getRadarDB } from "./db/client";
import { redis } from "./redis";
import {
  radarActivityDays,
  radarGameScores,
  radarReads,
  radarReadSessions,
} from "./db/schema";

const MAX_SCORE = 1_000_000;
const MAX_READ_SECONDS = 6 * 60 * 60;
const localDay = (ts: number) => new Date(ts).toISOString().slice(0, 10);
const asWholeNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)
    ? value
    : null;

export async function recordRadarActivity(input: {
  userId: string;
  type: "article.read" | "game.played";
  payload: Record<string, unknown>;
  occurredAt: number;
}) {
  const db = getRadarDB();
  if (!db) return;
  const day = localDay(input.occurredAt);
  if (input.type === "article.read") {
    const slug =
      typeof input.payload.postId === "string"
        ? input.payload.postId.trim()
        : typeof input.payload.slug === "string"
          ? input.payload.slug.trim()
          : "";
    const sessionId =
      typeof input.payload.sessionId === "string"
        ? input.payload.sessionId.trim()
        : "";
    const seconds = asWholeNumber(input.payload.seconds);
    const maxScroll = asWholeNumber(input.payload.maxScroll);
    if (
      !slug ||
      !sessionId ||
      seconds === null ||
      seconds <= 0 ||
      seconds > MAX_READ_SECONDS ||
      maxScroll === null ||
      maxScroll < 0 ||
      maxScroll > 100
    )
      return;
    const createdSession = await db.transaction(async (tx) => {
      const where = and(
        eq(radarReadSessions.userId, input.userId),
        eq(radarReadSessions.sessionId, sessionId),
        eq(radarReadSessions.slug, slug),
      );
      const [inserted] = await tx
        .insert(radarReadSessions)
        .values({
          userId: input.userId,
          sessionId,
          slug,
          seconds,
          maxScroll,
        })
        .onConflictDoNothing({
          target: [
            radarReadSessions.userId,
            radarReadSessions.sessionId,
            radarReadSessions.slug,
          ],
        })
        .returning({ id: radarReadSessions.id });

      let prior = 0;
      if (!inserted) {
        // A competing beacon may have inserted this row. Lock it before
        // calculating the delta so concurrent updates cannot count twice.
        const [existing] = await tx
          .select({
            seconds: radarReadSessions.seconds,
            maxScroll: radarReadSessions.maxScroll,
          })
          .from(radarReadSessions)
          .where(where)
          .for("update");
        if (!existing) throw new Error("Read session missing after conflict");
        prior = existing.seconds;
        await tx
          .update(radarReadSessions)
          .set({
            seconds: Math.max(prior, seconds),
            maxScroll: Math.max(existing.maxScroll, maxScroll),
            updatedAt: new Date(),
          })
          .where(where);
      }

      const delta = Math.max(0, seconds - prior);
      if (delta === 0) return Boolean(inserted);
      await tx
        .insert(radarReads)
        .values({
          userId: input.userId,
          slug,
          seconds: delta,
          readCount: inserted ? 1 : 0,
        })
        .onConflictDoUpdate({
          target: [radarReads.userId, radarReads.slug],
          set: {
            seconds: sql`${radarReads.seconds} + excluded.seconds`,
            readCount: sql`${radarReads.readCount} + excluded.read_count`,
            readAt: new Date(),
          },
        });
      await tx
        .insert(radarActivityDays)
        .values({
          userId: input.userId,
          day,
          reads: inserted ? 1 : 0,
          seconds: delta,
        })
        .onConflictDoUpdate({
          target: [radarActivityDays.userId, radarActivityDays.day],
          set: {
            reads: sql`${radarActivityDays.reads} + excluded.reads`,
            seconds: sql`${radarActivityDays.seconds} + excluded.seconds`,
          },
        });
      return Boolean(inserted);
    });
    if (createdSession)
      await redis.del(`radar:views:v4:${slug}`).catch(() => {});
    return;
  }
  const gameId =
    typeof input.payload.gameId === "string" ? input.payload.gameId.trim() : "";
  const score = asWholeNumber(input.payload.score);
  if (!gameId || score === null || score < 0 || score > MAX_SCORE) return;
  const [game, ...puzzle] = gameId.split(":");
  await db.transaction(async (tx) => {
    await tx
      .insert(radarGameScores)
      .values({
        userId: input.userId,
        game,
        puzzleId: puzzle.length ? puzzle.join(":") : null,
        score,
        meta: input.payload,
        playedAt: new Date(input.occurredAt),
      });
    await tx
      .insert(radarActivityDays)
      .values({ userId: input.userId, day, plays: 1 })
      .onConflictDoUpdate({
        target: [radarActivityDays.userId, radarActivityDays.day],
        set: { plays: sql`${radarActivityDays.plays} + 1` },
      });
  });
}

export async function getRadarMemberStats(userId: string) {
  const db = getRadarDB();
  if (!db) return null;
  const [reads, games] = await Promise.all([
    db
      .select({
        articlesRead: count(),
        readingSeconds: sql<number>`coalesce(${sum(radarReads.seconds)}, 0)`,
      })
      .from(radarReads)
      .where(eq(radarReads.userId, userId)),
    db
      .select({ gamesPlayed: count() })
      .from(radarGameScores)
      .where(eq(radarGameScores.userId, userId)),
  ]);
  return {
    articlesRead: Number(reads[0]?.articlesRead ?? 0),
    readingSeconds: Number(reads[0]?.readingSeconds ?? 0),
    gamesPlayed: Number(games[0]?.gamesPlayed ?? 0),
  };
}
