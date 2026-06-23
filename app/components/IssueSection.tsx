import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";
import Byline, { type BylineAuthor } from "./Byline";
import SectionHeading from "./SectionHeading";

export interface IssueArticle {
  _id: string;
  title: string;
  slug: { current: string };
  section: string;
  excerpt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  publishedAt?: string;
  authors?: BylineAuthor[];
}

// Anchor id for an article, used by the issue "In this issue" contents.
export function articleAnchor(id: string): string {
  return `article-${id}`;
}

interface IssueSectionProps {
  title: string;
  articles: IssueArticle[];
  /** "lead" renders the first article large; "list" renders a uniform grid. */
  variant?: "lead" | "list";
  /** Anchor id so the issue "In this issue" contents can jump here. */
  id?: string;
}

function ArticleCard({
  article,
  large = false,
}: {
  article: IssueArticle;
  large?: boolean;
}) {
  const href = PAGES.article(article.slug.current);
  return (
    <Link
      id={articleAnchor(article._id)}
      href={href}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#111] transition-colors hover:border-white/20 scroll-mt-24"
    >
      {article.coverImage?.asset && (
        <div className={`relative ${large ? "aspect-video" : "aspect-4/3"}`}>
          <Image
            src={urlFor(article.coverImage).width(large ? 1200 : 600).url()}
            alt={article.coverImage?.alt || article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className={large ? "p-6 md:p-8" : "p-5"}>
        <h3
          className={`font-semibold leading-tight text-white group-hover:text-primary transition-colors ${
            large ? "text-3xl md:text-4xl tracking-tight" : "text-xl"
          }`}
        >
          {article.title}
        </h3>
        {article.excerpt && (
          <p
            className={`mt-3 text-gray-300 ${large ? "" : "line-clamp-3 text-sm"}`}
            style={
              large
                ? {
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.125rem",
                    lineHeight: 1.7,
                  }
                : { lineHeight: 1.6 }
            }
          >
            {article.excerpt}
          </p>
        )}
        <Byline
          authors={article.authors}
          publishedAt={article.publishedAt}
          showAvatars={false}
          className="mt-4"
        />
      </div>
    </Link>
  );
}

// Renders a titled section of an issue as a grid of article cards.
export default function IssueSection({
  title,
  articles,
  variant = "list",
  id,
}: IssueSectionProps) {
  if (!articles || articles.length === 0) return null;

  if (variant === "lead") {
    const [lead, ...rest] = articles;
    return (
      <section className="py-12 md:py-16">
        <div className="container">
          <SectionHeading id={id}>{title}</SectionHeading>
          <ArticleCard article={lead} large />
          {rest.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((a) => (
                <ArticleCard key={a._id} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <SectionHeading id={id}>{title}</SectionHeading>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a._id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}
