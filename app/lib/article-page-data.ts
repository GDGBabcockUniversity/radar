import "server-only";
import { getRadarDB } from "./db/client";
import { getArticleViewTotal } from "./article-view-total";
import { redis } from "./redis";
import { getPublicSignals } from "./signal";

export async function getArticlePageData(
  articleId: string,
  slug: string,
  kind: "article" | "post" = "article",
) {
  const [views, signals] = await Promise.all([
    (async () => {
      try {
        const db = getRadarDB();
        if (!db) return null;
        return await getArticleViewTotal(
          db,
          { id: articleId, slug, kind },
          (key) => redis.get<number>(`views:${key}`),
        );
      } catch {
        // Optional analytics must not prevent an otherwise readable article.
        return null;
      }
    })(),
    getPublicSignals(slug),
  ]);
  return { views, signals };
}
