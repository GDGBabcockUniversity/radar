"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTweet: (
          id: string,
          el: HTMLElement,
          options?: Record<string, unknown>,
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

let scriptLoaded = false;

function loadTwitterScript(): Promise<void> {
  if (scriptLoaded && window.twttr) return Promise.resolve();

  return new Promise((resolve) => {
    if (document.getElementById("twitter-wjs")) {
      scriptLoaded = true;
      // Script tag exists but might still be loading
      const check = () => {
        if (window.twttr) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
      return;
    }

    const script = document.createElement("script");
    script.id = "twitter-wjs";
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}

interface TweetEmbedProps {
  tweetId: string;
}

export default function TweetEmbed({ tweetId }: TweetEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);

  useEffect(() => {
    if (rendered.current || !containerRef.current) return;
    rendered.current = true;

    loadTwitterScript().then(() => {
      if (!containerRef.current || !window.twttr) return;
      // Clear any existing content
      containerRef.current.innerHTML = "";
      window.twttr.widgets.createTweet(tweetId, containerRef.current, {
        theme: "dark",
        align: "center",
        dnt: true,
        conversation: "none",
      });
    });
  }, [tweetId]);

  return (
    <div className="my-6 w-full">
      <style>{`
        .tweet-container twitter-widget,
        .tweet-container .twitter-tweet-rendered {
          width: 100% !important;
          max-width: 100% !important;
        }
        .tweet-container twitter-widget iframe {
          width: 100% !important;
        }
      `}</style>
      <div ref={containerRef} className="tweet-container">
        {/* Skeleton placeholder while loading */}
        <div className="animate-pulse rounded-xl border border-edge bg-overlay p-4 w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-overlay-strong" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded bg-overlay-strong" />
              <div className="h-2.5 w-16 rounded bg-overlay-strong" />
            </div>
            <svg
              className="w-5 h-5 text-content/20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-overlay-strong" />
            <div className="h-3 w-4/5 rounded bg-overlay-strong" />
            <div className="h-3 w-3/5 rounded bg-overlay-strong" />
          </div>
        </div>
      </div>
    </div>
  );
}
