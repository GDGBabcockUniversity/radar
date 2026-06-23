import type { Metadata } from "next";
import { urlFor } from "./sanity";
import { BASE_URL } from "./constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SanityImage = any;

interface OgMetaInput {
  title: string;
  description?: string;
  image?: SanityImage;
  /** Absolute or root-relative canonical path, e.g. "/articles/foo". */
  path: string;
  /** OG type — "article" for articles/issues, "website" otherwise. */
  type?: "article" | "website";
  publishedTime?: string;
}

// Renders a 1200×630 OG image URL from a Sanity image, or a sensible fallback.
function ogImageUrl(image?: SanityImage): string {
  if (image?.asset) {
    return urlFor(image).width(1200).height(630).fit("crop").url();
  }
  return `${BASE_URL}/radar-logo.png`;
}

// Single source of truth for per-page Open Graph + Twitter Card metadata.
// Used by generateMetadata on article and issue pages so links unfurl on
// WhatsApp/X/LinkedIn with a real title, description, and image.
export function buildOgMetadata({
  title,
  description,
  image,
  path,
  type = "article",
  publishedTime,
}: OgMetaInput): Metadata {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const fullTitle = `${title} | RADAR`;
  const desc =
    description || "Your signal to what's next in the Babcock tech ecosystem.";
  const img = ogImageUrl(image);

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
