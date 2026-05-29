"use client";

import { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PortableTextBlock = any;

interface TocItem {
  id: string;
  text: string;
}

// Reuse the same slugify logic from PostBody
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/** Extract h2 headings from a Portable Text body array. */
export function extractHeadings(body: PortableTextBlock[]): TocItem[] {
  if (!body) return [];

  return body
    .filter(
      (block: PortableTextBlock) =>
        block._type === "block" && block.style === "h2",
    )
    .map((block: PortableTextBlock) => {
      const text = (block.children || [])
        .filter((child: PortableTextBlock) => child._type === "span")
        .map((child: PortableTextBlock) => child.text || "")
        .join("");
      return {
        id: slugify(text),
        text,
      };
    })
    .filter((item: TocItem) => item.text.trim() !== "");
}

interface TableOfContentsProps {
  body: PortableTextBlock[];
}

export default function TableOfContents({ body }: TableOfContentsProps) {
  const headings = extractHeadings(body);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="toc-container" aria-label="Table of contents">
      <div className="toc-header">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M2 4h12M2 8h8M2 12h10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>In this article</span>
      </div>
      <ol className="toc-list">
        {headings.map(({ id, text }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(id);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                  // Update URL without scrolling
                  history.pushState(null, "", `#${id}`);
                  setActiveId(id);
                }
              }}
              className={`toc-link${activeId === id ? " toc-link--active" : ""}`}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
