export const revalidate = 60;

import Image from "next/image";
import { notFound } from "next/navigation";
import { getIssue, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES } from "@/app/lib/constants";
import { SECTION_TITLES, type SectionValue } from "@/app/lib/sections";
import { Header, Footer, ShareButtons } from "@/app/components";
import IssueSection, { type IssueArticle } from "@/app/components/IssueSection";
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

  return (
    <>
      <Header />
      <main className="bg-black min-h-screen">
        {/* 1. Issue header */}
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
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Issue #{issue.issueNumber}
                    {date ? ` · ${date}` : ""}
                  </span>
                  <h1 className="mt-2 max-w-3xl text-3xl md:text-5xl font-bold leading-tight text-white">
                    {issue.title}
                  </h1>
                  {issue.excerpt && (
                    <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-300">
                      {issue.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="container pt-12 pb-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Issue #{issue.issueNumber}
                {date ? ` · ${date}` : ""}
              </span>
              <h1 className="mt-2 max-w-3xl text-3xl md:text-5xl font-bold leading-tight text-white">
                {issue.title}
              </h1>
              {issue.excerpt && (
                <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-300">
                  {issue.excerpt}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="container pt-6">
          <ShareButtons path={path} title={issue.title} />
        </div>

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

        <div className="container border-t border-white/10 py-8">
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
