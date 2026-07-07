// Migrates legacy `teamMember` documents into the consolidated `author` type.
//
// The redesign uses a single identity (`author`) for both bylines and the team
// page. This copies each teamMember's data into an author doc, mapping the old
// `socialLinks` object into the new `socials[]` array. It is idempotent: each
// author gets a deterministic _id derived from the source teamMember, so
// re-running updates rather than duplicates.
//
// Usage:
//   1. Ensure these env vars are set (e.g. in .env.local, then `source` them):
//        NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
//        SANITY_WRITE_TOKEN   (mint at https://sanity.io/manage — Editor token)
//   2. Dry run (no writes):   node scripts/migrate-teammembers-to-authors.mjs
//   3. Commit:                node scripts/migrate-teammembers-to-authors.mjs --commit
//
// Existing teamMember docs are NOT deleted — review the created authors first.

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

// Build a URL-safe slug from a name (fallback when a teamMember has none).
function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map the old fixed socialLinks object to the new labelled socials[] array.
function mapSocials(socialLinks) {
  if (!socialLinks) return undefined;
  const labels = {
    email: "Email",
    medium: "Medium",
    substack: "Substack",
    x: "X",
    instagram: "Instagram",
    snapchat: "Snapchat",
  };
  const socials = Object.entries(labels)
    .filter(([key]) => socialLinks[key])
    .map(([key, label]) => ({
      _key: key,
      label,
      url: socialLinks[key],
    }));
  return socials.length ? socials : undefined;
}

function toAuthor(tm) {
  const author = {
    _id: `author-from-${tm._id.replace(/^drafts\./, "")}`,
    _type: "author",
    name: tm.name,
    // author.slug is now required; derive one from the name if the legacy
    // teamMember had none, so every migrated author has a usable profile route.
    slug: tm.slug?.current
      ? tm.slug
      : { _type: "slug", current: slugify(tm.name) },
    image: tm.image,
    role: tm.role,
    course: tm.course,
    order: tm.order ?? 0,
    socials: mapSocials(tm.socialLinks),
    songObsession: tm.songObsession,
    tabsCurrentlyOpen: tm.tabsCurrentlyOpen,
    currentlyLearning: tm.currentlyLearning,
    unpopularOpinion: tm.unpopularOpinion,
    techPhilosophy: tm.techPhilosophy,
  };
  // Drop undefined keys so we don't clobber with nulls.
  Object.keys(author).forEach((k) => author[k] === undefined && delete author[k]);
  return author;
}

async function main() {
  const teamMembers = await client.fetch(
    `*[_type == "teamMember" && !(_id in path("drafts.**"))]`,
  );
  console.log(`Found ${teamMembers.length} teamMember document(s).`);

  if (teamMembers.length === 0) return;

  const authors = teamMembers.map(toAuthor);

  if (!commit) {
    console.log("\n--- DRY RUN (no writes). Authors that would be created: ---");
    authors.forEach((a) =>
      console.log(`  • ${a.name}  (_id: ${a._id}, slug: ${a.slug?.current})`),
    );
    console.log("\nRe-run with --commit to write these to Sanity.");
    return;
  }

  let tx = client.transaction();
  authors.forEach((a) => {
    tx = tx.createOrReplace(a);
  });
  const res = await tx.commit();
  console.log(`\nDone. Wrote ${authors.length} author document(s).`);
  console.log(`Transaction: ${res.transactionId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
