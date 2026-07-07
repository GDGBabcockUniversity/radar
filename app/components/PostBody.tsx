import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "../lib/sanity";
import CrosswordPuzzle from "./CrosswordPuzzle";
import PersonalityQuiz from "./PersonalityQuiz";
import TweetEmbed from "./TweetEmbed";
import { getRandomElement } from "../lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortableTextBlock = any;

interface PostBodyProps {
  body: PortableTextBlock[];
}

// Helper to create URL-friendly slugs from heading text
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove non-word chars
    .replace(/--+/g, "-"); // Replace multiple - with single -
}

// Extract text content from React children
function getTextContent(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) {
    return children.map(getTextContent).join("");
  }
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    (children as { props?: { children?: React.ReactNode } }).props?.children
  ) {
    return getTextContent(
      (children as { props: { children: React.ReactNode } }).props.children,
    );
  }
  return "";
}

/** Returns the YouTube video id for watch, embed, shorts, and youtu.be URLs. */
function getYouTubeVideoId(href: string | undefined): string | null {
  if (!href?.trim()) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id || null;
  }
  if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/")[2] || null;
    }
    if (url.pathname.startsWith("/shorts/")) {
      return url.pathname.split("/")[2] || null;
    }
    if (url.pathname === "/watch" || url.pathname.startsWith("/watch")) {
      return url.searchParams.get("v");
    }
  }
  return null;
}

/** Supported Spotify content types for embedding. */
const SPOTIFY_TYPES = new Set(["track", "album", "playlist", "episode", "show"]);

function getSpotifyEmbedUrl(href: string | undefined): string | null {
  if (!href?.trim()) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host !== "open.spotify.com") return null;

  // Filter out locale prefixes like "intl-es", "intl-pt", etc.
  const parts = url.pathname
    .split("/")
    .filter(Boolean)
    .filter((p) => !p.startsWith("intl-"));

  if (parts.length < 2) return null;

  // Already an embed URL: /embed/track/ID
  if (parts[0] === "embed" && parts.length >= 3 && SPOTIFY_TYPES.has(parts[1])) {
    const type = parts[1];
    const id = parts[2].split("?")[0];
    if (!id) return null;
    return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
  }

  // Regular URL: /track/ID
  const type = parts[0];
  const id = parts[1].split("?")[0];

  if (!SPOTIFY_TYPES.has(type) || !id) return null;

  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}

