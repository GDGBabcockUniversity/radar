export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthor, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES } from "@/app/lib/constants";
import { SECTION_TITLES, type SectionValue } from "@/app/lib/sections";
import { Header, Footer } from "@/app/components";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

interface AuthoredArticle {
  _id: string;
  title: string;
  slug: { current: string };
  section: string;
  excerpt?: string;
  publishedAt?: string;
  issue?: { title: string; slug: { current: string }; issueNumber: number };
}

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthor(slug);

  if (!author) {
    notFound();
  }

  const articles: AuthoredArticle[] = author.articles || [];

  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="py-16 md:py-24 px-4">
        <div className="container max-w-4xl mx-auto">
          <Link
            href={PAGES.team}
            className="text-xs font-bold uppercase tracking-wider text-content-subtle hover:text-primary transition-colors"
          >
            ← Back to team
          </Link>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-overlay">
              {author.image ? (
                <Image
                  src={urlFor(author.image).width(224).height(224).url()}
                  alt={author.image?.alt || author.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                  <span className="text-3xl font-bold text-primary">
                    {author.name.slice(0, 2)}
                  </span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-content">
                {author.name}
              </h1>
              {author.role && (
                <p className="mt-1 text-sm font-bold uppercase tracking-wider text-primary">
                  {author.role}
                </p>
              )}
              {author.course && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-content-subtle">
                  {author.course}
                </p>
              )}
            </div>
          </div>

          {author.bio && (
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-content-secondary">
              {author.bio}
            </p>
          )}

          {author.socials && author.socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {author.socials.map((social: { label: string; url: string }) => (
                <a
                  key={`${social.label}-${social.url}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-edge bg-overlay px-3 py-1.5 text-xs font-semibold text-content-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  {social.label}
                </a>
              ))}
            </div>
          )}

          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-content">
              Articles by {author.name}
            </h2>

            {articles.length === 0 ? (
              <p className="text-content-subtle">No articles yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {articles.map((article) => {
                  const sectionLabel =
                    SECTION_TITLES[article.section as SectionValue];
                  const date = formatDate(article.publishedAt);
                  return (
                    <Link
                      key={article._id}
                      href={PAGES.article(article.slug.current)}
                      className="group rounded-2xl border border-edge bg-surface-raised p-5 transition-colors hover:border-primary"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-content-subtle">
                        {sectionLabel && (
                          <span className="font-semibold uppercase tracking-wider text-primary">
                            {sectionLabel}
                          </span>
                        )}
                        {article.issue && (
                          <span>· Issue #{article.issue.issueNumber}</span>
                        )}
                        {date && <span>· {date}</span>}
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-content group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-content-muted">
                          {article.excerpt}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthor(slug);

  if (!author) {
    return { title: "Author Not Found | RADAR" };
  }

  return buildOgMetadata({
    title: author.name,
    description:
      author.bio || `${author.name} writes for RADAR by GDG Babcock.`,
    image: author.image,
    path: PAGES.author(author.slug.current),
    type: "website",
  });
}
