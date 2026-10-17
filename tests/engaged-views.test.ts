import { test } from "node:test";
import assert from "node:assert/strict";
import { recordEngagedMetric } from "../app/lib/engaged-view-service";

function fixture() {
  const keys = new Map<string, string>();
  const receipts = new Set<string>();
  let count = 0;
  let redisFails = false;
  let databaseFails = false;
  let ambiguous = false;
  const store = {
    async reserve(key: string, token: string) {
      if (redisFails) throw Error("redis unavailable");
      if (keys.has(key)) return false;
      keys.set(key, token);
      return true;
    },
    async release(key: string, token: string) {
      if (keys.get(key) === token) keys.delete(key);
    },
    async increment(key: string) {
      if (databaseFails) throw Error("database unavailable");
      if (receipts.has(key)) return false;
      receipts.add(key);
      count++;
      if (ambiguous) throw Error("response lost after commit");
      return true;
    },
  };
  return {
    store,
    keys,
    get count() {
      return count;
    },
    redisFailure: () => {
      redisFails = true;
    },
    databaseFailure: (value: boolean) => {
      databaseFails = value;
    },
    ambiguousFailure: () => {
      ambiguous = true;
    },
  };
}
test("duplicate and concurrent requests increment once", async () => {
  const f = fixture();
  await Promise.all(
    Array.from({ length: 30 }, () =>
      recordEngagedMetric("article:visitor", f.store),
    ),
  );
  assert.equal(f.count, 1);
});
test("Redis failure fails closed without counting", async () => {
  const f = fixture();
  f.redisFailure();
  await assert.rejects(recordEngagedMetric("key", f.store));
  assert.equal(f.count, 0);
});
test("database failure after Redis reservation can be retried", async () => {
  const f = fixture();
  f.databaseFailure(true);
  await assert.rejects(recordEngagedMetric("key", f.store));
  f.databaseFailure(false);
  await recordEngagedMetric("key", f.store);
  assert.equal(f.count, 1);
});
test("ambiguous database commit cannot double count on retry", async () => {
  const f = fixture();
  f.ambiguousFailure();
  await assert.rejects(recordEngagedMetric("key", f.store));
  await recordEngagedMetric("key", f.store);
  assert.equal(f.count, 1);
});
test("stale Redis reservation still allows durable recovery", async () => {
  const f = fixture();
  f.keys.set("key", "crashed-request");
  await recordEngagedMetric("key", f.store);
  assert.equal(f.count, 1);
});
