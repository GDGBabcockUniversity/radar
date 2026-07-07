"use client";

import { useEffect } from "react";
import { track } from "../lib/track";

// Measures *active* time on an article (only while the tab is visible) and emits
// a single `article.read` event when the reader leaves. Renders nothing.
export default function ReadingTracker({ slug }: { slug: string }) {
  useEffect(() => {
    let activeMs = 0;
    let lastStart = document.visibilityState === "visible" ? Date.now() : 0;
    let sent = false;

    const accumulate = () => {
      if (lastStart) {
        activeMs += Date.now() - lastStart;
        lastStart = 0;
      }
    };

    const flush = () => {
      accumulate();
      const seconds = Math.round(activeMs / 1000);
      if (sent || seconds < 5) return;
      sent = true;
      track("article.read", { slug, seconds });
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastStart = Date.now();
      } else {
        flush();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [slug]);

  return null;
}
