import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getSeries, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { youTubeThumbnail } from "@/app/lib/youtube";
import { PAGES } from "@/app/lib/constants";
import { Header, Footer } from "@/app/components";
import { NewsletterSection } from "@/app/sections";

interface SeriesPageProps {
  params: Promise<{ series: string }>;
}

interface Episode {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  youtubeUrl?: string;
  publishedAt?: string;
  episodeNumber?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  author?: { name: string };
}

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function episodeImage(ep: Episode): string | null {
  if (ep.coverImage?.asset) {
    return urlFor(ep.coverImage).width(800).height(450).url();
  }
  return youTubeThumbnail(ep.youtubeUrl);
}

export default async function SeriesShowPage({ params }: SeriesPageProps) {
  const { series: seriesSlug } = await params;
  const series = await getSeries(seriesSlug);

  if (!series) {
    notFound();
  }

  const episodes: Episode[] = series.episodes || [];

  return (
    <>
      <Header />
      <main className="bg-surface min-h-screen text-content pt-20 pb-12">
        <div className="container">
          <Link
            href={PAGES.series}
            className="text-xs font-bold uppercase tracking-wider text-content-subtle hover:text-primary transition-colors"
          >
            ← Back to series
          </Link>

          <div className="mt-6 mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {series.title}
            </h1>
            {series.description && (
              <p className="mt-4 text-lg text-content-muted">{series.description}</p>
            )}
          </div>

          <h2 className="mb-6 text-xs font-bold uppercase tracking-[1.4px] text-content-subtle">
            Entries ({episodes.length})
          </h2>

          {episodes.length === 0 ? (
            <p className="text-content-muted">No episodes in this series yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((ep) => {
                const image = episodeImage(ep);
                const date = formatDate(ep.publishedAt);
                return (
                  <Link
                    key={ep._id}
                    href={PAGES.episode(seriesSlug, ep.slug.current)}
                    className="group flex flex-col gap-4"
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-edge bg-overlay">
                      {image && (
                        <Image
                          src={image}
                          alt={ep.coverImage?.alt || ep.title}
                          fill
                          unoptimized={!ep.coverImage?.asset}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                          <svg
                            className="ml-1 h-6 w-6 text-content"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="line-clamp-2 text-lg font-bold transition-colors group-hover:text-primary">
                        {ep.title}
                      </h3>
                      {ep.excerpt && (
                        <p className="mt-1 line-clamp-2 text-sm text-content-muted">
                          {ep.excerpt}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-content-subtle">
                        {ep.author && <span>{ep.author.name}</span>}
                        {ep.author && date && <span>·</span>}
                        {date && <span>{date}</span>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: SeriesPageProps) {
  const { series: seriesSlug } = await params;
  const series = await getSeries(seriesSlug);

  if (!series) {
    return { title: "Series Not Found | RADAR" };
  }

  return buildOgMetadata({
    title: series.title,
    description: series.description,
    image: series.coverImage,
    path: PAGES.seriesShow(series.slug.current),
    type: "website",
  });
}
