import Link from "next/link";
import { notFound } from "next/navigation";
import { getEpisode } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { calculateReadingTime } from "@/app/lib/readingTime";
import { getYouTubeId, youTubeThumbnail } from "@/app/lib/youtube";
import { PAGES } from "@/app/lib/constants";
import {
  Header,
  Footer,
  PostBody,
  Byline,
  ShareButtons,
  ReadingTracker,
} from "@/app/components";
import { NewsletterSection } from "@/app/sections";

interface EpisodePageProps {
  params: Promise<{ series: string; episode: string }>;
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { series: seriesSlug, episode: episodeSlug } = await params;
  const episode = await getEpisode(episodeSlug);

  if (!episode) {
    notFound();
  }

  const ytId = getYouTubeId(episode.youtubeUrl);
  const readingTime = episode.body
    ? calculateReadingTime(episode.body)
    : undefined;
  const seriesSlugCurrent = episode.series?.slug?.current ?? seriesSlug;
  const path = PAGES.episode(seriesSlugCurrent, episode.slug.current);

  return (
    <>
      <ReadingTracker slug={path} />
      <Header />
      <main className="bg-surface min-h-screen pt-16">
        <div className="container max-w-4xl mx-auto py-12">
          {episode.series && (
            <Link
              href={PAGES.seriesShow(seriesSlugCurrent)}
              className="mb-6 inline-flex items-center text-sm font-medium text-primary transition-colors hover:text-content"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {episode.series.title}
            </Link>
          )}

          <h1 className="mb-6 text-3xl font-bold tracking-tight text-content md:text-5xl">
            {episode.title}
          </h1>

          <div className="mb-8 flex flex-col gap-4 border-b border-edge pb-6 md:flex-row md:items-center md:justify-between">
            <Byline
              authors={episode.author ? [episode.author] : []}
              publishedAt={episode.publishedAt}
              readingTime={readingTime}
            />
            <ShareButtons path={path} title={episode.title} />
          </div>

          {ytId && (
            <div className="relative mb-12 aspect-video w-full overflow-hidden rounded-2xl border border-edge bg-overlay shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=0&rel=0`}
                title={episode.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          )}

          <div className="post-layout">
            <div className="post-content">
              {episode.body ? (
                <PostBody body={episode.body} />
              ) : (
                <p className="italic text-content-muted">
                  No write-up provided for this episode.
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-edge py-8">
            <ShareButtons path={path} title={episode.title} />
          </div>
        </div>

        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata({ params }: EpisodePageProps) {
  const { episode: episodeSlug } = await params;
  const episode = await getEpisode(episodeSlug);

  if (!episode) {
    return { title: "Episode Not Found | RADAR" };
  }

  const seriesSlugCurrent = episode.series?.slug?.current ?? "";
  // OG image: explicit cover, else the YouTube thumbnail.
  const ytThumb = youTubeThumbnail(episode.youtubeUrl);
  const fallbackDescription = episode.series
    ? `An episode in ${episode.series.title} — RADAR by GDG Babcock.`
    : undefined;

  return buildOgMetadata({
    title: episode.title,
    description: episode.excerpt || fallbackDescription,
    image: episode.coverImage,
    imageUrl: episode.coverImage?.asset ? undefined : ytThumb || undefined,
    path: PAGES.episode(seriesSlugCurrent, episode.slug.current),
    type: "article",
    publishedTime: episode.publishedAt,
  });
}
