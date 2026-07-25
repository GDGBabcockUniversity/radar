export const revalidate = 60;

import Image from "next/image";
import { notFound } from "next/navigation";
import { getIssue, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES } from "@/app/lib/constants";
import { SECTION_TITLES, type SectionValue } from "@/app/lib/sections";
import Link from "next/link";
import {
  Header,
  Footer,
  ShareButtons,
  ReadingTracker,
} from "@/app/components";
import IssueSection, {
  type IssueArticle,
  articleAnchor,
} from "@/app/components/IssueSection";
import SignalsBlock from "@/app/components/SignalsBlock";
import OpportunitiesBlock from "@/app/components/OpportunitiesBlock";
import { NewsletterSection } from "@/app/sections";

interface IssuePageProps {
  params: Promise<{ slug: string }>;
}

function bySection(articles: IssueArticle[], section: SectionValue) {
  return articles.filter((a) => a.section === section);
}

export default async function IssuePage({ params }: IssuePageProps) {
  const { slug } = await params;
  const issue = await getIssue(slug);

  if (!issue) {
    notFound();
  }

  const articles: IssueArticle[] = issue.articles || [];
  const path = PAGES.issue(issue.slug.current);
  const date = issue.publishedAt
    ? new Date(issue.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Sections rendered in the §4 newspaper order, between the embedded blocks.
  const opening = bySection(articles, "openingNote");
  const spotlight = bySection(articles, "spotlight");
  const ecosystem = bySection(articles, "ecosystemBrief");
  const alumni = bySection(articles, "alumniSpotlight");
  // Anything else (editorial, interview, feature) grouped under "More".
  const placed = new Set<SectionValue>([
    "openingNote",
    "spotlight",
    "ecosystemBrief",
    "alumniSpotlight",
  ]);
  const more = articles.filter(
    (a) => !placed.has(a.section as SectionValue),
  );

  // "In this issue" contents, in render order. Embedded blocks (signals,
  // opportunities) link to their section anchors; article rows link to the
  // per-article anchor set by IssueSection.
  const contents: {
    label: string;
    anchor?: string;
    items: IssueArticle[];
  }[] = [
    { label: SECTION_TITLES.openingNote, items: opening },
    ...(issue.signals?.length
      ? [{ label: "Signals This Month", anchor: "#signals", items: [] }]
      : []),
    { label: SECTION_TITLES.spotlight, items: spotlight },
    ...(issue.opportunities?.length
      ? [{ label: "Opportunity Drop", anchor: "#opportunities", items: [] }]
      : []),
    { label: SECTION_TITLES.ecosystemBrief, items: ecosystem },
    { label: SECTION_TITLES.alumniSpotlight, items: alumni },
    { label: "More from this issue", items: more },
  ].filter((c) => c.anchor || c.items.length > 0);

  return (
    <>
      <ReadingTracker slug={path} />
      <Header />
      <main className="bg-surface min-h-screen">
        {/* 1. Issue masthead */}
        <header className="relative">
          {issue.coverImage?.asset ? (
            <div className="relative aspect-video md:aspect-21/9 w-full overflow-hidden">
              <Image
                src={urlFor(issue.coverImage).width(1920).height(820).url()}
                alt={issue.coverImage?.alt || issue.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end">
                <div className="container pb-8 md:pb-12">
                  <span className="text-xs font-semibold uppercase tracking-[2px] text-primary">
                    RADAR · Issue #{issue.issueNumber}
                    {date ? ` · ${date}` : ""}
                  </span>
                  <h1 className="mt-3 max-w-3xl text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-white">
                    {issue.title}
                  </h1>
                  {issue.excerpt && (
                    <p
                      className="mt-4 max-w-2xl text-white/80"
                      style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1.25rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {issue.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="container pt-12 pb-8 border-b border-edge">
              <span className="text-xs font-semibold uppercase tracking-[2px] text-primary">
                RADAR · Issue #{issue.issueNumber}
                {date ? ` · ${date}` : ""}
              </span>
              <h1 className="mt-3 max-w-3xl text-4xl md:text-6xl font-bold leading-[1.05] tracking-tight text-content">
                {issue.title}
              </h1>
              {issue.excerpt && (
                <p
                  className="mt-4 max-w-2xl text-content-secondary"
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.25rem",
                    lineHeight: 1.6,
                  }}
                >
                  {issue.excerpt}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="container flex flex-wrap items-center justify-between gap-4 pt-6">
          <ShareButtons path={path} title={issue.title} />
        </div>

        {/* In this issue — contents */}
        {contents.length > 0 && (
          <nav className="container mt-10" aria-label="In this issue">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[2px] text-content-subtle">
              In this issue
            </h2>
            <ol className="grid grid-cols-1 gap-x-10 gap-y-4 border-t border-edge pt-6 sm:grid-cols-2">
              {contents.map((entry) => {
                const sectionHref =
                  entry.anchor ??
                  (entry.items[0]
                    ? `#${articleAnchor(entry.items[0]._id)}`
                    : undefined);
                return (
                  <li key={entry.label}>
                    {sectionHref ? (
                      <Link
                        href={sectionHref}
                        className="text-sm font-bold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors"
                      >
                        {entry.label}
                      </Link>
                    ) : (
                      <span className="text-sm font-bold uppercase tracking-wider text-primary">
                        {entry.label}
                      </span>
                    )}
                    {entry.items.length > 0 && (
                      <ul className="mt-2 space-y-1.5">
                        {entry.items.map((a) => (
                          <li key={a._id}>
                            <Link
                              href={`#${articleAnchor(a._id)}`}
                              className="text-content-secondary hover:text-content transition-colors"
                            >
                              {a.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}

        {/* 2. Opening Note */}
        <IssueSection
          title={SECTION_TITLES.openingNote}
          articles={opening}
        />

        {/* 3. Signals This Month (embedded) */}
        <SignalsBlock signals={issue.signals} />

        {/* 4. Main Spotlight */}
        <IssueSection
          title={SECTION_TITLES.spotlight}
          articles={spotlight}
          variant="lead"
        />

        {/* 5. Opportunity Drop (embedded) */}
        <OpportunitiesBlock opportunities={issue.opportunities} />

        {/* 6. Ecosystem Brief */}
        <IssueSection
          title={SECTION_TITLES.ecosystemBrief}
          articles={ecosystem}
        />

        {/* 7. Alumni Spotlight (optional) */}
        <IssueSection
          title={SECTION_TITLES.alumniSpotlight}
          articles={alumni}
        />

        {/* 8. Anything else from this issue */}
        <IssueSection title="More from this issue" articles={more} />

        <div className="container border-t border-edge py-8">
          <ShareButtons path={path} title={issue.title} />
        </div>

        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: IssuePageProps) {
  const { slug } = await params;
  const issue = await getIssue(slug);

  if (!issue) {
    return { title: "Issue Not Found | RADAR" };
  }

  return buildOgMetadata({
    title: `Issue #${issue.issueNumber} — ${issue.title}`,
    description: issue.excerpt,
    image: issue.coverImage,
    path: PAGES.issue(issue.slug.current),
    type: "article",
    publishedTime: issue.publishedAt,
  });
}
