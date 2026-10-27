import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE_PATH || "playwright"
);
const directory = await mkdtemp(join(tmpdir(), "radar-engagement-"));
const bundle = join(directory, "browser.js");
await build({
  entryPoints: ["tests/fixtures/article-engagement.tsx"],
  bundle: true,
  outfile: bundle,
  platform: "browser",
  jsx: "automatic",
  tsconfig: "tsconfig.json",
});
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
const events = [];
const server = createServer(async (req, res) => {
  if (req.url === "/bundle.js") {
    res.setHeader("Content-Type", "application/javascript");
    res.end(await readFile(bundle));
    return;
  }
  if (req.url.includes("/api/articles/")) {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    events.push(body);
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ token: "test-proof" }));
    return;
  }
  res.setHeader("Content-Type", "text/html");
  res.end('<div id="root"></div><script src="/bundle.js"></script>');
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : {}),
});
try {
  const page = await browser.newPage({
    viewport: { width: 1000, height: 800 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install();
  await page.goto(origin);
  await page.waitForFunction(() => document.querySelector("#body"));
  await page.waitForTimeout(100);
  assert.equal(
    events.filter((e) => e.event === "open").length,
    1,
    "Strict Mode sends one open",
  );
  await page.clock.runFor(11000);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    0,
    "time alone cannot engage",
  );
  await page
    .locator("#body")
    .evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 600),
    );
  await page.clock.runFor(500);
  await page.waitForTimeout(100);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    1,
    "body progress plus time engages",
  );
  await page.clock.runFor(11000);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    1,
    "only one engaged request",
  );
  await page
    .locator("#body")
    .evaluate((el) =>
      window.scrollTo(
        0,
        el.getBoundingClientRect().top + window.scrollY + 2200,
      ),
    );
  await page.clock.runFor(500);
  await page.waitForTimeout(100);
  assert.equal(events.filter((e) => e.event === "completion").length, 1);

  await page.getByRole("button", { name: "Unmount" }).click();
  const before = events.length;
  await page.clock.runFor(20000);
  assert.equal(events.length, before, "unmount cleans timers");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: real React hook in Chrome: Strict Mode, time-only, scroll, once-only, completion, unmount, clean console",
  );
  const short = await browser.newPage({
    viewport: { width: 1000, height: 800 },
  });
  await short.clock.install();
  await short.goto(`${origin}?short`);
  await short.waitForSelector("#body");
  await short.waitForTimeout(100);
  await short.locator("#body").scrollIntoViewIfNeeded();
  await short.clock.runFor(11000);
  await short.waitForTimeout(100);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    2,
    "short content engages without scroll distance",
  );
  console.log("PASS: short article in Chrome");
  const paused = await browser.newPage({
    viewport: { width: 1000, height: 800 },
  });
  // Simulate visibility/focus transitions deterministically in the real DOM.
  await paused.addInitScript(() => {
    window.testVisible = true;
    window.testFocused = true;
    Object.defineProperty(document, "visibilityState", {
      get: () => (window.testVisible ? "visible" : "hidden"),
    });
    document.hasFocus = () => window.testFocused;
  });
  await paused.clock.install();
  await paused.goto(origin);
  await paused.waitForSelector("#body");
  await paused.waitForTimeout(100);
  await paused
    .locator("#body")
    .evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 600),
    );
  await paused.clock.runFor(5000);
  await paused.evaluate(() => {
    window.testVisible = false;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await paused.clock.runFor(60000);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    2,
    "hidden time does not engage",
  );
  await paused.evaluate(() => {
    window.testVisible = true;
    window.testFocused = false;
    document.dispatchEvent(new Event("visibilitychange"));
    window.dispatchEvent(new Event("blur"));
  });
  await paused.clock.runFor(60000);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    2,
    "unfocused time does not engage",
  );
  await paused.evaluate(() => {
    window.testFocused = true;
    window.dispatchEvent(new Event("focus"));
  });
  await paused.clock.runFor(5500);
  await paused.waitForTimeout(100);
  assert.equal(
    events.filter((e) => e.event === "engaged").length,
    3,
    "returning resumes active time",
  );
  console.log("PASS: tab visibility and window focus pause/resume");
  const failed = await browser.newPage({
    viewport: { width: 1000, height: 800 },
  });
  let attempts = 0;
  await failed.route("**/api/articles/**/views", async (route) => {
    const body = route.request().postDataJSON();
    if (body.event === "engaged") {
      attempts++;
      await route.abort();
    } else await route.continue();
  });
  await failed.clock.install();
  await failed.goto(`${origin}?short`);
  await failed.waitForSelector("#body");
  await failed.waitForTimeout(100);
  await failed.locator("#body").scrollIntoViewIfNeeded();
  await failed.clock.runFor(25_000);
  await failed.waitForTimeout(100);
  assert.equal(
    attempts,
    1,
    "network failure does not trigger repeated submissions",
  );
  assert.ok(
    await failed.locator("#body").isVisible(),
    "article remains readable",
  );
  console.log("PASS: failed engagement request leaves reading uninterrupted");
} finally {
  await browser.close();
  server.close();
  await rm(directory, { recursive: true, force: true });
}
