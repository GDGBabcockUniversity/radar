export const revalidate = 60;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header, Footer } from "../components";
import { getContributors, urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";

export const metadata: Metadata = {
  title: "Contributors | RADAR",
  description:
    "Everyone who has written for RADAR — past and present. The permanent record of the people behind the work.",
};

interface Contributor {
  _id: string;
  name: string;
  slug?: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  role?: string;
  count: number;
}

function Avatar({
  name,
  image,
}: {
  name: string;
  image?: Contributor["image"];
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  if (image) {
    return (
      <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-overlay relative">
        <Image
          src={urlFor(image).width(128).height(128).fit("crop").url()}
          alt={image?.alt || name}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 bg-overlay relative">
      <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <span className="text-lg font-bold text-primary">{initials}</span>
      </div>
    </div>
  );
}

export default async function ContributorsPage() {
  const contributors: Contributor[] = await getContributors();

  return (
    <main className="min-h-screen bg-surface">
      <Header />

      <section className="py-20 px-4">
        <div className="container max-w-275 mx-auto">
          <div className="mb-12">
            <p className="text-content-muted text-[10px] font-bold uppercase tracking-[4px] mb-4">
              The Permanent Record
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-[-2px] mb-6">
              Contributors
            </h1>
            <p className="text-content-secondary text-base md:text-lg max-w-2xl">
              Everyone who has written for RADAR — past and present. Articles are
              everlasting, and so is the credit. The{" "}
              <Link href={PAGES.team} className="text-primary hover:underline">
                team page
              </Link>{" "}
              shows who&apos;s here now; this is everyone, ever.
            </p>
          </div>

          {contributors.length === 0 ? (
            <p className="text-content-muted">No contributors yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributors.map((person) => {
                const href = person.slug?.current
                  ? PAGES.author(person.slug.current)
                  : null;
                const card = (
                  <div className="flex items-center gap-4 bg-surface-raised border border-edge rounded-2xl p-5 h-full transition-colors hover:border-edge-strong">
                    <Avatar name={person.name} image={person.image} />
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-content truncate">
                        {person.name}
                      </h2>
                      {person.role && (
                        <p className="text-primary text-[10px] font-bold uppercase tracking-[1.4px] truncate">
                          {person.role}
                        </p>
                      )}
                      <p className="text-content-muted text-xs mt-1">
                        {person.count} {person.count === 1 ? "piece" : "pieces"}
                      </p>
                    </div>
                  </div>
                );

                return href ? (
                  <Link key={person._id} href={href} className="block">
                    {card}
                  </Link>
                ) : (
                  <div key={person._id}>{card}</div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
