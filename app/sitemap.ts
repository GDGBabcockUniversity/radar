import type { MetadataRoute } from "next";
import { BASE_URL, PAGES } from "./lib/constants";
import { getSitemapEntries } from "./lib/sanity";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}${PAGES.issues}`, lastModified: now, changeFrequency: "weekly" },
    { url: `${BASE_URL}${PAGES.series}`, lastModified: now, changeFrequency: "weekly" },
    { url: `${BASE_URL}${PAGES.team}`, lastModified: now, changeFrequency: "monthly" },
    { url: `${BASE_URL}${PAGES.about}`, lastModified: now, changeFrequency: "monthly" },
  ];

  const url = (path: string, updated: string): MetadataRoute.Sitemap[number] => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(updated),
  });

  return [
    ...staticRoutes,
    ...entries.issues.map((e) => url(PAGES.issue(e.slug), e.updated)),
    ...entries.articles.map((e) => url(PAGES.article(e.slug), e.updated)),
    ...entries.series.map((e) => url(PAGES.seriesShow(e.slug), e.updated)),
    ...entries.episodes.map((e) =>
      url(PAGES.episode(e.seriesSlug!, e.slug), e.updated),
    ),
    ...entries.authors.map((e) => url(PAGES.author(e.slug), e.updated)),
    ...entries.posts.map((e) => url(PAGES.post(e.slug), e.updated)),
  ];
}
