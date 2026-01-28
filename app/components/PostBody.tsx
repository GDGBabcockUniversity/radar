import { PortableText, PortableTextComponents } from "@portabletext/react";
import Image from "next/image";
import { urlFor } from "../lib/sanity";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortableTextBlock = any;

interface PostBodyProps {
  body: PortableTextBlock[];
}

const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1
        className="font-bold text-white mt-12 mb-4"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          lineHeight: 1.2,
        }}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className="font-bold text-white mt-10 mb-3"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          lineHeight: 1.3,
        }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="font-semibold text-white mt-8 mb-3"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
          lineHeight: 1.3,
        }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="font-semibold text-white mt-6 mb-2"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.125rem, 2vw, 1.25rem)",
          lineHeight: 1.4,
        }}
      >
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5
        className="font-semibold text-white mt-5 mb-2"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.125rem",
          lineHeight: 1.4,
        }}
      >
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6
        className="font-semibold text-gray-300 mt-4 mb-2 uppercase tracking-wide"
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "0.875rem",
          lineHeight: 1.5,
        }}
      >
        {children}
      </h6>
    ),
    normal: ({ children }) => (
      <p
        className="text-gray-300 leading-relaxed mb-5"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          lineHeight: 1.75,
        }}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-4 border-primary pl-5 my-6 italic text-gray-400"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.125rem",
          lineHeight: 1.6,
        }}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside text-gray-300 mb-5 space-y-1.5 ml-2">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-300 mb-5 space-y-1.5 ml-2">
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
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-white/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary-hover underline transition-colors"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-6 w-[60%] mx-auto">
          <Image
            src={urlFor(value).width(1200).url()}
            alt={value.alt || "Article image"}
            width={0}
            height={0}
            sizes="100%"
            className="w-full h-auto rounded-lg"
          />
          {value.caption && (
            <figcaption
              className="text-gray-500 text-sm mt-2 text-center"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre className="bg-[#1a1a1a] border border-white/10 rounded-lg p-4 overflow-x-auto my-6">
        <code
          className="text-sm text-gray-300 font-mono"
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
          <hr className="my-10 border-0 border-t-2 border-dotted border-white/20" />
        );
      }

      if (style === "spaced") {
        return (
          <div className="my-10 flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
            <span className="w-2 h-2 rounded-full bg-white/30" />
          </div>
        );
      }

      // Default: simple line
      return <hr className="my-10 border-0 border-t border-white/20" />;
    },
  },
};

export default function PostBody({ body }: PostBodyProps) {
  return (
    <article className="max-w-4xl py-8">
      <PortableText value={body} components={components} />
    </article>
  );
}
