import Link from "next/link";
import Image from "next/image";
import { urlFor } from "../lib/sanity";
import { PAGES } from "../lib/constants";

export interface BylineAuthor {
  _id?: string;
  name: string;
  slug?: { current: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image?: any;
  role?: string;
}

interface BylineProps {
  authors?: BylineAuthor[];
  publishedAt?: string;
  readingTime?: number;
  showAvatars?: boolean;
  className?: string;
}

function formatDate(date?: string): string | null {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Full byline: links EVERY author to their profile (/team/[slug]).
// Authorship is whole-article level only (brief §7).
export default function Byline({
  authors = [],
  publishedAt,
  readingTime,
  showAvatars = true,
  className = "",
}: BylineProps) {
  const valid = authors.filter(Boolean);
  const date = formatDate(publishedAt);

  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${className}`}>
      {showAvatars && valid.some((a) => a.image) && (
        <div className="flex -space-x-2">
          {valid.map((a) =>
            a.image ? (
              <Image
                key={a._id ?? a.name}
                src={urlFor(a.image).width(64).height(64).fit("crop").url()}
                alt={a.image?.alt || a.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full border-2 border-black object-cover"
              />
            ) : null,
          )}
        </div>
      )}

      {valid.length > 0 && (
        <p className="text-sm text-content-secondary">
          <span className="text-content-subtle">By </span>
          {valid.map((a, i) => {
            const sep =
              i === 0 ? "" : i === valid.length - 1 ? " and " : ", ";
            const node = a.slug?.current ? (
              <Link
                href={PAGES.author(a.slug.current)}
                className="font-semibold text-content hover:text-primary transition-colors"
              >
                {a.name}
              </Link>
            ) : (
              <span className="font-semibold text-content">{a.name}</span>
            );
            return (
              <span key={a._id ?? a.name}>
                {sep}
                {node}
              </span>
            );
          })}
        </p>
      )}

      {(date || readingTime) && (
        <span className="flex items-center gap-3 text-xs text-content-subtle">
          {date && <span>{date}</span>}
          {readingTime ? (
            <span>
              {date ? "· " : ""}
              {readingTime} min read
            </span>
          ) : null}
        </span>
      )}
    </div>
  );
}
