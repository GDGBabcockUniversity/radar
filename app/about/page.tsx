export const revalidate = 60;

import Link from "next/link";
import { Header, Footer } from "@/app/components";
import { getAuthors } from "@/app/lib/sanity";
import { buildOgMetadata } from "@/app/lib/metadata";
import { PAGES, CADENCE_TAGLINE } from "@/app/lib/constants";

interface Author {
  _id: string;
  name: string;
  slug?: { current: string };
  role?: string;
}

export default async function AboutPage() {
  const authors: Author[] = await getAuthors();

  return (
    <>
      <Header />
      <main className="bg-black min-h-screen text-white pt-20 pb-24">
        <div className="container max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            About RADAR
          </h1>

          <div className="mt-8 space-y-6 text-lg leading-relaxed text-gray-300">
            <p>
              RADAR is the publication of GDG Babcock — your signal to what&apos;s
              next in the Babcock tech ecosystem. We document the people,
              projects, and shifts shaping how students here build.
            </p>
            <p>
              We publish in two strands: <strong className="text-white">Issues</strong>,
              our editions gathering the spotlight, signals, and opportunities of
              the moment; and <strong className="text-white">Series</strong>,
              standalone strands like the Class of 2026 Spotlight that run on
              their own schedule between issues. {CADENCE_TAGLINE}
            </p>
          </div>

          <div className="mt-16">
            <h2 className="text-xs font-bold uppercase tracking-[1.4px] text-gray-500">
              Masthead
            </h2>
            {authors.length === 0 ? (
              <p className="mt-4 text-gray-400">Team coming soon.</p>
            ) : (
              <ul className="mt-6 divide-y divide-white/10">
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
                          className="font-semibold text-white hover:text-primary transition-colors"
                        >
                          {a.name}
                        </Link>
                      ) : (
                        <span className="font-semibold text-white">
                          {a.name}
                        </span>
                      )}
                      {a.role && (
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
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
