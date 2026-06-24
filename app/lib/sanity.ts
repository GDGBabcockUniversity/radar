import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { CREDENTIALS, PAGES } from "./constants";

const projectId = CREDENTIALS.sanity_project_id;
const dataset = CREDENTIALS.sanity_dataset;
const apiVersion = "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === "production", // CDN in production, fresh data in dev
});

const builder = imageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// Fetch all posts
export async function getPosts() {
  return client.fetch(`
    *[_type == "post" && hidden != true] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      featured,
      publishedAt,
      mainImage,
      "author": author->{ name, image },
      "categories": categories[]->{ title }
    }
  `);
}

// Fetch a single post by slug
export async function getPost(slug: string) {
  return client.fetch(
    `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      featured,
      hidden,
      publishedAt,
      mainImage,
      body,
      "author": author->{ name, image, bio },
      "categories": categories[]->{ title }
    }
  `,
    { slug },
  );
}

// Fetch featured post
export async function getFeaturedPost() {
  return client.fetch(`
    *[_type == "post" && featured == true && hidden != true] | order(publishedAt desc)[0] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      mainImage,
      "author": author->{ name, image },
      "categories": categories[]->{ title }
    }
  `);
}

// Fetch recent posts (all posts)
export async function getRecentPosts() {
  return client.fetch(`
    *[_type == "post" && hidden != true] | order(publishedAt desc) {
      _id,
      title,
      slug,
      description,
      publishedAt,
      mainImage,
      "author": author->{ name, image },
      "categories": categories[]->{ title }
    }
  `);
}

// Fetch all team members
export async function getTeamMembers() {
  return client.fetch(
    `
    *[_type == "teamMember"] | order(order asc, name asc) {
      _id,
      name,
      slug,
      role,
      course,
      image,
      songObsession,
      tabsCurrentlyOpen,
      currentlyLearning,
      unpopularOpinion,
      techPhilosophy,
      socialLinks
    }
  `,
    {},
    { next: { revalidate: 60 } }, // Revalidate every 60 seconds
  );
}

// Shared projection for an episode in list/card contexts.
const EPISODE_CARD_FIELDS = `
  _id,
  title,
  slug,
  excerpt,
  youtubeUrl,
  coverImage,
  publishedAt,
  episodeNumber,
  "series": series->{ title, slug },
  "author": author->{ name, slug, image }
`;

// All series (shows), each with its episodes. Active shows first.
export async function getSeriesList() {
  return client.fetch(
    `
    *[_type == "series"] | order(order asc, title asc) {
      _id,
      title,
      slug,
      description,
      coverImage,
      status,
      "episodes": *[_type == "episode" && references(^._id)]
        | order(episodeNumber asc, publishedAt desc) {
          ${EPISODE_CARD_FIELDS}
        }
    }
    `,
    {},
    { next: { revalidate: 60 } },
  );
}

// One series (show) by slug + its episodes (reverse query, like getIssue).
export async function getSeries(slug: string) {
  return client.fetch(
    `
    *[_type == "series" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      coverImage,
      status,
      "episodes": *[_type == "episode" && references(^._id)]
        | order(episodeNumber asc, publishedAt desc) {
          ${EPISODE_CARD_FIELDS}
        }
    }
    `,
    { slug },
    { next: { revalidate: 60 } },
  );
}

// A single episode by slug, with its series context and author.
export async function getEpisode(slug: string) {
  return client.fetch(
    `
    *[_type == "episode" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      youtubeUrl,
      coverImage,
      publishedAt,
      episodeNumber,
      body,
      "series": series->{ title, slug },
      "author": author->{ name, slug, image, bio, role }
    }
    `,
    { slug },
    { next: { revalidate: 60 } },
  );
}

// Latest episodes across all series, for the homepage Series pillar.
export async function getLatestEpisodes(limit = 3) {
  return client.fetch(
    `
    *[_type == "episode"] | order(publishedAt desc)[0...$limit] {
      ${EPISODE_CARD_FIELDS}
    }
    `,
    { limit },
    { next: { revalidate: 60 } },
  );
}

// The latest issue's Spotlight article, for the homepage Spotlight block.
// Spotlight is an issue section (not the series) — this surfaces that piece.
export async function getHomeSpotlight() {
  return client.fetch(
    `*[_type == "issue"] | order(issueNumber desc)[0]{
      "article": *[_type == "article" && references(^._id) && section == "spotlight"]
        | order(order asc, publishedAt asc)[0]{
          _id,
          title,
          slug,
          excerpt,
          coverImage,
          publishedAt,
          "issueNumber": ^.issueNumber,
          "issueTitle": ^.title,
          "authors": authors[]->{ name, slug, image }
        }
    }.article`,
    {},
    { next: { revalidate: 60 } },
  );
}

