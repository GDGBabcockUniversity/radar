"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  slug: string;
}

export default function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/views/${encodeURIComponent(slug)}`)
      .then((res) => res.json())
      .then((data) => setViews(data.views))
      .catch(() => {}); // silently fail — view count is non-critical
  }, [slug]);

  if (views === null) return null;

  return (
    <span className="text-content-muted text-sm flex items-center gap-1.5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-70"
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views} {views === 1 ? "view" : "views"}
    </span>
  );
}
