export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticle } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES } from "@/app/lib/constants";
import { SECTION_TITLES, type SectionValue } from "@/app/lib/sections";
import {
  Header,
  Footer,
  PostHeader,
  PostBody,
  Byline,
  ShareButtons,
} from "@/app/components";
import { NewsletterSection } from "@/app/sections";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

function calculateReadingTime(body: unknown[]): number {
  if (!body) return 1;
  let wordCount = 0;
  const countWords = (obj: unknown): void => {
    if (typeof obj === "string") {
      wordCount += obj.split(/\s+/).filter(Boolean).length;
    } else if (Array.isArray(obj)) {
      obj.forEach(countWords);
    } else if (obj && typeof obj === "object") {
      Object.values(obj).forEach(countWords);
    }
  };
  countWords(body);
  return Math.max(1, Math.ceil(wordCount / 200));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const readingTime = calculateReadingTime(article.body);
  const sectionLabel = SECTION_TITLES[article.section as SectionValue];
  const path = PAGES.article(article.slug.current);

  return (
    <>
      <Header />
      <main className="bg-black min-h-screen">
        <PostHeader
          title={article.title}
          description={article.excerpt}
          mainImage={article.coverImage}
          categories={sectionLabel ? [{ title: sectionLabel }] : undefined}
        />

        <div className="container">
          {article.issue && (
            <p className="mt-6 text-sm text-gray-500">
              From{" "}
              <Link
                href={PAGES.issue(article.issue.slug.current)}
                className="text-primary hover:text-primary-hover transition-colors"
              >
                Issue #{article.issue.issueNumber} — {article.issue.title}
              </Link>
            </p>
          )}

          <div className="mt-4 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
            <Byline
              authors={article.authors}
              publishedAt={article.publishedAt}
              readingTime={readingTime}
            />
            <ShareButtons path={path} title={article.title} />
          </div>

          <div className="post-layout">
            <div className="post-content">
              <PostBody body={article.body || []} />
            </div>
          </div>

          <div className="border-t border-white/10 py-8">
            <ShareButtons path={path} title={article.title} />
          </div>
        </div>

        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return { title: "Article Not Found | RADAR" };
  }

  return buildOgMetadata({
    title: article.title,
    description: article.excerpt,
    image: article.coverImage,
    path: PAGES.article(article.slug.current),
    type: "article",
    publishedTime: article.publishedAt,
  });
}
