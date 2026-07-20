import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";
import { SECTION_TITLES, type SectionValue } from "../lib/sections";
import { Byline } from "../components";
import type { BylineAuthor } from "../components/Byline";

interface FoundingNote {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
  section?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coverImage?: any;
  authors?: BylineAuthor[];
}

interface FoundingNoteSectionProps {
  note?: FoundingNote | null;
}

// Homepage "From the Editors" block — the featured standalone founding note.
// Evergreen and issue-independent, unlike the Spotlight, so it leads the page
// right below the hero. Pairs a modest cover thumbnail with the note itself.
export default function FoundingNoteSection({ note }: FoundingNoteSectionProps) {
  if (!note) return null;

  const href = PAGES.article(note.slug.current);
  const sectionLabel = SECTION_TITLES[note.section as SectionValue];
  const image = note.coverImage?.asset
    ? urlFor(note.coverImage).width(800).height(600).url()
    : null;

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mb-8 flex items-center gap-4">
          <h2 className="shrink-0 text-xs font-bold uppercase tracking-[2px] text-primary">
            From the Editors
          </h2>
          <span className="h-px flex-1 bg-overlay-strong" />
        </div>

        <Link
          href={href}
          className={`group grid grid-cols-1 gap-6 rounded-2xl border border-edge bg-surface-raised p-6 transition-colors hover:border-edge-strong md:gap-8 md:p-8 ${
            image ? "md:grid-cols-[minmax(0,1fr)_2fr] md:items-center" : ""
          }`}
        >
          {image && (
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-edge bg-overlay">
              <Image
                src={image}
                alt={note.coverImage?.alt || note.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          )}

          <div>
            {sectionLabel && (
              <span className="text-xs font-bold uppercase tracking-[1.4px] text-content-subtle">
                {sectionLabel}
              </span>
            )}
            <h3 className="mt-3 max-w-3xl text-3xl md:text-4xl font-bold leading-tight tracking-tight text-content transition-colors group-hover:text-primary">
              {note.title}
            </h3>
            {note.excerpt && (
              <p
                className="mt-4 max-w-2xl text-content-secondary"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                }}
              >
                {note.excerpt}
              </p>
            )}
            <Byline
              authors={note.authors}
              publishedAt={note.publishedAt}
              showAvatars={false}
              className="mt-6"
            />
            <span className="mt-6 inline-block text-sm font-bold uppercase tracking-wider text-primary transition-colors group-hover:text-primary-hover">
              Read the note →
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
