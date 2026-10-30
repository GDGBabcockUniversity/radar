export const revalidate = 60;

import { Header, Footer, ArticleCard } from "@/app/components";
import { getStandaloneArticles, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES } from "@/app/lib/constants";
import { SECTION_TITLES, type SectionValue } from "@/app/lib/sections";

interface StandaloneArticleEntry {
  _id: string;
  title: string;
  slug: { current: string };
  section?: string;
  excerpt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  publishedAt?: string;
  order?: number;
  authors?: { name: string; slug?: { current: string } }[];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function ArticlesPage() {
  const articles: StandaloneArticleEntry[] = await getStandaloneArticles();

  return (
    <>
      <Header />
      <main className="bg-surface min-h-screen text-content pt-20 pb-24">
        <div className="container">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Articles
            </h1>
            <p className="text-content-muted text-lg max-w-2xl">
              Standalone pieces, founding statements, and special features from
              RADAR outside the regular issue cadence.
            </p>
          </div>

          {articles.length === 0 ? (
            <p className="text-content-muted">No articles published yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => {
                const imageUrl = article.coverImage?.asset
                  ? urlFor(article.coverImage).width(600).height(450).url()
                  : "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop";

                const tag = article.section
                  ? SECTION_TITLES[article.section as SectionValue] || article.section
                  : "Article";

                return (
                  <ArticleCard
                    key={article._id}
                    variant="default"
                    image={imageUrl}
                    tag={tag}
                    date={article.publishedAt ? formatDate(article.publishedAt) : ""}
                    title={article.title}
                    description={article.excerpt}
                    href={PAGES.article(article.slug.current)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export function generateMetadata() {
  return buildOgMetadata({
    title: "Articles",
    description:
      "Standalone pieces, founding statements, and special features from RADAR outside the regular issue cadence.",
    path: PAGES.articles,
    type: "website",
  });
}
