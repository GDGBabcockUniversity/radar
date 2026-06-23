import Image from "next/image";
import Link from "next/link";
import { Button } from "../components";
import { urlFor } from "../lib/sanity";
import { youTubeThumbnail } from "../lib/youtube";
import { PAGES } from "../lib/constants";

const TAGS = ["Weekly", "Video + Write-Up", "On-site + YouTube"];

interface FeaturedSeries {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
}

interface SpotlightEpisode {
  _id: string;
  title: string;
  slug: { current: string };
  youtubeUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  series?: { slug: { current: string } };
}

interface SpotlightSectionProps {
  series?: FeaturedSeries | null;
  latestEpisode?: SpotlightEpisode | null;
}

// Homepage "Series" pillar — between-issue, on its own cadence. Data-driven:
// renders the active series and links on-site (not straight to YouTube).
export default function SpotlightSection({
  series,
  latestEpisode,
}: SpotlightSectionProps) {
  if (!series) return null;

  const showHref = PAGES.seriesShow(series.slug.current);

  // Thumbnail prefers the latest episode's image; the episode link keeps the
  // reader on-site (the video is embedded on the episode page).
  const thumbSrc = latestEpisode?.coverImage?.asset
    ? urlFor(latestEpisode.coverImage).width(800).height(450).url()
    : youTubeThumbnail(latestEpisode?.youtubeUrl) ||
      (series.coverImage?.asset
        ? urlFor(series.coverImage).width(800).height(450).url()
        : null);

  const episodeSeriesSlug =
    latestEpisode?.series?.slug?.current ?? series.slug.current;
  const thumbHref = latestEpisode
    ? PAGES.episode(episodeSeriesSlug, latestEpisode.slug.current)
    : showHref;

  return (
    <section className="spotlight-section py-16 md:py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Text content */}
          <div>
            <span className="mb-3 inline-block text-xs font-bold uppercase tracking-[1.4px] text-primary">
              Series
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
              {series.title}
            </h2>

            {series.description && (
              <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-8 max-w-lg">
                {series.description}
              </p>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {TAGS.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-semibold uppercase tracking-wider text-gray-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e84a35]" />
                  {tag}
                </span>
              ))}
            </div>

            {/* CTA */}
            <Button variant="primary" size="md" href={showHref}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="opacity-90"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch the Series
            </Button>
          </div>

          {/* Right — Latest episode thumbnail */}
          <Link
            href={thumbHref}
            className="relative aspect-video rounded-xl overflow-hidden group cursor-pointer block bg-white/5 border border-white/10"
          >
            {thumbSrc && (
              <Image
                src={thumbSrc}
                width={800}
                height={450}
                alt={latestEpisode?.title || series.title}
                unoptimized={!latestEpisode?.coverImage?.asset && !series.coverImage?.asset}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-11 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
