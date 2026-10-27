import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import postgres from "postgres";

const run = promisify(execFile);
test("Redis reply import supports dry run, preserves data, skips invalid/orphaned replies, and is rerunnable", async () => {
  const url = process.env.ENGAGEMENT_TEST_DATABASE_URL;
  assert.ok(url);
  const namespace = `reply_import_${randomUUID().replaceAll("-", "")}`;
  const db = postgres(url, { max: 1, onnotice: () => {} });
  await db.unsafe(`CREATE SCHEMA ${namespace}`);
  const parent = randomUUID(),
    missing = randomUUID(),
    member = randomUUID(),
    valid = randomUUID(),
    invalid = randomUUID(),
    orphan = randomUUID();
  await db.unsafe(`CREATE TABLE ${namespace}.comments (id uuid PRIMARY KEY, parent_id uuid REFERENCES ${namespace}.comments(id) ON DELETE CASCADE,
    user_id uuid NOT NULL, article_slug varchar NOT NULL, content varchar(500) NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`);
  await db.unsafe(
    `INSERT INTO ${namespace}.comments (id,user_id,article_slug,content) VALUES ($1,$2,'article','Parent')`,
    [parent, member],
  );
  const makeReply = (id: string, parentId: string, body: string) => ({
    id,
    parentId,
    memberId: member,
    name: "Ada L.",
    body,
    createdAt: "2026-10-01T12:00:00.000Z",
  });
  const rows = new Map<string, ReturnType<typeof makeReply>>([
    [valid, makeReply(valid, parent, "An existing reply")],
    [invalid, makeReply(invalid, parent, "x".repeat(501))],
    [orphan, makeReply(orphan, missing, "Missing parent")],
  ]);
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const command = JSON.parse(raw) as string[];
    let result: unknown;
    switch (command[0].toLowerCase()) {
      case "scan":
        result = ["0", [`radar:replies:${parent}`, `radar:replies:${missing}`]];
        break;
      case "zrange":
        result =
          Number(command[2]) > 0
            ? []
            : command[1].endsWith(parent)
              ? [valid, invalid]
              : [orphan];
        break;
      case "hgetall":
        result = Object.entries(
          rows.get(command[1].slice("radar:reply:".length))!,
        ).flat();
        break;
      default:
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "unexpected test command" }));
        return;
    }
    res.setHeader("Content-Type", "application/json");
    const encode = (value: unknown): unknown =>
      typeof value === "string"
        ? Buffer.from(value).toString("base64")
        : Array.isArray(value)
          ? value.map(encode)
          : value;
    res.end(
      JSON.stringify({
        result:
          req.headers["upstash-encoding"] === "base64"
            ? encode(result)
            : result,
      }),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const childUrl = new URL(url);
  childUrl.searchParams.set("options", `-c search_path=${namespace}`);
  const execute = async (apply: boolean) => {
    try {
      return await run(
        process.execPath,
        ["scripts/migrate-redis-replies.mjs", ...(apply ? ["--apply"] : [])],
        {
          env: {
            ...process.env,
            DATABASE_URL: childUrl.href,
            UPSTASH_REDIS_REST_URL: `http://127.0.0.1:${address.port}`,
            UPSTASH_REDIS_REST_TOKEN: "test-token",
          },
        },
      );
    } catch (error) {
      const failure = error as { code: number; stdout: string; stderr: string };
      assert.equal(failure.code, 2, failure.stderr);
      return failure;
    }
  };
  try {
    const dry = JSON.parse(
      (await execute(false)).stdout.trim().split("\n").at(-1)!,
    );
    assert.equal(dry.eligible, 1, JSON.stringify(dry));
    assert.equal(dry.inserted, 0);
    assert.equal(dry.missingParents, 1);
    assert.equal(dry.invalid, 1);
    assert.equal(
      (await db.unsafe(`SELECT * FROM ${namespace}.comments`)).length,
      1,
    );
    const applied = JSON.parse(
      (await execute(true)).stdout.trim().split("\n").at(-1)!,
    );
    assert.equal(applied.inserted, 1);
    const [imported] = await db.unsafe(
      `SELECT * FROM ${namespace}.comments WHERE id=$1`,
      [valid],
    );
    assert.equal(imported.content, "An existing reply");
    assert.equal(imported.article_slug, "article");
    assert.equal(imported.parent_id, parent);
    const again = JSON.parse(
      (await execute(true)).stdout.trim().split("\n").at(-1)!,
    );
    assert.equal(again.inserted, 0);
    assert.equal(again.existing, 1);
    assert.equal(rows.size, 3, "Redis source records are retained");
  } finally {
    server.close();
    await db.unsafe(`DROP SCHEMA ${namespace} CASCADE`);
    await db.end();
  }
});
