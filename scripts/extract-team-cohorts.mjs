// Extracts team cohorts from author documents.
//
// Usage:
//   1. Ensure these env vars are set (e.g. in .env.local, then `source` them):
//        NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET
//        SANITY_WRITE_TOKEN   (mint at https://sanity.io/manage — Editor token)
//   2. Dry run (no writes):   node scripts/extract-team-cohorts.mjs
//   3. Commit:                node scripts/extract-team-cohorts.mjs --commit

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

function generateKey() {
  return Math.random().toString(36).substring(2, 10);
}

async function main() {
  // 1. Fetch all migrated authors
  const authors = await client.fetch(`*[_type == "author" && _id match "author-from-*"]`);
  console.log(`Found ${authors.length} author document(s).`);

  if (authors.length === 0) return;

  // 2. Construct the teamCohort document for 2026/2027
  const members = authors.map((author) => {
    const member = {
      _key: generateKey(),
      _type: "cohortMember",
      author: {
        _type: "reference",
        _ref: author._id,
      },
      role: author.role,
      order: author.order ?? 0,
      course: author.course,
      songObsession: author.songObsession,
      tabsCurrentlyOpen: author.tabsCurrentlyOpen,
      currentlyLearning: author.currentlyLearning,
      unpopularOpinion: author.unpopularOpinion,
      techPhilosophy: author.techPhilosophy,
    };
    
    // Drop undefined or null keys
    Object.keys(member).forEach((k) => (member[k] === undefined || member[k] === null) && delete member[k]);
    return member;
  });

  const newCohort = {
    _type: "teamCohort",
    label: "2025/2026",
    startYear: 2025,
    members: members,
  };

  if (!commit) {
    console.log("\n--- DRY RUN (no writes) ---");
    console.log(`Would create teamCohort: ${newCohort.label} (${newCohort.startYear})`);
    console.log(`With ${newCohort.members.length} members:\n`);
    newCohort.members.forEach((m) => {
      const authorDoc = authors.find(a => a._id === m.author._ref);
      console.log(`  • ${authorDoc?.name} (Role: ${m.role || 'N/A'})`);
    });
    console.log("\nRe-run with --commit to write this to Sanity.");
    return;
  }

  let tx = client.transaction();
  tx = tx.create(newCohort);
  const res = await tx.commit();
  console.log(`\nDone. Created new team cohort for 2025/2026.`);
  console.log(`Transaction: ${res.transactionId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
