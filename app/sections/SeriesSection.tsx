import Image from "next/image";
import Link from "next/link";
import { Button } from "../components";
import { urlFor } from "../lib/sanity";
import { youTubeThumbnail } from "../lib/youtube";
import { PAGES } from "../lib/constants";

interface FeaturedSeries {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  status?: "active" | "archived";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
}

interface Episode {
  _id: string;
  title: string;
  slug: { current: string };
  youtubeUrl?: string;
  publishedAt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  series?: { slug: { current: string } };
}

interface SeriesSectionProps {
  series?: FeaturedSeries | null;
  episodes?: Episode[];
}

function episodeImage(ep: Episode): string | null {
  if (ep.coverImage?.asset) {
    return urlFor(ep.coverImage).width(600).height(338).url();
  }
  return youTubeThumbnail(ep.youtubeUrl);
}

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Homepage Series pillar — a preview of the active series and its latest
// episodes. Standalone, between-issue content; links on-site.
export default function SeriesSection({ series, episodes }: SeriesSectionProps) {
  if (!series) return null;

  const showHref = PAGES.seriesShow(series.slug.current);
  const recent = (episodes ?? []).slice(0, 3);

  return (
    <section className="series-section py-16 md:py-24">
      <div className="container">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[2px] text-primary">
            Series
          </h2>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#16181D] p-6 md:p-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              {series.status === "active" && (
                <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Currently running
                </span>
              )}
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {series.title}
              </h3>
              {series.description && (
                <p className="mt-3 text-sm md:text-base leading-relaxed text-gray-300">
                  {series.description}
                </p>
              )}
            </div>
            <Button variant="primary" size="md" href={showHref}>
              View the series
            </Button>
          </div>

          {recent.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((ep) => {
                const image = episodeImage(ep);
                const date = formatDate(ep.publishedAt);
                const epSeriesSlug =
                  ep.series?.slug?.current ?? series.slug.current;
                return (
                  <Link
                    key={ep._id}
                    href={PAGES.episode(epSeriesSlug, ep.slug.current)}
                    className="group flex flex-col gap-3"
                  >
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {image && (
                        <Image
                          src={image}
                          alt={ep.coverImage?.alt || ep.title}
                          fill
                          unoptimized={!ep.coverImage?.asset}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[#FF0000] shadow-lg">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="line-clamp-2 font-semibold leading-snug text-white transition-colors group-hover:text-primary">
                        {ep.title}
                      </h4>
                      {date && (
                        <span className="mt-1 block text-xs text-gray-500">
                          {date}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
