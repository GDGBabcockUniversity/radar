import Link from "next/link";
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
  authors?: BylineAuthor[];
}

interface FoundingNoteSectionProps {
  note?: FoundingNote | null;
}

// Homepage "From the Editors" block — the featured standalone founding note.
// Evergreen and issue-independent, unlike the Spotlight above (which is tied to
// the latest issue). Text-led rather than image-led, since a masthead note is
// about the words, not a cover.
export default function FoundingNoteSection({ note }: FoundingNoteSectionProps) {
  if (!note) return null;

  const href = PAGES.article(note.slug.current);
  const sectionLabel = SECTION_TITLES[note.section as SectionValue];

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
          className="group block rounded-2xl border border-edge bg-surface-raised p-8 transition-colors hover:border-edge-strong md:p-12"
        >
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
        </Link>
      </div>
    </section>
  );
}
