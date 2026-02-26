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

// Fetch recent posts (excluding featured)
export async function getRecentPosts(limit: number = 4) {
  return client.fetch(
    `
    *[_type == "post" && featured != true && hidden != true] | order(publishedAt desc)[0...$limit] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      mainImage,
      "author": author->{ name, image },
      "categories": categories[]->{ title }
    }
  `,
    { limit: limit - 1 },
  );
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
      department,
      image,
      quote,
      songObsession,
      favoriteBook,
      favoriteColor,
      colorMeaning,
      howIManagePressure,
      socialLinks
    }
  `,
    {},
    { next: { revalidate: 60 } }, // Revalidate every 60 seconds
  );
}
