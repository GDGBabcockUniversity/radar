import { client } from "@/app/lib/sanity";
import { redis } from "@/app/lib/redis";
import { createArticleViewHandler } from "@/app/lib/article-view-handler";
import { issueReadersKey } from "@/app/lib/issue-readers";

// Entering the issue page adds the visitor to the same unique set that
// article opens feed; no scroll or active-time requirement.
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
      'count(*[_id == $id && _type == "issue" && !(_id in path("drafts.**"))]) > 0',
      { id },
      { cache: "no-store" },
    ),
  record: async (_key, id, event, reader) => {
    if (event === "open") await redis.pfadd(issueReadersKey(id), reader);
  },
});
