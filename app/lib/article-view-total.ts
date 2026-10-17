import { count, eq, inArray, sql } from "drizzle-orm";
import type { getRadarDB } from "./db/client";
import {
  radarAnonymousViews,
  radarArticleMetrics,
  radarPostViewBaselines,
  radarReadSessions,
} from "./db/schema";

type Database = NonNullable<ReturnType<typeof getRadarDB>>;
export interface ArticleViewIdentity {
  id: string;
  slug: string;
  kind: "article" | "post";
}

// Redis held a total, whereas the persisted baseline excluded signed-in sessions.
// These are overlapping representations of history, so take the larger total.
export function historicalViewTotal(
  redisViews: number | null,
  baseline: number | null,
  sessions: number,
  anonymous: number,
) {
  return Math.max(redisViews ?? 0, (baseline ?? 0) + sessions) + anonymous;
}

export async function getArticleViewTotal(
  db: Database,
  article: ArticleViewIdentity,
  readLegacy: (slug: string) => Promise<number | null>,
) {
  const [existing] = await db
    .select()
    .from(radarArticleMetrics)
    .where(eq(radarArticleMetrics.articleId, article.id));
  if (
    existing?.historicalViews !== null &&
    existing?.historicalViews !== undefined
  )
    return existing.historicalViews + existing.engagedViews;

  // Older trackers used both bare slugs and canonical paths. Snapshot once,
  // keyed by stable Sanity ID, so later slug changes cannot reset public views.
  const keys = [
    article.slug,
    `/${article.kind === "post" ? "posts" : "articles"}/${article.slug}`,
  ];
  const [baselines, sessions, anonymous, legacy] = await Promise.all([
    db
      .select()
      .from(radarPostViewBaselines)
      .where(inArray(radarPostViewBaselines.slug, keys)),
    db
      .select({ slug: radarReadSessions.slug, views: count() })
      .from(radarReadSessions)
      .where(inArray(radarReadSessions.slug, keys))
      .groupBy(radarReadSessions.slug),
    db
      .select({ slug: radarAnonymousViews.slug, views: count() })
      .from(radarAnonymousViews)
      .where(inArray(radarAnonymousViews.slug, keys))
      .groupBy(radarAnonymousViews.slug),
    Promise.all(keys.map(readLegacy)),
  ]);
  // Slug/path keys are aliases for the same article. Preserve the largest
  // historical total rather than adding potentially overlapping histories.
  const historical = Math.max(
    ...keys.map((key, index) =>
      historicalViewTotal(
        legacy[index],
        baselines.find((row) => row.slug === key)?.views ?? null,
        Number(sessions.find((row) => row.slug === key)?.views ?? 0),
        Number(anonymous.find((row) => row.slug === key)?.views ?? 0),
      ),
    ),
  );

  const [saved] = await db
    .insert(radarArticleMetrics)
    .values({ articleId: article.id, historicalViews: historical })
    .onConflictDoUpdate({
      target: radarArticleMetrics.articleId,
      set: {
        historicalViews: sql`coalesce(${radarArticleMetrics.historicalViews}, excluded.historical_views)`,
      },
    })
    .returning({
      historical: radarArticleMetrics.historicalViews,
      engaged: radarArticleMetrics.engagedViews,
    });
  return (saved.historical ?? 0) + saved.engaged;
}