// The active/featured series for the homepage pillar (first active show).
export async function getFeaturedSeries() {
  return client.fetch(
    `
    *[_type == "series" && status == "active"] | order(order asc, title asc)[0] {
      _id,
      title,
      slug,
      description,
      coverImage,
      status
    }
    `,
    {},
    { next: { revalidate: 60 } },
  );
}

/* ------------------------------------------------------------------ */
/*  New publication model: issues, articles, authors                  */
/* ------------------------------------------------------------------ */

// Shared projection for an article when listed (card / byline contexts).
const ARTICLE_CARD_FIELDS = `
  _id,
  title,
  slug,
  section,
  excerpt,
  coverImage,
  publishedAt,
  order,
  "authors": authors[]->{ name, slug, image }
`;

// One full issue + its embedded signals/opportunities + all articles that
// reference it (reverse query), ready to be grouped by section on the page.
export async function getIssue(slug: string) {
  return client.fetch(
    `
    *[_type == "issue" && slug.current == $slug][0]{
      _id,
      issueNumber,
      title,
      slug,
      publishedAt,
      coverImage,
      excerpt,
      signals,
      opportunities,
      "articles": *[_type == "article" && references(^._id)]
        | order(section asc, order asc, publishedAt asc){
          ${ARTICLE_CARD_FIELDS}
        }
    }
    `,
    { slug },
    { next: { revalidate: 60 } },
  );
}

// Single article by slug, with full author list and issue context.
export async function getArticle(slug: string) {
  return client.fetch(
    `
    *[_type == "article" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      section,
      excerpt,
      coverImage,
      publishedAt,
      body,
      "issue": issue->{ title, slug, issueNumber },
      "authors": authors[]->{ name, slug, image, bio, role }
    }
    `,
    { slug },
    { next: { revalidate: 60 } },
  );
}

// Author profile + every article referencing them (reverse reference).
export async function getAuthor(slug: string) {
  return client.fetch(
    `
    *[_type == "author" && slug.current == $slug][0]{
      _id,
      name,
      slug,
      image,
      bio,
      role,
      course,
      socials,
      songObsession,
      tabsCurrentlyOpen,
      currentlyLearning,
      unpopularOpinion,
      techPhilosophy,
      "articles": *[_type == "article" && references(^._id)]
        | order(publishedAt desc){
          _id,
          title,
          slug,
          section,
          excerpt,
          coverImage,
          publishedAt,
          "issue": issue->{ title, slug, issueNumber }
        }
    }
    `,
    { slug },
    { next: { revalidate: 60 } },
  );
}

// All authors for the team page (only those meant to be shown — has a role).
// External bylines without a role are excluded so they don't surface on /team.
export async function getAuthors() {
  return client.fetch(
    `
    *[_type == "author" && defined(role)] | order(order asc, name asc){
      _id,
      name,
      slug,
      image,
      bio,
      role,
      course,
      socials,
      songObsession,
      tabsCurrentlyOpen,
      currentlyLearning,
      unpopularOpinion,
      techPhilosophy
    }
    `,
    {},
    { next: { revalidate: 60 } },
  );
}

// Map the legacy teamMember.socialLinks object -> labelled socials[] array so
// legacy docs render with the same UI as consolidated authors.
const LEGACY_SOCIAL_LABELS: Record<string, string> = {
  email: "Email",
  medium: "Medium",
  substack: "Substack",
  x: "X",
  instagram: "Instagram",
  snapchat: "Snapchat",
};

