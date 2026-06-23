import { BASE_URL, PAGES } from "@/app/lib/constants";
import { getFeedItems } from "@/app/lib/sanity";

export const revalidate = 3600;

function escapeXml(unsafe = ""): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function itemPath(item: {
  _type: string;
  slug: string;
  seriesSlug?: string;
}): string | null {
  switch (item._type) {
    case "issue":
      return PAGES.issue(item.slug);
    case "article":
      return PAGES.article(item.slug);
    case "episode":
      return item.seriesSlug ? PAGES.episode(item.seriesSlug, item.slug) : null;
    case "post":
      return PAGES.post(item.slug);
    default:
      return null;
  }
}

export async function GET() {
  const items = await getFeedItems(30);
  const updated = new Date().toUTCString();

  const entries = items
    .map((item) => {
      const path = itemPath(item);
      if (!path) return "";
      const link = `${BASE_URL}${path}`;
      const date = new Date(item.publishedAt || item._createdAt).toUTCString();
      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      ${item.excerpt ? `<description>${escapeXml(item.excerpt)}</description>` : ""}
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>RADAR | GDG Babcock</title>
    <link>${BASE_URL}</link>
    <description>Your signal to what's next in the Babcock tech ecosystem.</description>
    <language>en</language>
    <lastBuildDate>${updated}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${entries}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
