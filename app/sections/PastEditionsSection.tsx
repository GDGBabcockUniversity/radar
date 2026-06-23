import { ArticleCard } from "../components";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";

// Unified archive entry: a new `issue` or a legacy `post`, normalised by
// getArchive() so both eras render together (brief §5 — two eras, one archive).
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

interface PastEditionsSectionProps {
  entries: ArchiveEntry[];
}

export default function PastEditionsSection({
  entries,
}: PastEditionsSectionProps) {
  if (!entries || entries.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <section id="issues" className="past-editions-section py-20 md:py-28">
      <div className="container">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Past Editions
          </h2>
          <p className="text-gray-400">
            The history of GDG Babcock, documented.
          </p>
        </div>

        {/* Editions Grid */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-7xl">
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
      </div>
    </section>
  );
}
