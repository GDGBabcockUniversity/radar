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
    h2: ({ children }) => (
      <h2
        className="text-xl md:text-2xl font-bold text-white mt-10 mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="text-lg md:text-xl font-semibold text-white mt-8 mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="text-base md:text-lg font-semibold text-white mt-6 mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p
        className="text-gray-300 text-base leading-relaxed mb-5"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-4 border-primary pl-5 my-6 italic text-gray-400"
        style={{ fontFamily: "var(--font-serif)" }}
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
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image
              src={urlFor(value).width(1200).height(675).url()}
              alt={value.alt || "Article image"}
              fill
              className="object-cover"
            />
          </div>
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
  },
};

export default function PostBody({ body }: PostBodyProps) {
  return (
    <article className="max-w-4xl py-8">
      <PortableText value={body} components={components} />
    </article>
  );
}
