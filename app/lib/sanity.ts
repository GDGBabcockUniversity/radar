import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import { CREDENTIALS } from "./constants";

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

// Fetch all series groups along with their series
export async function getSeriesGroups() {
  return client.fetch(
    `
    *[_type == "seriesGroup"] | order(title asc) {
      _id,
      title,
      slug,
      description,
      "series": *[_type == "series" && references(^._id)] | order(publishedAt desc) {
        _id,
        title,
        slug,
        youtubeUrl,
        publishedAt,
        mainImage,
        "author": author->{ name, image }
      }
    }
    `,
    {},
    { next: { revalidate: 60 } }
  );
}

// Fetch a single series by slug
export async function getSeriesPost(slug: string) {
  return client.fetch(
    `
    *[_type == "series" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      "group": group->{ title, slug },
      youtubeUrl,
      publishedAt,
      mainImage,
      body,
      "author": author->{ name, image, bio }
    }
    `,
    { slug },
    { next: { revalidate: 60 } }
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
export async function getAuthors() {
  return client.fetch(
    `
    *[_type == "author"] | order(order asc, name asc){
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
      excerpt
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
