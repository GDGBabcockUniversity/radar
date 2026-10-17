import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EngagementProgress,
  contentProgress,
} from "../app/lib/article-engagement";

test("leaving immediately does not engage", () => {
  const p = new EngagementProgress();
  assert.equal(p.update(0, true, 1).engaged, false);
});
test("10 seconds without reaching content threshold does not engage", () => {
  const p = new EngagementProgress();
  p.update(0, true, 0);
  assert.equal(p.update(10_000, true, 0).engaged, false);
});
test("scrolling 25% before ten seconds waits for active time, then emits once", () => {
  const p = new EngagementProgress();
  p.update(0, true, 0.25);
  assert.equal(p.update(9_999, true, 0.1).engaged, false);
  assert.equal(p.update(10_000, true, 0.1).engaged, true);
  assert.equal(p.update(20_000, true, 1).engaged, false);
});
test("time can be satisfied before scroll depth", () => {
  const p = new EngagementProgress();
  p.update(0, true, 0);
  p.update(10_000, true, 0);
  assert.equal(p.update(10_001, true, 0.25).engaged, true);
});
test("hidden and unfocused time is excluded", () => {
  const p = new EngagementProgress();
  p.update(0, true, 0.3);
  p.update(5_000, false, 0.3);
  p.update(50_000, false, 0.3);
  p.update(60_000, true, 0.3);
  assert.equal(p.update(64_999, true, 0.3).engaged, false);
  assert.equal(p.update(65_000, true, 0.3).engaged, true);
});
test("content progress excludes surrounding page and handles short or empty articles", () => {
  assert.equal(contentProgress(1000, 2000, 800), 0);
  assert.equal(contentProgress(-300, 2000, 800), 0.25);
  assert.equal(contentProgress(200, 400, 800), 1);
  assert.equal(contentProgress(900, 400, 800), 0);
  assert.equal(contentProgress(0, 0, 800), 0);
});
test("completion is a separate one-shot event at 90%", () => {
  const p = new EngagementProgress();
  assert.equal(p.update(0, true, 0.89).completed, false);
  assert.deepEqual(p.update(100, true, 0.9), {
    engaged: false,
    completed: true,
  });
  assert.equal(p.update(200, true, 1).completed, false);
});
