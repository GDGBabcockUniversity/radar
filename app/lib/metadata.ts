import type { Metadata } from "next";
import { urlFor } from "./sanity";
import { BASE_URL, IMAGES, PAGES } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImage = any;

interface OgMetaInput {
  title: string;
  description?: string;
  image?: SanityImage;
  /** Raw image URL fallback when there is no Sanity image (e.g. YouTube thumb). */
  imageUrl?: string;
  /** Absolute or root-relative canonical path, e.g. "/articles/foo". */
  path: string;
  /** OG type — "article" for articles/issues, "website" otherwise. */
  type?: "article" | "website";
  publishedTime?: string;
}

// Renders a 1200×630 OG image URL from a Sanity image, a raw URL, or a fallback.
function ogImageUrl(image?: SanityImage, imageUrl?: string): string {
  if (image?.asset) {
    return urlFor(image).width(1200).height(630).fit("crop").url();
  }
  if (imageUrl) return imageUrl;
  return `${BASE_URL}/radar-logo.png`;
}

// Single source of truth for per-page Open Graph + Twitter Card metadata.
// Used by generateMetadata on article and issue pages so links unfurl on
// WhatsApp/X/LinkedIn with a real title, description, and image.
export function buildOgMetadata({
  title,
  description,
  image,
  imageUrl,
  path,
  type = "article",
  publishedTime,
}: OgMetaInput): Metadata {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const fullTitle = `${title} | RADAR`;
  const desc =
    description || "Your signal to what's next in the Babcock tech ecosystem.";
  const img = ogImageUrl(image, imageUrl);

  return {
    title: fullTitle,
    description: desc,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: "RADAR",
      type,
      ...(type === "article" && publishedTime ? { publishedTime } : {}),
      images: [{ url: img, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: desc,
      images: [img],
    },
  };
}

interface ArticleJsonLdInput {
  title: string;
  description?: string;
  image?: SanityImage;
  /** Absolute or root-relative canonical path, e.g. "/articles/foo". */
  path: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: { name: string; slug?: { current: string } }[];
}

// schema.org Article structured data for the article page. Emitted as a
// JSON-LD <script> so search engines can surface author, date, headline, and
// image as an article rich result.
export function buildArticleJsonLd({
  title,
  description,
  image,
  path,
  publishedTime,
  modifiedTime,
  authors,
}: ArticleJsonLdInput): Record<string, unknown> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const desc =
    description || "Your signal to what's next in the Babcock tech ecosystem.";
  const img = ogImageUrl(image);

  const people = (authors ?? []).filter(Boolean).map((a) => ({
    "@type": "Person",
    name: a.name,
    ...(a.slug?.current
      ? { url: `${BASE_URL}${PAGES.author(a.slug.current)}` }
      : {}),
  }));

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: desc,
    image: [img],
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: {
      "@type": "Organization",
      name: "RADAR",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}${IMAGES.logo.src}`,
        width: IMAGES.logo.w,
        height: IMAGES.logo.h,
      },
    },
  };

  if (publishedTime) jsonLd.datePublished = publishedTime;
  const modified = modifiedTime || publishedTime;
  if (modified) jsonLd.dateModified = modified;
  if (people.length) jsonLd.author = people;

  return jsonLd;
}
