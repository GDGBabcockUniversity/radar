import { NextRequest } from "next/server";
import { client } from "@/app/lib/sanity";
import { getRadarDB } from "@/app/lib/db/client";
import {
  getArticleViewTotal,
  type ArticleViewIdentity,
} from "@/app/lib/article-view-total";
import { redis } from "@/app/lib/redis";
import { recordEngagedMetric } from "@/app/lib/engaged-view-service";
import { incrementArticleMetric } from "@/app/lib/engaged-view-db";
import { validArticleId } from "@/app/lib/article-visit";
import { createArticleViewHandler } from "@/app/lib/article-view-handler";
import { issueReadersKey } from "@/app/lib/issue-readers";

export const POST = createArticleViewHandler({
  secret: () => process.env.ARTICLE_VIEW_SECRET ?? "",
  rateLimit: async (key, maximum) =>
    Number(
      await redis.eval(
        "local n = redis.call('INCR', KEYS[1]); if n == 1 then redis.call('EXPIRE', KEYS[1], 120) end; return n",
        [key],
        [],
      ),
    ) <= maximum,
  articleExists: (id) =>
    client.fetch<boolean>(
      'count(*[_id == $id && _type in ["article", "post"] && !(_id in path("drafts.**")) && hidden != true]) > 0',
      { id },
      { cache: "no-store" },
    ),
  record: async (key, id, event, reader) => {
    const db = getRadarDB();
    if (!db) throw new Error("RADAR database unavailable");
    const counted = await recordEngagedMetric(key, {
      reserve: async (key, token) =>
        (await redis.set(`radar:engaged:${key}`, token, {
          nx: true,
          ex: 86400,
        })) !== null,
      release: async (key, token) => {
        await redis.eval(
          "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
          [`radar:engaged:${key}`],
          [token],
        );
      },
      increment: (key) => incrementArticleMetric(db, key, id, event),
    });
    // Issue views = unique visitors who opened any of the issue's articles.
    // PFADD is idempotent, so repeat visits by the same visitor never inflate it.
    if (event === "open") {
      try {
        const issueId = await client.fetch<string | null>(
          "*[_id == $id][0].issue._ref",
          { id },
          { cache: "no-store" },
        );
        if (issueId) await redis.pfadd(issueReadersKey(issueId), reader);
      } catch {
        console.error("Issue reader recording unavailable");
      }
    }
    return counted;
  },
});

const reply = (status: number, body?: object) =>
  Response.json(body ?? {}, {
    status,
    headers: { "Cache-Control": "no-store" },
  });

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!validArticleId(id)) return reply(400);
  try {
    const db = getRadarDB();
    if (!db) return reply(503);
    const article = await client.fetch<ArticleViewIdentity | null>(
      '*[_id == $id && _type in ["article", "post"] && !(_id in path("drafts.**")) && hidden != true][0]{"id": _id, "slug": slug.current, "kind": _type}',
      { id },
      { cache: "no-store" },
    );
    if (!article?.slug) return reply(404);
    const views = await getArticleViewTotal(db, article, (key) =>
      redis.get<number>(`views:${key}`),
    );
    return reply(200, { views });
  } catch {
    return reply(503);
  }
}
