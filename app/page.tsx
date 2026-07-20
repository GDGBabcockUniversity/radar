import { Header, Footer } from "./components";
import {
  HeroSection,
  LatestIssueSection,
  SpotlightSection,
  FoundingNoteSection,
  SeriesSection,
  PastEditionsSection,
  NewsletterSection,
} from "./sections";
import {
  getRecentPosts,
  getArchive,
  getLatestIssue,
  getHomeSpotlight,
  getFeaturedNote,
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
    foundingNote,
    featuredSeries,
    latestEpisodes,
  ] = await Promise.all([
    getRecentPosts(),
    getArchive(),
    getLatestIssue(),
    getHomeSpotlight(),
    getFeaturedNote(),
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
        <HeroSection heroHref={heroHref} series={featuredSeries} />
        <LatestIssueSection posts={posts} issue={latestIssue} />
        <SpotlightSection article={spotlight} />
        <FoundingNoteSection note={foundingNote} />
        <SeriesSection series={featuredSeries} episodes={latestEpisodes} />
        <PastEditionsSection entries={archive} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
