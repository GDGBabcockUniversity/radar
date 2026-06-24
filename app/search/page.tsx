export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../components";
import { searchAll, urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";

interface AuthorResult {
  _id: string;
  name: string;
  slug?: { current: string };
  role?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
}

interface ContentResult {
  kind: "article" | "post";
  _id: string;
  title: string;
  excerpt?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  publishedAt?: string;
  href: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const { results, authors } = (await searchAll(query)) as {
    results: ContentResult[];
    authors: AuthorResult[];
  };
  const total = results.length + authors.length;

  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Search form (GET → /search?q=) */}
          <form action={PAGES.search} method="get" className="mb-10">
            <label className="block text-xs font-bold uppercase tracking-[2px] text-content-muted mb-3">
              Search RADAR
            </label>
            <div className="flex items-center gap-3 border-b border-edge-strong pb-3">
              <input
                type="search"
                name="q"
                defaultValue={query}
                autoFocus
                placeholder="Articles, contributors…"
                className="flex-1 bg-transparent text-2xl md:text-3xl font-bold text-content placeholder:text-content-subtle focus:outline-none"
              />
              <button
                type="submit"
                className="text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {query === "" ? (
            <p className="text-content-muted">
              Type a name or a few words to search articles and contributors.
            </p>
          ) : total === 0 ? (
            <p className="text-content-muted">
              No results for <span className="text-content">“{query}”</span>.
            </p>
          ) : (
            <div className="space-y-12">
              {/* Authors / contributors */}
              {authors.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[2px] text-content-muted mb-5">
                    Contributors
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {authors.map((a) => (
                      <Link
                        key={a._id}
                        href={
                          a.slug?.current
                            ? PAGES.author(a.slug.current)
                            : PAGES.contributors
                        }
                        className="flex items-center gap-4 rounded-xl border border-edge bg-surface-raised p-4 hover:border-edge-strong transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-overlay relative">
                          {a.image ? (
                            <Image
                              src={urlFor(a.image).width(96).height(96).url()}
                              alt={a.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-primary">
                              {initials(a.name)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-content truncate">
                            {a.name}
                          </p>
                          {a.role && (
                            <p className="text-xs uppercase tracking-wider text-content-muted truncate">
                              {a.role}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              {results.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-[2px] text-content-muted mb-5">
                    Articles
                  </h2>
                  <div className="flex flex-col gap-4">
                    {results.map((r) => (
                      <Link
                        key={r._id}
                        href={r.href}
                        className="group flex items-start gap-4 rounded-xl border border-edge bg-surface-raised p-4 hover:border-edge-strong transition-colors"
                      >
                        {r.image && (
                          <div className="hidden sm:block relative w-28 h-20 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={urlFor(r.image).width(240).height(160).url()}
                              alt={r.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-content leading-snug group-hover:text-primary transition-colors">
                            {r.title}
                          </h3>
                          {r.excerpt && (
                            <p className="mt-1 text-sm text-content-muted line-clamp-2">
                              {r.excerpt}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
