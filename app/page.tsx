import { Header, Footer } from "./components";
import {
  HeroSection,
  LatestIssueSection,
  SpotlightSection,
  SeriesSection,
  PastEditionsSection,
  NewsletterSection,
} from "./sections";
import {
  getRecentPosts,
  getArchive,
  getLatestIssue,
  getHomeSpotlight,
  getFeaturedSeries,
  getLatestEpisodes,
} from "./lib/sanity";
import { PAGES } from "./lib/constants";

export default async function Home() {
  const [
    posts,
    archive,
    latestIssue,
    spotlight,
    featuredSeries,
    latestEpisodes,
  ] = await Promise.all([
    getRecentPosts(),
    getArchive(),
    getLatestIssue(),
    getHomeSpotlight(),
    getFeaturedSeries(),
    getLatestEpisodes(3),
  ]);

  // Hero CTA points at the newest edition: prefer a new issue, else latest post.
  const heroHref = latestIssue
    ? PAGES.issue(latestIssue.slug.current)
    : posts && posts.length > 0
      ? PAGES.post(posts[0].slug.current)
      : undefined;

  return (
    <>
      <Header />
      <main>
        <HeroSection heroHref={heroHref} />
        <LatestIssueSection posts={posts} issue={latestIssue} />
        <SpotlightSection article={spotlight} />
        <SeriesSection series={featuredSeries} episodes={latestEpisodes} />
        <PastEditionsSection entries={archive} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
