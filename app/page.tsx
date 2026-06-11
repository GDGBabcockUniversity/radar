export const dynamic = "force-dynamic";

import { Header, Footer } from "./components";
import {
  HeroSection,
  LatestIssueSection,
  SpotlightSection,
  PastEditionsSection,
  NewsletterSection,
} from "./sections";
import { getRecentPosts } from "./lib/sanity";

export default async function Home() {
  const posts = await getRecentPosts();
  const latestIssueSlug = posts && posts.length > 0 ? posts[0].slug.current : undefined;

  return (
    <>
      <Header />
      <main>
        <HeroSection latestIssueSlug={latestIssueSlug} />
        <LatestIssueSection posts={posts} />
        <SpotlightSection />
        <PastEditionsSection posts={posts} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
