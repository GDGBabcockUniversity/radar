import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { createArticleViewHandler } from "../app/lib/article-view-handler";
import { visitSigner, VISITOR_COOKIE } from "../app/lib/article-visit";
const secret = "test-secret-with-at-least-32-characters";
const signer = visitSigner(secret);
const visitor = signer.visitor();
function setup(
  options: { exists?: boolean; limited?: boolean; fail?: boolean } = {},
) {
  const records: string[] = [];
  const handler = createArticleViewHandler({
    secret: () => secret,
    rateLimit: async () => !options.limited,
    articleExists: async () => options.exists ?? true,
    record: async (_key, _id, event) => {
      if (options.fail) throw Error("unavailable");
      records.push(event);
    },
  });
  const post = (
    body: object,
    origin = "http://localhost",
    agent = "Mozilla/5.0",
  ) =>
    handler(
      new NextRequest("http://localhost/api/articles/article/views", {
        method: "POST",
        headers: {
          origin,
          "user-agent": agent,
          cookie: `${VISITOR_COOKIE}=${visitor.cookie}`,
        },
        body: JSON.stringify(body),
      }),
      { params: Promise.resolve({ id: "article" }) },
    );
  return { post, records };
}
const engaged = (age = 11_000, overrides = {}) => ({
  event: "engaged",
  token: signer.issue(visitor.id, "article", randomUUID(), Date.now() - age),
  activeMs: 10_000,
  depth: 0.25,
  ...overrides,
});
test("opening issues private visit proof and secure cookie without engaging", async () => {
  const f = setup();
  const res = await f.post({ event: "open", visitId: randomUUID() });
  assert.equal(res.status, 200);
  assert.ok((await res.json()).token);
  assert.match(res.headers.get("set-cookie") ?? "", /HttpOnly/);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.deepEqual(f.records, ["open"]);
});
test("engagement requires time, depth, and valid server-issued proof", async () => {
  const f = setup();
  for (const body of [
    engaged(100),
    engaged(11_000, { activeMs: 9999 }),
    engaged(11_000, { depth: 0.24 }),
    engaged(11_000, { token: "forged" }),
  ])
    assert.equal((await f.post(body)).status, 400);
  assert.deepEqual(f.records, []);
  assert.equal((await f.post(engaged())).status, 204);
  assert.deepEqual(f.records, ["engaged"]);
});
test("completions are separate and require 90 percent depth", async () => {
  const f = setup();
  assert.equal(
    (await f.post(engaged(11_000, { event: "completion", depth: 0.89 })))
      .status,
    400,
  );
  assert.equal(
    (await f.post(engaged(11_000, { event: "completion", depth: 0.9 }))).status,
    204,
  );
  assert.deepEqual(f.records, ["completion"]);
});
test("unknown articles, cross-origin submissions, bots, and rate limits are rejected", async () => {
  assert.equal((await setup({ exists: false }).post(engaged())).status, 404);
  assert.equal(
    (await setup().post(engaged(), "https://other.example")).status,
    403,
  );
  const bot = setup();
  assert.equal((await bot.post(engaged(), undefined, "Googlebot")).status, 204);
  assert.deepEqual(bot.records, []);
  assert.equal((await setup({ limited: true }).post(engaged())).status, 429);
});
test("storage failure returns retryable error without leaking details", async () => {
  const res = await setup({ fail: true }).post(engaged());
  assert.equal(res.status, 503);
  assert.equal(res.headers.get("retry-after"), "60");
  assert.deepEqual(await res.json(), {
    error: "Views temporarily unavailable",
  });
});
