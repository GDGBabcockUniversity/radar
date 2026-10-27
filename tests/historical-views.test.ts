import { test } from "node:test";
import assert from "node:assert/strict";
import { historicalViewTotal } from "../app/lib/article-view-total";

test("historical totals preserve Redis counts without adding them twice", () => {
  assert.equal(historicalViewTotal(250, 0, 12, 3), 253);
  assert.equal(historicalViewTotal(250, 238, 12, 3), 253);
  assert.equal(historicalViewTotal(250, 238, 20, 3), 261);
});
test("database history remains usable when legacy Redis key has expired", () => {
  assert.equal(historicalViewTotal(null, 238, 12, 3), 253);
  assert.equal(historicalViewTotal(null, null, 12, 3), 15);
  assert.equal(historicalViewTotal(null, null, 0, 0), 0);
});
