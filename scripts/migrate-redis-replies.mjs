// Run with --env-file=.env. Dry run by default; --apply writes PostgreSQL only.
import { Redis } from "@upstash/redis";
import postgres from "postgres";

const apply = process.argv.includes("--apply");
for (const key of [
  "DATABASE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
]) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
const db = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
const uuid = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const totals = {
  scanned: 0,
  eligible: 0,
  inserted: 0,
  existing: 0,
  missingParents: 0,
  invalid: 0,
};
try {
  let cursor = "0";
  do {
    const page = await redis.scan(cursor, {
      match: "radar:replies:*",
      count: 100,
    });
    cursor = page[0];
    for (const key of page[1]) {
      const parentId = key.slice("radar:replies:".length);
      if (!uuid.test(parentId)) {
        totals.invalid++;
        continue;
      }
      const [parent] =
        await db`SELECT article_slug FROM comments WHERE id=${parentId} AND parent_id IS NULL`;
      // Only migrate replies attached to a PostgreSQL parent; never invent one.
      let offset = 0;
      while (true) {
        const ids = await redis.zrange(key, offset, offset + 99);
        if (!ids.length) break;
        offset += ids.length;
        for (const id of ids) {
          totals.scanned++;
          const row = await redis.hgetall(`radar:reply:${id}`);
          if (
            !row ||
            row.id !== id ||
            row.parentId !== parentId ||
            !uuid.test(String(row.id)) ||
            !uuid.test(String(row.memberId)) ||
            typeof row.body !== "string" ||
            !row.body.trim() ||
            row.body.length > 500 ||
            typeof row.createdAt !== "string" ||
            !Number.isFinite(Date.parse(row.createdAt))
          ) {
            totals.invalid++;
            continue;
          }
          if (!parent) {
            totals.missingParents++;
            continue;
          }
          const [existing] =
            await db`SELECT parent_id,user_id,content FROM comments WHERE id=${row.id}`;
          if (existing) {
            if (
              existing.parent_id !== parentId ||
              existing.user_id !== row.memberId ||
              existing.content !== row.body
            )
              throw new Error(
                "Conflicting existing comment; migration stopped without overwriting it",
              );
            totals.existing++;
            continue;
          }
          totals.eligible++;
          if (apply) {
            const inserted =
              await db`INSERT INTO comments (id,parent_id,user_id,article_slug,content,created_at)
              VALUES (${row.id},${parentId},${row.memberId},${parent.article_slug},${row.body},${new Date(row.createdAt)})
              ON CONFLICT (id) DO NOTHING RETURNING id`;
            totals.inserted += inserted.length;
          }
        }
      }
    }
  } while (cursor !== "0");
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...totals }));
  if (totals.invalid || totals.missingParents) process.exitCode = 2;
} finally {
  await db.end();
}
