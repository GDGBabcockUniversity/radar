import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as tables from "../app/lib/db/schema";
import { getArticleViewTotal } from "../app/lib/article-view-total";
import { incrementArticleMetric } from "../app/lib/engaged-view-db";
import { createReply, deleteReply, getReplies } from "../app/lib/reply";

test("historical views snapshot once, preserve new counts, and survive concurrency and Redis loss", async () => {
  const url = process.env.ENGAGEMENT_TEST_DATABASE_URL;
  assert.ok(url, "Use an isolated ENGAGEMENT_TEST_DATABASE_URL");
  const namespace = `history_${randomUUID().replaceAll("-", "")}`;
  const admin = postgres(url, { max: 1, onnotice: () => {} });
  await admin.unsafe(`CREATE SCHEMA ${namespace}`);
  const client = postgres(url, {
    max: 10,
    connection: { search_path: namespace },
    onnotice: () => {},
  });
  const db = drizzle(client, { schema: tables });
  try {
    for (const file of [
      "0009_engaged_article_views.sql",
      "0010_historical_view_baseline.sql",
    ])
      await client.unsafe(await readFile(`drizzle/${file}`, "utf8"));
    await client.unsafe(`CREATE TABLE post_view_baselines (slug varchar(500) PRIMARY KEY, views integer NOT NULL);
      CREATE TABLE read_sessions (id uuid DEFAULT gen_random_uuid(), slug varchar(500));
      CREATE TABLE anonymous_views (fingerprint varchar(64) PRIMARY KEY, slug varchar(500));`);
    await client`INSERT INTO post_view_baselines VALUES ('example', 238)`;
    await client`INSERT INTO read_sessions (slug) SELECT 'example' FROM generate_series(1,12)`;
    await client`INSERT INTO read_sessions (slug) VALUES ('/articles/example')`;
    await client`INSERT INTO anonymous_views VALUES ('a','example'), ('b','example'), ('c','example')`;
    await incrementArticleMetric(db, "new-engagement", "article-id", "engaged");
    const identity = {
      id: "article-id",
      slug: "example",
      kind: "article" as const,
    };
    const readLegacy = async (key: string) => (key === "example" ? 250 : null);
    const totals = await Promise.all(
      Array.from({ length: 20 }, () =>
        getArticleViewTotal(db, identity, readLegacy),
      ),
    );
    assert.ok(totals.every((total) => total === 254)); // 250 + 3 anonymous + 1 engaged; path is an alias
    const [record] =
      await client`SELECT * FROM article_metrics WHERE article_id = 'article-id'`;
    assert.equal(record.historical_views, 253);
    assert.equal(record.engaged_views, 1);
    await client`INSERT INTO read_sessions (slug) VALUES ('example')`;
    const unavailable = async () => {
      throw Error("Redis unavailable");
    };
    assert.equal(
      await getArticleViewTotal(
        db,
        { ...identity, slug: "renamed" },
        unavailable,
      ),
      254,
    );
    await incrementArticleMetric(
      db,
      "another-engagement",
      "article-id",
      "engaged",
    );
    assert.equal(await getArticleViewTotal(db, identity, unavailable), 255);
    await assert.rejects(
      getArticleViewTotal(
        db,
        { id: "uninitialized", slug: "unknown", kind: "article" },
        unavailable,
      ),
    );
    assert.equal(
      (
        await client`SELECT * FROM article_metrics WHERE article_id = 'uninitialized'`
      ).length,
      0,
    );
    // Exercise the documented rollback, then restore the additive column.
    await client`ALTER TABLE article_metrics DROP COLUMN historical_views`;
    await client.unsafe(
      await readFile("drizzle/0010_historical_view_baseline.sql", "utf8"),
    );
  } finally {
    await client.end();
    await admin.unsafe(`DROP SCHEMA ${namespace} CASCADE`);
    await admin.end();
  }
});

test("PostgreSQL replies use parent article, names, stable order, ownership, and cascade deletion", async () => {
  const url = process.env.ENGAGEMENT_TEST_DATABASE_URL;
  assert.ok(url);
  const namespace = `replies_${randomUUID().replaceAll("-", "")}`;
  const admin = postgres(url, { max: 1, onnotice: () => {} });
  await admin.unsafe(`CREATE SCHEMA ${namespace}`);
  const client = postgres(url, {
    max: 5,
    connection: { search_path: namespace },
    onnotice: () => {},
  });
  const db = drizzle(client, { schema: tables });
  try {
    await client.unsafe(`CREATE TABLE radar_users (id uuid PRIMARY KEY, full_name varchar(255));
      CREATE TABLE comments (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), content varchar(500) NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(), user_id uuid NOT NULL, article_slug varchar NOT NULL,
        parent_id uuid REFERENCES comments(id) ON DELETE CASCADE);`);
    const owner = randomUUID(),
      other = randomUUID(),
      parent = randomUUID(),
      wrongParent = randomUUID();
    await client`INSERT INTO radar_users VALUES (${owner}, 'Ada Lovelace')`;
    await client`INSERT INTO comments (id,content,user_id,article_slug) VALUES
      (${parent},'Parent',${owner},'article'), (${wrongParent},'Other parent',${other},'other-article')`;
    const first = await createReply(db, {
      signalId: parent,
      memberId: owner,
      name: "Ada Lovelace",
      body: "First",
    });
    assert.ok(first);
    assert.equal(first.name, "Ada L.");
    const second = await createReply(db, {
      signalId: parent,
      memberId: other,
      body: "Second",
    });
    assert.ok(second);
    await client`UPDATE comments SET created_at='2026-01-01' WHERE id=${first.id}`;
    await client`UPDATE comments SET created_at='2026-01-02' WHERE id=${second.id}`;
    assert.equal(
      (await client`SELECT article_slug FROM comments WHERE id=${first.id}`)[0]
        .article_slug,
      "article",
    );
    const listed = await getReplies(db, parent);
    assert.ok(listed);
    assert.deepEqual(
      listed.map((row) => row.body),
      ["First", "Second"],
    );
    assert.equal(listed[0].name, "Ada L.");
    assert.equal(
      await createReply(db, {
        signalId: randomUUID(),
        memberId: owner,
        body: "Missing",
      }),
      null,
    );
    assert.equal(
      await createReply(db, {
        signalId: first.id,
        memberId: owner,
        body: "Nested",
      }),
      null,
    );
    assert.equal(await deleteReply(db, wrongParent, first.id, owner), false);
    assert.equal(await deleteReply(db, parent, first.id, other), false);
    assert.equal(await deleteReply(db, parent, parent, owner), false);
    assert.equal(await deleteReply(db, parent, first.id, owner), true);
    assert.equal((await getReplies(db, parent))?.length, 1);
    assert.equal(
      (
        await client`SELECT count(*)::int AS count FROM comments WHERE parent_id IS NULL`
      ).at(0)?.count,
      2,
    );
    await client`DELETE FROM comments WHERE id=${parent}`;
    assert.equal(await getReplies(db, parent), null);
    assert.equal(
      (await client`SELECT * FROM comments WHERE parent_id=${parent}`).length,
      0,
    );
    await client.end();
    await assert.rejects(getReplies(db, parent));
  } finally {
    await client.end();
    await admin.unsafe(`DROP SCHEMA ${namespace} CASCADE`);
    await admin.end();
  }
});
