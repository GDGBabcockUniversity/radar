"use client";

import { useEffect, useState } from "react";

interface ViewCounterProps {
  articleId: string;
  initialViews: number | null;
}

export default function ViewCounter({
  articleId,
  initialViews,
}: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(initialViews);

  useEffect(() => {
    let disposed = false;
    const load = () => {
      fetch(`/api/articles/${encodeURIComponent(articleId)}/views`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!disposed && typeof data?.views === "number")
            setViews(data.views);
        })
        .catch(() => {});
    };
    const refresh = (event: Event) => {
      if ((event as CustomEvent).detail === articleId) load();
    };
    window.addEventListener("article-engaged", refresh);
    return () => {
      disposed = true;
      window.removeEventListener("article-engaged", refresh);
    };
  }, [articleId]);

  if (views === null) return null;

  return (
    <span
      title="Views include historical views; new views require 10 active seconds and 25% article progress"
      className="text-content-muted text-sm flex items-center gap-1.5"
    >
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
