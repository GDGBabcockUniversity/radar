import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = "2024-01-01";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

const builder = imageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// Fetch all posts
export async function getPosts() {
  return client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
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
    *[_type == "post" && featured == true] | order(publishedAt desc)[0] {
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
    *[_type == "post" && featured != true] | order(publishedAt desc)[0...$limit] {
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
