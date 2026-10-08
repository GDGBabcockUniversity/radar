"use client";

import { useEffect, useState } from "react";

interface SignalCountProps {
  slug: string;
}

export default function SignalCount({ slug }: SignalCountProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/signals/${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, [slug]);

  if (count === null || count === 0) return null;

  return (
    <>
      {/* Dot separator */}
      <span className="text-content-subtle text-sm select-none">·</span>

      <a
        href="#signals"
        className="text-content-muted text-sm flex items-center gap-1.5 hover:text-primary transition-colors"
        title={`${count} ${count === 1 ? "comment" : "comments"}`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {count} {count === 1 ? "comment" : "comments"}
      </a>
    </>
  );
}
