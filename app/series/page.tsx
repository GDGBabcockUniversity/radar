import Link from "next/link";
import Image from "next/image";
import { getSeriesList, urlFor } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { youTubeThumbnail } from "@/app/lib/youtube";
import { PAGES } from "@/app/lib/constants";
import { Header, Footer } from "@/app/components";

interface SeriesEpisode {
  _id: string;
  youtubeUrl?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
}

interface Series {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  status?: "active" | "archived";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  episodes?: SeriesEpisode[];
}

function seriesImage(series: Series): string | null {
  if (series.coverImage?.asset) {
    return urlFor(series.coverImage).width(1200).height(675).url();
  }
  // Fall back to the first episode's image / YouTube thumbnail.
  const ep = series.episodes?.[0];
  if (ep?.coverImage?.asset) {
    return urlFor(ep.coverImage).width(1200).height(675).url();
  }
  return youTubeThumbnail(ep?.youtubeUrl);
}

export default async function SeriesIndexPage() {
  const series: Series[] = await getSeriesList();

  return (
    <>
      <Header />
      <main className="bg-black min-h-screen text-white pt-20 pb-24">
        <div className="container">
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Series
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Deeper dives, recurring spotlights, and stories that live outside
              the monthly issue cycle.
            </p>
          </div>

          {series.length === 0 ? (
            <p className="text-gray-400">No series available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {series.map((s) => {
                const image = seriesImage(s);
                const count = s.episodes?.length ?? 0;
                return (
                  <Link
                    key={s._id}
                    href={PAGES.seriesShow(s.slug.current)}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#16181D] transition-colors hover:border-primary"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                      {image && (
                        <Image
                          src={image}
                          alt={s.coverImage?.alt || s.title}
                          fill
                          unoptimized={!s.coverImage?.asset}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                      {s.status === "active" && (
                        <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {s.title}
                      </h2>
                      {s.description && (
                        <p className="mt-2 line-clamp-2 text-gray-400">
                          {s.description}
                        </p>
                      )}
                      <span className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        {count} {count === 1 ? "episode" : "episodes"}
                      </span>
                    </div>
                  </Link>
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
    title: "Series",
    description:
      "Deeper dives, recurring spotlights, and stories that live outside the monthly issue cycle.",
    path: PAGES.series,
    type: "website",
  });
}
