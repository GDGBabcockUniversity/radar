import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";
import { Byline } from "../components";
import type { BylineAuthor } from "../components/Byline";

interface SpotlightArticle {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  issueNumber?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  authors?: BylineAuthor[];
}

interface SpotlightSectionProps {
  article?: SpotlightArticle | null;
}

// Homepage Spotlight — the lead Spotlight article from the latest issue.
// (Spotlight is an issue section, distinct from the Series pillar below.)
export default function SpotlightSection({ article }: SpotlightSectionProps) {
  if (!article) return null;

  const href = PAGES.article(article.slug.current);
  const image = article.coverImage?.asset
    ? urlFor(article.coverImage).width(1200).height(800).url()
    : null;

  return (
    <section className="spotlight-section py-16 md:py-24">
      <div className="container">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[2px] text-primary">
            Spotlight
          </h2>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <Link
          href={href}
          className="group grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center"
        >
          {image && (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Image
                src={image}
                alt={article.coverImage?.alt || article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <div>
            {article.issueNumber && (
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                From Issue #{article.issueNumber}
              </span>
            )}
            <h3 className="mt-2 text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-primary">
              {article.title}
            </h3>
            {article.excerpt && (
              <p
                className="mt-4 text-gray-300"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                }}
              >
                {article.excerpt}
              </p>
            )}
            <Byline
              authors={article.authors}
              publishedAt={article.publishedAt}
              showAvatars={false}
              className="mt-5"
            />
          </div>
        </Link>
      </div>
    </section>
  );
}