function getTweetId(href: string | undefined): string | null {
  if (!href?.trim()) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (host === "twitter.com" || host === "x.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 3 && parts[1] === "status") {
      const id = parts[2].split("?")[0];
      if (/^\d+$/.test(id)) {
        return id;
      }
    }
  }
  return null;
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1
        className="font-bold text-content mt-12 mb-4"
        style={{
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          lineHeight: 1.2,
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => {
      const text = getTextContent(children);
      const id = slugify(text);
      return (
        <h2
          id={id}
          className="font-bold text-content mt-10 mb-3 group relative"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 2rem)",
            lineHeight: 1.3,
          }}
        >
          <a
            href={`#${id}`}
            className="absolute -left-6 opacity-0 group-hover:opacity-100 transition-opacity text-content-subtle hover:text-primary"
            aria-label={`Link to ${text}`}
          >
            #
          </a>
          {children}
        </h2>
      );
    },
    h3: ({ children }) => (
      <h3
        className="font-semibold text-content mt-8 mb-3"
        style={{
          fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
          lineHeight: 1.3,
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="font-semibold text-content mt-6 mb-2"
        style={{
          fontSize: "clamp(1.125rem, 2vw, 1.25rem)",
          lineHeight: 1.4,
        }}
      >
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5
        className="font-semibold text-content mt-5 mb-2"
        style={{
          fontSize: "1.125rem",
          lineHeight: 1.4,
        }}
      >
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6
        className="font-semibold text-content-secondary mt-4 mb-2 uppercase tracking-wide"
        style={{
          fontSize: "0.875rem",
          lineHeight: 1.5,
        }}
      >
        {children}
      </h6>
    ),
    normal: ({ children }) => (
      <div
        className="text-content-secondary mb-6"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.1875rem",
          lineHeight: 1.8,
        }}
      >
        {children}
      </div>
    ),
    blockquote: ({ children }) => {
      const borderColor = getRandomElement([
        "#4285f4", // Blue
        "#34a853", // Green
        "#ea4335", // Red
        "#f9ab00", // Yellow
      ]);

      return (
        <blockquote
          className="border-l-4 pl-5 my-8 italic text-content-secondary"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.3125rem",
            lineHeight: 1.6,
            borderColor,
          }}
        >
          {children}
        </blockquote>
      );
    },
  },
  list: {
    bullet: ({ children }) => (
      <ul
        className="list-disc list-outside text-content-secondary mb-6 space-y-2 pl-6"
        style={{ fontFamily: "var(--font-serif)", fontSize: "1.1875rem", lineHeight: 1.8 }}
      >
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol
        className="list-decimal list-outside text-content-secondary mb-6 space-y-2 pl-6"
        style={{ fontFamily: "var(--font-serif)", fontSize: "1.1875rem", lineHeight: 1.8 }}
      >
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-semibold text-content">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-overlay-strong text-primary px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => {
      const href = value?.href as string | undefined;
      const videoId = getYouTubeVideoId(href);
      if (videoId) {
        const title = getTextContent(children) || "YouTube video";
        return (
          <div className="my-6 w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      }

      const spotifyEmbedUrl = getSpotifyEmbedUrl(href);
      if (spotifyEmbedUrl) {
        return (
          <div className="my-6 w-full max-w-4xl mx-auto overflow-hidden rounded-xl">
            <iframe
              style={{ borderRadius: "12px" }}
              src={spotifyEmbedUrl}
              width="100%"
              height="352"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify embed"
            />
          </div>
        );
      }

      const tweetId = getTweetId(href);
      if (tweetId) {
        return <TweetEmbed tweetId={tweetId} />;
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-hover underline transition-colors"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-6 w-full md:w-[75%] mx-auto">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || "Article image"}
            width={0}
            height={0}
            sizes="100%"
            className="w-full h-auto rounded-lg"
          />
          {value.caption && (
            <figcaption className="text-content-subtle text-sm mt-2 text-center">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre className="bg-surface-card border border-edge rounded-lg p-4 overflow-x-auto my-6">
        <code
          className="text-sm text-content-secondary font-mono"
          data-language={value.language}
        >
          {value.code}
        </code>
      </pre>
    ),
    divider: ({ value }) => {
      const style = value?.style || "line";

      if (style === "dotted") {
        return (
          <hr className="my-10 border-0 border-t-2 border-dotted border-edge-strong" />
        );
      }

      if (style === "spaced") {
        return (
          <div className="my-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-content/30" />
            <span className="w-2 h-2 rounded-full bg-content/30" />
            <span className="w-2 h-2 rounded-full bg-content/30" />
          </div>
        );
      }

      // Default: simple line
      return <hr className="my-10 border-0 border-t border-edge-strong" />;
    },
    crossword: ({ value }) => {
      if (!value?.puzzleId) {
        return (
          <div className="my-8 p-8 bg-surface-card border border-edge rounded-xl text-center">
            <span className="text-4xl mb-4 block">🧩</span>
            <p className="text-content-muted text-sm">Puzzle ID not configured</p>
          </div>
        );
      }
      return <CrosswordPuzzle puzzleId={value.puzzleId} />;
    },
    quiz: ({ value }) => {
      if (!value?.quizId) {
        return (
          <div className="my-8 p-8 bg-surface-card border border-edge rounded-xl text-center">
            <span className="text-4xl mb-4 block">💝</span>
            <p className="text-content-muted text-sm">Quiz ID not configured</p>
          </div>
        );
      }
      return <PersonalityQuiz quizId={value.quizId} />;
    },
  },
};

export default function PostBody({ body }: PostBodyProps) {
  return (
    <article className="py-8 max-w-[68ch]">
      <PortableText value={body} components={components} />
    </article>
  );
}
