// Run only against an isolated test database (see README).
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as tables from "../app/lib/db/schema";
import { incrementArticleMetric } from "../app/lib/engaged-view-db";

test("PostgreSQL concurrency, rolling expiry, metric separation, and atomic rollback", async () => {
  const url = process.env.ENGAGEMENT_TEST_DATABASE_URL;
  assert.ok(
    url,
    "Set ENGAGEMENT_TEST_DATABASE_URL to an isolated test database",
  );
  const schema = `engagement_${randomUUID().replaceAll("-", "")}`;
  const admin = postgres(url, { max: 1 });
  await admin.unsafe(`CREATE SCHEMA ${schema}`);
  const client = postgres(url, {
    max: 10,
    connection: { search_path: schema },
  });
  const db = drizzle(client, { schema: tables });
  try {
    await client.unsafe(
      await readFile("drizzle/0009_engaged_article_views.sql", "utf8"),
    );
    const outcomes = await Promise.all(
      Array.from({ length: 50 }, () =>
        incrementArticleMetric(db, "same-key", "article", "engaged"),
      ),
    );
    assert.equal(outcomes.filter(Boolean).length, 1);
    const [counts] =
      await client`SELECT * FROM article_metrics WHERE article_id = 'article'`;
    assert.equal(counts.engaged_views, 1);
    assert.equal(counts.page_views, 0);
    assert.equal(counts.read_completions, 0);
    await client`UPDATE view_receipts SET counted_at = NOW() - INTERVAL '23 hours 59 minutes' WHERE key = 'same-key'`;
    assert.equal(
      await incrementArticleMetric(db, "same-key", "article", "engaged"),
      false,
    );
    await client`UPDATE view_receipts SET counted_at = NOW() - INTERVAL '24 hours 1 second' WHERE key = 'same-key'`;
    assert.equal(
      await incrementArticleMetric(db, "same-key", "article", "engaged"),
      true,
    );
    await incrementArticleMetric(db, "completion-key", "article", "completion");
    await incrementArticleMetric(db, "open-key", "article", "open");
    const [updated] =
      await client`SELECT * FROM article_metrics WHERE article_id = 'article'`;
    assert.equal(updated.engaged_views, 2);
    assert.equal(updated.page_views, 1);
    assert.equal(updated.read_completions, 1);
    await client`ALTER TABLE article_metrics ADD CONSTRAINT simulated_failure CHECK (article_id <> 'fail')`;
    await assert.rejects(
      incrementArticleMetric(db, "failure-key", "fail", "engaged"),
    );
    assert.equal(
      (await client`SELECT * FROM view_receipts WHERE key = 'failure-key'`)
        .length,
      0,
    );
    await client`ALTER TABLE article_metrics DROP CONSTRAINT simulated_failure`;
    assert.equal(
      await incrementArticleMetric(db, "failure-key", "fail", "engaged"),
      true,
    );
  } finally {
    await client.end();
    await admin.unsafe(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  }
});