// Unified team roster for /team: consolidated `author` docs first, plus any
// legacy `teamMember` docs not yet migrated, normalised to the author shape.
// Legacy entries intentionally carry no slug, since they have no author profile
// page yet. Remove the teamMember branch once the migration has been run.
export async function getTeamRoster() {
  const [authors, teamMembers] = await Promise.all([
    getAuthors(),
    client.fetch(
      `
      *[_type == "teamMember"] | order(order asc, name asc){
        _id, name, slug, role, course, image, socialLinks,
        songObsession, tabsCurrentlyOpen, currentlyLearning,
        unpopularOpinion, techPhilosophy
      }
      `,
      {},
      { next: { revalidate: 60 } },
    ),
  ]);

  // Skip legacy docs already represented as an author (matched by slug, name).
  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const a of authors as any[]) {
    if (a.slug?.current) seen.add(`slug:${a.slug.current}`);
    if (a.name) seen.add(`name:${a.name.toLowerCase()}`);
  }

  const legacy = (teamMembers as TeamMemberDoc[])
    .filter(
      (tm) =>
        !(tm.slug?.current && seen.has(`slug:${tm.slug.current}`)) &&
        !(tm.name && seen.has(`name:${tm.name.toLowerCase()}`)),
    )
    .map((tm) => ({
      _id: tm._id,
      name: tm.name,
      role: tm.role,
      course: tm.course,
      image: tm.image,
      songObsession: tm.songObsession,
      tabsCurrentlyOpen: tm.tabsCurrentlyOpen,
      currentlyLearning: tm.currentlyLearning,
      unpopularOpinion: tm.unpopularOpinion,
      techPhilosophy: tm.techPhilosophy,
      socials: tm.socialLinks
        ? Object.entries(LEGACY_SOCIAL_LABELS)
            .filter(([key]) => tm.socialLinks?.[key])
            .map(([key, label]) => ({ label, url: tm.socialLinks![key]! }))
        : undefined,
    }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return [...(authors as any[]), ...legacy];
}

interface TeamMemberDoc {
  _id: string;
  name: string;
  slug?: { current: string };
  role?: string;
  course?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  socialLinks?: Record<string, string>;
  songObsession?: string;
  tabsCurrentlyOpen?: string;
  currentlyLearning?: string;
  unpopularOpinion?: string;
  techPhilosophy?: string;
}

// Every author who has ever published — bylined on an article or a legacy post,
// regardless of team/cohort membership. The permanent, ever-growing record of
// contributors (past and present). Ordered by name.
export async function getContributors() {
  return client.fetch(
    `
    *[_type == "author" && (
      count(*[_type == "article" && references(^._id)]) +
      count(*[_type == "post" && references(^._id)]) > 0
    )] | order(name asc){
      _id,
      name,
      slug,
      image,
      role,
      "count": count(*[_type == "article" && references(^._id)]) +
               count(*[_type == "post" && references(^._id)])
    }
    `,
    {},
    { next: { revalidate: 60 } },
  );
}

// Global search across content (articles + legacy posts) and authors. Used by
// the header search → /search. Prefix-matches each query word.
export async function searchAll(q: string) {
  const raw = (q ?? "").trim();
  if (!raw) return { results: [], authors: [] };
  const term = raw
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => `${w}*`)
    .join(" ");

  const [articles, posts, authors] = await Promise.all([
    client.fetch(
      `*[_type == "article" && (title match $term || excerpt match $term)]
        | order(publishedAt desc)[0...25]{
          _id, title, slug, excerpt, coverImage, publishedAt
        }`,
      { term },
      { next: { revalidate: 60 } },
    ),
    client.fetch(
      `*[_type == "post" && hidden != true && (title match $term || description match $term)]
        | order(publishedAt desc)[0...25]{
          _id, title, slug, description, mainImage, publishedAt
        }`,
      { term },
      { next: { revalidate: 60 } },
    ),
    client.fetch(
      `*[_type == "author" && name match $term] | order(name asc)[0...25]{
        _id, name, slug, image, role
      }`,
      { term },
      { next: { revalidate: 60 } },
    ),
  ]);

  const results = [
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(articles as any[]).map((a) => ({
      kind: "article" as const,
      _id: a._id,
      title: a.title,
      excerpt: a.excerpt,
      image: a.coverImage,
      publishedAt: a.publishedAt,
      href: PAGES.article(a.slug.current),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(posts as any[]).map((p) => ({
      kind: "post" as const,
      _id: p._id,
      title: p.title,
      excerpt: p.description,
      image: p.mainImage,
      publishedAt: p.publishedAt,
      href: PAGES.post(p.slug.current),
    })),
  ].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return { results, authors };
}

// All team cohorts, newest first — for the team-page year switcher.
export async function getTeamCohorts(): Promise<
  { _id: string; label: string; startYear: number }[]
> {
  return client.fetch(
    `*[_type == "teamCohort"] | order(startYear desc){ _id, label, startYear }`,
    {},
    { next: { revalidate: 60 } },
  );
}

// One cohort's roster, normalised to the same shape the team page already uses.
// Membership `role`/`order` override the author's defaults (roles rotate yearly).
// Pass a label to load a specific year; omit it for the current (newest) team.
export async function getTeamCohort(label?: string) {
  const query = `
    *[_type == "teamCohort"${label ? " && label == $label" : ""}]
      | order(startYear desc)[0]{
        _id,
        label,
        startYear,
        "members": members[]{
          role,
          order,
          course,
          image,
          songObsession,
          tabsCurrentlyOpen,
          currentlyLearning,
          unpopularOpinion,
          techPhilosophy,
          "author": author->{
            _id, name, slug, image, course, socials,
            songObsession, tabsCurrentlyOpen, currentlyLearning,
            unpopularOpinion, techPhilosophy
          }
        }
      }
  `;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cohort: any = await client.fetch(
    query,
    label ? { label } : {},
    { next: { revalidate: 60 } },
  );
  if (!cohort) return null;

  const members = (cohort.members ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((m: any) => m.author)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((m: any) => ({
      // Author is the permanent identity; per-year fields override it (with a
      // fallback to the author level for not-yet-migrated cohorts).
      ...m.author,
      role: m.role ?? m.author.role,
      order: m.order ?? 0,
      course: m.course ?? m.author.course,
      image: m.image ?? m.author.image,
      songObsession: m.songObsession ?? m.author.songObsession,
      tabsCurrentlyOpen: m.tabsCurrentlyOpen ?? m.author.tabsCurrentlyOpen,
      currentlyLearning: m.currentlyLearning ?? m.author.currentlyLearning,
      unpopularOpinion: m.unpopularOpinion ?? m.author.unpopularOpinion,
      techPhilosophy: m.techPhilosophy ?? m.author.techPhilosophy,
    }))
    .sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any, b: any) =>
        (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name),
    );

  return {
    _id: cohort._id as string,
    label: cohort.label as string,
    startYear: cohort.startYear as number,
    members,
  };
}

// The latest issue (highest issue number), for the home featured slot.
export async function getLatestIssue() {
  return client.fetch(
    `
    *[_type == "issue"] | order(issueNumber desc)[0]{
      _id,
      issueNumber,
      title,
      slug,
      publishedAt,
      coverImage,
      excerpt,
      signals,
      opportunities,
      editorial
    }
    `,
    {},
    { next: { revalidate: 60 } },
  );
}

// Unified archive: new issues + legacy posts, normalised into one shape so the
// home/archive listing can render both eras together (newest first).
export async function getArchive() {
  return client.fetch(
    `
    *[
      (_type == "issue") ||
      (_type == "post" && hidden != true)
    ] | order(coalesce(publishedAt, _createdAt) desc){
      _id,
      _type,
      "kind": _type,
      title,
      slug,
      publishedAt,
      issueNumber,
      "excerpt": coalesce(excerpt, description),
      "image": coalesce(coverImage, mainImage)
    }
    `,
    {},
    { next: { revalidate: 60 } },
  );
}

interface SitemapEntry {
  slug: string;
  updated: string;
  seriesSlug?: string;
}

// All content slugs + last-modified times, grouped by type, for the sitemap.
export async function getSitemapEntries(): Promise<{
  issues: SitemapEntry[];
  articles: SitemapEntry[];
  series: SitemapEntry[];
  episodes: SitemapEntry[];
  authors: SitemapEntry[];
  posts: SitemapEntry[];
}> {
  return client.fetch(
    `{
      "issues": *[_type == "issue" && defined(slug.current)]{ "slug": slug.current, "updated": _updatedAt },
      "articles": *[_type == "article" && defined(slug.current)]{ "slug": slug.current, "updated": _updatedAt },
      "series": *[_type == "series" && defined(slug.current)]{ "slug": slug.current, "updated": _updatedAt },
      "episodes": *[_type == "episode" && defined(slug.current) && defined(series->slug.current)]{ "slug": slug.current, "seriesSlug": series->slug.current, "updated": _updatedAt },
      "authors": *[_type == "author" && defined(slug.current)]{ "slug": slug.current, "updated": _updatedAt },
      "posts": *[_type == "post" && hidden != true && defined(slug.current)]{ "slug": slug.current, "updated": _updatedAt }
    }`,
    {},
    { next: { revalidate: 3600 } },
  );
}

interface FeedItem {
  _type: string;
  title: string;
  slug: string;
  seriesSlug?: string;
  excerpt?: string;
  publishedAt?: string;
  _createdAt: string;
}

// Newest content across all pillars (issues, articles, episodes, legacy posts)
// for the RSS feed, normalised so each can build its own URL.
export async function getFeedItems(limit = 30): Promise<FeedItem[]> {
  return client.fetch(
    `*[
      (_type == "issue") ||
      (_type == "article") ||
      (_type == "episode") ||
      (_type == "post" && hidden != true)
    ] | order(coalesce(publishedAt, _createdAt) desc)[0...$limit]{
      _type,
      title,
      "slug": slug.current,
      "seriesSlug": series->slug.current,
      "excerpt": coalesce(excerpt, description),
      publishedAt,
      _createdAt
    }`,
    { limit },
    { next: { revalidate: 3600 } },
  );
}
