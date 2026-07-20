export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "@/app/components";
import {
  getAuthors,
  getStandaloneArticles,
  getTeamCohort,
  urlFor,
} from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES, CADENCE_TAGLINE } from "@/app/lib/constants";
import { SECTION_TITLES, type SectionValue } from "@/app/lib/sections";

interface Author {
  _id: string;
  name: string;
  slug?: { current: string };
  role?: string;
}

interface StandaloneArticle {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  section?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  authors?: { name: string; slug?: { current: string } }[];
}

export default async function AboutPage() {
  // Reflect the current team cohort (per-year roles); fall back to the legacy
  // author roster until any cohort exists.
  const [cohort, notes] = await Promise.all([
    getTeamCohort(),
    getStandaloneArticles() as Promise<StandaloneArticle[]>,
  ]);
  const authors: Author[] = (cohort?.members ??
    (await getAuthors())) as Author[];

  return (
    <>
      <Header />
      <main className="bg-surface min-h-screen text-content pt-20 pb-24">
        <div className="container max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About RADAR
          </h1>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-content-secondary">
            <p>
              RADAR is the publication of GDG Babcock — your signal to what&apos;s
              next in the Babcock tech ecosystem. We document the people,
              projects, and shifts shaping how students here build.
            </p>
            <p>
              We publish in two strands: <strong className="text-content">Issues</strong>,
              our editions gathering the spotlight, signals, and opportunities of
              the moment; and <strong className="text-content">Series</strong>,
              standalone strands like the Class of 2026 Spotlight that run on
              their own schedule between issues. {CADENCE_TAGLINE}
            </p>
          </div>

          {notes.length > 0 &&
            (() => {
              // The featured standalone piece (falling back to the oldest) is
              // the founding note — the masthead statement this publication was
              // started on. The query already sorts featured-first, so take the
              // lead as the anchor and list any later editors' notes beneath it.
              const [founding, ...rest] = notes;
              const sectionLabel =
                SECTION_TITLES[founding.section as SectionValue];
              const byline = founding.authors
                ?.map((a) => a.name)
                .filter(Boolean)
                .join(", ");
              const image = founding.coverImage?.asset
                ? urlFor(founding.coverImage).width(800).height(600).url()
                : null;

              return (
                <div className="mt-16">
                  <h2 className="text-xs font-bold uppercase tracking-[1.4px] text-content-subtle">
                    From the Editors
                  </h2>

                  <Link
                    href={PAGES.article(founding.slug.current)}
                    className={`group mt-6 grid grid-cols-1 gap-6 rounded-2xl border border-edge bg-surface-raised p-6 transition-colors hover:border-edge-strong md:p-8 ${
                      image ? "sm:grid-cols-[minmax(0,1fr)_2fr] sm:items-center" : ""
                    }`}
                  >
                    {image && (
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-edge bg-overlay">
                        <Image
                          src={image}
                          alt={founding.coverImage?.alt || founding.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}

                    <div>
                      {sectionLabel && (
                        <span className="text-xs font-bold uppercase tracking-[1.4px] text-primary">
                          {sectionLabel}
                        </span>
                      )}
                      <h3 className="mt-3 text-2xl font-bold tracking-tight text-content transition-colors group-hover:text-primary md:text-3xl">
                        {founding.title}
                      </h3>
                      {founding.excerpt && (
                        <p className="mt-3 text-content-secondary">
                          {founding.excerpt}
                        </p>
                      )}
                      {byline && (
                        <p className="mt-4 text-sm text-content-subtle">
                          By {byline}
                        </p>
                      )}
                      <span className="mt-5 inline-block text-sm font-bold uppercase tracking-wider text-primary transition-colors group-hover:text-primary-hover">
                        Read the note →
                      </span>
                    </div>
                  </Link>

                  {rest.length > 0 && (
                    <ul className="mt-8 divide-y divide-edge border-t border-edge">
                      {rest.map((n) => (
                        <li key={n._id} className="py-4">
                          <Link
                            href={PAGES.article(n.slug.current)}
                            className="font-semibold text-content hover:text-primary transition-colors"
                          >
                            {n.title}
                          </Link>
                          {n.excerpt && (
                            <p className="mt-1 text-sm text-content-muted">
                              {n.excerpt}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}

          <div className="mt-16">
            <h2 className="text-xs font-bold uppercase tracking-[1.4px] text-content-subtle">
              Masthead{cohort?.label ? ` · ${cohort.label}` : ""}
            </h2>
            {authors.length === 0 ? (
              <p className="mt-4 text-content-muted">Team coming soon.</p>
            ) : (
              <ul className="mt-6 divide-y divide-edge">
                {authors.map((a) => {
                  const href = a.slug?.current
                    ? PAGES.author(a.slug.current)
                    : null;
                  return (
                    <li
                      key={a._id}
                      className="flex items-center justify-between py-3"
                    >
                      {href ? (
                        <Link
                          href={href}
                          className="font-semibold text-content hover:text-primary transition-colors"
                        >
                          {a.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-content">
                          {a.name}
                        </span>
                      )}
                      {a.role && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-content-subtle">
                          {a.role}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href={PAGES.team}
              className="mt-8 inline-block text-sm font-bold uppercase tracking-wider text-primary hover:text-primary-hover transition-colors"
            >
              Meet the full team →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function generateMetadata() {
  return buildOgMetadata({
    title: "About",
    description:
      "RADAR is the publication of GDG Babcock — your signal to what's next in the Babcock tech ecosystem.",
    path: PAGES.about,
    type: "website",
  });
}
