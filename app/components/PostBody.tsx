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
        className="text-2xl md:text-3xl font-bold text-white mt-12 mb-4"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className="text-xl md:text-2xl font-semibold text-white mt-10 mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className="text-lg md:text-xl font-semibold text-white mt-8 mb-3"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {children}
      </h4>
    ),
    normal: ({ children }) => (
      <p
        className="text-gray-300 text-lg leading-relaxed mb-6"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className="border-l-4 border-primary pl-6 my-8 italic text-gray-400 text-lg"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside text-gray-300 text-lg mb-6 space-y-2 ml-4">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside text-gray-300 text-lg mb-6 space-y-2 ml-4">
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
        <figure className="my-8">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <Image
              src={urlFor(value).width(1200).height(675).url()}
              alt={value.alt || "Article image"}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption
              className="text-center text-gray-500 text-sm mt-3"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    code: ({ value }) => (
      <pre className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 overflow-x-auto my-8">
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
    <article className="max-w-3xl mx-auto py-10">
      <PortableText value={body} components={components} />
    </article>
  );
}
