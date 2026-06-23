import { Header, Footer } from "./components";
import {
  HeroSection,
  LatestIssueSection,
  SpotlightSection,
  PastEditionsSection,
  NewsletterSection,
} from "./sections";
import {
  getRecentPosts,
  getArchive,
  getLatestIssue,
  getFeaturedSeries,
  getLatestEpisodes,
} from "./lib/sanity";
import { PAGES } from "./lib/constants";

export default async function Home() {
  const [posts, archive, latestIssue, featuredSeries, latestEpisodes] =
    await Promise.all([
      getRecentPosts(),
      getArchive(),
      getLatestIssue(),
      getFeaturedSeries(),
      getLatestEpisodes(1),
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
        <LatestIssueSection posts={posts} />
        <SpotlightSection
          series={featuredSeries}
          latestEpisode={latestEpisodes?.[0] ?? null}
        />
        <PastEditionsSection entries={archive} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
