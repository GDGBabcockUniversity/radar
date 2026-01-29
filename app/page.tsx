import { Header, Footer } from "./components";
import {
  HeroSection,
  FeaturedSection,
  PastEditionsSection,
  NewsletterSection,
} from "./sections";
import { getFeaturedPost, getRecentPosts } from "./lib/sanity";

export default async function Home() {
  const featuredPost = await getFeaturedPost();
  const recentPosts = await getRecentPosts(4);

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedSection post={featuredPost} />
        <PastEditionsSection posts={recentPosts} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
