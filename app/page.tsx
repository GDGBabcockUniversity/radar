import { Header, Footer } from "./components";
import {
  HeroSection,
  FeaturedSection,
  PastEditionsSection,
  NewsletterSection,
} from "./sections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <FeaturedSection />
        <PastEditionsSection />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
