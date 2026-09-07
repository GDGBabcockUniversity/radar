export const revalidate = 60;

import Link from "next/link";
import { notFound } from "next/navigation";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { getArticle } from "@/app/lib/sanity";
import { buildOgMetadata, buildArticleJsonLd } from "@/app/lib/metadata";
import { calculateReadingTime } from "@/app/lib/readingTime";
import { PAGES } from "@/app/lib/constants";
import {
  SECTION_TITLES,
  sectionRank,
  type SectionValue,
} from "@/app/lib/sections";
import {
  Header,
  Footer,
  PostHeader,
  PostBody,
  Byline,
  ShareButtons,
  ReadingTracker,
} from "@/app/components";
import { NewsletterSection } from "@/app/sections";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }
  
  // Neighbours within the issue, in the issue's running order. Either can be
  // absent (first/last piece, or a standalone article with no issue).
  const siblings: {
    _id: string;
    title: string;
    section?: string;
    slug: { current: string };
  }[] = [...(article.siblings ?? [])].sort(
    (a, b) => sectionRank(a.section) - sectionRank(b.section),
  );
  const index = siblings.findIndex((s) => s._id === article._id);
  const prev = index > 0 ? siblings[index - 1] : null;
  const next = index >= 0 ? (siblings[index + 1] ?? null) : null;

  const readingTime = calculateReadingTime(article.body);
  const sectionLabel = SECTION_TITLES[article.section as SectionValue];
  const path = PAGES.article(article.slug.current);
  const jsonLd = buildArticleJsonLd({
    title: article.title,
    description: article.excerpt,
    image: article.coverImage,
    path,
    publishedTime: article.publishedAt,
    authors: article.authors,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <ReadingTracker slug={path} />
      <main className="bg-surface min-h-screen">
        <PostHeader
          title={article.title}
          description={article.excerpt}
          mainImage={article.coverImage}
          categories={sectionLabel ? [{ title: sectionLabel }] : undefined}
        />

        <div className="container">
          {article.issue && (
            <p className="mt-6 text-sm text-content-subtle">
              From{" "}
              <Link
                href={PAGES.issue(article.issue.slug.current)}
                className="text-primary hover:text-primary-hover transition-colors"
              >
                Issue #{article.issue.issueNumber} — {article.issue.title}
              </Link>
            </p>
          )}

          <div className="mt-4 flex flex-col gap-4 border-b border-edge pb-6 md:flex-row md:items-center md:justify-between">
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

          {(prev || next) && (
            <nav className="flex flex-col gap-4 border-t border-edge py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              {prev && (
                <Link
                  href={PAGES.article(prev.slug.current)}
                  className="group flex min-w-0 items-center gap-3"
                >
                  <IoArrowBack className="shrink-0 text-lg text-content-muted transition-colors group-hover:text-primary" />
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-content-subtle">
                      Previous
                    </span>
                    <span className="block truncate font-medium text-content transition-colors group-hover:text-primary">
                      {prev.title}
                    </span>
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={PAGES.article(next.slug.current)}
                  className="group flex min-w-0 items-center gap-3 sm:ml-auto sm:text-right"
                >
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-wider text-content-subtle">
                      Next
                    </span>
                    <span className="block truncate font-medium text-content transition-colors group-hover:text-primary">
                      {next.title}
                    </span>
                  </span>
                  <IoArrowForward className="shrink-0 text-lg text-content-muted transition-colors group-hover:text-primary" />
                </Link>
              )}
            </nav>
          )}

          <div className="border-t border-edge py-8">
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
