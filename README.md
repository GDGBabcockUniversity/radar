[![Keyway Secrets](https://www.keyway.sh/badge.svg?repo=GDGBabcockUniversity/radar)](https://www.keyway.sh/vaults/GDGBabcockUniversity/radar)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Distributed authentication and engagement

RADAR authenticates against `auth-v2` through `AUTH_API_URL`. It stores only the resulting access and refresh tokens as httpOnly RADAR cookies; Firebase handles email/password registration, sign-in, and Google sign-in in the browser. RADAR exchanges the Firebase ID token at `/auth/login`; the JWT signing key stays in auth-v2.

Set `DATABASE_URL` to RADAR's PostgreSQL database. Drizzle owns RADAR's engagement tables; Redis remains the leaderboard projection. auth-v2 owns member identities, and RADAR stores their UUID as `user_id` without a cross-database foreign key.

After setting `DATABASE_URL`, run `npm run db:migrate` before deploying the application.

To import the existing RADAR data from the legacy auth database, set `RADAR_SOURCE_DATABASE_URL` to that database and run `npm run db:migrate:auth-radar`. The command is idempotent and refuses to run if the source and target URLs are the same.

Required auth and storage environment variables:

- `AUTH_API_URL` — auth-v2 base URL, for Firebase token exchange, token refresh, logout, and member lookup.
- `DATABASE_URL` — RADAR's own PostgreSQL connection string, used only by Drizzle.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — leaderboard and fast aggregate projection storage.

Configure `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_FIREBASE_APP_ID` using the Firebase web app configuration for the same project used by auth-v2. Enable Email/Password and Google providers and add RADAR's domain to Firebase Authentication's authorized domains. These public values must be available when building the frontend.

Firebase credentials use memory persistence and are cleared after the token exchange. RADAR keeps platform tokens in httpOnly cookies, refreshes sessions through `/auth/refresh`, and calls `/auth/logout` before clearing cookies. The former Google redirect routes have been removed; use the sign-in dialog.

RADAR keeps a small `radar_users` table with the auth UUID and display name for local joins. The signed QStash worker at `/api/worker/auth-user` accepts auth-v2 member snapshots. It ignores older snapshots and safely accepts retries. Signal reads use a left join so records remain visible while a user snapshot is pending.

1. Apply RADAR's Drizzle migrations and deploy the worker. Configure `QSTASH_CURRENT_SIGNING_KEY` and `QSTASH_NEXT_SIGNING_KEY` in RADAR.
2. Configure auth-v2 with `QSTASH_TOKEN`, `QSTASH_URL`, and `RADAR_USER_EVENT_URL=https://radar.gdgbabcock.com/api/worker/auth-user`, then run its `sync-users` command for the initial name backfill.

## Article loading

Article and legacy post routes show a full-page “Loading article…” state until
server data is ready. Article content, engaged view counts, and initial signals
load before the page renders; legacy posts also await related posts. Initial
counters and comments no longer make separate browser requests after rendering.
Optional analytics failures do not block the article. Images load normally in
the browser. The loading indicator respects reduced-motion preferences.

## Article engagement

Public counters on `/articles/...` and legacy `/posts/...` display **historical
views + new engaged views**, keeping the familiar “views” label. New views require
10 seconds of active reading **and** 25% progress through the article body. Time
pauses when the document is hidden or the window loses focus. Progress and time
can qualify in either order. Depth is distance travelled through the body's
scrollable height, excluding the header, sidebar, comments, and footer. A body
shorter than the viewport qualifies for depth when fully visible, but still
requires 10 active seconds. Empty bodies do not qualify.

`useArticleEngagement` wraps the existing body through `ArticleEngagement`. It
uses refs and a mutable progress accumulator, passive scroll listeners, a resize
observer, and the Page Visibility/focus APIs. It emits once per event per mounted
article visit and cleans up listeners, observer, and timer. It does not retry
failed requests automatically; analytics failures never interrupt reading.
Historical signed-in reading-session statistics remain available; the retired
reading tracker no longer collects them.

### Deployment and migration

1. Set `ARTICLE_VIEW_SECRET` to a random secret of at least 32 characters, shared
   across all RADAR instances. Keep it stable: rotation resets visitor identity.
2. Run `npm run db:migrate` with `DATABASE_URL` configured. Migration
   `0009_engaged_article_views.sql` adds `article_metrics` (three independent
   counters) and `view_receipts` (opaque deduplication keys and timestamps).
   Migration `0010_historical_view_baseline.sql` adds a nullable `historical_views`
   snapshot alongside the independent engagement counter. Apply both before rollout.
3. Configure the existing Upstash Redis environment variables and restart RADAR.

Existing public view totals are preserved. On the first counter read, the app
snapshots legacy Redis `views:<slug>` totals, PostgreSQL `post_view_baselines`,
recorded read sessions, and anonymous views into `historical_views`, keyed by
stable Sanity document ID. Redis totals overlap stored baselines/read sessions,
so they are compared rather than added twice. Bare slugs and canonical paths
are aliases; the larger historical total is retained rather than summing possibly
overlapping histories. Later reads return that immutable snapshot plus new
engaged views. Concurrent initialization cannot overwrite the snapshot or erase
new engagement counts. The snapshot is not saved if legacy Redis is unavailable;
a later read retries. Once saved, public totals no longer depend on legacy Redis.
Do not remove legacy keys/tables before their counts have been snapshotted.
Already expired historical Redis data cannot be reconstructed unless a durable
baseline or backup exists. Historical views are not relabeled as verified engagement.

The legacy `/api/reads` and `/api/views` endpoints and their reading tracker
have been removed. Issues no longer display a legacy view counter; issues and
video series do not use the article engagement endpoint. Legacy view and read
tables remain intact for historical data. The old `VIEW_FINGERPRINT_SECRET`
and `VIEW_IP_HEADER` settings are no longer needed.

For rollback, revert the application change first. The two new tables are
additive and can remain, or be dropped after exporting any desired analytics.
To reverse only migration `0010`, revert the dependent code, export the historical
snapshots, then run `ALTER TABLE article_metrics DROP COLUMN historical_views`.
That down path is exercised against an isolated test schema.
No migration or production deployment is run automatically by this change.

### Endpoint and identity

`POST /api/articles/:id/views` takes a **Sanity document ID**, not a slug. It
validates that a non-hidden published article/post exists, excluding drafts.
All requests require a same-origin `Origin` header. Responses are `no-store`.

- `{ event: "open", visitId: "<random UUID v4>" }` records a page opening and
  returns `{ token }` with a server-signed visit proof. It sets a persistent,
  signed, HttpOnly, SameSite=Lax first-party `radar_visitor` cookie (Secure in
  production, one-year lifetime). Initialization is reused during React Strict
  Mode effect replay. Reading time starts after initialization succeeds.
- `{ event: "engaged", token, activeMs, depth }` records engagement after both
  thresholds. `depth` is a fraction in `[0, 1]`. The server verifies the proof,
  its binding to article and visitor, elapsed wall time, and reported bounds.
- `{ event: "completion", token, activeMs, depth }` records 90% body progress
  separately; completion does not require ten seconds or imply engagement.

Successful engagement/completion, including duplicates, returns `204`.
Invalid input returns `400`, cross-origin requests `403`, missing/unpublished
articles `404`, rate limits `429`, and infrastructure failure `503` with
`Retry-After`. Known bots receive `204` without writes. No visitor ID is returned;
proofs contain an opaque keyed visitor hash. `GET` on the same endpoint returns
only `{ views }`, the historical baseline plus new engaged views. The public counter refreshes after a
successful engagement submission.

Page views count distinct visit IDs (opening again or refreshing is another
page view). Engagement and completion each count once per visitor/article in a
**rolling 24-hour window**, for both signed-in and anonymous readers. Login does
not change this cookie-based identity. Requests use Redis `SET NX EX 86400`.
Redis reservations are advisory: every request also runs a conditional PostgreSQL
receipt upsert and counter increment in **one atomic statement**. This prevents
concurrent duplicates and safely recovers if a process crashes after reserving
Redis, if the DB transaction fails, or if a committed DB response is lost.
Failed writes release only their own Redis reservation using compare-and-delete.
Redis outages fail closed with `503`, rather than accepting unprotected writes.
There is no cross-system transaction and no background worker.

Only keyed receipt hashes and timestamps are stored, without raw IP addresses,
user agents, visitor IDs, or membership associations. Redis rate limits default
to 60 valid submissions per visitor/minute and a 3,000/minute site-wide ceiling
that also limits cookie churn. Global and visitor increments set expiry atomically.
Adjust these ceilings to measured site traffic. Standard deployment-level request
limits remain useful against floods of malformed requests.

Receipts must be retained for at least 24 hours to preserve deduplication.
During existing database maintenance, prune expired receipts (for example,
`DELETE FROM view_receipts WHERE counted_at < NOW() - INTERVAL '48 hours'`).
The aggregated article counters remain. No new scheduler is required.

### Verification limits

Client events are engagement signals, not proof of a human reading. A determined
client can wait ten seconds and forge depth/focus/time, spoof its user agent,
clear cookies, use separate profiles, or block analytics entirely. Signed
proofs prevent invented start times and cross-visitor/article replay, but do not
solve deliberate automation. Cookie loss resets identity. Simultaneous very first
visits in different tabs can race cookie establishment. Shared browsers count as
one visitor. Failed initializations/submissions may undercount; the frontend
intentionally sends no automatic retries, while backend retries are idempotent.

### Tests

- `npm test`: deterministic engagement, route validation, identity, concurrency,
  and Redis/database failure tests using Node's test runner and existing `tsx`.
- `ENGAGEMENT_TEST_DATABASE_URL=postgres://... npm run test:engagement:db`:
  real PostgreSQL concurrency, historical baselines, rolling expiry, replies,
  Redis reply import, distinct metrics, and rollback.
  Use an isolated test database; the test creates and drops its own schema.
- `npm run test:engagement:browser`: actual React hook in isolated headless Chrome,
  including Strict Mode, scroll/time gates, short articles, visibility/focus
  transitions, one-shot events, and cleanup. Uses an existing Playwright runtime;
  if it is outside this project's modules, set `PLAYWRIGHT_MODULE_PATH` to its
  `index.mjs`. Set `CHROME_PATH` to use an installed Chrome executable. No runtime
  dependencies were added to the application.

The installed Next.js 16.1.3 package does not include `next/dist/docs`; route and
cookie conventions were checked against the official [route handler reference](https://nextjs.org/docs/app/api-reference/file-conventions/route)
and [cookie reference](https://nextjs.org/docs/app/api-reference/functions/cookies).
The durable concurrency guard follows PostgreSQL's atomic [INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html)
semantics, with Redis [SET NX/EX](https://redis.io/docs/latest/commands/set/) reservations.

## PostgreSQL replies

`GET/POST/DELETE /api/replies/:signalId` now use the existing PostgreSQL `comments`
table and its cascading `parent_id` foreign key. No new reply table is needed.
Top-level signals exclude replies; their reply counts are computed from actual
child rows, so there is no Redis counter to drift. Replies inherit their parent's
article slug. GET joins the mirrored user names, formats them for public display,
and orders replies by creation time then ID. POST requires an existing top-level
parent and takes a key-share lock while inserting. DELETE matches the reply ID,
parent ID, and authenticated member in one query. Replies cannot delete a parent
or another member's reply. Invalid UUIDs/bodies return `400`, missing parents `404`,
unauthenticated writes `401`, forbidden writes `403`, and database failures `503`.
Writes require a same-origin Origin header; responses are not cached.

Before switching writers to the new endpoint, import existing Redis replies:

```sh
npm run db:migrate:replies           # dry run: counts only, no writes
npm run db:migrate:replies -- --apply
```

The importer uses `.env`, scans parent reply sets in batches, retains IDs and
creation times, validates content and IDs, and imports only replies whose parent
already exists in PostgreSQL. It never deletes Redis data or overwrites existing
comments; reruns skip matching rows. Missing parents/invalid records are reported
as aggregate counts and exit status `2`; resolve those before removing the old
storage. Existing public names resolve through `radar_users`. Pause old reply
writes during the final import/cutover, or rerun the import to collect late writes.
If old Redis parent IDs differ from PostgreSQL IDs, an explicit ID mapping is
needed before those replies can be imported; the script will not guess a parent.
No production migration or import runs automatically with this code change.
