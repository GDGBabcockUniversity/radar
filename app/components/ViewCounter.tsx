"use client";

import { useEffect, useState } from "react";

const VIEW_DELAY_MS = 7000; // 7 seconds before recording a view

interface ViewCounterProps {
  slug: string;
}

export default function ViewCounter({ slug }: ViewCounterProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // UPDATE THE URLs IN THE FETCH CALLS TO BE GOTTEN FROM THE CONSTANTS FILE

    // Fetch current count on mount
    fetch(`/api/views/${slug}`)
      .then((res) => res.json())
      .then((data) => setViews(data.views))
      .catch(() => {}); // silently fail — view count is non-critical

    // Record a view after the delay
    const timer = setTimeout(() => {
      fetch(`/api/views/${slug}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => setViews(data.views))
        .catch(() => {});
    }, VIEW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [slug]);

  if (views === null) return null;

  return (
    <span className="text-gray-400 text-sm flex items-center gap-1.5 mt-8">
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
