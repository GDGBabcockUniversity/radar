import { sql } from "drizzle-orm";
import type { getRadarDB } from "./db/client";

export type ArticleMetric = "open" | "engaged" | "completion";

export async function incrementArticleMetric(
  db: NonNullable<ReturnType<typeof getRadarDB>>,
  key: string,
  articleId: string,
  event: ArticleMetric,
) {
  // Both the durable rolling guard and counter live in one SQL statement.
  // Concurrent ON CONFLICT updates serialize on the receipt's unique key.
  const result = await db.execute(sql`
    WITH accepted AS (
      INSERT INTO view_receipts (key, counted_at) VALUES (${key}, NOW())
      ON CONFLICT (key) DO UPDATE SET counted_at = EXCLUDED.counted_at
      WHERE view_receipts.counted_at <= NOW() - INTERVAL '24 hours'
      RETURNING key
    )
    INSERT INTO article_metrics (article_id, page_views, engaged_views, read_completions)
    SELECT ${articleId}, ${event === "open" ? 1 : 0},
      ${event === "engaged" ? 1 : 0}, ${event === "completion" ? 1 : 0}
    FROM accepted
    ON CONFLICT (article_id) DO UPDATE SET
      page_views = article_metrics.page_views + EXCLUDED.page_views,
      engaged_views = article_metrics.engaged_views + EXCLUDED.engaged_views,
      read_completions = article_metrics.read_completions + EXCLUDED.read_completions
    RETURNING article_id
  `);
  return result.length > 0;
}
