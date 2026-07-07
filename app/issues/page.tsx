export const revalidate = 60;

import { Header, Footer, ArticleCard } from "@/app/components";
import { getArchive, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES } from "@/app/lib/constants";

interface ArchiveEntry {
  _id: string;
  kind: "issue" | "post";
  title: string;
  slug: { current: string };
  publishedAt?: string;
  issueNumber?: number;
  excerpt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function IssuesArchivePage() {
  const entries: ArchiveEntry[] = await getArchive();

  return (
    <>
      <Header />
      <main className="bg-surface min-h-screen text-content pt-20 pb-24">
        <div className="container">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Issues
            </h1>
            <p className="text-content-muted text-lg max-w-2xl">
              Every edition of RADAR — the monthly read on the Babcock tech
              ecosystem.
            </p>
          </div>

          {entries.length === 0 ? (
            <p className="text-content-muted">No issues published yet.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => {
                const imageUrl = entry.image
                  ? urlFor(entry.image).width(600).height(450).url()
                  : "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=450&fit=crop";

                const href =
                  entry.kind === "issue"
                    ? PAGES.issue(entry.slug.current)
                    : PAGES.post(entry.slug.current);

                const editionNumber =
                  entry.kind === "issue" && entry.issueNumber
                    ? `Issue #${entry.issueNumber}`
                    : undefined;

                return (
                  <ArticleCard
                    key={entry._id}
                    variant="default"
                    image={imageUrl}
                    editionNumber={editionNumber}
                    date={entry.publishedAt ? formatDate(entry.publishedAt) : ""}
                    title={entry.title}
                    description={entry.excerpt}
                    href={href}
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
    title: "Issues",
    description:
      "Every edition of RADAR — the monthly read on the Babcock tech ecosystem.",
    path: PAGES.issues,
    type: "website",
  });
}
