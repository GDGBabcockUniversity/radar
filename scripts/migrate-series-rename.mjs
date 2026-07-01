// Renames the Series data model for clarity:
//   seriesGroup  ->  series   (the *show*, e.g. "Class of 2026 Spotlight")
//   series       ->  episode  (one weekly piece within a show)
//
// It flips each document's _type IN PLACE (keeping the same _id) so existing
// references stay valid, and renames the episode's `group` field -> `series`
// and `mainImage` -> `coverImage`. Episodes missing a publishedAt (now required)
// fall back to _createdAt. Idempotent: safe to re-run.
//
// Usage:
//   1. Ensure env vars are set (e.g. in .env.local, then `source` them):
//        NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
//        SANITY_WRITE_TOKEN   (mint at https://sanity.io/manage — Editor token)
//   2. Dry run (no writes):   node scripts/migrate-series-rename.mjs
//   3. Commit:                node scripts/migrate-series-rename.mjs --commit

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;
const commit = process.argv.includes("--commit");

if (!projectId || !dataset) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET.",
  );
  process.exit(1);
}
if (commit && !token) {
  console.error("Missing SANITY_WRITE_TOKEN (required for --commit).");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

// Drop undefined keys so we don't write nulls over good data.
function clean(obj) {
  Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
  return obj;
}

function toSeries(group) {
  return clean({
    _id: `migrated.series.${group._id}`,
    _type: "series",
    title: group.title,
    slug: group.slug,
    description: group.description,
    status: group.status ?? "active",
    order: group.order ?? 0,
  });
}

function toEpisode(ep) {
  return clean({
    _id: `migrated.episode.${ep._id}`,
    _type: "episode",
    title: ep.title,
    slug: ep.slug,
    // group -> series (update the referenced _id to the new migrated series _id)
    series: ep.group ? { ...ep.group, _ref: `migrated.series.${ep.group._ref}` } : undefined,
    youtubeUrl: ep.youtubeUrl,
    author: ep.author,
    // mainImage -> coverImage
    coverImage: ep.mainImage,
    excerpt: ep.excerpt,
    episodeNumber: ep.episodeNumber,
    // publishedAt is now required; fall back to creation time.
    publishedAt: ep.publishedAt ?? ep._createdAt,
    body: ep.body,
  });
}

async function main() {
  const [groups, episodes] = await Promise.all([
    client.fetch(`*[_type == "seriesGroup" && !(_id in path("drafts.**"))]`),
    client.fetch(`*[_type == "series" && !(_id in path("drafts.**"))]`),
  ]);

  console.log(
    `Found ${groups.length} seriesGroup -> series, ${episodes.length} series -> episode.`,
  );
  if (groups.length === 0 && episodes.length === 0) return;

  const newSeries = groups.map(toSeries);
  const newEpisodes = episodes.map(toEpisode);

  if (!commit) {
    console.log("\n--- DRY RUN (no writes) ---");
    newSeries.forEach((s) =>
      console.log(`  series:  ${s.title}  (_id: ${s._id})`),
    );
    newEpisodes.forEach((e) =>
      console.log(
        `  episode: ${e.title}  (_id: ${e._id}, series: ${e.series?._ref}, publishedAt: ${e.publishedAt})`,
      ),
    );
    console.log("\nRe-run with --commit to write these to Sanity.");
    return;
  }

  let tx = client.transaction();
  
  // First create the new documents
  [...newSeries, ...newEpisodes].forEach((doc) => {
    tx.create(doc);
  });
  
  // Then delete the old documents
  [...groups, ...episodes].forEach((doc) => {
    tx.delete(doc._id);
  });
  
  const res = await tx.commit();
  console.log(
    `\nDone. Rewrote ${newSeries.length} series + ${newEpisodes.length} episode docs.`,
  );
  console.log(`Transaction: ${res.transactionId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
