export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { getSeriesGroups, urlFor } from "@/app/lib/sanity";
import { Header, Footer } from "@/app/components";

interface SeriesItem {
  _id: string;
  title: string;
  slug: { current: string };
  youtubeUrl?: string;
  mainImage?: object;
  author?: { name: string };
}

interface SeriesGroup {
  _id: string;
  title: string;
  description?: string;
  series?: SeriesItem[];
}

// Helper to extract YouTube video ID
function getYouTubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/,
  );
  return match ? match[1] : null;
}

export default async function SeriesPage() {
  const groups = await getSeriesGroups();

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
              Explore our special series, spotlighting members, stories, and
              deep dives.
            </p>
          </div>

          {groups.length === 0 ? (
            <p className="text-gray-400">No series available yet.</p>
          ) : (
            <div className="space-y-24">
              {groups.map((group: SeriesGroup) => (
                <section key={group._id} className="space-y-8">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">
                      {group.title}
                    </h2>
                    {group.description && (
                      <p className="text-gray-400 max-w-3xl">
                        {group.description}
                      </p>
                    )}
                  </div>

                  {group.series && group.series.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.series.map((item: SeriesItem) => {
                        const ytId = item.youtubeUrl
                          ? getYouTubeId(item.youtubeUrl)
                          : null;
                        const thumbnailUrl = item.mainImage
                          ? urlFor(item.mainImage).url()
                          : ytId
                            ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
                            : "/placeholder.jpg"; // Provide a fallback in your public folder if needed

                        return (
                          <Link
                            key={item._id}
                            href={`/series/${item.slug.current}`}
                            className="group flex flex-col gap-4"
                          >
                            <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5 border border-white/10">
                              {thumbnailUrl && (
                                <Image
                                  src={thumbnailUrl}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                                  unoptimized={!!ytId} // unoptimized for external youtube images
                                />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-white ml-1"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                {item.title}
                              </h3>
                              {item.author && (
                                <p className="text-sm text-gray-400 mt-1">
                                  {item.author.name}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No episodes in this series yet.
                    </p>
                  )}
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
